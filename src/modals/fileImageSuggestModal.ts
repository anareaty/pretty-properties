import { SuggestModal, App } from "obsidian";
import PrettyPropertiesPlugin from "src/main";
import { i18n } from "src/localization/localization";
import { selectCoverImage } from "src/utils/imageUtils";
import { ImageSuggestModal } from "./imageSuggestModal";
import { IconSuggestModal } from "./iconSuggestModal";




export class FileImageSuggestModal extends SuggestModal<string> {
    plugin: PrettyPropertiesPlugin
    options: any

    constructor(app: App, plugin: PrettyPropertiesPlugin) {
        super(app)
        this.plugin = plugin
        this.options = {};
        if (plugin.settings.enableCover && plugin.settings.coverProperty) {
            this.options["cover"] = i18n.t("SELECT_COVER_IMAGE");
        }
        if (plugin.settings.enableBanner && plugin.settings.bannerProperty) {
            this.options["banner"] = i18n.t("SELECT_BANNER_IMAGE");
        }
        if (plugin.settings.enableIcon && plugin.settings.iconProperty) {
            this.options["icon"] = i18n.t("SELECT_ICON");
        }
    }

    getSuggestions(query: string): string[] {
        return Object.keys(this.options).filter((key) => {
            return this.options[key]
                .toLowerCase()
                .includes(query.toLowerCase());
        });
    }
    async renderSuggestion(key: string, el: Element) {
        el.append(this.options[key]);
    }
    onChooseSuggestion(val: string) {
        if (val == "cover") {
            selectCoverImage(this.plugin);
        }
        if (val == "banner") {
            new ImageSuggestModal(
                this.plugin.app, 
                this.plugin, 
                this.plugin.settings.bannerProperty, 
                this.plugin.settings.bannersFolder, 
                "banner"
            ).open();
        }
        if (val == "icon") {
            new IconSuggestModal(this.plugin.app, this.plugin).open();
        }
    }
}