import { MarkdownRenderer } from "obsidian";
import PrettyPropertiesPlugin from "../../main";

const FORMATTED_OVERLAY_CLASS = "pp-formatted-value-overlay";
const HIDDEN_INPUT_CLASS = "pp-formatted-value-hidden";
const FORMATTED_WRAPPER_CLASS = "pp-formatted-value-wrapper";

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

export interface OverlayRenderContext {
	plugin: PrettyPropertiesPlugin;
	containerElement: HTMLElement;
	sourcePath: string;
	lastRenderedKey: string;
}

export function getOrCreateOverlayElement(containerElement: HTMLElement): HTMLDivElement {
	const existing = containerElement.querySelector<HTMLDivElement>(`.${FORMATTED_OVERLAY_CLASS}`);
	if (existing)
		return existing;

	const overlayElement = document.createElement("div");
	overlayElement.className = FORMATTED_OVERLAY_CLASS;
	containerElement.appendChild(overlayElement);

	return overlayElement;
}

export function clearFormattingUI(
	containerElement: HTMLElement,
	inputElement: HTMLElement | null
): void {
	containerElement.querySelector<HTMLDivElement>(`.${FORMATTED_OVERLAY_CLASS}`)?.remove();
	inputElement?.classList.remove(HIDDEN_INPUT_CLASS);
	containerElement.classList.remove(FORMATTED_WRAPPER_CLASS);
}

export function setOverlayEditingState(
	inputElement: HTMLElement,
	overlayElement: HTMLElement
): boolean {
	const activeElement = document.activeElement as HTMLElement | null;
	const isEditing =
		activeElement === inputElement ||
		(activeElement != null && inputElement.contains(activeElement));

	overlayElement.style.display = isEditing ? "none" : "";
	inputElement.classList.toggle(HIDDEN_INPUT_CLASS, !isEditing);

	return isEditing;
}

export function syncOverlayTextStyleFromInput(
	inputElement: HTMLElement,
	overlayElement: HTMLElement
): void {
	const wasHidden = inputElement.classList.contains(HIDDEN_INPUT_CLASS);
	if (wasHidden)
		inputElement.classList.remove(HIDDEN_INPUT_CLASS);

	const computed = window.getComputedStyle(inputElement);

	if (wasHidden)
		inputElement.classList.add(HIDDEN_INPUT_CLASS);

	for (const property of COPIED_TEXT_STYLES)
		(overlayElement.style as CSSStyleDeclaration)[property] = computed[property];
}

export function patchLiveValueMarkers(
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

export async function renderMarkdownIntoOverlay(
	context: OverlayRenderContext,
	markdown: string
): Promise<boolean> {
	const overlayElement = getOrCreateOverlayElement(context.containerElement);

	if (overlayElement.dataset[context.lastRenderedKey] === markdown)
		return false;

	overlayElement.empty();

	await MarkdownRenderer.render(
		context.plugin.app,
		markdown,
		overlayElement,
		context.sourcePath,
		context.plugin
	);

	overlayElement.dataset[context.lastRenderedKey] = markdown;
	return true;
}
