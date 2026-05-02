import { App, PluginSettingTab } from 'obsidian';
import { i18n } from '../localization/localization';
import PrettyPropertiesPlugin from "../main";

import { showBannerSettings } from './bannerSettings';
import { showIconSettings } from './iconSettings';
import { showCoverSettings } from './coversettings';
import { showDatesSettings } from './datesSettings';
import { showOtherSettings } from './otherSettings';
import { showColorSettings } from './colorSettings';
import { showHiddenSettingsTab } from './hiddenSettingsTab';
import { showFormatSettingsTab } from './formatSettings';


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
    coverProperty?: string;//deprecated
	extraCoverProperties?: string[];//deprecated
	coverProperties: Array<{ property: string; format: string }>;
    bannerHeight: number;
    bannerHeightMobile: number;
	bannerHeightPopover: number;
    bannerMargin: number;
	bannerMarginMobile: number;
    bannerFading: boolean;
	coverDefaultWidth1: number;
	coverDefaultWidth2: number;
	coverDefaultWidth3: number;
	coverMaxHeight: number;
	coverMaxHeightTopBottom: number;
    coverVerticalWidth: number;
    coverHorizontalWidth: number;
    coverSquareWidth: number;
    coverCircleWidth: number;
	coverMaxWidthPopover: number;
	coverMaxWidthCanvas: number;
    progressProperties: any;
	bannersFolder: string;
	coversFolder: string;
	iconsFolder: string;
	showColorSettings: boolean;
	showTextColorSettings: boolean;
	showHiddenSettings: boolean;
	showHiddenEmptySettings: boolean;
	showExtraFormattings: boolean;
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
	bannerPositionProperty: string;
	addPillPadding: string;
	addBaseTagColor: boolean;
	enableColorButtonInBases:boolean;
	customDateFormat: string;
  	customDateTimeFormat: string;
	enableCustomDateFormat: boolean;
	enableCustomDateFormatInBases: boolean;
	enableRelativeDateColors: boolean;
	settingsTab: string;
	propertyFormats: Record<string, { format: string; textFormat: string }>;
	enableColoredProperties: boolean;
	enableColoredInlineTags: boolean;
	nonLatinTagsSupport: boolean;
	enableColorButton: boolean;
	propertySearchKey: string;
	showTagColorSettings: boolean;
	iconSizeMobile: number;
	iconSizePopover: number;
	hidePropertiesInPropTab: boolean;
	enableColoredTagsInTagPane: boolean;
	mathProperties: string[];
	enableMath: boolean;
	dataVersion: number;
	dateColors: any;
	coverPosition: string;
	enableBannersInPopover: boolean
	enableIconsInPopover: boolean
	enableCoversInPopover: boolean
	hideAllEmptyProperties: boolean
	hiddenWhenEmptyProperties: string[],
	iconInTitle: boolean,
	titleIconSize: number,
	titleTextIconMatchTitleSize: boolean,
	imageLinkFormat: string,
	hideMetadataContainerIfAllPropertiesHiddenEditing: boolean,
	hideMetadataContainerIfAllPropertiesHiddenReading: boolean,
	autoHidePropertiesWithBanner: boolean,	
	hideCoverCollapsed: boolean,
	hidePropTitle: boolean,
	hideAddPropertyButton: boolean,
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
	coverProperties: [{ property: "cover", format: "" }],
    bannerHeight: 150,
    bannerHeightMobile: 100,
	bannerHeightPopover: 100,
    bannerMargin: -20,
	bannerMarginMobile: 0,
    bannerFading: true,
	coverDefaultWidth1: 200,
	coverDefaultWidth2: 250,
	coverDefaultWidth3: 300,
	coverMaxHeight: 500,
	coverMaxHeightTopBottom: 400,
    coverVerticalWidth: 200,
    coverHorizontalWidth: 300,
    coverSquareWidth: 250,
    coverCircleWidth: 250,
	coverMaxWidthPopover: 150,
	coverMaxWidthCanvas: 150,
    progressProperties: {},
	bannersFolder: "",
	coversFolder: "",
	showColorSettings: false,
	showTextColorSettings: false,
	showHiddenSettings: false,
	showHiddenEmptySettings: false,
	showExtraFormattings: false,
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
	bannerPositionProperty: "banner_position",
	addPillPadding: "all",
	addBaseTagColor: true,
	enableColorButtonInBases: false,
	customDateFormat: "",
    customDateTimeFormat: "",
	enableCustomDateFormat: false,
	enableCustomDateFormatInBases: false,
	enableRelativeDateColors: false,
	settingsTab: "BANNERS",
	propertyFormats: {},
	enableColoredProperties: true,
	enableColoredInlineTags: false,
	nonLatinTagsSupport: false,
	enableColorButton: true,
	propertySearchKey: "Ctrl",
	
	showTagColorSettings: false,
	iconSizeMobile: 70,
	iconSizePopover: 50,
	hidePropertiesInPropTab: false,
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
	},
	coverPosition: "left",
	enableBannersInPopover: false,
	enableIconsInPopover: false,
	enableCoversInPopover: false,
	hideAllEmptyProperties: false,
	hiddenWhenEmptyProperties: [],
	iconInTitle: false,
	titleIconSize: 30,
	titleTextIconMatchTitleSize: true,
	imageLinkFormat: "link",
	hideMetadataContainerIfAllPropertiesHiddenEditing: false,
	hideMetadataContainerIfAllPropertiesHiddenReading: false,
	autoHidePropertiesWithBanner: false,
	hideCoverCollapsed: false,
	hidePropTitle: false,
	hideAddPropertyButton: false,

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

		let tabNames = ["BANNERS", "ICONS", "COVERS", "COLORED_PROPERTIES", "HIDDEN_PROPERTIES", "PROPERTY_FORMATTINGS", "OTHER"]
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
			showBannerSettings(this)
		}

		else if (this.plugin.settings.settingsTab == "ICONS") {
			showIconSettings(this)
		}

		else if (this.plugin.settings.settingsTab == "COVERS") {
			showCoverSettings(this)
		}





		else if (this.plugin.settings.settingsTab == "COLORED_PROPERTIES") {
			showColorSettings(this)
		}


		else if (this.plugin.settings.settingsTab == "HIDDEN_PROPERTIES") {
			showHiddenSettingsTab(this)
		}


		else if (this.plugin.settings.settingsTab == "PROPERTY_FORMATTINGS") {
			showFormatSettingsTab(this)
		}

		



		else if (this.plugin.settings.settingsTab == "DATES") {
			showDatesSettings(this)
		}

		else if (this.plugin.settings.settingsTab == "OTHER") {
			showOtherSettings(this)
		}
	}
}
