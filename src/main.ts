import {
	Plugin,
	loadMathJax,
	Menu
} from "obsidian";
import { 
	updateAutoHideProps,
	updateBannerStyles, 
	updateCoverStyles, 
	updateHiddenEmptyProperties, 
	updateHiddenMetadataContainer, 
	updateHideMetadataAddButton, 
	updateHidePropTitle, 
	updateIconStyles,
	updateRelativeDateColors,
	updateTheme,
} from "./utils/updates/updateStyles";
import { i18n } from "./localization/localization";
import { PPSettingTab, PPPluginSettings, DEFAULT_SETTINGS } from "./settings/settings";
import { registerCommands } from "./utils/registerCommands";
import { updateAllProperties, updateEmptyProperties, updateImagesOnCacheChanged } from "./utils/updates/updateElements";
import { getPropertyValue } from "./utils/propertyUtils";
import { registerTagFixExtension } from "./extensions/tagFixExtension";
import { updatePillPaddings } from "./utils/updates/updateStyles";
import { registerTagPostProcessor } from "./extensions/tagPostProcessor";
import { updateHiddenPropertiesInPropTab, updateBaseTagsStyle } from "./utils/updates/updateStyles";
import { patchPropertyWidgets } from "./patches/patchWidgets";
import { patchTagView } from "./patches/patchTagView";
import { patchMarkdownView } from "./patches/patchMarkdownView";
import { patchBaseCards } from "./patches/patchBaseCards";
import { updateAllProgressElsOnMaxChange } from "./utils/updates/updateProgress";
import { patchBaseList } from "./patches/patchBaseList";
import { patchBaseTable } from "./patches/patchBaseTable";
import { unPatchWidgets } from "./patches/removePatches";
import { patchHoverPopover } from "./patches/patchHoverPopover";
import { API, createApi } from "./utils/createApi";
import {PropertyFormatter, registerPropertyFormatter} from "./utils/propertyFormatter";
import { patchMenu } from "./patches/patchMenu";
import { reloadAllTabs } from "./utils/reload";
import { patchEmbed } from "./patches/patchEmbed";

export default class PrettyPropertiesPlugin extends Plugin {
	settings: PPPluginSettings;
	patches: Record<string, any>;
	api: API;
	formatter: PropertyFormatter;
	propertyListeners: any[]


	async onload() {
		await this.loadSettings();
		//@ts-ignore
		if (this.settings.enableMath && !window.MathJax) {
			await loadMathJax()
		}

		createApi(this)
		i18n.setLocale();
		this.patches = {}
		this.propertyListeners = []
		registerPropertyFormatter(this)


		patchPropertyWidgets(this)
		patchTagView(this)
		patchMarkdownView(this)
		patchEmbed(this)
		patchHoverPopover(this)
		patchBaseTable(this)
		patchBaseCards(this)
		patchBaseList(this)
		patchMenu(this)


		
		updateRelativeDateColors(this)
		updateBannerStyles(this);
		updateIconStyles(this);
		updateCoverStyles(this);
		updatePillPaddings(this)
		updateEmptyProperties(this)
		updateHiddenPropertiesInPropTab(this)
		updateHiddenEmptyProperties(this)
		updateHiddenMetadataContainer(this)
		updateAutoHideProps(this)
		updateHidePropTitle(this)
		updateHideMetadataAddButton(this)
		updateBaseTagsStyle(this)
		
		updateTheme(this)



		
		

		

		
		
		registerCommands(this)
		
		registerTagFixExtension(this)
		registerTagPostProcessor(this)

		this.registerEvent(
			this.app.metadataCache.on("changed", async (file, data, cache) => {
				updateImagesOnCacheChanged(file, cache, this)
				updateAllProgressElsOnMaxChange(file, cache, this)
			})
		);

		

		this.registerEvent(
			this.app.workspace.on('css-change', () => {
				updateTheme(this)
			})
		);



		const registerWindowEvents = (win: Window) => {

			//@ts-ignore
    		let plugins = this.app.plugins
			

			this.registerDomEvent(win, "click", (e: MouseEvent) => {


				//@ts-ignore
				let searchPlugin = this.app.internalPlugins.getEnabledPluginById("global-search")

				if (searchPlugin && e.target instanceof HTMLElement) {
					if ((e.ctrlKey || e.metaKey)) {
						let value = getPropertyValue(e, this);
						if (value !== undefined) {
							let propEl = e.target.closest(".metadata-property");
							let prop = propEl!.getAttribute("data-property-key");
							let search = "[" + prop + ': "' + value + '"]';
							searchPlugin.openGlobalSearch(search);
						}
					}
				}
			});

			this.registerDomEvent(
				win,
				"contextmenu",
				(e: PointerEvent) => {

					let imageMenuExist = 
						plugins.getPlugin("copy-url-in-preview") || 
						plugins.getPlugin("pixel-perfect-image") 

					let targetEl = e.target as HTMLElement

					if (
						targetEl.closest(".pp-icon") || 
						targetEl.closest(".banner-image") || 
						targetEl.closest(".metadata-side-image")
					) {
						e.preventDefault();
						if (!imageMenuExist) {
							let menu = new Menu();
							menu.showAtMouseEvent(e)
						}
					}


					if (targetEl.closest(".tag-pane-tag") &&
					this.settings.enableColoredTagsInTagPane) {
						let tagPaneMenuExist = plugins.getPlugin("tag-wrangler")
						if (!tagPaneMenuExist) {
							let menu = new Menu();
							menu.showAtMouseEvent(e)
						}
					}
				},
				true
			)
		}

		registerWindowEvents(window);

		this.registerEvent(
			this.app.workspace.on("window-open", async (win, window) => {
				registerWindowEvents(window);
			})
		);

		

		this.addSettingTab(new PPSettingTab(this.app, this));



		// We need to reload all tabs to update existing properties
		this.app.workspace.onLayoutReady(() => {
			reloadAllTabs(this)
		})
		

	}

	onunload() {
		unPatchWidgets(this)
		reloadAllTabs(this)
		if (this.formatter) {
			this.formatter.clearCache();
		}
	}


	async loadSettings() {
		const data = (await this.loadData()) ?? {};
		await this.migrateSettings(data);
		this.settings = Object.assign({}, DEFAULT_SETTINGS, data);
	}

	

	async migrateSettings(data: any){
		if (!Array.isArray(data.coverProperties)) {
			const coverProperty = data.coverProperty ?? DEFAULT_SETTINGS.coverProperties[0].property;
			const extra = Array.isArray(data.extraCoverProperties) ? data.extraCoverProperties : [];

			data.coverProperties = [
				{ property: coverProperty, format: "" },
				...extra.map((p: string) => ({ property: p, format: "" })),
			];

			delete data.coverProperty;
			delete data.extraCoverProperties;

			await this.saveData(data);
		}
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}
