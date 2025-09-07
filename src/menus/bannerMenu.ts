import { Menu, MenuItem } from "obsidian";
import PrettyPropertiesPlugin from "src/main";
import { i18n } from "src/localization";
import { updateHiddenProperties } from "src/utils/updates/updateStyles";
import { selectBannerPosition } from "src/utils/bannerUtils";
import { selectImage } from "src/utils/imageUtils";
import { removeProperty } from "src/utils/propertyUtils";


export const createBannerMenu = (e: MouseEvent, plugin: PrettyPropertiesPlugin) => {
    let propName = plugin.settings.bannerProperty;
    let menu = new Menu();

    menu.addItem((item: MenuItem) =>
        item
            .setTitle(i18n.t("SELECT_BANNER_IMAGE"))
            .setIcon("image-plus")
            .setSection("pretty-properties")
            .onClick(async () => {
                selectImage(
                    plugin.settings.bannerProperty,
                    plugin.settings.bannersFolder,
                    "banner",
                    plugin
                );
            })
    );

    menu.addItem((item: MenuItem) =>
        item
        .setTitle(i18n.t("SELECT_BANNER_POSITION"))
        .setIcon("sliders-horizontal")
        .setSection("pretty-properties")
        .onClick(async () => {
            selectBannerPosition(plugin)
        })
    );

    menu.addItem((item: MenuItem) =>
        item
        .setTitle(i18n.t("REMOVE_BANNER"))
        .setIcon("image-off")
        .setSection("pretty-properties")
        .onClick(async () => {
            removeProperty(plugin.settings.bannerProperty, plugin);
        })
    );

    if (plugin.settings.hiddenProperties.find((p) => p == propName)) {
        menu.addItem((item: MenuItem) =>
            item
            .setTitle(i18n.t("UNHIDE_BANNER_PROPERTY"))
            .setIcon("lucide-eye")
            .setSection("pretty-properties")
            .onClick(() => {
                if (propName)
                    plugin.settings.hiddenProperties.remove(propName);
                plugin.saveSettings();
                updateHiddenProperties(plugin);
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
                    plugin.settings.hiddenProperties.push(propName);
                plugin.saveSettings();
                updateHiddenProperties(plugin);
            })
        );
    }

    menu.showAtMouseEvent(e);
}