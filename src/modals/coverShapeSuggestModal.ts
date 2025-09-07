import { SuggestModal, TFile, App } from "obsidian";
import { i18n } from "src/localization/localization";


export class CoverShapeSuggestModal extends SuggestModal<string> {
    shapes: any
    file: TFile

    constructor(app: App, file: TFile) {
        super(app)
        this.file = file
        this.shapes = {
            "initial": i18n.t("INITIAL_DEFAULT_WIDTH"),
            "initial-width-2": i18n.t("INITIAL_WIDTH_2"),
            "initial-width-3": i18n.t("INITIAL_WIDTH_3"),
            "vertical-cover": i18n.t("VERTICAL_COVER"),
            "vertical-contain": i18n.t("VERTICAL_CONTAIN"),
            "horizontal-cover": i18n.t("HORIZONTAL_COVER"),
            "horizontal-contain": i18n.t("HORIZONTAL_CONTAIN"),
            square: i18n.t("SQUARE"),
            circle: i18n.t("CIRCLE"),
        };
    }

    getSuggestions(query: string): string[] {
        return Object.keys(this.shapes).filter((key) => {
            return this.shapes[key]
                .toLowerCase()
                .includes(query.toLowerCase());
        });
    }
    async renderSuggestion(key: string, el: Element) {
        el.append(this.shapes[key]);
    }
    onChooseSuggestion(key: string) {
        if (key && this.file instanceof TFile) {
            this.app.fileManager.processFrontMatter(this.file, (fm) => {
                let cssclasses = fm.cssclasses || [];
                cssclasses = cssclasses.filter(
                    (c: string) =>
                        !Object.keys(this.shapes).find(
                            (s) => c == "cover-" + s || c == "cover-vertical" || c == "cover-horizontal"
                        )
                );
                cssclasses.push("cover-" + key);
                fm.cssclasses = cssclasses;
            });
        }
    }
}