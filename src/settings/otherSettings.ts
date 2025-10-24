import { Setting, loadMathJax, Notice } from 'obsidian';
import { i18n } from 'src/localization/localization';
import { DEFAULT_SETTINGS, PPSettingTab } from 'src/settings/settings';
import { updateLongTexts } from 'src/utils/updates/updatePills';
import { updateHiddenProperties } from 'src/utils/updates/updateHiddenProperties';
import { updateBannerStyles, updateBaseTagsStyle, updateCoverStyles, updateHiddenPropertiesInPropTab, updateIconStyles, updatePillPaddings, updateRelativeDateColors } from 'src/utils/updates/updateStyles';
import { updateAllProperties } from 'src/utils/updates/updateElements';








export const showOtherSettings = (settingTab: PPSettingTab) => {
    const {containerEl, plugin} = settingTab

    


    new Setting(containerEl)
        .setName(i18n.t("EXPORT_OR_IMPORT_SETTINGS"))
        .addButton(button => {button
            .setButtonText(i18n.t("EXPORT"))
            .onClick(() => {
                let settingsText = JSON.stringify(plugin.settings, null, 2)
                let exportLink = document.createElement("a")
                exportLink.setAttrs({
                        download: "pretty-properties-backup.json",
                        href: `data:application/json;charset=utf-8,${encodeURIComponent(settingsText)}`,
                })
                exportLink.click()
                exportLink.remove()
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
                updateBaseTagsStyle(plugin)
                updateAllProperties(plugin)
                settingTab.display();
                new Notice(i18n.t("CLEAR_SETTINGS_NOTICE"))
            }))
}

