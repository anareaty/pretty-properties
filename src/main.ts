import { 
	FileView,
	EventRef,
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
	IconName,
	SuggestModal,
	Modal,
	App,
	Setting
 } from 'obsidian';
import MenuManager from 'src/MenuManager';
import { i18n } from './localization';
import PPSettingTab from './settings';
import { PPPluginSettings, DEFAULT_SETTINGS } from './settings';
import { LocalImageSuggestModal } from './modals';
import Emojilib from "emojilib";
import { ImageLinkPrompt } from './modals';





export default class PrettyPropertiesPlugin extends Plugin {
	settings: PPPluginSettings;
	mutations: any[]
	observers: MutationObserver[]

	async onload() {

		let locale = "en"
		if (getLanguage) {
			locale = getLanguage()
		} else {
			locale = window.localStorage.language
		}
		
    	i18n.setLocale(locale);

		await this.loadSettings();
		this.updateHiddenProperties()
		this.updatePillColors()
		this.updateBannerStyles()
		this.updateIconStyles()
		this.updateCoverStyles()

		this.observers = []




		this.registerEvent(
			this.app.workspace.on("layout-change", async () => {
				this.updateElements()
			})
		);

		this.registerEvent(
			this.app.metadataCache.on("changed", async (file, data, cache) => {
				this.updateElements(file)
			})
		);

		this.registerEvent(
			this.app.workspace.on("layout-change", async () => {
				let mdLeafs = this.app.workspace.getLeavesOfType("markdown")
				let baseLeafs = this.app.workspace.getLeavesOfType("bases")
				let propLeafs = this.app.workspace.getLeavesOfType("file-properties")

				this.observers.forEach(obs => {
					obs.disconnect()
				})
				this.observers = []

				for (let leaf of mdLeafs) {
					this.startObservingLeaf(leaf, "markdown")
				}

				for (let leaf of baseLeafs) {
					this.startObservingLeaf(leaf, "bases")
				}

				for (let leaf of propLeafs) {
					this.startObservingLeaf(leaf, "file-properties")
				}
			})
		);





		const registerDocumentEvents = (doc: Document) => {
			if (Platform.isMobile) {
				this.registerDomEvent(doc, "contextmenu", (e: MouseEvent) => {
					if (e.target instanceof HTMLElement && 
					e.target.closest(".multi-select-pill")) {
					this.handlePillMenu(e.target)
					}
				});

				this.registerDomEvent(doc, "touchstart", (e: TouchEvent) => {
					if ((e.target instanceof HTMLElement || 
					e.target instanceof SVGElement) && 
					e.target.closest(".metadata-property-icon")) {
					this.handlePropertyMenu(e.target)
					}
				});
			} else {
				this.registerDomEvent(doc, "mousedown", (e: MouseEvent) => {
					let targetEl = e.target as HTMLElement
					if (e.button == 2) { 
						if (targetEl.closest(".multi-select-pill")) {
							this.handlePillMenu(targetEl)
						}
					}

					if (targetEl.closest(".metadata-property-icon")) {
						this.handlePropertyMenu(targetEl)
					}
				});
			}

			this.registerDomEvent(doc, "click", (e: MouseEvent) => {
				if (e.ctrlKey && e.target instanceof HTMLElement) {
					let value = this.getPropertyValue(e)
					if (value !== undefined) {
						let propEl = e.target.closest(".metadata-property")
						let prop = propEl!.getAttribute("data-property-key")
						let search = '[' + prop + ': "' + value +'"]'
						//@ts-ignore
						this.app.internalPlugins.plugins["global-search"].instance.openGlobalSearch(search)
					}
				}
			})

			this.registerDomEvent(doc, "contextmenu", (e: MouseEvent) => {
				let targetEl = e.target
				if (targetEl instanceof Element) {

					if (targetEl.closest(".banner-image")) {
						e.preventDefault()
						this.createBannerMenu(e)
					}

					if (targetEl.closest(".metadata-side-image")) {
						e.preventDefault()
						this.createCoverMenu(e)
					}

					if (targetEl.closest(".pp-icon")) {
						e.preventDefault()
						this.createIconMenu(e)
					}
				}
			}, true)
		}

		registerDocumentEvents(document)

		this.registerEvent(
			this.app.workspace.on("window-open", async (win, window) => {
				registerDocumentEvents(win.doc)
			})
		);





		this.addCommand({
            id: "toggle-hidden-properties",
            name: i18n.t("HIDE_SHOW_HIDDEN_PROPERTIES"),
            callback: async () => {
                document.body.classList.toggle("show-hidden-properties")
            }
        })


		this.addCommand({
            id: "select-banner-image",
            name: i18n.t("SELECT_BANNER_IMAGE"),
            callback: async () => {
                this.selectImage(this.settings.bannerProperty, this.settings.bannersFolder, "banner")
            }
        })


		this.addCommand({
            id: "select-icon",
            name: i18n.t("SELECT_ICON"),
            callback: async () => {
                this.selectIcon()
            }
        })


		this.addCommand({
            id: "select-cover-image",
            name: i18n.t("SELECT_COVER_IMAGE"),
            callback: async () => {
				let file = this.app.workspace.getActiveFile()

				if (file instanceof TFile) {
					let cache = this.app.metadataCache.getFileCache(file)
					let frontmatter = cache!.frontmatter
					let props = [...this.settings.extraCoverProperties]
					props.unshift(this.settings.coverProperty)
					let propName: string | undefined
					for (let prop of props) {
						propName = prop
						if (frontmatter?.[prop] !== undefined) break
					}

					if (propName) {
						this.selectImage(propName, this.settings.coversFolder, "cover")
					}
				}
			}
        })


		this.addCommand({
            id: "select-cover-shape",
            name: i18n.t("SELECT_COVER_SHAPE"),
            callback: async () => {
				let file = this.app.workspace.getActiveFile()

				if (file instanceof TFile) {
					this.selectCoverShape(file)
				}
			}
        })



	
		this.addSettingTab(new PPSettingTab(this.app, this));
	}

