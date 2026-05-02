import { Setting, TextComponent } from 'obsidian';
import { i18n } from 'src/localization/localization';
import { updateAllProperties } from 'src/utils/updates/updateElements';
import { PPSettingTab } from 'src/settings/settings';
import {PropertyNameSuggest} from "../utils/propertyNameSuggester";
import {enhanceFormatTextArea} from "../utils/settingsHelper";





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
                plugin.saveSettings()
                settingTab.display()
            })
        }
    );





    if (plugin.settings.showExtraFormattings) { 
        showFormatSettings(settingTab)
    }



    


}





type SupportedPropertyInputType = "text" | "number" | "date" | "datetime";

	const INPUT_SELECTORS: Record<SupportedPropertyInputType, string> = {
		text: ".metadata-input-longtext",
		number: ".metadata-input-number",
		date: ".metadata-input.metadata-input-text.mod-date",
		datetime: ".metadata-input.metadata-input-text.mod-datetime",
	};




	function getSupportedPropertyInputTypes(): string[] {
		return Object.keys(INPUT_SELECTORS);
	}








const showFormatSettings = (settingTab: PPSettingTab) => {
    const {containerEl, plugin} = settingTab

    let formatSettingsWrapper = containerEl.createEl("div")

    formatSettingsWrapper.setCssProps({
        border: "1px solid var(--text-accent)",
        "border-radius": "4px"
    })

    let formatSettingsEl = formatSettingsWrapper.createEl("div")


	const addFormatSetting = (property: string) => {
        let propertyFormatSetting = new Setting(formatSettingsEl)


		const entry = plugin.settings.propertyFormats[property]

        propertyFormatSetting
		.setName(property)




		




		.addTextArea((text) => {
			enhanceFormatTextArea(plugin, text, entry.format, async (value) => {
				
				plugin.settings.propertyFormats[property].format = value;
				await plugin.saveSettings();
				updateAllProperties(plugin);
			});
		})
		.addDropdown(drop => drop
			.addOptions({
				"raw": i18n.t("TEXT"),
				"markdown": i18n.t("MARKDOWN")
			})
			.setValue(plugin.settings.propertyFormats[property].textFormat || "raw")
			.onChange(async (value) => {
				plugin.settings.propertyFormats[property].textFormat = value || "raw"
				await plugin.saveSettings();
				updateAllProperties(plugin);
			})
		)

        

        .addButton(btn => btn
            .setIcon("x")
            .onClick(() => {
                delete plugin.settings.propertyFormats[property]
                plugin.saveSettings()
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

			const suggester = new PropertyNameSuggest(plugin.app, search.inputEl, getSupportedPropertyInputTypes());
			suggester.onSelect(async (value) => {
				await persist(value);
				suggester.setValue(value);
				suggester.close();
			});
		})


        .addButton(btn => btn
            .setIcon("plus")
            .onClick(() => {
				newProperty = newProperty.trim()
                if (newProperty && !plugin.settings.propertyFormats[newProperty]) {
                    plugin.settings.propertyFormats[newProperty] = {
						format: "",
						textFormat: "raw"
					}
                    plugin.saveSettings()
                    settingTab.display();
                }
            })
        )
}