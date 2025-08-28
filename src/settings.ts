import { App, Notice, PluginSettingTab, Setting, Menu, MenuItem, TextComponent, ColorComponent } from 'obsidian';
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
	datePresentColor: ""

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

		
		new Setting(containerEl).setName(i18n.t("BANNERS")).setHeading();

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






		new Setting(containerEl).setName(i18n.t("ICONS")).setHeading();

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







		
		new Setting(containerEl).setName(i18n.t("COVERS")).setHeading();


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


		new Setting(containerEl).setName(i18n.t("TASKS")).setHeading();

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
					.setPlaceholder('banner')
					.setValue(this.plugin.settings.allTasksCount)
					.onChange(async (value) => {
						this.plugin.settings.allTasksCount = value;
						await this.plugin.saveSettings();
						this.plugin.updateElements();
					}));

				new Setting(containerEl)
				.setName(i18n.t("UNCOMPLETED_TASKS_COUNT_PROPERTY"))
				.addText(text => text
					.setPlaceholder('banner')
					.setValue(this.plugin.settings.uncompletedTasksCount)
					.onChange(async (value) => {
						this.plugin.settings.uncompletedTasksCount = value;
						await this.plugin.saveSettings();
						this.plugin.updateElements();
					}));

				new Setting(containerEl)
				.setName(i18n.t("COMPLETED_TASKS_COUNT_PROPERTY"))
				.addText(text => text
					.setPlaceholder('banner')
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
					.setPlaceholder('banner')
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


		



		new Setting(containerEl).setName(i18n.t("PROPERTY_SETTINGS")).setHeading();

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
				.addButton(btn => btn
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

									propertyColorSetting.settingEl.classList.forEach(cls => {
										if (cls.startsWith("color")) {
											propertyColorSetting.settingEl.classList.remove(cls)
										}
									})

									propertyColorSetting.settingEl.classList.add("color-" + color)

									this.plugin.settings.propertyPillColors[property] = color
									this.plugin.saveSettings()
									this.plugin.updatePillColors()

								})

								item.setChecked(color == this.plugin.settings.propertyPillColors[property])
							})
						}

						menu.showAtMouseEvent(e)
					})
				)
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
				.addButton(btn => btn
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

									propertyColorSetting.settingEl.classList.forEach(cls => {
										if (cls.startsWith("color")) {
											propertyColorSetting.settingEl.classList.remove(cls)
										}
									})

									propertyColorSetting.settingEl.classList.add("color-" + color)

									this.plugin.settings.propertyLongtextColors[property] = color
									this.plugin.saveSettings()
									this.plugin.updatePillColors()

								})

								item.setChecked(color == this.plugin.settings.propertyLongtextColors[property])
							})
						}

						menu.showAtMouseEvent(e)
					})
				)
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










		new Setting(containerEl).setName(i18n.t("DATES")).setHeading();

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


		new Setting(containerEl)
		.setName(i18n.t("ENABLE_RELATIVE_DATE_COLORS"))
		.addToggle(toggle => toggle
			.setValue(this.plugin.settings.enableRelativeDateColors)
			.onChange(async (value) => {
				this.plugin.settings.enableRelativeDateColors = value
				await this.plugin.saveSettings();
				this.display();
				this.plugin.updateRelativeDateColors()
			}));
		
		if (this.plugin.settings.enableRelativeDateColors) {

			new Setting(containerEl)
			.setName(i18n.t("PAST_DATE_COLOR"))
			.addColorPicker(color => color
				.setValue(this.plugin.settings.datePastColor)
				.onChange(async (value) => {
					this.plugin.settings.datePastColor = value
					await this.plugin.saveSettings();
				    this.plugin.updateRelativeDateColors();
				})
			)


			new Setting(containerEl)
			.setName(i18n.t("PRESENT_DATE_COLOR"))
			.addColorPicker(color => color
				.setValue(this.plugin.settings.datePresentColor)
				.onChange(async (value) => {
					this.plugin.settings.datePresentColor = value
					await this.plugin.saveSettings();
				    this.plugin.updateRelativeDateColors();
				})
			)


			let futureColorComponent: ColorComponent
			
			new Setting(containerEl)
			.setName(i18n.t("FUTURE_DATE_COLOR"))
			.addColorPicker(color => {
				futureColorComponent = color
				color.setValue(this.plugin.settings.dateFutureColor)
				.onChange(async (value) => {
					this.plugin.settings.dateFutureColor = value
					await this.plugin.saveSettings();
				    this.plugin.updateRelativeDateColors();
				})
			})
			.addButton(btn => btn
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

								this.plugin.settings.dateFutureColor = color
								this.plugin.saveSettings()
								this.plugin.updateRelativeDateColors()
								
								futureColorComponent.setValue("")
								btn.setClass("color-" + color)

							})

							item.setChecked(color == this.plugin.settings.dateFutureColor)
						})
					}

					menu.showAtMouseEvent(e)
				})
			)

		}

















		new Setting(containerEl).setName(i18n.t("OTHER")).setHeading();


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