import { Setting, TextComponent } from 'obsidian';
import { i18n } from 'src/localization/localization';
import { PPSettingTab } from 'src/settings/settings';
import { updateHiddenProperties } from 'src/utils/updates/updateHiddenProperties';


export const showHiddenSettings = (settingTab: PPSettingTab) => {
    const {containerEl, plugin} = settingTab

    let hiddenSettingsEl = containerEl.createEl("div")
        const addHiddenSetting = (property: string) => {
            let propertyHiddenSetting = new Setting(hiddenSettingsEl)

            propertyHiddenSetting.addText(text => {
                text.setValue(property)
                let inputEl = text.inputEl
                inputEl.onblur = () => {
                    let value = inputEl.value
                    if (value && !plugin.settings.hiddenProperties.find(p => p == value)) {
                        plugin.settings.hiddenProperties.push(value)
                        plugin.settings.hiddenProperties = plugin.settings.hiddenProperties.filter(p => p != property)
                        plugin.saveSettings()
                        updateHiddenProperties(plugin)
                        settingTab.display()
                    }
                }
            })

            .addButton(btn => btn
                .setIcon("x")
                .onClick(() => {
                    plugin.settings.hiddenProperties = plugin.settings.hiddenProperties.filter(p => p != property)
                    plugin.saveSettings()
                    propertyHiddenSetting.settingEl.remove()
                    updateHiddenProperties(plugin)
                })
            )
        }
        
        for (let property of plugin.settings.hiddenProperties) {
            addHiddenSetting(property)
        }

        let newProperty = ""
        let newPropertySetting = new Setting(containerEl)
            .setName(i18n.t("ADD_HIDDEN_PROPERTY"))
            .addText(text => text
                .setValue("")
                .onChange(value => newProperty = value)
            )
            .addButton(btn => btn
                .setIcon("plus")
                .onClick(() => {
                    newProperty = newProperty.trim()
                    if (newProperty && !plugin.settings.hiddenProperties.find(p => p == newProperty)) {
                        plugin.settings.hiddenProperties.push(newProperty)
                        plugin.saveSettings()
                        updateHiddenProperties(plugin)
                        addHiddenSetting(newProperty)
                        let inputSetting = newPropertySetting.components[0]
                        if (inputSetting instanceof TextComponent) {
                            inputSetting.setValue("")
                        }
                    }
                })
            )
}