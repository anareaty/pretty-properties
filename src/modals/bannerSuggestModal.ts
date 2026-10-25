import { SuggestModal, App, TFile, FrontMatterCache } from "obsidian";
import PrettyPropertiesPlugin from "src/main";
import { i18n } from "src/localization/localization";
import { ImageLinkPrompt } from "./imageLinkPrompt";
import { selectLocalImage } from "src/utils/imageUtils";
import { ColorPickerWithOpasityModal } from "./colorPickerModal";
import { setNestedProperty } from "src/utils/propertyUtils";
import { generateRandomGradient, LinearGradientModal, MeshGradientModal, RadialGradientModal } from "./gradientModal";



export class BannerSuggestModal extends SuggestModal<string> {
    plugin: PrettyPropertiesPlugin
    options: Record<string, string>

    constructor(app: App, plugin: PrettyPropertiesPlugin) {
        super(app)
        this.plugin = plugin
        this.options = {
            image: i18n.t("SELECT_LOCAL_IMAGE"),
            link: i18n.t("ADD_LINK_MANUALLY"),
            color: i18n.t("COLOR"),
            gradient: i18n.t("GRADIENT"),
        };
    }

    getSuggestions(query: string): string[] {
        return Object.keys(this.options).filter((key) => {
            return this.options[key]!
                .toLowerCase()
                .includes(query.toLowerCase());
        });
    }
    renderSuggestion(key: string, el: Element) {
        el.append(this.options[key]!);
    }
    onChooseSuggestion(val: string) {
        if (val == "image") {
            selectLocalImage(
                this.plugin.settings.bannerProperty,
                this.plugin.settings.bannersFolder,
                "banner",
                this.plugin
            );
        }

        if (val == "link") {
            new ImageLinkPrompt(this.app, this.plugin.settings.bannerProperty).open();
        }

        let file = this.plugin.app.workspace.getActiveFile()

        if (file instanceof TFile) {

            let bannerValue = ""
            let cache = this.plugin.app.metadataCache.getFileCache(file)
            if (typeof cache?.frontmatter?.[this.plugin.settings.bannerProperty] == "string") {
                bannerValue = cache?.frontmatter?.[this.plugin.settings.bannerProperty] as string
            }

            
            if (val == "color") {
                new ColorPickerWithOpasityModal(bannerValue, (hex: string) => {
                    if (file instanceof TFile) {
                        void this.plugin.app.fileManager.processFrontMatter(file, (fm: FrontMatterCache) => {
                            setNestedProperty(fm, this.plugin.settings.bannerProperty, hex);
                        });
                    }
                }, this.plugin).open()
            }


            if (val == "gradient") {
                new GradientTypeSuggestModal(this.plugin.app, this.plugin).open()
            }

        }

        
    }
}












class GradientTypeSuggestModal extends SuggestModal<string> {
    plugin: PrettyPropertiesPlugin
    options: Record<string, string>

    constructor(app: App, plugin: PrettyPropertiesPlugin) {
        super(app);
        this.plugin = plugin;
        this.options = {
        linear: i18n.t("LINEAR"),
        radial: i18n.t("RADIAL"),
        mesh: i18n.t("MESH"),
        random: i18n.t("RANDOM")
        };
    }
    getSuggestions(query: string): string[] {
        return Object.keys(this.options).filter((key) => {
        return this.options[key]!.toLowerCase().includes(query.toLowerCase());
        });
    }
    renderSuggestion(key: string, el: Element) {
        el.append(this.options[key]!);
    }
    onChooseSuggestion(val: string) {
        let file = this.plugin.app.workspace.getActiveFile();
        if (file instanceof TFile) {
        let bannerValue = "";
        let cache = this.plugin.app.metadataCache.getFileCache(file);
        if (typeof cache?.frontmatter?.[this.plugin.settings.bannerProperty] == "string") {
            bannerValue = cache.frontmatter[this.plugin.settings.bannerProperty] as "string"
        }

        const saveCalback = (newValue: string) => {
            if (file instanceof TFile) {
            void this.plugin.app.fileManager.processFrontMatter(file, (fm: FrontMatterCache) => {
                setNestedProperty(fm, this.plugin.settings.bannerProperty, newValue);
            });
            }
        }
        
        if (val == "linear") {
            new LinearGradientModal(this.plugin, bannerValue, saveCalback).open();
        }

        else if (val == "radial") {
            new RadialGradientModal(this.plugin, bannerValue, saveCalback).open();
        }

        else if (val == "mesh") {
            new MeshGradientModal(this.plugin, bannerValue, saveCalback).open();
        }

        else if (val == "random") {
            let newValue = generateRandomGradient()

            if (newValue) {
                void this.plugin.app.fileManager.processFrontMatter(file, (fm: FrontMatterCache) => {
                    setNestedProperty(fm, this.plugin.settings.bannerProperty, newValue);
                });
            }
        }


        }
    }
}