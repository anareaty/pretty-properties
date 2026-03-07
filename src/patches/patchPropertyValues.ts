import PrettyPropertiesPlugin from "../main";
import { MarkdownRenderer, MarkdownView, TFile } from "obsidian";
import { getNestedProperty } from "../utils/propertyUtils";

type SupportedPropertyInputType = "text" | "number" | "date" | "datetime";

const INPUT_SELECTORS: Record<SupportedPropertyInputType, string> = {
	text: ".metadata-input-longtext",
	number: ".metadata-input-number",
	date: ".metadata-input.metadata-input-text.mod-date",
	datetime: ".metadata-input.metadata-input-text.mod-datetime",
};

const FORMATTED_WRAPPER_CLASS = "pp-formatted-value-wrapper";
const FORMATTED_OVERLAY_CLASS = "pp-formatted-value-overlay";
const HIDDEN_INPUT_CLASS = "pp-formatted-value-hidden";

const BOUND_DATASET_KEY = "ppFormattedValueBound";
const LAST_RENDERED_DATASET_KEY = "ppLastRendered";
const BOUND_CONTAINER_KEY = "ppFormattedContainerBound";
const SYNC_BOUND_DATASET_KEY = "ppFormattedValueSyncBound";
const LAST_TEMPLATE_DATASET_KEY = "ppLastTemplate";

const refreshByInput = new WeakMap<HTMLElement, () => void>();
const widgetMutationObserverByContainer = new WeakMap<HTMLElement, MutationObserver>();
const lastObservedWidgetValueByContainer = new WeakMap<HTMLElement, string | null>();
const pendingReapplyByContainer = new WeakMap<HTMLElement, number>();

const LIVE_REFRESH_BOUND_DATASET_KEY = "ppFormattedLiveRefreshBound";
const pendingLiveRefreshByContainer = new WeakMap<HTMLElement, number>();
const LIVE_VALUE_MARKER = '<span data-pp-live-property-value></span>';

export function updateAllPropertyFormats(plugin: PrettyPropertiesPlugin): void {
	requestAnimationFrame(() => {
		const markdownLeaves = plugin.app.workspace.getLeavesOfType("markdown");

		for (const leaf of markdownLeaves) {
			const view = leaf.view;
			if (!(view instanceof MarkdownView))
				continue;

			const sourcePath = view.file?.path ?? "";
			if (!sourcePath)
				continue;

			const metadataContainer = view.contentEl.querySelector<HTMLElement>(".metadata-container");
			if (!metadataContainer)
				continue;

			const propertyRows = metadataContainer.querySelectorAll<HTMLElement>(".metadata-property");

			for (const rowElement of Array.from(propertyRows)) {
				const propertyName = readPropertyName(rowElement);
				if (!propertyName)
					continue;

				const propertyInputType = detectPropertyInputType(rowElement);
				if (!propertyInputType)
					continue;

				const valueContainer = findPropertyValueContainer(rowElement);
				applyPropertyFormatting(
					valueContainer,
					propertyName,
					plugin,
					propertyInputType,
					sourcePath
				);
			}
		}
	});
}

