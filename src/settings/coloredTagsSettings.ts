import { Setting, TextComponent, Menu } from 'obsidian';
import { i18n } from 'src/localization/localization';
import { PPSettingTab } from 'src/settings/settings';
import { setPillStyles } from 'src/utils/updates/updatePills';
import { setColorMenuItems } from 'src/menus/selectColorMenus';
import { updateAllProperties } from 'src/utils/updates/updateElements';


export const showColoredTagsSettings = (settingTab: PPSettingTab) => {
    const {containerEl, plugin} = settingTab

    let colorSettingsEl = containerEl.createEl("div")

    const addColorSetting = (property: string) => {
        
        let propertyColorSetting = new Setting(colorSettingsEl)

        let pillEl = propertyColorSetting.nameEl.createEl("div", {
            cls: "multi-select-pill setting-tag-pill",
            
        })
        setPillStyles(pillEl, "data-tag-value", property, "tag", plugin)
        pillEl.createEl("div", {text: property, cls: "multi-select-pill-content"})

        propertyColorSetting.addText(text => {
            text.setValue(property)
            let inputEl = text.inputEl
            inputEl.onblur = () => {
                let value = inputEl.value
                if (value && !plugin.settings.tagColors[value]) {
                    plugin.settings.tagColors[value] = plugin.settings.tagColors[property]
                    delete plugin.settings.tagColors[property]
                    plugin.saveSettings()
                    updateAllProperties(plugin)
                    settingTab.display()
                }
            }
        })
        .addButton((btn) => {
            btn.setIcon("paintbrush").setClass("property-color-setting-button").onClick((e) => {
                let menu = new Menu();
                setColorMenuItems(menu, property, "tagColors", "pillColor", plugin);
                menu.showAtMouseEvent(e);
            });
            })

            .addButton((btn) => {
            btn.setIcon("type").setClass("property-color-setting-button").onClick((e) => {
                let menu = new Menu();
                setColorMenuItems(menu, property, "tagColors", "textColor", plugin);
                menu.showAtMouseEvent(e);
            });
            })
        .addButton(btn => btn
            .setIcon("x")
            .onClick(() => {
                delete plugin.settings.tagColors[property]
                plugin.saveSettings()
                propertyColorSetting.settingEl.remove()
                updateAllProperties(plugin)
            })
        )
    }
    
    for (let property in plugin.settings.tagColors) {
        addColorSetting(property)
    }


    let newProperty = ""
    let newPropertySetting = new Setting(containerEl)
        .setName(i18n.t("ADD_COLORED_TAG"))
        .addText(text => text
            .setValue("")
            .onChange(value => newProperty = value.replace("#", ""))
        )
        .addButton(btn => btn
            .setIcon("plus")
            .onClick(() => {
                newProperty = newProperty.trim()
                if (newProperty && !plugin.settings.tagColors[newProperty]) {
                    plugin.settings.tagColors[newProperty] = {}
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