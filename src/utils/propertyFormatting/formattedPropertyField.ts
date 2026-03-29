import {
	clearFormattingUI,
	getOrCreateOverlayElement,
	patchLiveValueMarkers,
	renderMarkdownIntoOverlay,
	setOverlayEditingState,
	syncOverlayTextStyleFromInput,
	type OverlayRenderContext,
} from "./propertyOverlayRenderer";
import {
	chooseValueForNativeSync,
	getNativeTextValue,
	readFrontmatterValue,
	readWidgetValueFromOverlay,
	writeNativeValue,
} from "./propertyValueState";
import PrettyPropertiesPlugin from "../../main";
import {INPUT_SELECTORS, SupportedPropertyInputType} from "../../patches/patchPropertyValues";

const FORMATTED_WRAPPER_CLASS = "pp-formatted-value-wrapper";
const LIVE_VALUE_MARKER = '<span data-pp-live-property-value></span>';
const LAST_RENDERED_KEY = "ppLastRendered";

export class FormattedPropertyField {
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

		clearFormattingUI(this.containerElement, this.inputElement);

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

	private readOverlayWidgetValue(): string | null {
		const overlayElement = getOrCreateOverlayElement(this.containerElement);
		return readWidgetValueFromOverlay(overlayElement, this.propertyInputType);
	}

	private syncOverlayValueIntoNativeInput(): void {
		const inputElement = this.rebindInput();
		if (!inputElement)
			return;

		const overlayValue = this.readOverlayWidgetValue();
		const frontmatterValue = readFrontmatterValue(this.plugin, this.sourcePath, this.propertyName);
		const nextValue = chooseValueForNativeSync(
			this.propertyInputType,
			overlayValue,
			frontmatterValue
		);

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
			: this.computeFormattedValue(liveValue);
	}

	private computeFormattedValue(currentValue: unknown): string {
		const rawText = String(currentValue ?? "");

		try {
			return this.plugin.formatter.format(
				this.propertyName,
				rawText,
				this.propertyFormat as any
			);
		} catch {
			return rawText;
		}
	}

	private async renderMarkdown(markdown: string): Promise<void> {
		const context: OverlayRenderContext = {
			plugin: this.plugin,
			containerElement: this.containerElement,
			sourcePath: this.sourcePath,
			lastRenderedKey: LAST_RENDERED_KEY,
		};

		const currentSequence = ++this.renderSequence;
		const rendered = await renderMarkdownIntoOverlay(context, markdown);

		if (currentSequence !== this.renderSequence || !rendered)
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
