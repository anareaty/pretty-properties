import { TFile, Menu, MenuItem } from "obsidian";
import { i18n } from "src/localization/localization";
import PrettyPropertiesPlugin from "src/main";
import { updateHiddenProperties } from "src/utils/updates/updateHiddenProperties";
import { getCurrentCoverProperty } from "src/utils/imageUtils";
import { selectCoverShape } from "src/utils/imageUtils";
import { removeProperty } from "src/utils/propertyUtils";
import { ImageSuggestModal } from "src/modals/imageSuggestModal";

export const createCoverMenu = (e: MouseEvent, plugin: PrettyPropertiesPlugin) => {
    //@ts-ignore
    let plugins = plugin.app.plugins
    let menuExist = 
        plugins.getPlugin("copy-url-in-preview") || 
        plugins.getPlugin("pixel-perfect-image")



    let file = plugin.app.workspace.getActiveFile();

    if (file instanceof TFile) {
        let propName = getCurrentCoverProperty(plugin);

        if (propName) {


            let selectCoverItem = (item: MenuItem) => item
                .setTitle(i18n.t("SELECT_COVER_IMAGE"))
                .setIcon("lucide-image-plus")
                .setSection("pretty-properties")
                .onClick(async () => {
                    if (propName) {
                        new ImageSuggestModal(
                            plugin.app, 
                            plugin, 
                            propName, 
                            plugin.settings.coversFolder,
                            "cover"
                        ).open();
                    
                    };
                })
            let selectShapeItem = (item: MenuItem) => item
                .setTitle(i18n.t("SELECT_COVER_SHAPE"))
                .setIcon("lucide-shapes")
                .setSection("pretty-properties")
                .onClick(async () => {
                    selectCoverShape(plugin);
                })
            let removeCoverItem = (item: MenuItem) => item
                .setTitle(i18n.t("REMOVE_COVER"))
                .setIcon("image-off")
                .setSection("pretty-properties")
                .onClick(async () => {
                    if (propName) removeProperty(propName, plugin);
                })
            let unhideCoverItem = (item: MenuItem) => item
                .setTitle(i18n.t("UNHIDE_COVER_PROPERTY"))
                .setIcon('lucide-eye')
                .setSection('pretty-properties')
                .onClick(() => {
                    if (propName) plugin.settings.hiddenProperties.remove(propName)
                    plugin.saveSettings()
                    updateHiddenProperties(plugin)			
                })
            let hideCoverItem = (item: MenuItem) => item
                .setTitle(i18n.t("HIDE_COVER_PROPERTY"))
                .setIcon("lucide-eye-off")
                .setSection("pretty-properties")
                .onClick(() => {
                    if (propName)
                        plugin.settings.hiddenProperties.push(
                            propName
                        );
                    plugin.saveSettings();
                    updateHiddenProperties(plugin);
                })

            if (menuExist) {
                let menuManager = plugin.menuManager
                menuManager.closeAndFlush()
                menuManager.addItemAfter(["system"], i18n.t("SELECT_COVER_IMAGE"), selectCoverItem);
                menuManager.addItemAfter(["system"], i18n.t("SELECT_COVER_SHAPE"), selectShapeItem);
                menuManager.addItemAfter(["system"], i18n.t("REMOVE_COVER"), removeCoverItem);
                if (plugin.settings.hiddenProperties.find(p => p == propName)) {
                    menuManager.addItemAfter(["system"], i18n.t("UNHIDE_COVER_PROPERTY"), unhideCoverItem);
                } else {
                    menuManager.addItemAfter(["system"], i18n.t("HIDE_COVER_PROPERTY"), hideCoverItem);
                }
        
            } else {
                let menu = new Menu();
                menu.addItem(selectCoverItem);
                menu.addItem(selectShapeItem);
                menu.addItem(removeCoverItem);

                if (plugin.settings.hiddenProperties.find(p => p == propName)) {
                    menu.addItem(unhideCoverItem)
                } else {
                    menu.addItem(hideCoverItem);
                }
                menu.showAtMouseEvent(e);
            }
        }
    }
}