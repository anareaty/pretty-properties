import { Setting, TextComponent, Menu } from 'obsidian';
import { i18n } from 'src/localization/localization';
import { PPSettingTab, PillColorSettings } from 'src/settings/settings';
import { setPillStyles } from 'src/updates/updatePills';
import { propertyColorSaveCallback, setColorMenuItems } from 'src/menus/selectColorMenus';
import { updateAllProperties } from 'src/updates/updateElements';





export const showColoredListSettings = (settingTab: PPSettingTab) => {
    const {containerEl, plugin} = settingTab

    let colorSettingsWrapper = containerEl.createDiv()
    colorSettingsWrapper.classList.add("pp-settings-list-container")
    let colorSettingsEl = colorSettingsWrapper.createDiv()

    const addColorSetting = (propName: string, propVal: string) => {
        
        let propertyColorSetting = new Setting(colorSettingsEl)

        let pillEl = propertyColorSetting.nameEl.createDiv({
            cls: "multi-select-pill setting-multi-select-pill"
        })   
        setPillStyles(pillEl, propName, propVal, plugin)

        pillEl.createDiv({text: propVal, cls: "multi-select-pill-content"})





        let pillColorSettings = plugin.settings.propertyColors[propName]?.[propVal]
        let saveCallback = (pillColorSettings: PillColorSettings) => {
            propertyColorSaveCallback(propName, propVal, pillColorSettings, plugin)
        }



        propertyColorSetting
        .addButton((btn) => {
            btn.setIcon("paintbrush").setClass("property-color-setting-button").onClick((e) => {
                let menu = new Menu();
                setColorMenuItems(menu, "pillColor", pillColorSettings, saveCallback, plugin);
                menu.showAtMouseEvent(e);
            });
        })
        .addButton((btn) => {
            btn.setIcon("type").setClass("property-color-setting-button").onClick((e) => {
                let menu = new Menu();
                setColorMenuItems(menu, "textColor", pillColorSettings, saveCallback, plugin);
                menu.showAtMouseEvent(e);
            });
        })
        .addButton(btn => btn
            .setIcon("x")
            .onClick(async () => {
                delete plugin.settings.propertyColors[propName]![propVal]
                await plugin.saveSettings()
                propertyColorSetting.settingEl.remove()
                updateAllProperties(plugin)
            })
        )
    }
    
    for (let propName in plugin.settings.propertyColors) {

        let propertySetting = new Setting(colorSettingsEl)
        .setName(propName)
        .addButton(button =>
            {
                let icon = "chevron-right"
                if (plugin.settings.propertyColorSettingRevealed == propName) {
                    icon = "chevron-down"
                }
                button.setIcon(icon)
                .setClass("bare-button")
                .onClick(async () => {

                    if (plugin.settings.propertyColorSettingRevealed == propName) {
                        plugin.settings.propertyColorSettingRevealed = ""
                    } else {
                        plugin.settings.propertyColorSettingRevealed = propName
                    }
                    await plugin.saveSettings()
                    settingTab.display()
                })
            }
        )


        if (plugin.settings.propertyColorSettingRevealed == propName) {
            for (let propVal in plugin.settings.propertyColors[propName]) {
                addColorSetting(propName, propVal)
            }
        }

        
        
    }


    let newProperty = ""
    let newPropertySetting = new Setting(colorSettingsWrapper)
        .setName(i18n.t("ADD_COLORED_PROPERTY"))
        .addText(text => text
            .setValue("")
            .onChange(value => newProperty = value)
        )
        .addButton(btn => btn
            .setIcon("plus")
            .onClick(async () => {
                newProperty = newProperty.trim()
                if (newProperty && !plugin.settings.propertyPillColors[newProperty]) {
                    plugin.settings.propertyPillColors[newProperty] = {}
                    await plugin.saveSettings()
                    addColorSetting(newProperty)
                    let inputSetting = newPropertySetting.components[0]
                    if (inputSetting instanceof TextComponent) {
                        inputSetting.setValue("")
                    }
                }
            })
        )
}