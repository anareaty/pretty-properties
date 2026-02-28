import { AbstractInputSuggest } from "obsidian";

export class PropertyNameSuggest extends AbstractInputSuggest<string> {
	protected  getSuggestions(query: string): string[] {
		const querySanitized = query.trim().toLowerCase();
		const allPropertyNames = this.getAllPropertyNames();

		if (!querySanitized)
			return allPropertyNames;

		return allPropertyNames.filter((p) => p.toLowerCase().includes(querySanitized));
	}

	renderSuggestion(value: string, el: HTMLElement): void {
		el.setText(value);
	}

	private getAllPropertyNames(): string[] {
		const cacheAny = this.app.metadataCache as any;
		if (typeof cacheAny.getAllPropertyInfos === "function") {
			const infos = cacheAny.getAllPropertyInfos() as Record<string,{ name?: string }>;
			const names = Object.values(infos)
				.map((p) => p?.name)
				.filter((n): n is string => typeof n === "string" && n.length > 0);

			return Array.from(new Set(names)).sort((a, b) => a.localeCompare(b));
		}

		return[];
	}
}
