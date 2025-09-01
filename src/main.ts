import {
	FileView,
	View,
	Menu,
	getLanguage,
	setTooltip,
	CachedMetadata,
	MarkdownRenderer,
	MarkdownView,
	Plugin,
	TFile,
	MenuItem,
	Platform,
	FrontMatterCache,
	WorkspaceLeaf,
	getIconIds,
	getIcon,
	setIcon, 
	SuggestModal,
	Modal,
	App,
	Setting,
	moment
} from "obsidian";
import MenuManager from "src/MenuManager";
import { i18n } from "./localization";
import PPSettingTab from "./settings";
import { PPPluginSettings, DEFAULT_SETTINGS } from "./settings";
import { LocalImageSuggestModal } from "./modals";
import Emojilib from "emojilib";
import { ImageLinkPrompt } from "./modals";

export default class PrettyPropertiesPlugin extends Plugin {
	settings: PPPluginSettings;
	mutations: any[];
	observers: MutationObserver[];
	menuManager: MenuManager

	async onload() {
		let locale = "en";
		if (getLanguage) {
			locale = getLanguage();
		} else {
			locale = window.localStorage.language;
		}

		i18n.setLocale(locale);
		this.menuManager = new MenuManager

		await this.loadSettings();
		this.updateHiddenProperties();
		this.updatePillColors();
		this.updateRelativeDateColors()
		this.updateBannerStyles();
		this.updateIconStyles();
		this.updateCoverStyles();
		this.updateBaseStyles()

		this.observers = [];

		this.registerEvent(
			this.app.workspace.on("layout-change", async () => {
				this.updateElements();
			})
		);

		this.registerEvent(
			this.app.metadataCache.on("changed", async (file, data, cache) => {
				this.updateElements(file);
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
					this.startObservingLeaf(leaf, "markdown");
				}

				const propLeafs = this.app.workspace.getLeavesOfType("file-properties");
				for (let leaf of propLeafs) {
					this.startObservingLeaf(leaf, "file-properties");
				}

				if (this.settings.enableBases) {
					const baseLeafs = this.app.workspace.getLeavesOfType("bases");
					for (let leaf of baseLeafs) {
						this.startObservingLeaf(leaf, "bases");
					}
				}
			})
		);

