import { SuggestModal, TFile, App, Modal, Setting, MarkdownRenderer } from "obsidian";
import PrettyPropertiesPlugin from "src/main";
import { i18n } from "src/localization/localization";
import { ImageLinkPrompt } from "src/modals/imageLinkPrompt";
import { selectLocalImage } from "src/utils/imageUtils";


export class ImageSuggestModal extends SuggestModal<string> {

    plugin: PrettyPropertiesPlugin
    options: any
    propName: string 
    folder: string 
    shape: string

    constructor(app: App, plugin: PrettyPropertiesPlugin, propName: string, folder: string, shape: string) {
        super(app)
        this.plugin = plugin
        this.propName = propName
        this.folder = folder
        this.shape = shape
        this.options = {
            image: i18n.t("LOCAL_IMAGE"),
            link: i18n.t("EXTERNAL_IMAGE"),
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
        if (val == "image") {
            selectLocalImage(this.propName, this.folder, this.shape, this.plugin);
        }
        if (val == "link") {
            new ImageLinkPrompt(this.app, this.propName).open();
        }
    }
}