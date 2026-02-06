import { Menu, MenuItem } from "obsidian";
import PrettyPropertiesPlugin from "src/main";
import { i18n } from "src/localization/localization";
import { updateHiddenProperties } from "src/utils/updates/updateHiddenProperties";
import { removeProperty } from "src/utils/propertyUtils";
import { IconSuggestModal } from "src/modals/iconSuggestModal";

export const createIconMenu = (e: MouseEvent, plugin: PrettyPropertiesPlugin) => {

    //@ts-ignore
    let plugins = plugin.app.plugins
    let menuExist = 
        plugins.getPlugin("copy-url-in-preview") || 
        plugins.getPlugin("pixel-perfect-image")



    let propName = plugin.settings.iconProperty;

    let selectIconItem = (item: MenuItem) => item
        .setTitle(i18n.t("SELECT_ICON"))
        .setIcon("lucide-image-plus")
        .setSection("pretty-properties")
        .onClick(async () => {
            new IconSuggestModal(plugin.app, plugin).open();
        })
    let removeIconItem = (item: MenuItem) => item
        .setTitle(i18n.t("REMOVE_ICON"))
        .setIcon("image-off")
        .setSection("pretty-properties")
        .onClick(async () => {
            removeProperty(plugin.settings.iconProperty, plugin);
        })
    let unhideIconItem = (item: MenuItem) => item
        .setTitle(i18n.t("UNHIDE_ICON_PROPERTY"))
        .setIcon("lucide-eye")
        .setSection("pretty-properties")
        .onClick(() => {
            if (propName)
                plugin.settings.hiddenProperties.remove(propName);
            plugin.saveSettings();
            updateHiddenProperties(plugin);
        })
    let hideIconItem = (item: MenuItem) => item
        .setTitle(i18n.t("HIDE_ICON_PROPERTY"))
        .setIcon("lucide-eye-off")
        .setSection("pretty-properties")
        .onClick(() => {
            if (propName)
                plugin.settings.hiddenProperties.push(propName);
            plugin.saveSettings();
            updateHiddenProperties(plugin);
        })


    if (menuExist && e.target instanceof HTMLImageElement) {
        let menuManager = plugin.menuManager
        menuManager.closeAndFlush()
        menuManager.addItemAfter(["system"], i18n.t("SELECT_ICON"), selectIconItem);
        menuManager.addItemAfter(["system"], i18n.t("REMOVE_ICON"), removeIconItem);
        if (plugin.settings.hiddenProperties.find(p => p == propName)) {
            menuManager.addItemAfter(["system"], i18n.t("UNHIDE_ICON_PROPERTY"), unhideIconItem);
        } else {
            menuManager.addItemAfter(["system"], i18n.t("HIDE_ICON_PROPERTY"), hideIconItem);
        }
    } else {
        let menu = new Menu();
        menu.addItem(selectIconItem);
        menu.addItem(removeIconItem);

        if (plugin.settings.hiddenProperties.find((p) => p == propName)) {
            menu.addItem(unhideIconItem);
        } else {
            menu.addItem(hideIconItem);
        }
        menu.showAtMouseEvent(e);
    }
}