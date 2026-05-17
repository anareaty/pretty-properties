import { Setting, TextComponent, Menu } from 'obsidian';
import { i18n } from 'src/localization/localization';
import { PPSettingTab } from 'src/settings/settings';
import { setPillStyles } from 'src/utils/updates/updatePills';
import { setColorMenuItems } from 'src/menus/selectColorMenus';
import { updateAllProperties } from 'src/utils/updates/updateElements';



export const showColoredListSettings = (settingTab: PPSettingTab) => {
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
            cls: "multi-select-pill setting-multi-select-pill"
        })   
        setPillStyles(pillEl, "data-property-pill-value", property, "multiselect-pill", plugin)

        pillEl.createDiv({text: property, cls: "multi-select-pill-content"})

        propertyColorSetting
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
            .onClick(async () => {
                delete plugin.settings.propertyPillColors[property]
                await plugin.saveSettings()
                propertyColorSetting.settingEl.remove()
                updateAllProperties(plugin)
            })
        )
    }
    
    for (let property in plugin.settings.propertyPillColors) {
        addColorSetting(property)
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