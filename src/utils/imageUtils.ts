
import { SuggestModal, TFile, App, Modal, Setting, MarkdownRenderer } from "obsidian";
import PrettyPropertiesPlugin from "src/main";
import { i18n } from "src/localization";
import { selectCoverImage } from "./coverUtils";
import { selectIcon } from "./iconUtils";



export class ImageLinkPrompt extends Modal {
    propName: string
    result: string

    constructor(app: App, propName: string) {
        super(app);
        this.eventInput = this.eventInput.bind(this)
        this.propName = propName
        this.result = ""
    }

    eventInput(e: KeyboardEvent) {
        if (e.key === "Enter") {
            e.preventDefault();
            this.close()
        }
    }
    
    onOpen() {
        const {contentEl} = this
    

        let promptSetting = new Setting(contentEl)
        .setName(i18n.t("LINK_TO_EXTERNAL_IMAGE"))
        .addText(text => text
            .setValue(this.result)
            .onChange((value) => {
                this.result = value
            })
        )
        .addButton(btn => btn
            .setButtonText(i18n.t("SAVE"))
            .setCta()
            .onClick(() => {
                this.close()
            })
        )
    
        promptSetting.settingEl.classList.add("prompt-setting")
        contentEl.addEventListener("keydown", this.eventInput)
    }

    onClose() {
        const {contentEl} = this
        contentEl.empty()
        this.contentEl.removeEventListener("keydown", this.eventInput) 
        
        if (this.result && this.result.startsWith("http")) {
            let file = this.app.workspace.getActiveFile()
            if (file instanceof TFile) {
                this.app.fileManager.processFrontMatter(file, fm => {
                    fm[this.propName] = this.result
                })
            }
        }
    } 
}

class FileImageSuggestModal extends SuggestModal<string> {
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
            selectImage(
                this.plugin.settings.bannerProperty,
                this.plugin.settings.bannersFolder,
                "banner",
                this.plugin
            );
        }
        if (val == "icon") {
            selectIcon(this.plugin);
        }
    }
}



class ImageSuggestModal extends SuggestModal<string> {

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


export const selectImageForFile = async (plugin: PrettyPropertiesPlugin) => {
    new FileImageSuggestModal(plugin.app, plugin).open();
}


export const selectImage = async (propName: string, folder: string, shape: string, plugin: PrettyPropertiesPlugin) => {
    new ImageSuggestModal(plugin.app, plugin, propName, folder, shape).open();
}


export const selectLocalImage = async (propName: string, folder: string, shape: string, plugin: PrettyPropertiesPlugin) => {
    let file = plugin.app.workspace.getActiveFile();
    if (file instanceof TFile) {
        let formats = [
            "avif",
            "bmp",
            "gif",
            "jpeg",
            "jpg",
            "png",
            "svg",
            "webp",
        ];
        let files = plugin.app.vault.getFiles();
        files = files.filter((f: TFile) => formats.find((e) => e == f.extension));

        let imageFiles = files;
        if (folder) {
            imageFiles = files.filter((f) => {
                return (
                    f.parent!.path == folder ||
                    f.parent!.path.startsWith(folder + "/")
                );
            });
        }

        let imagePaths = imageFiles.map((f) => f.path);
        let imageNames = imageFiles.map((f) => f.basename);

        new LocalImageSuggestModal(
            plugin.app,
            plugin,
            propName,
            shape,
            imagePaths,
            imageNames
        ).open();
    }
}



export class LocalImageSuggestModal extends SuggestModal<string> {
    plugin: PrettyPropertiesPlugin
	values: string[] 
	names?: string[]
    shape: string
    propName: string
	constructor(app: App, plugin: PrettyPropertiesPlugin, propName: string, shape: string, values: string[], names?: string[]) {
	  super(app);
	  this.plugin = plugin;
	  this.values = values
	  this.names = names 
      this.shape = shape
      this.propName = propName
	}

    getSuggestions(query:string): string[] {
        return this.values.filter((val) => {
            return val.toLowerCase().includes(query.toLowerCase())
        });
    }
    async renderSuggestion(val: string, el: Element) {
        let path = val
        let nameParts = val.split("/")
        let name = nameParts[nameParts.length - 1].replace(/(.*)(\.[^\.]+)$/, "$1")
        if (this.names) {
            name = this.names[this.values.indexOf(val)]
        }
        let file = this.app.vault.getAbstractFileByPath(path)
        if (file instanceof TFile) {
            let link = this.app.fileManager.generateMarkdownLink(file, "")
            let image = document.createElement("div")
            await MarkdownRenderer.render(this.app, link, image, "", this.plugin)
            el.classList.add("image-suggestion-item")
            el.classList.add(this.shape)
            image.append(name)
            el.append(image)
        } else {
            el.append(name)
        }
        
    }
    onChooseSuggestion(imagePath: string) {
        if (imagePath) {
            let imageFile = this.app.vault.getAbstractFileByPath(imagePath)
            let file = this.app.workspace.getActiveFile()

            if (imageFile instanceof TFile && file instanceof TFile) {
                let imageLink = this.app.fileManager.generateMarkdownLink(imageFile, "").replace(/^\!/, "")
                this.app.fileManager.processFrontMatter(file, fm => {
                    fm[this.propName] = imageLink
                })
            }
        }
    } 
}