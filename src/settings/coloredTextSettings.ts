import { Setting, TextComponent, Menu } from 'obsidian';
import { i18n } from 'src/localization/localization';
import { PPSettingTab } from 'src/settings/settings';
import { setPillStyles } from 'src/updates/updatePills';
import { setColorMenuItems } from 'src/menus/selectColorMenus';
import { updateAllProperties } from 'src/updates/updateElements';


export const showColoredTextSettings = (settingTab: PPSettingTab) => {
    const {containerEl, plugin} = settingTab

    let colorSettingsWrapper = containerEl.createDiv()

    colorSettingsWrapper.setCssProps({
        border: "1px solid var(--text-accent)",
        "border-radius": "4px"
    })

    let colorSettingsEl = colorSettingsWrapper.createDiv()

    const addColorSetting = (property: string) => {
        let propertyColorSetting = new Setting(colorSettingsEl)

        let pill = propertyColorSetting.nameEl.createDiv({
            text: property,
            cls: "metadata-input-longtext setting-longtext-pill",
            
        })
        setPillStyles(pill, "data-property-longtext-value", property, "longtext", plugin)

        propertyColorSetting
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
            .onClick(async () => {
                delete plugin.settings.propertyLongtextColors[property]
                await plugin.saveSettings()
                propertyColorSetting.settingEl.remove()
                updateAllProperties(plugin)
            })
        )
    }
    
    for (let property in plugin.settings.propertyLongtextColors) {
        addColorSetting(property)
    }

    let newProperty = ""
    let newPropertySetting = new Setting(colorSettingsWrapper)
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
            .onClick(async () => {
                newProperty = newProperty.trim()
                if (newProperty && !plugin.settings.propertyLongtextColors[newProperty]) {
                    plugin.settings.propertyLongtextColors[newProperty] = {}
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