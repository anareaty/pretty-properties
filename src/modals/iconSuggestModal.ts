import { SuggestModal, App } from "obsidian";
import PrettyPropertiesPlugin from "src/main";
import { i18n } from "src/localization/localization";
import { ImageLinkPrompt } from "./imageLinkPrompt";
import { selectLocalImage } from "src/utils/imageUtils";
import { SvgSuggestModal } from "./svgSuggestModal";
import { EmojiSuggestModal } from "./emojiSuggestModal";



export class IconSuggestModal extends SuggestModal<string> {
    plugin: PrettyPropertiesPlugin
    options: any

    constructor(app: App, plugin: PrettyPropertiesPlugin) {
        super(app)
        this.plugin = plugin
        this.options = {
            image: i18n.t("LOCAL_IMAGE"),
            link: i18n.t("EXTERNAL_IMAGE"),
            svg: i18n.t("LUCIDE_ICON"),
            emoji: i18n.t("EMOJI"),
        };
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
        let iconProperty = this.plugin.settings.iconProperty;
        if (val == "image") {
            selectLocalImage(
                iconProperty,
                this.plugin.settings.iconsFolder,
                "icon",
                this.plugin
            );
        }
        if (val == "link") {
            new ImageLinkPrompt(this.app, iconProperty).open();
        }
        if (val == "svg") {
            new SvgSuggestModal(this.plugin.app, this.plugin).open();
        }
        if (val == "emoji") {
            new EmojiSuggestModal(this.plugin.app, this.plugin).open();
        }
    }
}
