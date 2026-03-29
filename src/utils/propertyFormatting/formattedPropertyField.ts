import {
	clearFormattingUI,
	getOrCreateOverlayElement,
	patchLiveValueMarkers,
	renderMarkdownIntoOverlay,
	setOverlayEditingState,
	syncOverlayTextStyleFromInput,
} from "./propertyOverlayRenderer";
import {
	chooseValueForNativeSync,
	getNativeTextValue,
	readFrontmatterValue,
	readInteractiveValueFromOverlay,
	writeNativeValue,
} from "./propertyValueState";
import PrettyPropertiesPlugin from "../../main";
import { INPUT_SELECTORS, SupportedPropertyInputType } from "../../patches/patchPropertyValues";

const FORMATTED_WRAPPER_CLASS = "pp-formatted-value-wrapper";
const LIVE_VALUE_MARKER = '<span data-pp-live-property-value></span>';
const LAST_RENDERED_KEY = "ppLastRendered";

export class FormattedPropertyField {
	private observer: MutationObserver | null = null;
	private inputElement: HTMLElement | null = null;
	private boundInputElement: HTMLElement | null = null;
	private refreshQueued = false;
	private renderVersion = 0;
	private lastObservedInteractiveValue: string | null = null;
	private propertyFormat: string | null = null;
	private isContainerBound = false;

	constructor(
		private readonly plugin: PrettyPropertiesPlugin,
		private readonly containerElement: HTMLElement,
		private readonly propertyName: string,
		private readonly propertyInputType: SupportedPropertyInputType,
		private readonly filePath: string
	) {}

	update(rawValue?: unknown): void {
		this.propertyFormat = this.findPropertyFormat();
		this.rebindInput();

		if (!this.propertyFormat || !this.inputElement) {
			this.clearFormatting();
			return;
		}

		this.ensureBound();
		this.containerElement.classList.add(FORMATTED_WRAPPER_CLASS);
		this.scheduleRefresh(rawValue);
	}

	dispose(): void {
		this.unbindInput();
		this.disconnectObserver();

		if (this.isContainerBound) {
			this.containerElement.removeEventListener("pointerdown", this.handlePointerDownOrFocusIn, true);
			this.containerElement.removeEventListener("focusin", this.handlePointerDownOrFocusIn, true);
			this.containerElement.removeEventListener("input", this.handleContainerInputOrChange, true);
			this.containerElement.removeEventListener("change", this.handleContainerInputOrChange, true);
			this.containerElement.removeEventListener("focusout", this.handleFocusOut);
			this.isContainerBound = false;
		}

		clearFormattingUI(this.containerElement, this.inputElement);

		this.inputElement = null;
		this.propertyFormat = null;
		this.lastObservedInteractiveValue = null;
		this.refreshQueued = false;
	}

	matches(
		propertyName: string,
		propertyInputType: SupportedPropertyInputType,
		filePath: string
	): boolean {
		return (
			this.propertyName === propertyName &&
			this.propertyInputType === propertyInputType &&
			this.filePath === filePath
		);
	}

	private clearFormatting(): void {
		this.unbindInput();
		this.disconnectObserver();

		clearFormattingUI(this.containerElement, this.inputElement);

		this.inputElement = null;
		this.propertyFormat = null;
		this.lastObservedInteractiveValue = null;
		this.refreshQueued = false;
	}

	private findPropertyFormat(): string | null {
		return this.plugin.settings.propertyFormats.find(
			(formatConfig) => formatConfig.property.toLowerCase() === this.propertyName.toLowerCase()
		)?.format?.trim() || null;
	}

