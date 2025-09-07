import { SuggestModal, TFile, getIcon, getIconIds, App } from "obsidian";
import PrettyPropertiesPlugin from "src/main";


export class SvgSuggestModal extends SuggestModal<string> {
    propName: string
    iconIds: string[]

    constructor(app: App, plugin: PrettyPropertiesPlugin) {
        super(app)
        this.propName = plugin.settings.iconProperty;
        this.iconIds = getIconIds();
    }

    getSuggestions(query: string): string[] {
        return this.iconIds.filter((val) => {
            return val.toLowerCase().includes(query.toLowerCase());
        });
    }
    async renderSuggestion(id: string, el: Element) {
        let svg = getIcon(id) || "";
        el.append(svg);
        el.classList.add("image-suggestion-item");
        el.classList.add("svg-icon");
    }
    onChooseSuggestion(id: string) {
        if (id) {
            let file = this.app.workspace.getActiveFile();
            if (file instanceof TFile) {
                this.app.fileManager.processFrontMatter(file, (fm) => {
                    fm[this.propName] = id;
                });
            }
        }
    }
}