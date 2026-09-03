import { Menu, Setting, moment } from 'obsidian';
import { i18n } from 'src/localization/localization';
import { updateAllProperties } from 'src/updates/updateElements';
import { PPSettingTab } from 'src/settings/settings';
import { showColoredListSettings } from './coloredListSettings';
import { showColoredTagsSettings } from './coloredTagsSettings';
import { showColoredTextSettings } from './coloredTextSettings';
import { setPillStyles, updateTagPaneTagsAll } from 'src/updates/updatePills';
import { setColorMenuItems } from 'src/menus/selectColorMenus';
import { updateColoredTagsStyle } from 'src/updates/updateStyles';
import { AddTextModal } from 'src/modals/settingItemModals';






export const getColorSettingsDefinitions = (tab: PPSettingTab) => {
    let plugin = tab.plugin

    let propertyPillColorsKeys = Object.keys(plugin.settings.propertyPillColors)
    let tagColorsKeys = Object.keys(plugin.settings.tagColors)
    let propertyLongtextColorsKeys = Object.keys(plugin.settings.propertyLongtextColors)


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
                    heading: i18n.t("COLORED_PROPERTIES"),
                    addItem: {
                        name: i18n.t("ADD_COLORED_PROPERTY"),
                        action: () => {
                            new AddTextModal(plugin, async (newProperty) => {
                                if (newProperty && !plugin.settings.propertyPillColors[newProperty]) {
                                    plugin.settings.propertyPillColors[newProperty] = {}
                                    await plugin.saveSettings()
                                    tab.update()
                                }
                            }).open()
                        }
                    },
                    onDelete: async (idx: number) => {
                        let key = propertyPillColorsKeys[idx] || ""
                        delete plugin.settings.propertyPillColors[key]
                        await plugin.saveSettings();
                        tab.update();
                    },
                    items: propertyPillColorsKeys.map(property => ({
                        name: property,
                        searchable: false,
                        render: (setting: Setting) => {

                            setting.nameEl.empty()
                            let pillEl = setting.nameEl.createDiv({
                                cls: "multi-select-pill setting-multi-select-pill"
                            })   
                            setPillStyles(pillEl, "data-property-pill-value", property, "multiselect-pill", plugin)
                            pillEl.createDiv({text: property, cls: "multi-select-pill-content"})

                            setting.addButton((btn) => {
                                btn
                                .setIcon("paintbrush")
                                .setClass("property-color-setting-button")
                                .onClick((e) => {
                                    let menu = new Menu();
                                    setColorMenuItems(menu, property, "propertyPillColors", "pillColor", plugin);
                                    menu.showAtMouseEvent(e);
                                });
                            })
                            .addButton((btn) => {
                                btn
                                .setIcon("type")
                                .setClass("property-color-setting-button")
                                .onClick((e) => {
                                    let menu = new Menu();
                                    setColorMenuItems(menu, property, "propertyPillColors", "textColor", plugin);
                                    menu.showAtMouseEvent(e);
                                });
                            })
                        }
                    }))
                },
            ]
        },
        {
            type: "page",
            name: i18n.t("SHOW_COLORED_TAGS"),
            visible: plugin.settings.enableColoredProperties,
            items: [
                {
                    type: "list",
                    heading: i18n.t("COLORED_TAGS"),
                    addItem: {
                        name: i18n.t("ADD_COLORED_TAG"),
                        action: () => {
                            new AddTextModal(plugin, async (newProperty) => {
                                if (newProperty && !plugin.settings.tagColors[newProperty]) {
                                    plugin.settings.tagColors[newProperty] = {}
                                    await plugin.saveSettings()
                                    tab.update()
                                }
                            }).open()
                        }
                    },
                    onDelete: async (idx: number) => {
                        let key = tagColorsKeys[idx] || ""
                        delete plugin.settings.tagColors[key]
                        await plugin.saveSettings();
                        tab.update();
                    },
                    items: tagColorsKeys.map(property => ({
                        name: property,
                        searchable: false,
                        render: (setting: Setting) => {

                            setting.nameEl.empty()
                            let pillEl = setting.nameEl.createDiv({
                                cls: "multi-select-pill setting-tag-pill"
                            })   
                            setPillStyles(pillEl, "data-tag-value", property, "tag", plugin)
                            pillEl.createDiv({text: property, cls: "multi-select-pill-content"})

                            setting.addButton((btn) => {
                                btn
                                .setIcon("paintbrush")
                                .setClass("property-color-setting-button")
                                .onClick((e) => {
                                    let menu = new Menu();
                                    setColorMenuItems(menu, property, "tagColors", "pillColor", plugin);
                                    menu.showAtMouseEvent(e);
                                });
                            })
                            .addButton((btn) => {
                                btn
                                .setIcon("type")
                                .setClass("property-color-setting-button")
                                .onClick((e) => {
                                    let menu = new Menu();
                                    setColorMenuItems(menu, property, "tagColors", "textColor", plugin);
                                    menu.showAtMouseEvent(e);
                                });
                            })
                        }
                    }))
                }
            ]
        }, 
        {
            type: "page",
            name: i18n.t("SHOW_TEXT_COLORED_PROPERTIES"),
            visible: plugin.settings.enableColoredProperties,
            items: [
                {
                    type: "list",
                    heading: i18n.t("TEXT_COLORED_PROPERTIES"),
                    addItem: {
                        name: i18n.t("ADD_TEXT_COLORED_PROPERTY"),
                        action: () => {
                            new AddTextModal(plugin, async (newProperty) => {
                                if (newProperty && !plugin.settings.propertyLongtextColors[newProperty]) {
                                    plugin.settings.propertyLongtextColors[newProperty] = {}
                                    await plugin.saveSettings()
                                    tab.update()
                                }
                            }).open()
                        }
                    },
                    onDelete: async (idx: number) => {
                        let key = propertyLongtextColorsKeys[idx] || ""
                        delete plugin.settings.propertyLongtextColors[key]
                        await plugin.saveSettings();
                        tab.update();
                    },
                    items: propertyLongtextColorsKeys.map(property => ({
                        name: property,
                        searchable: false,
                        render: (setting: Setting) => {

                            setting.nameEl.empty()
                            let pillEl = setting.nameEl.createDiv({
                                text: property,
                                cls: "metadata-input-longtext setting-longtext-pill"
                            })   
                            setPillStyles(pillEl, "data-property-longtext-value", property, "longtext", plugin)
                            

                            setting.addButton((btn) => {
                                btn
                                .setIcon("paintbrush")
                                .setClass("property-color-setting-button")
                                .onClick((e) => {
                                    let menu = new Menu();
                                    setColorMenuItems(menu, property, "propertyLongtextColors", "pillColor", plugin);
                                    menu.showAtMouseEvent(e);
                                });
                            })
                            .addButton((btn) => {
                                btn
                                .setIcon("type")
                                .setClass("property-color-setting-button")
                                .onClick((e) => {
                                    let menu = new Menu();
                                    setColorMenuItems(menu, property, "propertyLongtextColors", "textColor", plugin);
                                    menu.showAtMouseEvent(e);
                                });
                            })
                        }
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