	onunload() {
	}



	startObservingLeaf(leaf: WorkspaceLeaf, type: string) {

		let view = leaf.view

		this.addClassestoProperties(view)

		let targetNode = view.containerEl;
		let observer = new MutationObserver((mutations) => {

			let baseMutation
			let multiSelectMutation
			let progressMutation

			for (let mutation of mutations) {
				let target = mutation.target
				if (target instanceof HTMLElement) {
					if (target.classList.contains("bases-view") ||
					target.classList.contains("bases-table-container") ||
					target.classList.contains("bases-tbody") ||
					target.classList.contains("bases-tr") ||
					target.classList.contains("bases-cards-container") ||
					target.classList.contains("bases-cards-group") ||
					target.classList.contains("bases-cards-item")) {
						baseMutation = true
						break
					}
					
					if (target.classList.contains("metadata-properties")) {
						multiSelectMutation = true
						progressMutation = true
						break
					}

					if (target.classList.contains("multi-select-container") || 
					target.classList.contains("value-list-container")) {
						multiSelectMutation = true
						if (progressMutation) break
					}

					let progressEl = target.closest('[data-property*="formula.pp_progress"]')

					if (progressEl && 
					target.classList.contains("bases-rendered-value")) {
						progressMutation = true
						if (multiSelectMutation) break
					}
				}
			}

			if (multiSelectMutation) {
				this.addClassestoProperties(view)
				this.updateBaseLeafPills(leaf)
			}
			if (progressMutation) {
				this.updateViewProgress(view)
				this.updateBaseLeafProgress(leaf)
			}
		

			if (baseMutation) {
				this.updateBaseLeafPills(leaf)
				this.updateBaseLeafProgress(leaf)
				
			}

		});
		observer.observe(targetNode, { childList: true, subtree: true });
		this.observers.push(observer)
	}



	createBannerMenu(e: MouseEvent) {

		let propName = this.settings.bannerProperty


		let menu = new Menu()

		menu.addItem( (item: MenuItem) => item
			.setTitle(i18n.t("SELECT_BANNER_IMAGE"))
			.setIcon('lucide-image-plus')
			.setSection('pretty-properties')
			.onClick(async () => {
				this.selectImage(this.settings.bannerProperty, this.settings.bannersFolder, "banner")
			})
		);


		if (this.settings.hiddenProperties.find(p => p == propName)) {
			menu.addItem((item: MenuItem) => item
			.setTitle(i18n.t("UNHIDE_BANNER_PROPERTY"))
			.setIcon('lucide-eye')
			.setSection('pretty-properties')
			.onClick(() => {
				if (propName) this.settings.hiddenProperties.remove(propName)
				this.saveSettings()
				this.updateHiddenProperties()			
			}))
		} else {
			menu.addItem((item: MenuItem) => item
			.setTitle(i18n.t("HIDE_BANNER_PROPERTY"))
			.setIcon('lucide-eye-off')
			.setSection('pretty-properties')
			.onClick(() => {
				if (propName) this.settings.hiddenProperties.push(propName)
				this.saveSettings()
				this.updateHiddenProperties()			
			}))
		}

		menu.showAtMouseEvent(e)
	}



	createIconMenu(e: MouseEvent) {

		let propName = this.settings.iconProperty


		let menu = new Menu()

		menu.addItem( (item: MenuItem) => item
			.setTitle(i18n.t("SELECT_ICON"))
			.setIcon('lucide-image-plus')
			.setSection('pretty-properties')
			.onClick(async () => {
				this.selectIcon()
			})
		);


		if (this.settings.hiddenProperties.find(p => p == propName)) {
			menu.addItem((item: MenuItem) => item
			.setTitle(i18n.t("UNHIDE_ICON_PROPERTY"))
			.setIcon('lucide-eye')
			.setSection('pretty-properties')
			.onClick(() => {
				if (propName) this.settings.hiddenProperties.remove(propName)
				this.saveSettings()
				this.updateHiddenProperties()			
			}))
		} else {
			menu.addItem((item: MenuItem) => item
			.setTitle(i18n.t("HIDE_ICON_PROPERTY"))
			.setIcon('lucide-eye-off')
			.setSection('pretty-properties')
			.onClick(() => {
				if (propName) this.settings.hiddenProperties.push(propName)
				this.saveSettings()
				this.updateHiddenProperties()			
			}))
		}

		menu.showAtMouseEvent(e)
	}



	async selectIcon() {

		let options: any = {
			"image": i18n.t("LOCAL_IMAGE"),
			"link": i18n.t("EXTERNAL_IMAGE"),
			"svg": i18n.t("LUCIDE_ICON"),
			"emoji": i18n.t("EMOJI")
		}

		let plugin = this

		class IconSuggestModal extends SuggestModal<string> {
			getSuggestions(query:string): string[] {
				return Object.keys(options).filter((key) => {
					return options[key].toLowerCase().includes(query.toLowerCase())
				})
			}
			async renderSuggestion(key: string, el: Element) {
				el.append(options[key])
			}
			onChooseSuggestion(val: string) {
				let iconProperty = plugin.settings.iconProperty
				if (val == "image") {
					plugin.selectLocalImage(iconProperty, plugin.settings.iconsFolder, "icon")
				}
				if (val == "link") {
					new ImageLinkPrompt(this.app, iconProperty).open()
				}
				if (val == "svg") {
					plugin.selectIconSvg()
				}
				if (val == "emoji") {
					plugin.selectIconEmoji()
				}
			} 
		}
		new IconSuggestModal(this.app).open()
	}











