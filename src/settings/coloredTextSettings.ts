import { Setting, TextComponent, Menu } from 'obsidian';
import { i18n } from 'src/localization/localization';
import { PPSettingTab } from 'src/settings/settings';
import { setPillStyles } from 'src/utils/updates/updatePills';
import { setColorMenuItems } from 'src/menus/selectColorMenus';
import { updateAllProperties } from 'src/utils/updates/updateElements';


export const showColoredTextSettings = (settingTab: PPSettingTab) => {
    const {containerEl, plugin} = settingTab

    let colorSettingsEl = containerEl.createEl("div")

    const addColorSetting = (property: string) => {
        let propertyColorSetting = new Setting(colorSettingsEl)

        let pill = propertyColorSetting.nameEl.createEl("div", {
            text: property,
            cls: "metadata-input-longtext setting-longtext-pill",
            
        })
        setPillStyles(pill, "data-property-longtext-value", property, "longtext", plugin)

        propertyColorSetting.addText(text => {
            text.setValue(property)
            let inputEl = text.inputEl
            inputEl.maxLength = 200
            inputEl.onblur = () => {
                let value = inputEl.value.trim()
                if (value && !plugin.settings.propertyLongtextColors[value]) {
                    plugin.settings.propertyLongtextColors[value] = plugin.settings.propertyLongtextColors[property]
                    delete plugin.settings.propertyLongtextColors[property]
                    plugin.saveSettings()
                    updateAllProperties(plugin)
                    settingTab.display()
                }
            }
        })

        .addButton((btn) => {
            btn.setIcon("paintbrush").setClass("property-color-setting-button").onClick((e) => {
                let menu = new Menu();
                setColorMenuItems(menu, property, "propertyLongtextColors", "pillColor", plugin);
                menu.showAtMouseEvent(e);
            });
        })
        .addButton((btn) => {
            btn.setIcon("type").setClass("property-color-setting-button").onClick((e) => {
                let menu = new Menu();
                setColorMenuItems(menu, property, "propertyLongtextColors", "textColor", plugin);
                menu.showAtMouseEvent(e);
            });
        })

        .addButton(btn => btn
            .setIcon("x")
            .onClick(() => {
                delete plugin.settings.propertyLongtextColors[property]
                plugin.saveSettings()
                propertyColorSetting.settingEl.remove()
                updateAllProperties(plugin)
            })
        )
    }
    
    for (let property in plugin.settings.propertyLongtextColors) {
        addColorSetting(property)
    }

    let newProperty = ""
    let newPropertySetting = new Setting(containerEl)
        .setName(i18n.t("ADD_TEXT_COLORED_PROPERTY"))
        .addText(text => {
            let inputEl = text.inputEl
            inputEl.maxLength = 200
            text
            .setValue("")
            .onChange(value => newProperty = value)
        })
        .addButton(btn => btn
            .setIcon("plus")
            .onClick(() => {
                newProperty = newProperty.trim()
                if (newProperty && !plugin.settings.propertyLongtextColors[newProperty]) {
                    plugin.settings.propertyLongtextColors[newProperty] = {}
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