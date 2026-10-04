import { i18n } from "src/localization/localization";
import { PPSettingTab } from "./settings";
import { AddPropertyModal, AddTextModal } from "src/modals/settingItemModals";
import { requireApiVersion, Setting } from "obsidian";
import { updateAllProperties } from "src/updates/updateElements";
import { PropertyNameSuggest } from "src/utils/propertyNameSuggester";



export const getAdditionalSettingsDefinitions = (tab: PPSettingTab) => {
    let plugin = tab.plugin
    let propertySelectOptionsKeys = Object.keys(plugin.settings.propertySelectOptions) || []
    let progressPropertiesKeys = Object.keys(plugin.settings.progressProperties) || []



    return [


        
        {
            type: "page",
            name: i18n.t("PROGRESS_BARS"),
            items: [

                {
                    name: i18n.t("SELECT_PROGRESS_SETTING"),
                    searchable: false
                },

                
                {
                    type: "list",
                    heading: i18n.t("PROPERTIES"),
                    addItem: {
                        name: i18n.t("ADD_PROPERTY"),
                        action: () => {
                            new AddPropertyModal(["number"], plugin, async (newProperty) => {
                                if (newProperty && !plugin.settings.progressProperties[newProperty]) {
                                    plugin.settings.progressProperties[newProperty] = {"maxNumber": 100}
                                    await plugin.saveSettings()
                                    if (requireApiVersion("1.13.0")) {
                                        tab.update()			
                                    }
                                }
                            }).open()
                        }
                    },
                    items: progressPropertiesKeys.map(propName => ({
                        type: "page",
                        name: propName,
                        searchable: false,
                        items: [

                            
                            {
                                name: i18n.t("REMOVE_PROGRESS_BAR"),
                                searchable: false,
                                render: (setting: Setting) => {
                                    setting.addExtraButton(btn => btn
                                        .setIcon("x")
                                        .onClick(async () => {
                                            delete plugin.settings.progressProperties[propName]
                                            await plugin.saveSettings();
                                            updateAllProperties(plugin)
                                            if (requireApiVersion("1.13.0")) {
                                                tab.update()			
                                            }
                                        })
                                    )
                                }
                            }, 
                            {
                                name: i18n.t("SET_MAX_VALUE_PROPERTY"),
                                desc: i18n.t("SET_MAX_VALUE_PROPERTY_DESC"),
                                searchable: false,
                                render: (setting: Setting) => {

                                    let maxProperty = plugin.settings.progressProperties[propName]!.maxProperty || ""


                                    setting
                                    .addSearch((search) => {
                                        search.setValue(maxProperty)
                                        search.setPlaceholder(i18n.t("PROPERTY_SEARCH_PLACEHOLDER"));
                            
                                        const suggester = new PropertyNameSuggest(plugin.app, search.inputEl, ["number"]);
                                        suggester.onSelect(async (value) => {

                                            suggester.setValue(value);

                                            if (value) {
                                              
                                                plugin.settings.progressProperties[propName]!.maxProperty = value
                                                delete plugin.settings.progressProperties[propName]!.maxNumber
                                            } 

                                            suggester.close();
                                            await plugin.saveSettings()
                                            updateAllProperties(plugin)

                                            
                                        })


                                        const deleteValue = async () => {
                                            let value = search.getValue()
                                            if (!value) {
                                                delete plugin.settings.progressProperties[propName]!.maxProperty
                                                plugin.settings.progressProperties[propName]!.maxNumber = 100
                                                await plugin.saveSettings()
                                                updateAllProperties(plugin)
                                            }
                                        }

                                        search.onChanged = () => {
                                            void deleteValue()
                                        }
                                    })
                                }
                            }

                            
                        ]
                    }))
                }
                    
            ]
        },

        
        {
            type: "page",
            name: i18n.t("SELECTION_BUTTONS"),
            items: [

                {
                    name: i18n.t("SELECT_SELECTION_BUTTON_SETTING"),
                    desc: i18n.t("SELECT_SELECTION_BUTTON_DESC"),
                    searchable: false
                },

                {
                    type: "list",
                    heading: i18n.t("PROPERTIES"),
                    addItem: {
                        name: i18n.t("ADD_PROPERTY"),
                        action: () => {

                      
 
                            new AddPropertyModal(["text"], plugin, async (newProperty) => {
                                if (newProperty && !plugin.settings.propertySelectOptions[newProperty]) {
                                    plugin.settings.propertySelectOptions[newProperty] = []
                                    await plugin.saveSettings()
                                    if (requireApiVersion("1.13.0")) {
                                        tab.update()			
                                    }
                                }
                            }).open()
                        }
                    },
                    items: propertySelectOptionsKeys.map(propName => ({
                        type: "page",
                        name: propName,
                        searchable: false,
                        items: [
                            {
                                name: i18n.t("DELETE_SELECTION_BUTTON_SETTINGS_FOR_PROPERTY") + " " + propName,
                                searchable: false,
                                render: (setting: Setting) => {
                                    setting.addExtraButton(btn => btn
                                        .setIcon("x")
                                        .onClick(async () => {
                                            delete plugin.settings.propertySelectOptions[propName]
                                            await plugin.saveSettings();
                                            updateAllProperties(plugin)
                                            if (requireApiVersion("1.13.0")) {
                                                tab.update()			
                                            }
                                        })
                                    )
                                }
                            }, 
                            {
                                type: "list",
                                heading: i18n.t("RULES"),
                                addItem: {
                                    name: i18n.t("ADD_RULE"),
                                    action: () => {
                                        new AddTextModal(plugin, i18n.t("ADD_RULE_PATH"), async (newRule) => {
                                            if (!plugin.settings.propertySelectOptions[propName]!.find(r => r.path == newRule)) {
                                                plugin.settings.propertySelectOptions[propName]?.push({
                                                    path: newRule,
                                                    options: []
                                                })
                                                await plugin.saveSettings()
                                                if (requireApiVersion("1.13.0")) {
                                                    tab.update()			
                                                }
                                            }
                                        }).open()
                                    }
                                },
                                items: plugin.settings.propertySelectOptions[propName]?.map(rule => ({
                                    
                                    type: "page",
                                    name: rule.path ? i18n.t("RULE_FOR_FOLDER") + ": " + rule.path : i18n.t("DEFAULT_RULE"),
                                    searchable: false,
                                    items: [
                                        {
                                            name: i18n.t("DELETE_RULE_FOR_THIS_FOLDER"),
                                            searchable: false,
                                            render: (setting: Setting) => {
                                                setting.addExtraButton(btn => btn
                                                    .setIcon("x")
                                                    .onClick(async () => {
                                                        plugin.settings.propertySelectOptions[propName] = plugin.settings.propertySelectOptions[propName]!
                                                        .filter(r => r.path != rule.path)
                                                        await plugin.saveSettings();
                                                        updateAllProperties(plugin)
                                                        if (requireApiVersion("1.13.0")) {
                                                            tab.update()			
                                                        }
                                                    })
                                                )
                                            }
                                        }, 
                                        {
                                            type: "list",
                                            heading: i18n.t("OPTIONS_FOR_THE_PROPERTY") + " " + propName + " " + i18n.t("IN_FOLDER") + " " + rule.path,
                                            addItem: {
                                                name: i18n.t("ADD_OPTION"),
                                                action: () => {
                                                    new AddTextModal(plugin, i18n.t("ADD_OPTION"), async (newOption) => {
                                                        if (newOption && !rule.options.find(o => o == newOption)) {
                                                            rule.options.push(newOption)
                                                            await plugin.saveSettings()
                                                            updateAllProperties(plugin)
                                                            if (requireApiVersion("1.13.0")) {
                                                                tab.update()			
                                                            }
                                                        }
                                                    }).open()
                                                }
                                            },
                                            onReorder: async (oldIndex: number, newIndex: number) => {
                                                let [moved] = rule.options.splice(oldIndex, 1)
                                                if (moved) {
                                                    rule.options.splice(newIndex, 0, moved)
                                                }
                                                await plugin.saveSettings()
                                                updateAllProperties(plugin)
                                                if (requireApiVersion("1.13.0")) {
                                                    tab.update()			
                                                }
                                            },
                                            items: rule.options.map(option => ({
                                                name: option,
                                                searchable: false,
                                            })),
                                            onDelete: async (idx: number) => {
                                                rule.options.splice(idx, 1)
                                                await plugin.saveSettings()
                                                updateAllProperties(plugin)
                                                if (requireApiVersion("1.13.0")) {
                                                    tab.update()			
                                                }
                                            }
                                        }
                                    ],
                                    
                                }))

                            }
                        ]

                    }))
                },
            ]
        }

        
    ]
}







