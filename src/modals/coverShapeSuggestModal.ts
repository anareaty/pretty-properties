import { SuggestModal, TFile, App, FrontMatterCache } from "obsidian";
import { i18n } from "src/localization/localization";
import PrettyPropertiesPlugin from "src/main";
import { setNestedProperty } from "src/utils/propertyUtils";


export class CoverShapeSuggestModal extends SuggestModal<string> {
    shapes: Record<string, string>
    file: TFile
    plugin: PrettyPropertiesPlugin

    constructor(plugin: PrettyPropertiesPlugin, file: TFile) {
        super(plugin.app)
        this.file = file
        this.plugin = plugin
        this.shapes = {
            "initial": i18n.t("INITIAL_DEFAULT_WIDTH"),
            "initial-2": i18n.t("INITIAL_WIDTH_2"),
            "initial-3": i18n.t("INITIAL_WIDTH_3"),
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
            return this.shapes[key]!
                .toLowerCase()
                .includes(query.toLowerCase());
        });
    }
    renderSuggestion(key: string, el: Element) {
        el.append(this.shapes[key]!);
    }
    onChooseSuggestion(key: string) {
        if (key && this.file instanceof TFile) {
            void this.app.fileManager.processFrontMatter(this.file, (fm: FrontMatterCache) => {
                setNestedProperty(fm, this.plugin.settings.coverShapeProperty, key);
            });
        }
    }
}