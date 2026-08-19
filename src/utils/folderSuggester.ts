import { AbstractInputSuggest, App, TFolder } from "obsidian";

export class FolderSuggest extends AbstractInputSuggest<string> {

	protected getSuggestions(query: string): string[] {
		const querySanitized = query.trim().toLowerCase();
		const folders: string[] = [];

		for (let file of this.app.vault.getAllLoadedFiles()) {
			if (file instanceof TFolder && file.path != "/") {
				folders.push(file.path);
			}
		}

		if (!querySanitized) return folders.sort((a, b) => a.localeCompare(b));

		return folders
			.filter((f) => f.toLowerCase().includes(querySanitized))
			.sort((a, b) => a.localeCompare(b));
	}

	renderSuggestion(value: string, el: HTMLElement): void {
		el.setText(value);
	}
}