	async selectImage(propName: string, folder: string, shape: string) {
		let options: any = {
			"image": i18n.t("LOCAL_IMAGE"),
			"link": i18n.t("EXTERNAL_IMAGE")
		}
		let plugin = this

		class ImageSuggestModal extends SuggestModal<string> {
			getSuggestions(query:string): string[] {
				return Object.keys(options).filter((key) => {
					return options[key].toLowerCase().includes(query.toLowerCase())
				})
			}
			async renderSuggestion(key: string, el: Element) {
				el.append(options[key])
			}
			onChooseSuggestion(val: string) {
				if (val == "image") {
					plugin.selectLocalImage(propName, folder, shape)
				}
				if (val == "link") {
					new ImageLinkPrompt(this.app, propName).open()
				}
			} 
		}
		new ImageSuggestModal(this.app).open()
	}








	async selectLocalImage(propName: string, folder: string, shape: string) {

		let file = this.app.workspace.getActiveFile()
		if (file instanceof TFile) {

			let formats = ["avif", "bmp", "gif", "jpeg", "jpg", "png", "svg", "webp"]
			let files = this.app.vault.getFiles()
			files = files.filter(f => formats.find(e => e == f.extension))

			let imageFiles = files
			if (folder) {
				imageFiles = files.filter(f => {
					return f.parent!.path == folder || f.parent!.path.startsWith(folder + "/")
				})
			}

			let imagePaths = imageFiles.map(f => f.path)
			let imageNames = imageFiles.map(f => f.basename)

			new LocalImageSuggestModal(this.app, this, propName, shape, imagePaths, imageNames).open()

		}
	}










	async selectIconSvg() {
		let propName = this.settings.iconProperty
		let iconIds = getIconIds()

		class SvgSuggestModal extends SuggestModal<string> {

			getSuggestions(query:string): string[] {
				return iconIds.filter((val) => {
					return val.toLowerCase().includes(query.toLowerCase())
				});
			}
			async renderSuggestion(id: string, el: Element) {
				let svg = getIcon(id) || ""
				el.append(svg)
				el.classList.add("image-suggestion-item")
            	el.classList.add("svg-icon")
			}
			onChooseSuggestion(id: string) {
				if (id) {
					let file = this.app.workspace.getActiveFile()
					if (file instanceof TFile) {
						this.app.fileManager.processFrontMatter(file, fm => {
							fm[propName] = id
						})
					}
				}
			} 
		}
		new SvgSuggestModal(this.app).open()
	}


	async selectIconEmoji() {
		let propName = this.settings.iconProperty

		class EmojiSuggestModal extends SuggestModal<string> {

			getSuggestions(query:string): string[] {
				return Object.keys(Emojilib).filter((emoji) => {
					let keywords = Emojilib[emoji]
					return keywords.find(keyword => {
						return keyword.toLowerCase().includes(query.toLowerCase())
					})
				});
			}
			async renderSuggestion(emoji: string, el: Element) {
				el.createEl("div", {text: emoji})
				el.classList.add("image-suggestion-item")
            	el.classList.add("emoji-icon")
			}
			onChooseSuggestion(emoji: string) {
				if (emoji) {
					let file = this.app.workspace.getActiveFile()
					if (file instanceof TFile) {
						this.app.fileManager.processFrontMatter(file, fm => {
							fm[propName] = emoji
						})
					}
				}
			} 
		}

		new EmojiSuggestModal(this.app).open()
	}















	





