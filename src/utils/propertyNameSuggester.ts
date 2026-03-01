import { AbstractInputSuggest } from "obsidian";

type PropertyInfo = { name: string; widget: string; };

export class PropertyNameSuggest extends AbstractInputSuggest<string> {
	private allowedTypes?: Set<string>;

	constructor(app: any, inputEl: HTMLInputElement, allowedTypes?: Iterable<string>) {
		super(app, inputEl);
		if (allowedTypes)
			this.allowedTypes = new Set(allowedTypes);
	}

	protected  getSuggestions(query: string): string[] {
		const querySanitized = query.trim().toLowerCase();
		const allAllowedPropertyNames = this.getAllPropertyNamesRestricted(this.allowedTypes);

		if (!querySanitized)
			return allAllowedPropertyNames;

		return allAllowedPropertyNames.filter((p) => p.toLowerCase().includes(querySanitized));
	}

	renderSuggestion(value: string, el: HTMLElement): void {
		el.setText(value);
	}

	private getAllPropertyNamesRestricted(allowedTypes: Set<string> | undefined): string[] {
		const cacheAny = this.app.metadataCache as any;
		if (typeof cacheAny.getAllPropertyInfos === "function") {
			const infos = cacheAny.getAllPropertyInfos() as Record<string,PropertyInfo>;
			console.log(infos);
			const names = Object.values(infos)
				.filter((p): p is PropertyInfo => !allowedTypes || allowedTypes.has(p?.widget))
				.map((p) => p?.name)
				.filter((n): n is string => typeof n === "string" && n.length > 0);

			return Array.from(new Set(names)).sort((a, b) => a.localeCompare(b));
		}

		return[];
	}
}
