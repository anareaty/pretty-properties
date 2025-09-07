import PrettyPropertiesPlugin from "./main";
import { TFile } from "obsidian";
import { i18n } from "./localization";
import { selectImage } from "./utils/imageUtils";
import { removeProperty } from "./utils/propertyUtils";
import { selectIcon } from "./utils/iconUtils";
import { selectCoverImage } from "./utils/coverUtils";
import { getCurrentProperty } from "./utils/propertyUtils";
import { getCurrentCoverProperty } from "./utils/coverUtils";
import { selectCoverShape } from "./utils/coverUtils";
import { selectImageForFile } from "./utils/imageUtils";


export function registerCommands(plugin: PrettyPropertiesPlugin) {

    plugin.addCommand({
        id: "toggle-hidden-properties",
        name: i18n.t("HIDE_SHOW_HIDDEN_PROPERTIES"),
        callback: async () => {
            document.body.classList.toggle("show-hidden-properties");
        },
    });

    plugin.addCommand({
        id: "select-banner-image",
        name: i18n.t("SELECT_BANNER_IMAGE"),
        checkCallback: (checking: boolean) => {
            let file = plugin.app.workspace.getActiveFile();
            if (
                file instanceof TFile &&
                plugin.settings.enableBanner &&
                plugin.settings.bannerProperty
            ) {
                if (!checking) {
                    selectImage(
                        plugin.settings.bannerProperty,
                        plugin.settings.bannersFolder,
                        "banner",
                        plugin
                    );
                }
                return true;
            }
            return false;
        },
    });

    plugin.addCommand({
        id: "remove-banner",
        name: i18n.t("REMOVE_BANNER"),
        checkCallback: (checking: boolean) => {
            let file = plugin.app.workspace.getActiveFile();
            if (
                file instanceof TFile &&
                plugin.settings.enableBanner &&
                plugin.settings.bannerProperty
            ) {
                let banner = getCurrentProperty(plugin.settings.bannerProperty, plugin);
                if (banner) {
                    if (!checking) {
                        removeProperty(plugin.settings.bannerProperty, plugin);
                    }
                    return true;
                }
                return false;
            }
            return false;
        },
    });

    plugin.addCommand({
        id: "select-icon",
        name: i18n.t("SELECT_ICON"),
        checkCallback: (checking: boolean) => {
            let file = plugin.app.workspace.getActiveFile();
            if (
                file instanceof TFile &&
                plugin.settings.enableIcon &&
                plugin.settings.iconProperty
            ) {
                if (!checking) {
                    selectIcon(plugin);
                }
                return true;
            }
            return false;
        },
    });

    plugin.addCommand({
        id: "remove-icon",
        name: i18n.t("REMOVE_ICON"),
        checkCallback: (checking: boolean) => {
            let file = plugin.app.workspace.getActiveFile();
            if (
                file instanceof TFile &&
                plugin.settings.enableIcon &&
                plugin.settings.iconProperty
            ) {
                let icon = getCurrentProperty(plugin.settings.iconProperty, plugin);
                if (icon) {
                    if (!checking) {
                        removeProperty(plugin.settings.iconProperty, plugin);
                    }
                    return true;
                }
                return false;
            }
            return false;
        },
    });

    plugin.addCommand({
        id: "select-cover-image",
        name: i18n.t("SELECT_COVER_IMAGE"),
        checkCallback: (checking: boolean) => {
            let file = plugin.app.workspace.getActiveFile();
            if (
                file instanceof TFile &&
                plugin.settings.enableCover &&
                plugin.settings.coverProperty
            ) {
                if (!checking) {
                    selectCoverImage(plugin);
                }
                return true;
            }
            return false;
        },
    });

    plugin.addCommand({
        id: "remove-cover",
        name: i18n.t("REMOVE_COVER"),
        checkCallback: (checking: boolean) => {
            let file = plugin.app.workspace.getActiveFile();
            let currentCoverProp = getCurrentCoverProperty(plugin);
            if (
                file instanceof TFile &&
                plugin.settings.enableCover &&
                plugin.settings.coverProperty &&
                currentCoverProp
            ) {
                if (!checking) {
                    removeProperty(plugin.settings.coverProperty, plugin);
                    for (let extraProp of plugin.settings
                        .extraCoverProperties) {
                        removeProperty(extraProp, plugin);
                    }
                }
                return true;
            }
            return false;
        },
    });

    plugin.addCommand({
        id: "select-cover-shape",
        name: i18n.t("SELECT_COVER_SHAPE"),
        checkCallback: (checking: boolean) => {
            let file = plugin.app.workspace.getActiveFile();
            let currentCoverProp = getCurrentCoverProperty(plugin);
            if (
                file instanceof TFile &&
                plugin.settings.enableCover &&
                plugin.settings.coverProperty &&
                currentCoverProp
            ) {
                if (!checking) {
                    selectCoverShape(plugin);
                }
                return true;
            }
            return false;
        },
    });

    plugin.addCommand({
        id: "select-image-for-file",
        name: i18n.t("SHOW_IMAGES_MENU"),
        checkCallback: (checking: boolean) => {
            let file = plugin.app.workspace.getActiveFile();
            if (
                file instanceof TFile &&
                ((plugin.settings.enableBanner &&
                    plugin.settings.bannerProperty) ||
                    (plugin.settings.enableCover &&
                        plugin.settings.coverProperty) ||
                    (plugin.settings.enableIcon &&
                        plugin.settings.iconProperty))
            ) {
                if (!checking) {
                    selectImageForFile(plugin);
                }
                return true;
            }
            return false;
        },
    });
}