	createCoverMenu(e:MouseEvent) {

		let file = this.app.workspace.getActiveFile()

		if (file instanceof TFile) {
			let cache = this.app.metadataCache.getFileCache(file)
			let frontmatter = cache!.frontmatter
			let props = [...this.settings.extraCoverProperties]
			props.unshift(this.settings.coverProperty)
			let propName: string | undefined
			for (let prop of props) {
				propName = prop
				
				if (frontmatter?.[prop] !== undefined) break
			}

			if (propName) {

				let menu = new Menu()

				menu.addItem((item: MenuItem) => item
					.setTitle(i18n.t("SELECT_COVER_IMAGE"))
					.setIcon('lucide-image-plus')
					.setSection('pretty-properties')
					.onClick(async () => {
						if (propName) this.selectCoverImage(propName)
					})
				);




				menu.addItem((item: MenuItem) => item
					.setTitle(i18n.t("SELECT_COVER_SHAPE"))
					.setIcon('lucide-shapes')
					.setSection('pretty-properties')
					.onClick(async () => {
						if (file instanceof TFile) this.selectCoverShape(file)
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
					menu.addItem((item: MenuItem) => item
					.setTitle(i18n.t("HIDE_COVER_PROPERTY"))
					.setIcon('lucide-eye-off')
					.setSection('pretty-properties')
					.onClick(() => {
						if (propName) this.settings.hiddenProperties.push(propName)
						this.saveSettings()
						this.updateHiddenProperties()			
					}))
				}

				menu.showAtMouseEvent(e)
			}
		}
	}



	async selectCoverShape(file: TFile) {
		let shapes = ["vertical", "horizontal", "square", "circle"]
		class CoverShapeSuggestModal extends SuggestModal<string> {
			getSuggestions(query:string): string[] {
				return shapes.filter((shape) => {
					return shape.toLowerCase().includes(query.toLowerCase())
				})
			}
			async renderSuggestion(text: string, el: Element) {
				el.append(text)
			}
			onChooseSuggestion(shape: string) {
				if (shape) {
					this.app.fileManager.processFrontMatter(file, fm => {
						let cssclasses = fm.cssclasses || []
						cssclasses = cssclasses.filter((c: string) => !shapes.find(s => c == "cover-" + s))
						cssclasses.push("cover-" + shape)
						fm.cssclasses = cssclasses
					})
				}
			} 
		}
		new CoverShapeSuggestModal(this.app).open()
	}


	


	


	getPropertyValue(e: MouseEvent) {
		let targetEl = e.target
		let text
		if (targetEl instanceof HTMLElement) {
			let valueTextEl = targetEl.closest(".metadata-input-longtext") || targetEl.closest(".multi-select-pill-content")
			let valueInputEl = targetEl.closest(".metadata-input-number") || targetEl.closest(".metadata-input-text")
			let checkboxEl = targetEl.closest(".metadata-input-checkbox")

			if (valueTextEl instanceof HTMLElement) {
				text = valueTextEl.innerText
			}
			else if (valueInputEl instanceof HTMLInputElement) {
				text = valueInputEl.value
			}

			else if (checkboxEl) {
				e.preventDefault()
				let currentFile = this.app.workspace.getActiveFile()
				let propEl = targetEl.closest(".metadata-property")
				let prop = propEl!.getAttribute("data-property-key")
				if (currentFile instanceof TFile && prop) {
					text = this.app.metadataCache.getFileCache(currentFile)!.frontmatter![prop]
				}
			}
		}
		return text
	}








	handlePropertyMenu(el: HTMLElement | SVGElement) {
		let propEl = el.closest(".metadata-property");
		if (propEl instanceof HTMLElement) {
			let propName = propEl?.getAttribute("data-property-key")

			if (propName) {

				let menuManager = new MenuManager()

				if (this.settings.hiddenProperties.find(p => p == propName)) {



					menuManager.addItemAfter(['clipboard'], i18n.t("UNHIDE_PROPERTY"), (item: MenuItem) => item
						.setTitle(i18n.t("UNHIDE_PROPERTY"))
						.setIcon('lucide-eye')
						.setSection('pretty-properties')
						.onClick(() => {
							if (propName) this.settings.hiddenProperties.remove(propName)
							this.saveSettings()
							this.updateHiddenProperties()
						})
					);

				} else {

					

					

					menuManager.addItemAfter(['clipboard'], i18n.t("HIDE_PROPERTY"), (item: MenuItem) => item
						.setTitle(i18n.t("HIDE_PROPERTY"))
						.setIcon('lucide-eye-off')
						.setSection('pretty-properties')
						.onClick(() => {
							if (propName) this.settings.hiddenProperties.push(propName)
							this.saveSettings()
							this.updateHiddenProperties()
						})
					);
				}

				


				//@ts-ignore
				let propertyTypeObject = this.app.metadataTypeManager.getPropertyInfo(propName.toLowerCase())
				let propertyType
				if (propertyTypeObject) {
					propertyType = propertyTypeObject.widget || propertyTypeObject.type
				}

				if (propertyType == "number" && !this.settings.progressProperties[propName]) {

					menuManager.addItemAfter(["clipboard"], i18n.t("SHOW_PROGRESS_BAR"), (item: MenuItem) => item
					.setTitle(i18n.t("SHOW_PROGRESS_BAR"))
					.setIcon("lucide-bar-chart-horizontal-big")
					.setSection("pretty-properties")
					.onClick(() => {
						if (propName) {
							this.settings.progressProperties[propName] = {
							maxNumber: 100
							}
						}
						this.saveSettings();
						this.updateElements();
						})
					);
				} else if (this.settings.progressProperties[propName]) {
					if (this.settings.progressProperties[propName].maxProperty) {
						menuManager.addItemAfter(["clipboard"], i18n.t("SET_PROGRESS_MAX_VALUE_100"), (item: MenuItem) => item
							.setTitle(i18n.t("SET_PROGRESS_MAX_VALUE_100"))
							.setIcon("lucide-bar-chart-horizontal-big")
							.setSection("pretty-properties")
							.onClick(() => {
								if (propName) {
									delete this.settings.progressProperties[propName].maxProperty
									this.settings.progressProperties[propName].maxNumber = 100
								}
								this.saveSettings();
								this.updateElements();
							})
						);
					}


					menuManager.addItemAfter(["clipboard"], i18n.t("SET_PROGRESS_MAX_VALUE_PROPERTY"), (item: MenuItem) => {item
						.setTitle(i18n.t("SET_PROGRESS_MAX_VALUE_PROPERTY"))
						.setIcon("lucide-bar-chart-horizontal-big")
						.setSection("pretty-properties")
						
						//@ts-ignore
						let sub = item.setSubmenu()
						//@ts-ignore
						let properties = this.app.metadataTypeManager.getAllProperties()
						let numberProperties = Object.keys(properties).filter(p => {
							let property = properties[p]
							let type = property.widget || property.type
							return type == "number"
						}).map(p => properties[p].name)

						for (let numberProp of numberProperties) {
							sub.addItem((subitem: MenuItem) => {
								if (propName) {
									subitem.setTitle(numberProp)
									.setChecked(this.settings.progressProperties[propName].maxProperty == numberProp)
									.onClick(() => {
										if (propName) {
											delete this.settings.progressProperties[propName].maxNumber
											this.settings.progressProperties[propName].maxProperty = numberProp
										}
										this.saveSettings();
										this.updateElements();
									})
								} 
							})
						}
					});
					

					menuManager.addItemAfter(["clipboard"], i18n.t("REMOVE_PROGRESS_BAR"), (item: MenuItem) => item
						.setTitle(i18n.t("REMOVE_PROGRESS_BAR"))
						.setIcon("lucide-bar-chart-horizontal-big")
						.setSection("pretty-properties")
						.onClick(() => {
							if (propName) {
								delete this.settings.progressProperties[propName]
							}
							this.saveSettings();
							this.updateElements();
						})
					);
				}
			}
		}
	}



	handlePillMenu(el: HTMLElement) {
		let menuManager = new MenuManager();
		let pillEl = el.closest(".multi-select-pill");
		if (pillEl instanceof HTMLElement) {
			let pillVal = pillEl?.getAttribute("data-property-pill-value")

			if (pillVal) {
				menuManager.addItemAfter(['clipboard'], i18n.t("SELECT_COLOR"), (item: MenuItem) => {
					item.setTitle(i18n.t("SELECT_COLOR"))
					.setIcon("paintbrush")
					.setSection('pretty-properties')

					//@ts-ignore
					let sub = item.setSubmenu() as Menu
					let colors = ["red", "orange", "yellow", "green", "cyan", "blue", "purple", "pink", "none", "default"]

					for (let color of colors) {
						sub.addItem((item: MenuItem) => {
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

							if (color == "default") {
								if (pillVal) delete(this.settings.propertyPillColors[pillVal])
							} else {
								if (pillVal) this.settings.propertyPillColors[pillVal] = color;
							}

							this.saveSettings()
							this.updatePillColors()
						})
					})
					}
				});
			}
		}
	}





