import { TFile, Modal, Setting, App } from "obsidian";
import PrettyPropertiesPlugin from "src/main";


export class BannerPositionModal extends Modal {
    file: TFile
    position: number
    bannerPositionProperty: string

    constructor(app: App, plugin: PrettyPropertiesPlugin, file: TFile, bannerPositionProperty: string) {
        super(app)
        let cache = plugin.app.metadataCache.getFileCache(file);
        this.position = cache?.frontmatter?.[bannerPositionProperty] || 50
        this.file = file
        this.bannerPositionProperty = bannerPositionProperty
    }

    onOpen() {
        const {contentEl} = this
        let positionSetting = new Setting(contentEl)
        .addSlider(slider => slider
            .setLimits(0, 100, 1)
            .setValue(this.position)
            .setDynamicTooltip()
            .onChange((value) => {
                this.app.fileManager.processFrontMatter(this.file, fm => {
                    fm[this.bannerPositionProperty] = value
                })
            })
        )
        positionSetting.settingEl.classList.add("position-setting")
    }

    onClose() {
        const {contentEl} = this
        contentEl.empty()
    } 
}