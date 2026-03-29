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
const LIVE_VALUE_MARKER = '<span data-pp-live-property-value></span>';

const INPUT_BOUND_KEY = "ppFormattedValueBound";
const CONTAINER_BOUND_KEY = "ppFormattedContainerBound";
const LAST_RENDERED_KEY = "ppLastRendered";

const refreshByInput = new WeakMap<HTMLElement, () => void>();
const observerByContainer = new WeakMap<HTMLElement, MutationObserver>();
const lastObservedValueByContainer = new WeakMap<HTMLElement, string | null>();
const pendingRefreshByContainer = new WeakMap<HTMLElement, number>();
const pendingReapplyByContainer = new WeakMap<HTMLElement, number>();

const COPIED_TEXT_STYLES = [
	"fontFamily",
	"fontSize",
	"fontWeight",
	"fontStyle",
	"letterSpacing",
	"lineHeight",
	"textTransform",
	"textAlign",
	"color",
	"paddingTop",
	"paddingRight",
	"paddingBottom",
	"paddingLeft",
	"textIndent",
	"margin",
	"backgroundColor",
	"borderRadius",
] as const;

export function updateAllPropertyFormats(plugin: PrettyPropertiesPlugin): void {
	requestAnimationFrame(() => {
		for (const leaf of plugin.app.workspace.getLeavesOfType("markdown")) {
			if (!(leaf.view instanceof MarkdownView))
				continue;

			const sourcePath = leaf.view.file?.path;
			const metadataContainer = leaf.view.contentEl.querySelector<HTMLElement>(".metadata-container");
			if (!sourcePath || !metadataContainer)
				continue;

			for (const rowElement of metadataContainer.querySelectorAll<HTMLElement>(".metadata-property")) {
				const propertyName = readPropertyName(rowElement);
				const propertyInputType = detectPropertyInputType(rowElement);
				if (!propertyName || !propertyInputType)
					continue;

				applyPropertyFormatting(
					findPropertyValueContainer(rowElement),
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

	const inputElement = containerElement.querySelector<HTMLElement>(INPUT_SELECTORS[propertyInputType]);
	if (!inputElement)
		return;

	const propertyFormat = plugin.settings.propertyFormats.find(
		(candidate) => candidate.property.toLowerCase() === propertyName.toLowerCase()
	)?.format?.trim();

	if (!propertyFormat) {
		resetPropertyFormatting(containerElement, inputElement);
		return;
	}

	containerElement.classList.add(FORMATTED_WRAPPER_CLASS);

	const overlayElement = ensureOverlayElement(containerElement);
	const renderMarkdown = createMarkdownRenderer(plugin, overlayElement, sourcePath);

	const refresh = () => {
		syncOverlayTextStyleFromInput(inputElement, overlayElement);

		const active = document.activeElement as HTMLElement | null;
		const isEditing = active === inputElement || (active != null && inputElement.contains(active));
		overlayElement.style.display = isEditing ? "none" : "";
		inputElement.classList.toggle(HIDDEN_INPUT_CLASS, !isEditing);
		if (isEditing)
			return;

		const liveValue =
			readWidgetValueFromOverlay(overlayElement, propertyInputType) ??
			getNativeTextValue(inputElement) ??
			rawValue;

		const liveText = String(liveValue ?? "");
		const templateMarkdown = propertyFormat.includes("{{propertyValue}}")
			? propertyFormat.replaceAll("{{propertyValue}}", LIVE_VALUE_MARKER)
			: computeFormattedValue(plugin, propertyName, propertyFormat, liveValue);

		if (
			templateMarkdown === overlayElement.dataset[LAST_RENDERED_KEY] &&
			overlayElement.hasChildNodes() &&
			patchLiveValueMarkers(overlayElement, liveText)
		) {
			return;
		}

		void renderMarkdown(templateMarkdown).then(() => {
			patchLiveValueMarkers(overlayElement, liveText);
		});
	};

	refreshByInput.set(inputElement, refresh);
	bindInputRefreshOnce(inputElement);
	bindContainerBehaviorOnce(containerElement, inputElement, propertyName, plugin, propertyInputType, sourcePath);

	requestAnimationFrame(refresh);
}

function bindInputRefreshOnce(inputElement: HTMLElement): void {
	const dataset = inputElement.dataset as Record<string, string | undefined>;
	if (dataset[INPUT_BOUND_KEY])
		return;

	dataset[INPUT_BOUND_KEY] = "1";

	const refresh = () => refreshByInput.get(inputElement)?.();
	inputElement.addEventListener("focus", refresh);
	inputElement.addEventListener("blur", refresh);
}

function bindContainerBehaviorOnce(
	containerElement: HTMLElement,
	inputElement: HTMLElement,
	propertyName: string,
	plugin: PrettyPropertiesPlugin,
	propertyInputType: SupportedPropertyInputType,
	sourcePath: string
): void {
	const dataset = containerElement.dataset as Record<string, string | undefined>;
	if (dataset[CONTAINER_BOUND_KEY])
		return;

	dataset[CONTAINER_BOUND_KEY] = "1";

	const getOverlayValue = () => {
		const overlayElement = containerElement.querySelector<HTMLElement>(`.${FORMATTED_OVERLAY_CLASS}`);
		return overlayElement ? readWidgetValueFromOverlay(overlayElement, propertyInputType) : null;
	};

	const scheduleRefresh = () => {
		if (pendingRefreshByContainer.has(containerElement))
			return;

		pendingRefreshByContainer.set(containerElement, 1);
		requestAnimationFrame(() => {
			pendingRefreshByContainer.delete(containerElement);
			refreshByInput.get(inputElement)?.();
		});
	};

	const syncNativeInput = () => {
		const widgetValue = getOverlayValue();
		const frontmatterValue = readFrontmatterValue(plugin, sourcePath, propertyName);
		const nextValue = propertyInputType === "text"
			? (widgetValue ?? frontmatterValue)
			: (frontmatterValue ?? widgetValue);

		if (nextValue != null)
			writeNativeValue(inputElement, nextValue, propertyInputType);
	};

	containerElement.addEventListener("pointerdown", syncNativeInput, true);
	containerElement.addEventListener("focusin", syncNativeInput, true);
	containerElement.addEventListener("input", scheduleRefresh, true);
	containerElement.addEventListener("change", scheduleRefresh, true);

	containerElement.addEventListener("focusout", () => {
		if (pendingReapplyByContainer.has(containerElement))
			return;

		pendingReapplyByContainer.set(containerElement, 1);
		queueMicrotask(() => {
			pendingReapplyByContainer.delete(containerElement);
			applyPropertyFormatting(containerElement, propertyName, plugin, propertyInputType, sourcePath);
		});
	});

	const observer = new MutationObserver(() => {
		const nextValue = getOverlayValue();
		const previousValue = lastObservedValueByContainer.get(containerElement) ?? null;
		if (nextValue === previousValue)
			return;

		lastObservedValueByContainer.set(containerElement, nextValue);
		scheduleRefresh();
	});

	observer.observe(containerElement, {
		subtree: true,
		childList: true,
		characterData: true,
		attributes: true,
		attributeFilter: ["data-internal-value", "aria-selected", "class", "value"],
	});

	observerByContainer.set(containerElement, observer);
	lastObservedValueByContainer.set(containerElement, getOverlayValue());
}

function patchLiveValueMarkers(overlayElement: HTMLElement, value: string): boolean {
	const markers = overlayElement.querySelectorAll<HTMLElement>("[data-pp-live-property-value]");
	if (!markers.length)
		return false;

	for (const marker of markers)
		marker.textContent = value;

	return true;
}

function readFrontmatterValue(
	plugin: PrettyPropertiesPlugin,
	sourcePath: string,
	propertyName: string
): string | null {
	const file = plugin.app.vault.getAbstractFileByPath(sourcePath);
	if (!(file instanceof TFile))
		return null;

	return getNestedProperty(
		plugin.app.metadataCache.getFileCache(file)?.frontmatter,
		propertyName
	);
}

function readWidgetValueFromOverlay(
	overlay: HTMLElement,
	propertyInputType: SupportedPropertyInputType
): string | null {
	const value =
		overlay.querySelector<HTMLInputElement>('input[type="range"]')?.value ??
		overlay.querySelector<HTMLSelectElement>("select")?.value ??
		overlay.querySelector<HTMLInputElement>('input[type="text"], input:not([type]), textarea')?.value ??
		overlay.querySelector<HTMLElement>(".mb-suggest-text span")?.textContent?.trim() ??
		overlay.querySelector<HTMLInputElement>('input[type="radio"]:checked')?.value;

	if (value)
		return value;

	const checkedCheckboxes = Array.from(
		overlay.querySelectorAll<HTMLInputElement>('input[type="checkbox"]:checked'),
		(input) => input.value
	);

	if (checkedCheckboxes.length)
		return propertyInputType === "text" ? checkedCheckboxes.join(", ") : String(checkedCheckboxes);

	return (
		overlay.querySelector<HTMLElement>('[aria-selected="true"]')?.textContent?.trim() ??
		overlay.querySelector<HTMLElement>(".is-selected")?.textContent?.trim() ??
		overlay.querySelector<HTMLElement>(".mod-selected")?.textContent?.trim() ??
		overlay.querySelector<HTMLElement>("[data-internal-value]")?.getAttribute("data-internal-value") ??
		null
	);
}

function getNativeTextValue(inputElement: HTMLElement): string {
	const value = (inputElement as { value?: unknown }).value;
	return typeof value === "string" ? value : (inputElement.textContent ?? "");
}

function writeNativeValue(
	inputElement: HTMLElement,
	value: string,
	propertyInputType: SupportedPropertyInputType
): void {
	if (propertyInputType === "text") {
		const editable = inputElement as HTMLDivElement;
		if (
			editable.textContent === value &&
			editable.getAttribute("data-property-longtext-value") === value
		) {
			return;
		}

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

	observerByContainer.get(containerElement)?.disconnect();
	observerByContainer.delete(containerElement);
	lastObservedValueByContainer.delete(containerElement);

	const dataset = containerElement.dataset as Record<string, string | undefined>;
	delete dataset[CONTAINER_BOUND_KEY];
}

function createMarkdownRenderer(
	plugin: PrettyPropertiesPlugin,
	overlayElement: HTMLDivElement,
	sourcePath: string
): (markdown: string) => Promise<void> {
	let renderSequence = 0;

	return async (markdown: string) => {
		const currentSequence = ++renderSequence;
		if (overlayElement.dataset[LAST_RENDERED_KEY] === markdown)
			return;

		overlayElement.empty();
		await MarkdownRenderer.render(plugin.app, markdown, overlayElement, sourcePath, plugin);

		if (currentSequence !== renderSequence)
			return;

		overlayElement.dataset[LAST_RENDERED_KEY] = markdown;
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

function ensureOverlayElement(container: HTMLElement): HTMLDivElement {
	const existing = container.querySelector<HTMLDivElement>(`.${FORMATTED_OVERLAY_CLASS}`);
	if (existing)
		return existing;

	const overlay = document.createElement("div");
	overlay.className = FORMATTED_OVERLAY_CLASS;
	container.appendChild(overlay);
	return overlay;
}

function syncOverlayTextStyleFromInput(inputElement: HTMLElement, overlayElement: HTMLElement): void {
	const wasHidden = inputElement.classList.contains(HIDDEN_INPUT_CLASS);
	if (wasHidden)
		inputElement.classList.remove(HIDDEN_INPUT_CLASS);

	const computed = window.getComputedStyle(inputElement);

	if (wasHidden)
		inputElement.classList.add(HIDDEN_INPUT_CLASS);

	for (const property of COPIED_TEXT_STYLES)
		(overlayElement.style as CSSStyleDeclaration)[property] = computed[property];
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