export const showAdditionalSettingsTab = (settingTab: PPSettingTab) => {
    const {containerEl, plugin} = settingTab

	
    
    new Setting(containerEl)
    .setName(i18n.t("PROGRESS_BARS"))
    .addExtraButton(button =>
        {
            let icon = "chevron-right"
            if (plugin.settings.showProgressBars) {
                icon = "chevron-down"
            }
            button.setIcon(icon)
            .onClick(async () => {
                plugin.settings.showProgressBars = !plugin.settings.showProgressBars
                await plugin.saveSettings()
                settingTab.display()
            })
        }
    );



    if (plugin.settings.showProgressBars) {
        let progressSettingsWrapper = containerEl.createDiv()
        progressSettingsWrapper.classList.add("pp-settings-list-container")
        let colorSettingsEl = progressSettingsWrapper.createDiv()

        

        for (let propName in plugin.settings.progressProperties) {

            let propContainer = colorSettingsEl.createDiv()
            propContainer.classList.add("pp-settings-list-inner-container")


            let maxProperty = plugin.settings.progressProperties[propName]!.maxProperty || ""


            new Setting(propContainer)
            .setName(propName)
            .addExtraButton(btn => btn
                .setIcon("x")
                .onClick(async () => {
                    delete plugin.settings.progressProperties[propName]
                    await plugin.saveSettings()
                    propContainer.remove()
                    updateAllProperties(plugin)
                })
            )



            new Setting(propContainer)
            .setName(i18n.t("SET_MAX_VALUE_PROPERTY"))
            .setDesc(i18n.t("SET_MAX_VALUE_PROPERTY_DESC"))
            .addSearch((search) => {
                search.setValue(maxProperty)
                search.setPlaceholder(i18n.t("PROPERTY_SEARCH_PLACEHOLDER"));

                const suggester = new PropertyNameSuggest(plugin.app, search.inputEl, ["number"]);
                suggester.onSelect(async (value) => {

                    suggester.setValue(value);

                    if (value) {
                        
                        plugin.settings.progressProperties[propName]!.maxProperty = value
                        delete plugin.settings.progressProperties[propName]!.maxNumber
                    } 

                    suggester.close();
                    await plugin.saveSettings()
                    updateAllProperties(plugin)

                    
                })


                const deleteValue = async () => {
                    let value = search.getValue()
                    if (!value) {
                        delete plugin.settings.progressProperties[propName]!.maxProperty
                        plugin.settings.progressProperties[propName]!.maxNumber = 100
                        await plugin.saveSettings()
                        updateAllProperties(plugin)
                    }
                }

                search.onChanged = () => {
                    void deleteValue()
                }
            })

        }


        

        new Setting(progressSettingsWrapper)
        .setName(i18n.t("ADD_PROPERTY"))



        

        .addExtraButton(btn => btn
            .setIcon("plus")
            .onClick(async () => {

                new AddPropertyModal(["number"], plugin, async (newProperty) => {
                    if (newProperty && !plugin.settings.progressProperties[newProperty]) {
                        plugin.settings.progressProperties[newProperty] = {"maxNumber": 100}
                        await plugin.saveSettings()
                        settingTab.display()
                    }
                }).open()
            })
        )
    }









    new Setting(containerEl)
    .setName(i18n.t("SELECTION_BUTTONS"))
    .addExtraButton(button =>
        {
            let icon = "chevron-right"
            if (plugin.settings.showSelectionButtons) {
                icon = "chevron-down"
            }
            button.setIcon(icon)
            .onClick(async () => {
                plugin.settings.showSelectionButtons = !plugin.settings.showSelectionButtons
                await plugin.saveSettings()
                settingTab.display()
            })
        }
    );











    if (plugin.settings.showSelectionButtons) {
        let progressSettingsWrapper = containerEl.createDiv()
        progressSettingsWrapper.classList.add("pp-settings-list-container")
        let colorSettingsEl = progressSettingsWrapper.createDiv()

        

        for (let propName in plugin.settings.propertySelectOptions) {

            let propContainer = colorSettingsEl.createDiv()
            propContainer.classList.add("pp-settings-list-inner-container")


            new Setting(propContainer)
            .setName(propName)




            .addExtraButton(button => {
            button
                .setIcon("plus")
                .onClick(async () => {

                    new AddTextModal(plugin, i18n.t("ADD_RULE_PATH"), async (newRule) => {
                        if (!plugin.settings.propertySelectOptions[propName]!.find(r => r.path == newRule)) {
                            plugin.settings.propertySelectOptions[propName]?.push({
                                path: newRule,
                                options: []
                            })
                            await plugin.saveSettings()
                            settingTab.display()
                        }
                    }).open()
                })
            })




            .addExtraButton(button =>
            {
                let icon = "chevron-right"
                if (plugin.settings.propertySelectSettingRevealed == propName) {
                    icon = "chevron-down"
                }
                button.setIcon(icon)
                .onClick(async () => {

                    if (plugin.settings.propertySelectSettingRevealed == propName) {
                        plugin.settings.propertySelectSettingRevealed = ""
                    } else {
                        plugin.settings.propertySelectSettingRevealed = propName
                    }
                    await plugin.saveSettings()
                    settingTab.display()
                })
            }
        )


            .addExtraButton(btn => btn
                .setIcon("x")
                .onClick(async () => {
                    delete plugin.settings.propertySelectOptions[propName]
                    await plugin.saveSettings()
                    propContainer.remove()
                    updateAllProperties(plugin)
                })
            )


            





            if (plugin.settings.propertySelectSettingRevealed == propName && plugin.settings.propertySelectOptions[propName]) {


                

                for (let rule of plugin.settings.propertySelectOptions[propName]) {


                    let ruleContainer = propContainer.createDiv()
                ruleContainer.classList.add("pp-settings-list-rule-inner-container")


                
                    new Setting(ruleContainer)
                    .setName(rule.path ? i18n.t("RULE_FOR_FOLDER") + ": " + rule.path : i18n.t("DEFAULT_RULE"))


                    .addExtraButton(button => {
                        button
                            .setIcon("plus")
                            .setTooltip(i18n.t("ADD_OPTION"))
                            .onClick(async () => {

                                new AddTextModal(plugin, i18n.t("ADD_OPTION"), async (newOption) => {
                                    if (newOption && !rule.options.find(o => o == newOption)) {
                                        rule.options.push(newOption)
                                        await plugin.saveSettings()
                                        updateAllProperties(plugin)
                                        settingTab.display()
                                    }
                                }).open()
                            })
                        })




                    .addExtraButton(button =>
                        {
                            let icon = "chevron-right"
                            if (plugin.settings.propertySelectPathRevealed === rule.path) {
                                icon = "chevron-down"
                            }
                            button.setIcon(icon)
                            .onClick(async () => {

                                if (plugin.settings.propertySelectPathRevealed === rule.path) {
                                    plugin.settings.propertySelectPathRevealed = undefined
                                } else {
                                    plugin.settings.propertySelectPathRevealed = rule.path
                                }
                                await plugin.saveSettings()
                                settingTab.display()
                            })
                        }
                    )


                    .addExtraButton(btn => btn
                        .setIcon("x")
                        .onClick(async () => {
                            plugin.settings.propertySelectOptions[propName] = plugin.settings.propertySelectOptions[propName]!
                            .filter(r => r.path != rule.path)
                            await plugin.saveSettings()
                            ruleContainer.remove()
                            updateAllProperties(plugin)
                        })
                    )



















                    if (plugin.settings.propertySelectPathRevealed == rule.path) {

                        let optionContainer = ruleContainer.createDiv()
                        optionContainer.classList.add("pp-settings-list-options-inner-container")

                        for (let option of rule.options) {


                            



                            let optionSetting = new Setting(optionContainer)
                            .setName(option)



                            .addExtraButton(btn => btn
                                .setIcon("x")
                                .onClick(async () => {
                                    rule.options = rule.options.filter(o => o != option)
                                    await plugin.saveSettings()
                                    optionSetting.settingEl.remove()
                                    updateAllProperties(plugin)
                                })
                            )


                            




                        }
                    }


















                }
            }






















            

























           


        }



        









        


        

        new Setting(progressSettingsWrapper)
        .setName(i18n.t("ADD_PROPERTY"))



        

        .addExtraButton(btn => btn
            .setIcon("plus")
            .onClick(async () => {


                new AddPropertyModal(["text"], plugin, async (newProperty) => {
                    if (newProperty && !plugin.settings.propertySelectOptions[newProperty]) {
                        plugin.settings.propertySelectOptions[newProperty] = []
                        await plugin.saveSettings()
                        settingTab.display()
                    }
                }).open()
            })
        )
    }








}