import { loadMathJax, Setting } from 'obsidian';
import { i18n } from 'src/localization/localization';
import { updateAllProperties } from 'src/utils/updates/updateElements';
import { PPSettingTab } from 'src/settings/settings';
import { updateAutoHideProps, updateBaseTagsStyle, updateHiddenEmptyProperties, updateHiddenMetadataContainer, updateHiddenPropertiesInPropTab, updateHideMetadataAddButton, updateHidePropTitle, updatePillPaddings } from 'src/utils/updates/updateStyles';
import { showColoredListSettings } from './coloredListSettings';
import { showColoredTagsSettings } from './coloredTagsSettings';
import { showColoredTextSettings } from './coloredTextSettings';
import { showHiddenEmptySettings, showHiddenSettings } from './hiddenSettings';
import { updateLongTexts, updateTagPaneTagsAll } from 'src/utils/updates/updatePills';
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
        .setName(i18n.t("HIDE_ALL_EMPTY_PROPERTIES"))
        .addToggle(toggle => toggle
            .setValue(plugin.settings.hideAllEmptyProperties)
            .onChange(async (value) => {
                plugin.settings.hideAllEmptyProperties = value
                await plugin.saveSettings();
                updateHiddenEmptyProperties(plugin)
            }));


    new Setting(containerEl)
        .setName(i18n.t("HIDE_PROPERTIES_BLOCK_IF_ALL_PROPERTIES_HIDDEN_EDITING"))
        .addToggle(toggle => toggle
            .setValue(plugin.settings.hideMetadataContainerIfAllPropertiesHiddenEditing)
            .onChange(async (value) => {
                plugin.settings.hideMetadataContainerIfAllPropertiesHiddenEditing = value
                await plugin.saveSettings();
                updateHiddenMetadataContainer(plugin)
            }));

    
    new Setting(containerEl)
        .setName(i18n.t("HIDE_PROPERTIES_BLOCK_IF_ALL_PROPERTIES_HIDDEN_READING"))
        .addToggle(toggle => toggle
            .setValue(plugin.settings.hideMetadataContainerIfAllPropertiesHiddenReading)
            .onChange(async (value) => {
                plugin.settings.hideMetadataContainerIfAllPropertiesHiddenReading = value
                await plugin.saveSettings();
                updateHiddenMetadataContainer(plugin)
            }));


    new Setting(containerEl)
        .setName(i18n.t("AUTOHIDE_PROPS_WITH_BANNER"))
        .setDesc(i18n.t("AUTOHIDE_PROPS_WITH_BANNER_DESC"))
        .addToggle(toggle => toggle
            .setValue(plugin.settings.autoHidePropertiesWithBanner)
            .onChange(async (value) => {
                plugin.settings.autoHidePropertiesWithBanner = value
                await plugin.saveSettings();
                updateAutoHideProps(plugin)
            }));



    new Setting(containerEl)
        .setName(i18n.t("HIDE_PROPERTIES_TITLE"))
        .addToggle(toggle => toggle
            .setValue(plugin.settings.hidePropTitle)
            .onChange(async (value) => {
                plugin.settings.hidePropTitle = value
                await plugin.saveSettings();
                updateHidePropTitle(plugin)
            }));


    
    new Setting(containerEl)
        .setName(i18n.t("HIDE_ADD_PROPERTY_BUTTON"))
        .addToggle(toggle => toggle
            .setValue(plugin.settings.hideAddPropertyButton)
            .onChange(async (value) => {
                plugin.settings.hideAddPropertyButton = value
                await plugin.saveSettings();
                updateHideMetadataAddButton(plugin)
            }));



    new Setting(containerEl)
        .setName(i18n.t("ENABLE_MATH"))
        .addToggle(toggle => toggle
            .setValue(plugin.settings.enableMath)
            .onChange(async (value) => {
                plugin.settings.enableMath = value
                await plugin.saveSettings();
                //@ts-ignore
                if (plugin.settings.enableMath && !window.MathJax) {
                    loadMathJax()
                }
                updateLongTexts(document.body, plugin)			
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


    new Setting(containerEl)
    .setName(i18n.t("SHOW_HIDDEN_WHEN_EMPTY_PROPERTIES_LIST"))
    .addToggle(toggle => {
        toggle.setValue(plugin.settings.showHiddenEmptySettings)
        .onChange(value => {
            plugin.settings.showHiddenEmptySettings = value
            plugin.saveSettings()
            settingTab.display()
        })
    });

    if (plugin.settings.showHiddenEmptySettings) { 
        showHiddenEmptySettings(settingTab)
    }
}