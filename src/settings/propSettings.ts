import { Setting } from 'obsidian';
import { i18n } from 'src/localization/localization';
import { updateAllProperties } from 'src/utils/updates/updateElements';
import { PPSettingTab } from 'src/settings/settings';
import { updateBaseTagsStyle, updateHiddenPropertiesInPropTab, updatePillPaddings } from 'src/utils/updates/updateStyles';
import { showColoredListSettings } from './coloredListSettings';
import { showColoredTagsSettings } from './coloredTagsSettings';
import { showColoredTextSettings } from './coloredTextSettings';
import { showHiddenSettings } from './hiddenSettings';
import { updateTagPaneTagsAll } from 'src/utils/updates/updatePills';
import { removeColorStyles, removeInlineTagsColorStyles } from 'src/utils/remove';




export const showPropSettings = (settingTab: PPSettingTab) => {
    const {containerEl, plugin} = settingTab

    new Setting(containerEl)
    .setName(i18n.t("ADD_PADDINGS_TO_LIST_PROPERTIES"))
    .setDesc(i18n.t("ADD_PADDINGS_DESC"))
    .addDropdown(drop => drop
        .addOptions({
            "all": i18n.t("ALL"),
            "none": i18n.t("NONE"),
            "colored": i18n.t("ONLY_COLORED"),
            "non-transparent": i18n.t("ONLY_NON_TRANSPARENT")
        })
        .setValue(plugin.settings.addPillPadding)
        .onChange((value) => {
            plugin.settings.addPillPadding = value
            plugin.saveSettings()
            updatePillPaddings(plugin)
        })
    )

    new Setting(containerEl)
    .setName(i18n.t("ENABLE_COLORED_PROPERTIES"))
    .addToggle(toggle => {
        toggle.setValue(plugin.settings.enableColoredProperties)
        .onChange(value => {
            plugin.settings.enableColoredProperties = value
            plugin.saveSettings()
            updateAllProperties(plugin);
            if (!value) {
                removeColorStyles()
            }
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
            if (!value) {
                removeInlineTagsColorStyles()
            }
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
        .setName(i18n.t("HIDE_PROPERTIES_IN_SIDEBAR"))
        .addToggle(toggle => toggle
            .setValue(plugin.settings.hidePropertiesInPropTab)
            .onChange(async (value) => {
                plugin.settings.hidePropertiesInPropTab = value
                await plugin.saveSettings();
                updateHiddenPropertiesInPropTab(plugin)
            }));




    new Setting(containerEl)
    .setName(i18n.t("SHOW_COLORED_PROPERTIES"))
    .addToggle(toggle => {
        toggle.setValue(plugin.settings.showColorSettings)
        .onChange(value => {
            plugin.settings.showColorSettings = value
            plugin.saveSettings()
            settingTab.display()
        })
    });

    if (plugin.settings.showColorSettings) { 
        showColoredListSettings(settingTab)
    }


    new Setting(containerEl)
    .setName(i18n.t("SHOW_COLORED_TAGS"))
    .addToggle(toggle => {
        toggle.setValue(plugin.settings.showTagColorSettings)
        .onChange(value => {
            plugin.settings.showTagColorSettings = value
            plugin.saveSettings()
            settingTab.display()
        })
    });

    if (plugin.settings.showTagColorSettings) { 
        showColoredTagsSettings(settingTab)
    }



    new Setting(containerEl)
    .setName(i18n.t("SHOW_TEXT_COLORED_PROPERTIES"))
    .addToggle(toggle => {
        toggle.setValue(plugin.settings.showTextColorSettings)
        .onChange(value => {
            plugin.settings.showTextColorSettings = value
            plugin.saveSettings()
            settingTab.display()
        })
    });

    if (plugin.settings.showTextColorSettings) { 
        showColoredTextSettings(settingTab)
    }

    new Setting(containerEl)
    .setName(i18n.t("SHOW_HIDDEN_PROPERTIES_LIST"))
    .addToggle(toggle => {
        toggle.setValue(plugin.settings.showHiddenSettings)
        .onChange(value => {
            plugin.settings.showHiddenSettings = value
            plugin.saveSettings()
            settingTab.display()
        })
    });

    if (plugin.settings.showHiddenSettings) { 
        showHiddenSettings(settingTab)
    }
}