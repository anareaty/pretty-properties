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
} from 'src/updates/updateStyles';
import { showHiddenEmptySettings, showHiddenSettings } from './hiddenSettings';
import { AddPropertyModal } from 'src/modals/settingItemModals';
import { updateHiddenProperties } from 'src/updates/updateHiddenProperties';




export const getHiddenSettingsDefinitions = (tab: PPSettingTab) => {
    let plugin = tab.plugin

    let allPropertyTypes = ["aliases", "checkbox", "date", "datetime", "multitext", "number", "tags", "text", "unknown"]
    return [
        {
            name: i18n.t("HIDE_PROPERTIES_IN_SIDEBAR"),
            render: (setting: Setting) => {
                setting.addToggle(toggle => toggle
                    .setValue(plugin.settings.hidePropertiesInPropTab)
                    .onChange(async (value) => {
                        plugin.settings.hidePropertiesInPropTab = value
                        await plugin.saveSettings();
                        updateHiddenPropertiesInPropTab(plugin)
                    }));
            }
        }, 
        {
            name: i18n.t("HIDE_ALL_EMPTY_PROPERTIES"),
            render: (setting: Setting) => {
                setting.addToggle(toggle => toggle
                    .setValue(plugin.settings.hideAllEmptyProperties)
                    .onChange(async (value) => {
                        plugin.settings.hideAllEmptyProperties = value
                        await plugin.saveSettings();
                        updateHiddenEmptyProperties(plugin)
                    }));
            }
        }, 
        {
            name: i18n.t("HIDE_PROPERTIES_BLOCK_IF_ALL_PROPERTIES_HIDDEN_EDITING"),
            render: (setting: Setting) => {
                setting.addToggle(toggle => toggle
                    .setValue(plugin.settings.hideMetadataContainerIfAllPropertiesHiddenEditing)
                    .onChange(async (value) => {
                        plugin.settings.hideMetadataContainerIfAllPropertiesHiddenEditing = value
                        await plugin.saveSettings();
                        updateHiddenMetadataContainer(plugin)
                    }));
            }
        }, 
        {
            name: i18n.t("HIDE_PROPERTIES_BLOCK_IF_ALL_PROPERTIES_HIDDEN_READING"),
            render: (setting: Setting) => {
                setting.addToggle(toggle => toggle
                    .setValue(plugin.settings.hideMetadataContainerIfAllPropertiesHiddenReading)
                    .onChange(async (value) => {
                        plugin.settings.hideMetadataContainerIfAllPropertiesHiddenReading = value
                        await plugin.saveSettings();
                        updateHiddenMetadataContainer(plugin)
                    }));
            }
        }, 
        {
            name: i18n.t("AUTOHIDE_PROPS_WITH_BANNER"),
            description: i18n.t("AUTOHIDE_PROPS_WITH_BANNER_DESC"),
            render: (setting: Setting) => {
                setting.addToggle(toggle => toggle
                    .setValue(plugin.settings.autoHidePropertiesWithBanner)
                    .onChange(async (value) => {
                        plugin.settings.autoHidePropertiesWithBanner = value
                        await plugin.saveSettings();
                        updateAutoHideProps(plugin)
                    }));
            }
        }, 
        {
            name: i18n.t("HIDE_PROPERTIES_TITLE"),
            render: (setting: Setting) => {
                setting.addToggle(toggle => toggle
                    .setValue(plugin.settings.hidePropTitle)
                    .onChange(async (value) => {
                        plugin.settings.hidePropTitle = value
                        await plugin.saveSettings();
                        updateHidePropTitle(plugin)
                    }));
            }
        }, 
        {
            name: i18n.t("HIDE_ADD_PROPERTY_BUTTON"),
            render: (setting: Setting) => {
                setting.addToggle(toggle => toggle
                    .setValue(plugin.settings.hideAddPropertyButton)
                    .onChange(async (value) => {
                        plugin.settings.hideAddPropertyButton = value
                        await plugin.saveSettings();
                        updateHideMetadataAddButton(plugin)
                    }));
            }
        }, 
        {
            type: "page",
            name: i18n.t("SHOW_HIDDEN_PROPERTIES_LIST"),
            items: [
                {
                    type: "list",
                    heading: i18n.t("HIDDEN_PROPERTIES"),
                    addItem: {
                        name: i18n.t("ADD_HIDDEN_PROPERTY"),
                        action: () => {
                            new AddPropertyModal(allPropertyTypes, plugin, async (newProperty) => {
                                if (newProperty && !plugin.settings.hiddenProperties.find(p => p == newProperty)) {
                                    plugin.settings.hiddenProperties.push(newProperty)
                                    await plugin.saveSettings()
                                    updateHiddenProperties(plugin)
                                    tab.update()
                                }
                            }).open()
                        }
                    },
                    onDelete: async (idx: number) => {
                        plugin.settings.hiddenProperties.splice(idx, 1);
                        await plugin.saveSettings();
                        updateHiddenProperties(plugin)
                        tab.update();
                    },
                    items: plugin.settings.hiddenProperties.map(property => ({
                        name: property,
                        searchable: false
                    }))
                    
                }
            ]
        },
        {
            type: "page",
            name: i18n.t("SHOW_HIDDEN_WHEN_EMPTY_PROPERTIES_LIST"),
            items: [
                {
                    type: "list",
                    heading: i18n.t("HIDDEN_WHEN_EMPTY_PROPERTIES"),
                    addItem: {
                        name: i18n.t("ADD_HIDDEN_EMPTY_PROPERTY"),
                        action: () => {
                            new AddPropertyModal(allPropertyTypes, plugin, async (newProperty) => {
                                if (newProperty && !plugin.settings.hiddenWhenEmptyProperties.find(p => p == newProperty)) {
                                    plugin.settings.hiddenWhenEmptyProperties.push(newProperty)
                                    await plugin.saveSettings()
                                    updateHiddenProperties(plugin)
                                    tab.update()
                                }
                            }).open()
                        }
                    },
                    onDelete: async (idx: number) => {
                        plugin.settings.hiddenWhenEmptyProperties.splice(idx, 1);
                        await plugin.saveSettings();
                        updateHiddenProperties(plugin)
                        tab.update();
                    },
                    items: plugin.settings.hiddenWhenEmptyProperties.map(property => ({
                        name: property,
                        searchable: false
                    }))
                    
                }
            ]
        },

        
    ]
}








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
                await plugin.saveSettings()
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
                await plugin.saveSettings()
                settingTab.display()
            })
        }
    );

    if (plugin.settings.showHiddenEmptySettings) { 
        showHiddenEmptySettings(settingTab)
    }
}
