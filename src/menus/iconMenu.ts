import { FrontMatterCache, HSL, Menu, MenuItem, requireApiVersion, TFile } from "obsidian";
import PrettyPropertiesPlugin from "src/main";
import { i18n } from "src/localization/localization";
import { updateHiddenProperties } from "src/updates/updateHiddenProperties";
import { deleteNestedProperty, removeProperty, setNestedProperty } from "src/utils/propertyUtils";
import { IconSuggestModal } from "src/modals/iconSuggestModal";
import { ColorPickerModal } from "src/modals/colorPickerModal";

export const handleIconMenu = (menu: Menu, plugin: PrettyPropertiesPlugin, icon: Element) => {

    let propName = plugin.settings.iconProperty;
    let iconColorLightProperty = plugin.settings.iconColorLightProperty
    let iconColorDarkProperty = plugin.settings.iconColorDarkProperty
    let iconBgProperty = plugin.settings.iconBgProperty
    let inTitle = icon.classList.contains("title-icon-wrapper")
    let hasImage = icon.querySelector("img")

    menu.addItem((item: MenuItem) => item
        .setTitle(i18n.t("SELECT_ICON"))
        .setIcon("lucide-image-plus")
        .setSection("pretty-properties")
        .onClick(async () => {
            new IconSuggestModal(plugin.app, plugin).open();
        }))

    

        

    .addItem((item: MenuItem) => item
        .setTitle(i18n.t("REMOVE_ICON"))
        .setIcon("image-off")
        .setSection("pretty-properties")
        .onClick(async () => {
            removeProperty(plugin.settings.iconProperty, plugin);
        }))


    let iconColorProperty = iconColorLightProperty
    if (document.body.classList.contains("theme-dark")) {
        iconColorProperty = iconColorDarkProperty
    }

    let file = plugin.app.workspace.getActiveFile();

    

    if (file instanceof TFile) {
        let iconColorValue = ""
        let cache = plugin.app.metadataCache.getFileCache(file)
        if (typeof cache?.frontmatter?.[iconColorProperty] == "string") {
            iconColorValue = cache?.frontmatter?.[iconColorProperty] as string
        }
        
        let iconBgValue = cache?.frontmatter?.[iconBgProperty] as unknown


        if (!hasImage) {
            menu.addItem((item: MenuItem) => item
            .setTitle(i18n.t("SELECT_ICON_COLOR"))
            .setIcon("palette")
            .setSection("pretty-properties")
            .onClick(async () => {
                new ColorPickerModal(iconColorValue, (hsl: HSL, hex: string) => {
                    if (file instanceof TFile) {
                        void plugin.app.fileManager.processFrontMatter(file, (fm: FrontMatterCache) => {
                            setNestedProperty(fm, iconColorProperty, hex);
                        });
                    }
                }, plugin).open()
            }))


            if (iconColorValue) {
                menu.addItem((item: MenuItem) => item
                    .setTitle(i18n.t("REMOVE_ICON_COLOR"))
                    .setIcon("x")
                    .setSection("pretty-properties")
                    .onClick(async () => {
                        if (file instanceof TFile) {
                            void plugin.app.fileManager.processFrontMatter(file, (fm: FrontMatterCache) => {
                                deleteNestedProperty(fm, iconColorProperty);
                            });
                        }
                    }))
            }
        }

        



        let needBg = true
        if (iconBgValue === false) {
            needBg = true
        } else if (iconBgValue === true || plugin.settings.iconBackground) {
            needBg = false
        } 

        if (!inTitle) {
            if (needBg) {
                menu.addItem((item: MenuItem) => item
                    .setTitle(i18n.t("SET_ICON_BACKGROUND"))
                    .setIcon("square")
                    .setSection("pretty-properties")
                    .onClick(async () => {
                        if (file instanceof TFile) {
                            await plugin.app.fileManager.processFrontMatter(file, (fm: FrontMatterCache) => {
                                if (plugin.settings.iconBackground) {
                                    deleteNestedProperty(fm, iconBgProperty);
                                } else {
                                    setNestedProperty(fm, iconBgProperty, true);
                                }
                            });

                            //updateHiddenProperties(plugin)
                        }
                    }))
            } else {
                menu.addItem((item: MenuItem) => item
                    .setTitle(i18n.t("REMOVE_ICON_BACKGROUND"))
                    .setIcon("square-x")
                    .setSection("pretty-properties")
                    .onClick(async () => {
                        if (file instanceof TFile) {
                            void plugin.app.fileManager.processFrontMatter(file, (fm: FrontMatterCache) => {
                                if (plugin.settings.iconBackground) {
                                    setNestedProperty(fm, iconBgProperty, false);
                                } else {
                                    deleteNestedProperty(fm, iconBgProperty);
                                }
                            });
                        }
                    }))
            }
        }
        
    }
    
    



    let iconPropHidden = plugin.settings.hiddenProperties.find(p => p.toLowerCase() == propName.toLowerCase())
    let iconColorLightPropHidden = plugin.settings.hiddenProperties.find(p => p.toLowerCase() == iconColorLightProperty.toLowerCase())
    let iconColorDarkPropHidden = plugin.settings.hiddenProperties.find(p => p.toLowerCase() == iconColorDarkProperty.toLowerCase())
    let iconBgPropHidden = plugin.settings.hiddenProperties.find(p => p.toLowerCase() == iconBgProperty.toLowerCase())

    if (iconPropHidden || iconColorLightPropHidden || iconColorDarkPropHidden || iconBgPropHidden) {

        menu.addItem((item: MenuItem) => item
        .setTitle(i18n.t("UNHIDE_ICON_PROPERTY"))
        .setIcon("lucide-eye")
        .setSection("pretty-properties")
        .onClick(async () => {
            if (propName && iconPropHidden) {
                plugin.settings.hiddenProperties = plugin.settings.hiddenProperties.filter(p => p.toLowerCase() != propName.toLowerCase())
            }

            if (iconColorLightProperty && iconColorLightPropHidden) {
                plugin.settings.hiddenProperties = plugin.settings.hiddenProperties.filter(p => p.toLowerCase() != iconColorLightProperty.toLowerCase())
            }

            if (iconColorDarkProperty && iconColorDarkPropHidden) {
                plugin.settings.hiddenProperties = plugin.settings.hiddenProperties.filter(p => p.toLowerCase() != iconColorDarkProperty.toLowerCase())
            }

            if (iconBgProperty && iconBgPropHidden) {
                plugin.settings.hiddenProperties = plugin.settings.hiddenProperties.filter(p => p.toLowerCase() != iconBgProperty.toLowerCase())
            }
                
            
            await plugin.saveSettings();
            updateHiddenProperties(plugin);
            if (requireApiVersion("1.13.0")) {
                plugin.settingTab?.update()			
            }
        }))

    } 
    
    if (!iconPropHidden || !iconColorLightPropHidden || !iconColorDarkPropHidden || !iconBgPropHidden) {
        
        menu.addItem((item: MenuItem) => item
        .setTitle(i18n.t("HIDE_ICON_PROPERTY"))
        .setIcon("lucide-eye-off")
        .setSection("pretty-properties")
        .onClick(async () => {


            if (propName && !iconPropHidden) {
                plugin.settings.hiddenProperties.push(propName)
            }

            if (iconColorLightProperty && !iconColorLightPropHidden) {
                plugin.settings.hiddenProperties.push(iconColorLightProperty)
            }

            if (iconColorDarkProperty && !iconColorDarkPropHidden) {
                plugin.settings.hiddenProperties.push(iconColorDarkProperty)
            }

            if (iconBgProperty && !iconBgPropHidden) {
                plugin.settings.hiddenProperties.push(iconBgProperty)
            }


            await plugin.saveSettings();
            updateHiddenProperties(plugin);
            if (requireApiVersion("1.13.0")) {
                plugin.settingTab?.update()			
            }
        }))
    }
}