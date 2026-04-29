import * as Handlebars from "handlebars";
import { getLanguage } from "obsidian";
import PrettyPropertiesPlugin from "src/main";




export class PropertyFormatter {
	private readonly compiledCache = new Map<string, Handlebars.TemplateDelegate>();
	private readonly handlebars: typeof Handlebars;

	constructor() {


		this.handlebars = Handlebars.create();

		const helperFactory = require("@budibase/handlebars-helpers");
		helperFactory({handlebars: this.handlebars});

		var momentHelper = require("./handlebars_moment");
		
		momentHelper.registerHelpers(this.handlebars);



		



		this.registerCustomHelpers();
	}

	private registerCustomHelpers() {



		const dayjs = require("dayjs");
		const durationPlugin = require("dayjs/plugin/duration");
		const relativeTimePlugin = require("dayjs/plugin/relativeTime");
		const utcPlugin = require("dayjs/plugin/utc");

		let locale: string
		if (getLanguage) locale = getLanguage();
		else locale = window.localStorage.language;

		let loadLocales: Record<string, any> = {
			"am": () => {require('dayjs/locale/am')},
			"ar": () => {require('dayjs/locale/ar')},
			"be": () => {require('dayjs/locale/be')},
			"bn": () => {require('dayjs/locale/bn')},
			"ca": () => {require('dayjs/locale/ca')},
			"cs": () => {require('dayjs/locale/cs')},
			"da": () => {require('dayjs/locale/da')},
			"de": () => {require('dayjs/locale/de')},
			"en": () => {require('dayjs/locale/en')},
			"en-GB": () => {require('dayjs/locale/en-gb')},
			"es": () => {require('dayjs/locale/es')},
			"fa": () => {require('dayjs/locale/fa')},
			"fi": () => {require('dayjs/locale/fi')},
			"fr": () => {require('dayjs/locale/fr')},
			"ga": () => {require('dayjs/locale/ga')},
			"he": () => {require('dayjs/locale/he')},
			"hu": () => {require('dayjs/locale/hu')},
			"id": () => {require('dayjs/locale/id')},
			"it": () => {require('dayjs/locale/it')},
			"ja": () => {require('dayjs/locale/ja')},
			"ka": () => {require('dayjs/locale/ka')},
			"ko": () => {require('dayjs/locale/ko')},
			"lv": () => {require('dayjs/locale/lv')},
			"ms": () => {require('dayjs/locale/ms')},
			"ne": () => {require('dayjs/locale/ne')},
			"nl": () => {require('dayjs/locale/nl')},
			"pl": () => {require('dayjs/locale/pl')},
			"pt": () => {require('dayjs/locale/pt')},
			"pt-BR": () => {require('dayjs/locale/pt-br')},
			"ro": () => {require('dayjs/locale/ro')},
			"ru": () => {require('dayjs/locale/ru')},
			"sk": () => {require('dayjs/locale/sk')},
			"sq": () => {require('dayjs/locale/sq')},
			"sr": () => {require('dayjs/locale/sr')},
			"sv": () => {require('dayjs/locale/sv')},
			"th": () => {require('dayjs/locale/th')},
			"tr": () => {require('dayjs/locale/tr')},
			"uk": () => {require('dayjs/locale/uk')},
			"uz": () => {require('dayjs/locale/uz')},
			"vi": () => {require('dayjs/locale/vi')},
			"zh": () => {require('dayjs/locale/zh')},
			"zh-TW": () => {require('dayjs/locale/zh-tw')},
		}

		if (locale && loadLocales[locale]) {
			loadLocales[locale]()
			dayjs.locale(locale)
		}


		dayjs.extend(durationPlugin);
		dayjs.extend(relativeTimePlugin);
		dayjs.extend(utcPlugin);

		this.handlebars.registerHelper("durationHumanized", (time: number, unit: string, withSuffixOrOptions?: boolean | Handlebars.HelperOptions) => {
			const withSuffix = typeof withSuffixOrOptions === "boolean" ? withSuffixOrOptions : false;
			return dayjs.duration(time, unit).humanize(withSuffix);
		});
		this.handlebars.registerHelper("durationFormatted", (time: number, unit: string, formatOrOptions?: string | Handlebars.HelperOptions) => {
			const format = typeof formatOrOptions === "string" ? formatOrOptions : "HH:mm:ss";
			return dayjs.duration(time, unit).format(format);
		});

		this.handlebars.registerHelper(
			"durationAbbreviated",
			(time: number, unit: string) => {
				const duration = dayjs.duration(time, unit);

				const parts: string[] = [];
				if (duration.years() > 0) parts.push(`${duration.years()}y`);
				if (duration.months() > 0) parts.push(`${duration.months()}mo`);
				if (duration.weeks() > 0) parts.push(`${duration.weeks()}w`);
				if (duration.days() > 0) parts.push(`${duration.days()}d`);
				if (duration.hours() > 0) parts.push(`${duration.hours()}h`);
				if (duration.minutes() > 0) parts.push(`${duration.minutes()}m`);
				if (duration.seconds() > 0) parts.push(`${duration.seconds()}s`);
				if (duration.milliseconds() > 0 || parts.length === 0) parts.push(`${duration.milliseconds()}ms`);

				return parts.join(" ");
			}
		);








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
		
		if (cached)
			return cached;

		
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

	if (register || propertyFormats.length > 0 || coverFormats.length > 0) {
		plugin.formatter = new PropertyFormatter();
	}
}
