import { Setting, Menu, moment  } from 'obsidian';
import { i18n } from 'src/localization/localization';
import { PPSettingTab } from 'src/settings/settings';
import { setColorMenuItems } from 'src/menus/selectColorMenus';
import { updateAllProperties } from 'src/utils/updates/updateElements';




export const showDatesSettings = (settingTab: PPSettingTab) => {
    const {containerEl, plugin} = settingTab

    new Setting(containerEl)
    .setName(i18n.t("ENABLE_CUSTOM_DATE_FORMAT"))
    .addToggle(toggle => toggle
        .setValue(plugin.settings.enableCustomDateFormat)
        .onChange(async (value) => {
            plugin.settings.enableCustomDateFormat = value
            await plugin.saveSettings();
            settingTab.display();
            updateAllProperties(plugin);
        }));
    
    if (plugin.settings.enableCustomDateFormat) {
        new Setting(containerEl)
        .setName(i18n.t("CUSTOM_DATE_FORMAT"))
        .addText(text => text
            .setPlaceholder("DD.MM.YYYY")
            .setValue(plugin.settings.customDateFormat)
            .onChange(async (value) => {
                plugin.settings.customDateFormat = value;
                await plugin.saveSettings();
                updateAllProperties(plugin);
            }));

        new Setting(containerEl)
        .setName(i18n.t("CUSTOM_DATETIME_FORMAT"))
        .addText(text => text
            .setPlaceholder("DD.MM.YYYY HH:mm")
            .setValue(plugin.settings.customDateTimeFormat)
            .onChange(async (value) => {
                plugin.settings.customDateTimeFormat = value;
                await plugin.saveSettings();
                updateAllProperties(plugin);
            }));
    }

    new Setting(containerEl)
    .setName(i18n.t("ENABLE_CUSTOM_DATE_FORMAT_IN_BASES"))
    .addToggle(toggle => toggle
        .setValue(plugin.settings.enableCustomDateFormatInBases)
        .onChange(async (value) => {
            plugin.settings.enableCustomDateFormatInBases = value
            await plugin.saveSettings();
            settingTab.display();
            updateAllProperties(plugin);
        }));

        let format = plugin.settings.customDateFormat
        if (!format) {format = "L"}

        let pastDate = moment().subtract(1, "days").format(format)
        let presentDate = moment().format(format)
        let futureDate = moment().add(1, "days").format(format)

        let pastSetting = new Setting(containerEl)
        pastSetting.controlEl.createEl("span", {text: pastDate, cls: "setting-custom-date-past"})
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
        presentSEtting.controlEl.createEl("span", {text: presentDate, cls: "setting-custom-date-present"})
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
        futureSetting.controlEl.createEl("span", {text: futureDate, cls: "setting-custom-date-future"})
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