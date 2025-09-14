import { Modal, App, Setting } from "obsidian";
import PrettyPropertiesPlugin from "src/main";
import { updateAllPills } from "src/utils/updates/updatePills";


export class ColorPickerModal extends Modal {
    plugin: PrettyPropertiesPlugin
    propVal: string | any
    colorList: string

    constructor(app: App, plugin: PrettyPropertiesPlugin, propVal: string, colorList: string) {
        super(app);
        this.propVal = propVal
        this.plugin = plugin
        this.colorList = colorList
    }
    
    onOpen() {
        this.modalEl.classList.add("color-picker-modal")
        const {contentEl} = this

        new Setting(contentEl)
        .addColorPicker(color => {
            
            if (this.propVal.h) {
                //@ts-ignore
                color.setValueHsl(this.plugin.settings[this.colorList][this.propVal])
            }
            
            color.onChange((value) => {
                let hsl = color.getValueHsl()
                //@ts-ignore
                this.plugin.settings[this.colorList][this.propVal] = hsl
                this.plugin.saveSettings()
                updateAllPills(this.plugin)
            })
        })
    }

    onClose() {
        const {contentEl} = this
        contentEl.empty()
    } 
}