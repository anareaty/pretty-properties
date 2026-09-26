import {
	Plugin,
	Menu
} from "obsidian";
import { 
	updateAutoHideProps,
	updateBannerStyles, 
	updateColoredTagsStyle, 
	updateCoverStyles, 
	updateHiddenEmptyProperties, 
	updateHiddenMetadataContainer, 
	updateHideMetadataAddButton, 
	updateHidePropTitle, 
	updateIconStyles,
	updateRelativeDateColors,
	updateTheme,
} from "./updates/updateStyles";
import { i18n } from "./localization/localization";
import { PPSettingTab, PPPluginSettings, DEFAULT_SETTINGS } from "./settings/settings";
import { registerCommands } from "./utils/registerCommands";
import { updateEmptyProperties, updateImagesOnCacheChanged } from "./updates/updateElements";
import { registerTagFixExtension } from "./extensions/tagFixExtension";
import { updatePillPaddings } from "./updates/updateStyles";
import { registerTagPostProcessor } from "./extensions/tagPostProcessor";
import { updatePropertiesInPropTab } from "./updates/updateStyles";
import { patchPropertyWidgets } from "./patches/patchWidgets";
import { patchTagView } from "./patches/patchTagView";
import { patchMarkdownView } from "./patches/patchMarkdownView";
import { patchBaseCards } from "./patches/patchBaseCards";
import { updateAllProgressElsOnMaxChange } from "./updates/updateProgress";
import { patchBaseList } from "./patches/patchBaseList";
import { patchBaseTable } from "./patches/patchBaseTable";
import { unPatchWidgets } from "./patches/removePatches";
import { patchHoverPopover } from "./patches/patchHoverPopover";
import { API, createApi } from "./utils/createApi";
import { patchMenu } from "./patches/patchMenu";
import { reloadAllTabs } from "./utils/reload";
import { patchEmbed } from "./patches/patchEmbed";
import { patchMetadataSuggester } from "./patches/patchMetadataSuggester";
import { patchBaseKanban } from "./patches/patchBaseKanban";
import { MarkdownRenderChild } from "obsidian";
import { clearUnusedRenderComponents } from "./updates/updatePropertyFormattings";
import { migrateColorSettings, migrateCoverProperties, migrateCoverSettings } from "./utils/settingsMigration";
import { registerPropertySearch } from "./utils/propertySearch";

type Patch = () => void
type PatchList = Record<string, Patch>



export default class PrettyPropertiesPlugin extends Plugin {
	settings: PPPluginSettings;
	patches: Record<string, PatchList | Patch>;
	api: API;
	settingTab: PPSettingTab
	activeRenderComponents: MarkdownRenderChild[]


	async onload() {
		await this.loadSettings();


		

		createApi(this)
		i18n.setLocale();
		this.activeRenderComponents = []
		this.patches = {}

		patchPropertyWidgets(this)
		patchTagView(this)
		patchMarkdownView(this)
		patchEmbed(this)
		patchHoverPopover(this)
		patchBaseTable(this)
		patchBaseCards(this)
		patchBaseList(this)
		patchBaseKanban(this)
		patchMenu(this)
		patchMetadataSuggester(this)


		
		updateRelativeDateColors(this)
		updateBannerStyles(this);
		updateIconStyles(this);
		updateCoverStyles(this);
		updatePillPaddings(this)
		updateEmptyProperties(this)
		updatePropertiesInPropTab(this)
		updateHiddenEmptyProperties(this)
		updateHiddenMetadataContainer(this)
		updateAutoHideProps(this)
		updateHidePropTitle(this)
		updateHideMetadataAddButton(this)
		updateColoredTagsStyle(this)
		updateTheme(this)



		
		

		

		
		
		registerCommands(this)
		
		registerTagFixExtension(this)
		registerTagPostProcessor(this)

		this.registerEvent(
			this.app.metadataCache.on("changed", (file, data, cache) => {
				updateImagesOnCacheChanged(file, cache, this)
				updateAllProgressElsOnMaxChange(file, cache, this)
			})
		);

		

		this.registerEvent(
			this.app.workspace.on('css-change', () => {
				updateTheme(this)
			})
		);


		this.registerEvent(
			this.app.workspace.on('layout-change', () => {
				clearUnusedRenderComponents(this)
			})
		);

		this.registerEvent(
			this.app.workspace.on('active-leaf-change', () => {
				clearUnusedRenderComponents(this)
			})
		);



		const registerWindowEvents = (win: Window) => {

    		let plugins = this.app.plugins
			

			this.registerDomEvent(win, "click", (e: PointerEvent) => {
				registerPropertySearch(e, this)
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
						targetEl.closest(".title-icon-wrapper") ||
						targetEl.closest(".pp-banner") || 
						targetEl.closest(".pp-cover")

						
					) {
						e.preventDefault();
						if (!imageMenuExist) {
							let menu = new Menu();
							menu.showAtMouseEvent(e)
						}
					}


					if (targetEl.closest(".tag-pane-tag") &&
					this.settings.enableColoredProperties) {
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
			this.app.workspace.on("window-open", (win, window) => {
				registerWindowEvents(window);
			})
		);

		

		this.addSettingTab(new PPSettingTab(this.app, this));



		// We need to reload all tabs to update existing properties
		this.app.workspace.onLayoutReady(async () => {
			await migrateColorSettings(this)
			await migrateCoverProperties(this)
			reloadAllTabs(this)
		})
		

	}

	onunload() {
		unPatchWidgets(this)
		reloadAllTabs(this)
		clearUnusedRenderComponents(this)
	}


	async loadSettings() {
		const data = ((await this.loadData()) ?? {}) as PPPluginSettings;
		await migrateCoverSettings(data, this);
		this.settings = Object.assign({}, DEFAULT_SETTINGS, data);
	}

	async saveSettings() {
		await this.saveData(this.settings);
		
	}
}
