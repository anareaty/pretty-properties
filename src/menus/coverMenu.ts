import { TFile, Menu, MenuItem } from "obsidian";
import { i18n } from "src/localization";
import PrettyPropertiesPlugin from "src/main";
import { updateHiddenProperties } from "src/utils/updates/updateStyles";
import { getCurrentCoverProperty } from "src/utils/coverUtils";
import { selectImage } from "src/utils/imageUtils";
import { selectCoverShape } from "src/utils/coverUtils";
import { removeProperty } from "src/utils/propertyUtils";

export const createCoverMenu = (e: MouseEvent, plugin: PrettyPropertiesPlugin) => {
    let file = plugin.app.workspace.getActiveFile();

    if (file instanceof TFile) {
        let propName = getCurrentCoverProperty(plugin);

        if (propName) {
            let menu = new Menu();

            menu.addItem((item: MenuItem) =>
                item
                .setTitle(i18n.t("SELECT_COVER_IMAGE"))
                .setIcon("lucide-image-plus")
                .setSection("pretty-properties")
                .onClick(async () => {
                    if (propName) selectImage(propName, plugin.settings.coversFolder, "cover", plugin);
                })
            );

            menu.addItem((item: MenuItem) =>
                item
                .setTitle(i18n.t("SELECT_COVER_SHAPE"))
                .setIcon("lucide-shapes")
                .setSection("pretty-properties")
                .onClick(async () => {
                    selectCoverShape(plugin);
                })
            );

            menu.addItem((item: MenuItem) =>
                item
                .setTitle(i18n.t("REMOVE_COVER"))
                .setIcon("image-off")
                .setSection("pretty-properties")
                .onClick(async () => {
                    if (propName) removeProperty(propName, plugin);
                })
            );

            if (plugin.settings.hiddenProperties.find(p => p == propName)) {
                menu.addItem((item: MenuItem) => item
                .setTitle(i18n.t("UNHIDE_COVER_PROPERTY"))
                .setIcon('lucide-eye')
                .setSection('pretty-properties')
                .onClick(() => {
                    if (propName) plugin.settings.hiddenProperties.remove(propName)
                    plugin.saveSettings()
                    updateHiddenProperties(plugin)			
                }))
            } else {
                menu.addItem((item: MenuItem) =>
                    item
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
                );
            }
            menu.showAtMouseEvent(e);
        }
    }
}