	updateHiddenProperties() {
		let styleText = ""
		for (let prop of this.settings.hiddenProperties) {
			styleText = styleText + "body:not(.show-hidden-properties) .workspace-leaf-content[data-type='markdown'] .metadata-property[data-property-key='" + prop + "'] {display: none;}\n"
		}

		let oldStyle = document.head.querySelector("style#pp-hide-properties")
		if (oldStyle) oldStyle.remove()

		const style = document.createElement("style")
		style.textContent = styleText
		style.id = "pp-hide-properties"
		document.head.appendChild(style)
	}


	updatePillColors() {

		let styleText = ""
		for (let prop in this.settings.propertyPillColors) {
			styleText = styleText + "[data-property-pill-value='" + prop + "'] {" + 
			"--pill-color-rgb: var(--color-" + this.settings.propertyPillColors[prop] + "-rgb); \n" + 
			"--pill-background-modified: rgba(var(--pill-color-rgb), 0.2); \n--pill-background-hover-modified: rgba(var(--pill-color-rgb), 0.3); \n" +
			"--tag-background-modified: rgba(var(--pill-color-rgb), 0.2); \n--tag-background-hover-modified: rgba(var(--pill-color-rgb), 0.3);}\n"
		}

		let oldStyle = document.head.querySelector("style#pp-pill-colors")
		if (oldStyle) oldStyle.remove()

		const style = document.createElement("style")
		style.textContent = styleText
		style.id = "pp-pill-colors"
		document.head.appendChild(style)

	}



	updateBannerStyles() {
		let oldStyle = document.head.querySelector("style#pp-banner-styles")
		if (oldStyle) oldStyle.remove()

		if (this.settings.enableBanner) {

			let bannerHeight
			let bannerMargin 
			if (Platform.isMobile) {
				bannerHeight = this.settings.bannerHeightMobile
				bannerMargin = this.settings.bannerMarginMobile
			} else {
				bannerHeight = this.settings.bannerHeight
				bannerMargin = this.settings.bannerMargin
			}

			let styleText = "body {\n" + 
			"--banner-height: " + bannerHeight + "px;\n" +
			"--banner-margin: " + bannerMargin + "px;\n" +
			"}\n"

			if (this.settings.bannerFading) {
				styleText = styleText  +
				".banner-image img {\n" + 
				"--banner-fading: linear-gradient(to bottom, black 25%, transparent);\n" +
				"}"
			}

			const style = document.createElement("style")
			style.textContent = styleText
			style.id = "pp-banner-styles"
			document.head.appendChild(style)
		}
	}





	updateIconStyles() {

		let oldStyle = document.head.querySelector("style#pp-icon-styles")
		if (oldStyle) oldStyle.remove()

		if (this.settings.enableIcon) {


			let iconTopMargin
			let bannerIconGap
			if (Platform.isMobile) {
				iconTopMargin = this.settings.iconTopMarginMobile
				bannerIconGap = this.settings.bannerIconGapMobile
			} else {
				iconTopMargin = this.settings.iconTopMargin
				bannerIconGap = this.settings.bannerIconGap
			}




			let iconColor = this.settings.iconColor
			if (!iconColor) iconColor = "var(--text-normal)"


			let iconBackground = "transparent"

			if (this.settings.iconBackground) {
				iconBackground = "var(--background-primary)"
			}


			let styleText = "body {\n" + 
			"--pp-icon-size: " + this.settings.iconSize + "px;\n" +
			"--pp-icon-top-margin: " + iconTopMargin + "px;\n" +
			"--pp-icon-top-margin-wb: " + this.settings.iconTopMarginWithoutBanner + "px;\n" +
			"--pp-icon-gap: " + this.settings.iconGap + "px;\n" +
			"--pp-banner-icon-gap: " + bannerIconGap + "px;\n" +
			"--pp-icon-left-margin: " + this.settings.iconLeftMargin + "px;\n" +
			"--pp-icon-color: " + iconColor + ";\n" +
			"--pp-icon-background: " + iconBackground + ";\n" +
			"}\n"

			const style = document.createElement("style")
			style.textContent = styleText
			style.id = "pp-icon-styles"
			document.head.appendChild(style)
		}
	}





	updateCoverStyles() {
		let oldStyle = document.head.querySelector("style#pp-cover-styles")
		if (oldStyle) oldStyle.remove()

		if (this.settings.enableCover) {
			let styleText = "body {\n" + 
			"--cover-width-horizontal: " + this.settings.coverHorizontalWidth + "px;\n" +
			"--cover-width-vertical: " + this.settings.coverVerticalWidth + "px;\n" +
			"--cover-width-square: " + this.settings.coverSquareWidth + "px;\n" +
			"--cover-width-circle: " + this.settings.coverCircleWidth + "px;\n" +
			"}\n"

			const style = document.createElement("style")
			style.textContent = styleText
			style.id = "pp-cover-styles"
			document.head.appendChild(style)
		}
	}



