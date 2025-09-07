import { TFile, App, Modal, Setting } from "obsidian";
import { i18n } from "src/localization/localization";


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