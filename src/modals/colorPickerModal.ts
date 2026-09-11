import { Modal, Setting } from "obsidian";
import PrettyPropertiesPlugin from "src/main";
import { PillColorSettings } from "src/settings/settings";



export class ColorPickerModal extends Modal {
    plugin: PrettyPropertiesPlugin
    colorType: string
    pillColorSettings: PillColorSettings | undefined
    saveCallback: (pillColorSettings: PillColorSettings | undefined) => void

    constructor(
        colorType: string,
        pillColorSettings: PillColorSettings | undefined,
        saveCallback: (pillColorSettings: PillColorSettings | undefined) => void,
        plugin: PrettyPropertiesPlugin, 
    ) {
        super(plugin.app);
        this.plugin = plugin
        this.colorType = colorType
        this.pillColorSettings = pillColorSettings
        this.saveCallback = saveCallback
    }
    
    onOpen() {
        this.modalEl.classList.add("color-picker-modal")
        const {contentEl} = this

        new Setting(contentEl)
        .addColorPicker(color => {

            if (this.pillColorSettings && (this.colorType == "pillColor" || this.colorType == "textColor")) {
                let savedColor = this.pillColorSettings[this.colorType]

                if (savedColor && typeof savedColor != "string") {
                    color.setValueHsl(savedColor)
                }
            }
            
            color.onChange(async (value) => {
                let hsl = color.getValueHsl()
            
                if (!this.pillColorSettings) {
                    this.pillColorSettings = {
                      pillColor: "default",
                      textColor: "default"
                    }
                }

                if (this.colorType == "pillColor" || this.colorType == "textColor") {
                    this.pillColorSettings[this.colorType] = hsl
                }

                this.saveCallback(this.pillColorSettings)
            })
        })
    }

    onClose() {
        const {contentEl} = this
        contentEl.empty()
    } 
}