import { HSL, Modal, Setting } from "obsidian";
import PrettyPropertiesPlugin from "src/main";



export class ColorPickerModal extends Modal {
    plugin: PrettyPropertiesPlugin
    saveCallback: (hsl: HSL, hex: string) => void
    savedColor: string | HSL | undefined

    constructor(
        savedColor: string | HSL | undefined,
        saveCallback: (hsl: HSL, hex: string) => void,
        plugin: PrettyPropertiesPlugin, 
    ) {
        super(plugin.app);
        this.plugin = plugin
        this.savedColor = savedColor
        this.saveCallback = saveCallback
    }
    
    onOpen() {
        this.modalEl.classList.add("color-picker-modal")
        const {contentEl} = this

        new Setting(contentEl)
        .addColorPicker(color => {

            if (this.savedColor) {

                if (typeof this.savedColor == "string") {
                    color.setValue(this.savedColor)
                } else {
                    color.setValueHsl(this.savedColor)
                }
                
            }
            
            color.onChange(async (value) => {
                let hsl = color.getValueHsl()
                this.saveCallback(hsl, value)
            })
        })
    }

    onClose() {
        const {contentEl} = this
        contentEl.empty()
    } 
}