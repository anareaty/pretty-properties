import { SuggestModal, TFile, getIcon, getIconIds, App, FrontMatterCache } from "obsidian";
import PrettyPropertiesPlugin from "src/main";
import { setNestedProperty } from "src/utils/propertyUtils";


export class SvgSuggestModal extends SuggestModal<string> {
    propName: string
    iconIds: string[]
    plugin: PrettyPropertiesPlugin

    constructor(app: App, plugin: PrettyPropertiesPlugin) {
        super(app)
        this.propName = plugin.settings.iconProperty;
        this.iconIds = getIconIds();
        this.plugin = plugin
    }

    getSuggestions(query: string): string[] {
        return this.iconIds.filter((val) => {
            return val.toLowerCase().includes(query.toLowerCase());
        });
    }
    renderSuggestion(id: string, el: Element) {
        let svg = getIcon(id) || "";
        el.append(svg);
        el.classList.add("image-suggestion-item");
        el.classList.add("svg-icon");
    }
    onChooseSuggestion(id: string) {
        if (id) {
            if (this.plugin.settings.stripLucidePrefix) {
                id = id.replace(/^lucide-/, "")
            }
            let file = this.app.workspace.getActiveFile();
            if (file instanceof TFile) {
                void this.app.fileManager.processFrontMatter(file, (fm: FrontMatterCache) => {
                    setNestedProperty(fm, this.propName, id);
                });
            }
        }
    }
}