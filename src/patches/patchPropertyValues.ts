import PrettyPropertiesPlugin from "../main";
import { MarkdownRenderer, MarkdownView } from "obsidian";

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

const refreshByInput = new WeakMap<HTMLElement, () => void>();
const observerByContainer = new WeakMap<HTMLElement, MutationObserver>();
const BOUND_CONTAINER_KEY = "ppFormattedContainerBound";
const pendingReapplyByContainer = new WeakMap<HTMLElement, number>();

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

	const formatIndex = findPropertyFormatIndex(plugin, propertyName);
	const propertyFormat = formatIndex >= 0 ? plugin.settings.propertyFormats[formatIndex].format : undefined;

	if (formatIndex < 0 || !propertyFormat || propertyFormat.trim() === "") {
		resetPropertyFormatting(containerElement, inputElement);
		return;
	}

	containerElement.classList.add(FORMATTED_WRAPPER_CLASS);

	const overlayElement = ensureOverlayElement(containerElement);
	const renderMarkdown = createMarkdownRenderer(plugin, overlayElement, sourcePath);

	if (propertyInputType === "text") {
		bindContainerReapplyOnce({
			containerElement,
			propertyName,
			plugin,
			propertyInputType,
			sourcePath,
		});
	}

	const refresh = () => {
		syncOverlayTextStyleFromInput(inputElement, overlayElement);

		const active = document.activeElement as HTMLElement | null;
		const isEditing =
			active === inputElement ||
			(active != null && inputElement.contains(active));

		setEditingState(inputElement, overlayElement, isEditing);
		if (isEditing)
			return;

		const formatted = computeFormattedValue({
			plugin,
			propertyName,
			propertyFormat,
			inputElement,
			rawValue,
		});
		void renderMarkdown(formatted);
	};

	refreshByInput.set(inputElement, refresh);
	bindRefreshOnce(inputElement);
	requestAnimationFrame(refresh);
}

function bindContainerReapplyOnce(args: {
	containerElement: HTMLElement;
	propertyName: string;
	plugin: PrettyPropertiesPlugin;
	propertyInputType: SupportedPropertyInputType;
	sourcePath: string;
}): void {
	const dataset = args.containerElement.dataset as DOMStringMap & Record<string, string | undefined>;
	if (dataset[BOUND_CONTAINER_KEY])
		return;
	dataset[BOUND_CONTAINER_KEY] = "1";

	const scheduleReapply = () => {
		if (pendingReapplyByContainer.has(args.containerElement))
			return;
		pendingReapplyByContainer.set(args.containerElement, 1);

		queueMicrotask(() => {
			pendingReapplyByContainer.delete(args.containerElement);

			applyPropertyFormatting(
				args.containerElement,
				args.propertyName,
				args.plugin,
				args.propertyInputType,
				args.sourcePath
			);
		});
	};

	args.containerElement.addEventListener("focusout", scheduleReapply);
}

function resetPropertyFormatting(containerElement: HTMLElement, inputElement: HTMLElement): void {
	const overlayElement = containerElement.querySelector<HTMLDivElement>(`.${FORMATTED_OVERLAY_CLASS}`);
	if (overlayElement)
		overlayElement.remove();

	containerElement.classList.remove(FORMATTED_WRAPPER_CLASS);
	inputElement.classList.remove(HIDDEN_INPUT_CLASS);
	refreshByInput.delete(inputElement);

	const observer = observerByContainer.get(containerElement);
	if (observer) {
		observer.disconnect();
		observerByContainer.delete(containerElement);
	}
}

function bindRefreshOnce(inputElement: HTMLElement): void {
	const dataset = inputElement.dataset as DOMStringMap & Record<string, string | undefined>;
	if (dataset[BOUND_DATASET_KEY])
		return;

	dataset[BOUND_DATASET_KEY] = "1";

	const callRefresh = () => {
		const refresh = refreshByInput.get(inputElement);

		if (refresh)
			refresh();
	};

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
		const dataset = overlayElement.dataset;
		if (dataset[LAST_RENDERED_DATASET_KEY] === markdown)
			return;

		overlayElement.empty();

		await MarkdownRenderer.render(plugin.app, markdown, overlayElement, sourcePath, plugin);

		if (currentSequence !== renderSequence)
			return;

		dataset[LAST_RENDERED_DATASET_KEY] = markdown;
	};
}

function computeFormattedValue(args: {
	plugin: PrettyPropertiesPlugin;
	propertyName: string;
	propertyFormat: unknown;
	inputElement: HTMLElement;
	rawValue?: unknown;
}): string {
	const inputText = readInputText(args.inputElement);

	const value: unknown =
		inputText !== "" && inputText != null
			? inputText
			: args.rawValue ?? "";

	const rawText = coerceToString(value);

	try {
		return args.plugin.formatter.format(
			args.propertyName,
			rawText,
			args.propertyFormat as any
		);
	} catch {
		return rawText;
	}
}

function readInputText(element: HTMLElement): string {
	const possibleValue = (element as unknown as { value?: unknown }).value;
	if (typeof possibleValue === "string")
		return possibleValue;

	return element.textContent ?? "";
}

function coerceToString(value: unknown): string {
	if (typeof value === "string")
		return value;
	if (value == null)
		return "";
	return String(value);
}

function findPropertyFormatIndex(plugin: PrettyPropertiesPlugin, propertyName: string): number {
	return plugin.settings.propertyFormats.findIndex((candidate) => {
		return candidate.property.toLowerCase() === propertyName.toLowerCase();
	});
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
	if (isEditing) {
		overlayElement.style.display = "none";
		inputElement.classList.remove(HIDDEN_INPUT_CLASS);
		return;
	}

	overlayElement.style.display = "";
	inputElement.classList.add(HIDDEN_INPUT_CLASS);
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
	overlayElement.style.textAlign = computed.textAlign as unknown as string;

	overlayElement.style.color = computed.color;

	overlayElement.style.paddingTop = computed.paddingTop;
	overlayElement.style.paddingRight = computed.paddingRight;
	overlayElement.style.paddingBottom = computed.paddingBottom;
	overlayElement.style.paddingLeft = computed.paddingLeft;

	overlayElement.style.textIndent = computed.textIndent;
	overlayElement.style.margin = computed.margin;

	overlayElement.style.backgroundColor = computed.backgroundColor;

	overlayElement.style.borderRadius = computed.borderRadius;}

function readPropertyName(rowElement: HTMLElement): string {
	const fromAttribute = rowElement.getAttribute("data-property-key");
	if (fromAttribute)
		return fromAttribute.trim();

	const fromDataset = (rowElement as any).dataset?.propertyKey;
	if (typeof fromDataset === "string" && fromDataset.trim())
		return fromDataset.trim();

	const fromLabel = rowElement
		.querySelector<HTMLElement>(".metadata-property-key")
		?.textContent;

	return (fromLabel ?? "").toString().trim();
}

function detectPropertyInputType(rowElement: HTMLElement): SupportedPropertyInputType | null {
	for (const [type, selector] of Object.entries(INPUT_SELECTORS) as Array<[SupportedPropertyInputType, string]>) {
		if (rowElement.querySelector(selector))
			return type;
	}

	return null;
}

function isSupportedPropertyInputType(type: string): type is SupportedPropertyInputType {
	return Object.prototype.hasOwnProperty.call(INPUT_SELECTORS, type);
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
