import { FrontMatterCache, Menu, MenuItem, requireApiVersion, TFile } from "obsidian";
import PrettyPropertiesPlugin from "src/main";
import { i18n } from "src/localization/localization";
import { updateHiddenProperties } from "src/updates/updateHiddenProperties";
import { selectBannerPosition } from "src/utils/imageUtils";
import { deleteNestedProperty, removeProperty, setNestedProperty } from "src/utils/propertyUtils";
import { ImageSuggestModal } from "src/modals/imageSuggestModal";
import { BannerSuggestModal } from "src/modals/bannerSuggestModal";




export const handleBannerMenu = (menu: Menu, plugin: PrettyPropertiesPlugin) => {

    let propName = plugin.settings.bannerProperty;
    let positionPropName = plugin.settings.bannerPositionProperty;


    menu.addItem((item: MenuItem) => item
        .setTitle(i18n.t("SELECT_BANNER"))
        .setIcon("image-plus")
        .setSection("pretty-properties")
        .onClick(async () => {
            new BannerSuggestModal(plugin.app, plugin).open();
    }))


    .addItem((item: MenuItem) => item
        .setTitle(i18n.t("REMOVE_BANNER"))
        .setIcon("image-off")
        .setSection("pretty-properties")
        .onClick(async () => {
            removeProperty(plugin.settings.bannerProperty, plugin);
            removeProperty(plugin.settings.bannerPositionProperty, plugin);
    }))




    .addItem((item: MenuItem) => item
        .setTitle(i18n.t("SELECT_BANNER_POSITION"))
        .setIcon("sliders-horizontal")
        .setSection("pretty-properties")
        .onClick(async () => {
            selectBannerPosition(plugin)
    }))





    let file = plugin.app.workspace.getActiveFile();
    let fadingProperty = plugin.settings.bannerFadingProperty

    if (file instanceof TFile) {
        let cache = plugin.app.metadataCache.getFileCache(file)
        
        let fadingValue = cache?.frontmatter?.[fadingProperty] as unknown



        let needFade = true

        if (fadingValue === false) {
            needFade = true
        } else if (fadingValue === true || plugin.settings.bannerFading) {
            needFade = false
        } 


        


        if (needFade) {
            menu.addItem((item: MenuItem) => item
                .setTitle(i18n.t("SET_BANNER_FADING"))
                .setIcon("square-dashed")
                .setSection("pretty-properties")
                .onClick(async () => {
                    if (file instanceof TFile) {
                        await plugin.app.fileManager.processFrontMatter(file, (fm: FrontMatterCache) => {
                            if (plugin.settings.bannerFading) {
                                deleteNestedProperty(fm, fadingProperty);
                            } else {
                                setNestedProperty(fm, fadingProperty, true);
                            }
                        });
                    }
                }))
        } else {
            menu.addItem((item: MenuItem) => item
                .setTitle(i18n.t("REMOVE_BANNER_FADING"))
                .setIcon("square-x")
                .setSection("pretty-properties")
                .onClick(async () => {

                    if (file instanceof TFile) {
                        void plugin.app.fileManager.processFrontMatter(file, (fm: FrontMatterCache) => {
                            if (plugin.settings.bannerFading) {
                                setNestedProperty(fm, fadingProperty, false);
                            } else {
                                deleteNestedProperty(fm, fadingProperty);
                            }
                        });
                    }
                }))
        }
        

    }



    

    




    let bannerPropHidden = plugin.settings.hiddenProperties.find(p => p.toLowerCase() == propName.toLowerCase())
    let bannerPositionPropHidden = plugin.settings.hiddenProperties.find(p => p.toLowerCase() == positionPropName.toLowerCase())
    let bannerFadingPropHidden = plugin.settings.hiddenProperties.find(p => p.toLowerCase() == fadingProperty.toLowerCase())

    if (bannerPropHidden || bannerPositionPropHidden || bannerFadingPropHidden) {
        menu.addItem((item: MenuItem) => item
            .setTitle(i18n.t("UNHIDE_BANNER_PROPERTY"))
            .setIcon("lucide-eye")
            .setSection("pretty-properties")
            .onClick(async () => {
                if (propName && bannerPropHidden) {
                    plugin.settings.hiddenProperties = plugin.settings.hiddenProperties.filter(p => p.toLowerCase() != propName.toLowerCase())
                }
                if (positionPropName && bannerPositionPropHidden) {
                    plugin.settings.hiddenProperties = plugin.settings.hiddenProperties.filter(p => p.toLowerCase() != positionPropName.toLowerCase())
                }

                if (fadingProperty && bannerFadingPropHidden) {
                    plugin.settings.hiddenProperties = plugin.settings.hiddenProperties.filter(p => p.toLowerCase() != fadingProperty.toLowerCase())
                }
                    
                await plugin.saveSettings();
                updateHiddenProperties(plugin);
                if (requireApiVersion("1.13.0")) {
                    plugin.settingTab?.update()
                }
                
        }))
    }


    if (!bannerPropHidden || !bannerPositionPropHidden || bannerFadingPropHidden) {
        menu.addItem((item: MenuItem) => item
            .setTitle(i18n.t("HIDE_BANNER_PROPERTY"))
            .setIcon("lucide-eye-off")
            .setSection("pretty-properties")
            .onClick(async () => {

                if (propName && !bannerPropHidden) {
                    plugin.settings.hiddenProperties.push(propName);
                }
                if (positionPropName && !bannerPositionPropHidden) {
                    plugin.settings.hiddenProperties.push(positionPropName);
                }

                if (fadingProperty && !bannerFadingPropHidden) {
                    plugin.settings.hiddenProperties.push(fadingProperty);
                }


                await plugin.saveSettings();
                updateHiddenProperties(plugin);
                if (requireApiVersion("1.13.0")) {
                    plugin.settingTab?.update()
                }
                
        }))
    }

   




}