export function applyPropertyFormatting(
	containerElement: HTMLElement,
	propertyName: string,
	plugin: PrettyPropertiesPlugin,
	propertyInputType: string,
	sourcePath: string,
	rawValue?: unknown
): void {
	if (!isSupportedPropertyInputType(propertyInputType))
		return;

	const inputElement = findInputElement(containerElement, propertyInputType);
	if (!inputElement)
		return;

	const propertyFormat = plugin.settings.propertyFormats.find(
		(candidate) => candidate.property.toLowerCase() === propertyName.toLowerCase()
	)?.format;

	if (!propertyFormat?.trim()) {
		resetPropertyFormatting(containerElement, inputElement);
		return;
	}

	containerElement.classList.add(FORMATTED_WRAPPER_CLASS);

	const overlayElement = ensureOverlayElement(containerElement);
	const renderMarkdown = createMarkdownRenderer(plugin, overlayElement, sourcePath);

	bindContainerReapplyOnce(containerElement, propertyName, plugin, propertyInputType, sourcePath);
	bindNativeInputSyncOnce(containerElement, inputElement, propertyName, plugin, propertyInputType, sourcePath);
	bindLiveOverlayRefreshOnce(containerElement, inputElement, propertyInputType);

	const supportsLiveToken = hasLivePropertyValueToken(propertyFormat);

	const refresh = () => {
		syncOverlayTextStyleFromInput(inputElement, overlayElement);

		const active = document.activeElement as HTMLElement | null;
		const isEditingNative =
			active === inputElement ||
			(active != null && inputElement.contains(active));

		setEditingState(inputElement, overlayElement, isEditingNative);
		if (isEditingNative)
			return;

		const liveValue =
			readWidgetValue(containerElement, propertyInputType) ??
			readInputText(inputElement) ??
			rawValue;

		const liveText = String(liveValue ?? "");

		const templateMarkdown = supportsLiveToken
			? String(propertyFormat).replaceAll("{{propertyValue}}", LIVE_VALUE_MARKER)
			: computeFormattedValue(plugin, propertyName, propertyFormat, liveValue);

		const lastTemplate = overlayElement.dataset[LAST_TEMPLATE_DATASET_KEY];
		const templateChanged = lastTemplate !== templateMarkdown;

		if (!templateChanged && supportsLiveToken && overlayElement.hasChildNodes()) {
			const patched = updateLivePropertyValueText(overlayElement, liveText);
			if (patched)
				return;
		}

		void renderMarkdown(templateMarkdown).then(() => {
			overlayElement.dataset[LAST_TEMPLATE_DATASET_KEY] = templateMarkdown;
			if (supportsLiveToken)
				updateLivePropertyValueText(overlayElement, liveText);
		});
	};

	refreshByInput.set(inputElement, refresh);
	bindRefreshOnce(inputElement);
	requestAnimationFrame(refresh);
}

function hasLivePropertyValueToken(propertyFormat: unknown): propertyFormat is string {
	return typeof propertyFormat === "string" && propertyFormat.includes("{{propertyValue}}");
}

function updateLivePropertyValueText(
	overlayElement: HTMLElement,
	value: string
): boolean {
	const markers = overlayElement.querySelectorAll<HTMLElement>("[data-pp-live-property-value]");
	if (!markers.length)
		return false;

	for (const marker of markers)
		marker.textContent = value;
	return true;
}

function bindContainerReapplyOnce(
	containerElement: HTMLElement,
	propertyName: string,
	plugin: PrettyPropertiesPlugin,
	propertyInputType: SupportedPropertyInputType,
	sourcePath: string
): void {
	const dataset = containerElement.dataset as Record<string, string | undefined>;
	if (dataset[BOUND_CONTAINER_KEY])
		return;

	dataset[BOUND_CONTAINER_KEY] = "1";

	containerElement.addEventListener("focusout", () => {
		if (pendingReapplyByContainer.has(containerElement))
			return;

		pendingReapplyByContainer.set(containerElement, 1);

		queueMicrotask(() => {
			pendingReapplyByContainer.delete(containerElement);
			applyPropertyFormatting(containerElement, propertyName, plugin, propertyInputType, sourcePath);
		});
	});
}