	private ensureBound(): void {
		if (!this.isContainerBound) {
			this.containerElement.addEventListener("pointerdown", this.handlePointerDownOrFocusIn, true);
			this.containerElement.addEventListener("focusin", this.handlePointerDownOrFocusIn, true);
			this.containerElement.addEventListener("input", this.handleContainerInputOrChange, true);
			this.containerElement.addEventListener("change", this.handleContainerInputOrChange, true);
			this.containerElement.addEventListener("focusout", this.handleFocusOut);
			this.isContainerBound = true;
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
		const nextInputElement = this.findInputElement();
		if (nextInputElement === this.inputElement)
			return nextInputElement;

		this.unbindInput();
		this.inputElement = nextInputElement;

		if (nextInputElement) {
			nextInputElement.addEventListener("focus", this.handleInputFocusOrBlur);
			nextInputElement.addEventListener("blur", this.handleInputFocusOrBlur);
			this.boundInputElement = nextInputElement;
		}

		return nextInputElement;
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

	private readInteractiveValue(): string | null {
		const overlayElement = getOrCreateOverlayElement(this.containerElement);
		return readInteractiveValueFromOverlay(overlayElement, this.propertyInputType);
	}

	private syncOverlayValueIntoNativeInput(): void {
		const inputElement = this.rebindInput();
		if (!inputElement)
			return;

		const overlayValue = this.readInteractiveValue();
		const frontmatterValue = readFrontmatterValue(this.plugin, this.filePath, this.propertyName);
		const nextValue = chooseValueForNativeSync(
			this.propertyInputType,
			overlayValue,
			frontmatterValue
		);

		if (nextValue != null)
			writeNativeValue(inputElement, nextValue, this.propertyInputType);
	}

	private resolveDisplayValue(rawValue?: unknown): string {
		const interactiveValue = this.readInteractiveValue();
		if (interactiveValue != null)
			return interactiveValue;

		const nativeValue = this.inputElement ? getNativeTextValue(this.inputElement) : "";
		if (nativeValue)
			return nativeValue;

		return String(rawValue ?? "");
	}

	private buildTemplateMarkdown(liveValue: string): string {
		const propertyFormat = this.propertyFormat;
		if (!propertyFormat)
			return "";

		return propertyFormat.includes("{{propertyValue}}")
			? propertyFormat.replaceAll("{{propertyValue}}", LIVE_VALUE_MARKER)
			: this.computeFormattedValue(liveValue);
	}

	private computeFormattedValue(currentValue: unknown): string {
		const rawText = String(currentValue ?? "");
		const propertyFormat = this.propertyFormat;
		if (!propertyFormat)
			return rawText;

		try {
			return this.plugin.formatter.format(
				this.propertyName,
				rawText,
				propertyFormat
			);
		} catch {
			return rawText;
		}
	}

	private async renderMarkdown(markdown: string): Promise<void> {
		const currentRenderVersion = ++this.renderVersion;

		const didRender = await renderMarkdownIntoOverlay(
			this.plugin,
			this.containerElement,
			this.filePath,
			LAST_RENDERED_KEY,
			markdown
		);

		if (!didRender || currentRenderVersion !== this.renderVersion)
			return;
	}

	private refresh(rawValue?: unknown): void {
		const inputElement = this.rebindInput();
		const propertyFormat = this.propertyFormat;
		if (!inputElement || !propertyFormat)
			return;

		const overlayElement = getOrCreateOverlayElement(this.containerElement);

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
			this.lastObservedInteractiveValue = this.readInteractiveValue();
			return;
		}

		void this.renderMarkdown(templateMarkdown).then(() => {
			patchLiveValueMarkers(overlayElement, liveValue);
			this.lastObservedInteractiveValue = this.readInteractiveValue();
		});
	}

	private handleInputFocusOrBlur = (): void => {
		this.refresh();
	};

	private handleFocusOut = (): void => {
		queueMicrotask(() => this.update());
	};

	private handlePointerDownOrFocusIn = (): void => {
		this.syncOverlayValueIntoNativeInput();
	};

	private handleMutation = (): void => {
		if (!this.inputElement || !this.containerElement.contains(this.inputElement))
			this.rebindInput();

		const nextInteractiveValue = this.readInteractiveValue();
		if (nextInteractiveValue === this.lastObservedInteractiveValue)
			return;

		this.lastObservedInteractiveValue = nextInteractiveValue;
		this.scheduleRefresh();
	};

	private handleContainerInputOrChange = (): void => {
		this.scheduleRefresh();
	};

	private scheduleRefresh(rawValue?: unknown): void {
		if (this.refreshQueued)
			return;

		this.refreshQueued = true;
		requestAnimationFrame(() => {
			this.refreshQueued = false;
			this.refresh(rawValue);
		});
	}
}
