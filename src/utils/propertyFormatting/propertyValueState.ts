import { TFile } from "obsidian";
import PrettyPropertiesPlugin from "../../main";
import { SupportedPropertyInputType } from "../../patches/patchPropertyValues";
import { getNestedProperty } from "../propertyUtils";

export function readFrontmatterValue(
	plugin: PrettyPropertiesPlugin,
	filePath: string,
	propertyName: string
): string | null {
	const file = plugin.app.vault.getAbstractFileByPath(filePath);
	if (!(file instanceof TFile))
		return null;

	return getNestedProperty(
		plugin.app.metadataCache.getFileCache(file)?.frontmatter,
		propertyName
	);
}

export function readInteractiveValueFromOverlay(
	overlayElement: HTMLElement,
	propertyInputType: SupportedPropertyInputType
): string | null {
	const directValue = readDirectControlValue(overlayElement);
	if (directValue)
		return directValue;

	const checkedCheckboxValues = readCheckedCheckboxValues(overlayElement);
	if (checkedCheckboxValues.length) {
		return propertyInputType === "text"
			? checkedCheckboxValues.join(", ")
			: String(checkedCheckboxValues);
	}

	return readSelectedValue(overlayElement);
}

export function getNativeTextValue(inputElement: HTMLElement): string {
	const value = (inputElement as { value?: unknown }).value;
	return typeof value === "string" ? value : (inputElement.textContent ?? "");
}

export function chooseValueForNativeSync(
	propertyInputType: SupportedPropertyInputType,
	overlayValue: string | null,
	frontmatterValue: string | null
): string | null {
	// Long-text fields prefer the live interactive value; other field types
	// prefer persisted frontmatter when both are available.
	return propertyInputType === "text"
		? (overlayValue ?? frontmatterValue)
		: (frontmatterValue ?? overlayValue);
}

export function writeNativeValue(
	inputElement: HTMLElement,
	value: string,
	propertyInputType: SupportedPropertyInputType
): void {
	if (propertyInputType === "text") {
		const editableElement = inputElement as HTMLDivElement;
		if (
			editableElement.textContent === value &&
			editableElement.getAttribute("data-property-longtext-value") === value
		) {
			return;
		}

		editableElement.textContent = value;
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

function readDirectControlValue(rootElement: HTMLElement): string | null {
	for (const value of [
		rootElement.querySelector<HTMLInputElement>('input[type="range"]')?.value,
		rootElement.querySelector<HTMLSelectElement>("select")?.value,
		rootElement.querySelector<HTMLInputElement>('input[type="text"], input:not([type]), textarea')?.value,
		rootElement.querySelector<HTMLElement>(".mb-suggest-text span")?.textContent?.trim(),
		rootElement.querySelector<HTMLInputElement>('input[type="radio"]:checked')?.value,
	]) {
		if (value)
			return value;
	}

	return null;
}

function readCheckedCheckboxValues(rootElement: HTMLElement): string[] {
	return Array.from(
		rootElement.querySelectorAll<HTMLInputElement>('input[type="checkbox"]:checked'),
		(input) => input.value
	);
}

function readSelectedValue(rootElement: HTMLElement): string | null {
	for (const value of [
		rootElement.querySelector<HTMLElement>('[aria-selected="true"]')?.textContent?.trim(),
		rootElement.querySelector<HTMLElement>(".is-selected")?.textContent?.trim(),
		rootElement.querySelector<HTMLElement>(".mod-selected")?.textContent?.trim(),
		rootElement.querySelector<HTMLElement>("[data-internal-value]")?.getAttribute("data-internal-value"),
	]) {
		if (value)
			return value;
	}

	return null;
}
