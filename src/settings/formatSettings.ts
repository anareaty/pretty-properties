import { Setting } from 'obsidian';
import { i18n } from 'src/localization/localization';
import { updateAllProperties } from 'src/updates/updateElements';
import { PPSettingTab } from 'src/settings/settings';
import {PropertyNameSuggest} from "../utils/propertyNameSuggester";
import {enhanceFormatTextArea} from "../utils/settingsHelper";
import { AddPropertyModal, FormatTemplateModal } from 'src/modals/settingItemModals';





export const getFormatSettingsDefinitions = (tab: PPSettingTab) => {
    let plugin = tab.plugin
    let datePlaceholder = "DD.MM.YYYY"
    let dateTimePlaceholder = "DD.MM.YYYY HH:mm"

    let propertyFormatsKeys = Object.keys(plugin.settings.propertyFormats)

    return [
        
        {
            type: "group",
          
            items: [
                {
                    name: i18n.t("ENABLE_CUSTOM_DATE_FORMAT"),
                    render: (setting: Setting) => {
                        setting.addToggle(toggle => toggle
                            .setValue(plugin.settings.enableCustomDateFormat)
                            .onChange(async (value) => {
                                plugin.settings.enableCustomDateFormat = value
                                await plugin.saveSettings();
                                tab.update()
                                updateAllProperties(plugin);
                            }));
                    }
                }, {
                    name: i18n.t("ENABLE_CUSTOM_DATE_FORMAT_IN_BASES"),
                    visible: plugin.settings.enableCustomDateFormat,
                    render: (setting: Setting) => {
                        setting.addToggle(toggle => toggle
                            .setValue(plugin.settings.enableCustomDateFormatInBases)
                            .onChange(async (value) => {
                                plugin.settings.enableCustomDateFormatInBases = value
                                await plugin.saveSettings();
                                tab.update()
                                updateAllProperties(plugin);
                        }));
                    }
                }, {
                    name: i18n.t("CUSTOM_DATE_FORMAT"),
                    visible: plugin.settings.enableCustomDateFormat,
                    render: (setting: Setting) => {
                        setting.addText(text => text
                            .setPlaceholder(datePlaceholder)
                            .setValue(plugin.settings.customDateFormat)
                            .onChange(async (value) => {
                                plugin.settings.customDateFormat = value;
                                await plugin.saveSettings();
                                updateAllProperties(plugin);
                            }));
                    }
                }, {
                    name: i18n.t("CUSTOM_DATETIME_FORMAT"),
                    visible: plugin.settings.enableCustomDateFormat,
                    render: (setting: Setting) => {
                        setting.addText(text => text
                            .setPlaceholder(dateTimePlaceholder)
                            .setValue(plugin.settings.customDateTimeFormat)
                            .onChange(async (value) => {
                                plugin.settings.customDateTimeFormat = value;
                                await plugin.saveSettings();
                                updateAllProperties(plugin);
                            }));
                    }
                }
            ]
        },

        
       {
            type: "page",
            name: i18n.t("SHOW_EXTRA_PROPERTY_FORMATTINGS"),
            description: i18n.t("PROPERTY_FORMAT_DESC"),
            items: [
                {
                    type: "list",
                    heading: i18n.t("EXTRA_FORMATTINGS"),
                    
                    addItem: {
                        name: i18n.t("ADD_PROPERTY_FORMAT"),
                        action: () => {
                            new AddPropertyModal(["text", "number", "date", "datetime"], plugin, async (newProperty) => {
                                if (newProperty && !plugin.settings.propertyFormats[newProperty]) {
                                    plugin.settings.propertyFormats[newProperty] = {
                                        format: ""
                                    }
                                    await plugin.saveSettings()
                                    tab.update()
                                }
                            }).open()
                        }
                    },
                    onDelete: async (idx: number) => {
                        let key = propertyFormatsKeys[idx] || ""
                        delete plugin.settings.propertyFormats[key]
                        await plugin.saveSettings();
                        updateAllProperties(plugin);
                        tab.update();
                    },
                    items: propertyFormatsKeys.map(key => ({
                        name: key,
                        searchable: false,
                        render: (setting: Setting) => {

                            let property = plugin.settings.propertyFormats[key]!


                            setting.addButton(btn => {
                                let format = property.format || ""
                                if (format) {
                                    btn.setClass("cover-has-format")
                                }
                                
                                btn
                                .setIcon("code-square")
                                .setTooltip(i18n.t("SET_PROPERTY_FORMAT"))
                                .onClick(() => {
                                    new FormatTemplateModal(plugin, "PROPERTY_FORMAT_TEMPLATE", format, async (newFormat) => {
                                        property.format = newFormat
                                        await plugin.saveSettings();
                                        updateAllProperties(plugin);
                                        tab.update()
                                    }).open()
                                })
                            })
                        }
                    }))
                }
            ]
       },
        {
            type: "page",
            name: i18n.t("SHOW_MARKDOWN_PROPERTIES_LIST"),
            items: [
                {
                    type: "list",
                    heading: i18n.t("MARKDOWN_PROPERTIES"),
                    addItem: {
                        name: i18n.t("ADD_MARKDOWN_PROPERTY"),
                        action: () => {
                            new AddPropertyModal(["text", "number", "date", "datetime"], plugin, async (newProperty) => {
                                if (newProperty && !plugin.settings.markdownProperties.find(p => p == newProperty)) {
                                    plugin.settings.markdownProperties.push(newProperty)
                                    await plugin.saveSettings()
                                    updateAllProperties(plugin);
                                    tab.update()
                                }
                            }).open()
                        }
                    },
                    onDelete: async (idx: number) => {
                        plugin.settings.markdownProperties.splice(idx, 1);
                        await plugin.saveSettings();
                        updateAllProperties(plugin);
                        tab.update();
                    },
                    items: plugin.settings.markdownProperties.map(property => ({
                        name: property,
                        searchable: false
                    }))
                    
                }
            ]
        }
    ]
}




