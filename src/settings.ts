import { App, loadMathJax, Notice, PluginSettingTab, Setting, Menu, MenuItem, TextComponent, ColorComponent, ButtonComponent, moment } from 'obsidian';
import { i18n } from './localization/localization';
import PrettyPropertiesPlugin from "./main";
import { updateElements } from './utils/updates/updateElements';

import { 
	updateBannerStyles, 
	updateCoverStyles, 
	updateIconStyles,
	updatePillPaddings,
	updateRelativeDateColors,
	updateBaseTagsStyle
} from './utils/updates/updateStyles';
import { updateHiddenProperties } from './utils/updates/updateHiddenProperties';
import { updateAllPills, updateLongTexts } from './utils/updates/updatePills';
import { updateHiddenPropertiesInPropTab } from './utils/updates/updateStyles';
import { updateTagPaneTagsAll } from './utils/updates/updatePills';
import { setPillStyles } from './utils/updates/updatePills';
import { setColorMenuItems } from './menus/selectColorMenus';


export interface PPPluginSettings {
    hiddenProperties: string[];
    propertyPillColors: any;
	propertyLongtextColors: any;
	tagColors: any;
    enableBanner: boolean;
	enableIcon: boolean;
    enableCover: boolean;
    bannerProperty: string;
	iconProperty: string;
    coverProperty: string;
    extraCoverProperties: string[],
    bannerHeight: number;
    bannerHeightMobile: number;
    bannerMargin: number;
	bannerMarginMobile: number;
    bannerFading: boolean;
	coverDefaultWidth1: number;
	coverDefaultWidth2: number;
	coverDefaultWidth3: number;
	coverMaxHeight: number;
    coverVerticalWidth: number;
    coverHorizontalWidth: number;
    coverSquareWidth: number;
    coverCircleWidth: number;
    progressProperties: any;
    allTasksCount: string;
    completedTasksCount: string;
    uncompletedTasksCount: string;
    completedTasksStatuses: string[];
    uncompletedTasksStatuses: string[];
	bannersFolder: string;
	coversFolder: string;
	iconsFolder: string;
	showColorSettings: boolean;
	showTextColorSettings: boolean;
	showHiddenSettings: boolean;
	iconSize: number;
	iconTopMargin: number;
	iconTopMarginMobile: number;
	iconTopMarginWithoutBanner: number;
	iconLeftMargin: number;
	iconGap: number;
	bannerIconGap: number;
	bannerIconGapMobile: number;
	iconColor: string;
	iconColorDark: string;
	iconBackground: boolean;
	enableBases: boolean;
	bannerPositionProperty: string;
	addPillPadding: string;
	addBaseTagColor: boolean;
	enableTasksCount: boolean;
	enableColorButtonInBases:boolean;
	customDateFormat: string;
  	customDateTimeFormat: string;
	enableCustomDateFormat: boolean;
	enableCustomDateFormatInBases: boolean;
	enableRelativeDateColors: boolean;
	settingsTab: string;
	enableTaskNotesCount: boolean;
	allTNTasksCount: string;
    completedTNTasksCount: string;
    uncompletedTNTasksCount: string;
	allTNProjectTasksCount: string;
    completedTNProjectTasksCount: string;
    uncompletedTNProjectTasksCount: string;
	allTNInlineTasksCount: string;
    completedTNInlineTasksCount: string;
    uncompletedTNInlineTasksCount: string;
	allTNAndCheckboxTasksCount: string;
    completedTNAndCheckboxTasksCount: string;
    uncompletedTNAndCheckboxTasksCount: string;
	enableColoredProperties: boolean;
	enableColoredInlineTags: boolean;
	nonLatinTagsSupport: boolean;
	enableColorButton: boolean;
	propertySearchKey: string;
	
	showTagColorSettings: boolean;
	iconSizeMobile: number;
	hidePropertiesInPropTab: boolean;
	autoTasksCount: boolean
	enableColoredTagsInTagPane: boolean;
	mathProperties: string[];
	enableMath: boolean;
	dataVersion: number;
	dateColors: any;
	

	
	
}

export const DEFAULT_SETTINGS: PPPluginSettings = {
    hiddenProperties: [],
    propertyPillColors: {},
	propertyLongtextColors: {},
	tagColors: {},
    enableBanner: true,
	enableIcon: true,
    enableCover: true,
    bannerProperty: "banner",
	iconProperty: "icon",
    coverProperty: "cover",
    extraCoverProperties: [],
    bannerHeight: 150, 
    bannerHeightMobile: 100,
    bannerMargin: -20,
	bannerMarginMobile: 0,
    bannerFading: true,
	coverDefaultWidth1: 200,
	coverDefaultWidth2: 250,
	coverDefaultWidth3: 300,
	coverMaxHeight: 500,
    coverVerticalWidth: 200,
    coverHorizontalWidth: 300,
    coverSquareWidth: 250,
    coverCircleWidth: 250,
    progressProperties: {},
    allTasksCount: "tasks",
    completedTasksCount: "tasks_completed",
    uncompletedTasksCount: "tasks_uncompleted",
    completedTasksStatuses: ["x"],
    uncompletedTasksStatuses: [" "],
	bannersFolder: "",
	coversFolder: "",
	showColorSettings: false,
	showTextColorSettings: false,
	showHiddenSettings: false,
	iconsFolder: "",
	iconSize: 70,
	iconTopMargin: 70,
	iconTopMarginMobile: 44,
	iconTopMarginWithoutBanner: -10,
	iconLeftMargin: 0,
	iconGap: 10,
	bannerIconGap: 0,
	bannerIconGapMobile: 20,
	iconColor: "",
	iconColorDark: "",
	iconBackground: false,
	enableBases: false,
	bannerPositionProperty: "banner_position",
	addPillPadding: "all",
	addBaseTagColor: true,
	enableTasksCount: true,
	enableColorButtonInBases: false,
	customDateFormat: "",
    customDateTimeFormat: "",
	enableCustomDateFormat: false,
	enableCustomDateFormatInBases: false,
	enableRelativeDateColors: false,
	settingsTab: "BANNERS",
	enableTaskNotesCount: false,
	allTNTasksCount: "tn_tasks",
    completedTNTasksCount: "tn_tasks_completed",
    uncompletedTNTasksCount: "tn_tasks_uncompleted",
	allTNProjectTasksCount: "tn_project_tasks",
    completedTNProjectTasksCount: "tn_project_tasks_completed",
    uncompletedTNProjectTasksCount: "tn_project_tasks_uncompleted",
	allTNInlineTasksCount: "tn_inline_tasks",
    completedTNInlineTasksCount: "tn_inline_tasks_completed",
    uncompletedTNInlineTasksCount: "tn_inline_tasks_uncompleted",
	allTNAndCheckboxTasksCount: "tn_and_checkbox_tasks",
    completedTNAndCheckboxTasksCount: "tn_and_checkbox_tasks_completed",
    uncompletedTNAndCheckboxTasksCount: "tn_and_checkbox_tasks_uncompleted",
	enableColoredProperties: true,
	enableColoredInlineTags: false,
	nonLatinTagsSupport: false,
	enableColorButton: true,
	propertySearchKey: "Ctrl",
	
	showTagColorSettings: false,
	iconSizeMobile: 70,
	hidePropertiesInPropTab: false,
	autoTasksCount: true,
	enableColoredTagsInTagPane: false,
	mathProperties: [],
	enableMath: false,
	dataVersion: 0,
	dateColors: {
		past: {
			pillColor: "default",
			textColor: "default"
		},
		present: {
			pillColor: "default",
			textColor: "default"
		},
		future: {
			pillColor: "default",
			textColor: "default"
		}
	}

}


