import * as Handlebars from "handlebars";

export class PropertyFormatter {
	private readonly compiledCache = new Map<string, Handlebars.TemplateDelegate>();
	private readonly handlebars: typeof Handlebars;

	constructor() {
		this.handlebars = Handlebars.create();

		const helperFactory = require("@budibase/handlebars-helpers");
		helperFactory({handlebars: this.handlebars});

		var momentHelper = require("handlebars.moment");
		momentHelper.registerHelpers(this.handlebars);

		this.registerCustomHelpers();
	}

	private registerCustomHelpers() {
		const dayjs = require("dayjs");
		const durationPlugin = require("dayjs/plugin/duration");
		const relativeTimePlugin = require("dayjs/plugin/relativeTime");
		const utcPlugin = require("dayjs/plugin/utc");

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
