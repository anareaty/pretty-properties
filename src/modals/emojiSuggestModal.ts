import { SuggestModal, TFile, App, Editor } from "obsidian";
import Emojilib from "emojilib";
import PrettyPropertiesPlugin from "src/main";
import { setNestedProperty } from "src/utils/propertyUtils";


export class EmojiSuggestModal extends SuggestModal<string> {
    propName: string
    editor?: Editor

    constructor(app: App, plugin: PrettyPropertiesPlugin, editor?: Editor) {
        super(app)
        this.propName = plugin.settings.iconProperty;
        this.editor = editor
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
                if (this.editor) {
                    this.editor.replaceSelection(emoji)
                } else {
                    this.app.fileManager.processFrontMatter(file, (fm) => {
                        setNestedProperty(fm, this.propName, emoji);
                    });
                }
                
            }
        }
    }
}