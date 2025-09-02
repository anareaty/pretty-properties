import { App, Notice, PluginSettingTab, Setting, Menu, MenuItem, TextComponent, ColorComponent, ButtonComponent, moment } from 'obsidian';
import { i18n } from './localization';
import PrettyPropertiesPlugin from "./main";

export interface PPPluginSettings {
    mySetting: string;
    hiddenProperties: string[];
    propertyPillColors: any;
	propertyLongtextColors: any;
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
	iconBackground: boolean;
	enableBases: boolean;
	bannerPositionProperty: string;
	addPillPadding: string;
	addBaseTagColor: boolean;
	styleFormulaTags: boolean;
	enableTasksCount: boolean;
	enableColorButtonInBases:boolean;
	customDateFormat: string;
  	customDateTimeFormat: string;
	enableCustomDateFormat: boolean;
	enableCustomDateFormatInBases: boolean;
	enableRelativeDateColors: boolean;
	datePastColor: string;
	datePresentColor: string;
	dateFutureColor: string;
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
	
	
}

export const DEFAULT_SETTINGS: PPPluginSettings = {
    mySetting: 'default',
    hiddenProperties: [],
    propertyPillColors: {},
	propertyLongtextColors: {},
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
	iconBackground: false,
	enableBases: false,
	bannerPositionProperty: "banner_position",
	addPillPadding: "all",
	addBaseTagColor: true,
	styleFormulaTags: true,
	enableTasksCount: true,
	enableColorButtonInBases: false,
	customDateFormat: "",
    customDateTimeFormat: "",
	enableCustomDateFormat: false,
	enableCustomDateFormatInBases: false,
	enableRelativeDateColors: false,
	dateFutureColor: "",
	datePastColor: "",
	datePresentColor: "",
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

}


