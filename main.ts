import { App, TextFileView , FileView , EditableFileView , CachedMetadata, MarkdownRenderer, Editor, MarkdownView, Modal, Notice, Plugin, PluginSettingTab, Setting, TFile, MenuItem } from 'obsidian';


import MenuManager from 'MenuManager';






// Remember to rename these classes and interfaces!

interface MyPluginSettings {
	mySetting: string;
	hiddenProperties: string[];
	propertyPillColors: any
}

const DEFAULT_SETTINGS: MyPluginSettings = {
	mySetting: 'default',
	hiddenProperties: [],
	propertyPillColors: {}
}

export default class MyPlugin extends Plugin {
	settings: MyPluginSettings;
	menuManager: any

	async onload() {
		await this.loadSettings();


		this.updateHiddenProperties()
		this.updatePillColors()



		this.registerEvent(
			this.app.workspace.on("layout-change", async () => {
				this.updateSideImages(null, null)
				this.updateBanners(null, null)
				this.addClassestoProperties()
			})
		);


		this.registerEvent(
			this.app.workspace.on("file-open", async (file) => {
				this.updateSideImages(file, null);
				this.updateBanners(file, null);
				this.addClassestoProperties();
			})
		);

		

		this.registerEvent(
			this.app.metadataCache.on("changed", async (file, data, cache) => {
				this.updateSideImages(file, cache)
				this.updateBanners(file, cache)
				this.addClassestoProperties()
			})
		);



		//@ts-ignore
		if (this.app.isMobile) {
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
				if (e.button == 2 && e.target instanceof HTMLElement && 
				  e.target.closest(".multi-select-pill")) {
					this.handlePillMenu(e.target)
				}
				
				if ((e.target instanceof HTMLElement || 
				  e.target instanceof SVGElement) && 
				  e.target.closest(".metadata-property-icon")) {
					this.handlePropertyMenu(e.target)
				}
			  });
		}




		this.addCommand({
            id: "toggle-hidden-properties",
            name: "Показать / спрятать скрытые свойства",
            callback: async () => {
                document.body.classList.toggle("show-hidden-properties")
            }
        })
	


		this.addSettingTab(new SampleSettingTab(this.app, this));
	}

	onunload() {

	}

	addCommandToPropertyMenu(e: MouseEvent) {
		if (e.target instanceof HTMLElement || e.target instanceof SVGElement) {
			e.stopPropagation()
		let propEl = e.target.closest(".metadata-property")

		
		}
		
	}

	addCommandToPillMenu(e: MouseEvent) {}




	handlePropertyMenu(el: HTMLElement | SVGElement) {
		let propEl = el.closest(".metadata-property");
		if (propEl instanceof HTMLElement) {
			let propName = propEl?.getAttribute("data-property-key")

			if (propName) {

				let menuManager = new MenuManager()

				if (this.settings.hiddenProperties.find(p => p == propName)) {

					menuManager.addItemAfter(['clipboard'], (item: MenuItem) => item
						.setTitle("Не скрывать свойство")
						.setIcon('lucide-image-plus')
						.setSection('pretty-properties')
						.onClick(() => {
							this.settings.hiddenProperties.remove(propName)
							this.saveSettings()
							this.updateHiddenProperties()
						})
					);

				} else {

					menuManager.addItemAfter(['clipboard'], (item: MenuItem) => item
						.setTitle("Скрыть свойство")
						.setIcon('lucide-image-plus')
						.setSection('pretty-properties')
						.onClick(() => {
							this.settings.hiddenProperties.push(propName)
							this.saveSettings()
							this.updateHiddenProperties()
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
					item.setTitle("Выбрать цвет")
					.setSection('pretty-properties')

					//@ts-ignore
					let sub = item.setSubmenu() as Menu
					let colors = ["red", "orange", "yellow", "green", "cyan", "blue", "purple", "pink", "none"]

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


						item.setTitle(color)
						.onClick(() => {
							this.settings.propertyPillColors[pillVal] = color
							this.saveSettings()
							this.updatePillColors()
						})
					})
					}
				});
			}
		}
	}



	addCommandsToMenus(e: MouseEvent) {
		if ((e.target instanceof HTMLElement || e.target instanceof SVGElement) && 
			e.target.closest(".metadata-property-key")) {
			
		}

		if (e.target instanceof HTMLElement && e.target.closest(".multi-select-pill")) {
			e.stopPropagation()

			let menuManager = new MenuManager()

			let pillEl = e.target.closest(".multi-select-pill")

			if (pillEl instanceof HTMLElement) {
				let pillVal = pillEl?.getAttribute("data-property-pill-value")

				if (pillVal) {

					menuManager.addItemAfter(['clipboard'], (item: MenuItem) => {
						item.setTitle("Выбрать цвет")
						.setSection('pretty-properties')

						//@ts-ignore
						let sub = item.setSubmenu() as Menu

						let colors = ["red", "orange", "yellow", "green", "cyan", "blue", "purple", "pink", "none"]

						for (let color of colors) {
							sub.addItem((item: MenuItem) => {
							item.setTitle(color)
							.onClick(() => {
								this.settings.propertyPillColors[pillVal] = color
								this.saveSettings()
								this.updatePillColors()
							})
						})
						}

						
					}



						
					);

				}
			}
		
				
		}
	}




	updateHiddenProperties() {
		let styleText = ""
		for (let prop of this.settings.hiddenProperties) {
			styleText = styleText + "body:not(.show-hidden-properties) .metadata-property[data-property-key='" + prop + "'] {display: none;}\n"
		}

		let oldStyle = document.head.querySelector("style#hide-properties")
		if (oldStyle) oldStyle.remove()


		const style = document.createElement("style")
		style.textContent = styleText
		style.id = "hide-properties"
		document.head.appendChild(style)
	}


	updatePillColors() {

		let styleText = ""
		for (let prop in this.settings.propertyPillColors) {
			styleText = styleText + "[data-property-pill-value='" + prop + "'] {" + 
			"--pill-color-rgb: var(--color-" + this.settings.propertyPillColors[prop] + "-rgb); \n" + 
			"--pill-background: rgba(var(--pill-color-rgb), 0.2); \n--pill-background-hover: rgba(var(--pill-color-rgb), 0.3);}\n"
		}

		let oldStyle = document.head.querySelector("style#pill-colors")
		if (oldStyle) oldStyle.remove()


		const style = document.createElement("style")
		style.textContent = styleText
		style.id = "pill-colors"
		document.head.appendChild(style)

	}



	updateSideImages(changedFile: TFile | null, cache: CachedMetadata | null) {

		let leaves = this.app.workspace.getLeavesOfType("markdown")

		for (let leaf of leaves) {

		if (leaf.view instanceof MarkdownView) {
			if(changedFile && leaf.view.file && leaf.view.file.path != changedFile.path) {
				continue
			}
	
			//@ts-ignore
			let mdEditor = leaf.view.metadataEditor
			let mdContainer = mdEditor.containerEl


			let coverVal
			let cssVal

			let coverProp = mdEditor.properties.find((p: any) => p.key == "cover")
			let cssProp = mdEditor.properties.find((p: any) => p.key == "cssclasses")

			if (coverProp) {
				coverVal = coverProp.value
				if (cssProp) {
					cssVal = cssProp.value
				}
			} else {
				if (leaf.view.file instanceof TFile) {
					let cache = this.app.metadataCache.getFileCache(leaf.view.file)
					coverVal = cache?.frontmatter?.cover
					cssVal = cache?.frontmatter?.cssclasses
				}
			}

			let coverDiv
			let oldCoverDiv = mdContainer.querySelector(".metadata-side-image")

			if (coverVal) {
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
	}
















	updateBanners(changedFile: TFile | null, cache: CachedMetadata | null) {
		
		let leaves = this.app.workspace.getLeavesOfType("markdown")

		for (let leaf of leaves) {

			if (leaf.view instanceof MarkdownView) {
				if(changedFile && leaf.view.file && leaf.view.file.path != changedFile.path) {
					continue
				}

				let contentEl = leaf.view.contentEl

				//@ts-ignore
				let mdEditor = leaf.view.metadataEditor
				let mdContainer = mdEditor.containerEl
				let mode = leaf.view.getMode()

				if (mode == "preview") {
					mdContainer = contentEl.querySelector(".markdown-preview-view")
				}

				if (mode == "source") {
					mdContainer = contentEl.querySelector(".cm-scroller")
				}


				let bannerVal

				let bannerProp = mdEditor.properties.find((p: any) => p.key == "banner")

				if (bannerProp) {
					bannerVal = bannerProp.value
				} else {
					if (leaf.view.file instanceof TFile) {
						let cache = this.app.metadataCache.getFileCache(leaf.view.file)
						bannerVal = cache?.frontmatter?.banner
					}
				}

				let bannerDiv = document.createElement("div");
				bannerDiv.classList.add("banner-image")

				let oldBannerDiv = mdContainer.querySelector(".banner-image")
				

				if (bannerVal) {
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
						mdContainer.prepend(bannerDiv);
					}
				} else {
					mdContainer.prepend(bannerDiv)
				}

			}
		}
	}







	
	
	
	
	
	
		addClassestoProperties() {
		  let leaves = this.app.workspace.getLeavesOfType("markdown")
		  for (let leaf of leaves) {

			//@ts-ignore
			let mdEditor = leaf.view.metadataEditor;
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



class SampleSettingTab extends PluginSettingTab {
	plugin: MyPlugin;

	constructor(app: App, plugin: MyPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const {containerEl} = this;

		containerEl.empty();

		new Setting(containerEl)
			.setName('Setting #1')
			.setDesc('It\'s a secret')
			.addText(text => text
				.setPlaceholder('Enter your secret')
				.setValue(this.plugin.settings.mySetting)
				.onChange(async (value) => {
					this.plugin.settings.mySetting = value;
					await this.plugin.saveSettings();
				}));
	}
}
