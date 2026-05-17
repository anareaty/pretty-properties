import { Modal, App, Setting } from "obsidian";
import PrettyPropertiesPlugin from "src/main";
import { PillColorSettings } from "src/settings/settings";
import { updateAllProperties } from "src/utils/updates/updateElements";
import { updateRelativeDateColors } from "src/utils/updates/updateStyles";


export class ColorPickerModal extends Modal {
    plugin: PrettyPropertiesPlugin
    propVal: string
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

            
            let pillColorSettings: PillColorSettings | undefined

            if (
                this.colorList == "propertyPillColors" ||
                this.colorList == "propertyLongtextColors" ||
                this.colorList == "tagColors"
            ) {
               pillColorSettings = this.plugin.settings[this.colorList][this.propVal]
            }

            else if (
                this.colorList == "dateColors" && 
                (this.propVal == "future" || this.propVal == "present" || this.propVal == "past")
            ) {
               pillColorSettings = this.plugin.settings[this.colorList][this.propVal]
            }

            if (pillColorSettings && (this.colorType == "pillColor" || this.colorType == "textColor")) {
                let savedColor = pillColorSettings[this.colorType]

                if (savedColor && typeof savedColor != "string") {
                    color.setValueHsl(savedColor)
                }
            }
            

            color.onChange(async (value) => {

                
                let hsl = color.getValueHsl()
            
                if (!pillColorSettings) {
                 
                    pillColorSettings = {
                      pillColor: "default",
                      textColor: "default"
                    }
                }

                if (this.colorType == "pillColor" || this.colorType == "textColor") {
                    pillColorSettings[this.colorType] = hsl
                }


         
                
                await this.plugin.saveSettings()


                updateAllProperties(this.plugin)
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