import { Menu, MenuItem } from "obsidian";
import PrettyPropertiesPlugin from "src/main";
import { i18n } from "src/localization/localization";
import { updateHiddenProperties } from "src/utils/updates/updateHiddenProperties";
import { selectBannerPosition } from "src/utils/imageUtils";
import { removeProperty } from "src/utils/propertyUtils";
import { ImageSuggestModal } from "src/modals/imageSuggestModal";


export const createBannerMenu = (e: MouseEvent, plugin: PrettyPropertiesPlugin) => {

    //@ts-ignore
    let plugins = plugin.app.plugins
    let menuExist = 
        plugins.getPlugin("copy-url-in-preview") || 
        plugins.getPlugin("pixel-perfect-image") 

    let propName = plugin.settings.bannerProperty;


    let selectBannerItem = (item: MenuItem) => item
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
        })

    let selectPositionItem = (item: MenuItem) => item
        .setTitle(i18n.t("SELECT_BANNER_POSITION"))
        .setIcon("sliders-horizontal")
        .setSection("pretty-properties")
        .onClick(async () => {
            selectBannerPosition(plugin)
        })

    let removeBannerItem = (item: MenuItem) => item
        .setTitle(i18n.t("REMOVE_BANNER"))
        .setIcon("image-off")
        .setSection("pretty-properties")
        .onClick(async () => {
            removeProperty(plugin.settings.bannerProperty, plugin);
        })

    let unhideBannerItem = (item: MenuItem) => item
        .setTitle(i18n.t("UNHIDE_BANNER_PROPERTY"))
        .setIcon("lucide-eye")
        .setSection("pretty-properties")
        .onClick(() => {
            if (propName)
                plugin.settings.hiddenProperties.remove(propName);
            plugin.saveSettings();
            updateHiddenProperties(plugin);
        })

    let hideBannerItem = (item: MenuItem) => item
        .setTitle(i18n.t("HIDE_BANNER_PROPERTY"))
        .setIcon("lucide-eye-off")
        .setSection("pretty-properties")
        .onClick(() => {
            if (propName)
                plugin.settings.hiddenProperties.push(propName);
            plugin.saveSettings();
            updateHiddenProperties(plugin);
        })

    if (menuExist) {
        let menuManager = plugin.menuManager
        menuManager.closeAndFlush()
        menuManager.addItemAfter(["system"], i18n.t("SELECT_BANNER_IMAGE"), selectBannerItem);
        menuManager.addItemAfter(["system"], i18n.t("SELECT_BANNER_POSITION"), selectPositionItem);
        menuManager.addItemAfter(["system"], i18n.t("REMOVE_BANNER"), removeBannerItem);
        if (plugin.settings.hiddenProperties.find((p) => p == propName)) {
            menuManager.addItemAfter(["system"], i18n.t("UNHIDE_BANNER_PROPERTY"), unhideBannerItem);
        } else {
            menuManager.addItemAfter(["system"], i18n.t("HIDE_BANNER_PROPERTY"), hideBannerItem);
        }

    } else {
        let menu = new Menu();
        menu.addItem(selectBannerItem);
        menu.addItem(selectPositionItem);
        menu.addItem(removeBannerItem);

        if (plugin.settings.hiddenProperties.find((p) => p == propName)) {
            menu.addItem(unhideBannerItem);
        } else {
            menu.addItem(hideBannerItem);
        }

        menu.showAtMouseEvent(e);
    }
}