import { Setting } from 'obsidian';
import { i18n } from 'src/localization/localization';
import { updateAllProperties } from 'src/utils/updates/updateElements';
import { PPSettingTab } from 'src/settings/settings';
import {PropertyNameSuggest} from "../utils/propertyNameSuggester";
import {enhanceFormatTextArea} from "../utils/settingsHelper";





export const showFormatSettings = (settingTab: PPSettingTab) => {
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



    

	const addPropertyFormatSetting = new Setting(containerEl)
		.setName(i18n.t("ADD_PROPERTY_FORMAT"))
		.setDesc(i18n.t("PROPERTY_FORMAT_DESC"));
	addPropertyFormatSetting.descEl.createEl("a", {
		text: "README",
		href: "https://github.com/anareaty/pretty-properties/blob/master/README.md",
	});
	addPropertyFormatSetting.addButton(button =>
		button.setIcon("plus").onClick(async () => {
			if (plugin.settings.propertyFormats.find(pf => pf.property === "") === undefined) {
				plugin.settings.propertyFormats.push({
					property: "",
					format: "",
                    textFormat: "raw"
				});
				await plugin.saveSettings();
				settingTab.display();
			}
		})
	);




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





	for (let i = 0; i < plugin.settings.propertyFormats.length; i++) {
		const entry = plugin.settings.propertyFormats[i];

		new Setting(containerEl)
			.setName(i18n.t("PROPERTY_FORMAT"))
			.addSearch((search) => {
				search.setValue(entry.property);
				search.setPlaceholder(i18n.t("PROPERTY_SEARCH_PLACEHOLDER"));

				const persist = async (value: string) => {
					plugin.settings.propertyFormats[i].property = value;
					await plugin.saveSettings();
                    updateAllProperties(plugin);
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
			.addTextArea((text) => {
				enhanceFormatTextArea(plugin, text, entry.format, async (value) => {
                   
					plugin.settings.propertyFormats[i].format = value;
					await plugin.saveSettings();
                    updateAllProperties(plugin);
				});
			})
            .addDropdown(drop => drop
                .addOptions({
                    "raw": i18n.t("TEXT"),
                    "markdown": i18n.t("MARKDOWN")
                })
                .setValue(plugin.settings.propertyFormats[i].textFormat || "raw")
                .onChange(async (value) => {
                    plugin.settings.propertyFormats[i].textFormat = value || "raw"
                    await plugin.saveSettings();
					updateAllProperties(plugin);
                })
            )
			.addButton(button =>
				button.setIcon("x").onClick(async () => {
					plugin.settings.propertyFormats.splice(i, 1);
					await plugin.saveSettings();
                    updateAllProperties(plugin);
					settingTab.display();
				})
			);
	}



    


}
