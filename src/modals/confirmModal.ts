import { Modal, Setting } from "obsidian";
import { i18n } from "src/localization/localization";
import PrettyPropertiesPlugin from "src/main";


export class ConfirmModal extends Modal {
    text: string
    plugin: PrettyPropertiesPlugin
    acceptCallback: () => Promise<void>

    constructor(text: string, plugin: PrettyPropertiesPlugin, acceptCallback: () => Promise<void>) {
        super(plugin.app);
        this.text = text
        this.plugin = plugin
        this.acceptCallback = acceptCallback
    }

    
    onOpen() {
        const {contentEl} = this

        new Setting(contentEl)
        .setName(this.text)

        new Setting(contentEl)
        .addButton(btn => btn
            .setButtonText(i18n.t("OK"))
            .setCta()
            .onClick(() => {
                this.close()
                void this.acceptCallback()
            })
        )
        .addButton(btn => btn
            .setButtonText(i18n.t("CANCEL"))
            .onClick(() => {
                this.close()
            })
        )

    }

    onClose() {
        const {contentEl} = this
        contentEl.empty()
    } 
}