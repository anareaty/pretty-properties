import { Menu, Setting, moment } from 'obsidian';
import { i18n } from 'src/localization/localization';
import { updateAllProperties } from 'src/utils/updates/updateElements';
import { PPSettingTab } from 'src/settings/settings';
import { showColoredListSettings } from './coloredListSettings';
import { showColoredTagsSettings } from './coloredTagsSettings';
import { showColoredTextSettings } from './coloredTextSettings';
import { updateTagPaneTagsAll } from 'src/utils/updates/updatePills';
import { setColorMenuItems } from 'src/menus/selectColorMenus';





export const showColorSettings = (settingTab: PPSettingTab) => {
    const {containerEl, plugin} = settingTab


	new Setting(containerEl)
    .setName(i18n.t("ENABLE_COLORED_PROPERTIES"))
    .addToggle(toggle => {
        toggle.setValue(plugin.settings.enableColoredProperties)
        .onChange(async (value) => {
            plugin.settings.enableColoredProperties = value
            await plugin.saveSettings()
            updateAllProperties(plugin);
        })
    });

    new Setting(containerEl)
    .setName(i18n.t("ENABLE_COLORED_INLINE_TAGS"))
    .addToggle(toggle => {
        toggle.setValue(plugin.settings.enableColoredInlineTags)
        .onChange(async (value) => {
            plugin.settings.enableColoredInlineTags = value
            await plugin.saveSettings()
            updateAllProperties(plugin)
        })
    });



    new Setting(containerEl)
    .setName(i18n.t("ENABLE_COLORED_TAGS_IN_TAG_PANE"))
    .addToggle((toggle) => {
        toggle
        .setValue(plugin.settings.enableColoredTagsInTagPane)
        .onChange(async (value) => {
            plugin.settings.enableColoredTagsInTagPane = value;
            await plugin.saveSettings();
            updateTagPaneTagsAll(plugin)
        });
    });



    new Setting(containerEl)
        .setName(i18n.t("SHOW_COLOR_BUTTON_FOR_TEXT"))
        .addToggle(toggle => toggle
            .setValue(plugin.settings.enableColorButton)
            .onChange(async (value) => {
                plugin.settings.enableColorButton = value
                await plugin.saveSettings();
                settingTab.display();
                updateAllProperties(plugin);
            }));

    new Setting(containerEl)
        .setName(i18n.t("SHOW_COLOR_BUTTON_FOR_TEXT_IN_BASES"))
        .setDesc(i18n.t("SHOW_COLOR_BUTTON_FOR_TEXT_IN_BASES_DESC"))
        .addToggle(toggle => toggle
            .setValue(plugin.settings.enableColorButtonInBases)
            .onChange(async (value) => {
                plugin.settings.enableColorButtonInBases = value
                await plugin.saveSettings();
                updateAllProperties(plugin);
                settingTab.display();
                
            }));







    new Setting(containerEl)
    .setName(i18n.t("SHOW_COLORED_PROPERTIES"))
    .addButton(button =>
        {
            let icon = "chevron-right"
            if (plugin.settings.showColorSettings) {
                icon = "chevron-down"
            }
            button.setIcon(icon)
            .setClass("bare-button")
            .onClick(async () => {
                plugin.settings.showColorSettings = !plugin.settings.showColorSettings
                await plugin.saveSettings()
                settingTab.display()
            })
        }
    );




    if (plugin.settings.showColorSettings) { 
        showColoredListSettings(settingTab)
    }





    new Setting(containerEl)
    .setName(i18n.t("SHOW_COLORED_TAGS"))
    .addButton(button =>
        {
            let icon = "chevron-right"
            if (plugin.settings.showTagColorSettings) {
                icon = "chevron-down"
            }
            button.setIcon(icon)
            .setClass("bare-button")
            .onClick(async () => {
                plugin.settings.showTagColorSettings = !plugin.settings.showTagColorSettings
                await plugin.saveSettings()
                settingTab.display()
            })
        }
    );






    if (plugin.settings.showTagColorSettings) { 
        showColoredTagsSettings(settingTab)
    }





    new Setting(containerEl)
    .setName(i18n.t("SHOW_TEXT_COLORED_PROPERTIES"))
    .addButton(button =>
        {
            let icon = "chevron-right"
            if (plugin.settings.showTextColorSettings) {
                icon = "chevron-down"
            }
            button.setIcon(icon)
            .setClass("bare-button")
            .onClick(async () => {
                plugin.settings.showTextColorSettings = !plugin.settings.showTextColorSettings
                await plugin.saveSettings()
                settingTab.display()
            })
        }
    );




    if (plugin.settings.showTextColorSettings) { 
        showColoredTextSettings(settingTab)
    }














    let format = plugin.settings.customDateFormat
        if (!format) {format = "L"}

        let pastDate = moment().subtract(1, "days").format(format)
        let presentDate = moment().format(format)
        let futureDate = moment().add(1, "days").format(format)

        let pastSetting = new Setting(containerEl)
        pastSetting.controlEl.createSpan({text: pastDate, cls: "setting-custom-date-past"})
        pastSetting.setName(i18n.t("PAST_DATE_COLOR"))

        .addButton((btn) => {
            btn.setIcon("paintbrush").setClass("property-color-setting-button").onClick((e) => {
                let menu = new Menu();
                setColorMenuItems(menu, "past", "dateColors", "pillColor", plugin);
                menu.showAtMouseEvent(e);
            });
        })
        .addButton((btn) => {
            btn.setIcon("type").setClass("property-color-setting-button").onClick((e) => {
                let menu = new Menu();
                setColorMenuItems(menu, "past", "dateColors", "textColor", plugin);
                menu.showAtMouseEvent(e);
            });
        })


        
        let presentSEtting = new Setting(containerEl)
        presentSEtting.controlEl.createSpan({text: presentDate, cls: "setting-custom-date-present"})
        presentSEtting.setName(i18n.t("PRESENT_DATE_COLOR"))
        .addButton((btn) => {
            btn.setIcon("paintbrush").setClass("property-color-setting-button").onClick((e) => {
                let menu = new Menu();
                setColorMenuItems(menu, "present", "dateColors", "pillColor", plugin);
                menu.showAtMouseEvent(e);
            });
        })
        .addButton((btn) => {
            btn.setIcon("type").setClass("property-color-setting-button").onClick((e) => {
                let menu = new Menu();
                setColorMenuItems(menu, "present", "dateColors", "textColor", plugin);
                menu.showAtMouseEvent(e);
            });
        })
        
        let futureSetting = new Setting(containerEl)
        futureSetting.controlEl.createSpan({text: futureDate, cls: "setting-custom-date-future"})
        futureSetting.setName(i18n.t("FUTURE_DATE_COLOR"))
        .addButton((btn) => {
            btn.setIcon("paintbrush").setClass("property-color-setting-button").onClick((e) => {
                let menu = new Menu();
                setColorMenuItems(menu, "future", "dateColors", "pillColor", plugin);
                menu.showAtMouseEvent(e);
            });
        })
        .addButton((btn) => {
            btn.setIcon("type").setClass("property-color-setting-button").onClick((e) => {
                let menu = new Menu();
                setColorMenuItems(menu, "future", "dateColors", "textColor", plugin);
                menu.showAtMouseEvent(e);
            });
        })




}