export class PPSettingTab extends PluginSettingTab {
	plugin: PrettyPropertiesPlugin;

	constructor(app: App, plugin: PrettyPropertiesPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const {containerEl} = this;
		containerEl.empty();

		let tabNames = ["BANNERS", "ICONS", "COVERS", "TASKS", "PROPERTY_SETTINGS", "DATES", "OTHER"]
		let tabsEl = containerEl.createEl("div", {cls: "pp-settings-tabs"})
		for (let tabName of tabNames) {
			let button = tabsEl.createEl("button", {cls: "pp-settings-tab"})
			if (this.plugin.settings.settingsTab == tabName) {
				button.classList.add("pp-settings-tab-selected")
			}
			button.append(i18n.t(tabName))
			button.onclick = () => {
				this.plugin.settings.settingsTab = tabName
				this.plugin.saveSettings()
				this.display()
			}
		}

		if (this.plugin.settings.settingsTab == "BANNERS") {
			new Setting(containerEl)
				.setName(i18n.t("ENABLE_BANNER"))
				.addToggle(toggle => toggle
					.setValue(this.plugin.settings.enableBanner)
					.onChange(async (value) => {
						this.plugin.settings.enableBanner = value
						await this.plugin.saveSettings();
						this.display();
						updateElements(this.plugin);
						updateBannerStyles(this.plugin);
					}));

			if (this.plugin.settings.enableBanner) {
				new Setting(containerEl)
				.setName(i18n.t("BANNER_PROPERTY"))
				.addText(text => text
					.setPlaceholder('banner')
					.setValue(this.plugin.settings.bannerProperty)
					.onChange(async (value) => {
						this.plugin.settings.bannerProperty = value;
						await this.plugin.saveSettings();
						updateElements(this.plugin);
					}));

				new Setting(containerEl)
				.setName(i18n.t("BANNER_POSITION_PROPERTY"))
				.addText(text => text
					.setPlaceholder('banner_position')
					.setValue(this.plugin.settings.bannerPositionProperty)
					.onChange(async (value) => {
						this.plugin.settings.bannerPositionProperty = value;
						await this.plugin.saveSettings();
						updateElements(this.plugin);
					}));

				new Setting(containerEl)
				.setName(i18n.t("BANNERS_FOLDER"))
				.addText(text => text
					.setValue(this.plugin.settings.bannersFolder)
					.onChange(async (value) => {
						this.plugin.settings.bannersFolder = value;
						await this.plugin.saveSettings();
					}));

				new Setting(containerEl)
				.setName(i18n.t("BANNER_FADING"))
				.addToggle(toggle => toggle
					.setValue(this.plugin.settings.bannerFading)
					.onChange(async (value) => {
						this.plugin.settings.bannerFading = value
						await this.plugin.saveSettings();
						updateBannerStyles(this.plugin);
					}));

				new Setting(containerEl)
				.setName(i18n.t("BANNER_HEIGHT"))
				.addText(text => {
					text.inputEl.type = "number"
					text.setValue(this.plugin.settings.bannerHeight.toString())
					.setPlaceholder('150')
					.onChange(async (value) => {
						if (!value) value = "0"
						this.plugin.settings.bannerHeight = Number(value);
						await this.plugin.saveSettings();
						updateBannerStyles(this.plugin);
					})
				});

				new Setting(containerEl)
				.setName(i18n.t("BANNER_HEIGHT_MOBILE"))
				.addText(text => {
					text.inputEl.type = "number"
					text.setValue(this.plugin.settings.bannerHeightMobile.toString())
					.setPlaceholder('100')
					.onChange(async (value) => {
						if (!value) value = "0"
						this.plugin.settings.bannerHeightMobile = Number(value);
						await this.plugin.saveSettings();
						updateBannerStyles(this.plugin);
					})
				});

				new Setting(containerEl)
				.setName(i18n.t("GAP_AFTER_BANNER"))
				.setDesc(i18n.t("CAN_BE_POSITIVE_OR_NEGATIVE"))
				.addText(text => {
					text.inputEl.type = "number"
					text.setValue(this.plugin.settings.bannerMargin.toString())
					.setPlaceholder('-20')
					.onChange(async (value) => {
						if (!value) value = "0"
						this.plugin.settings.bannerMargin = Number(value);
						await this.plugin.saveSettings();
						updateBannerStyles(this.plugin);
					})
				});


				new Setting(containerEl)
				.setName(i18n.t("GAP_AFTER_BANNER_MOBILE"))
				.setDesc(i18n.t("CAN_BE_POSITIVE_OR_NEGATIVE"))
				.addText(text => {
					text.inputEl.type = "number"
					text.setValue(this.plugin.settings.bannerMarginMobile.toString())
					.setPlaceholder('-20')
					.onChange(async (value) => {
						if (!value) value = "0"
						this.plugin.settings.bannerMarginMobile = Number(value);
						await this.plugin.saveSettings();
						updateBannerStyles(this.plugin);
					})
				});


				new Setting(containerEl)
				.setName(i18n.t("GAP_AFTER_BANNER_WITH_ICON"))
				.setDesc(i18n.t("CAN_BE_POSITIVE_OR_NEGATIVE"))
				.addText(text => {
					text.inputEl.type = "number"
					text.setValue(this.plugin.settings.bannerIconGap.toString())
					.setPlaceholder('-20')
					.onChange(async (value) => {
						if (!value) value = "0"
						this.plugin.settings.bannerIconGap = Number(value);
						await this.plugin.saveSettings();
						updateIconStyles(this.plugin);
					})
				});

				new Setting(containerEl)
				.setName(i18n.t("GAP_AFTER_BANNER_WITH_ICON_MOBILE"))
				.setDesc(i18n.t("CAN_BE_POSITIVE_OR_NEGATIVE"))
				.addText(text => {
					text.inputEl.type = "number"
					text.setValue(this.plugin.settings.bannerIconGapMobile.toString())
					.setPlaceholder('-20')
					.onChange(async (value) => {
						if (!value) value = "0"
						this.plugin.settings.bannerIconGapMobile = Number(value);
						await this.plugin.saveSettings();
						updateIconStyles(this.plugin);
					})
				});
			}
		}



		if (this.plugin.settings.settingsTab == "ICONS") {
			new Setting(containerEl)
				.setName(i18n.t("ENABLE_ICONS"))
				.addToggle(toggle => toggle
					.setValue(this.plugin.settings.enableIcon)
					.onChange(async (value) => {
						this.plugin.settings.enableIcon = value
						await this.plugin.saveSettings();
						this.display();
						updateElements(this.plugin);
						updateIconStyles(this.plugin);
					}));

			if (this.plugin.settings.enableIcon) {
				new Setting(containerEl)
				.setName(i18n.t("ICON_PROPERTY"))
				.addText(text => text
					.setPlaceholder('icon')
					.setValue(this.plugin.settings.iconProperty)
					.onChange(async (value) => {
						this.plugin.settings.iconProperty = value;
						await this.plugin.saveSettings();
						updateElements(this.plugin);
					}));

				new Setting(containerEl)
				.setName(i18n.t("ICONS_FOLDER"))
				.addText(text => text
					.setValue(this.plugin.settings.iconsFolder)
					.onChange(async (value) => {
						this.plugin.settings.iconsFolder = value;
						await this.plugin.saveSettings();
					}));

				new Setting(containerEl)
				.setName(i18n.t("ICON_SIZE"))
				.addText(text => {
					text.inputEl.type = "number"
					text.setValue(this.plugin.settings.iconSize.toString())
					.setPlaceholder('70')
					.onChange(async (value) => {
						if (!value) value = "0"
						this.plugin.settings.iconSize = Number(value);
						await this.plugin.saveSettings();
						updateIconStyles(this.plugin);
					})
				});

				new Setting(containerEl)
				.setName(i18n.t("ICON_SIZE_MOBILE"))
				.addText(text => {
					text.inputEl.type = "number"
					text.setValue(this.plugin.settings.iconSizeMobile.toString())
					.setPlaceholder('70')
					.onChange(async (value) => {
						if (!value) value = "0"
						this.plugin.settings.iconSizeMobile = Number(value);
						await this.plugin.saveSettings();
						updateIconStyles(this.plugin);
					})
				});

				new Setting(containerEl)
				.setName(i18n.t("ICON_COLOR"))
				.addColorPicker(color => color
					.setValue(this.plugin.settings.iconColor)
					.onChange(async (value) => {
						this.plugin.settings.iconColor = value
						await this.plugin.saveSettings();
						updateIconStyles(this.plugin);
					})
				)
				.addButton(btn => btn
					.setIcon("rotate-ccw")
					.onClick(async (e) => {
						this.plugin.settings.iconColor = ""
						this.plugin.saveSettings();
						updateIconStyles(this.plugin);
						this.display()
					})
				)

				new Setting(containerEl)
				.setName(i18n.t("ICON_COLOR_DARK"))
				.addColorPicker(color => color
					.setValue(this.plugin.settings.iconColorDark)
					.onChange(async (value) => {
						this.plugin.settings.iconColorDark = value
						await this.plugin.saveSettings();
						updateIconStyles(this.plugin);
					})
				)
				.addButton(btn => btn
					.setIcon("rotate-ccw")
					.onClick(async (e) => {
						this.plugin.settings.iconColorDark = ""
						this.plugin.saveSettings();
						updateIconStyles(this.plugin);
						this.display()
					})
				)

				new Setting(containerEl)
				.setName(i18n.t("ICON_BACKGROUND"))
				.addToggle(toggle => toggle
					.setValue(this.plugin.settings.iconBackground)
					.onChange(async (value) => {
						this.plugin.settings.iconBackground = value
						await this.plugin.saveSettings();
						updateIconStyles(this.plugin);
					}));

				new Setting(containerEl)
				.setName(i18n.t("ICON_LEFT_MARGIN"))
				.setDesc(i18n.t("CAN_BE_POSITIVE_OR_NEGATIVE"))
				.addText(text => {
					text.inputEl.type = "number"
					text.setValue(this.plugin.settings.iconLeftMargin.toString())
					.setPlaceholder('100')
					.onChange(async (value) => {
						if (!value) value = "0"
						this.plugin.settings.iconLeftMargin = Number(value);
						await this.plugin.saveSettings();
						updateIconStyles(this.plugin);
					})
				});

				new Setting(containerEl)
				.setName(i18n.t("ICON_TOP_MARGIN_WITHOUT_BANNER"))
				.setDesc(i18n.t("CAN_BE_POSITIVE_OR_NEGATIVE"))
				.addText(text => {
					text.inputEl.type = "number"
					text.setValue(this.plugin.settings.iconTopMarginWithoutBanner.toString())
					.setPlaceholder('0')
					.onChange(async (value) => {
						if (!value) value = "0"
						this.plugin.settings.iconTopMarginWithoutBanner = Number(value);
						await this.plugin.saveSettings();
						updateIconStyles(this.plugin);
					})
				});

				new Setting(containerEl)
				.setName(i18n.t("ICON_TOP_MARGIN_WITH_BANNER"))
				.setDesc(i18n.t("CAN_BE_POSITIVE_OR_NEGATIVE"))
				.addText(text => {
					text.inputEl.type = "number"
					text.setValue(this.plugin.settings.iconTopMargin.toString())
					.setPlaceholder('100')
					.onChange(async (value) => {
						if (!value) value = "0"
						this.plugin.settings.iconTopMargin = Number(value);
						await this.plugin.saveSettings();
						updateIconStyles(this.plugin);
					})
				});

				new Setting(containerEl)
				.setName(i18n.t("ICON_TOP_MARGIN_WITH_BANNER_MOBILE"))
				.setDesc(i18n.t("CAN_BE_POSITIVE_OR_NEGATIVE"))
				.addText(text => {
					text.inputEl.type = "number"
					text.setValue(this.plugin.settings.iconTopMarginMobile.toString())
					.setPlaceholder('100')
					.onChange(async (value) => {
						if (!value) value = "0"
						this.plugin.settings.iconTopMarginMobile = Number(value);
						await this.plugin.saveSettings();
						updateIconStyles(this.plugin);
					})
				});

				new Setting(containerEl)
				.setName(i18n.t("GAP_AFTER_ICON_WITHOUT_BANNER"))
				.setDesc(i18n.t("CAN_BE_POSITIVE_OR_NEGATIVE"))
				.addText(text => {
					text.inputEl.type = "number"
					text.setValue(this.plugin.settings.iconGap.toString())
					.setPlaceholder('-20')
					.onChange(async (value) => {
						if (!value) value = "0"
						this.plugin.settings.iconGap = Number(value);
						await this.plugin.saveSettings();
						updateIconStyles(this.plugin);
					})
				});
			}
		}



		if (this.plugin.settings.settingsTab == "COVERS") {
			new Setting(containerEl)
				.setName(i18n.t("ENABLE_COVER"))
				.addToggle(toggle => toggle
					.setValue(this.plugin.settings.enableCover)
					.onChange(async (value) => {
						this.plugin.settings.enableCover = value
						await this.plugin.saveSettings();
						this.display();
						updateElements(this.plugin);
						updateCoverStyles(this.plugin)
					}));
			if (this.plugin.settings.enableCover) {
				new Setting(containerEl)
				.setName(i18n.t("COVER_PROPERTY"))
				.addText(text => text
					.setPlaceholder('cover')
					.setValue(this.plugin.settings.coverProperty)
					.onChange(async (value) => {
						this.plugin.settings.coverProperty = value;
						await this.plugin.saveSettings();
						updateElements(this.plugin);
					}));

				new Setting(containerEl)
				.setName(i18n.t("COVERS_FOLDER"))
				.addText(text => text
					.setValue(this.plugin.settings.coversFolder)
					.onChange(async (value) => {
						this.plugin.settings.coversFolder = value;
						await this.plugin.saveSettings();
					}));

				new Setting(containerEl)
				.setName(i18n.t("ADD_EXTRA_COVER_PROPERTY"))
				.addButton(button => button
					.setIcon("plus")
					.onClick(async () => {
						if (this.plugin.settings.extraCoverProperties.find(p => p == "") === undefined) {
							this.plugin.settings.extraCoverProperties.push("")
							await this.plugin.saveSettings();
							this.display();
						}
					}))

				for (let i = 0; i < this.plugin.settings.extraCoverProperties.length; i++) {
					let prop = this.plugin.settings.extraCoverProperties[i]
					new Setting(containerEl)
					.setName(i18n.t("EXTRA_COVER_PROPERTY"))
					.addText(text => text
						.setValue(prop)
						.onChange(async (value) => {
							this.plugin.settings.extraCoverProperties[i] = value;
							await this.plugin.saveSettings();
							updateElements(this.plugin);
						}))
					.addButton(button => button
					.setIcon("x")
					.onClick(async () => {
						prop = this.plugin.settings.extraCoverProperties[i]
						this.plugin.settings.extraCoverProperties = this.plugin.settings.extraCoverProperties.filter(p => p != prop)
						await this.plugin.saveSettings();
						this.display();
					}))
				}

				new Setting(containerEl)
				.setName(i18n.t("COVER_MAX_HEIGHT"))
				.addText(text => {
					text.inputEl.type = "number"
					text.setValue(this.plugin.settings.coverMaxHeight.toString())
					.setPlaceholder('500')
					.onChange(async (value) => {
						if (!value) value = "0"
						this.plugin.settings.coverMaxHeight = Number(value);
						await this.plugin.saveSettings();
						updateCoverStyles(this.plugin);
					})
				});

				new Setting(containerEl)
				.setName(i18n.t("DEFAULT_COVER_WIDTH"))
				.addText(text => {
					text.inputEl.type = "number"
					text.setValue(this.plugin.settings.coverDefaultWidth1.toString())
					.setPlaceholder('200')
					.onChange(async (value) => {
						if (!value) value = "0"
						this.plugin.settings.coverDefaultWidth1 = Number(value);
						await this.plugin.saveSettings();
						updateCoverStyles(this.plugin);
					})
				});

				new Setting(containerEl)
				.setName(i18n.t("DEFAULT_COVER_WIDTH_2"))
				.addText(text => {
					text.inputEl.type = "number"
					text.setValue(this.plugin.settings.coverDefaultWidth2.toString())
					.setPlaceholder('250')
					.onChange(async (value) => {
						if (!value) value = "0"
						this.plugin.settings.coverDefaultWidth2 = Number(value);
						await this.plugin.saveSettings();
						updateCoverStyles(this.plugin);
					})
				});

				new Setting(containerEl)
				.setName(i18n.t("DEFAULT_COVER_WIDTH_3"))
				.addText(text => {
					text.inputEl.type = "number"
					text.setValue(this.plugin.settings.coverDefaultWidth3.toString())
					.setPlaceholder('300')
					.onChange(async (value) => {
						if (!value) value = "0"
						this.plugin.settings.coverDefaultWidth3 = Number(value);
						await this.plugin.saveSettings();
						updateCoverStyles(this.plugin);
					})
				});

				new Setting(containerEl)
				.setName(i18n.t("VERTICAL_COVER_WIDTH"))
				.addText(text => {
					text.inputEl.type = "number"
					text.setValue(this.plugin.settings.coverVerticalWidth.toString())
					.setPlaceholder('200')
					.onChange(async (value) => {
						if (!value) value = "0"
						this.plugin.settings.coverVerticalWidth = Number(value);
						await this.plugin.saveSettings();
						updateCoverStyles(this.plugin);
					})
				});

				new Setting(containerEl)
				.setName(i18n.t("HORIZONTAL_COVER_WIDTH"))
				.addText(text => {
					text.inputEl.type = "number"
					text.setValue(this.plugin.settings.coverHorizontalWidth.toString())
					.setPlaceholder('300')
					.onChange(async (value) => {
						if (!value) value = "0"
						this.plugin.settings.coverHorizontalWidth = Number(value);
						await this.plugin.saveSettings();
						updateCoverStyles(this.plugin);
					})
				});

				new Setting(containerEl)
				.setName(i18n.t("SQUARE_COVER_WIDTH"))
				.addText(text => {
					text.inputEl.type = "number"
					text.setValue(this.plugin.settings.coverSquareWidth.toString())
					.setPlaceholder('250')
					.onChange(async (value) => {
						if (!value) value = "0"
						this.plugin.settings.coverSquareWidth = Number(value);
						await this.plugin.saveSettings();
						updateCoverStyles(this.plugin);
					})
				});

				new Setting(containerEl)
				.setName(i18n.t("CIRCLE_COVER_WIDTH"))
				.addText(text => {
					text.inputEl.type = "number"
					text.setValue(this.plugin.settings.coverCircleWidth.toString())
					.setPlaceholder('250')
					.onChange(async (value) => {
						if (!value) value = "0"
						this.plugin.settings.coverCircleWidth = Number(value);
						await this.plugin.saveSettings();
						updateCoverStyles(this.plugin);
					})
				});
			}
		}



		if (this.plugin.settings.settingsTab == "TASKS") {
			new Setting(containerEl)
				.setName(i18n.t("ENABLE_TASKS_COUNT"))
				.setDesc(i18n.t("TASKS_COUNT_DESC"))
				.addToggle(toggle => toggle
					.setValue(this.plugin.settings.enableTasksCount)
					.onChange(async (value) => {
						this.plugin.settings.enableTasksCount = value
						await this.plugin.saveSettings();
						this.display();
					}));

			if (this.plugin.settings.enableTasksCount) {
				new Setting(containerEl)
				.setName(i18n.t("ALL_TASKS_COUNT_PROPERTY"))
				.addText(text => text
					.setPlaceholder('tasks')
					.setValue(this.plugin.settings.allTasksCount)
					.onChange(async (value) => {
						this.plugin.settings.allTasksCount = value;
						await this.plugin.saveSettings();
						updateElements(this.plugin);
					}));

				new Setting(containerEl)
				.setName(i18n.t("UNCOMPLETED_TASKS_COUNT_PROPERTY"))
				.addText(text => text
					.setPlaceholder('tasks_uncompleted')
					.setValue(this.plugin.settings.uncompletedTasksCount)
					.onChange(async (value) => {
						this.plugin.settings.uncompletedTasksCount = value;
						await this.plugin.saveSettings();
						updateElements(this.plugin);
					}));

				new Setting(containerEl)
				.setName(i18n.t("COMPLETED_TASKS_COUNT_PROPERTY"))
				.addText(text => text
					.setPlaceholder('tasks_completed')
					.setValue(this.plugin.settings.completedTasksCount)
					.onChange(async (value) => {
						this.plugin.settings.completedTasksCount = value;
						await this.plugin.saveSettings();
						updateElements(this.plugin);
					}));

				containerEl.createEl("p", {text: i18n.t("TASK_STATUSES_DESCRIPTION")})

				new Setting(containerEl)
				.setName(i18n.t("UNCOMPLETED_TASKS_COUNT_STATUSES"))
				.addText(text => text
					.setPlaceholder('banner')
					.setValue(this.plugin.settings.uncompletedTasksStatuses.map(s => "\"" + s + "\"").join(", "))
					.onChange(async (value) => {
						let valueArr = value.split(",").map(v => {
							v = v.trim()
							let stringMatch = v.match(/(\")(.*?)(\")/)
							if (stringMatch) {
								v = stringMatch[2]
							}
							if (v.length > 1) {
								v = v[0]
							}
							return v
						}).filter(v => v != "" && !this.plugin.settings.completedTasksStatuses.includes(v))
						valueArr = Array.from(new Set(valueArr))
						this.plugin.settings.uncompletedTasksStatuses = valueArr;
						await this.plugin.saveSettings();
						updateElements(this.plugin);
					}));

				new Setting(containerEl)
				.setName(i18n.t("COMPLETED_TASKS_COUNT_STATUSES"))
				.addText(text => text
					.setPlaceholder('"x"')
					.setValue(this.plugin.settings.completedTasksStatuses.map(s => "\"" + s + "\"").join(", "))
					.onChange(async (value) => {
						let valueArr = value.split(",").map(v => {
							v = v.trim()
							let stringMatch = v.match(/(\")(.*?)(\")/)
							if (stringMatch) {
								v = stringMatch[2]
							}
							if (v.length > 1) {
								v = v[0]
							}
							return v
						}).filter(v => v != "" && !this.plugin.settings.uncompletedTasksStatuses.includes(v))
						valueArr = Array.from(new Set(valueArr))
						this.plugin.settings.completedTasksStatuses = valueArr;
						await this.plugin.saveSettings();
						updateElements(this.plugin);
					}));
			}

			new Setting(containerEl).setName(i18n.t("TASKNOTES_INTEGRATION")).setHeading();
			containerEl.createEl("p", {text: i18n.t("TASKNOTES_INTEGRATION_DESCRIPTION")})

			new Setting(containerEl)
				.setName(i18n.t("ENABLE_TASKSNOTES_COUNT"))
				.addToggle(toggle => toggle
					.setValue(this.plugin.settings.enableTaskNotesCount)
					.onChange(async (value) => {
						this.plugin.settings.enableTaskNotesCount = value
						await this.plugin.saveSettings();
						this.display();
					}));

			if (this.plugin.settings.enableTaskNotesCount) {
				new Setting(containerEl)
				.setName(i18n.t("TASKNOTES_PROJECT_COUNT_PROPERTY"))
				.addText(text => text
					.setPlaceholder('tn_project_tasks')
					.setValue(this.plugin.settings.allTNProjectTasksCount)
					.onChange(async (value) => {
						this.plugin.settings.allTNProjectTasksCount = value;
						await this.plugin.saveSettings();
						updateElements(this.plugin);
					}));

				new Setting(containerEl)
				.setName(i18n.t("TASKNOTES_PROJECT_COMPLETED_COUNT_PROPERTY"))
				.addText(text => text
					.setPlaceholder('tn_project_tasks_completed')
					.setValue(this.plugin.settings.completedTNProjectTasksCount)
					.onChange(async (value) => {
						this.plugin.settings.completedTNProjectTasksCount = value;
						await this.plugin.saveSettings();
						updateElements(this.plugin);
					}));

				new Setting(containerEl)
				.setName(i18n.t("TASKNOTES_PROJECT_UNCOMPLETED_COUNT_PROPERTY"))
				.addText(text => text
					.setPlaceholder('tn_project_tasks_uncompleted')
					.setValue(this.plugin.settings.uncompletedTNProjectTasksCount)
					.onChange(async (value) => {
						this.plugin.settings.uncompletedTNProjectTasksCount = value;
						await this.plugin.saveSettings();
						updateElements(this.plugin);
					}));

				new Setting(containerEl)
				.setName(i18n.t("TASKNOTES_INLINE_COUNT_PROPERTY"))
				.addText(text => text
					.setPlaceholder('tn_inline_tasks')
					.setValue(this.plugin.settings.allTNInlineTasksCount)
					.onChange(async (value) => {
						this.plugin.settings.allTNInlineTasksCount = value;
						await this.plugin.saveSettings();
						updateElements(this.plugin);
					}));

				new Setting(containerEl)
				.setName(i18n.t("TASKNOTES_INLINE_COMPLETED_COUNT_PROPERTY"))
				.addText(text => text
					.setPlaceholder('tn_inline_tasks_completed')
					.setValue(this.plugin.settings.completedTNInlineTasksCount)
					.onChange(async (value) => {
						this.plugin.settings.completedTNInlineTasksCount = value;
						await this.plugin.saveSettings();
						updateElements(this.plugin);
					}));

				new Setting(containerEl)
				.setName(i18n.t("TASKNOTES_INLINE_UNCOMPLETED_COUNT_PROPERTY"))
				.addText(text => text
					.setPlaceholder('tn_inline_tasks_uncompleted')
					.setValue(this.plugin.settings.uncompletedTNInlineTasksCount)
					.onChange(async (value) => {
						this.plugin.settings.uncompletedTNInlineTasksCount = value;
						await this.plugin.saveSettings();
						updateElements(this.plugin);
					}));

				new Setting(containerEl)
				.setName(i18n.t("TASKNOTES_COUNT_PROPERTY"))
				.addText(text => text
					.setPlaceholder('tn_tasks')
					.setValue(this.plugin.settings.allTNTasksCount)
					.onChange(async (value) => {
						this.plugin.settings.allTNTasksCount = value;
						await this.plugin.saveSettings();
						updateElements(this.plugin);
					}));

				new Setting(containerEl)
				.setName(i18n.t("TASKNOTES_COMPLETED_COUNT_PROPERTY"))
				.addText(text => text
					.setPlaceholder('tn_tasks_completed')
					.setValue(this.plugin.settings.completedTNTasksCount)
					.onChange(async (value) => {
						this.plugin.settings.completedTNTasksCount = value;
						await this.plugin.saveSettings();
						updateElements(this.plugin);
					}));

				new Setting(containerEl)
				.setName(i18n.t("TASKNOTES_UNCOMPLETED_COUNT_PROPERTY"))
				.addText(text => text
					.setPlaceholder('tn_tasks_uncompleted')
					.setValue(this.plugin.settings.uncompletedTNTasksCount)
					.onChange(async (value) => {
						this.plugin.settings.uncompletedTNTasksCount = value;
						await this.plugin.saveSettings();
						updateElements(this.plugin);
					}));
				
				new Setting(containerEl)
				.setName(i18n.t("TASKNOTES_AND_CHECKBOX_COUNT_PROPERTY"))
				.addText(text => text
					.setPlaceholder('all_tasks')
					.setValue(this.plugin.settings.allTNAndCheckboxTasksCount)
					.onChange(async (value) => {
						this.plugin.settings.allTNAndCheckboxTasksCount = value;
						await this.plugin.saveSettings();
						updateElements(this.plugin);
					}));

				new Setting(containerEl)
				.setName(i18n.t("TASKNOTES_AND_CHECKBOX_COMPLETED_COUNT_PROPERTY"))
				.addText(text => text
					.setPlaceholder('all_tasks_completed')
					.setValue(this.plugin.settings.completedTNAndCheckboxTasksCount)
					.onChange(async (value) => {
						this.plugin.settings.completedTNAndCheckboxTasksCount = value;
						await this.plugin.saveSettings();
						updateElements(this.plugin);
					}));

				new Setting(containerEl)
				.setName(i18n.t("TASKNOTES_AND_CHECKBOX_UNCOMPLETED_COUNT_PROPERTY"))
				.addText(text => text
					.setPlaceholder('all_tasks_uncompleted')
					.setValue(this.plugin.settings.uncompletedTNAndCheckboxTasksCount)
					.onChange(async (value) => {
						this.plugin.settings.uncompletedTNAndCheckboxTasksCount = value;
						await this.plugin.saveSettings();
						updateElements(this.plugin);
					}));
			}



			if (this.plugin.settings.enableTasksCount || this.plugin.settings.enableTaskNotesCount) {
				new Setting(containerEl)
					.setName(i18n.t("AUTOMATIC_TASKS_COUNT"))
					.setDesc(i18n.t("AUTOMATIC_TASKS_COUNT_DESC"))
					.addToggle((toggle) => toggle
					.setValue(this.plugin.settings.autoTasksCount)
					.onChange(async (value) => {
						this.plugin.settings.autoTasksCount = value;
						await this.plugin.saveSettings();
						this.display();
					}));
			}


		}



		if (this.plugin.settings.settingsTab == "PROPERTY_SETTINGS") {
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
				.setValue(this.plugin.settings.addPillPadding)
				.onChange((value) => {
					this.plugin.settings.addPillPadding = value
					this.plugin.saveSettings()
					updatePillPaddings(this.plugin)
				})
			)

			new Setting(containerEl)
			.setName(i18n.t("ENABLE_COLORED_PROPERTIES"))
			.addToggle(toggle => {
				toggle.setValue(this.plugin.settings.enableColoredProperties)
				.onChange(value => {
					this.plugin.settings.enableColoredProperties = value
					this.plugin.saveSettings()
					updateAllPills(this.plugin)
					updateElements(this.plugin);
				})
			});

			new Setting(containerEl)
			.setName(i18n.t("ENABLE_COLORED_INLINE_TAGS"))
			.addToggle(toggle => {
				toggle.setValue(this.plugin.settings.enableColoredInlineTags)
				.onChange(value => {
					this.plugin.settings.enableColoredInlineTags = value
					this.plugin.saveSettings()
					updateAllPills(this.plugin)
				})
			});



			new Setting(containerEl)
			.setName(i18n.t("ENABLE_COLORED_TAGS_IN_TAG_PANE"))
			.addToggle((toggle) => {
				toggle
				.setValue(this.plugin.settings.enableColoredTagsInTagPane)
				.onChange((value) => {
					this.plugin.settings.enableColoredTagsInTagPane = value;
					this.plugin.saveSettings();
					updateAllPills(this.plugin);
					updateTagPaneTagsAll(this.plugin)
				});
			});

			new Setting(containerEl)
			.setName(i18n.t("BASE_TAGS_COLOR"))
			.setDesc(i18n.t("BASE_TAGS_COLOR_DESC"))
			.addToggle(toggle => {
				toggle.setValue(this.plugin.settings.addBaseTagColor)
				.onChange(value => {
					this.plugin.settings.addBaseTagColor = value
					this.plugin.saveSettings()
					updateBaseTagsStyle(this.plugin)
				})
			});


			new Setting(containerEl)
				.setName(i18n.t("SHOW_COLOR_BUTTON_FOR_TEXT"))
				.addToggle(toggle => toggle
					.setValue(this.plugin.settings.enableColorButton)
					.onChange(async (value) => {
						this.plugin.settings.enableColorButton = value
						await this.plugin.saveSettings();
						this.display();
						updateElements(this.plugin);
					}));

			new Setting(containerEl)
				.setName(i18n.t("SHOW_COLOR_BUTTON_FOR_TEXT_IN_BASES"))
				.setDesc(i18n.t("SHOW_COLOR_BUTTON_FOR_TEXT_IN_BASES_DESC"))
				.addToggle(toggle => toggle
					.setValue(this.plugin.settings.enableColorButtonInBases)
					.onChange(async (value) => {
						this.plugin.settings.enableColorButtonInBases = value
						await this.plugin.saveSettings();
						this.display();
						
					}));



			new Setting(containerEl)
				.setName(i18n.t("HIDE_PROPERTIES_IN_SIDEBAR"))
				.addToggle(toggle => toggle
					.setValue(this.plugin.settings.hidePropertiesInPropTab)
					.onChange(async (value) => {
						this.plugin.settings.hidePropertiesInPropTab = value
						await this.plugin.saveSettings();
						updateHiddenPropertiesInPropTab(this.plugin)
					}));




			new Setting(containerEl)
			.setName(i18n.t("SHOW_COLORED_PROPERTIES"))
			.addToggle(toggle => {
				toggle.setValue(this.plugin.settings.showColorSettings)
				.onChange(value => {
					this.plugin.settings.showColorSettings = value
					this.plugin.saveSettings()
					this.display()
				})
			});

			if (this.plugin.settings.showColorSettings) { 
				let colorSettingsEl = containerEl.createEl("div")

				const addColorSetting = (property: string) => {
					
					let propertyColorSetting = new Setting(colorSettingsEl)

					let pillEl = propertyColorSetting.nameEl.createEl("div", {
						cls: "multi-select-pill setting-multi-select-pill"
					})   
					setPillStyles(pillEl, "data-property-pill-value", property, "multiselect-pill", this.plugin)

					pillEl.createEl("div", {text: property, cls: "multi-select-pill-content"})
					let propertyColorComponent: ColorComponent
					let propertyColorButton: ButtonComponent

					propertyColorSetting.addText(text => {
						text.setValue(property)
						let inputEl = text.inputEl
						inputEl.onblur = () => {
							let value = inputEl.value
							if (value && !this.plugin.settings.propertyPillColors[value]) {
								this.plugin.settings.propertyPillColors[value] = this.plugin.settings.propertyPillColors[property]
								delete this.plugin.settings.propertyPillColors[property]
								this.plugin.saveSettings()
								updateAllPills(this.plugin)
								this.display()
							}
						}
					})
					.addButton((btn) => {
						btn.setIcon("paintbrush").setClass("property-color-setting-button").onClick((e) => {
						  let menu = new Menu();
						  setColorMenuItems(menu, property, "propertyPillColors", "pillColor", this.plugin);
						  menu.showAtMouseEvent(e);
						});
					})
			
					  .addButton((btn) => {
						btn.setIcon("type").setClass("property-color-setting-button").onClick((e) => {
						  let menu = new Menu();
						  setColorMenuItems(menu, property, "propertyPillColors", "textColor", this.plugin);
						  menu.showAtMouseEvent(e);
						});
					})
					.addButton(btn => btn
						.setIcon("x")
						.onClick(() => {
							delete this.plugin.settings.propertyPillColors[property]
							this.plugin.saveSettings()
							propertyColorSetting.settingEl.remove()
							updateAllPills(this.plugin)
						})
					)
				}
				
				for (let property in this.plugin.settings.propertyPillColors) {
					addColorSetting(property)
				}


				let newProperty = ""
				let newPropertySetting = new Setting(containerEl)
					.setName(i18n.t("ADD_COLORED_PROPERTY"))
					.addText(text => text
						.setValue("")
						.onChange(value => newProperty = value)
					)
					.addButton(btn => btn
						.setIcon("plus")
						.onClick(() => {
							newProperty = newProperty.trim()
							if (newProperty && !this.plugin.settings.propertyPillColors[newProperty]) {
								this.plugin.settings.propertyPillColors[newProperty] = {}
								this.plugin.saveSettings()
								addColorSetting(newProperty)
								let inputSetting = newPropertySetting.components[0]
								if (inputSetting instanceof TextComponent) {
									inputSetting.setValue("")
								}
							}
						})
					)
			}












			new Setting(containerEl)
			.setName(i18n.t("SHOW_COLORED_TAGS"))
			.addToggle(toggle => {
				toggle.setValue(this.plugin.settings.showTagColorSettings)
				.onChange(value => {
					this.plugin.settings.showTagColorSettings = value
					this.plugin.saveSettings()
					this.display()
				})
			});

			if (this.plugin.settings.showTagColorSettings) { 
				let colorSettingsEl = containerEl.createEl("div")

				const addColorSetting = (property: string) => {
					
					let propertyColorSetting = new Setting(colorSettingsEl)

					let pillEl = propertyColorSetting.nameEl.createEl("div", {
						cls: "multi-select-pill setting-tag-pill",
						
					})
					setPillStyles(pillEl, "data-tag-value", property, "tag", this.plugin)

					pillEl.createEl("div", {text: property, cls: "multi-select-pill-content"})
					let propertyColorComponent: ColorComponent
					let propertyColorButton: ButtonComponent

					propertyColorSetting.addText(text => {
						text.setValue(property)
						let inputEl = text.inputEl
						inputEl.onblur = () => {
							let value = inputEl.value
							if (value && !this.plugin.settings.tagColors[value]) {
								this.plugin.settings.tagColors[value] = this.plugin.settings.tagColors[property]
								delete this.plugin.settings.tagColors[property]
								this.plugin.saveSettings()
								updateAllPills(this.plugin)
								this.display()
							}
						}
					})
					.addButton((btn) => {
						btn.setIcon("paintbrush").setClass("property-color-setting-button").onClick((e) => {
						  let menu = new Menu();
						  setColorMenuItems(menu, property, "tagColors", "pillColor", this.plugin);
						  menu.showAtMouseEvent(e);
						});
					  })
			
					  .addButton((btn) => {
						btn.setIcon("type").setClass("property-color-setting-button").onClick((e) => {
						  let menu = new Menu();
						  setColorMenuItems(menu, property, "tagColors", "textColor", this.plugin);
						  menu.showAtMouseEvent(e);
						});
					  })
					.addButton(btn => btn
						.setIcon("x")
						.onClick(() => {
							delete this.plugin.settings.tagColors[property]
							this.plugin.saveSettings()
							propertyColorSetting.settingEl.remove()
							updateAllPills(this.plugin)
						})
					)
				}
				
				for (let property in this.plugin.settings.tagColors) {
					addColorSetting(property)
				}


				let newProperty = ""
				let newPropertySetting = new Setting(containerEl)
					.setName(i18n.t("ADD_COLORED_TAG"))
					.addText(text => text
						.setValue("")
						.onChange(value => newProperty = value.replace("#", ""))
					)
					.addButton(btn => btn
						.setIcon("plus")
						.onClick(() => {
							newProperty = newProperty.trim()
							if (newProperty && !this.plugin.settings.tagColors[newProperty]) {
								this.plugin.settings.tagColors[newProperty] = {}
								this.plugin.saveSettings()
								addColorSetting(newProperty)
								let inputSetting = newPropertySetting.components[0]
								if (inputSetting instanceof TextComponent) {
									inputSetting.setValue("")
								}
							}
						})
					)
			}




















			new Setting(containerEl)
			.setName(i18n.t("SHOW_TEXT_COLORED_PROPERTIES"))
			.addToggle(toggle => {
				toggle.setValue(this.plugin.settings.showTextColorSettings)
				.onChange(value => {
					this.plugin.settings.showTextColorSettings = value
					this.plugin.saveSettings()
					this.display()
				})
			});

			if (this.plugin.settings.showTextColorSettings) { 
				let colorSettingsEl = containerEl.createEl("div")

				const addColorSetting = (property: string) => {
					let propertyColorSetting = new Setting(colorSettingsEl)

					let pill = propertyColorSetting.nameEl.createEl("div", {
						text: property,
						cls: "metadata-input-longtext setting-longtext-pill",
						
					})
					setPillStyles(pill, "data-property-longtext-value", property, "longtext", this.plugin)
					let propertyColorComponent: ColorComponent
					let propertyColorButton: ButtonComponent

					propertyColorSetting.addText(text => {
						text.setValue(property)
						let inputEl = text.inputEl
						inputEl.maxLength = 200
						inputEl.onblur = () => {
							let value = inputEl.value.trim()
							if (value && !this.plugin.settings.propertyLongtextColors[value]) {
								this.plugin.settings.propertyLongtextColors[value] = this.plugin.settings.propertyLongtextColors[property]
								delete this.plugin.settings.propertyLongtextColors[property]
								this.plugin.saveSettings()
								updateAllPills(this.plugin)
								this.display()
							}
						}
					})

					.addButton((btn) => {
						btn.setIcon("paintbrush").setClass("property-color-setting-button").onClick((e) => {
						  let menu = new Menu();
						  setColorMenuItems(menu, property, "propertyLongtextColors", "pillColor", this.plugin);
						  menu.showAtMouseEvent(e);
						});
					})
					.addButton((btn) => {
						btn.setIcon("type").setClass("property-color-setting-button").onClick((e) => {
							let menu = new Menu();
							setColorMenuItems(menu, property, "propertyLongtextColors", "textColor", this.plugin);
							menu.showAtMouseEvent(e);
						});
					})

					.addButton(btn => btn
						.setIcon("x")
						.onClick(() => {
							delete this.plugin.settings.propertyLongtextColors[property]
							this.plugin.saveSettings()
							propertyColorSetting.settingEl.remove()
							updateAllPills(this.plugin)
						})
					)
				}
				
				for (let property in this.plugin.settings.propertyLongtextColors) {
					addColorSetting(property)
				}

				let newProperty = ""
				let newPropertySetting = new Setting(containerEl)
					.setName(i18n.t("ADD_TEXT_COLORED_PROPERTY"))
					.addText(text => {
						let inputEl = text.inputEl
						inputEl.maxLength = 200
						text
						.setValue("")
						.onChange(value => newProperty = value)
					})
					.addButton(btn => btn
						.setIcon("plus")
						.onClick(() => {
							newProperty = newProperty.trim()
							if (newProperty && !this.plugin.settings.propertyLongtextColors[newProperty]) {
								this.plugin.settings.propertyLongtextColors[newProperty] = {}
								this.plugin.saveSettings()
								addColorSetting(newProperty)
								let inputSetting = newPropertySetting.components[0]
								if (inputSetting instanceof TextComponent) {
									inputSetting.setValue("")
								}
							}
						})
					)
			}

			new Setting(containerEl)
			.setName(i18n.t("SHOW_HIDDEN_PROPERTIES_LIST"))
			.addToggle(toggle => {
				toggle.setValue(this.plugin.settings.showHiddenSettings)
				.onChange(value => {
					this.plugin.settings.showHiddenSettings = value
					this.plugin.saveSettings()
					this.display()
				})
			});

			if (this.plugin.settings.showHiddenSettings) { 
				let hiddenSettingsEl = containerEl.createEl("div")
				const addHiddenSetting = (property: string) => {
					let propertyHiddenSetting = new Setting(hiddenSettingsEl)

					propertyHiddenSetting.addText(text => {
						text.setValue(property)
						let inputEl = text.inputEl
						inputEl.onblur = () => {
							let value = inputEl.value
							if (value && !this.plugin.settings.hiddenProperties.find(p => p == value)) {
								this.plugin.settings.hiddenProperties.push(value)
								this.plugin.settings.hiddenProperties = this.plugin.settings.hiddenProperties.filter(p => p != property)
								this.plugin.saveSettings()
								updateHiddenProperties(this.plugin)
								this.display()
							}
						}
					})

					.addButton(btn => btn
						.setIcon("x")
						.onClick(() => {
							this.plugin.settings.hiddenProperties = this.plugin.settings.hiddenProperties.filter(p => p != property)
							this.plugin.saveSettings()
							propertyHiddenSetting.settingEl.remove()
							updateHiddenProperties(this.plugin)
						})
					)
				}
				
				for (let property of this.plugin.settings.hiddenProperties) {
					addHiddenSetting(property)
				}

				let newProperty = ""
				let newPropertySetting = new Setting(containerEl)
					.setName(i18n.t("ADD_HIDDEN_PROPERTY"))
					.addText(text => text
						.setValue("")
						.onChange(value => newProperty = value)
					)
					.addButton(btn => btn
						.setIcon("plus")
						.onClick(() => {
							newProperty = newProperty.trim()
							if (newProperty && !this.plugin.settings.hiddenProperties.find(p => p == newProperty)) {
								this.plugin.settings.hiddenProperties.push(newProperty)
								this.plugin.saveSettings()
								updateHiddenProperties(this.plugin)
								addHiddenSetting(newProperty)
								let inputSetting = newPropertySetting.components[0]
								if (inputSetting instanceof TextComponent) {
									inputSetting.setValue("")
								}
							}
						})
					)
			}
		}



		if (this.plugin.settings.settingsTab == "DATES") {
			new Setting(containerEl)
			.setName(i18n.t("ENABLE_CUSTOM_DATE_FORMAT"))
			.addToggle(toggle => toggle
				.setValue(this.plugin.settings.enableCustomDateFormat)
				.onChange(async (value) => {
					this.plugin.settings.enableCustomDateFormat = value
					await this.plugin.saveSettings();
					this.display();
					updateElements(this.plugin);
				}));
			
			if (this.plugin.settings.enableCustomDateFormat) {
				new Setting(containerEl)
				.setName(i18n.t("CUSTOM_DATE_FORMAT"))
				.addText(text => text
					.setPlaceholder("DD.MM.YYYY")
					.setValue(this.plugin.settings.customDateFormat)
					.onChange(async (value) => {
						this.plugin.settings.customDateFormat = value;
						await this.plugin.saveSettings();
						updateElements(this.plugin);
					}));

				new Setting(containerEl)
				.setName(i18n.t("CUSTOM_DATETIME_FORMAT"))
				.addText(text => text
					.setPlaceholder("DD.MM.YYYY HH:mm")
					.setValue(this.plugin.settings.customDateTimeFormat)
					.onChange(async (value) => {
						this.plugin.settings.customDateTimeFormat = value;
						await this.plugin.saveSettings();
						updateElements(this.plugin);
					}));
			}

			new Setting(containerEl)
			.setName(i18n.t("ENABLE_CUSTOM_DATE_FORMAT_IN_BASES"))
			.addToggle(toggle => toggle
				.setValue(this.plugin.settings.enableCustomDateFormatInBases)
				.onChange(async (value) => {
					this.plugin.settings.enableCustomDateFormatInBases = value
					await this.plugin.saveSettings();
					this.display();
					updateElements(this.plugin);
				}));

				let format = this.plugin.settings.customDateFormat
				if (!format) {format = "L"}

				let pastDate = moment().subtract(1, "days").format(format)
				let presentDate = moment().format(format)
				let futureDate = moment().add(1, "days").format(format)

				let pastColorComponent: ColorComponent
				let pastColorButton: ButtonComponent

				let pastSetting = new Setting(containerEl)
				pastSetting.controlEl.createEl("span", {text: pastDate, cls: "setting-custom-date-past"})
				pastSetting.setName(i18n.t("PAST_DATE_COLOR"))

				.addButton((btn) => {
					btn.setIcon("paintbrush").setClass("property-color-setting-button").onClick((e) => {
						let menu = new Menu();
						setColorMenuItems(menu, "past", "dateColors", "pillColor", this.plugin);
						menu.showAtMouseEvent(e);
					});
				})
				.addButton((btn) => {
					btn.setIcon("type").setClass("property-color-setting-button").onClick((e) => {
						let menu = new Menu();
						setColorMenuItems(menu, "past", "dateColors", "textColor", this.plugin);
						menu.showAtMouseEvent(e);
					});
				})


				let presentColorComponent: ColorComponent
				let presentColorButton: ButtonComponent
				
				let presentSEtting = new Setting(containerEl)
				presentSEtting.controlEl.createEl("span", {text: presentDate, cls: "setting-custom-date-present"})
				presentSEtting.setName(i18n.t("PRESENT_DATE_COLOR"))
				.addButton((btn) => {
					btn.setIcon("paintbrush").setClass("property-color-setting-button").onClick((e) => {
						let menu = new Menu();
						setColorMenuItems(menu, "present", "dateColors", "pillColor", this.plugin);
						menu.showAtMouseEvent(e);
					});
				})
				.addButton((btn) => {
					btn.setIcon("type").setClass("property-color-setting-button").onClick((e) => {
						let menu = new Menu();
						setColorMenuItems(menu, "present", "dateColors", "textColor", this.plugin);
						menu.showAtMouseEvent(e);
					});
				})

				let futureColorComponent: ColorComponent
				let futureColorButton: ButtonComponent
				
				let futureSetting = new Setting(containerEl)
				futureSetting.controlEl.createEl("span", {text: futureDate, cls: "setting-custom-date-future"})
				futureSetting.setName(i18n.t("FUTURE_DATE_COLOR"))
				.addButton((btn) => {
					btn.setIcon("paintbrush").setClass("property-color-setting-button").onClick((e) => {
						let menu = new Menu();
						setColorMenuItems(menu, "future", "dateColors", "pillColor", this.plugin);
						menu.showAtMouseEvent(e);
					});
				})
				.addButton((btn) => {
					btn.setIcon("type").setClass("property-color-setting-button").onClick((e) => {
						let menu = new Menu();
						setColorMenuItems(menu, "future", "dateColors", "textColor", this.plugin);
						menu.showAtMouseEvent(e);
					});
				})
		}



		if (this.plugin.settings.settingsTab == "OTHER") {
			new Setting(containerEl)
				.setName(i18n.t("BASES_SUPPORT"))
				.setDesc(i18n.t("RELOAD_FILES_TO_APPLY_CHANGES"))
				.addToggle(toggle => toggle
					.setValue(this.plugin.settings.enableBases)
					.onChange(async (value) => {
						this.plugin.settings.enableBases = value
						await this.plugin.saveSettings();					
					}));

			new Setting(containerEl)
				.setName(i18n.t("ENABLE_MATH"))
				.addToggle(toggle => toggle
					.setValue(this.plugin.settings.enableMath)
					.onChange(async (value) => {
						this.plugin.settings.enableMath = value
						await this.plugin.saveSettings();
						if (this.plugin.settings.enableMath) {
							loadMathJax()
						}
						updateLongTexts(document.body, this.plugin)			
					}));

			new Setting(containerEl)
				.setName(i18n.t("CLEAR_SETTINGS"))
				.setDesc(i18n.t("CLEAR_SETTINGS_DESCRIPTION"))
				.addButton(button => button
					.setButtonText(i18n.t("CLEAR"))
					.setClass("mod-warning")
					.onClick(async () => {
						this.plugin.settings = Object.assign({}, DEFAULT_SETTINGS);
						this.plugin.settings.propertyPillColors = {}
						this.plugin.settings.hiddenProperties = []
						await this.plugin.saveSettings();
						updateElements(this.plugin);
						updateHiddenProperties(this.plugin)
						updateAllPills(this.plugin)
						updateBannerStyles(this.plugin)
						updateIconStyles(this.plugin)
						updateCoverStyles(this.plugin)
						this.display();
						new Notice(i18n.t("CLEAR_SETTINGS_NOTICE"))
					}))
		}
	}
}