	updateElements(changedFile?: TFile | null, cache?: CachedMetadata | null) {
		let leaves = this.app.workspace.getLeavesOfType("markdown")
		for (let leaf of leaves) {
			if (leaf.view instanceof MarkdownView) {
				if(changedFile && leaf.view.file && leaf.view.file.path != changedFile.path) {
					continue
				}
				this.updateLeafElements(leaf.view, cache)
			}
		}


		let propLeaves = this.app.workspace.getLeavesOfType("file-properties")
		for (let leaf of propLeaves) {
			if (leaf.view instanceof FileView) {
				if(changedFile && leaf.view.file && leaf.view.file.path != changedFile.path) {
					continue
				}
				this.updateLeafElements(leaf.view, cache)
			}
		}

		let baseLeaves = this.app.workspace.getLeavesOfType("bases")
		for (let leaf of baseLeaves) {
			if (leaf.view instanceof FileView) {
				this.updateBaseLeafPills(leaf)
				this.updateBaseLeafProgress(leaf)
			}
		}
	}


	updateBaseLeafPills(leaf: WorkspaceLeaf) {



		



		let baseTableContainer = leaf.view.containerEl.querySelector(".bases-table-container")

		if (baseTableContainer) {

			
			const updateTableBasePills = () => {
				if (baseTableContainer.classList.contains("is-loading")) {
					setTimeout(updateTableBasePills, 50)
				} else {
					this.addClassestoProperties(leaf.view)
				}
			}

			updateTableBasePills()	
		}

		
		
		
		let baseCardsContainer = leaf.view.containerEl.querySelector(".bases-cards-container")

		if (baseCardsContainer) {

			const updateCardsBasePills = () => {

				if (baseCardsContainer!.classList.contains("is-loading")) {
					let baseCardsContainer2 = leaf.view.containerEl.querySelector(".bases-cards-container:not(.is-loading")

					if (!baseCardsContainer2) {
						setTimeout(updateCardsBasePills, 50)
					} else {
						baseCardsContainer = baseCardsContainer2
					}
				} 
				
				if (!baseCardsContainer!.classList.contains("is-loading")) {
					let pills = baseCardsContainer!.querySelectorAll(".bases-cards-property .value-list-element:not([data-property-pill-value])")

					for (let pill of pills) {
						if (pill instanceof HTMLElement) {
							let value = pill.innerText
							pill.setAttribute("data-property-pill-value", value)
						}
					}
				}
			}

			updateCardsBasePills()
		}
	}








	updateBaseLeafProgress(leaf: WorkspaceLeaf) {
		let baseTableContainer = leaf.view.containerEl.querySelector(".bases-table-container")
		
		if (baseTableContainer) {
			const updateProgress = () => {
				if (baseTableContainer.classList.contains("is-loading")) {
					setTimeout(updateProgress, 50)
				} else {
					let progressEls = baseTableContainer.querySelectorAll(".bases-td[data-property*='formula.pp_progress']")
					for (let progressEl of progressEls) {
						if (progressEl instanceof HTMLElement) {
							let oldProgress = progressEl.querySelector(".metadata-progress-wrapper")
							if (oldProgress) {
								oldProgress.remove()
								progressEl.classList.remove("has-progress-bar")
							}

							let valueEl = progressEl.querySelector(".bases-rendered-value")
							if (valueEl instanceof HTMLElement) {
								
								let valueString = valueEl.innerText
								if (valueString) {
									let valueParts = valueString.match(/(\d+)(\/)(\d+)/)
									if (valueParts) {
										let progressWrapper = document.createElement("div")
										progressWrapper.classList.add("metadata-progress-wrapper")
										let progress = document.createElement("progress")
										progress.classList.add("metadata-progress")
										progress.value = Number(valueParts[1])
										progress.max = Number(valueParts[3])

										let percent = " " + Math.round(progress.value * 100 / progress.max) + " %"
										setTooltip(progress, percent, {delay: 500, placement: "top"})

										progressWrapper.append(progress)
										progressEl.classList.add("has-progress-bar")

										progressEl.prepend(progressWrapper)
									}
								}
							}
							
						}
					}
				}
			}
			updateProgress()	
		}



		let baseCardsContainer = leaf.view.containerEl.querySelector(".bases-cards-container")

		if (baseCardsContainer) {
			const updateProgress = () => {

				if (baseCardsContainer!.classList.contains("is-loading")) {
					let baseCardsContainer2 = leaf.view.containerEl.querySelector(".bases-cards-container:not(.is-loading")

					if (!baseCardsContainer2) {
						setTimeout(updateProgress, 50)
					} else {
						baseCardsContainer = baseCardsContainer2
					}
				} 
				
				
				if (!baseCardsContainer!.classList.contains("is-loading")) {
					let progressEls = baseCardsContainer!.querySelectorAll(".bases-cards-property[data-property*='formula.pp_progress']")
					for (let progressEl of progressEls) {
						if (progressEl instanceof HTMLElement) {
							let oldProgress = progressEl.querySelector(".metadata-progress-wrapper")
							if (oldProgress) {
								oldProgress.remove()
								progressEl.classList.remove("has-progress-bar")
							}

							let valueEl = progressEl.querySelector(".bases-rendered-value")
							if (valueEl instanceof HTMLElement) {
								
								let valueString = valueEl.innerText
								if (valueString) {
									let valueParts = valueString.match(/(\d+)(\/)(\d+)/)
									if (valueParts) {
										let progressWrapper = document.createElement("div")
										progressWrapper.classList.add("metadata-progress-wrapper")
										let progress = document.createElement("progress")
										progress.classList.add("metadata-progress")
										progress.value = Number(valueParts[1])
										progress.max = Number(valueParts[3])

										let percent = " " + Math.round(progress.value * 100 / progress.max) + " %"
										setTooltip(progress, percent, {delay: 500, placement: "top"})

										progressWrapper.append(progress)
										progressEl.classList.add("has-progress-bar")

										let label = progressEl.firstChild
										label?.after(progressWrapper)
									}
								}
							}
							
						}
					}
				}
			}
			updateProgress()	
		}
	}








