import { Setting } from 'obsidian';
import { i18n } from 'src/localization/localization';
import { updateAllProperties } from 'src/utils/updates/updateElements';
import { PPSettingTab } from 'src/settings/settings';
import { showColoredListSettings } from './coloredListSettings';
import { showColoredTagsSettings } from './coloredTagsSettings';
import { showColoredTextSettings } from './coloredTextSettings';
import { updateTagPaneTagsAll } from 'src/utils/updates/updatePills';





export const showColorSettings = (settingTab: PPSettingTab) => {
    const {containerEl, plugin} = settingTab


	new Setting(containerEl)
    .setName(i18n.t("ENABLE_COLORED_PROPERTIES"))
    .addToggle(toggle => {
        toggle.setValue(plugin.settings.enableColoredProperties)
        .onChange(value => {
            plugin.settings.enableColoredProperties = value
            plugin.saveSettings()
            updateAllProperties(plugin);
        })
    });

    new Setting(containerEl)
    .setName(i18n.t("ENABLE_COLORED_INLINE_TAGS"))
    .addToggle(toggle => {
        toggle.setValue(plugin.settings.enableColoredInlineTags)
        .onChange(value => {
            plugin.settings.enableColoredInlineTags = value
            plugin.saveSettings()
            updateAllProperties(plugin)
        })
    });



    new Setting(containerEl)
    .setName(i18n.t("ENABLE_COLORED_TAGS_IN_TAG_PANE"))
    .addToggle((toggle) => {
        toggle
        .setValue(plugin.settings.enableColoredTagsInTagPane)
        .onChange((value) => {
            plugin.settings.enableColoredTagsInTagPane = value;
            plugin.saveSettings();
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
                plugin.saveSettings()
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
                plugin.saveSettings()
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
                plugin.saveSettings()
                settingTab.display()
            })
        }
    );




    if (plugin.settings.showTextColorSettings) { 
        showColoredTextSettings(settingTab)
    }




}
