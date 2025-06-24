import { App, Menu, getLanguage, setTooltip, CachedMetadata, MarkdownRenderer, MarkdownView, Notice, Plugin, PluginSettingTab, Setting, TFile, MenuItem } from 'obsidian';
import MenuManager from 'src/MenuManager';
import { i18n } from './localization';


interface PPPluginSettings {
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
}

const DEFAULT_SETTINGS: PPPluginSettings = {
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
	progressProperties: {}
}

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
				this.updateSideImages()
				this.updateProgressBars();
				this.updateBanners()
				this.addClassestoProperties()
			})
		);


		this.registerEvent(
			this.app.workspace.on("file-open", async (file) => {
				this.updateSideImages(file);
				this.updateProgressBars(file);
				this.updateBanners(file);
				this.addClassestoProperties();
			})
		);

		
		this.registerEvent(
			this.app.metadataCache.on("changed", async (file, data, cache) => {
				this.updateSideImages(file, cache)
				this.updateProgressBars(file, cache);
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
            name: i18n.t("HIDE_SHOW_HIDDEN_PROPERTIES"),
            callback: async () => {
                document.body.classList.toggle("show-hidden-properties")
            }
        })
	
		this.addSettingTab(new SampleSettingTab(this.app, this));
	}

	onunload() {
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
						.setIcon('lucide-image-plus')
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
						.setIcon('lucide-image-plus')
						.setSection('pretty-properties')
						.onClick(() => {
							if (propName) this.settings.hiddenProperties.push(propName)
							this.saveSettings()
							this.updateHiddenProperties()
						})
					);
				}


				//@ts-ignore
				let propertyType = this.app.metadataTypeManager.getPropertyInfo(propName.toLowerCase()).type

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
						this.updateProgressBars();
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
								this.updateProgressBars();
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
						let numberProperties = Object.keys(properties).filter(p => properties[p].type == "number").map(p => properties[p].name)

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
										this.updateProgressBars();
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
							this.updateProgressBars();
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




	updateSideImages(changedFile?: TFile | null, cache?: CachedMetadata | null) {

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
				let coverProp

				let props = [...this.settings.extraCoverProperties]
				props.unshift(this.settings.coverProperty)

				for (let prop of props) {
					coverProp = mdEditor.properties.find((p: any) => p.key == prop)
					if (coverProp) break
				}



				let cssProp = mdEditor.properties.find((p: any) => p.key == "cssclasses")

				if (coverProp) {
					coverVal = coverProp.value
					if (cssProp) {
						cssVal = cssProp.value
					}
				} else {
					if (leaf.view.file instanceof TFile) {
						let cache = this.app.metadataCache.getFileCache(leaf.view.file)

						for (let prop of props) {
					        coverVal = cache?.frontmatter?.[prop]
					        if (coverVal) break
						}
						
						cssVal = cache?.frontmatter?.cssclasses
					}
				}

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
		}
	}



	updateProgressBars(changedFile?: TFile | null, cache?: CachedMetadata | null) {
	
		let leaves = this.app.workspace.getLeavesOfType("markdown");
		for (let leaf of leaves) {
		  if (leaf.view instanceof MarkdownView) {
			if (changedFile && leaf.view.file && leaf.view.file.path != changedFile.path) {
			  continue;
			}
	
			//@ts-ignore
			let mdEditor = leaf.view.metadataEditor;
			let mdContainer = mdEditor.containerEl;
	
			if (mdContainer instanceof HTMLElement) {
				let oldProgresses = mdContainer.querySelectorAll(".metadata-property > .metadata-progress-wrapper")
				for (let oldProgress of oldProgresses) {
					oldProgress.remove()
				}
			}
			
			let props = Object.keys(this.settings.progressProperties)
	
			for (let prop of props) {
			  let progressProp = mdEditor.properties.find((p: any) => p.key == prop)
			  let progressVal 
	
			  if (progressProp) {
				progressVal = progressProp.value;
			  } else {
				if (leaf.view.file instanceof TFile) {
				  let cache = this.app.metadataCache.getFileCache(leaf.view.file);
				  progressVal = cache?.frontmatter?.[progressProp]
				}
			  }
	
			  if (progressVal !== undefined && mdContainer instanceof HTMLElement) {
				let propertyKeyEl = mdContainer.querySelector(".metadata-property[data-property-key='" + prop + "'] > .metadata-property-key")
	
				if (propertyKeyEl instanceof HTMLElement) {
				  let maxVal
	
				  if (this.settings.progressProperties[prop].maxNumber) {
					maxVal = this.settings.progressProperties[prop].maxNumber
				  } else {
					let maxProperty = this.settings.progressProperties[prop].maxProperty
					let maxProp = mdEditor.properties.find((p: any) => p.key == maxProperty)
					
					if (maxProp) {
					  maxVal = maxProp.value;
					} else {
					  if (leaf.view.file instanceof TFile) {
						let cache = this.app.metadataCache.getFileCache(leaf.view.file);
						maxVal = cache?.frontmatter?.[maxProperty];
					  }
					} 
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
		}
	  }





	updateBanners(changedFile?: TFile | null, cache?: CachedMetadata | null) {
		
		let leaves = this.app.workspace.getLeavesOfType("markdown")

		for (let leaf of leaves) {

			if (leaf.view instanceof MarkdownView) {
				if(changedFile && leaf.view.file && leaf.view.file.path != changedFile.path) {
					continue
				}

				let contentEl = leaf.view.contentEl

				//@ts-ignore
				let mdEditor = leaf.view.metadataEditor
				let bannerContainer
				let mode = leaf.view.getMode()

				if (mode == "preview") {
					bannerContainer = contentEl.querySelector(".markdown-preview-view")
				}

				if (mode == "source") {
					bannerContainer = contentEl.querySelector(".cm-scroller")
				}

				let bannerVal

				let bannerProp = mdEditor.properties.find((p: any) => p.key == this.settings.bannerProperty)

				if (bannerProp) {
					bannerVal = bannerProp.value
				} else {
					if (leaf.view.file instanceof TFile) {
						let cache = this.app.metadataCache.getFileCache(leaf.view.file)
						bannerVal = cache?.frontmatter?.[this.settings.bannerProperty]
					}
				}


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
		}
	}


	addClassestoProperties() {
		let leaves = this.app.workspace.getLeavesOfType("markdown")
		for (let leaf of leaves) {

		//@ts-ignore
		let mdEditor = leaf.view.metadataEditor;
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
	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}



class SampleSettingTab extends PluginSettingTab {
	plugin: PrettyPropertiesPlugin;

	constructor(app: App, plugin: PrettyPropertiesPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const {containerEl} = this;

		containerEl.empty();

		new Setting(containerEl)
			.setName(i18n.t("ENABLE_BANNER"))
			.addToggle(toggle => toggle
				.setValue(this.plugin.settings.enableBanner)
				.onChange(async (value) => {
					this.plugin.settings.enableBanner = value
					await this.plugin.saveSettings();
					this.display();
					this.plugin.updateBanners();
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
				    this.plugin.updateBanners();
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


		new Setting(containerEl)
			.setName(i18n.t("ENABLE_COVER"))
			.addToggle(toggle => toggle
				.setValue(this.plugin.settings.enableCover)
				.onChange(async (value) => {
					this.plugin.settings.enableCover = value
					await this.plugin.saveSettings();
					this.display();
					this.plugin.updateSideImages()
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
					this.plugin.updateSideImages()
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
						this.plugin.updateSideImages()
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
					this.plugin.updateHiddenProperties()
					this.plugin.updatePillColors()
					this.plugin.updateBanners()
					this.plugin.updateBannerStyles()
					this.plugin.updateCoverStyles()
					this.plugin.updateSideImages()
					this.display();
					
					new Notice(i18n.t("CLEAR_SETTINGS_NOTICE"))

				}))
	}
}
