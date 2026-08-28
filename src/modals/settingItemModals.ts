import { Modal, Setting } from "obsidian";
import { i18n } from "src/localization/localization";
import PrettyPropertiesPlugin from "src/main";
import { PropertyNameSuggest } from "src/utils/propertyNameSuggester";
import { enhanceFormatTextArea } from "src/utils/settingsHelper";



export class AddPropertyModal extends Modal {
    plugin: PrettyPropertiesPlugin
    result: string
    allowedTypes: string[]
    modalCallback: (value: string) => Promise<void> | void
   
    constructor(allowedTypes: string[], plugin: PrettyPropertiesPlugin, modalCallback: (value: string) => Promise<void> | void) {
        super(plugin.app)
        this.plugin = plugin
        this.allowedTypes = allowedTypes
        this.modalCallback = modalCallback
        this.result = ""
        
    }

    onOpen() {
        const {contentEl} = this

        new Setting(contentEl)
        .setName(i18n.t("ADD_PROPERTY"))
        .addSearch((search) => {
            search.setValue("");
            search.setPlaceholder(i18n.t("PROPERTY_SEARCH_PLACEHOLDER"));

            const suggester = new PropertyNameSuggest(this.plugin.app, search.inputEl, this.allowedTypes);
            suggester.onSelect(async (value) => {
                suggester.setValue(value);
                suggester.close();
                this.result = value
                this.modalCallback(this.result)
                this.close()
            });
        })



        new Setting(contentEl)
        .addButton(btn => btn
            .setButtonText(i18n.t("SAVE"))
            .setCta()
            .onClick(async () => {
                this.modalCallback(this.result)
                this.close()
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













export class AddTextModal extends Modal {
    plugin: PrettyPropertiesPlugin
    result: string
    modalCallback: (value: string) => Promise<void> | void
   
    constructor(plugin: PrettyPropertiesPlugin, modalCallback: (value: string) => Promise<void> | void) {
        super(plugin.app)
        this.plugin = plugin
        this.modalCallback = modalCallback
        this.result = ""
        
    }

    onOpen() {
        const {contentEl} = this

        new Setting(contentEl)
        .setName(i18n.t("ADD_PROPERTY"))
        .addText(txt => txt
            .onChange((value) => {
                this.result = value
            })
        )



        new Setting(contentEl)
        .addButton(btn => btn
            .setButtonText(i18n.t("SAVE"))
            .setCta()
            .onClick(async () => {
                this.modalCallback(this.result)
                this.close()
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














export class FormatTemplateModal extends Modal {
    plugin: PrettyPropertiesPlugin
    result: string
    templateName: string
    format: string
    modalCallback: (value: string) => Promise<void> | void
   
    constructor(
        plugin: PrettyPropertiesPlugin, 
        templateName: string,
        format: string,
        modalCallback: (value: string) => Promise<void> | void
    ) {
        super(plugin.app)
        this.plugin = plugin
        this.templateName = templateName
        this.format = format
        this.modalCallback = modalCallback
        this.result = this.format

        
    }

    onOpen() {
        const {contentEl} = this

        new Setting(contentEl)
        .setName(i18n.t(this.templateName))
        .addTextArea((text) => {
            enhanceFormatTextArea(this.plugin, text, this.format, async (value) => {
                this.result = value
            });
        })

        new Setting(contentEl)
        .addButton(btn => btn
            .setButtonText(i18n.t("SAVE"))
            .setCta()
            .onClick(async () => {
                this.modalCallback(this.result)
                this.close()
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