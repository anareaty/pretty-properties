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
const LAST_RENDERED_KEY = "ppLastRendered";

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

const fieldByContainer = new WeakMap<HTMLElement, FormattedPropertyField>();

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

				getOrCreateField(
					plugin,
					findPropertyValueContainer(rowElement),
					propertyName,
					propertyInputType,
					sourcePath
				).update();
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

	getOrCreateField(
		plugin,
		containerElement,
		propertyName,
		propertyInputType,
		sourcePath
	).update(rawValue);
}

export function getSupportedPropertyInputTypes(): string[] {
	return Object.keys(INPUT_SELECTORS);
}

class FormattedPropertyField {
	private observer: MutationObserver | null = null;
	private inputElement: HTMLElement | null = null;
	private boundInputElement: HTMLElement | null = null;
	private refreshQueued = false;
	private renderSequence = 0;
	private lastObservedWidgetValue: string | null = null;
	private propertyFormat: string | null = null;
	private containerBound = false;

	constructor(
		private readonly plugin: PrettyPropertiesPlugin,
		private readonly containerElement: HTMLElement,
		private readonly propertyName: string,
		private readonly propertyInputType: SupportedPropertyInputType,
		private readonly sourcePath: string
	) {}

	update(rawValue?: unknown): void {
		this.propertyFormat = this.lookupPropertyFormat();
		this.rebindInput();

		if (!this.propertyFormat || !this.inputElement) {
			this.clearFormatting();
			return;
		}

		this.ensureBound();
		this.containerElement.classList.add(FORMATTED_WRAPPER_CLASS);

		requestAnimationFrame(() => {
			this.refresh(rawValue);
		});
	}

	private clearFormatting(): void {
		this.unbindInput();
		this.disconnectObserver();

		this.getExistingOverlayElement()?.remove();
		this.inputElement?.classList.remove(HIDDEN_INPUT_CLASS);
		this.containerElement.classList.remove(FORMATTED_WRAPPER_CLASS);

		this.inputElement = null;
		this.propertyFormat = null;
		this.lastObservedWidgetValue = null;
		this.refreshQueued = false;
	}

	private lookupPropertyFormat(): string | null {
		return this.plugin.settings.propertyFormats.find(
			(candidate) => candidate.property.toLowerCase() === this.propertyName.toLowerCase()
		)?.format?.trim() || null;
	}

	private ensureBound(): void {
		if (!this.containerBound) {
			this.containerElement.addEventListener("pointerdown", this.handlePointerDownOrFocusIn, true);
			this.containerElement.addEventListener("focusin", this.handlePointerDownOrFocusIn, true);
			this.containerElement.addEventListener("input", this.scheduleRefresh, true);
			this.containerElement.addEventListener("change", this.scheduleRefresh, true);
			this.containerElement.addEventListener("focusout", this.handleFocusOut);
			this.containerBound = true;
		}

		if (!this.observer) {
			this.observer = new MutationObserver(this.handleMutation);
			this.observer.observe(this.containerElement, {
				subtree: true,
				childList: true,
				characterData: true,
				attributes: true,
				attributeFilter: ["data-internal-value", "aria-selected", "class", "value"],
			});
		}
	}

	private disconnectObserver(): void {
		this.observer?.disconnect();
		this.observer = null;
	}

	private rebindInput(): HTMLElement | null {
		const nextInput = this.findInputElement();
		if (nextInput === this.inputElement)
			return nextInput;

		this.unbindInput();
		this.inputElement = nextInput;

		if (nextInput) {
			nextInput.addEventListener("focus", this.handleInputFocusOrBlur);
			nextInput.addEventListener("blur", this.handleInputFocusOrBlur);
			this.boundInputElement = nextInput;
		}

		return nextInput;
	}

	private unbindInput(): void {
		if (!this.boundInputElement)
			return;

		this.boundInputElement.removeEventListener("focus", this.handleInputFocusOrBlur);
		this.boundInputElement.removeEventListener("blur", this.handleInputFocusOrBlur);
		this.boundInputElement = null;
	}

