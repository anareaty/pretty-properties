import PrettyPropertiesPlugin from "src/main";
import { TFile, MarkdownView } from "obsidian";
import { i18n } from "src/localization/localization";
import { removeProperty } from "./propertyUtils";
import { selectCoverImage } from "./imageUtils";
import { getCurrentProperty } from "./propertyUtils";
import { getCurrentCoverProperty } from "./imageUtils";
import { selectCoverShape } from "./imageUtils";
import { FileImageSuggestModal } from "src/modals/fileImageSuggestModal";
import { ImageSuggestModal } from "src/modals/imageSuggestModal";
import { IconSuggestModal } from "src/modals/iconSuggestModal";
import { updateTasksCount } from "./taskCount/taskCount";
import { updateTaskNotesTaskCount } from "./taskCount/taskNotesTaskCount";


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
                    new FileImageSuggestModal(plugin.app, plugin).open();
                }
                return true;
            }
            return false;
        },
    });



    plugin.addCommand({
        id: "update-tasks-count",
        name: i18n.t("UPDATE_TASK_COUNT"),
        checkCallback: (checking: boolean) => {
          if (plugin.settings.enableTasksCount || plugin.settings.enableTaskNotesCount) {
            if (!checking) {
              let leaves = plugin.app.workspace.getLeavesOfType("markdown");
              for (let leaf of leaves) {
                if (leaf.view instanceof MarkdownView) {
                  let view = leaf.view
                  let file = view.file
                  if (file instanceof TFile) {
                    let cache = plugin.app.metadataCache.getFileCache(file)
    
                    if (plugin.settings.enableTaskNotesCount) {
                        updateTaskNotesTaskCount(plugin, null, view);
                    }
        
                    if (plugin.settings.enableTasksCount && cache) {
                        updateTasksCount(view, cache, plugin);
                    }
                  }
                  
                }
              }
            }
            return true;
          }
          return false;
        }
      });



}


