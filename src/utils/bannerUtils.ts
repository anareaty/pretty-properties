import { TFile, Modal, Setting, App } from "obsidian";
import PrettyPropertiesPlugin from "src/main";


class PositionModal extends Modal {
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


export const selectBannerPosition = async(plugin: PrettyPropertiesPlugin) => {
    let file = plugin.app.workspace.getActiveFile()
    let bannerPositionProperty = plugin.settings.bannerPositionProperty
    if (file instanceof TFile && bannerPositionProperty) {
        new PositionModal(plugin.app, plugin, file, bannerPositionProperty).open()
    }
}