export const showFormatSettingsTab = (settingTab: PPSettingTab) => {
    const {containerEl, plugin} = settingTab

	new Setting(containerEl)
    .setHeading()
	.setName(i18n.t("DATES"))


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

    let datePlaceholder = "DD-MM-YYYY"
    let dateTimePlaceholder = "DD-MM-YYYY HH:mm"
    
    if (plugin.settings.enableCustomDateFormat) {
        new Setting(containerEl)
        .setName(i18n.t("CUSTOM_DATE_FORMAT"))
        .addText(text => text
            .setPlaceholder(datePlaceholder)
            .setValue(plugin.settings.customDateFormat)
            .onChange(async (value) => {
                plugin.settings.customDateFormat = value;
                await plugin.saveSettings();
                updateAllProperties(plugin);
            }));

        new Setting(containerEl)
        .setName(i18n.t("CUSTOM_DATETIME_FORMAT"))
        .addText(text => text
            .setPlaceholder(dateTimePlaceholder)
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





	let propertyFormatSetting = new Setting(containerEl)
		.setHeading()
		.setName(i18n.t("EXTRA_FORMATTINGS"))
		.setDesc(i18n.t("PROPERTY_FORMAT_DESC"));

	propertyFormatSetting.descEl.createEl("a", {
		text: "README",
		href: "https://github.com/anareaty/pretty-properties/blob/master/README.md",
	});



    


	



	new Setting(containerEl)
    .setName(i18n.t("SHOW_EXTRA_PROPERTY_FORMATTINGS"))
    .addButton(button =>
        {
            let icon = "chevron-right"
            if (plugin.settings.showExtraFormattings) {
                icon = "chevron-down"
            }
            button.setIcon(icon)
            .setClass("bare-button")
            .onClick(async () => {
                plugin.settings.showExtraFormattings = !plugin.settings.showExtraFormattings
                await plugin.saveSettings()
                settingTab.display()
            })
        }
    );





    if (plugin.settings.showExtraFormattings) { 
        showFormatSettings(settingTab)
    }



    


}










const showFormatSettings = (settingTab: PPSettingTab) => {
    const {containerEl, plugin} = settingTab

    let formatSettingsWrapper = containerEl.createDiv()

    formatSettingsWrapper.classList.add("pp-settings-list-container")

    let formatSettingsEl = formatSettingsWrapper.createDiv()


	const addFormatSetting = (property: string) => {
        let propertyFormatSetting = new Setting(formatSettingsEl)


		let entry = plugin.settings.propertyFormats[property]

        if (!entry) {
            entry = {
                format: ""
            }
        }

        propertyFormatSetting
		.setName(property)




		




		.addTextArea((text) => {
            enhanceFormatTextArea(plugin, text, entry.format, async (value) => {
                entry.format = value;
                await plugin.saveSettings();
                updateAllProperties(plugin);
            });
		})



        .addButton(btn => btn
            .setIcon("x")
            .onClick(async () => {
                delete plugin.settings.propertyFormats[property]
                await plugin.saveSettings()
                settingTab.display();
                updateAllProperties(plugin)
            })
        )
    }


	for (let property in plugin.settings.propertyFormats) {
		addFormatSetting(property)
	}



    let newProperty = ""
    new Setting(formatSettingsWrapper)
        .setName(i18n.t("ADD_PROPERTY_FORMAT"))
		.addSearch((search) => {
			search.setValue("");
			search.setPlaceholder(i18n.t("PROPERTY_SEARCH_PLACEHOLDER"));

			const persist = async (value: string) => {
				newProperty = value;
			};
			search.onChange(async (value) => {
				await persist(value);
			});

			const suggester = new PropertyNameSuggest(plugin.app, search.inputEl, ["text", "number", "date", "datetime"]);
			suggester.onSelect(async (value) => {
				await persist(value);
				suggester.setValue(value);
				suggester.close();
			});
		})


        .addButton(btn => btn
            .setIcon("plus")
            .onClick(async () => {
				newProperty = newProperty.trim()
                if (newProperty && !plugin.settings.propertyFormats[newProperty]) {
                    plugin.settings.propertyFormats[newProperty] = {
						format: ""
					}
                    await plugin.saveSettings()
                    settingTab.display();
                }
            })
        )
}