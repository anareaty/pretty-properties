import { SuggestModal, App, MarkdownRenderer, TFile, Modal, Setting } from "obsidian";
import PrettyPropertiesPlugin from "./main";
import { i18n } from "./localization";


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