	async updateLeafElements(view: MarkdownView | FileView, cache?: CachedMetadata | null) {

		this.addClassestoProperties(view)

		if (!cache && view.file) {
			cache = this.app.metadataCache.getFileCache(view.file)
		}
		let frontmatter
		if (cache) {
			frontmatter = cache.frontmatter
		}

		if (view instanceof MarkdownView) {
			this.updateCoverImages(view, frontmatter)
			this.updateIcons(view, frontmatter)
			this.updateBannerImages(view, frontmatter)
			
			if (cache && frontmatter) {
				this.updateTasksCount(view, cache)
			}
		}

		//this.updateProgressBars(view, frontmatter)
		this.updateViewProgress(view)
	}


	async updateTasksCount(view: MarkdownView | FileView, cache: CachedMetadata) {
		let frontmatter = cache.frontmatter
		let tasksProp = this.settings.allTasksCount
		let completedProp = this.settings.completedTasksCount
		let uncompletedProp = this.settings.uncompletedTasksCount
		let tasksVal = frontmatter?.[tasksProp]
		let completedVal = frontmatter?.[completedProp]
		let uncompletedVal = frontmatter?.[uncompletedProp]

		if (tasksVal !== undefined || completedVal !== undefined || uncompletedVal !== undefined) {
			let file = view.file
			let listItems = cache.listItems
			if (listItems) {
				let allTasksStatuses = this.settings.completedTasksStatuses.concat(this.settings.uncompletedTasksStatuses)
				let tasks = listItems.filter(l => l.task && allTasksStatuses.includes(l.task))

				if (tasks.length == 0 && 
					(tasksVal === null || tasksVal === undefined) && 
					(completedVal === null || completedVal === undefined) && 
					(uncompletedVal === null || uncompletedVal === undefined)) {
					return
				}

				if (tasksVal !== undefined) {
					let tasksNum = tasks.length
					if (tasksNum != tasksVal) {
						if (file instanceof TFile) {
							await this.app.fileManager.processFrontMatter(file, fm => {
								fm[tasksProp] = tasksNum
							})
						}
					}
				}

				if (completedVal !== undefined) {
					let completed = tasks.filter(t => t.task && this.settings.completedTasksStatuses.includes(t.task))
					let completedNum = completed.length
					if (completedNum != completedVal) {
						if (file instanceof TFile) {
							await this.app.fileManager.processFrontMatter(file, fm => {
								fm[completedProp] = completedNum
							})
						}
					}
				}

				if (uncompletedVal !== undefined) {
					let uncompleted = tasks.filter(t => t.task && this.settings.uncompletedTasksStatuses.includes(t.task))
					let uncompletedNum = uncompleted.length
					if (uncompletedNum != uncompletedVal) {
						if (file instanceof TFile) {
							await this.app.fileManager.processFrontMatter(file, fm => {
								fm[uncompletedProp] = uncompletedNum
							})
						}
					}
				}


				
				
			}
		}
	}


	async updateCoverImages(view: MarkdownView, frontmatter: FrontMatterCache | undefined) {
		//@ts-ignore
		let mdEditor = view.metadataEditor
		let mdContainer = mdEditor.containerEl
		let coverVal

		let props = [...this.settings.extraCoverProperties]
		props.unshift(this.settings.coverProperty)

		for (let prop of props) {
			coverVal = frontmatter?.[prop]
			if (coverVal) break
		}
		let cssVal = frontmatter?.cssclasses

		if (mdContainer instanceof HTMLElement) {
			let coverDiv
			let oldCoverDiv = mdContainer.querySelector(".metadata-side-image")

			if (coverVal && this.settings.enableCover) {
				if (coverVal.startsWith("http")) coverVal = "![](" + coverVal + ")"
				if (!coverVal.startsWith("!")) coverVal = "!" + coverVal
				coverDiv = document.createElement("div");
				coverDiv.classList.add("metadata-side-image")

				
			
				if (cssVal && cssVal.includes("cover-vertical")) {
				coverDiv.classList.add("vertical")
				}
	
				else if (cssVal && cssVal.includes("cover-horizontal")) {
				coverDiv.classList.add("horizontal")
				}
	
				else if (cssVal && cssVal.includes("cover-square")) {
				coverDiv.classList.add("square")
				}

				else if (cssVal && cssVal.includes("cover-circle")) {
				coverDiv.classList.add("circle")
				}
	
				else {
				coverDiv.classList.add("vertical")
				}
	
				let coverTemp = document.createElement("div");
				MarkdownRenderer.render(this.app, coverVal, coverTemp, "", this);
				let image = coverTemp.querySelector("img")
				if (image) {
					coverDiv.append(image)
				}
			}
			
			if (coverDiv) {
				if (oldCoverDiv) {
					if (coverDiv.outerHTML != oldCoverDiv.outerHTML) {
					oldCoverDiv.remove()
					mdContainer.prepend(coverDiv)
					}
				} else {
					mdContainer.prepend(coverDiv)
				}
			} else {
				if (oldCoverDiv) oldCoverDiv.remove()
			}
		}
	}


