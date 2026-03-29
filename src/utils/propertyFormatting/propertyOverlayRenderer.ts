import { MarkdownRenderer } from "obsidian";
import PrettyPropertiesPlugin from "../../main";

const FORMATTED_OVERLAY_CLASS = "pp-formatted-value-overlay";
const HIDDEN_INPUT_CLASS = "pp-formatted-value-hidden";
const FORMATTED_WRAPPER_CLASS = "pp-formatted-value-wrapper";

const STYLE_PROPERTIES_TO_COPY = [
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

export function getOrCreateOverlayElement(containerElement: HTMLElement): HTMLDivElement {
	const existingOverlay = containerElement.querySelector<HTMLDivElement>(`.${FORMATTED_OVERLAY_CLASS}`);
	if (existingOverlay)
		return existingOverlay;

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

	// Hidden inputs can report the wrong computed styles, so temporarily show it.
	if (wasHidden)
		inputElement.classList.remove(HIDDEN_INPUT_CLASS);

	const computedStyle = window.getComputedStyle(inputElement);

	if (wasHidden)
		inputElement.classList.add(HIDDEN_INPUT_CLASS);

	for (const property of STYLE_PROPERTIES_TO_COPY)
		(overlayElement.style as CSSStyleDeclaration)[property] = computedStyle[property];
}

export function patchLiveValueMarkers(
	overlayElement: HTMLElement,
	value: string
): boolean {
	const liveValueMarkers = overlayElement.querySelectorAll<HTMLElement>("[data-pp-live-property-value]");
	if (!liveValueMarkers.length)
		return false;

	for (const marker of liveValueMarkers)
		marker.textContent = value;

	return true;
}

export async function renderMarkdownIntoOverlay(
	plugin: PrettyPropertiesPlugin,
	containerElement: HTMLElement,
	filePath: string,
	lastRenderedKey: string,
	markdown: string
): Promise<boolean> {
	const overlayElement = getOrCreateOverlayElement(containerElement);

	if (overlayElement.dataset[lastRenderedKey] === markdown)
		return false;

	overlayElement.empty();

	await MarkdownRenderer.render(
		plugin.app,
		markdown,
		overlayElement,
		filePath,
		plugin
	);

	overlayElement.dataset[lastRenderedKey] = markdown;
	return true;
}
