import PrettyPropertiesPlugin from "src/main";
import * as Handlebars from "handlebars";
import justHelpers from 'just-handlebars-helpers';
import { registerCustomHelpers } from "./handlabarsHelpers";

export class PropertyFormatter {
	handlebars: typeof Handlebars;
	compiledCache = new Map<string, Handlebars.TemplateDelegate>();
	
	constructor() {
		this.handlebars = Handlebars.create();
		justHelpers.registerHelpers(this.handlebars);
		registerCustomHelpers(this.handlebars);
	}

	format(
		propertyName: string,
		propertyValue: unknown,
		formatTemplate: string
	): string {
		const compiled = this.getOrCompile(formatTemplate);
		return compiled({propertyName, propertyValue});
	}

	clearCache() {
		this.compiledCache.clear();
	}

	private getOrCompile(formatTemplate: string): Handlebars.TemplateDelegate {
		const cached = this.compiledCache.get(formatTemplate);
		if (cached) return cached;
		const compiled = this.handlebars.compile(formatTemplate, {noEscape: false});
		this.compiledCache.set(formatTemplate, compiled);
		return compiled;
	}

	validateTemplate(formatTemplate: string): string | null {
		try {
			const compiled = this.getOrCompile(formatTemplate);
			compiled({"propertyName": "", "propertyValue": ""});
			return null;
		} catch (e) {
			return e instanceof Error ? e.message : String(e);
		}
	}
}



export const registerPropertyFormatter = (plugin: PrettyPropertiesPlugin, register?: boolean) => {
	if (plugin.formatter) return

	let propertyFormats = plugin.settings.propertyFormats
	let coverFormats = plugin.settings.coverProperties.filter(p => p.format)

	if (register || Object.keys(propertyFormats).length > 0 || coverFormats.length > 0) {
		plugin.formatter = new PropertyFormatter();
	}
}
