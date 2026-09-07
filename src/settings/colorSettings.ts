import { Menu, Setting, moment } from 'obsidian';
import { i18n } from 'src/localization/localization';
import { updateAllProperties } from 'src/updates/updateElements';
import { PPSettingTab, PillColorSettings } from 'src/settings/settings';
import { showColoredListSettings } from './coloredListSettings';
import { setPillStyles } from 'src/updates/updatePills';
import { propertyColorSaveCallback, setColorMenuItems, setDateColorMenuItems } from 'src/menus/selectColorMenus';
import { AddPropertyModal, AddTextModal } from 'src/modals/settingItemModals';






export const getColorSettingsDefinitions = (tab: PPSettingTab) => {
    let plugin = tab.plugin

    let propertyColorsKeys = Object.keys(plugin.settings.propertyColors) || []


    let format = "L"
    if (plugin.settings.enableCustomDateFormat && plugin.settings.customDateFormat) {
        format = plugin.settings.customDateFormat
    }
   


    let pastDate = moment().subtract(1, "days").format(format)
    let presentDate = moment().format(format)
    let futureDate = moment().add(1, "days").format(format)

   


    return [
        {
            name: i18n.t("ENABLE_COLORED_PROPERTIES"),
            render: (setting: Setting) => {
                setting.addToggle(toggle => {
                    toggle.setValue(plugin.settings.enableColoredProperties)
                    .onChange(async (value) => {
                        plugin.settings.enableColoredProperties = value
                        await plugin.saveSettings()
                        updateAllProperties(plugin);
                        tab.update()
                    })
                });
            }
        },  
        {
            type: "page",
            name: i18n.t("SHOW_COLORED_PROPERTIES"),
            visible: plugin.settings.enableColoredProperties,
            items: [
                {
                    type: "list",
                    heading: i18n.t("PROPERTIES"),
                    addItem: {
                        name: i18n.t("ADD_PROPERTY"),
                        action: () => {

                            new AddPropertyModal(["text", "multitext", "tags", "aliases"], plugin, async (newProperty) => {
                                if (newProperty && !plugin.settings.propertyColors[newProperty]) {
                                    plugin.settings.propertyColors[newProperty] = {}
                                    await plugin.saveSettings()
                                    tab.update()
                                }
                            }).open()
                        }
                    },
                    onDelete: async (idx: number) => {
                        let key = propertyColorsKeys[idx] || ""
                        delete plugin.settings.propertyColors[key]
                        await plugin.saveSettings();
                        tab.update();

                    },
                    items: propertyColorsKeys.map(propName => ({
                        type: "page",
                        name: propName,
                        items: [
                            {
                                type: "list",
                                heading: i18n.t("COLORED_VALUES_OF_PROPERTY") + " " + propName,
                                addItem: {
                                    name: i18n.t("ADD_COLORED_PROPERTY_VALUE"),
                                    action: () => {
                                        new AddTextModal(plugin, async (newValue) => {
                                            if (newValue && !plugin.settings.propertyColors[propName]![newValue]) {
                                                plugin.settings.propertyColors[propName]![newValue] = {}
                                                await plugin.saveSettings()
                                                tab.update()
                                            }
                                        }).open()
                                    }
                                },
                                onDelete: async (idx: number) => {
                                    let key = Object.keys(plugin.settings.propertyColors[propName]!)[idx] || ""
                                    delete plugin.settings.propertyColors[propName]![key]
                                    await plugin.saveSettings();
                                    tab.update();
                                },
                                items: Object.keys(plugin.settings.propertyColors[propName]!).map((propVal) => ({
                                    name: propVal,
                                    searchable: false,
                                    render: (setting: Setting) => {

                                        setting.nameEl.empty()
                                        let pillEl = setting.nameEl.createDiv({
                                            cls: "multi-select-pill setting-multi-select-pill"
                                        })   
                                        setPillStyles(pillEl, propName, propVal, plugin)
                                        pillEl.createDiv({text: propVal, cls: "multi-select-pill-content"})

                                        let pillColorSettings = plugin.settings.propertyColors[propName]?.[propVal]
                                        let saveCallback = (pillColorSettings: PillColorSettings) => {
                                            propertyColorSaveCallback(propName, propVal, pillColorSettings, plugin)
                                        }

                                        setting.addButton((btn) => {
                                            btn
                                            .setIcon("paintbrush")
                                            .setClass("property-color-setting-button")
                                            .onClick((e) => {
                                                let menu = new Menu();
                                                setColorMenuItems(menu, "pillColor", pillColorSettings, saveCallback, plugin);
                                                menu.showAtMouseEvent(e);
                                            });
                                        })
                                        .addButton((btn) => {
                                            btn
                                            .setIcon("type")
                                            .setClass("property-color-setting-button")
                                            .onClick((e) => {
                                                let menu = new Menu();
                                                setColorMenuItems(menu, "textColor", pillColorSettings, saveCallback, plugin);
                                                menu.showAtMouseEvent(e);
                                            });
                                        })
                                    }
                                }))
                            }
                        ]

                    }))
                },
            ]
        },


        



        {
            name: i18n.t("PAST_DATE_COLOR"),
            visible: plugin.settings.enableColoredProperties,
            render: (setting: Setting) => {
                setting.controlEl.createSpan({text: pastDate, cls: "custom-date setting-custom-date-past"})

                setting
                .addButton((btn) => {
                    btn.setIcon("paintbrush").setClass("property-color-setting-button").onClick((e) => {
                        let menu = new Menu();
                        setDateColorMenuItems(menu, "past", "pillColor", plugin);
                        
                        menu.showAtMouseEvent(e);
                    });
                })
                .addButton((btn) => {
                    btn.setIcon("type").setClass("property-color-setting-button").onClick((e) => {
                        let menu = new Menu();
                        setDateColorMenuItems(menu, "past", "textColor", plugin);
                        menu.showAtMouseEvent(e);
                    });
                })
            }
        }, 
        {
            name: i18n.t("PRESENT_DATE_COLOR"),
            visible: plugin.settings.enableColoredProperties,
            render: (setting: Setting) => {
                setting.controlEl.createSpan({text: presentDate, cls: "custom-date setting-custom-date-present"})

                setting
                .addButton((btn) => {
                    btn.setIcon("paintbrush").setClass("property-color-setting-button").onClick((e) => {
                        let menu = new Menu();
                        setDateColorMenuItems(menu, "present", "pillColor", plugin);
                        menu.showAtMouseEvent(e);
                    });
                })
                .addButton((btn) => {
                    btn.setIcon("type").setClass("property-color-setting-button").onClick((e) => {
                        let menu = new Menu();
                        setDateColorMenuItems(menu, "present", "textColor", plugin);
                        menu.showAtMouseEvent(e);
                    });
                })
            }
        }, 
        {
            name: i18n.t("FUTURE_DATE_COLOR"),
            visible: plugin.settings.enableColoredProperties,
            render: (setting: Setting) => {
                setting.controlEl.createSpan({text: futureDate, cls: "custom-date setting-custom-date-future"})

                setting
                .addButton((btn) => {
                    btn.setIcon("paintbrush").setClass("property-color-setting-button").onClick((e) => {
                        let menu = new Menu();
                        setDateColorMenuItems(menu, "future", "pillColor", plugin);
                        menu.showAtMouseEvent(e);
                    });
                })
                .addButton((btn) => {
                    btn.setIcon("type").setClass("property-color-setting-button").onClick((e) => {
                        let menu = new Menu();
                        setDateColorMenuItems(menu, "future", "textColor", plugin);
                        menu.showAtMouseEvent(e);
                    });
                })
            }
        }
    ]









}





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
            setDateColorMenuItems(menu, "past", "pillColor", plugin);
            menu.showAtMouseEvent(e);
        });
    })
    .addButton((btn) => {
        btn.setIcon("type").setClass("property-color-setting-button").onClick((e) => {
            let menu = new Menu();
            setDateColorMenuItems(menu, "past", "textColor", plugin);
            menu.showAtMouseEvent(e);
        });
    })


    
    let presentSEtting = new Setting(containerEl)
    presentSEtting.controlEl.createSpan({text: presentDate, cls: "setting-custom-date-present"})
    presentSEtting.setName(i18n.t("PRESENT_DATE_COLOR"))
    .addButton((btn) => {
        btn.setIcon("paintbrush").setClass("property-color-setting-button").onClick((e) => {
            let menu = new Menu();
            setDateColorMenuItems(menu, "present", "pillColor", plugin);
            menu.showAtMouseEvent(e);
        });
    })
    .addButton((btn) => {
        btn.setIcon("type").setClass("property-color-setting-button").onClick((e) => {
            let menu = new Menu();
            setDateColorMenuItems(menu, "present", "textColor", plugin);
            menu.showAtMouseEvent(e);
        });
    })
    
    let futureSetting = new Setting(containerEl)
    futureSetting.controlEl.createSpan({text: futureDate, cls: "setting-custom-date-future"})
    futureSetting.setName(i18n.t("FUTURE_DATE_COLOR"))
    .addButton((btn) => {
        btn.setIcon("paintbrush").setClass("property-color-setting-button").onClick((e) => {
            let menu = new Menu();
            setDateColorMenuItems(menu, "future", "pillColor", plugin);
            menu.showAtMouseEvent(e);
        });
    })
    .addButton((btn) => {
        btn.setIcon("type").setClass("property-color-setting-button").onClick((e) => {
            let menu = new Menu();
            setDateColorMenuItems(menu, "future", "textColor", plugin);
            menu.showAtMouseEvent(e);
        });
    })




}