	private findInputElement(): HTMLElement | null {
		return this.containerElement.querySelector(INPUT_SELECTORS[this.propertyInputType]);
	}

	private getExistingOverlayElement(): HTMLDivElement | null {
		return this.containerElement.querySelector<HTMLDivElement>(`.${FORMATTED_OVERLAY_CLASS}`);
	}

	private getOverlayElement(): HTMLDivElement {
		return ensureOverlayElement(this.containerElement);
	}

	private readOverlayWidgetValue(): string | null {
		return readWidgetValueFromOverlay(this.getOverlayElement(), this.propertyInputType);
	}

	private chooseValueForNativeSync(
		overlayValue: string | null,
		frontmatterValue: string | null
	): string | null {
		return this.propertyInputType === "text"
			? (overlayValue ?? frontmatterValue)
			: (frontmatterValue ?? overlayValue);
	}

	private syncOverlayValueIntoNativeInput(): void {
		const inputElement = this.rebindInput();
		if (!inputElement)
			return;

		const overlayValue = this.readOverlayWidgetValue();
		const frontmatterValue = readFrontmatterValue(this.plugin, this.sourcePath, this.propertyName);
		const nextValue = this.chooseValueForNativeSync(overlayValue, frontmatterValue);

		if (nextValue != null)
			writeNativeValue(inputElement, nextValue, this.propertyInputType);
	}

	private resolveDisplayValue(rawValue?: unknown): string {
		const overlayValue = this.readOverlayWidgetValue();
		if (overlayValue != null)
			return overlayValue;

		const nativeValue = this.inputElement ? getNativeTextValue(this.inputElement) : "";
		if (nativeValue)
			return nativeValue;

		return String(rawValue ?? "");
	}

	private buildTemplateMarkdown(liveValue: string): string {
		if (!this.propertyFormat)
			return "";

		return this.propertyFormat.includes("{{propertyValue}}")
			? this.propertyFormat.replaceAll("{{propertyValue}}", LIVE_VALUE_MARKER)
			: computeFormattedValue(this.plugin, this.propertyName, this.propertyFormat, liveValue);
	}

	private async renderMarkdown(markdown: string): Promise<void> {
		const overlayElement = this.getOverlayElement();
		const currentSequence = ++this.renderSequence;

		if (overlayElement.dataset[LAST_RENDERED_KEY] === markdown)
			return;

		overlayElement.empty();

		await MarkdownRenderer.render(
			this.plugin.app,
			markdown,
			overlayElement,
			this.sourcePath,
			this.plugin
		);

		if (currentSequence !== this.renderSequence)
			return;

		overlayElement.dataset[LAST_RENDERED_KEY] = markdown;
	}

	private refresh(rawValue?: unknown): void {
		const inputElement = this.rebindInput();
		const propertyFormat = this.propertyFormat;
		if (!inputElement || !propertyFormat)
			return;

		const overlayElement = this.getOverlayElement();

		syncOverlayTextStyleFromInput(inputElement, overlayElement);

		if (setOverlayEditingState(inputElement, overlayElement))
			return;

		const liveValue = this.resolveDisplayValue(rawValue);
		const templateMarkdown = this.buildTemplateMarkdown(liveValue);

		if (
			templateMarkdown === overlayElement.dataset[LAST_RENDERED_KEY] &&
			overlayElement.hasChildNodes() &&
			patchLiveValueMarkers(overlayElement, liveValue)
		) {
			this.lastObservedWidgetValue = this.readOverlayWidgetValue();
			return;
		}

		void this.renderMarkdown(templateMarkdown).then(() => {
			patchLiveValueMarkers(overlayElement, liveValue);
			this.lastObservedWidgetValue = this.readOverlayWidgetValue();
		});
	}

	private readonly handleInputFocusOrBlur = (): void => {
		this.refresh();
	};

