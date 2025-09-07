import { MenuItem } from "obsidian";
import PrettyPropertiesPlugin from "src/main";
import { i18n } from "src/localization";
import { updateHiddenProperties } from "src/utils/updates/updateStyles";
import { updateElements } from "src/utils/updates/updateElements";

export const handlePropertyMenu = (el: HTMLElement | SVGElement, plugin: PrettyPropertiesPlugin) => {
    
    let propEl = el.closest(".metadata-property");
    if (propEl instanceof HTMLElement) {
        let propName = propEl?.getAttribute("data-property-key");

        if (propName) {
            let menuManager = plugin.menuManager
            menuManager.closeAndFlush()

            if (plugin.settings.hiddenProperties.find((p) => p == propName)) {
                menuManager.addItemAfter(
                    ["clipboard"],
                    i18n.t("UNHIDE_PROPERTY"),
                    (item: MenuItem) =>
                        item
                        .setTitle(i18n.t("UNHIDE_PROPERTY"))
                        .setIcon("lucide-eye")
                        .setSection("pretty-properties")
                        .onClick(() => {
                            if (propName)
                                plugin.settings.hiddenProperties.remove(
                                    propName
                                );
                            plugin.saveSettings();
                            updateHiddenProperties(plugin);
                        })
                );
            } else {
                menuManager.addItemAfter(
                    ["clipboard"],
                    i18n.t("HIDE_PROPERTY"),
                    (item: MenuItem) =>
                        item
                        .setTitle(i18n.t("HIDE_PROPERTY"))
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

            //@ts-ignore
            let propertyTypeObject = plugin.app.metadataTypeManager.getPropertyInfo(
                    propName.toLowerCase()
                );
            let propertyType;
            if (propertyTypeObject) {
                propertyType =
                    propertyTypeObject.widget || propertyTypeObject.type;
            }

            if (
                propertyType == "number" &&
                !plugin.settings.progressProperties[propName]
            ) {
                menuManager.addItemAfter(
                    ["clipboard"],
                    i18n.t("SHOW_PROGRESS_BAR"),
                    (item: MenuItem) =>
                        item
                        .setTitle(i18n.t("SHOW_PROGRESS_BAR"))
                        .setIcon("lucide-bar-chart-horizontal-big")
                        .setSection("pretty-properties")
                        .onClick(() => {
                            if (propName) {
                                plugin.settings.progressProperties[
                                    propName
                                ] = {
                                    maxNumber: 100,
                                };
                            }
                            plugin.saveSettings();
                            updateElements(plugin);
                        })  
                );
            } else if (plugin.settings.progressProperties[propName]) {
                if (
                    plugin.settings.progressProperties[propName].maxProperty
                ) {
                    menuManager.addItemAfter(
                        ["clipboard"],
                        i18n.t("SET_PROGRESS_MAX_VALUE_100"),
                        (item: MenuItem) =>
                            item
                            .setTitle(
                                i18n.t("SET_PROGRESS_MAX_VALUE_100")
                            )
                            .setIcon("lucide-bar-chart-horizontal-big")
                            .setSection("pretty-properties")
                            .onClick(() => {
                                if (propName) {
                                    delete plugin.settings
                                        .progressProperties[propName]
                                        .maxProperty;
                                    plugin.settings.progressProperties[
                                        propName
                                    ].maxNumber = 100;
                                }
                                plugin.saveSettings();
                                updateElements(plugin);
                            })
                    );
                }

                menuManager.addItemAfter(
                    ["clipboard"],
                    i18n.t("SET_PROGRESS_MAX_VALUE_PROPERTY"),
                    (item: MenuItem) => {
                        item.setTitle(
                            i18n.t("SET_PROGRESS_MAX_VALUE_PROPERTY")
                        )
                            .setIcon("lucide-bar-chart-horizontal-big")
                            .setSection("pretty-properties");

                        //@ts-ignore
                        let sub = item.setSubmenu();
                        //@ts-ignore
                        let properties = plugin.app.metadataTypeManager.getAllProperties();
                        let numberProperties = Object.keys(properties)
                            .filter((p) => {
                                let property = properties[p];
                                let type = property.widget || property.type;
                                return type == "number";
                            })
                            .map((p) => properties[p].name);

                        for (let numberProp of numberProperties) {
                            sub.addItem((subitem: MenuItem) => {
                                if (propName) {
                                    subitem
                                    .setTitle(numberProp)
                                    .setChecked(
                                        plugin.settings
                                            .progressProperties[
                                            propName
                                        ].maxProperty == numberProp
                                    )
                                    .onClick(() => {
                                        if (propName) {
                                            delete plugin.settings
                                                .progressProperties[
                                                propName
                                            ].maxNumber;
                                            plugin.settings.progressProperties[
                                                propName
                                            ].maxProperty = numberProp;
                                        }
                                        plugin.saveSettings();
                                        updateElements(plugin);
                                    });
                                }
                            });
                        }
                    }
                );

                menuManager.addItemAfter(
                    ["clipboard"],
                    i18n.t("REMOVE_PROGRESS_BAR"),
                    (item: MenuItem) =>
                        item
                        .setTitle(i18n.t("REMOVE_PROGRESS_BAR"))
                        .setIcon("lucide-bar-chart-horizontal-big")
                        .setSection("pretty-properties")
                        .onClick(() => {
                            if (propName) {
                                delete plugin.settings.progressProperties[
                                    propName
                                ];
                            }
                            plugin.saveSettings();
                            updateElements(plugin);
                        })
                );
            }
        }
    }
}