function bindLiveOverlayRefreshOnce(
	containerElement: HTMLElement,
	inputElement: HTMLElement,
	propertyInputType?: SupportedPropertyInputType
): void {
	const dataset = containerElement.dataset as Record<string, string | undefined>;
	if (dataset[LIVE_REFRESH_BOUND_DATASET_KEY])
		return;

	dataset[LIVE_REFRESH_BOUND_DATASET_KEY] = "1";

	const scheduleRefresh = () => {
		if (pendingLiveRefreshByContainer.has(containerElement))
			return;
		pendingLiveRefreshByContainer.set(containerElement, 1);

		requestAnimationFrame(() => {
			pendingLiveRefreshByContainer.delete(containerElement);
			refreshByInput.get(inputElement)?.();
		});
	};

	// Native controls
	containerElement.addEventListener("input", scheduleRefresh, true);
	containerElement.addEventListener("change", scheduleRefresh, true);

	// Custom controls that mutate DOM instead of firing input/change
	if (propertyInputType) {
		const observer = new MutationObserver(() => {
			const nextValue = readWidgetValue(containerElement, propertyInputType);
			const previousValue = lastObservedWidgetValueByContainer.get(containerElement) ?? null;

			if (nextValue === previousValue)
				return;
			lastObservedWidgetValueByContainer.set(containerElement, nextValue);
			scheduleRefresh();
		});

		observer.observe(containerElement, {
			subtree: true,
			childList: true,
			characterData: true,
			attributes: true,
			attributeFilter: [
				"data-internal-value",
				"aria-selected",
				"class",
				"value"
			],
		});

		widgetMutationObserverByContainer.set(containerElement, observer);
		lastObservedWidgetValueByContainer.set(
			containerElement,
			readWidgetValue(containerElement, propertyInputType)
		);
	}
}

function bindNativeInputSyncOnce(
	containerElement: HTMLElement,
	inputElement: HTMLElement,
	propertyName: string,
	plugin: PrettyPropertiesPlugin,
	propertyInputType: SupportedPropertyInputType,
	sourcePath: string
): void {
	const dataset = containerElement.dataset as Record<string, string | undefined>;
	if (dataset[SYNC_BOUND_DATASET_KEY])
		return;
	dataset[SYNC_BOUND_DATASET_KEY] = "1";

	const sync = () => {
		const nextValue = getSyncedNativeValue(
			containerElement,
			plugin,
			sourcePath,
			propertyName,
			propertyInputType
		);

		if (nextValue != null)
			writeNativeValue(inputElement, nextValue, propertyInputType);
	};

	containerElement.addEventListener("mousedown", sync, true);
	containerElement.addEventListener("pointerdown", sync, true);
	containerElement.addEventListener("focusin", sync, true);
}

function getSyncedNativeValue(
	containerElement: HTMLElement,
	plugin: PrettyPropertiesPlugin,
	sourcePath: string,
	propertyName: string,
	propertyInputType: SupportedPropertyInputType
): string | null {
	const widgetValue = readWidgetValue(containerElement, propertyInputType);
	const frontmatterValue = readFrontmatterValue(plugin, sourcePath, propertyName, propertyInputType);

	return propertyInputType === "text"
		? (widgetValue ?? frontmatterValue)
		: (frontmatterValue ?? widgetValue);
}

function readFrontmatterValue(
	plugin: PrettyPropertiesPlugin,
	sourcePath: string,
	propertyName: string,
	propertyInputType: SupportedPropertyInputType
): string | null {
	const file = plugin.app.vault.getAbstractFileByPath(sourcePath);
	if (!(file instanceof TFile))
		return null;

	const frontmatter = plugin.app.metadataCache.getFileCache(file)?.frontmatter;
	return getNestedProperty(frontmatter, propertyName);
}

