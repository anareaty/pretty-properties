import { Setting } from 'obsidian';
import { i18n } from 'src/localization/localization';
import { PPSettingTab } from 'src/settings/settings';
import { 
    updateAutoHideProps, 
    updateHiddenEmptyProperties, 
    updateHiddenMetadataContainer, 
    updateHiddenPropertiesInPropTab, 
    updateHideMetadataAddButton, 
    updateHidePropTitle 
} from 'src/utils/updates/updateStyles';
import { showHiddenEmptySettings, showHiddenSettings } from './hiddenSettings';






export const showHiddenSettingsTab = (settingTab: PPSettingTab) => {
    const {containerEl, plugin} = settingTab


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
    .setName(i18n.t("SHOW_HIDDEN_PROPERTIES_LIST"))
    .addButton(button =>
        {
            let icon = "chevron-right"
            if (plugin.settings.showHiddenSettings) {
                icon = "chevron-down"
            }
            button.setIcon(icon)
            .setClass("bare-button")
            .onClick(async () => {
                plugin.settings.showHiddenSettings = !plugin.settings.showHiddenSettings
                plugin.saveSettings()
                settingTab.display()
            })
        }
    );





    if (plugin.settings.showHiddenSettings) { 
        showHiddenSettings(settingTab)
    }





    new Setting(containerEl)
    .setName(i18n.t("SHOW_HIDDEN_WHEN_EMPTY_PROPERTIES_LIST"))
    .addButton(button =>
        {
            let icon = "chevron-right"
            if (plugin.settings.showHiddenEmptySettings) {
                icon = "chevron-down"
            }
            button.setIcon(icon)
            .setClass("bare-button")
            .onClick(async () => {
                plugin.settings.showHiddenEmptySettings = !plugin.settings.showHiddenEmptySettings
                plugin.saveSettings()
                settingTab.display()
            })
        }
    );

    if (plugin.settings.showHiddenEmptySettings) { 
        showHiddenEmptySettings(settingTab)
    }
}
