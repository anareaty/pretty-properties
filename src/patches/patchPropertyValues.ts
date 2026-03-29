import PrettyPropertiesPlugin from "../main";
import { MarkdownView } from "obsidian";
import { FormattedPropertyField } from "../utils/propertyFormatting/formattedPropertyField";

export type SupportedPropertyInputType = "text" | "number" | "date" | "datetime";

export const INPUT_SELECTORS: Record<SupportedPropertyInputType, string> = {
	text: ".metadata-input-longtext",
	number: ".metadata-input-number",
	date: ".metadata-input.metadata-input-text.mod-date",
	datetime: ".metadata-input.metadata-input-text.mod-datetime",
};

const fieldByContainer = new WeakMap<HTMLElement, FormattedPropertyField>();
const activeContainers = new Set<HTMLElement>();

export function updateAllPropertyFormats(plugin: PrettyPropertiesPlugin): void {
	requestAnimationFrame(() => {
		const seenContainers = new Set<HTMLElement>();

		for (const leaf of plugin.app.workspace.getLeavesOfType("markdown")) {
			if (!(leaf.view instanceof MarkdownView))
				continue;

			const filePath = leaf.view.file?.path;
			const metadataContainer = leaf.view.contentEl.querySelector<HTMLElement>(".metadata-container");
			if (!filePath || !metadataContainer)
				continue;

			for (const rowElement of metadataContainer.querySelectorAll<HTMLElement>(".metadata-property")) {
				const propertyName = readPropertyName(rowElement);
				const inputType = findPropertyInputType(rowElement);
				if (!propertyName || !inputType)
					continue;

				const containerElement = findValueContainer(rowElement);
				seenContainers.add(containerElement);

				getOrCreateFormattedField(
					plugin,
					containerElement,
					propertyName,
					inputType,
					filePath
				).update();
			}
		}

		disposeDetachedFormattedFields(seenContainers);
	});
}

export function updateFormattedProperty(
	containerElement: HTMLElement,
	propertyName: string,
	plugin: PrettyPropertiesPlugin,
	propertyInputType: string,
	filePath: string,
	rawValue?: unknown
): void {
	if (!isSupportedPropertyInputType(propertyInputType))
		return;

	getOrCreateFormattedField(
		plugin,
		containerElement,
		propertyName,
		propertyInputType,
		filePath
	).update(rawValue);
}

export function disposeFormattedField(containerElement: HTMLElement): void {
	const field = fieldByContainer.get(containerElement);
	if (!field)
		return;

	field.dispose();
	fieldByContainer.delete(containerElement);
	activeContainers.delete(containerElement);
}

export function disposeAllFormattedFields(): void {
	for (const containerElement of activeContainers)
		fieldByContainer.get(containerElement)?.dispose();

	activeContainers.clear();
}

export function getSupportedPropertyInputTypes(): SupportedPropertyInputType[] {
	return Object.keys(INPUT_SELECTORS) as SupportedPropertyInputType[];
}

export function isSupportedPropertyInputType(value: string): value is SupportedPropertyInputType {
	return value in INPUT_SELECTORS;
}

export function readPropertyName(rowElement: HTMLElement): string {
	return (
		rowElement.dataset.propertyKey?.trim() ||
		rowElement.getAttribute("data-property-key")?.trim() ||
		rowElement.querySelector<HTMLElement>(".metadata-property-key")?.textContent?.trim() ||
		""
	);
}

export function findPropertyInputType(rowElement: HTMLElement): SupportedPropertyInputType | null {
	for (const [type, selector] of Object.entries(INPUT_SELECTORS) as Array<[SupportedPropertyInputType, string]>) {
		if (rowElement.querySelector(selector))
			return type;
	}

	return null;
}

export function findValueContainer(rowElement: HTMLElement): HTMLElement {
	return (
		rowElement.querySelector<HTMLElement>(".metadata-property-value") ??
		rowElement.querySelector<HTMLElement>(".metadata-property-value-container") ??
		rowElement
	);
}

function getOrCreateFormattedField(
	plugin: PrettyPropertiesPlugin,
	containerElement: HTMLElement,
	propertyName: string,
	propertyInputType: SupportedPropertyInputType,
	filePath: string
): FormattedPropertyField {
	const existingField = fieldByContainer.get(containerElement);
	if (existingField) {
		if (existingField.matches(propertyName, propertyInputType, filePath))
			return existingField;

		existingField.dispose();
		fieldByContainer.delete(containerElement);
		activeContainers.delete(containerElement);
	}

	const field = new FormattedPropertyField(
		plugin,
		containerElement,
		propertyName,
		propertyInputType,
		filePath
	);

	fieldByContainer.set(containerElement, field);
	activeContainers.add(containerElement);
	return field;
}

function disposeDetachedFormattedFields(seenContainers: Set<HTMLElement>): void {
	for (const containerElement of Array.from(activeContainers)) {
		if (seenContainers.has(containerElement))
			continue;

		if (document.body.contains(containerElement))
			continue;

		disposeFormattedField(containerElement);
	}
}
