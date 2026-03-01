import { Setting } from 'obsidian';
import { i18n } from 'src/localization/localization';
import {   
    updateCoverStyles
} from 'src/utils/updates/updateStyles';
import { PPSettingTab } from 'src/settings/settings';
import { updateAllCovers } from 'src/utils/updates/updateCovers';
import {PropertyNameSuggest} from "../utils/propertyNameSuggester";
import {enhanceFormatTextArea} from "../utils/settingsHelper";




export const showCoverSettings = (settingTab: PPSettingTab) => {
    const {containerEl, plugin} = settingTab

    new Setting(containerEl)
        .setName(i18n.t("ENABLE_COVER"))
        .addToggle(toggle => toggle
            .setValue(plugin.settings.enableCover)
            .onChange(async (value) => {
                plugin.settings.enableCover = value
                await plugin.saveSettings();
                settingTab.display();
                updateAllCovers(plugin)
                updateCoverStyles(plugin)
            }));

            


    if (plugin.settings.enableCover) {

        new Setting(containerEl)
        .setName(i18n.t("COVERS_FOLDER"))
        .addText(text => text
            .setValue(plugin.settings.coversFolder)
            .onChange(async (value) => {
                plugin.settings.coversFolder = value;
                await plugin.saveSettings();
            }));

		new Setting(containerEl)
			.setName(i18n.t("ADD_COVER_PROPERTY"))
			.addButton((button) =>
				button.setIcon("plus").onClick(async () => {
					if (plugin.settings.coverProperties.find((c) => c.property === "") === undefined) {
						plugin.settings.coverProperties.push({ property: "", format: "" });
						await plugin.saveSettings();
						settingTab.display();
					}
				}),
			);

		for (let i = 0; i < plugin.settings.coverProperties.length; i++) {
			const cover = plugin.settings.coverProperties[i];
			new Setting(containerEl)
				.setName(i18n.t("COVER_PROPERTY"))
				.addSearch((search) => {
					search.setValue(cover.property);
					search.setPlaceholder(i18n.t("PROPERTY_SEARCH_PLACEHOLDER"));

					const persist = async (value: string) => {
						plugin.settings.coverProperties[i].property = value;
						await plugin.saveSettings();
						updateAllCovers(plugin);
					};
					search.onChange(async (value) => {
						await persist(value);
					});
					const suggester = new PropertyNameSuggest(plugin.app, search.inputEl);
					suggester.onSelect(async (value) => {
						await persist(value);
						suggester.setValue(value);
						suggester.close();
					});
				})
				.addTextArea((text) => {
					enhanceFormatTextArea(plugin, text, cover.format, async (value) => {
						plugin.settings.coverProperties[i].format = value;
						await plugin.saveSettings();
						updateAllCovers(plugin);
					});
				})
				.addExtraButton((button) =>
					button
						.setIcon("arrow-up")
						.setTooltip("Move up")
						.setDisabled(i === 0)
						.onClick(async () => {
							if (i === 0)
								return;
							const covers = plugin.settings.coverProperties;
							[covers[i - 1], covers[i]] = [covers[i], covers[i - 1]];

							await plugin.saveSettings();
							updateAllCovers(plugin);
							settingTab.display();
						}),
				)
				.addExtraButton((button) =>
					button
						.setIcon("arrow-down")
						.setTooltip("Move down")
						.setDisabled(i === plugin.settings.coverProperties.length - 1)
						.onClick(async () => {
							if (i === plugin.settings.coverProperties.length - 1)
								return;
							const covers = plugin.settings.coverProperties;
							[covers[i + 1], covers[i]] = [covers[i], covers[i + 1]];

							await plugin.saveSettings();
							updateAllCovers(plugin);
							settingTab.display();
						}),
				)
				.addButton((button) =>
					button.setIcon("x").onClick(async () => {
						plugin.settings.coverProperties.splice(i, 1);

						await plugin.saveSettings();
						updateAllCovers(plugin);
						settingTab.display();
					}),
				);
		}


        new Setting(containerEl)
            .setName(i18n.t("SHOW_COVERS_IN_PAGE_PREVIEWS"))
            .addToggle(toggle => toggle
                .setValue(plugin.settings.enableCoversInPopover)
                .onChange(async (value) => {
                    plugin.settings.enableCoversInPopover = value
                    await plugin.saveSettings();
                }));

        
        new Setting(containerEl)
            .setName(i18n.t("HIDE_COVER_COLLAPSED"))
            .addToggle(toggle => toggle
                .setValue(plugin.settings.hideCoverCollapsed)
                .onChange(async (value) => {
                    plugin.settings.hideCoverCollapsed = value
                    await plugin.saveSettings();
                    updateCoverStyles(plugin);
                }));


        new Setting(containerEl)
        .setName(i18n.t("COVER_POSITION"))
        .addDropdown(dropdown => dropdown
            .addOptions({
                "left": i18n.t("LEFT"),
                "right": i18n.t("RIGHT"),
                "top": i18n.t("TOP"),
                "bottom": i18n.t("BOTTOM")
            })
            .setValue(plugin.settings.coverPosition)
            .onChange(async (value) => {
                plugin.settings.coverPosition = value
                await plugin.saveSettings();
                updateAllCovers(plugin)
            })
        )

        new Setting(containerEl)
        .setName(i18n.t("COVER_MAX_HEIGHT"))
        .addText(text => {
            text.inputEl.type = "number"
            text.setValue(plugin.settings.coverMaxHeight.toString())
            .setPlaceholder('500')
            .onChange(async (value) => {
                if (!value) value = "0"
                plugin.settings.coverMaxHeight = Number(value);
                await plugin.saveSettings();
                updateCoverStyles(plugin);
            })
        });


        new Setting(containerEl)
        .setName(i18n.t("COVER_MAX_HEIGHT_TOP_BOTTOM"))
        .addText(text => {
            text.inputEl.type = "number"
            text.setValue(plugin.settings.coverMaxHeightTopBottom.toString())
            .setPlaceholder('400')
            .onChange(async (value) => {
                if (!value) value = "0"
                plugin.settings.coverMaxHeightTopBottom = Number(value);
                await plugin.saveSettings();
                updateCoverStyles(plugin);
            })
        });



        new Setting(containerEl)
        .setName(i18n.t("DEFAULT_COVER_WIDTH"))
        .addText(text => {
            text.inputEl.type = "number"
            text.setValue(plugin.settings.coverDefaultWidth1.toString())
            .setPlaceholder('200')
            .onChange(async (value) => {
                if (!value) value = "0"
                plugin.settings.coverDefaultWidth1 = Number(value);
                await plugin.saveSettings();
                updateCoverStyles(plugin);
            })
        });

        new Setting(containerEl)
        .setName(i18n.t("DEFAULT_COVER_WIDTH_2"))
        .addText(text => {
            text.inputEl.type = "number"
            text.setValue(plugin.settings.coverDefaultWidth2.toString())
            .setPlaceholder('250')
            .onChange(async (value) => {
                if (!value) value = "0"
                plugin.settings.coverDefaultWidth2 = Number(value);
                await plugin.saveSettings();
                updateCoverStyles(plugin);
            })
        });

        new Setting(containerEl)
        .setName(i18n.t("DEFAULT_COVER_WIDTH_3"))
        .addText(text => {
            text.inputEl.type = "number"
            text.setValue(plugin.settings.coverDefaultWidth3.toString())
            .setPlaceholder('300')
            .onChange(async (value) => {
                if (!value) value = "0"
                plugin.settings.coverDefaultWidth3 = Number(value);
                await plugin.saveSettings();
                updateCoverStyles(plugin);
            })
        });

        new Setting(containerEl)
        .setName(i18n.t("VERTICAL_COVER_WIDTH"))
        .addText(text => {
            text.inputEl.type = "number"
            text.setValue(plugin.settings.coverVerticalWidth.toString())
            .setPlaceholder('200')
            .onChange(async (value) => {
                if (!value) value = "0"
                plugin.settings.coverVerticalWidth = Number(value);
                await plugin.saveSettings();
                updateCoverStyles(plugin);
            })
        });

        new Setting(containerEl)
        .setName(i18n.t("HORIZONTAL_COVER_WIDTH"))
        .addText(text => {
            text.inputEl.type = "number"
            text.setValue(plugin.settings.coverHorizontalWidth.toString())
            .setPlaceholder('300')
            .onChange(async (value) => {
                if (!value) value = "0"
                plugin.settings.coverHorizontalWidth = Number(value);
                await plugin.saveSettings();
                updateCoverStyles(plugin);
            })
        });

        new Setting(containerEl)
        .setName(i18n.t("SQUARE_COVER_WIDTH"))
        .addText(text => {
            text.inputEl.type = "number"
            text.setValue(plugin.settings.coverSquareWidth.toString())
            .setPlaceholder('250')
            .onChange(async (value) => {
                if (!value) value = "0"
                plugin.settings.coverSquareWidth = Number(value);
                await plugin.saveSettings();
                updateCoverStyles(plugin);
            })
        });

        new Setting(containerEl)
        .setName(i18n.t("CIRCLE_COVER_WIDTH"))
        .addText(text => {
            text.inputEl.type = "number"
            text.setValue(plugin.settings.coverCircleWidth.toString())
            .setPlaceholder('250')
            .onChange(async (value) => {
                if (!value) value = "0"
                plugin.settings.coverCircleWidth = Number(value);
                await plugin.saveSettings();
                updateCoverStyles(plugin);
            })
        });


        new Setting(containerEl)
        .setName(i18n.t("MAX_COVER_WIDTH_POPOVER"))
        .addText(text => {
            text.inputEl.type = "number"
            text.setValue(plugin.settings.coverMaxWidthPopover.toString())
            .setPlaceholder('150')
            .onChange(async (value) => {
                if (!value) value = "0"
                plugin.settings.coverMaxWidthPopover = Number(value);
                await plugin.saveSettings();
                updateCoverStyles(plugin);
            })
        });


    }
}
