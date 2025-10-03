import { Modal, App, Setting } from "obsidian";
import PrettyPropertiesPlugin from "src/main";
import { updateAllPills } from "src/utils/updates/updatePills";
import { updateRelativeDateColors } from "src/utils/updates/updateStyles";


export class ColorPickerModal extends Modal {
    plugin: PrettyPropertiesPlugin
    propVal: string | any
    colorList: string
    colorType: string

    constructor(app: App, plugin: PrettyPropertiesPlugin, propVal: string, colorList: string, colorType: string) {
        super(app);
        this.propVal = propVal
        this.plugin = plugin
        this.colorList = colorList
        this.colorType = colorType
    }
    
    onOpen() {
        this.modalEl.classList.add("color-picker-modal")
        const {contentEl} = this

        new Setting(contentEl)
        .addColorPicker(color => {
            //@ts-ignore
            if (this.propVal && this.plugin.settings[this.colorList][this.propVal]?.[this.colorType]?.h !== undefined) {
                //@ts-ignore
                color.setValueHsl(this.plugin.settings[this.colorList][this.propVal][this.colorType])
            }
            
            color.onChange((value) => {
                let hsl = color.getValueHsl()
                //@ts-ignore
                if (!this.plugin.settings[this.colorList][this.propVal]) {
                    //@ts-ignore
                    this.plugin.settings[this.colorList][this.propVal] = {
                      pillColor: "default",
                      textColor: "default"
                    }
                  }


                //@ts-ignore
                this.plugin.settings[this.colorList][this.propVal][this.colorType] = hsl
                this.plugin.saveSettings()
                updateAllPills(this.plugin)
                if (this.colorList == "dateColors") {
                    updateRelativeDateColors(this.plugin)
                }
            })
        })
    }

    onClose() {
        const {contentEl} = this
        contentEl.empty()
    } 
}