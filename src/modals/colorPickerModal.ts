import { HSL, Modal, Setting } from "obsidian";
import { i18n } from "src/localization/localization";
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












const hexRegex = /^#(?:[0-9a-fA-F]{3,4}){1,2}$/

export class ColorPickerWithOpasityModal extends Modal {
    plugin: PrettyPropertiesPlugin
    saveCallback: (hex: string) => void
    savedColor: string | undefined
    colorHex: string
    colorAlpha: string
    alpha: number


    constructor(
        savedColor: string | undefined,
        saveCallback: (hex: string) => void,
        plugin: PrettyPropertiesPlugin, 
    ) {
        super(plugin.app);
        this.plugin = plugin
        this.savedColor = savedColor
        this.saveCallback = saveCallback

        this.colorHex = "#000000"
        this.colorAlpha = ""
        this.alpha = 100

        if (this.savedColor && hexRegex.test(this.savedColor)) {
            this.colorHex = this.savedColor.slice(0, 7);
            this.colorAlpha = this.savedColor.slice(7);
            if (this.colorAlpha) {
                this.alpha = parseInt(this.colorAlpha, 16) || 100;
            }
            this.alpha = this.alpha * 100 / 255;
            if (this.colorAlpha === "00") {
                this.alpha = 0;
            }
            else if (this.colorAlpha === "") {
                this. alpha = 100;
            }
        }

        this.savedColor = this.colorHex + this.colorAlpha

        
    }
    
    onOpen() {

        this.modalEl.classList.add("color-picker-opacity-modal")
        const {contentEl} = this

        const previewEl = contentEl.createEl("div", { cls: "color-preview-box" })

        previewEl.setCssStyles({backgroundColor: this.savedColor})

        new Setting(contentEl)
        .addColorPicker(color => {

            if (this.savedColor) {
                color.setValue(this.savedColor)
            }
            
            color.onChange(async (value) => {
                this.colorHex = value
                this.savedColor = this.colorHex + this.colorAlpha;
                previewEl.setCssStyles({backgroundColor: this.savedColor})
            })

            return color
        })
        .addSlider(slider => {
            slider.setValue(this.alpha)
            .setDynamicTooltip()
            .onChange(value => {
                this.colorAlpha = Math.floor(value * 255 / 100).toString(16);
                if (value == 100) {
                    this.colorAlpha = ""
                } else if (value == 0) {
                    this.colorAlpha = "00"
                }
                if (this.colorAlpha.length == 1) this.colorAlpha = "0" + this.colorAlpha
                this.savedColor = this.colorHex + this.colorAlpha;
                previewEl.setCssStyles({backgroundColor: this.savedColor})
            })
            return slider
        })


        new Setting(contentEl).addButton(
        (btn) => {
            btn.setButtonText(i18n.t("SAVE"));
            btn.setCta();
    
            btn.onClick(() => {
                if (this.savedColor) {
                    this.saveCallback(this.savedColor)
                }
                this.close();
            });
        }
        )

        
    }

    onClose() {
        const {contentEl} = this
        contentEl.empty()
    } 
}