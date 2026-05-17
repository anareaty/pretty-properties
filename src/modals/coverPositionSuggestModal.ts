import { SuggestModal, TFile, App, FrontMatterCache } from "obsidian";
import { i18n } from "src/localization/localization";


export class CoverPositionSuggestModal extends SuggestModal<string> {
    positions: Record<string, string>
    file: TFile

    constructor(app: App, file: TFile) {
        super(app)
        this.file = file
        this.positions = {
            "left": i18n.t("LEFT"),
            "right": i18n.t("RIGHT"),
            "top": i18n.t("TOP"),
            "bottom": i18n.t("BOTTOM"),
        };
    }

    getSuggestions(query: string): string[] {
        return Object.keys(this.positions).filter((key) => {
            return this.positions[key]!
                .toLowerCase()
                .includes(query.toLowerCase());
        });
    }
    renderSuggestion(key: string, el: Element) {
        el.append(this.positions[key]!);
    }
    onChooseSuggestion(key: string) {
        if (key && this.file instanceof TFile) {
            void this.app.fileManager.processFrontMatter(this.file, (fm: FrontMatterCache) => {
                fm.cover_position = key
            });
        }
    }
}