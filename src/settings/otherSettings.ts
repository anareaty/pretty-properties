import { Setting, loadMathJax, Notice, Platform, Modal } from 'obsidian';
import { i18n } from 'src/localization/localization';
import { DEFAULT_SETTINGS, PPSettingTab } from 'src/settings/settings';
import { updateLongTexts } from 'src/utils/updates/updatePills';
import { updateHiddenProperties } from 'src/utils/updates/updateHiddenProperties';
import { updateBannerStyles, updateBaseTagsStyle, updateCoverStyles, updateHiddenEmptyProperties, updateHiddenPropertiesInPropTab, updateIconStyles, updatePillPaddings, updateRelativeDateColors } from 'src/utils/updates/updateStyles';
import { updateAllProperties } from 'src/utils/updates/updateElements';








export const showOtherSettings = (settingTab: PPSettingTab) => {
    const {containerEl, plugin} = settingTab

    


    new Setting(containerEl)
        .setName(i18n.t("EXPORT_OR_IMPORT_SETTINGS"))
        .addButton(button => {button
            .setButtonText(i18n.t("EXPORT"))
            .onClick(() => {
                let settingsText = JSON.stringify(plugin.settings, null, 2)
                let fileName = "pretty-properties-backup.json"
                let exportFileButtonName = i18n.t("DOWNLOAD_FILE")

                if (Platform.isMobile && !navigator.share) {
                    exportFileButtonName = i18n.t("SAVE_IN_VAULT_ROOT")
                }
                class SettingExportModal extends Modal {
                    onOpen() {
                        const {contentEl} = this
                        let exportSetting = new Setting(contentEl)
                            .setName(i18n.t("EXPORT_OPTIONS"))
                            .addButton(btn => btn
                                .setButtonText(exportFileButtonName)
                                .onClick(() => {
                                    if (Platform.isDesktop) {
                                        let exportLink = document.createElement("a")
                                        exportLink.setAttrs({
                                                download: fileName,
                                                href: `data:application/json;charset=utf-8,${encodeURIComponent(settingsText)}`,
                                        })
                                        exportLink.click()
                                        exportLink.remove()

                                    } else if (Platform.isMobile) {
                                        if (navigator.share) {
                                            let file = new File([settingsText], fileName, {type: 'application/json'})
                                            navigator.share({
                                                files: [file],
                                                title: "Pretty properties settings backup"
                                            })
                                        } else {
                                            plugin.app.vault.adapter.write(
                                                fileName,
                                                settingsText
                                            ).then();
                                            this.close()
                                            new Notice(i18n.t("SAVED_FILE") + " " + fileName)
                                        }
                                    }
                                })
                            )
                            .addButton(btn => btn
                                .setButtonText(i18n.t("COPY_SETTINGS_TO_CLIPBOARD"))
                                .onClick(() => {
                                    navigator.clipboard.writeText(settingsText)
                                    new Notice(i18n.t("SETTINGS_ARE_COPIED_TO_CLIPBOARD"))
                                })
                            )
                        exportSetting.controlEl.classList.add("pp-export-setting")
                    }
                }

                new SettingExportModal(plugin.app).open()
            })
        })
        .addButton(button => {button
            .setButtonText(i18n.t("IMPORT"))
            .onClick(() => {
                let input = document.createElement('input');
                input.setAttrs({
                        type: "file",
                        accept: ".json"
                })
                
                input.onchange = (e) => { 
                    let selectedFile = input.files?.[0]

                    if (selectedFile) {
                        const reader = new FileReader();
                        reader.readAsText(selectedFile,'UTF-8')
                        reader.onload = async(readerEvent) => {
                            let importedJson
                            let content = readerEvent.target?.result
                            if (typeof content == "string") {
                                try {
                                    importedJson = JSON.parse(content)
                                } catch(error) {
                                    let errorString = i18n.t("INVALID_SETTING_IMPORT_FILE")
                                    new Notice(errorString)
                                    console.error(errorString)
                                }
                            }

                            if (importedJson) {
                                let newSettings = Object.assign(
                                        {},
                                        DEFAULT_SETTINGS
                                    )
                                for (let setting in plugin.settings) {
                                    
                                    if (importedJson[setting]) {
                                        //@ts-ignore
                                        newSettings[setting] = importedJson[setting]
                                    } 
                                }

                                plugin.settings = newSettings
                                await plugin.saveSettings();
                                updateRelativeDateColors(plugin)
                                updateBannerStyles(plugin);
                                updateIconStyles(plugin);
                                updateCoverStyles(plugin);
                                updatePillPaddings(plugin)
                                updateHiddenPropertiesInPropTab(plugin)
                                updateHiddenEmptyProperties(plugin)
                                updateBaseTagsStyle(plugin)
                                updateAllProperties(plugin)
                            }
                        }
                    }
                    input.remove()
                }
                input.click()
            })
        })





    new Setting(containerEl)
        .setName(i18n.t("CLEAR_SETTINGS"))
        .setDesc(i18n.t("CLEAR_SETTINGS_DESCRIPTION"))
        .addButton(button => button
            .setButtonText(i18n.t("CLEAR"))
            .setClass("mod-warning")
            .onClick(async () => {
                plugin.settings = Object.assign({}, DEFAULT_SETTINGS);
                await plugin.saveSettings();
                updateRelativeDateColors(plugin)
                updateBannerStyles(plugin);
                updateIconStyles(plugin);
                updateCoverStyles(plugin);
                updatePillPaddings(plugin)
                updateHiddenPropertiesInPropTab(plugin)
                updateHiddenEmptyProperties(plugin)
                updateBaseTagsStyle(plugin)
                updateAllProperties(plugin)
                settingTab.display();
                new Notice(i18n.t("CLEAR_SETTINGS_NOTICE"))
            }))
}