function readWidgetValue(
	containerElement: HTMLElement,
	propertyInputType: SupportedPropertyInputType
): string | null {
	const overlay = containerElement.querySelector<HTMLElement>(`.${FORMATTED_OVERLAY_CLASS}`);
	if (!overlay)
		return null;

	// Live native-ish controls first
	const rangeInput = overlay.querySelector<HTMLInputElement>('input[type="range"]');
	if (rangeInput)
		return rangeInput.value;

	const select = overlay.querySelector<HTMLSelectElement>("select");
	if (select)
		return select.value;

	const textInput = overlay.querySelector<HTMLInputElement>(
		'input[type="text"], input:not([type]), textarea'
	);
	if (textInput)
		return textInput.value;

	// Meta Bind / Meta Edit suggester-like displayed value
	const suggestText = overlay.querySelector<HTMLElement>(".mb-suggest-text span");
	if (suggestText?.textContent != null)
		return suggestText.textContent.trim();

	// Checked radio / checkbox groups
	const checkedRadio = overlay.querySelector<HTMLInputElement>('input[type="radio"]:checked');
	if (checkedRadio)
		return checkedRadio.value;

	const checkedCheckboxes = Array.from(
		overlay.querySelectorAll<HTMLInputElement>('input[type="checkbox"]:checked')
	).map((input) => input.value);

	if (checkedCheckboxes.length > 0)
		return String(propertyInputType === "text" ? checkedCheckboxes.join(", ") : checkedCheckboxes);

	// Generic selected/active text fallback for custom controls
	const selectedText =
		overlay.querySelector<HTMLElement>('[aria-selected="true"]')?.textContent?.trim() ??
		overlay.querySelector<HTMLElement>(".is-selected")?.textContent?.trim() ??
		overlay.querySelector<HTMLElement>(".mod-selected")?.textContent?.trim();

	if (selectedText)
		return selectedText

	// Only after live DOM checks, use internal data attributes
	const internalValue = overlay
		.querySelector<HTMLElement>("[data-internal-value]")
		?.getAttribute("data-internal-value");

	if (internalValue != null)
		return internalValue;

	return null;
}

function writeNativeValue(
	inputElement: HTMLElement,
	value: string,
	propertyInputType: SupportedPropertyInputType
): void {
	if (propertyInputType === "text") {
		const editable = inputElement as HTMLDivElement;
		if (editable.textContent === value && editable.getAttribute("data-property-longtext-value") === value)
			return;

		editable.textContent = value;
		return;
	}

	const input = inputElement as HTMLInputElement | HTMLTextAreaElement;
	if (input.value === value)
		return;

	const prototype =
		input instanceof HTMLTextAreaElement
			? HTMLTextAreaElement.prototype
			: HTMLInputElement.prototype;

	Object.getOwnPropertyDescriptor(prototype, "value")?.set?.call(input, value);

	if ("defaultValue" in input)
		input.defaultValue = value;
}

function resetPropertyFormatting(containerElement: HTMLElement, inputElement: HTMLElement): void {
	containerElement.querySelector<HTMLDivElement>(`.${FORMATTED_OVERLAY_CLASS}`)?.remove();
	containerElement.classList.remove(FORMATTED_WRAPPER_CLASS);
	inputElement.classList.remove(HIDDEN_INPUT_CLASS);
	refreshByInput.delete(inputElement);

	widgetMutationObserverByContainer.get(containerElement)?.disconnect();
	widgetMutationObserverByContainer.delete(containerElement);
	lastObservedWidgetValueByContainer.delete(containerElement);

	const dataset = containerElement.dataset as Record<string, string | undefined>;
	delete dataset[BOUND_CONTAINER_KEY];
	delete dataset[SYNC_BOUND_DATASET_KEY];
	delete dataset[LIVE_REFRESH_BOUND_DATASET_KEY];
}

function bindRefreshOnce(inputElement: HTMLElement): void {
	const dataset = inputElement.dataset as Record<string, string | undefined>;
	if (dataset[BOUND_DATASET_KEY])
		return;

	dataset[BOUND_DATASET_KEY] = "1";

	const callRefresh = () => refreshByInput.get(inputElement)?.();

	inputElement.addEventListener("focus", callRefresh);
	inputElement.addEventListener("blur", callRefresh);
}

function createMarkdownRenderer(
	plugin: PrettyPropertiesPlugin,
	overlayElement: HTMLDivElement,
	sourcePath: string
): (markdown: string) => Promise<void> {
	let renderSequence = 0;

	return async (markdown: string) => {
		const currentSequence = ++renderSequence;
		if (overlayElement.dataset[LAST_RENDERED_DATASET_KEY] === markdown)
			return;

		overlayElement.empty();
		await MarkdownRenderer.render(plugin.app, markdown, overlayElement, sourcePath, plugin);

		if (currentSequence !== renderSequence)
			return;

		overlayElement.dataset[LAST_RENDERED_DATASET_KEY] = markdown;
	};
}

