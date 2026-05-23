import PrettyPropertiesPlugin from "src/main";
import { TFile, MarkdownView, Editor, MarkdownFileInfo } from "obsidian";
import { i18n } from "src/localization/localization";
import { removeProperty } from "./propertyUtils";
import { selectCoverImage } from "./imageUtils";
import { getCurrentProperty } from "./propertyUtils";
import { getCurrentCoverProperty } from "./imageUtils";
import { selectCoverShape } from "./imageUtils";
import { FileImageSuggestModal } from "src/modals/fileImageSuggestModal";

import { IconSuggestModal } from "src/modals/iconSuggestModal";
import { LocalImageSuggestModal } from "src/modals/localImageSuggestModal";
import { EmojiSuggestModal } from "src/modals/emojiSuggestModal";
import { ImageSuggestModal } from "src/modals/imageSuggestModal";



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
                    new ImageSuggestModal(
                        plugin.app, 
                        plugin, 
                        plugin.settings.bannerProperty, 
                        plugin.settings.bannersFolder,
                        "banner"
                    ).open();
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
                        removeProperty(plugin.settings.bannerPositionProperty, plugin);
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
                    new IconSuggestModal(plugin.app, plugin).open();
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
				plugin.settings.coverProperties[0]?.property
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
				plugin.settings.coverProperties[0]?.property &&
                currentCoverProp
            ) {
                if (!checking) {
					removeProperty(currentCoverProp, plugin);
                    removeProperty(plugin.settings.coverPositionProperty, plugin);
                    removeProperty(plugin.settings.coverShapeProperty, plugin);
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
				plugin.settings.coverProperties[0]?.property &&
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
						plugin.settings.coverProperties[0]?.property) ||
                    (plugin.settings.enableIcon &&
                        plugin.settings.iconProperty))
            ) {
                if (!checking) {
                    new FileImageSuggestModal(plugin.app, plugin).open();
                }
                return true;
            }
            return false;
        },
    });
















    plugin.addCommand({
        id: "insert-image",
        name: i18n.t("INSERT_IMAGE"),

        editorCallback: (editor: Editor, view: MarkdownView | MarkdownFileInfo) => {
            let files = plugin.app.vault.getFiles()
            let formats = [
                "avif",
                "bmp",
                "gif",
                "jpeg",
                "jpg",
                "png",
                "svg",
                "webp",
            ];
            files = files.filter((f: TFile) => formats.find((e) => e == f.extension));
            let paths = files.map(f => f.path)
            let names = files.map(f => f.basename)
            new LocalImageSuggestModal(
                plugin.app,
                plugin,
                "",
                "basic",
                paths,
                names,
                editor
            ).open();
        },
    })












    plugin.addCommand({
        id: "insert-emoji",
        name: i18n.t("INSERT_EMOJI"),
        editorCallback: (editor: Editor, view: MarkdownView | MarkdownFileInfo) => {
            new EmojiSuggestModal(plugin.app, plugin, editor).open()
        },
    })



}