export default class PPSettingTab extends PluginSettingTab {
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
						this.plugin.updateElements();
						this.plugin.updateBannerStyles();
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
						this.plugin.updateElements();
					}));

				new Setting(containerEl)
				.setName(i18n.t("BANNER_POSITION_PROPERTY"))
				.addText(text => text
					.setPlaceholder('banner_position')
					.setValue(this.plugin.settings.bannerPositionProperty)
					.onChange(async (value) => {
						this.plugin.settings.bannerPositionProperty = value;
						await this.plugin.saveSettings();
						this.plugin.updateElements();
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
						this.plugin.updateBannerStyles();
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
						this.plugin.updateBannerStyles();
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
						this.plugin.updateBannerStyles();
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
						this.plugin.updateBannerStyles();
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
						this.plugin.updateBannerStyles();
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
						this.plugin.updateIconStyles();
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
						this.plugin.updateIconStyles();
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
						this.plugin.updateElements();
						this.plugin.updateIconStyles();
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
						this.plugin.updateElements();
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
						this.plugin.updateIconStyles();
					})
				});


				new Setting(containerEl)
				.setName(i18n.t("ICON_COLOR"))
				.addColorPicker(color => color
					.setValue(this.plugin.settings.iconColor)
					.onChange(async (value) => {
						this.plugin.settings.iconColor = value
						await this.plugin.saveSettings();
						this.plugin.updateIconStyles();
					})
				)



				new Setting(containerEl)
				.setName(i18n.t("ICON_BACKGROUND"))
				.addToggle(toggle => toggle
					.setValue(this.plugin.settings.iconBackground)
					.onChange(async (value) => {
						this.plugin.settings.iconBackground = value
						await this.plugin.saveSettings();
						this.plugin.updateIconStyles();
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
						this.plugin.updateIconStyles();
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
						this.plugin.updateIconStyles();
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
						this.plugin.updateIconStyles();
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
						this.plugin.updateIconStyles();
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
						this.plugin.updateIconStyles();
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
						this.plugin.updateElements()
						this.plugin.updateCoverStyles()
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
						this.plugin.updateElements()
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
							this.plugin.updateElements()
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
						this.plugin.updateCoverStyles();
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
						this.plugin.updateCoverStyles();
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
						this.plugin.updateCoverStyles();
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
						this.plugin.updateCoverStyles();
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
						this.plugin.updateCoverStyles();
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
						this.plugin.updateCoverStyles();
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
						this.plugin.updateCoverStyles();
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
						this.plugin.updateCoverStyles();
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
						this.plugin.updateElements();
					}));

				new Setting(containerEl)
				.setName(i18n.t("UNCOMPLETED_TASKS_COUNT_PROPERTY"))
				.addText(text => text
					.setPlaceholder('tasks_uncompleted')
					.setValue(this.plugin.settings.uncompletedTasksCount)
					.onChange(async (value) => {
						this.plugin.settings.uncompletedTasksCount = value;
						await this.plugin.saveSettings();
						this.plugin.updateElements();
					}));

				new Setting(containerEl)
				.setName(i18n.t("COMPLETED_TASKS_COUNT_PROPERTY"))
				.addText(text => text
					.setPlaceholder('tasks_completed')
					.setValue(this.plugin.settings.completedTasksCount)
					.onChange(async (value) => {
						this.plugin.settings.completedTasksCount = value;
						await this.plugin.saveSettings();
						this.plugin.updateElements();
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
						this.plugin.updateElements();
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
						this.plugin.updateElements();
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
						this.plugin.updateElements();
					}));


				new Setting(containerEl)
				.setName(i18n.t("TASKNOTES_PROJECT_COMPLETED_COUNT_PROPERTY"))
				.addText(text => text
					.setPlaceholder('tn_project_tasks_completed')
					.setValue(this.plugin.settings.completedTNProjectTasksCount)
					.onChange(async (value) => {
						this.plugin.settings.completedTNProjectTasksCount = value;
						await this.plugin.saveSettings();
						this.plugin.updateElements();
					}));


				new Setting(containerEl)
				.setName(i18n.t("TASKNOTES_PROJECT_UNCOMPLETED_COUNT_PROPERTY"))
				.addText(text => text
					.setPlaceholder('tn_project_tasks_uncompleted')
					.setValue(this.plugin.settings.uncompletedTNProjectTasksCount)
					.onChange(async (value) => {
						this.plugin.settings.uncompletedTNProjectTasksCount = value;
						await this.plugin.saveSettings();
						this.plugin.updateElements();
					}));


				new Setting(containerEl)
				.setName(i18n.t("TASKNOTES_INLINE_COUNT_PROPERTY"))
				.addText(text => text
					.setPlaceholder('tn_inline_tasks')
					.setValue(this.plugin.settings.allTNInlineTasksCount)
					.onChange(async (value) => {
						this.plugin.settings.allTNInlineTasksCount = value;
						await this.plugin.saveSettings();
						this.plugin.updateElements();
					}));


				new Setting(containerEl)
				.setName(i18n.t("TASKNOTES_INLINE_COMPLETED_COUNT_PROPERTY"))
				.addText(text => text
					.setPlaceholder('tn_inline_tasks_completed')
					.setValue(this.plugin.settings.completedTNInlineTasksCount)
					.onChange(async (value) => {
						this.plugin.settings.completedTNInlineTasksCount = value;
						await this.plugin.saveSettings();
						this.plugin.updateElements();
					}));

				
				new Setting(containerEl)
				.setName(i18n.t("TASKNOTES_INLINE_UNCOMPLETED_COUNT_PROPERTY"))
				.addText(text => text
					.setPlaceholder('tn_inline_tasks_uncompleted')
					.setValue(this.plugin.settings.uncompletedTNInlineTasksCount)
					.onChange(async (value) => {
						this.plugin.settings.uncompletedTNInlineTasksCount = value;
						await this.plugin.saveSettings();
						this.plugin.updateElements();
					}));

				


				new Setting(containerEl)
				.setName(i18n.t("TASKNOTES_COUNT_PROPERTY"))
				.addText(text => text
					.setPlaceholder('tn_tasks')
					.setValue(this.plugin.settings.allTNTasksCount)
					.onChange(async (value) => {
						this.plugin.settings.allTNTasksCount = value;
						await this.plugin.saveSettings();
						this.plugin.updateElements();
					}));


				new Setting(containerEl)
				.setName(i18n.t("TASKNOTES_COMPLETED_COUNT_PROPERTY"))
				.addText(text => text
					.setPlaceholder('tn_tasks_completed')
					.setValue(this.plugin.settings.completedTNTasksCount)
					.onChange(async (value) => {
						this.plugin.settings.completedTNTasksCount = value;
						await this.plugin.saveSettings();
						this.plugin.updateElements();
					}));


				new Setting(containerEl)
				.setName(i18n.t("TASKNOTES_UNCOMPLETED_COUNT_PROPERTY"))
				.addText(text => text
					.setPlaceholder('tn_tasks_uncompleted')
					.setValue(this.plugin.settings.uncompletedTNTasksCount)
					.onChange(async (value) => {
						this.plugin.settings.uncompletedTNTasksCount = value;
						await this.plugin.saveSettings();
						this.plugin.updateElements();
					}));

				
				new Setting(containerEl)
				.setName(i18n.t("TASKNOTES_AND_CHECKBOX_COUNT_PROPERTY"))
				.addText(text => text
					.setPlaceholder('all_tasks')
					.setValue(this.plugin.settings.allTNAndCheckboxTasksCount)
					.onChange(async (value) => {
						this.plugin.settings.allTNAndCheckboxTasksCount = value;
						await this.plugin.saveSettings();
						this.plugin.updateElements();
					}));


				new Setting(containerEl)
				.setName(i18n.t("TASKNOTES_AND_CHECKBOX_COMPLETED_COUNT_PROPERTY"))
				.addText(text => text
					.setPlaceholder('all_tasks_completed')
					.setValue(this.plugin.settings.completedTNAndCheckboxTasksCount)
					.onChange(async (value) => {
						this.plugin.settings.completedTNAndCheckboxTasksCount = value;
						await this.plugin.saveSettings();
						this.plugin.updateElements();
					}));


				new Setting(containerEl)
				.setName(i18n.t("TASKNOTES_AND_CHECKBOX_UNCOMPLETED_COUNT_PROPERTY"))
				.addText(text => text
					.setPlaceholder('all_tasks_uncompleted')
					.setValue(this.plugin.settings.uncompletedTNAndCheckboxTasksCount)
					.onChange(async (value) => {
						this.plugin.settings.uncompletedTNAndCheckboxTasksCount = value;
						await this.plugin.saveSettings();
						this.plugin.updateElements();
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
					this.plugin.updatePillColors()
				})
			)


			new Setting(containerEl)
			.setName(i18n.t("BASE_TAGS_COLOR"))
			.setDesc(i18n.t("BASE_TAGS_COLOR_DESC"))
			.addToggle(toggle => {
				toggle.setValue(this.plugin.settings.addBaseTagColor)
				.onChange(value => {
					this.plugin.settings.addBaseTagColor = value
					this.plugin.saveSettings()
					this.plugin.updatePillColors()
				})
			});


			new Setting(containerEl)
			.setName(i18n.t("STYLE_FORMULA_TAGS"))
			.setDesc(i18n.t("STYLE_FORMULA_TAGS_DESC"))
			.addToggle(toggle => {
				toggle.setValue(this.plugin.settings.styleFormulaTags)
				.onChange(value => {
					this.plugin.settings.styleFormulaTags = value
					this.plugin.saveSettings()
					this.plugin.updatePillColors()
				})
			});


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
					let currentColor = this.plugin.settings.propertyPillColors[property]
					
					let propertyColorSetting = new Setting(colorSettingsEl)

					propertyColorSetting.settingEl.classList.add("color-" + currentColor)

					let pillEl = propertyColorSetting.nameEl.createEl("div", {
						cls: "multi-select-pill",
						attr : {
							"data-property-pill-value": property
						},
					})

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
								this.plugin.updatePillColors()
								this.display()
							}
						}
					})
					.addColorPicker(color => {
						propertyColorComponent = color
						color.setValue(this.plugin.settings.propertyPillColors[property])
						.onChange(async (value) => {
							
							propertyColorButton.buttonEl.classList.forEach(cls => {
								if (cls.startsWith("color")) {
									propertyColorButton.buttonEl.classList.remove(cls)
								}
							})
							propertyColorButton.buttonEl.classList.add("color-" + value)

							this.plugin.settings.propertyPillColors[property] = value
							this.plugin.saveSettings()
							this.plugin.updatePillColors()
						})
					})
					.addButton(btn => {
						propertyColorButton = btn
						btn.buttonEl.classList.add("color-" + this.plugin.settings.propertyPillColors[property])
						
						btn
						.setIcon("paintbrush")
						.setClass("property-color-setting-button")
						.onClick((e) => {
							let menu = new Menu()
							let colors = ["red", "orange", "yellow", "green", "cyan", "blue", "purple", "pink", "none"]

							for (let color of colors) {
								menu.addItem((item: MenuItem) => {
									item.setIcon("square")
									if (color != "default" && color != "none") {
										//@ts-ignore
										item.iconEl.style = "color: transparent; background-color: rgba(var(--color-" + color + "-rgb), 0.3);"
									}
							
									if (color == "none") {
										//@ts-ignore
										item.iconEl.style = "opacity: 0.2;"
									}
							
									item.setTitle(i18n.t(color))
									.onClick(() => {

										propertyColorComponent.setValue("")

										btn.buttonEl.classList.forEach(cls => {
											if (cls.startsWith("color")) {
												propertyColorButton.buttonEl.classList.remove(cls)
											}
										})
										btn.buttonEl.classList.add("color-" + color)

										this.plugin.settings.propertyPillColors[property] = color
										this.plugin.saveSettings()
										this.plugin.updatePillColors()

									})

									item.setChecked(color == this.plugin.settings.propertyPillColors[property])
								})
							}

							menu.showAtMouseEvent(e)
						})
					})
					.addButton(btn => btn
						.setIcon("x")
						.onClick(() => {
							delete this.plugin.settings.propertyPillColors[property]
							this.plugin.saveSettings()
							propertyColorSetting.settingEl.remove()
							this.plugin.updatePillColors()
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
								this.plugin.settings.propertyPillColors[newProperty] = "none"
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
					let currentColor = this.plugin.settings.propertyLongtextColors[property]
					
					let propertyColorSetting = new Setting(colorSettingsEl)

					propertyColorSetting.settingEl.classList.add("color-" + currentColor)

					let pillEl = propertyColorSetting.nameEl.createEl("div", {
						text: property,
						cls: "metadata-input-longtext",
						attr : {
							"data-property-longtext-value": property
						},
					})

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
								this.plugin.updatePillColors()
								this.display()
							}
						}
					})
					.addColorPicker(color => {
						propertyColorComponent = color
						color.setValue(this.plugin.settings.propertyLongtextColors[property])
						.onChange(async (value) => {
							
							propertyColorButton.buttonEl.classList.forEach(cls => {
								if (cls.startsWith("color")) {
									propertyColorButton.buttonEl.classList.remove(cls)
								}
							})
							propertyColorButton.buttonEl.classList.add("color-" + value)

							this.plugin.settings.propertyLongtextColors[property] = value
							this.plugin.saveSettings()
							this.plugin.updatePillColors()
						})
					})
					.addButton(btn => {
						propertyColorButton = btn
						btn.buttonEl.classList.add("color-" + this.plugin.settings.propertyLongtextColors[property])
						btn
						.setIcon("paintbrush")
						.setClass("property-color-setting-button")
						.onClick((e) => {
							let menu = new Menu()
							let colors = ["red", "orange", "yellow", "green", "cyan", "blue", "purple", "pink", "none"]

							for (let color of colors) {
								menu.addItem((item: MenuItem) => {
									item.setIcon("square")
									if (color != "default" && color != "none") {
										//@ts-ignore
										item.iconEl.style = "color: transparent; background-color: rgba(var(--color-" + color + "-rgb), 0.3);"
									}
							
									if (color == "none") {
										//@ts-ignore
										item.iconEl.style = "opacity: 0.2;"
									}
							
									item.setTitle(i18n.t(color))
									.onClick(() => {

										propertyColorComponent.setValue("")

										btn.buttonEl.classList.forEach(cls => {
											if (cls.startsWith("color")) {
												propertyColorButton.buttonEl.classList.remove(cls)
											}
										})
										btn.buttonEl.classList.add("color-" + color)

										this.plugin.settings.propertyLongtextColors[property] = color
										this.plugin.saveSettings()
										this.plugin.updatePillColors()

									})

									item.setChecked(color == this.plugin.settings.propertyLongtextColors[property])
								})
							}

							menu.showAtMouseEvent(e)
						})
					})
					.addButton(btn => btn
						.setIcon("x")
						.onClick(() => {
							delete this.plugin.settings.propertyLongtextColors[property]
							this.plugin.saveSettings()
							propertyColorSetting.settingEl.remove()
							this.plugin.updatePillColors()
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
								this.plugin.settings.propertyLongtextColors[newProperty] = "none"
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
								this.plugin.updateHiddenProperties()
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
							this.plugin.updateHiddenProperties()
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
								this.plugin.updateHiddenProperties()
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
					this.plugin.updateElements()
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
						this.plugin.updateElements()
					}));

				new Setting(containerEl)
				.setName(i18n.t("CUSTOM_DATETIME_FORMAT"))
				.addText(text => text
					.setPlaceholder("DD.MM.YYYY HH:mm")
					.setValue(this.plugin.settings.customDateTimeFormat)
					.onChange(async (value) => {
						this.plugin.settings.customDateTimeFormat = value;
						await this.plugin.saveSettings();
						this.plugin.updateElements()
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
					this.plugin.updateElements()
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
				.addColorPicker(color => {
					pastColorComponent = color
					color.setValue(this.plugin.settings.datePastColor)
					.onChange(async (value) => {
						this.plugin.settings.datePastColor = value
						await this.plugin.saveSettings();
						this.plugin.updateRelativeDateColors();
						pastColorButton.buttonEl.classList.forEach(cls => {
							if (cls.startsWith("color")) {
								pastColorButton.buttonEl.classList.remove(cls)
							}
						})
						pastColorButton.buttonEl.classList.add("color-" + this.plugin.settings.datePastColor)
					})
				})
				.addButton(btn => {
					pastColorButton = btn
					btn.setIcon("paintbrush")
					.setClass("property-color-setting-button")
					.setClass("color-" + this.plugin.settings.datePastColor)
					.onClick((e) => {
						let menu = new Menu()
						let colors = ["red", "orange", "yellow", "green", "cyan", "blue", "purple", "pink", "default"]

						for (let color of colors) {
							menu.addItem((item: MenuItem) => {
								item.setIcon("square")
								if (color != "default" && color != "none") {
									//@ts-ignore
									item.iconEl.style = "color: transparent; background-color: rgba(var(--color-" + color + "-rgb), 0.3);"
								}
						
								item.setTitle(i18n.t(color))
								.onClick(() => {
									pastColorComponent.setValue("")
									this.plugin.settings.datePastColor = color
									this.plugin.saveSettings()
									this.plugin.updateRelativeDateColors()

									btn.buttonEl.classList.forEach(cls => {
										if (cls.startsWith("color")) {
											btn.buttonEl.classList.remove(cls)
										}
									})
									btn.buttonEl.classList.add("color-" + color)
								})
								item.setChecked(color == this.plugin.settings.datePastColor)
							})
						}
						menu.showAtMouseEvent(e)
					})
				})


				let presentColorComponent: ColorComponent
				let presentColorButton: ButtonComponent
				
				


				let presentSEtting = new Setting(containerEl)
				presentSEtting.controlEl.createEl("span", {text: presentDate, cls: "setting-custom-date-present"})
				presentSEtting.setName(i18n.t("PRESENT_DATE_COLOR"))
				.addColorPicker(color => {
					presentColorComponent = color
					color.setValue(this.plugin.settings.datePresentColor)
					.onChange(async (value) => {
						this.plugin.settings.datePresentColor = value
						await this.plugin.saveSettings();
						this.plugin.updateRelativeDateColors();
						presentColorButton.buttonEl.classList.forEach(cls => {
							if (cls.startsWith("color")) {
								presentColorButton.buttonEl.classList.remove(cls)
							}
						})
						presentColorButton.buttonEl.classList.add("color-" + this.plugin.settings.datePresentColor)
					})
				})
				.addButton(btn => {
					presentColorButton = btn
					btn.setIcon("paintbrush")
					.setClass("property-color-setting-button")
					.setClass("color-" + this.plugin.settings.datePresentColor)
					.onClick((e) => {
						let menu = new Menu()
						let colors = ["red", "orange", "yellow", "green", "cyan", "blue", "purple", "pink", "default"]

						for (let color of colors) {
							menu.addItem((item: MenuItem) => {
								item.setIcon("square")
								if (color != "default" && color != "none") {
									//@ts-ignore
									item.iconEl.style = "color: transparent; background-color: rgba(var(--color-" + color + "-rgb), 0.3);"
								}
						
								item.setTitle(i18n.t(color))
								.onClick(() => {
									presentColorComponent.setValue("")
									this.plugin.settings.datePresentColor = color
									this.plugin.saveSettings()
									this.plugin.updateRelativeDateColors()

									btn.buttonEl.classList.forEach(cls => {
										if (cls.startsWith("color")) {
											btn.buttonEl.classList.remove(cls)
										}
									})
									btn.buttonEl.classList.add("color-" + color)
								})
								item.setChecked(color == this.plugin.settings.datePresentColor)
							})
						}
						menu.showAtMouseEvent(e)
					})
				})



				let futureColorComponent: ColorComponent
				let futureColorButton: ButtonComponent
				
				let futureSetting = new Setting(containerEl)

				futureSetting.controlEl.createEl("span", {text: futureDate, cls: "setting-custom-date-future"})

				futureSetting.setName(i18n.t("FUTURE_DATE_COLOR"))
				.addColorPicker(color => {
					futureColorComponent = color
					color.setValue(this.plugin.settings.dateFutureColor)
					.onChange(async (value) => {
						this.plugin.settings.dateFutureColor = value
						await this.plugin.saveSettings();
						this.plugin.updateRelativeDateColors();
						futureColorButton.buttonEl.classList.forEach(cls => {
							if (cls.startsWith("color")) {
								futureColorButton.buttonEl.classList.remove(cls)
							}
						})
						futureColorButton.buttonEl.classList.add("color-" + this.plugin.settings.dateFutureColor)
					})
				})
				.addButton(btn => {
					futureColorButton = btn
					btn.setIcon("paintbrush")
					.setClass("property-color-setting-button")
					.setClass("color-" + this.plugin.settings.dateFutureColor)
					.onClick((e) => {
						let menu = new Menu()
						let colors = ["red", "orange", "yellow", "green", "cyan", "blue", "purple", "pink", "default"]

						for (let color of colors) {
							menu.addItem((item: MenuItem) => {
								item.setIcon("square")
								if (color != "default" && color != "none") {
									//@ts-ignore
									item.iconEl.style = "color: transparent; background-color: rgba(var(--color-" + color + "-rgb), 0.3);"
								}
						
								item.setTitle(i18n.t(color))
								.onClick(() => {
									futureColorComponent.setValue("")
									this.plugin.settings.dateFutureColor = color
									this.plugin.saveSettings()
									this.plugin.updateRelativeDateColors()

									btn.buttonEl.classList.forEach(cls => {
										if (cls.startsWith("color")) {
											btn.buttonEl.classList.remove(cls)
										}
									})
									btn.buttonEl.classList.add("color-" + color)
									
								})

								item.setChecked(color == this.plugin.settings.dateFutureColor)
							})
						}

						menu.showAtMouseEvent(e)
					})
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
						this.display();
						this.plugin.updateBaseStyles()
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
						this.plugin.updateBaseStyles()
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
						this.plugin.updateElements()
						this.plugin.updateHiddenProperties()
						this.plugin.updatePillColors()
						this.plugin.updateBannerStyles()
						this.plugin.updateIconStyles()
						this.plugin.updateCoverStyles()
						this.display();
						new Notice(i18n.t("CLEAR_SETTINGS_NOTICE"))
					}))
		}




	
	
	}
}