	private readonly handleFocusOut = (): void => {
		queueMicrotask(() => this.update());
	};

	private readonly handlePointerDownOrFocusIn = (): void => {
		this.syncOverlayValueIntoNativeInput();
	};

	private readonly handleMutation = (): void => {
		this.rebindInput();

		const nextWidgetValue = this.readOverlayWidgetValue();
		if (nextWidgetValue === this.lastObservedWidgetValue)
			return;

		this.lastObservedWidgetValue = nextWidgetValue;
		this.scheduleRefresh();
	};

	private readonly scheduleRefresh = (): void => {
		if (this.refreshQueued)
			return;

		this.refreshQueued = true;
		requestAnimationFrame(() => {
			this.refreshQueued = false;
			this.refresh();
		});
	};
}

function getOrCreateField(
	plugin: PrettyPropertiesPlugin,
	containerElement: HTMLElement,
	propertyName: string,
	propertyInputType: SupportedPropertyInputType,
	sourcePath: string
): FormattedPropertyField {
	const existing = fieldByContainer.get(containerElement);
	if (existing)
		return existing;

	const field = new FormattedPropertyField(
		plugin,
		containerElement,
		propertyName,
		propertyInputType,
		sourcePath
	);

	fieldByContainer.set(containerElement, field);
	return field;
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
	overlayElement: HTMLElement,
	propertyInputType: SupportedPropertyInputType
): string | null {
	for (const value of [
		overlayElement.querySelector<HTMLInputElement>('input[type="range"]')?.value,
		overlayElement.querySelector<HTMLSelectElement>("select")?.value,
		overlayElement.querySelector<HTMLInputElement>('input[type="text"], input:not([type]), textarea')?.value,
		overlayElement.querySelector<HTMLElement>(".mb-suggest-text span")?.textContent?.trim(),
		overlayElement.querySelector<HTMLInputElement>('input[type="radio"]:checked')?.value,
	]) {
		if (value)
			return value;
	}

	const checkedCheckboxValues = Array.from(
		overlayElement.querySelectorAll<HTMLInputElement>('input[type="checkbox"]:checked'),
		(input) => input.value
	);

	if (checkedCheckboxValues.length) {
		return propertyInputType === "text"
			? checkedCheckboxValues.join(", ")
			: String(checkedCheckboxValues);
	}

	for (const value of [
		overlayElement.querySelector<HTMLElement>('[aria-selected="true"]')?.textContent?.trim(),
		overlayElement.querySelector<HTMLElement>(".is-selected")?.textContent?.trim(),
		overlayElement.querySelector<HTMLElement>(".mod-selected")?.textContent?.trim(),
		overlayElement.querySelector<HTMLElement>("[data-internal-value]")?.getAttribute("data-internal-value"),
	]) {
		if (value)
			return value;
	}

	return null;
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

function ensureOverlayElement(containerElement: HTMLElement): HTMLDivElement {
	const existing = containerElement.querySelector<HTMLDivElement>(`.${FORMATTED_OVERLAY_CLASS}`);
	if (existing)
		return existing;

	const overlayElement = document.createElement("div");
	overlayElement.className = FORMATTED_OVERLAY_CLASS;
	containerElement.appendChild(overlayElement);
	return overlayElement;
}

function setOverlayEditingState(inputElement: HTMLElement, overlayElement: HTMLElement): boolean {
	const activeElement = document.activeElement as HTMLElement | null;
	const isEditing =
		activeElement === inputElement ||
		(activeElement != null && inputElement.contains(activeElement));

	overlayElement.style.display = isEditing ? "none" : "";
	inputElement.classList.toggle(HIDDEN_INPUT_CLASS, !isEditing);
	return isEditing;
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

function findPropertyValueContainer(rowElement: HTMLElement): HTMLElement {
	return (
		rowElement.querySelector<HTMLElement>(".metadata-property-value") ??
		rowElement.querySelector<HTMLElement>(".metadata-property-value-container") ??
		rowElement
	);
}
