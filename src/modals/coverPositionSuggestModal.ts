import { SuggestModal, TFile, App } from "obsidian";
import { i18n } from "src/localization/localization";


export class CoverPositionSuggestModal extends SuggestModal<string> {
    positions: any
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
            return this.positions[key]
                .toLowerCase()
                .includes(query.toLowerCase());
        });
    }
    async renderSuggestion(key: string, el: Element) {
        el.append(this.positions[key]);
    }
    onChooseSuggestion(key: string) {
        if (key && this.file instanceof TFile) {
            this.app.fileManager.processFrontMatter(this.file, (fm) => {
                let cssclasses = fm.cssclasses || [];
                cssclasses = cssclasses.filter(
                    (c: string) =>
                        !Object.keys(this.positions).find(
                            (s) => c == "cover-" + s
                        )
                );
                cssclasses.push("cover-" + key);
                fm.cssclasses = cssclasses;
            });
        }
    }
}