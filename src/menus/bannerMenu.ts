import { Menu, MenuItem } from "obsidian";
import PrettyPropertiesPlugin from "src/main";
import { i18n } from "src/localization/localization";
import { updateHiddenProperties } from "src/updates/updateHiddenProperties";
import { selectBannerPosition } from "src/utils/imageUtils";
import { removeProperty } from "src/utils/propertyUtils";
import { ImageSuggestModal } from "src/modals/imageSuggestModal";





export const handleBannerMenu = (menu: Menu, plugin: PrettyPropertiesPlugin) => {

    let propName = plugin.settings.bannerProperty;
    let positionPropName = plugin.settings.bannerPositionProperty;

    menu.addItem((item: MenuItem) => item
        .setTitle(i18n.t("SELECT_BANNER_IMAGE"))
        .setIcon("image-plus")
        .setSection("pretty-properties")
        .onClick(async () => {
            new ImageSuggestModal(
                plugin.app, 
                plugin, 
                plugin.settings.bannerProperty, 
                plugin.settings.bannersFolder,
                "banner"
            ).open();
    }))

    .addItem((item: MenuItem) => item
        .setTitle(i18n.t("SELECT_BANNER_POSITION"))
        .setIcon("sliders-horizontal")
        .setSection("pretty-properties")
        .onClick(async () => {
            selectBannerPosition(plugin)
    }))

    .addItem((item: MenuItem) => item
        .setTitle(i18n.t("REMOVE_BANNER"))
        .setIcon("image-off")
        .setSection("pretty-properties")
        .onClick(async () => {
            removeProperty(plugin.settings.bannerProperty, plugin);
            removeProperty(plugin.settings.bannerPositionProperty, plugin);
    }))




    let bannerPropHidden = plugin.settings.hiddenProperties.find(p => p == propName)
    let bannerPositionPropHidden = plugin.settings.hiddenProperties.find(p => p == positionPropName)

    if (bannerPropHidden || bannerPositionPropHidden) {
        menu.addItem((item: MenuItem) => item
            .setTitle(i18n.t("UNHIDE_BANNER_PROPERTY"))
            .setIcon("lucide-eye")
            .setSection("pretty-properties")
            .onClick(async () => {
                if (propName && bannerPropHidden) {
                    plugin.settings.hiddenProperties.remove(propName);
                }
                if (positionPropName && bannerPositionPropHidden) {
                    plugin.settings.hiddenProperties.remove(positionPropName);
                }
                    
                await plugin.saveSettings();
                updateHiddenProperties(plugin);
                plugin.settingTab?.update()
        }))
    }


    if (!bannerPropHidden || !bannerPositionPropHidden) {
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


                await plugin.saveSettings();
                updateHiddenProperties(plugin);
                plugin.settingTab?.update()
        }))
    }

   




}