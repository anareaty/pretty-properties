import * as Handlebars from "handlebars";
import { getLanguage } from "obsidian";
import PrettyPropertiesPlugin from "src/main";

import dayjs from "dayjs"
import durationPlugin, { DurationUnitType } from "dayjs/plugin/duration"
import relativeTimePlugin from "dayjs/plugin/relativeTime"
import utcPlugin from "dayjs/plugin/utc"

import am from 'dayjs/locale/am'
import ar from 'dayjs/locale/ar'
import be from 'dayjs/locale/be'
import bn from 'dayjs/locale/bn'
import ca from 'dayjs/locale/ca'
import cs from 'dayjs/locale/cs'
import da from 'dayjs/locale/da'
import de from 'dayjs/locale/de'
import en from 'dayjs/locale/en'
import enGB from 'dayjs/locale/en-gb'
import es from 'dayjs/locale/es'
import fa from 'dayjs/locale/fa'
import fi from 'dayjs/locale/fi'
import fr from 'dayjs/locale/fr'
import ga from 'dayjs/locale/ga'
import he from 'dayjs/locale/he'
import hu from 'dayjs/locale/hu'
import id from 'dayjs/locale/id'
import it from 'dayjs/locale/it'
import ja from 'dayjs/locale/ja'
import ka from 'dayjs/locale/ka'
import ko from 'dayjs/locale/ko'
import lv from 'dayjs/locale/lv'
import ms from 'dayjs/locale/ms'
import ne from 'dayjs/locale/ne'
import nl from 'dayjs/locale/nl'
import pl from 'dayjs/locale/pl'
import pt from 'dayjs/locale/pt'
import ptBR from 'dayjs/locale/pt-br'
import ro from 'dayjs/locale/ro'
import ru from 'dayjs/locale/ru'
import sk from 'dayjs/locale/sk'
import sq from 'dayjs/locale/sq'
import sr from 'dayjs/locale/sr'
import sv from 'dayjs/locale/sv'
import th from 'dayjs/locale/th'
import tr from 'dayjs/locale/tr'
import uk from 'dayjs/locale/uk'
import uz from 'dayjs/locale/uz'
import vi from 'dayjs/locale/vi'
import zh from 'dayjs/locale/zh'
import zhTW from 'dayjs/locale/zh-tw'

import * as hb from "src/utils/handlebars_moment.cjs"

//@ts-expect-error, no typings
import helperFactory from "@budibase/handlebars-helpers"



interface HBHelperImport {
	default: {registerHelpers: (hbars: typeof Handlebars) => void}
}




const locales: Record<string, ILocale> = {
	am, ar, be, bn, ca, cs, da, de, en, "en-GB" : enGB,
	es, fa, fi, fr, ga, he, hu, id, it, ja, ka, ko, 
	lv, ms, ne, nl, pl, pt, "pt-BR": ptBR, ro, ru, 
	sk, sq, sr, sv, th, tr, uk, uz, vi, zh,"zh-TW": zhTW,
}





type HelperFactory = (obj: {handlebars: typeof Handlebars}) => void
export class PropertyFormatter {
	private readonly compiledCache = new Map<string, Handlebars.TemplateDelegate>();
	private readonly handlebars: typeof Handlebars;

	constructor() {


		this.handlebars = Handlebars.create();
		(helperFactory as HelperFactory)({handlebars: this.handlebars});
		let momentHelper = (hb as HBHelperImport).default
		momentHelper.registerHelpers(this.handlebars);
		this.registerCustomHelpers();
	}

	private registerCustomHelpers() {
		let locale: string
		if (getLanguage) locale = getLanguage();
		else locale = window.localStorage.language as string

		if (locale && locales[locale]) {
			dayjs.locale(locale)
		}

		dayjs.extend(durationPlugin);
		dayjs.extend(relativeTimePlugin);
		dayjs.extend(utcPlugin);

		this.handlebars.registerHelper("durationHumanized", (
			time: number, 
			unit: DurationUnitType | undefined, 
			withSuffixOrOptions?: boolean | Handlebars.HelperOptions
		) => {
			const withSuffix = typeof withSuffixOrOptions === "boolean" ? withSuffixOrOptions : false;
			return dayjs.duration(time, unit).humanize(withSuffix);
		});

		this.handlebars.registerHelper("durationFormatted", (
			time: number, 
			unit: DurationUnitType | undefined, 
			formatOrOptions?: string | Handlebars.HelperOptions
		) => {
			const format = typeof formatOrOptions === "string" ? formatOrOptions : "HH:mm:ss";
			return dayjs.duration(time, unit).format(format);
		});

		this.handlebars.registerHelper("durationAbbreviated", (
			time: number, 
			unit: DurationUnitType | undefined
		) => {
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
		});
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
