import {
	Plugin,
	Platform,
	loadMathJax
} from "obsidian";
import { 
	updateBannerStyles, 
	updateCoverStyles, 
	updateHiddenEmptyProperties, 
	updateIconStyles,
	updateRelativeDateColors,
} from "./utils/updates/updateStyles";
import MenuManager from "src/utils/menuManager";
import { i18n } from "./localization/localization";
import { PPSettingTab, PPPluginSettings, DEFAULT_SETTINGS } from "./settings/settings";
import { registerCommands } from "./utils/registerCommands";
import { createCoverMenu } from "./menus/coverMenu";
import { createBannerMenu } from "./menus/bannerMenu";
import { createIconMenu } from "./menus/iconMenu";
import { handlePropertyMenu } from "./menus/propertyMenu";
import { handlePillMenu, handleTagMenu, handleTagPaneMenu } from "./menus/selectColorMenus";
import { updateTaskNotesTaskCount, updateTaskNotesTaskCountOnCacheChanged } from "./utils/taskCount/taskNotesTaskCount";
import { updateAllProperties, updateEmptyProperties, updateImagesOnCacheChanged } from "./utils/updates/updateElements";
import { getPropertyValue } from "./utils/propertyUtils";
import { registerTagFixExtension } from "./extensions/tagFixExtension";
import { updatePillPaddings } from "./utils/updates/updateStyles";
import { registerTagPostProcessor } from "./extensions/tagPostProcessor";
import { updateHiddenPropertiesInPropTab, updateBaseTagsStyle } from "./utils/updates/updateStyles";
import { removeAll } from "./utils/remove";
import { updateData } from "./utils/updateData";
import { patchPropertyWidgets } from "./patches/patchWidgets";
import { patchTagView } from "./patches/patchTagView";
import { patchMarkdownView } from "./patches/patchMarkdownView";
import { patchBaseCards } from "./patches/patchBaseCards";
import { updateAllProgressElsOnMaxChange } from "./utils/updates/updateProgress";
import { patchBaseList } from "./patches/patchBaseList";
import { patchBaseTable } from "./patches/patchBaseTable";
import { updateTaskCountOnCacheChanged } from "./utils/taskCount/taskCount";
import { unPatchWidgets } from "./patches/removePatches";
import { patchHoverPopover } from "./patches/patchHoverPopover";
import { API, createApi } from "./utils/createApi";

export default class PrettyPropertiesPlugin extends Plugin {
	settings: PPPluginSettings;
	menuManager: MenuManager
	patches: Record<string, any>
	api: API

	async onload() {
		await this.loadSettings();
		//@ts-ignore
		if (this.settings.enableMath && !window.MathJax) {
			await loadMathJax()
		}
		updateData(this)
		createApi(this)
		i18n.setLocale();
		this.menuManager = new MenuManager
		this.patches = {}
		patchPropertyWidgets(this)
		patchTagView(this)
		patchMarkdownView(this)
		patchHoverPopover(this)
		patchBaseTable(this)
		patchBaseCards(this)
		patchBaseList(this)


		updateRelativeDateColors(this)
		updateBannerStyles(this);
		updateIconStyles(this);
		updateCoverStyles(this);
		updatePillPaddings(this)
		updateEmptyProperties(this)
		updateHiddenPropertiesInPropTab(this)
		updateHiddenEmptyProperties(this)
		updateBaseTagsStyle(this)

		this.app.workspace.onLayoutReady(() => {
			updateAllProperties(this)
		})
		


		registerCommands(this)
		

		registerTagFixExtension(this)
		registerTagPostProcessor(this)


		this.registerEvent(
			this.app.metadataCache.on("changed", async (file, data, cache) => {
				updateImagesOnCacheChanged(file, cache, this)
				updateAllProgressElsOnMaxChange(file, cache, this)
				updateTaskCountOnCacheChanged(file, cache, this)
				updateTaskNotesTaskCountOnCacheChanged(file, cache, this)
			})
		);

		this.registerEvent(
			this.app.workspace.on("file-open", async (file) => {
				
				if (file && this.settings.enableTaskNotesCount && this.settings.autoTasksCount) {
					updateTaskNotesTaskCount(this, file)
				}
			})
		);


		const registerDocumentEvents = (doc: Document) => {
			if (Platform.isMobile) {
				this.registerDomEvent(doc, "contextmenu", (e: MouseEvent) => {
					if (
						e.target instanceof HTMLElement &&
						e.target.closest(".multi-select-pill") &&
						this.settings.enableColoredProperties
					) {
						handlePillMenu(e, e.target, this);
					}
				});

				this.registerDomEvent(doc, "touchstart", (e: TouchEvent) => {
					if (
						(e.target instanceof HTMLElement ||
							e.target instanceof SVGElement) &&
						e.target.closest(".metadata-property-icon")
					) {
						handlePropertyMenu(e.target, this);
					}
					if (e.target instanceof HTMLElement && 
						e.target.closest(".cm-hashtag") && 
						this.settings.enableColoredInlineTags
					) {
                        handleTagMenu(e, e.target, this);
					}
				});
			} else {

				this.registerDomEvent(doc, "mousedown", (e: MouseEvent) => {
					let targetEl = e.target as HTMLElement;
					if (e.button == 2) {
						if (targetEl.closest(".multi-select-pill") || targetEl.closest(".metadata-input-longtext")) {
							if (this.settings.enableColoredProperties) {
								handlePillMenu(e, targetEl, this);
							}
						}
						if (targetEl.closest(".cm-hashtag") &&
						this.settings.enableColoredInlineTags) {
							handleTagMenu(e, targetEl, this);
						}

					}
					if (targetEl.closest(".metadata-property-icon")) {
						handlePropertyMenu(targetEl, this);
					}
				});
			}

			this.registerDomEvent(doc, "click", (e: MouseEvent) => {

				if (e.target instanceof HTMLElement && (
					e.target.classList.contains("internal-link") || e.target.closest(".internal-link")
				)) {
					return
				}

				

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
				doc,
				"contextmenu",
				(e: MouseEvent) => {
					let targetEl = e.target;

					
					if (targetEl instanceof Element) {
						if (targetEl.closest(".pp-icon")) {
							e.preventDefault();
							createIconMenu(e, this);
						}
					}

					if (targetEl instanceof HTMLElement) {
						if (targetEl.closest(".banner-image")) {
							e.preventDefault();
							createBannerMenu(e, this);
						}
						if (targetEl.closest(".metadata-side-image")) {
							e.preventDefault();
							createCoverMenu(e, this);
						}
						if (targetEl.closest(".tag-pane-tag") &&
						this.settings.enableColoredTagsInTagPane) {
							handleTagPaneMenu(e, targetEl, this);
						}

					}
				},
				true
			)
		}

		registerDocumentEvents(document);

		this.registerEvent(
			this.app.workspace.on("window-open", async (win, window) => {
				registerDocumentEvents(win.doc);
			})
		);

		this.addSettingTab(new PPSettingTab(this.app, this));


	}

	onunload() {
		unPatchWidgets(this)
		removeAll()
	}

	async loadSettings() {
		this.settings = Object.assign(
			{},
			DEFAULT_SETTINGS,
			await this.loadData()
		)
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}
