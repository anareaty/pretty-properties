import {  
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
	FrontMatterCache
 } from 'obsidian';
import MenuManager from 'src/MenuManager';
import { i18n } from './localization';
import PPSettingTab from './settings';
import { PPPluginSettings, DEFAULT_SETTINGS } from './settings';
import { ImageSuggestModal } from './modal';




export default class PrettyPropertiesPlugin extends Plugin {
	settings: PPPluginSettings;

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
		this.updateCoverStyles()


		


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



		
		if (Platform.isMobile) {
			this.registerDomEvent(document, "contextmenu", (e: MouseEvent) => {
				if (e.target instanceof HTMLElement && 
				e.target.closest(".multi-select-pill")) {
				  this.handlePillMenu(e.target)
				}
			});


			this.registerDomEvent(document, "touchstart", (e: TouchEvent) => {
				if ((e.target instanceof HTMLElement || 
				e.target instanceof SVGElement) && 
				e.target.closest(".metadata-property-icon")) {
				  this.handlePropertyMenu(e.target)
				}
			});



		} else {
			this.registerDomEvent(document, "mousedown", (e: MouseEvent) => {

				let targetEl = e.target
				if (e.button == 2 && targetEl instanceof HTMLElement) { 

					

					if (targetEl.closest(".multi-select-pill")) {
						this.handlePillMenu(targetEl)
					}



					





				}
				
				if ((e.target instanceof HTMLElement || 
				  e.target instanceof SVGElement) && 
				  e.target.closest(".metadata-property-icon")) {
					this.handlePropertyMenu(e.target)
				}
			  });
		}



		this.registerDomEvent(document, "click", (e: MouseEvent) => {

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




		this.registerDomEvent(document, "contextmenu", (e: MouseEvent) => {
			let targetEl = e.target
			if (targetEl instanceof HTMLElement) {
				if (targetEl.closest(".banner-image")) {
						this.createBannerMenu(e)
					}

					if (targetEl.closest(".metadata-side-image")) {
						this.createCoverMenu(e)
					}
				
			}
		})





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
                this.selectBannerImage()
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
						this.selectCoverImage(propName)
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


	createBannerMenu(e: MouseEvent) {
		let propName = this.settings.bannerProperty

		let menuManager = new MenuManager()

		menuManager.addItemAfter(['clipboard'], (item: MenuItem) => item
			.setTitle(i18n.t("SELECT_BANNER_IMAGE"))
			.setIcon('lucide-image-plus')
			.setSection('pretty-properties')
			.onClick(async () => {
				this.selectBannerImage()
			})
		);


		if (this.settings.hiddenProperties.find(p => p == propName)) {
			menuManager.addItemAfter(['clipboard'], (item: MenuItem) => item
			.setTitle(i18n.t("UNHIDE_BANNER_PROPERTY"))
			.setIcon('lucide-eye')
			.setSection('pretty-properties')
			.onClick(() => {
				if (propName) this.settings.hiddenProperties.remove(propName)
				this.saveSettings()
				this.updateHiddenProperties()			
			})
		);
				
		}
	}


	async selectBannerImage() {
		let propName = this.settings.bannerProperty
		let file = this.app.workspace.getActiveFile()
		if (file instanceof TFile) {

			let bannerFolder = this.settings.bannersFolder
			
			let files = this.app.vault.getFiles()

			let formats = ["avif", "bmp", "gif", "jpeg", "jpg", ".png", "svg", "webp"]

			files = files.filter(f => formats.find(e => e == f.extension))
			
			let bannerFiles = files
			if (bannerFolder) {
				bannerFiles = files.filter(f => f.parent!.path == bannerFolder || f.parent!.path.startsWith(bannerFolder + "/"))
			}
			
			let bannerPaths = bannerFiles.map(f => f.path)
			let bannerNames = bannerFiles.map(f => f.basename)
			let bannerPath = await this.imageSuggester(this, "banner", bannerPaths, bannerNames)

			if (bannerPath) {
				let bannerFile = this.app.vault.getAbstractFileByPath(bannerPath)
				if (bannerFile instanceof TFile) {
					let bannerLink = this.app.fileManager.generateMarkdownLink(bannerFile, "").replace(/^\!/, "")
				
					this.app.fileManager.processFrontMatter(file, fm => {
						fm[propName] = bannerLink
					})
				}
			}
		}
	}






	async selectCoverImage(propName: string) {
		let file = this.app.workspace.getActiveFile()
		if (file instanceof TFile) {

			let coverFolder = this.settings.coversFolder
			let files = this.app.vault.getFiles()
			let formats = ["avif", "bmp", "gif", "jpeg", "jpg", ".png", "svg", "webp"]
			files = files.filter(f => formats.find(e => e == f.extension))
			
			let coverFiles = files
			if (coverFolder) {
				coverFiles = files.filter(f => f.parent!.path == coverFolder || f.parent!.path.startsWith(coverFolder + "/"))
			}

			let coverPaths = coverFiles.map(f => f.path)
			let coverNames = coverFiles.map(f => f.basename)
			let coverPath = await this.imageSuggester(this, "cover", coverPaths, coverNames)

			if (coverPath) {
				let coverFile = this.app.vault.getAbstractFileByPath(coverPath)
				if (coverFile instanceof TFile) {
					let coverLink = this.app.fileManager.generateMarkdownLink(coverFile, "").replace(/^\!/, "")
				
					this.app.fileManager.processFrontMatter(file, fm => {
						fm[propName] = coverLink
					})
				}
			}
		}
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
						this.selectCoverImage(propName)
					})
				);




