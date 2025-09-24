import { SuggestModal, TFile, App } from "obsidian";
import Emojilib from "emojilib";
import PrettyPropertiesPlugin from "src/main";


export class EmojiSuggestModal extends SuggestModal<string> {
    propName: string

    constructor(app: App, plugin: PrettyPropertiesPlugin) {
        super(app)
        this.propName = plugin.settings.iconProperty;
    }

    getSuggestions(query: string): string[] {
        return Object.keys(Emojilib).filter((emoji) => {
            let keywords = Emojilib[emoji];
            return keywords.find((keyword) => {
                return keyword
                    .toLowerCase()
                    .includes(query.toLowerCase());
            });
        });
    }
    async renderSuggestion(emoji: string, el: Element) {
        el.createEl("div", { text: emoji });
        el.classList.add("image-suggestion-item");
        el.classList.add("emoji-icon");
    }
    onChooseSuggestion(emoji: string) {
        if (emoji) {
            let file = this.app.workspace.getActiveFile();
            if (file instanceof TFile) {
                this.app.fileManager.processFrontMatter(file, (fm) => {
                    fm[this.propName] = emoji;
                });
            }
        }
    }
}