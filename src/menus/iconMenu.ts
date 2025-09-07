import { Menu, MenuItem } from "obsidian";
import PrettyPropertiesPlugin from "src/main";
import { i18n } from "src/localization/localization";
import { updateHiddenProperties } from "src/utils/updates/updateStyles";
import { removeProperty } from "src/utils/propertyUtils";
import { IconSuggestModal } from "src/modals/iconSuggestModal";

export const createIconMenu = (e: MouseEvent, plugin: PrettyPropertiesPlugin) => {
    let propName = plugin.settings.iconProperty;
    let menu = new Menu();

    menu.addItem((item: MenuItem) =>
        item
        .setTitle(i18n.t("SELECT_ICON"))
        .setIcon("lucide-image-plus")
        .setSection("pretty-properties")
        .onClick(async () => {
            new IconSuggestModal(plugin.app, plugin).open();
        })
    );

    menu.addItem((item: MenuItem) =>
        item
        .setTitle(i18n.t("REMOVE_ICON"))
        .setIcon("image-off")
        .setSection("pretty-properties")
        .onClick(async () => {
            removeProperty(plugin.settings.iconProperty, plugin);
        })
    );

    if (plugin.settings.hiddenProperties.find((p) => p == propName)) {
        menu.addItem((item: MenuItem) =>
            item
            .setTitle(i18n.t("UNHIDE_ICON_PROPERTY"))
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
            .setTitle(i18n.t("HIDE_ICON_PROPERTY"))
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