				menu.addItem((item: MenuItem) => item
					.setTitle(i18n.t("SELECT_COVER_SHAPE"))
					.setIcon('lucide-shapes')
					.setSection('pretty-properties')
					.onClick(async () => {
						this.selectCoverShape(file)
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
					})
				)}

				menu.showAtMouseEvent(e)
			}
		}
	}




	async selectCoverShape(file: TFile) {
		let shapes = ["vertical", "horizontal", "square", "circle"]
		let shape = await this.imageSuggester(this, "text", shapes)

		if (shape) {
			this.app.fileManager.processFrontMatter(file, fm => {
				let cssclasses = fm.cssclasses || []
				cssclasses = cssclasses.filter((c: string) => !shapes.find(s => c == "cover-" + s))
				cssclasses.push("cover-" + shape)
				fm.cssclasses = cssclasses
			})
		}

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






	async imageSuggester(plugin: PrettyPropertiesPlugin, shape: string, values: string[], names?: string[]) {
		let data: Promise<string|undefined> = new Promise((resolve, reject) => {
			new ImageSuggestModal(plugin.app, plugin, resolve, reject, shape, values, names).open()  
		})
		return data
	}



	handlePropertyMenu(el: HTMLElement | SVGElement) {
		let propEl = el.closest(".metadata-property");
		if (propEl instanceof HTMLElement) {
			let propName = propEl?.getAttribute("data-property-key")

			if (propName) {

				let menuManager = new MenuManager()

				if (this.settings.hiddenProperties.find(p => p == propName)) {

					menuManager.addItemAfter(['clipboard'], (item: MenuItem) => item
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

					menuManager.addItemAfter(['clipboard'], (item: MenuItem) => item
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

					menuManager.addItemAfter(["clipboard"], (item: MenuItem) => item
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
						menuManager.addItemAfter(["clipboard"], (item: MenuItem) => item
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


					menuManager.addItemAfter(["clipboard"], (item: MenuItem) => {item
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
					

					menuManager.addItemAfter(["clipboard"], (item: MenuItem) => item
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
				menuManager.addItemAfter(['clipboard'], (item: MenuItem) => {
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
			"--pill-background: rgba(var(--pill-color-rgb), 0.2); \n--pill-background-hover: rgba(var(--pill-color-rgb), 0.3);}\n"
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
			//@ts-ignore
			if (this.app.isMobile) {
				bannerHeight = this.settings.bannerHeightMobile
			} else {
				bannerHeight = this.settings.bannerHeight
			}

			let styleText = "body {\n" + 
			"--banner-height: " + bannerHeight + "px;\n" +
			"--banner-margin: " + this.settings.bannerMargin + "px;\n" +
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
	}

	async updateLeafElements(view: MarkdownView, cache?: CachedMetadata | null) {
		this.addClassestoProperties(view)
		if (!cache && view.file) {
			cache = this.app.metadataCache.getFileCache(view.file)
		}
		let frontmatter
		if (cache) {
			frontmatter = cache.frontmatter
		}

		this.updateCoverImages(view, frontmatter)
		this.updateBannerImages(view, frontmatter)
		this.updateProgressBars(view, frontmatter)
		if (cache && frontmatter) {
			this.updateTasksCount(view, cache)
		}
		
	}


	async updateTasksCount(view: MarkdownView, cache: CachedMetadata) {
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
							this.app.fileManager.processFrontMatter(file, fm => {
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
							this.app.fileManager.processFrontMatter(file, fm => {
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
							this.app.fileManager.processFrontMatter(file, fm => {
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


	async updateProgressBars(view: MarkdownView, frontmatter: FrontMatterCache | undefined) {
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


	async addClassestoProperties(view: MarkdownView) {
		//@ts-ignore
		let mdEditor = view.metadataEditor;
		if (mdEditor) {
			let container = mdEditor.containerEl;
			let pills = container.querySelectorAll(".multi-select-pill:not([data-property-pill-value])")
			for (let pill of pills) {
				let content = pill.querySelector(".multi-select-pill-content")
				if (content instanceof HTMLElement) {
					let value = content.innerText
					pill.setAttribute("data-property-pill-value", value)
				}
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