	async updateBannerImages(view: MarkdownView, frontmatter: FrontMatterCache | undefined) {
		let contentEl = view.contentEl
		let bannerContainer
		let mode = view.getMode()

		if (mode == "preview") {
			bannerContainer = contentEl.querySelector(".markdown-preview-view")
		}

		if (mode == "source") {
			bannerContainer = contentEl.querySelector(".cm-scroller")
		}

		let bannerVal = frontmatter?.[this.settings.bannerProperty]
		

		if (bannerContainer instanceof HTMLElement) {

			let oldBannerDiv = bannerContainer.querySelector(".banner-image")
			let bannerDiv = document.createElement("div");
			bannerDiv.classList.add("banner-image")

			if (bannerVal && this.settings.enableBanner) {
				if (bannerVal.startsWith("http")) bannerVal = "![](" + bannerVal + ")"
				if (!bannerVal.startsWith("!")) bannerVal = "!" + bannerVal
				let bannerTemp = document.createElement("div");
				MarkdownRenderer.render(this.app, bannerVal, bannerTemp, "", this);
				let image = bannerTemp.querySelector("img")
				if (image) {
					bannerDiv.append(image)
				}
			}

			if (oldBannerDiv) {
				if (oldBannerDiv.outerHTML != bannerDiv.outerHTML) {
					oldBannerDiv.remove();
					bannerContainer.prepend(bannerDiv)
				}
			} else {
				bannerContainer.prepend(bannerDiv)
			}
		}
	}









	async updateIcons(view: MarkdownView, frontmatter: FrontMatterCache | undefined) {
		let contentEl = view.contentEl
		let iconContainer
		let mode = view.getMode()

		if (mode == "preview") {
			iconContainer = contentEl.querySelector(".markdown-preview-view")
		}

		if (mode == "source") {
			iconContainer = contentEl.querySelector(".cm-scroller")
		}

		let iconVal = frontmatter?.[this.settings.iconProperty]
		

		if (iconContainer instanceof HTMLElement) {

			let oldIconDiv = iconContainer.querySelector(".icon-wrapper")
			let iconDiv = document.createElement("div");
			iconDiv.classList.add("icon-wrapper")

			if (iconVal && this.settings.enableIcon) {

				

				let image: HTMLDivElement | HTMLImageElement | SVGSVGElement | null = getIcon(iconVal)

				if (!image) {
					let iconLink = iconVal
					if (iconLink.startsWith("http")) iconLink = "![](" + iconLink + ")"
					if (!iconLink.startsWith("!")) iconLink = "!" + iconLink
					let iconTemp = document.createElement("div");
					MarkdownRenderer.render(this.app, iconLink, iconTemp, "", this);
					image = iconTemp.querySelector("img")
				}

				if (!image) {
					image = document.createElement("div")
					image.classList.add("pp-text-icon")
					let symbolArr = [...iconVal]
					let iconSymbol = symbolArr[0] 
					image.append(iconSymbol)
				}


				
				if (image) {
					image.classList.add("pp-icon")
					let iconSizer = iconDiv.createEl("div", {cls: "icon-sizer"})
					let iconImage = iconSizer.createEl("div", {cls: "icon-image"})
					iconImage.append(image)
				}
			}

			if (oldIconDiv) {
				if (oldIconDiv.outerHTML != iconDiv.outerHTML) {
					oldIconDiv.remove();
					iconContainer.prepend(iconDiv)
				}
			} else {
				iconContainer.prepend(iconDiv)
			}
		}
	}







	async updateViewProgress(view: View) {

		let cache
		if (view instanceof FileView && view.file) {
			cache = this.app.metadataCache.getFileCache(view.file)
		}
		let frontmatter = cache?.frontmatter



		//@ts-ignore
		let mdEditor = view.metadataEditor;
		let mdContainer = mdEditor.containerEl;

		if (mdContainer instanceof HTMLElement) {
			let oldProgresses = mdContainer.querySelectorAll(".metadata-property > .metadata-progress-wrapper")
			for (let oldProgress of oldProgresses) {
				oldProgress.remove()
			}
		}
		
		let props = Object.keys(this.settings.progressProperties)

		for (let prop of props) {
			let progressVal = frontmatter?.[prop]
			
			if (progressVal !== undefined && mdContainer instanceof HTMLElement) {
			let propertyKeyEl = mdContainer.querySelector(".metadata-property[data-property-key='" + prop + "'] > .metadata-property-key")

				if (propertyKeyEl instanceof HTMLElement) {
					let maxVal

					if (this.settings.progressProperties[prop].maxNumber) {
					maxVal = this.settings.progressProperties[prop].maxNumber
					} else {
						let maxProperty = this.settings.progressProperties[prop].maxProperty
						maxVal = frontmatter?.[maxProperty];
					}

					if (maxVal) {
					let progressWrapper = document.createElement("div")
					progressWrapper.classList.add("metadata-progress-wrapper")

					let progress = document.createElement("progress")
					progress.classList.add("metadata-progress")
					progress.max = maxVal
					progress.value = progressVal || 0

					let percent = " " + Math.round(progress.value * 100 / progress.max) + " %"
					setTooltip(progress, percent, {delay: 1, placement: "top"})

					progressWrapper.append(progress)
					propertyKeyEl.after(progressWrapper)
					}
				}
			}
		}
	}





	async addClassestoProperties(view: View) {
		let container = view.containerEl;
		
		let pills = container.querySelectorAll(".multi-select-pill:not([data-property-pill-value])")
		for (let pill of pills) {
			let content = pill.querySelector(".multi-select-pill-content")
			if (content instanceof HTMLElement) {
				let value = content.innerText
				pill.setAttribute("data-property-pill-value", value)
			}
		}
	}



	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}




