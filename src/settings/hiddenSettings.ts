import { Setting, TextComponent } from 'obsidian';
import { i18n } from 'src/localization/localization';
import { PPSettingTab } from 'src/settings/settings';
import { updateHiddenProperties } from 'src/updates/updateHiddenProperties';


export const showHiddenSettings = (settingTab: PPSettingTab) => {
    const {containerEl, plugin} = settingTab

    let hiddenSettingsWrapper = containerEl.createDiv()

    hiddenSettingsWrapper.setCssProps({
        border: "1px solid var(--text-accent)",
        "border-radius": "4px"
    })

    let hiddenSettingsEl = hiddenSettingsWrapper.createDiv()
    const addHiddenSetting = (property: string) => {
        let propertyHiddenSetting = new Setting(hiddenSettingsEl)
        .setName(property)
        .addButton(btn => btn
            .setIcon("x")
            .onClick(async() => {
                plugin.settings.hiddenProperties = plugin.settings.hiddenProperties.filter(p => p != property)
                await plugin.saveSettings()
                propertyHiddenSetting.settingEl.remove()
                updateHiddenProperties(plugin)
            })
        )
    }
    
    for (let property of plugin.settings.hiddenProperties) {
        addHiddenSetting(property)
    }

    let newProperty = ""
    let newPropertySetting = new Setting(hiddenSettingsWrapper)
        .setName(i18n.t("ADD_HIDDEN_PROPERTY"))
        .addText(text => text
            .setValue("")
            .onChange(value => newProperty = value)
        )
        .addButton(btn => btn
            .setIcon("plus")
            .onClick(async () => {
                newProperty = newProperty.trim()
                if (newProperty && !plugin.settings.hiddenProperties.find(p => p == newProperty)) {
                    plugin.settings.hiddenProperties.push(newProperty)
                    await plugin.saveSettings()
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



export const showHiddenEmptySettings = (settingTab: PPSettingTab) => {
    const {containerEl, plugin} = settingTab

    let hiddenSettingsWrapper = containerEl.createDiv()

    hiddenSettingsWrapper.setCssProps({
        border: "1px solid var(--text-accent)",
        "border-radius": "4px"
    })

    let hiddenSettingsEl = hiddenSettingsWrapper.createDiv()
    const addHiddenSetting = (property: string) => {
        let propertyHiddenSetting = new Setting(hiddenSettingsEl)
        .setName(property)
        .addButton(btn => btn
            .setIcon("x")
            .onClick(async () => {
                plugin.settings.hiddenWhenEmptyProperties = plugin.settings.hiddenWhenEmptyProperties.filter(p => p != property)
                await plugin.saveSettings()
                propertyHiddenSetting.settingEl.remove()
                updateHiddenProperties(plugin)
            })
        )
    }
    
    for (let property of plugin.settings.hiddenWhenEmptyProperties) {
        addHiddenSetting(property)
    }

    let newProperty = ""
    let newPropertySetting = new Setting(hiddenSettingsWrapper)
        .setName(i18n.t("ADD_HIDDEN_EMPTY_PROPERTY"))
        .addText(text => text
            .setValue("")
            .onChange(value => newProperty = value)
        )
        .addButton(btn => btn
            .setIcon("plus")
            .onClick(async() => {
                newProperty = newProperty.trim()
                if (newProperty && !plugin.settings.hiddenWhenEmptyProperties.find(p => p == newProperty)) {
                    plugin.settings.hiddenWhenEmptyProperties.push(newProperty)
                    await plugin.saveSettings()
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