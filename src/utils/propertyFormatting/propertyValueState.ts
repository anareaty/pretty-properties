import { TFile } from "obsidian";
import PrettyPropertiesPlugin from "../../main";
import {SupportedPropertyInputType} from "../../patches/patchPropertyValues";
import {getNestedProperty} from "../propertyUtils";

export function readFrontmatterValue(
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

export function readWidgetValueFromOverlay(
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

export function getNativeTextValue(inputElement: HTMLElement): string {
	const value = (inputElement as { value?: unknown }).value;
	return typeof value === "string" ? value : (inputElement.textContent ?? "");
}

export function chooseValueForNativeSync(
	propertyInputType: SupportedPropertyInputType,
	overlayValue: string | null,
	frontmatterValue: string | null
): string | null {
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
