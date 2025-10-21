import { Setting, TextComponent, Menu } from 'obsidian';
import { i18n } from 'src/localization/localization';
import { PPSettingTab } from 'src/settings/settings';
import { setPillStyles, updateSettingPills } from 'src/utils/updates/updatePills';
import { setColorMenuItems } from 'src/menus/selectColorMenus';
import { updateAllProperties } from 'src/utils/updates/updateElements';



export const showColoredListSettings = (settingTab: PPSettingTab) => {
    const {containerEl, plugin} = settingTab

    let colorSettingsEl = containerEl.createEl("div")

    const addColorSetting = (property: string) => {
        
        let propertyColorSetting = new Setting(colorSettingsEl)

        let pillEl = propertyColorSetting.nameEl.createEl("div", {
            cls: "multi-select-pill setting-multi-select-pill"
        })   
        setPillStyles(pillEl, "data-property-pill-value", property, "multiselect-pill", plugin)

        pillEl.createEl("div", {text: property, cls: "multi-select-pill-content"})

        propertyColorSetting.addText(text => {
            text.setValue(property)
            let inputEl = text.inputEl
            inputEl.onblur = () => {
                let value = inputEl.value
                if (value && !plugin.settings.propertyPillColors[value]) {
                    plugin.settings.propertyPillColors[value] = plugin.settings.propertyPillColors[property]
                    delete plugin.settings.propertyPillColors[property]
                    plugin.saveSettings()
                    updateAllProperties(plugin)
                    
                    settingTab.display()
                }
            }
        })
        .addButton((btn) => {
            btn.setIcon("paintbrush").setClass("property-color-setting-button").onClick((e) => {
                let menu = new Menu();
                setColorMenuItems(menu, property, "propertyPillColors", "pillColor", plugin);
                menu.showAtMouseEvent(e);
            });
        })

            .addButton((btn) => {
            btn.setIcon("type").setClass("property-color-setting-button").onClick((e) => {
                let menu = new Menu();
                setColorMenuItems(menu, property, "propertyPillColors", "textColor", plugin);
                menu.showAtMouseEvent(e);
            });
        })
        .addButton(btn => btn
            .setIcon("x")
            .onClick(() => {
                delete plugin.settings.propertyPillColors[property]
                plugin.saveSettings()
                propertyColorSetting.settingEl.remove()
                updateAllProperties(plugin)
            })
        )
    }
    
    for (let property in plugin.settings.propertyPillColors) {
        addColorSetting(property)
    }


    let newProperty = ""
    let newPropertySetting = new Setting(containerEl)
        .setName(i18n.t("ADD_COLORED_PROPERTY"))
        .addText(text => text
            .setValue("")
            .onChange(value => newProperty = value)
        )
        .addButton(btn => btn
            .setIcon("plus")
            .onClick(() => {
                newProperty = newProperty.trim()
                if (newProperty && !plugin.settings.propertyPillColors[newProperty]) {
                    plugin.settings.propertyPillColors[newProperty] = {}
                    plugin.saveSettings()
                    addColorSetting(newProperty)
                    let inputSetting = newPropertySetting.components[0]
                    if (inputSetting instanceof TextComponent) {
                        inputSetting.setValue("")
                    }
                }
            })
        )
}