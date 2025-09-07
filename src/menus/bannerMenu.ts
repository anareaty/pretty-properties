import { Menu, MenuItem } from "obsidian";
import PrettyPropertiesPlugin from "src/main";
import { i18n } from "src/localization/localization";
import { updateHiddenProperties } from "src/utils/updates/updateStyles";
import { selectBannerPosition } from "src/utils/imageUtils";
import { removeProperty } from "src/utils/propertyUtils";
import { ImageSuggestModal } from "src/modals/imageSuggestModal";


export const createBannerMenu = (e: MouseEvent, plugin: PrettyPropertiesPlugin) => {
    let propName = plugin.settings.bannerProperty;
    let menu = new Menu();

    menu.addItem((item: MenuItem) =>
        item
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