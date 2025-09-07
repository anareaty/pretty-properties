import { SuggestModal, TFile, getIcon, getIconIds, App } from "obsidian";
import Emojilib from "emojilib";
import PrettyPropertiesPlugin from "src/main";
import { i18n } from "src/localization";
import { ImageLinkPrompt } from "./imageUtils";
import { selectLocalImage } from "./imageUtils";


class SvgSuggestModal extends SuggestModal<string> {
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



class EmojiSuggestModal extends SuggestModal<string> {
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



class IconSuggestModal extends SuggestModal<string> {
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
            selectIconSvg(this.plugin);
        }
        if (val == "emoji") {
            selectIconEmoji(this.plugin);
        }
    }
}



const selectIconSvg = async (plugin: PrettyPropertiesPlugin) => {
    new SvgSuggestModal(plugin.app, plugin).open();
}

const selectIconEmoji = async (plugin: PrettyPropertiesPlugin) => {
    new EmojiSuggestModal(plugin.app, plugin).open();
}

export const selectIcon = async (plugin: PrettyPropertiesPlugin) => {
    new IconSuggestModal(plugin.app, plugin).open();
}