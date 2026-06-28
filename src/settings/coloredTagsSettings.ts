import { Setting, TextComponent, Menu } from 'obsidian';
import { i18n } from 'src/localization/localization';
import { PPSettingTab } from 'src/settings/settings';
import { setPillStyles } from 'src/updates/updatePills';
import { setColorMenuItems } from 'src/menus/selectColorMenus';
import { updateAllProperties } from 'src/updates/updateElements';


export const showColoredTagsSettings = (settingTab: PPSettingTab) => {
    const {containerEl, plugin} = settingTab

    let colorSettingsWrapper = containerEl.createDiv()

    colorSettingsWrapper.setCssProps({
        border: "1px solid var(--text-accent)",
        "border-radius": "4px"
    })

    let colorSettingsEl = colorSettingsWrapper.createDiv()

    const addColorSetting = (property: string) => {
        
        let propertyColorSetting = new Setting(colorSettingsEl)

        let pillEl = propertyColorSetting.nameEl.createDiv({
            cls: "multi-select-pill setting-tag-pill",
            
        })
        setPillStyles(pillEl, "data-tag-value", property, "tag", plugin)
        pillEl.createDiv({text: property, cls: "multi-select-pill-content"})

        propertyColorSetting
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
            .onClick(async () => {
                delete plugin.settings.tagColors[property]
                await plugin.saveSettings()
                propertyColorSetting.settingEl.remove()
                updateAllProperties(plugin)
            })
        )
    }
    
    for (let property in plugin.settings.tagColors) {
        addColorSetting(property)
    }


    let newProperty = ""
    let newPropertySetting = new Setting(colorSettingsWrapper)
        .setName(i18n.t("ADD_COLORED_TAG"))
        .addText(text => text
            .setValue("")
            .onChange(value => newProperty = value.replace("#", ""))
        )
        .addButton(btn => btn
            .setIcon("plus")
            .onClick(async () => {
                newProperty = newProperty.trim()
                if (newProperty && !plugin.settings.tagColors[newProperty]) {
                    plugin.settings.tagColors[newProperty] = {}
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