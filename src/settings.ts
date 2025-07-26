import { App, Notice, PluginSettingTab, Setting } from 'obsidian';
import { i18n } from './localization';
import PrettyPropertiesPlugin from "./main";

export interface PPPluginSettings {
    mySetting: string;
    hiddenProperties: string[];
    propertyPillColors: any;
    enableBanner: boolean;
    enableCover: boolean;
    bannerProperty: string;
    coverProperty: string;
    extraCoverProperties: string[],
    bannerHeight: number;
    bannerHeightMobile: number;
    bannerMargin: number;
    bannerFading: boolean;
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
}

export const DEFAULT_SETTINGS: PPPluginSettings = {
    mySetting: 'default',
    hiddenProperties: [],
    propertyPillColors: {},
    enableBanner: true,
    enableCover: true,
    bannerProperty: "banner",
    coverProperty: "cover",
    extraCoverProperties: [],
    bannerHeight: 150, 
    bannerHeightMobile: 100,
    bannerMargin: 15,
    bannerFading: true,
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
	coversFolder: ""
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
			.setName(i18n.t("BANNER_MARGIN"))
			.addText(text => {
				text.inputEl.type = "number"
				text.setValue(this.plugin.settings.bannerMargin.toString())
				.setPlaceholder('15')
				.onChange(async (value) => {
					if (!value) value = "0"
					this.plugin.settings.bannerMargin = Number(value);
					await this.plugin.saveSettings();
				    this.plugin.updateBannerStyles();
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


		
		new Setting(containerEl).setName(i18n.t("OTHER")).setHeading();


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
					this.plugin.updateCoverStyles()
					this.display();
					new Notice(i18n.t("CLEAR_SETTINGS_NOTICE"))
				}))
	}
}