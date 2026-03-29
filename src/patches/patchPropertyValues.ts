import PrettyPropertiesPlugin from "../main";
import { MarkdownView } from "obsidian";
import {FormattedPropertyField} from "../utils/propertyFormatting/formattedPropertyField";

export type SupportedPropertyInputType = "text" | "number" | "date" | "datetime";

export const INPUT_SELECTORS: Record<SupportedPropertyInputType, string> = {
	text: ".metadata-input-longtext",
	number: ".metadata-input-number",
	date: ".metadata-input.metadata-input-text.mod-date",
	datetime: ".metadata-input.metadata-input-text.mod-datetime",
};

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

export function isSupportedPropertyInputType(type: string): type is SupportedPropertyInputType {
	return type in INPUT_SELECTORS;
}

export function readPropertyName(rowElement: HTMLElement): string {
	return (
		rowElement.getAttribute("data-property-key")?.trim() ||
		(rowElement as any).dataset?.propertyKey?.trim() ||
		rowElement.querySelector<HTMLElement>(".metadata-property-key")?.textContent?.trim() ||
		""
	);
}

export function detectPropertyInputType(rowElement: HTMLElement): SupportedPropertyInputType | null {
	for (const [type, selector] of Object.entries(INPUT_SELECTORS) as Array<[SupportedPropertyInputType, string]>) {
		if (rowElement.querySelector(selector))
			return type;
	}

	return null;
}

export function findPropertyValueContainer(rowElement: HTMLElement): HTMLElement {
	return (
		rowElement.querySelector<HTMLElement>(".metadata-property-value") ??
		rowElement.querySelector<HTMLElement>(".metadata-property-value-container") ??
		rowElement
	);
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
