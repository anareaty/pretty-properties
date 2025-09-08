import {
	Plugin,
	Platform
} from "obsidian";
import { 
	updateBannerStyles, 
	updateCoverStyles, 
	updateIconStyles,
	updateHiddenProperties,
	updatePillColors,
	updateRelativeDateColors,
	updateBaseStyles
} from "./utils/updates/updateStyles";
import MenuManager from "src/utils/menuManager";
import { i18n } from "./localization/localization";
import { PPSettingTab, PPPluginSettings, DEFAULT_SETTINGS } from "./settings";
import { registerCommands } from "./utils/registerCommands";
import { tagFixPlugin } from "./extensions/tagFixExtension";
import { createCoverMenu } from "./menus/coverMenu";
import { createBannerMenu } from "./menus/bannerMenu";
import { createIconMenu } from "./menus/iconMenu";
import { handlePropertyMenu } from "./menus/propertyMenu";
import { handlePillMenu, handleTagMenu } from "./menus/selectColorMenus";
import { updateTaskNotesTaskCount } from "./utils/taskCount/taskNotesTaskCount";
import { updateElements } from "./utils/updates/updateElements";
import { startObservingLeaf } from "./utils/observer";
import { getPropertyValue } from "./utils/propertyUtils";


export default class PrettyPropertiesPlugin extends Plugin {
	settings: PPPluginSettings;
	mutations: any[];
	observers: MutationObserver[];
	menuManager: MenuManager

	async onload() {
		await this.loadSettings();
		i18n.setLocale();

		this.menuManager = new MenuManager
		this.observers = [];

		updateHiddenProperties(this);
		updatePillColors(this);
		updateRelativeDateColors(this)
		updateBannerStyles(this);
		updateIconStyles(this);
		updateCoverStyles(this);
		updateBaseStyles(this)
		registerCommands(this)

		if (this.settings.nonLatinTagsSupport) {
			this.registerEditorExtension(tagFixPlugin)
		}
		
		this.registerEvent(
			this.app.workspace.on("layout-change", async () => {
				updateElements(this);
			})
		);

		this.registerEvent(
			this.app.metadataCache.on("changed", async (file, data, cache) => {
				updateElements(this, file, cache);
			})
		);

		this.registerEvent(
			this.app.workspace.on("file-open", async (file) => {
				if (file && this.settings.enableTaskNotesCount) {
					updateTaskNotesTaskCount(this, file)
				}
			})
		);

		this.registerEvent(
			this.app.workspace.on("layout-change", async () => {
				this.observers.forEach((obs) => {
					obs.disconnect();
				});
				this.observers = [];
				const mdLeafs = this.app.workspace.getLeavesOfType("markdown");
				for (let leaf of mdLeafs) {
					startObservingLeaf(leaf, "markdown", this);
				}
				const propLeafs = this.app.workspace.getLeavesOfType("file-properties");
				for (let leaf of propLeafs) {
					startObservingLeaf(leaf, "file-properties", this);
				}
				if (this.settings.enableBases) {
					const baseLeafs = this.app.workspace.getLeavesOfType("bases");
					for (let leaf of baseLeafs) {
						startObservingLeaf(leaf, "bases", this);
					}
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

				//@ts-ignore
				let searchPlugin = this.app.internalPlugins.plugins["global-search"]

				if (searchPlugin.enabled && e.target instanceof HTMLElement) {
					
					if ((e.ctrlKey || e.metaKey)) {
						let value = getPropertyValue(e, this);
						if (value !== undefined) {
							let propEl = e.target.closest(".metadata-property");
							let prop = propEl!.getAttribute("data-property-key");
							let search = "[" + prop + ': "' + value + '"]';
							searchPlugin.instance.openGlobalSearch(search);
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
						if (targetEl.closest(".banner-image")) {
							e.preventDefault();
							createBannerMenu(e, this);
						}
						if (targetEl.closest(".metadata-side-image")) {
							e.preventDefault();
							createCoverMenu(e, this);
						}
						if (targetEl.closest(".pp-icon")) {
							e.preventDefault();
							createIconMenu(e, this);
						}
					}
				},
				true
			);
		};

		registerDocumentEvents(document);

		this.registerEvent(
			this.app.workspace.on("window-open", async (win, window) => {
				registerDocumentEvents(win.doc);
			})
		);

		this.addSettingTab(new PPSettingTab(this.app, this));
	}

	onunload() {}

	async loadSettings() {
		this.settings = Object.assign(
			{},
			DEFAULT_SETTINGS,
			await this.loadData()
		);
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}