function computeFormattedValue(
	plugin: PrettyPropertiesPlugin,
	propertyName: string,
	propertyFormat: unknown,
	currentValue: unknown
): string {
	const rawText = String(currentValue ?? "");

	try {
		return plugin.formatter.format(propertyName, rawText, propertyFormat as any);
	} catch {
		return rawText;
	}
}

function readInputText(element: HTMLElement): string {
	const value = (element as { value?: unknown }).value;
	return typeof value === "string" ? value : (element.textContent ?? "");
}

function findInputElement(
	container: HTMLElement,
	propertyInputType: SupportedPropertyInputType
): HTMLElement | null {
	return container.querySelector(INPUT_SELECTORS[propertyInputType]);
}

function ensureOverlayElement(container: HTMLElement): HTMLDivElement {
	const existing = container.querySelector<HTMLDivElement>(`.${FORMATTED_OVERLAY_CLASS}`);
	if (existing)
		return existing;

	const overlay = document.createElement("div");
	overlay.className = FORMATTED_OVERLAY_CLASS;
	container.appendChild(overlay);
	return overlay;
}

function setEditingState(inputElement: HTMLElement, overlayElement: HTMLElement, isEditing: boolean): void {
	overlayElement.style.display = isEditing ? "none" : "";
	inputElement.classList.toggle(HIDDEN_INPUT_CLASS, !isEditing);
}

function syncOverlayTextStyleFromInput(inputElement: HTMLElement, overlayElement: HTMLElement): void {
	const wasHidden = inputElement.classList.contains(HIDDEN_INPUT_CLASS);

	if (wasHidden)
		inputElement.classList.remove(HIDDEN_INPUT_CLASS);

	const computed = window.getComputedStyle(inputElement);

	if (wasHidden)
		inputElement.classList.add(HIDDEN_INPUT_CLASS);

	overlayElement.style.fontFamily = computed.fontFamily;
	overlayElement.style.fontSize = computed.fontSize;
	overlayElement.style.fontWeight = computed.fontWeight;
	overlayElement.style.fontStyle = computed.fontStyle;
	overlayElement.style.letterSpacing = computed.letterSpacing;
	overlayElement.style.lineHeight = computed.lineHeight;
	overlayElement.style.textTransform = computed.textTransform;
	overlayElement.style.textAlign = computed.textAlign;

	overlayElement.style.color = computed.color;

	overlayElement.style.paddingTop = computed.paddingTop;
	overlayElement.style.paddingRight = computed.paddingRight;
	overlayElement.style.paddingBottom = computed.paddingBottom;
	overlayElement.style.paddingLeft = computed.paddingLeft;

	overlayElement.style.textIndent = computed.textIndent;
	overlayElement.style.margin = computed.margin;

	overlayElement.style.backgroundColor = computed.backgroundColor;
	overlayElement.style.borderRadius = computed.borderRadius;
}

function readPropertyName(rowElement: HTMLElement): string {
	return (
		rowElement.getAttribute("data-property-key")?.trim() ||
		(rowElement as any).dataset?.propertyKey?.trim() ||
		rowElement.querySelector<HTMLElement>(".metadata-property-key")?.textContent?.trim() ||
		""
	);
}

function detectPropertyInputType(rowElement: HTMLElement): SupportedPropertyInputType | null {
	for (const [type, selector] of Object.entries(INPUT_SELECTORS) as Array<[SupportedPropertyInputType, string]>) {
		if (rowElement.querySelector(selector))
			return type;
	}
	return null;
}

function isSupportedPropertyInputType(type: string): type is SupportedPropertyInputType {
	return type in INPUT_SELECTORS;
}
export function getSupportedPropertyInputTypes(): string[] {
	return Object.keys(INPUT_SELECTORS);
}

function findPropertyValueContainer(rowElement: HTMLElement): HTMLElement {
	return (
		rowElement.querySelector<HTMLElement>(".metadata-property-value") ??
		rowElement.querySelector<HTMLElement>(".metadata-property-value-container") ??
		rowElement
	);
}