		const registerDocumentEvents = (doc: Document) => {
			if (Platform.isMobile) {
				this.registerDomEvent(doc, "contextmenu", (e: MouseEvent) => {
					if (
						e.target instanceof HTMLElement &&
						e.target.closest(".multi-select-pill")
					) {
						this.handlePillMenu(e, e.target);
					}
				});

				this.registerDomEvent(doc, "touchstart", (e: TouchEvent) => {
					if (
						(e.target instanceof HTMLElement ||
							e.target instanceof SVGElement) &&
						e.target.closest(".metadata-property-icon")
					) {
						this.handlePropertyMenu(e.target);
					}
				});
			} else {
				this.registerDomEvent(doc, "mousedown", (e: MouseEvent) => {
					let targetEl = e.target as HTMLElement;
					if (e.button == 2) {
						
						if (targetEl.closest(".multi-select-pill") || targetEl.closest(".metadata-input-longtext")) {
							this.handlePillMenu(e, targetEl);
						}
					}

					if (targetEl.closest(".metadata-property-icon")) {
						this.handlePropertyMenu(targetEl);
					}
				});
			}

			this.registerDomEvent(doc, "click", (e: MouseEvent) => {

				if ((e.ctrlKey || e.metaKey) && e.target instanceof HTMLElement) {
					let value = this.getPropertyValue(e);
					if (value !== undefined) {
						let propEl = e.target.closest(".metadata-property");
						let prop = propEl!.getAttribute("data-property-key");
						let search = "[" + prop + ': "' + value + '"]';
						//@ts-ignore
						this.app.internalPlugins.plugins[
							"global-search"
						].instance.openGlobalSearch(search);
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
							this.createBannerMenu(e);
						}

						if (targetEl.closest(".metadata-side-image")) {
							e.preventDefault();
							this.createCoverMenu(e);
						}

						if (targetEl.closest(".pp-icon")) {
							e.preventDefault();
							this.createIconMenu(e);
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

		this.addCommand({
			id: "toggle-hidden-properties",
			name: i18n.t("HIDE_SHOW_HIDDEN_PROPERTIES"),
			callback: async () => {
				document.body.classList.toggle("show-hidden-properties");
			},
		});

		this.addCommand({
			id: "select-banner-image",
			name: i18n.t("SELECT_BANNER_IMAGE"),
			checkCallback: (checking: boolean) => {
				let file = this.app.workspace.getActiveFile();
				if (
					file instanceof TFile &&
					this.settings.enableBanner &&
					this.settings.bannerProperty
				) {
					if (!checking) {
						this.selectImage(
							this.settings.bannerProperty,
							this.settings.bannersFolder,
							"banner"
						);
					}
					return true;
				}
				return false;
			},
		});

		this.addCommand({
			id: "remove-banner",
			name: i18n.t("REMOVE_BANNER"),
			checkCallback: (checking: boolean) => {
				let file = this.app.workspace.getActiveFile();
				if (
					file instanceof TFile &&
					this.settings.enableBanner &&
					this.settings.bannerProperty
				) {
					let banner = this.getCurrentProperty(
						this.settings.bannerProperty
					);
					if (banner) {
						if (!checking) {
							this.removeProperty(this.settings.bannerProperty);
						}
						return true;
					}
					return false;
				}
				return false;
			},
		});

		this.addCommand({
			id: "select-icon",
			name: i18n.t("SELECT_ICON"),
			checkCallback: (checking: boolean) => {
				let file = this.app.workspace.getActiveFile();
				if (
					file instanceof TFile &&
					this.settings.enableIcon &&
					this.settings.iconProperty
				) {
					if (!checking) {
						this.selectIcon();
					}
					return true;
				}
				return false;
			},
		});

		this.addCommand({
			id: "remove-icon",
			name: i18n.t("REMOVE_ICON"),
			checkCallback: (checking: boolean) => {
				let file = this.app.workspace.getActiveFile();
				if (
					file instanceof TFile &&
					this.settings.enableIcon &&
					this.settings.iconProperty
				) {
					let icon = this.getCurrentProperty(
						this.settings.iconProperty
					);
					if (icon) {
						if (!checking) {
							this.removeProperty(this.settings.iconProperty);
						}
						return true;
					}
					return false;
				}
				return false;
			},
		});

		this.addCommand({
			id: "select-cover-image",
			name: i18n.t("SELECT_COVER_IMAGE"),
			checkCallback: (checking: boolean) => {
				let file = this.app.workspace.getActiveFile();
				if (
					file instanceof TFile &&
					this.settings.enableCover &&
					this.settings.coverProperty
				) {
					if (!checking) {
						this.selectCoverImage();
					}
					return true;
				}
				return false;
			},
		});

		this.addCommand({
			id: "remove-cover",
			name: i18n.t("REMOVE_COVER"),
			checkCallback: (checking: boolean) => {
				let file = this.app.workspace.getActiveFile();
				let currentCoverProp = this.getCurrentCoverProperty();
				if (
					file instanceof TFile &&
					this.settings.enableCover &&
					this.settings.coverProperty &&
					currentCoverProp
				) {
					if (!checking) {
						this.removeProperty(this.settings.coverProperty);
						for (let extraProp of this.settings
							.extraCoverProperties) {
							this.removeProperty(extraProp);
						}
					}
					return true;
				}
				return false;
			},
		});

		this.addCommand({
			id: "select-cover-shape",
			name: i18n.t("SELECT_COVER_SHAPE"),
			checkCallback: (checking: boolean) => {
				let file = this.app.workspace.getActiveFile();
				let currentCoverProp = this.getCurrentCoverProperty();
				if (
					file instanceof TFile &&
					this.settings.enableCover &&
					this.settings.coverProperty &&
					currentCoverProp
				) {
					if (!checking) {
						this.selectCoverShape();
					}
					return true;
				}
				return false;
			},
		});

		this.addCommand({
			id: "select-image-for-file",
			name: i18n.t("SHOW_IMAGES_MENU"),
			checkCallback: (checking: boolean) => {
				let file = this.app.workspace.getActiveFile();
				if (
					file instanceof TFile &&
					((this.settings.enableBanner &&
						this.settings.bannerProperty) ||
						(this.settings.enableCover &&
							this.settings.coverProperty) ||
						(this.settings.enableIcon &&
							this.settings.iconProperty))
				) {
					if (!checking) {
						this.selectImageForFile();
					}
					return true;
				}
				return false;
			},
		});

		this.addSettingTab(new PPSettingTab(this.app, this));
	}

	onunload() {}

	startObservingLeaf(leaf: WorkspaceLeaf, type: string) {
		let view = leaf.view;
		let targetNode = view.containerEl;
		let observer = new MutationObserver((mutations) => {

			let baseMutation;
			let multiSelectMutation;
			let progressMutation;

			for (let mutation of mutations) {
				let target = mutation.target;
				if (target instanceof HTMLElement) {
					if (
						target.classList.contains("bases-view") ||
						target.classList.contains("bases-table-container") ||
						target.classList.contains("bases-tbody") ||
						target.classList.contains("bases-tr") ||
						target.classList.contains("bases-cards-container") ||
						target.classList.contains("bases-cards-group") ||
						target.classList.contains("bases-cards-line") ||
						target.classList.contains("bases-cards-item")
					) {
						baseMutation = true;
						break;
					}

					if (target.classList.contains("metadata-properties")) {
						multiSelectMutation = true;
						progressMutation = true;
						break;
					}

					if (
						target.classList.contains("multi-select-container") ||
						target.classList.contains("value-list-container") ||
						target.classList.contains("metadata-input-longtext")
					) {
						multiSelectMutation = true;
						if (progressMutation) break;
					}

					let progressEl = target.closest(
						'[data-property*="formula.pp_progress"]'
					);

					if (
						progressEl &&
						target.classList.contains("bases-rendered-value")
					) {
						progressMutation = true;
						if (multiSelectMutation) break;
					}
				}
			}

			if (multiSelectMutation) {
				this.addClassestoProperties(view);
				this.updateDateInputs(view)
				this.updateBaseLeafPills(leaf);
			}
			if (progressMutation) {
				this.updateViewProgress(view);
				this.updateBaseLeafProgress(leaf);
			}

			if (baseMutation) {
				this.updateBaseLeafPills(leaf);
				this.updateBaseLeafProgress(leaf);
			}
		});
		observer.observe(targetNode, { childList: true, subtree: true });
		this.observers.push(observer);
	}

	createBannerMenu(e: MouseEvent) {
		let propName = this.settings.bannerProperty;

		let menu = new Menu();

		menu.addItem((item: MenuItem) =>
			item
				.setTitle(i18n.t("SELECT_BANNER_IMAGE"))
				.setIcon("image-plus")
				.setSection("pretty-properties")
				.onClick(async () => {
					this.selectImage(
						this.settings.bannerProperty,
						this.settings.bannersFolder,
						"banner"
					);
				})
		);


		menu.addItem((item: MenuItem) =>
			item
				.setTitle(i18n.t("SELECT_BANNER_POSITION"))
				.setIcon("sliders-horizontal")
				.setSection("pretty-properties")
				.onClick(async () => {
					this.selectBannerPosition()
				})
		);



		menu.addItem((item: MenuItem) =>
			item
				.setTitle(i18n.t("REMOVE_BANNER"))
				.setIcon("image-off")
				.setSection("pretty-properties")
				.onClick(async () => {
					this.removeProperty(this.settings.bannerProperty);
				})
		);

		if (this.settings.hiddenProperties.find((p) => p == propName)) {
			menu.addItem((item: MenuItem) =>
				item
					.setTitle(i18n.t("UNHIDE_BANNER_PROPERTY"))
					.setIcon("lucide-eye")
					.setSection("pretty-properties")
					.onClick(() => {
						if (propName)
							this.settings.hiddenProperties.remove(propName);
						this.saveSettings();
						this.updateHiddenProperties();
					})
			);
		} else {
			menu.addItem((item: MenuItem) =>
				item
					.setTitle(i18n.t("HIDE_BANNER_PROPERTY"))
					.setIcon("lucide-eye-off")
					.setSection("pretty-properties")
					.onClick(() => {
						if (propName)
							this.settings.hiddenProperties.push(propName);
						this.saveSettings();
						this.updateHiddenProperties();
					})
			);
		}

		menu.showAtMouseEvent(e);
	}

	createIconMenu(e: MouseEvent) {
		let propName = this.settings.iconProperty;

		let menu = new Menu();

		menu.addItem((item: MenuItem) =>
			item
				.setTitle(i18n.t("SELECT_ICON"))
				.setIcon("lucide-image-plus")
				.setSection("pretty-properties")
				.onClick(async () => {
					this.selectIcon();
				})
		);

		menu.addItem((item: MenuItem) =>
			item
				.setTitle(i18n.t("REMOVE_ICON"))
				.setIcon("image-off")
				.setSection("pretty-properties")
				.onClick(async () => {
					this.removeProperty(this.settings.iconProperty);
				})
		);

		if (this.settings.hiddenProperties.find((p) => p == propName)) {
			menu.addItem((item: MenuItem) =>
				item
					.setTitle(i18n.t("UNHIDE_ICON_PROPERTY"))
					.setIcon("lucide-eye")
					.setSection("pretty-properties")
					.onClick(() => {
						if (propName)
							this.settings.hiddenProperties.remove(propName);
						this.saveSettings();
						this.updateHiddenProperties();
					})
			);
		} else {
			menu.addItem((item: MenuItem) =>
				item
					.setTitle(i18n.t("HIDE_ICON_PROPERTY"))
					.setIcon("lucide-eye-off")
					.setSection("pretty-properties")
					.onClick(() => {
						if (propName)
							this.settings.hiddenProperties.push(propName);
						this.saveSettings();
						this.updateHiddenProperties();
					})
			);
		}

		menu.showAtMouseEvent(e);
	}

	async selectIcon() {
		let options: any = {
			image: i18n.t("LOCAL_IMAGE"),
			link: i18n.t("EXTERNAL_IMAGE"),
			svg: i18n.t("LUCIDE_ICON"),
			emoji: i18n.t("EMOJI"),
		};

		let plugin = this;

		class IconSuggestModal extends SuggestModal<string> {
			getSuggestions(query: string): string[] {
				return Object.keys(options).filter((key) => {
					return options[key]
						.toLowerCase()
						.includes(query.toLowerCase());
				});
			}
			async renderSuggestion(key: string, el: Element) {
				el.append(options[key]);
			}
			onChooseSuggestion(val: string) {
				let iconProperty = plugin.settings.iconProperty;
				if (val == "image") {
					plugin.selectLocalImage(
						iconProperty,
						plugin.settings.iconsFolder,
						"icon"
					);
				}
				if (val == "link") {
					new ImageLinkPrompt(this.app, iconProperty).open();
				}
				if (val == "svg") {
					plugin.selectIconSvg();
				}
				if (val == "emoji") {
					plugin.selectIconEmoji();
				}
			}
		}
		new IconSuggestModal(this.app).open();
	}

	async selectImageForFile() {
		let options: any = {};

		if (this.settings.enableCover && this.settings.coverProperty) {
			options["cover"] = i18n.t("SELECT_COVER_IMAGE");
		}

		if (this.settings.enableBanner && this.settings.bannerProperty) {
			options["banner"] = i18n.t("SELECT_BANNER_IMAGE");
		}

		if (this.settings.enableIcon && this.settings.iconProperty) {
			options["icon"] = i18n.t("SELECT_ICON");
		}

		let plugin = this;

		class FileImageSuggestModal extends SuggestModal<string> {
			getSuggestions(query: string): string[] {
				return Object.keys(options).filter((key) => {
					return options[key]
						.toLowerCase()
						.includes(query.toLowerCase());
				});
			}
			async renderSuggestion(key: string, el: Element) {
				el.append(options[key]);
			}
			onChooseSuggestion(val: string) {
				if (val == "cover") {
					plugin.selectCoverImage();
				}
				if (val == "banner") {
					plugin.selectImage(
						plugin.settings.bannerProperty,
						plugin.settings.bannersFolder,
						"banner"
					);
				}
				if (val == "icon") {
					plugin.selectIcon();
				}
			}
		}
		new FileImageSuggestModal(this.app).open();
	}

	async selectImage(propName: string, folder: string, shape: string) {
		let options: any = {
			image: i18n.t("LOCAL_IMAGE"),
			link: i18n.t("EXTERNAL_IMAGE"),
		};
		let plugin = this;

		class ImageSuggestModal extends SuggestModal<string> {
			getSuggestions(query: string): string[] {
				return Object.keys(options).filter((key) => {
					return options[key]
						.toLowerCase()
						.includes(query.toLowerCase());
				});
			}
			async renderSuggestion(key: string, el: Element) {
				el.append(options[key]);
			}
			onChooseSuggestion(val: string) {
				if (val == "image") {
					plugin.selectLocalImage(propName, folder, shape);
				}
				if (val == "link") {
					new ImageLinkPrompt(this.app, propName).open();
				}
			}
		}
		new ImageSuggestModal(this.app).open();
	}

	async removeProperty(propName: string) {
		let file = this.app.workspace.getActiveFile();
		if (file instanceof TFile) {
			this.app.fileManager.processFrontMatter(file, (fm) => {
				if (fm[propName]) delete fm[propName];
			});
		}
	}

	async selectLocalImage(propName: string, folder: string, shape: string) {
		let file = this.app.workspace.getActiveFile();
		if (file instanceof TFile) {
			let formats = [
				"avif",
				"bmp",
				"gif",
				"jpeg",
				"jpg",
				"png",
				"svg",
				"webp",
			];
			let files = this.app.vault.getFiles();
			files = files.filter((f) => formats.find((e) => e == f.extension));

			let imageFiles = files;
			if (folder) {
				imageFiles = files.filter((f) => {
					return (
						f.parent!.path == folder ||
						f.parent!.path.startsWith(folder + "/")
					);
				});
			}

			let imagePaths = imageFiles.map((f) => f.path);
			let imageNames = imageFiles.map((f) => f.basename);

			new LocalImageSuggestModal(
				this.app,
				this,
				propName,
				shape,
				imagePaths,
				imageNames
			).open();
		}
	}

	async selectIconSvg() {
		let propName = this.settings.iconProperty;
		let iconIds = getIconIds();

		class SvgSuggestModal extends SuggestModal<string> {
			getSuggestions(query: string): string[] {
				return iconIds.filter((val) => {
					return val.toLowerCase().includes(query.toLowerCase());
				});
			}
			async renderSuggestion(id: string, el: Element) {
				let svg = getIcon(id) || "";
				el.append(svg);
				el.classList.add("image-suggestion-item");
				el.classList.add("svg-icon");
			}
			onChooseSuggestion(id: string) {
				if (id) {
					let file = this.app.workspace.getActiveFile();
					if (file instanceof TFile) {
						this.app.fileManager.processFrontMatter(file, (fm) => {
							fm[propName] = id;
						});
					}
				}
			}
		}
		new SvgSuggestModal(this.app).open();
	}

	async selectIconEmoji() {
		let propName = this.settings.iconProperty;

		class EmojiSuggestModal extends SuggestModal<string> {
			getSuggestions(query: string): string[] {
				return Object.keys(Emojilib).filter((emoji) => {
					let keywords = Emojilib[emoji];
					return keywords.find((keyword) => {
						return keyword
							.toLowerCase()
							.includes(query.toLowerCase());
					});
				});
			}
			async renderSuggestion(emoji: string, el: Element) {
				el.createEl("div", { text: emoji });
				el.classList.add("image-suggestion-item");
				el.classList.add("emoji-icon");
			}
			onChooseSuggestion(emoji: string) {
				if (emoji) {
					let file = this.app.workspace.getActiveFile();
					if (file instanceof TFile) {
						this.app.fileManager.processFrontMatter(file, (fm) => {
							fm[propName] = emoji;
						});
					}
				}
			}
		}

		new EmojiSuggestModal(this.app).open();
	}

	getCurrentCoverProperty() {
		let propName: string | undefined;
		let file = this.app.workspace.getActiveFile();
		if (file instanceof TFile) {
			let cache = this.app.metadataCache.getFileCache(file);
			let frontmatter = cache!.frontmatter;
			let props = [...this.settings.extraCoverProperties];
			props.unshift(this.settings.coverProperty);

			for (let prop of props) {
				if (frontmatter?.[prop] !== undefined) {
					propName = prop;
					break;
				}
			}
		}
		return propName;
	}

	getCurrentProperty(propName: string) {
		let prop: any;
		let file = this.app.workspace.getActiveFile();
		if (file instanceof TFile) {
			let cache = this.app.metadataCache.getFileCache(file);
			let frontmatter = cache?.frontmatter;
			prop = frontmatter?.[propName];
		}
		return prop;
	}

	createCoverMenu(e: MouseEvent) {
		let file = this.app.workspace.getActiveFile();

		if (file instanceof TFile) {
			let propName = this.getCurrentCoverProperty();

			if (propName) {
				let menu = new Menu();

				menu.addItem((item: MenuItem) =>
					item
						.setTitle(i18n.t("SELECT_COVER_IMAGE"))
						.setIcon("lucide-image-plus")
						.setSection("pretty-properties")
						.onClick(async () => {
							if (propName) this.selectImage(propName, this.settings.coversFolder, "cover");
						})
				);

				menu.addItem((item: MenuItem) =>
					item
						.setTitle(i18n.t("SELECT_COVER_SHAPE"))
						.setIcon("lucide-shapes")
						.setSection("pretty-properties")
						.onClick(async () => {
							this.selectCoverShape();
						})
				);

				menu.addItem((item: MenuItem) =>
					item
						.setTitle(i18n.t("REMOVE_COVER"))
						.setIcon("image-off")
						.setSection("pretty-properties")
						.onClick(async () => {
							if (propName) this.removeProperty(propName);
						})
				);





				if (this.settings.hiddenProperties.find(p => p == propName)) {
					menu.addItem((item: MenuItem) => item
					.setTitle(i18n.t("UNHIDE_COVER_PROPERTY"))
					.setIcon('lucide-eye')
					.setSection('pretty-properties')
					.onClick(() => {
						if (propName) this.settings.hiddenProperties.remove(propName)
						this.saveSettings()
						this.updateHiddenProperties()			
					}))
				} else {
					menu.addItem((item: MenuItem) =>
						item
							.setTitle(i18n.t("HIDE_COVER_PROPERTY"))
							.setIcon("lucide-eye-off")
							.setSection("pretty-properties")
							.onClick(() => {
								if (propName)
									this.settings.hiddenProperties.push(
										propName
									);
								this.saveSettings();
								this.updateHiddenProperties();
							})
					);
				}

				menu.showAtMouseEvent(e);
			}
		}
	}



	async selectBannerPosition() {
		let file = this.app.workspace.getActiveFile()
		let bannerPositionProperty = this.settings.bannerPositionProperty
		if (file instanceof TFile && bannerPositionProperty) {
			let cache = this.app.metadataCache.getFileCache(file);
			let position = cache?.frontmatter?.[bannerPositionProperty] || 50
			class PositionModal extends Modal {
				onOpen() {
					const {contentEl} = this
					let positionSetting = new Setting(contentEl)
					.addSlider(slider => slider
						.setLimits(0, 100, 1)
						.setValue(position)
						.setDynamicTooltip()
						.onChange((value) => {
							if (file instanceof TFile) {
								this.app.fileManager.processFrontMatter(file, fm => {
									fm[bannerPositionProperty] = value
								})
							}
						})
					)

					positionSetting.settingEl.classList.add("position-setting")
				}
			
				onClose() {
					const {contentEl} = this
					contentEl.empty()
				} 
			}

			new PositionModal(this.app).open()
		}

	}

	async selectCoverShape() {
		let file = this.app.workspace.getActiveFile();
		if (file instanceof TFile) {
			let shapes: any = {
				"initial": i18n.t("INITIAL_DEFAULT_WIDTH"),
				"initial-width-2": i18n.t("INITIAL_WIDTH_2"),
				"initial-width-3": i18n.t("INITIAL_WIDTH_3"),
				"vertical-cover": i18n.t("VERTICAL_COVER"),
				"vertical-contain": i18n.t("VERTICAL_CONTAIN"),
				"horizontal-cover": i18n.t("HORIZONTAL_COVER"),
				"horizontal-contain": i18n.t("HORIZONTAL_CONTAIN"),
				square: i18n.t("SQUARE"),
				circle: i18n.t("CIRCLE"),
			};

			class CoverShapeSuggestModal extends SuggestModal<string> {
				getSuggestions(query: string): string[] {
					return Object.keys(shapes).filter((key) => {
						return shapes[key]
							.toLowerCase()
							.includes(query.toLowerCase());
					});
				}
				async renderSuggestion(key: string, el: Element) {
					el.append(shapes[key]);
				}
				onChooseSuggestion(key: string) {
					if (key && file instanceof TFile) {
						this.app.fileManager.processFrontMatter(file, (fm) => {
							let cssclasses = fm.cssclasses || [];
							cssclasses = cssclasses.filter(
								(c: string) =>
									!Object.keys(shapes).find(
										(s) => c == "cover-" + s || c == "cover-vertical" || c == "cover-horizontal"
									)
							);
							cssclasses.push("cover-" + key);
							fm.cssclasses = cssclasses;
						});
					}
				}
			}
			new CoverShapeSuggestModal(this.app).open();
		}
	}

	async selectCoverImage() {
		let file = this.app.workspace.getActiveFile();
		if (file instanceof TFile) {
			let propName = this.getCurrentCoverProperty();
			if (!propName) propName = this.settings.coverProperty;
			if (propName) {
				this.selectImage(propName, this.settings.coversFolder, "cover");
			}
		}
	}

	getPropertyValue(e: MouseEvent) {
		let targetEl = e.target;
		let text;
		if (targetEl instanceof HTMLElement) {
			let valueTextEl =
				targetEl.closest(".metadata-input-longtext") ||
				targetEl.closest(".multi-select-pill-content");
			let valueInputEl =
				targetEl.closest(".metadata-input-number") ||
				targetEl.closest(".metadata-input-text");
			let checkboxEl = targetEl.closest(".metadata-input-checkbox");

			if (valueTextEl instanceof HTMLElement) {
				text = valueTextEl.innerText;
			} else if (valueInputEl instanceof HTMLInputElement) {
				text = valueInputEl.value;
			} else if (checkboxEl) {
				e.preventDefault();
				let currentFile = this.app.workspace.getActiveFile();
				let propEl = targetEl.closest(".metadata-property");
				let prop = propEl!.getAttribute("data-property-key");
				if (currentFile instanceof TFile && prop) {
					text =
						this.app.metadataCache.getFileCache(currentFile)!
							.frontmatter![prop];
				}
			}
		}
		return text;
	}

	handlePropertyMenu(el: HTMLElement | SVGElement) {
		let propEl = el.closest(".metadata-property");
		if (propEl instanceof HTMLElement) {
			let propName = propEl?.getAttribute("data-property-key");

			if (propName) {
				let menuManager = this.menuManager
				menuManager.closeAndFlush()

				if (this.settings.hiddenProperties.find((p) => p == propName)) {
					menuManager.addItemAfter(
						["clipboard"],
						i18n.t("UNHIDE_PROPERTY"),
						(item: MenuItem) =>
							item
								.setTitle(i18n.t("UNHIDE_PROPERTY"))
								.setIcon("lucide-eye")
								.setSection("pretty-properties")
								.onClick(() => {
									if (propName)
										this.settings.hiddenProperties.remove(
											propName
										);
									this.saveSettings();
									this.updateHiddenProperties();
								})
					);
				} else {
					menuManager.addItemAfter(
						["clipboard"],
						i18n.t("HIDE_PROPERTY"),
						(item: MenuItem) =>
							item
								.setTitle(i18n.t("HIDE_PROPERTY"))
								.setIcon("lucide-eye-off")
								.setSection("pretty-properties")
								.onClick(() => {
									if (propName)
										this.settings.hiddenProperties.push(
											propName
										);
									this.saveSettings();
									this.updateHiddenProperties();
								})
					);
				}

				//@ts-ignore
				let propertyTypeObject = this.app.metadataTypeManager.getPropertyInfo(
						propName.toLowerCase()
					);
				let propertyType;
				if (propertyTypeObject) {
					propertyType =
						propertyTypeObject.widget || propertyTypeObject.type;
				}

				if (
					propertyType == "number" &&
					!this.settings.progressProperties[propName]
				) {
					menuManager.addItemAfter(
						["clipboard"],
						i18n.t("SHOW_PROGRESS_BAR"),
						(item: MenuItem) =>
							item
								.setTitle(i18n.t("SHOW_PROGRESS_BAR"))
								.setIcon("lucide-bar-chart-horizontal-big")
								.setSection("pretty-properties")
								.onClick(() => {
									if (propName) {
										this.settings.progressProperties[
											propName
										] = {
											maxNumber: 100,
										};
									}
									this.saveSettings();
									this.updateElements();
								})
					);
				} else if (this.settings.progressProperties[propName]) {
					if (
						this.settings.progressProperties[propName].maxProperty
					) {
						menuManager.addItemAfter(
							["clipboard"],
							i18n.t("SET_PROGRESS_MAX_VALUE_100"),
							(item: MenuItem) =>
								item
									.setTitle(
										i18n.t("SET_PROGRESS_MAX_VALUE_100")
									)
									.setIcon("lucide-bar-chart-horizontal-big")
									.setSection("pretty-properties")
									.onClick(() => {
										if (propName) {
											delete this.settings
												.progressProperties[propName]
												.maxProperty;
											this.settings.progressProperties[
												propName
											].maxNumber = 100;
										}
										this.saveSettings();
										this.updateElements();
									})
						);
					}

					menuManager.addItemAfter(
						["clipboard"],
						i18n.t("SET_PROGRESS_MAX_VALUE_PROPERTY"),
						(item: MenuItem) => {
							item.setTitle(
								i18n.t("SET_PROGRESS_MAX_VALUE_PROPERTY")
							)
								.setIcon("lucide-bar-chart-horizontal-big")
								.setSection("pretty-properties");

							//@ts-ignore
							let sub = item.setSubmenu();
							//@ts-ignore
							let properties = this.app.metadataTypeManager.getAllProperties();
							let numberProperties = Object.keys(properties)
								.filter((p) => {
									let property = properties[p];
									let type = property.widget || property.type;
									return type == "number";
								})
								.map((p) => properties[p].name);

							for (let numberProp of numberProperties) {
								sub.addItem((subitem: MenuItem) => {
									if (propName) {
										subitem
											.setTitle(numberProp)
											.setChecked(
												this.settings
													.progressProperties[
													propName
												].maxProperty == numberProp
											)
											.onClick(() => {
												if (propName) {
													delete this.settings
														.progressProperties[
														propName
													].maxNumber;
													this.settings.progressProperties[
														propName
													].maxProperty = numberProp;
												}
												this.saveSettings();
												this.updateElements();
											});
									}
								});
							}
						}
					);

					menuManager.addItemAfter(
						["clipboard"],
						i18n.t("REMOVE_PROGRESS_BAR"),
						(item: MenuItem) =>
							item
								.setTitle(i18n.t("REMOVE_PROGRESS_BAR"))
								.setIcon("lucide-bar-chart-horizontal-big")
								.setSection("pretty-properties")
								.onClick(() => {
									if (propName) {
										delete this.settings.progressProperties[
											propName
										];
									}
									this.saveSettings();
									this.updateElements();
								})
					);
				}
			}
		}
	}

	handlePillMenu(e: MouseEvent, el: HTMLElement) {
		let menuManager = this.menuManager
		menuManager.closeAndFlush()


		let pillEl = el.closest(".multi-select-pill");

		const createColorItem = (item: MenuItem, pillVal: string) => {
			item.setTitle(i18n.t("SELECT_COLOR"))
				.setIcon("paintbrush")
				.setSection("pretty-properties");

			//@ts-ignore
			let sub = item.setSubmenu() as Menu;
			let colors = [
				"red",
				"orange",
				"yellow",
				"green",
				"cyan",
				"blue",
				"purple",
				"pink",
				"none",
				"default",
			];

			for (let color of colors) {
				sub.addItem((item: MenuItem) => {
					item.setIcon("square");

					if (color != "default" && color != "none") {
						//@ts-ignore
						item.iconEl.style =
							"color: transparent; background-color: rgba(var(--color-" +
							color +
							"-rgb), 0.3);";
					}

					if (color == "none") {
						//@ts-ignore
						item.iconEl.style = "opacity: 0.2;";
					}

					item.setTitle(i18n.t(color)).onClick(() => {
						if (color == "default") {
							if (pillVal)
								delete this.settings
									.propertyPillColors[pillVal];
						} else {
							if (pillVal)
								this.settings.propertyPillColors[
									pillVal
								] = color;
						}

						this.saveSettings();
						this.updatePillColors();
					});
				});
			}
		}

		if (pillEl instanceof HTMLElement) {
			let pillVal = pillEl?.getAttribute("data-property-pill-value");

			if (pillVal) {
				menuManager.addItemAfter(
					["clipboard"],
					i18n.t("SELECT_COLOR"),
					(item: MenuItem) => {
						if (pillVal) createColorItem(item, pillVal)
					}
				);
			}
		} 




	}

	updateHiddenProperties() {
		let styleText = "";
		for (let prop of this.settings.hiddenProperties) {
			styleText =
				styleText +
				"body:not(.show-hidden-properties) .workspace-leaf-content[data-type='markdown'] .metadata-property[data-property-key='" +
				prop +
				"'] {display: none;}\n";
		}

		let oldStyle = document.head.querySelector("style#pp-hide-properties");
		if (oldStyle) oldStyle.remove();

		const style = document.createElement("style");
		style.textContent = styleText;
		style.id = "pp-hide-properties";
		document.head.appendChild(style);
	}

	updatePillColors() {
		let styleText = "";
		let transparentPropsDataString = ".test,"
		let propertyPillColors = this.settings.propertyPillColors
		let propertyLongtextColors = this.settings.propertyLongtextColors

		let colors = ["red", "orange", "yellow", "green", "cyan", "blue", "purple", "pink", "none", "default"]
		
		for (let prop in propertyPillColors) {
			let color = propertyPillColors[prop]

			if (colors.find(c => c == color)) {
				styleText = styleText +
				"[data-property-pill-value='" + prop + "'] {\n" +
				"--pill-color-rgb: var(--color-" + color + "-rgb); \n" +
				"--pill-background-modified: rgba(var(--pill-color-rgb), 0.2); \n" + 
				"--pill-background-hover-modified: rgba(var(--pill-color-rgb), 0.3); \n" +
				"--tag-background-modified: rgba(var(--pill-color-rgb), 0.2); \n" + 
				"--tag-background-hover-modified: rgba(var(--pill-color-rgb), 0.3);}\n";
			} else {
				styleText = styleText +
				"[data-property-pill-value='" + prop + "'] {\n" +
				"--pill-background-modified: " + color + "; \n" + 
				"--pill-background-hover-modified: " + color + "; \n" +
				"--tag-background-modified: " + color + "; \n" + 
				"--tag-background-hover-modified: " + color + ";}\n";
			}


			
			if (this.settings.addPillPadding == "colored" && color != "none") {

				styleText = styleText +
					".metadata-property-value .multi-select-pill[data-property-pill-value='" + prop + "'],\n" + 
					"[data-property*='note'] .value-list-element[data-property-pill-value='" + prop + "'],\n" +
					"[data-property*='formula.tags'] .value-list-element[data-property-pill-value='" + prop + "']\n" +
					" {\n" +
					"--pill-padding-x: var(--tag-padding-x);\n}\n" + 
					".metadata-property-value .metadata-input-longtext[data-property-pill-value='" + prop + "'],\n" + 
					".bases-cards-line[data-property-longtext-value='" + prop + "']\n" +
					" {\n" +
					"--longtext-margin: var(--input-padding);\n}\n"
			}

			if (color == "none") {
				transparentPropsDataString = transparentPropsDataString +
				"[data-property-pill-value='" + prop + "'],"
			}
		}



		for (let prop in propertyLongtextColors) {

			let color = propertyLongtextColors[prop]

			if (colors.find(c => c == color)) {
				styleText = styleText +
				"[data-property-longtext-value='" + prop + "'] {\n" +
				"--longtext-bg-color: rgba(var(--color-" + color + "-rgb), 0.2);\n}\n";
			
			} else {
				styleText = styleText +
				"[data-property-longtext-value='" + prop + "'] {\n" +
				"--longtext-bg-color: " + color + ";\n}\n";
			
			}


			if (this.settings.addPillPadding == "colored" && color != "none") {
				styleText = styleText +
					".metadata-property-value .metadata-input-longtext[data-property-longtext-value='" + prop + "'],\n" + 
					".bases-cards-line[data-property-longtext-value='" + prop + "']\n" +
					" {\n" +
					"--longtext-margin: var(--input-padding);\n}\n"
			}

			

			if (color == "none") {
				transparentPropsDataString = transparentPropsDataString +
				"[data-property-longtext-value='" + prop + "'],"
			}


			if (this.settings.addPillPadding == "non-transparent" && color != "none") {
				styleText = styleText +
					".metadata-property-value .metadata-input-longtext[data-property-longtext-value='" + prop + "'],\n" + 
					".bases-cards-line[data-property-longtext-value='" + prop + "']\n" +
					" {\n" +
					"--longtext-margin: var(--input-padding);\n}\n"
			}
		}




		if (this.settings.addPillPadding == "all") {
			styleText = styleText +
			"\n.metadata-property-value .multi-select-pill," +
			"[data-property*='note'] .value-list-element," +
			"[data-property*='formula.tags'] .value-list-element" +
			" {\n" +
			"--pill-padding-x: var(--tag-padding-x);\n}\n" + 
			".metadata-property-value .metadata-input-longtext,\n" + 
			".bases-cards-line\n" +
			" {\n" +
			"--longtext-margin: var(--input-padding);\n}\n"
		}

		if (this.settings.addPillPadding == "non-transparent") {
			transparentPropsDataString = transparentPropsDataString.slice(0, -1)
			styleText = styleText +
				".metadata-property-value .multi-select-pill:not(" + transparentPropsDataString + "),\n" + 
				"[data-property*='note'] .value-list-element:not(" + transparentPropsDataString + ")," +
				"[data-property*='formula.tags'] .value-list-element:not(" + transparentPropsDataString + ")" +
				" {\n" +
				"--pill-padding-x: var(--tag-padding-x);\n}\n" + 
				".metadata-property-value .metadata-input-longtext:not(" + transparentPropsDataString + "),\n" + 
				"\n}\n"
		}

		let oldStyle = document.head.querySelector("style#pp-pill-colors");
		if (oldStyle) oldStyle.remove();

		const style = document.createElement("style");
		style.textContent = styleText;
		style.id = "pp-pill-colors";
		document.head.appendChild(style);

		if (this.settings.addBaseTagColor) {
			document.body.classList.add("pp-base-tag-color")
		} else {
			document.body.classList.remove("pp-base-tag-color")
		}

		if (this.settings.styleFormulaTags) {
			document.body.classList.add("pp-style-formula-tags")
		} else {
			document.body.classList.remove("pp-style-formula-tags")
		}
	}



	updateRelativeDateColors() {
		let styleText = ""
		let colors = ["red", "orange", "yellow", "green", "cyan", "blue", "purple", "pink"]

		let futureColor = this.settings.dateFutureColor
		let presentColor = this.settings.datePresentColor
		let pastColor = this.settings.datePastColor
		let futureColorString = ""
		let presentColorString = ""
		let pastColorString = ""

		if (colors.find(c => c == futureColor)) {
			futureColorString = "--date-future-color: rgba(var(--color-" + futureColor + "-rgb), 0.2);\n"
		}
		else {
			futureColorString = "--date-future-color: " + futureColor + ";\n"
		}


		if (colors.find(c => c == presentColor)) {
			presentColorString = "--date-present-color: rgba(var(--color-" + presentColor + "-rgb), 0.2);\n"
		}
		else {
			presentColorString = "--date-present-color: " + presentColor + ";\n"
		}


		if (colors.find(c => c == pastColor)) {
			pastColorString = "--date-past-color: rgba(var(--color-" + pastColor + "-rgb), 0.2);\n"
		}
		else {
			pastColorString = "--date-past-color: " + pastColor + ";\n"
		}


		styleText = styleText + "\nbody {\n" + futureColorString + presentColorString + pastColorString + "\n}\n"
		
		

		let oldStyle = document.head.querySelector("style#pp-date-colors");
		if (oldStyle) oldStyle.remove();
		const style = document.createElement("style");
		style.textContent = styleText;
		style.id = "pp-date-colors";
		document.head.appendChild(style);
	}




	updateBannerStyles() {
		let oldStyle = document.head.querySelector("style#pp-banner-styles");
		if (oldStyle) oldStyle.remove();

		if (this.settings.enableBanner) {
			let bannerHeight;
			let bannerMargin;
			if (Platform.isMobile) {
				bannerHeight = this.settings.bannerHeightMobile;
				bannerMargin = this.settings.bannerMarginMobile;
			} else {
				bannerHeight = this.settings.bannerHeight;
				bannerMargin = this.settings.bannerMargin;
			}

			let styleText =
				"body {\n" +
				"--banner-height: " +
				bannerHeight +
				"px;\n" +
				"--banner-margin: " +
				bannerMargin +
				"px;\n" +
				"}\n";

			if (this.settings.bannerFading) {
				styleText =
					styleText +
					".banner-image img {\n" +
					"--banner-fading: linear-gradient(to bottom, black 25%, transparent);\n" +
					"}";
			}

			const style = document.createElement("style");
			style.textContent = styleText;
			style.id = "pp-banner-styles";
			document.head.appendChild(style);
		}
	}

	updateIconStyles() {
		let oldStyle = document.head.querySelector("style#pp-icon-styles");
		if (oldStyle) oldStyle.remove();

		if (this.settings.enableIcon) {
			let iconTopMargin;
			let bannerIconGap;
			if (Platform.isMobile) {
				iconTopMargin = this.settings.iconTopMarginMobile;
				bannerIconGap = this.settings.bannerIconGapMobile;
			} else {
				iconTopMargin = this.settings.iconTopMargin;
				bannerIconGap = this.settings.bannerIconGap;
			}

			let iconColor = this.settings.iconColor;
			if (!iconColor) iconColor = "var(--text-normal)";

			let iconBackground = "transparent";

			if (this.settings.iconBackground) {
				iconBackground = "var(--background-primary)";
			}

			let styleText =
				"body {\n" +
				"--pp-icon-size: " +
				this.settings.iconSize +
				"px;\n" +
				"--pp-icon-top-margin: " +
				iconTopMargin +
				"px;\n" +
				"--pp-icon-top-margin-wb: " +
				this.settings.iconTopMarginWithoutBanner +
				"px;\n" +
				"--pp-icon-gap: " +
				this.settings.iconGap +
				"px;\n" +
				"--pp-banner-icon-gap: " +
				bannerIconGap +
				"px;\n" +
				"--pp-icon-left-margin: " +
				this.settings.iconLeftMargin +
				"px;\n" +
				"--pp-icon-color: " +
				iconColor +
				";\n" +
				"--pp-icon-background: " +
				iconBackground +
				";\n" +
				"}\n";

			const style = document.createElement("style");
			style.textContent = styleText;
			style.id = "pp-icon-styles";
			document.head.appendChild(style);
		}
	}

	updateCoverStyles() {
		let oldStyle = document.head.querySelector("style#pp-cover-styles");
		if (oldStyle) oldStyle.remove();

		if (this.settings.enableCover) {
			let styleText =
				"body {\n" +
				"--cover-width-horizontal: " +
				this.settings.coverHorizontalWidth +
				"px;\n" +
				"--cover-width-vertical: " +
				this.settings.coverVerticalWidth +
				"px;\n" +
				"--cover-max-height: " +
				this.settings.coverMaxHeight +
				"px;\n" +
				"--cover-width-initial: " +
				this.settings.coverDefaultWidth1 +
				"px;\n" +
				"--cover-width-initial-2: " +
				this.settings.coverDefaultWidth2 +
				"px;\n" +
				"--cover-width-initial-3: " +
				this.settings.coverDefaultWidth3 +
				"px;\n" +
				"--cover-width-square: " +
				this.settings.coverSquareWidth +
				"px;\n" +
				"--cover-width-circle: " +
				this.settings.coverCircleWidth +
				"px;\n" +
				"}\n";

			const style = document.createElement("style");
			style.textContent = styleText;
			style.id = "pp-cover-styles";
			document.head.appendChild(style);
		}
	}

	updateBaseStyles() {
		if (this.settings.enableBases) {
			document.body.classList.add("pp-bases-enabled")
		} else {
			document.body.classList.remove("pp-bases-enabled")
		}
	}

	updateElements(changedFile?: TFile | null, cache?: CachedMetadata | null) {
		let leaves = this.app.workspace.getLeavesOfType("markdown");
		for (let leaf of leaves) {
			if (leaf.view instanceof MarkdownView) {
				if (
					changedFile &&
					leaf.view.file &&
					leaf.view.file.path != changedFile.path
				) {
					continue;
				}
				this.updateLeafElements(leaf.view, cache);
			}
		}

		let propLeaves = this.app.workspace.getLeavesOfType("file-properties");
		for (let leaf of propLeaves) {
			if (leaf.view instanceof FileView) {
				if (
					changedFile &&
					leaf.view.file &&
					leaf.view.file.path != changedFile.path
				) {
					continue;
				}
				this.updateLeafElements(leaf.view, cache);
			}
		}

		let baseLeaves = this.app.workspace.getLeavesOfType("bases");
		for (let leaf of baseLeaves) {
			if (leaf.view instanceof FileView) {
				this.updateBaseLeafPills(leaf);
				this.updateBaseLeafProgress(leaf);
			}
		}
	}

	updateBaseLeafPills(leaf: WorkspaceLeaf) {
		if (this.settings.enableBases) {
			let containerEl = leaf.view.containerEl;

			let baseTableContainer = containerEl.querySelector(
				".bases-table-container"
			);

			if (baseTableContainer) {
				const updateTableBasePills = () => {
					if (baseTableContainer!.classList.contains("is-loading")) {
						if (
							!containerEl.querySelector(
								".bases-table-container:not(.is-loading"
							)
						) {
							setTimeout(updateTableBasePills, 50);
							return;
						}
					}
					this.addClassestoProperties(leaf.view);
					this.updateDateInputs(leaf.view)
				};
				updateTableBasePills();
			}

			let baseCardsContainer = containerEl.querySelector(
				".bases-cards-container"
			);

			if (baseCardsContainer) {
				const updateCardsBasePills = () => {
					if (baseCardsContainer!.classList.contains("is-loading")) {
						if (
							!containerEl.querySelector(
								".bases-cards-container:not(.is-loading"
							)
						) {
							setTimeout(updateCardsBasePills, 50);
							return;
						}
					}


					let pills = containerEl.querySelectorAll(
						".bases-cards-property .value-list-element:not([data-property-pill-value])"
					);
					for (let pill of pills) {
						if (pill instanceof HTMLElement) {
							let value = pill.innerText.slice(0, 200).trim();
							if (value.startsWith("#")) {value = value.replace("#", "")}
							pill.setAttribute("data-property-pill-value", value);
						}
					}


					let longTexts = containerEl.querySelectorAll(
						".bases-cards-line:not(:has(.value-list-container, .input))"
					);
					for (let pill of longTexts) {
						if (pill instanceof HTMLElement) {
							let value = pill.innerText.slice(0, 200).trim();
							if (value) {
								pill.setAttribute("data-property-longtext-value", value);
							}
							
						}
					}


					let dateInputs = containerEl.querySelectorAll(
						".bases-cards-property .metadata-input-text.mod-date"
					);

					for (let input of dateInputs) {
						
						if (input instanceof HTMLInputElement) {
							let value = input.value;
							let parent = input.parentElement

							if (parent instanceof HTMLElement) {
								if (value) {
								let currentTime = moment().toISOString(true).slice(0, 10);
								if (currentTime == value) {
									parent.setAttribute("data-relative-date", "present");
								} else if (currentTime > value) {
									parent.setAttribute("data-relative-date", "past");
								} else {
									parent.setAttribute("data-relative-date", "future");
								}
								} else {
								parent.setAttribute("data-relative-date", "none");
								}
							}
						}
					}
				};
				updateCardsBasePills();
			}
		}
	}

	async updateBaseLeafProgress(leaf: WorkspaceLeaf) {
		if (this.settings.enableBases) {
			let containerEl = leaf.view.containerEl;

			let baseTableContainer = containerEl.querySelector(
				".bases-table-container"
			);

			if (baseTableContainer) {
				const updateProgress = () => {
					if (baseTableContainer!.classList.contains("is-loading")) {
						if (
							!containerEl.querySelector(
								".bases-table-container:not(.is-loading"
							)
						) {
							setTimeout(updateProgress, 50);
							return;
						}
					}

					let progressEls = containerEl.querySelectorAll(
						".bases-td[data-property*='formula.pp_progress']"
					);
					for (let progressEl of progressEls) {
						if (progressEl instanceof HTMLElement) {

							const createProgress = (valueString: string | undefined) => {
								if (valueString) {
									let valueParts =
										valueString.match(/(\d+)(\/)(\d+)/);
									if (valueParts) {
										let progressWrapper =
											document.createElement("div");
										progressWrapper.classList.add(
											"metadata-progress-wrapper"
										);

										progressWrapper.setAttribute("data-progress-value", valueString)

										let value = Number(valueParts[1]);
										let max = Number(valueParts[3]);

										let progress
										let percent = Math.round((value * 100) / max)
										
							
										if (progressEl.getAttribute("data-property")?.startsWith("formula.pp_progress_circle")) {

											
											let style = `background: 
												radial-gradient(closest-side, var(--color-progress-background) 64%, transparent 65% 100%),
												conic-gradient(var(--color-progress) ${percent}%, var(--background-secondary) 0); 
											`

											if (percent == 100) {
												style = `background: 
												radial-gradient(closest-side, var(--color-progress-background) 64%, transparent 65% 100%),
												conic-gradient(var(--color-progress-completed) ${percent}%, var(--background-secondary) 0); 
											`
											}


											progress = document.createElement("div");
											progress.classList.add("metadata-circle-progress");
											progress.setAttribute("style", style)

										} else {

											progress = document.createElement("progress");
											progress.classList.add("metadata-progress");
											progress.value = value;
											progress.max = max;
										}

										let percentString = " " + percent + " %";
										setTooltip(progress, percentString, {
											delay: 500,
											placement: "top",
										});


										progressWrapper.append(progress);
										progressEl.classList.add(
											"has-progress-bar"
										);

										progressEl.prepend(progressWrapper);
									}
								}
							}

							let oldProgress = progressEl.querySelector(".metadata-progress-wrapper");
							let valueEl = progressEl.querySelector(".bases-rendered-value");

							let valueString
							if (valueEl instanceof HTMLElement) {
								valueString = valueEl.innerText;
							}


							if (oldProgress instanceof HTMLElement) {
								let oldValueString = oldProgress.getAttribute("data-progress-value")
								if (oldValueString != valueString) {
									oldProgress.remove();
									progressEl.classList.remove("has-progress-bar");
									createProgress(valueString)
								}
							} else {
								createProgress(valueString)
							}



							
						}
					}
				};
				updateProgress();
			}

			let baseCardsContainer = containerEl.querySelector(
				".bases-cards-container"
			);

			if (baseCardsContainer) {
				const updateProgress = () => {
					if (baseCardsContainer!.classList.contains("is-loading")) {
						if (
							!containerEl.querySelector(
								".bases-cards-container:not(.is-loading"
							)
						) {
							setTimeout(updateProgress, 50);
							return;
						}
					}

					let progressEls = containerEl.querySelectorAll(
						".bases-cards-property[data-property*='formula.pp_progress']"
					);
					for (let progressEl of progressEls) {
						if (progressEl instanceof HTMLElement) {
							let oldProgress = progressEl.querySelector(
								".metadata-progress-wrapper"
							);
							if (oldProgress) {
								oldProgress.remove();
								progressEl.classList.remove("has-progress-bar");
							}

							let valueEl = progressEl.querySelector(
								".bases-rendered-value"
							);
							if (valueEl instanceof HTMLElement) {
								let valueString = valueEl.innerText;
								if (valueString) {
									let valueParts =
										valueString.match(/(\d+)(\/)(\d+)/);
									if (valueParts) {
										let progressWrapper =
											document.createElement("div");
										progressWrapper.classList.add(
											"metadata-progress-wrapper"
										);
										let progress =
											document.createElement("progress");
										progress.classList.add("metadata-progress");
										progress.value = Number(valueParts[1]);
										progress.max = Number(valueParts[3]);

										let percent =
											" " +
											Math.round(
												(progress.value * 100) /
													progress.max
											) +
											" %";
										setTooltip(progress, percent, {
											delay: 500,
											placement: "top",
										});

										progressWrapper.append(progress);
										progressEl.classList.add(
											"has-progress-bar"
										);

										let label = progressEl.firstChild;
										label?.after(progressWrapper);
									}
								}
							}
						}
					}
				};
				updateProgress();
			}
		}
	}

	async updateLeafElements(
		view: MarkdownView | FileView,
		cache?: CachedMetadata | null
	) {
		this.addClassestoProperties(view);
		this.updateDateInputs(view)

		if (!cache && view.file) {
			cache = this.app.metadataCache.getFileCache(view.file);
		}
		let frontmatter;
		if (cache) {
			frontmatter = cache.frontmatter;
		}

		if (view instanceof MarkdownView) {
			this.updateCoverImages(view, frontmatter);
			this.updateIcons(view, frontmatter);
			this.updateBannerImages(view, frontmatter);

			if (cache && frontmatter && this.settings.enableTasksCount) {
				this.updateTasksCount(view, cache);
			}
		}

		this.updateViewProgress(view);
	}

	async updateTasksCount(
		view: MarkdownView | FileView,
		cache: CachedMetadata
	) {
		let frontmatter = cache.frontmatter;
		let tasksProp = this.settings.allTasksCount;
		let completedProp = this.settings.completedTasksCount;
		let uncompletedProp = this.settings.uncompletedTasksCount;
		let tasksVal = frontmatter?.[tasksProp];
		let completedVal = frontmatter?.[completedProp];
		let uncompletedVal = frontmatter?.[uncompletedProp];

		if (
			tasksVal !== undefined ||
			completedVal !== undefined ||
			uncompletedVal !== undefined
		) {
			let file = view.file;
			let listItems = cache.listItems;
			if (listItems) {
				let allTasksStatuses =
					this.settings.completedTasksStatuses.concat(
						this.settings.uncompletedTasksStatuses
					);
				let tasks = listItems.filter(
					(l) => l.task && allTasksStatuses.includes(l.task)
				);

				if (
					tasks.length == 0 &&
					(tasksVal === null || tasksVal === undefined) &&
					(completedVal === null || completedVal === undefined) &&
					(uncompletedVal === null || uncompletedVal === undefined)
				) {
					return;
				}

				if (tasksVal !== undefined) {
					let tasksNum = tasks.length;
					if (tasksNum != tasksVal) {
						if (file instanceof TFile) {
							await this.app.fileManager.processFrontMatter(
								file,
								(fm) => {
									fm[tasksProp] = tasksNum;
								}
							);
						}
					}
				}

				if (completedVal !== undefined) {
					let completed = tasks.filter(
						(t) =>
							t.task &&
							this.settings.completedTasksStatuses.includes(
								t.task
							)
					);
					let completedNum = completed.length;
					if (completedNum != completedVal) {
						if (file instanceof TFile) {
							await this.app.fileManager.processFrontMatter(
								file,
								(fm) => {
									fm[completedProp] = completedNum;
								}
							);
						}
					}
				}

				if (uncompletedVal !== undefined) {
					let uncompleted = tasks.filter(
						(t) =>
							t.task &&
							this.settings.uncompletedTasksStatuses.includes(
								t.task
							)
					);
					let uncompletedNum = uncompleted.length;
					if (uncompletedNum != uncompletedVal) {
						if (file instanceof TFile) {
							await this.app.fileManager.processFrontMatter(
								file,
								(fm) => {
									fm[uncompletedProp] = uncompletedNum;
								}
							);
						}
					}
				}
			}
		}
	}

	async updateCoverImages(
		view: MarkdownView,
		frontmatter: FrontMatterCache | undefined
	) {
		//@ts-ignore
		let mdEditor = view.metadataEditor;
		let mdContainer = mdEditor?.containerEl;
		let coverVal;

		let props = [...this.settings.extraCoverProperties];
		props.unshift(this.settings.coverProperty);

		for (let prop of props) {
			coverVal = frontmatter?.[prop];
			if (coverVal) break;
		}
		let cssVal = frontmatter?.cssclasses;

		if (mdContainer instanceof HTMLElement) {
			let coverDiv;
			let oldCoverDiv = mdContainer.querySelector(".metadata-side-image");

			if (coverVal && this.settings.enableCover) {
				if (coverVal.startsWith("http"))
					coverVal = "![](" + coverVal + ")";
				if (!coverVal.startsWith("!")) coverVal = "!" + coverVal;
				coverDiv = document.createElement("div");
				coverDiv.classList.add("metadata-side-image");

				if (cssVal && (cssVal.includes("cover-vertical") ||
							   cssVal.includes("cover-vertical-cover") 
				)) {
					coverDiv.classList.add("vertical-cover");
				} 
				else if (cssVal && cssVal.includes("cover-vertical-contain")) {
					coverDiv.classList.add("vertical-contain");
				}
				else if (cssVal && cssVal.includes("cover-horizontal-contain")) {
					coverDiv.classList.add("horizontal-contain");
				} 
				else if (cssVal && (cssVal.includes("cover-horizontal") || 
									cssVal.includes("cover-horizontal-cover")
				)) {
					coverDiv.classList.add("horizontal-cover");
				} 
				else if (cssVal && cssVal.includes("cover-square")) {
					coverDiv.classList.add("square");
				} 
				
				else if (cssVal && cssVal.includes("cover-circle")) {
					coverDiv.classList.add("circle");
				} 

				else if (cssVal && cssVal.includes("cover-initial-width-2")) {
					coverDiv.classList.add("initial-2");
				}

				else if (cssVal && cssVal.includes("cover-initial-width-3")) {
					coverDiv.classList.add("initial-3");
				}
				
				else {
					coverDiv.classList.add("initial");
				}

				let coverTemp = document.createElement("div");
				MarkdownRenderer.render(
					this.app,
					coverVal,
					coverTemp,
					"",
					this
				);
				let image = coverTemp.querySelector("img");
				if (image) {
					coverDiv.append(image);
				}
			}

			if (coverDiv) {
				if (oldCoverDiv) {
					if (coverDiv.outerHTML != oldCoverDiv.outerHTML) {
						oldCoverDiv.remove();
						mdContainer.prepend(coverDiv);
					}
				} else {
					mdContainer.prepend(coverDiv);
				}
			} else {
				if (oldCoverDiv) oldCoverDiv.remove();
			}
		}
	}

	async updateBannerImages(
		view: MarkdownView,
		frontmatter: FrontMatterCache | undefined
	) {
		let contentEl = view.contentEl;
		let bannerContainer;
		let mode = view.getMode();

		if (mode == "preview") {
			bannerContainer = contentEl.querySelector(".markdown-reading-view > .markdown-preview-view");
		}

		if (mode == "source") {
			bannerContainer = contentEl.querySelector(".cm-scroller");
		}

		let bannerVal = frontmatter?.[this.settings.bannerProperty];
		let positionVal = frontmatter?.[this.settings.bannerPositionProperty]

		if (bannerContainer instanceof HTMLElement) {
			let oldBannerDiv = bannerContainer.querySelector(".banner-image");
			let bannerDiv = document.createElement("div");
			bannerDiv.classList.add("banner-image");

			if (bannerVal && this.settings.enableBanner) {
				if (bannerVal.startsWith("http"))
					bannerVal = "![](" + bannerVal + ")";
				if (!bannerVal.startsWith("!")) bannerVal = "!" + bannerVal;
				let bannerTemp = document.createElement("div");
				MarkdownRenderer.render(
					this.app,
					bannerVal,
					bannerTemp,
					"",
					this
				);
				let image = bannerTemp.querySelector("img");
				if (image) {
					if (positionVal) {
						image.setAttribute("style", "object-position: center " + positionVal + "%;")
					}

					bannerDiv.append(image);
				}
			}

			if (oldBannerDiv) {
				if (oldBannerDiv.outerHTML != bannerDiv.outerHTML) {
					oldBannerDiv.remove();
					bannerContainer.prepend(bannerDiv);
				}
			} else {
				bannerContainer.prepend(bannerDiv);
			}
		}
	}

	async updateIcons(
		view: MarkdownView,
		frontmatter: FrontMatterCache | undefined
	) {
		let contentEl = view.contentEl;
		let iconContainer;
		let mode = view.getMode();

		if (mode == "preview") {
			iconContainer = contentEl.querySelector(".markdown-reading-view > .markdown-preview-view");
		}

		if (mode == "source") {
			iconContainer = contentEl.querySelector(".cm-scroller");
		}

		let iconVal = frontmatter?.[this.settings.iconProperty];

		if (iconContainer instanceof HTMLElement) {
			let oldIconDiv = iconContainer.querySelector(".icon-wrapper");
			let iconDiv = document.createElement("div");
			iconDiv.classList.add("icon-wrapper");

			if (iconVal && this.settings.enableIcon) {
				let image:
					| HTMLDivElement
					| HTMLImageElement
					| SVGSVGElement
					| null = getIcon(iconVal);

				if (!image) {
					let iconLink = iconVal;
					if (iconLink.startsWith("http"))
						iconLink = "![](" + iconLink + ")";
					if (!iconLink.startsWith("!")) iconLink = "!" + iconLink;
					let iconTemp = document.createElement("div");
					MarkdownRenderer.render(
						this.app,
						iconLink,
						iconTemp,
						"",
						this
					);
					image = iconTemp.querySelector("img");
				}

				if (!image) {
					image = document.createElement("div");
					image.classList.add("pp-text-icon");
					let symbolArr = [...iconVal];
					let iconSymbol = symbolArr[0];
					image.append(iconSymbol);
				}

				if (image) {
					image.classList.add("pp-icon");
					let iconSizer = iconDiv.createEl("div", {
						cls: "icon-sizer",
					});
					let iconImage = iconSizer.createEl("div", {
						cls: "icon-image",
					});
					iconImage.append(image);
				}
			}

			if (oldIconDiv) {
				if (oldIconDiv.outerHTML != iconDiv.outerHTML) {
					oldIconDiv.remove();
					iconContainer.prepend(iconDiv);
				}
			} else {
				iconContainer.prepend(iconDiv);
			}
		}
	}

	async updateViewProgress(view: View) {
		let cache;
		if (view instanceof FileView && view.file) {
			cache = this.app.metadataCache.getFileCache(view.file);
		}
		let frontmatter = cache?.frontmatter;

		//@ts-ignore
		let mdEditor = view.metadataEditor;
		let mdContainer = mdEditor?.containerEl;

		if (mdContainer instanceof HTMLElement) {
			let oldProgresses = mdContainer.querySelectorAll(
				".metadata-property > .metadata-progress-wrapper"
			);
			for (let oldProgress of oldProgresses) {
				oldProgress.remove();
			}
		}

		let props = Object.keys(this.settings.progressProperties);

		for (let prop of props) {
			let progressVal = frontmatter?.[prop];

			if (
				progressVal !== undefined &&
				mdContainer instanceof HTMLElement
			) {
				let propertyKeyEl = mdContainer.querySelector(
					".metadata-property[data-property-key='" +
						prop +
						"'] > .metadata-property-key"
				);

				if (propertyKeyEl instanceof HTMLElement) {
					let maxVal;

					if (this.settings.progressProperties[prop].maxNumber) {
						maxVal =
							this.settings.progressProperties[prop].maxNumber;
					} else {
						let maxProperty =
							this.settings.progressProperties[prop].maxProperty;
						maxVal = frontmatter?.[maxProperty];
					}

					if (maxVal) {
						let progressWrapper = document.createElement("div");
						progressWrapper.classList.add(
							"metadata-progress-wrapper"
						);

						let progress = document.createElement("progress");
						progress.classList.add("metadata-progress");
						progress.max = maxVal;
						progress.value = progressVal || 0;

						let percent =
							" " +
							Math.round((progress.value * 100) / progress.max) +
							" %";
						setTooltip(progress, percent, {
							delay: 1,
							placement: "top",
						});

						progressWrapper.append(progress);
						propertyKeyEl.after(progressWrapper);
					}
				}
			}
		}
	}

	async addClassestoProperties(view: View) {

		

		
		let container = view.containerEl;
		
	
		let pills = container.querySelectorAll(
			".multi-select-pill:not([data-property-pill-value])"
		);

		let longtexts = container.querySelectorAll(
			".metadata-input-longtext"
		);


		let formulaPills = container.querySelectorAll(
			"[data-property='formula.tags'] .value-list-element:not([data-property-pill-value])"
		);

		for (let pill of pills) {
			let content = pill.querySelector(".multi-select-pill-content");
			if (content instanceof HTMLElement) {
				let value = content.innerText;
				if (value.startsWith("#")) {value = value.replace("#", "")}
				pill.setAttribute("data-property-pill-value", value);
			}
		}


		const createColorButton = async (parent: HTMLElement, value: string) => {

			
			let isBase = parent.classList.contains("bases-table-cell")

			if (value && (!isBase || this.settings.enableColorButtonInBases)) {
				
				let colorButton = document.createElement("button")
				setIcon(colorButton, "paintbrush")
				colorButton.classList.add("longtext-color-button")
				parent.append(colorButton)
				colorButton.setAttribute("data-value", value)

				colorButton.onclick = (e) => {
					
					let pillVal = value
					let menu = new Menu();
					let colors = [
						"red",
						"orange",
						"yellow",
						"green",
						"cyan",
						"blue",
						"purple",
						"pink",
						"none",
						"default",
					];

					for (let color of colors) {
						menu.addItem((item: MenuItem) => {
							item.setIcon("square");

							if (color != "default" && color != "none") {
								//@ts-ignore
								item.iconEl.style =
									"color: transparent; background-color: rgba(var(--color-" +
									color +
									"-rgb), 0.3);";
							}

							if (color == "none") {
								//@ts-ignore
								item.iconEl.style = "opacity: 0.2;";
							}

							item.setTitle(i18n.t(color)).onClick(() => {

								if (color == "default") {
									if (pillVal)
										delete this.settings
											.propertyLongtextColors[pillVal];
								} else {
									if (pillVal)
										this.settings.propertyLongtextColors[
											pillVal
										] = color;
								}
								this.saveSettings();
								this.updatePillColors();
							});
						});
					}
		
					menu.showAtMouseEvent(e)
				
				}
			}
		}


		for (let pill of longtexts) {
			if (pill instanceof HTMLElement) {
				let value = pill.innerText
				if (value) {
					value = value.slice(0, 200).trim()
					pill.setAttribute("data-property-longtext-value", value)
				}

				let parent = pill.parentElement

				if (parent) {
					let existingColorButton = parent?.querySelector(".longtext-color-button")
					if (existingColorButton) {
						let prevValue = existingColorButton.getAttribute("data-value")
						if (prevValue != value) {
							existingColorButton.remove()
							createColorButton(parent, value)
						}
					} else {
						createColorButton(parent, value)
					}
				}
			}
		}



		for (let pill of formulaPills) {
			if (pill instanceof HTMLElement) {
				let value = pill.innerText;
				if (value.startsWith("#")) {value = value.replace("#", "")}
				pill.setAttribute("data-property-pill-value", value);
			}
		}

	}





	async updateDateInputs(view: View) {

		let container = view.containerEl;
		

		

		let dateInputs = container.querySelectorAll(
		".metadata-input-text.mod-date"
		);

		let dateTimeInputs = container.querySelectorAll(
		".metadata-input-text.mod-datetime"
		);

		let customDateFormat = this.settings.customDateFormat
		let customDateTimeFormat = this.settings.customDateTimeFormat



		for (let input of dateInputs) {
			if (input instanceof HTMLInputElement) {
				let value = input.value;
				let parent = input.parentElement

				

				if (parent instanceof HTMLElement) {

					let isBase = parent.classList.contains("bases-table-cell")

					let existingCustomDateElement = parent.querySelector(".custom-date")
		
					if (this.settings.enableCustomDateFormat && 
						customDateFormat && 
						(!isBase || this.settings.enableCustomDateFormatInBases)) {

							
			
						let customDate = moment(value).format(customDateFormat);

						
						
						if (existingCustomDateElement instanceof HTMLElement &&
							existingCustomDateElement.innerText != customDate && 
							customDate != "Invalid date") {
				
							existingCustomDateElement.textContent = customDate
							parent.classList.add("has-custom-date")
							
						} else if (!existingCustomDateElement && customDate != "Invalid date") {
				
							let customDateEl = document.createElement("span")
							customDateEl.classList.add("custom-date")
							customDateEl.append(customDate)
							input.after(customDateEl)
							parent.classList.add("has-custom-date")
				
						} else if (existingCustomDateElement && customDate == "Invalid date") {
				
							existingCustomDateElement.textContent = ""
							parent.classList.remove("has-custom-date")
				
						}
					} else if (existingCustomDateElement) {
						
						existingCustomDateElement.textContent = ""
						parent.classList.remove("has-custom-date")
					}



					
					if (value) {
					let currentTime = moment().toISOString(true).slice(0, 10);
					if (currentTime == value) {
						parent.setAttribute("data-relative-date", "present");
					} else if (currentTime > value) {
						parent.setAttribute("data-relative-date", "past");
					} else {
						parent.setAttribute("data-relative-date", "future");
					}
					} else {
					parent.setAttribute("data-relative-date", "none");
					}
				}
			}
		}


		for (let input of dateTimeInputs) {
			if (input instanceof HTMLInputElement) {
			
				let value = input.value;
				let parent = input.parentElement

				if (parent instanceof HTMLElement) {

					let isBase = parent.classList.contains("bases-table-cell")

					let existingCustomDateElement = parent.querySelector(".custom-date")
			
					if (this.settings.enableCustomDateFormat && 
						customDateTimeFormat && 
						(!isBase || this.settings.enableCustomDateFormatInBases)) {

							
			
					let customDate = moment(value).format(customDateTimeFormat);

				
					
					
					if (existingCustomDateElement instanceof HTMLElement && 
						existingCustomDateElement.innerText != customDate && 
						customDate != "Invalid date") {
			
						existingCustomDateElement.textContent = customDate
						parent.classList.add("has-custom-date")
						
					} else if (!existingCustomDateElement && customDate != "Invalid date") {
			
						let customDateEl = document.createElement("span")
						customDateEl.classList.add("custom-date")
						customDateEl.append(customDate)
						input.after(customDateEl)
						parent.classList.add("has-custom-date")
			
					} else if (existingCustomDateElement && customDate == "Invalid date") {
			
						existingCustomDateElement.textContent = ""
						parent.classList.remove("has-custom-date")
			
					}
					}  else if (existingCustomDateElement) {
						existingCustomDateElement.textContent = ""
						parent.classList.remove("has-custom-date")
					}
			
			
			
					if (value) {
					let currentTime = moment().toISOString(true).slice(0, 16);
					value = value.slice(0, 16);
					if (currentTime == value) {
						parent.setAttribute("data-relative-date", "present");
					} else if (currentTime > value) {
						parent.setAttribute("data-relative-date", "past");
					} else {
						parent.setAttribute("data-relative-date", "future");
					}
					} else {
					parent.setAttribute("data-relative-date", "none");
					}
				}
			}
		}
		

	}




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
