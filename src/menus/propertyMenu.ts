import { Menu, MenuItem } from "obsidian";
import PrettyPropertiesPlugin from "src/main";
import { i18n } from "src/localization/localization";
import { updateHiddenProperties } from "src/utils/updates/updateHiddenProperties";
import { updateAllProperties } from "src/utils/updates/updateElements";
import { getPropertyType } from "src/utils/propertyUtils";



export const handlePropertyMenu = (menu: Menu, propEl: HTMLElement, plugin: PrettyPropertiesPlugin) => {

    let propName = propEl?.getAttribute("data-property-key");

    if (propName) {
        if (plugin.settings.hiddenProperties.find((p) => p == propName)) {

            menu.addItem((item: MenuItem) =>
                item
                .setTitle(i18n.t("UNHIDE_PROPERTY"))
                .setIcon("lucide-eye")
                .setSection("pretty-properties")
                .onClick(async () => {
                    if (propName)
                        plugin.settings.hiddenProperties.remove(
                            propName
                        );
                    await plugin.saveSettings();
                    updateHiddenProperties(plugin);
                })
            );

        } else {

            menu.addItem((item: MenuItem) =>
                item
                .setTitle(i18n.t("HIDE_PROPERTY"))
                .setIcon("lucide-eye-off")
                .setSection("pretty-properties")
                .onClick(async () => {
                    if (propName)
                        plugin.settings.hiddenProperties.push(
                            propName
                        );
                    await plugin.saveSettings();
                    updateHiddenProperties(plugin);
                })
            );
        }




        if (plugin.settings.hiddenWhenEmptyProperties.find((p) => p == propName)) {
            menu.addItem((item: MenuItem) =>
                item
                .setTitle(i18n.t("NOT_HIDE_WHEN_EMPTY"))
                .setIcon("lucide-eye")
                .setSection("pretty-properties")
                .onClick(async () => {
                    if (propName)
                        plugin.settings.hiddenWhenEmptyProperties.remove(
                            propName
                        );
                    await plugin.saveSettings();
                    updateHiddenProperties(plugin);
                })
            );
        } else {
            menu.addItem((item: MenuItem) =>
                item
                .setTitle(i18n.t("HIDE_WHEN_EMPTY"))
                .setIcon("lucide-eye-off")
                .setSection("pretty-properties")
                .onClick(async () => {
                    if (propName)
                        plugin.settings.hiddenWhenEmptyProperties.push(
                            propName
                        );
                    await plugin.saveSettings();
                    updateHiddenProperties(plugin);
                })
            );
        }





        

        let propertyType = getPropertyType(propName, plugin)


        if (propertyType == "text" || 
            propertyType == "number" || 
            propertyType == "date" || 
            propertyType == "datetime") {

            let propertyFormatObj = plugin.settings.propertyFormats[propName]

            

            if (propertyFormatObj && propertyFormatObj.textFormat == "markdown") {
                menu.addItem((item: MenuItem) =>
                    item
                    .setTitle(i18n.t("DO_NOT_RENDER_MARKDOWN"))
                    .setIcon("code-2")
                    .setSection("pretty-properties")
                    .onClick(async () => {
                        propertyFormatObj.textFormat = "raw"
                        await plugin.saveSettings();
                        updateAllProperties(plugin);
                    })  
                );
            } else if (propertyType == "text" || (propertyFormatObj && propertyFormatObj.format)) {
                menu.addItem((item: MenuItem) =>
                    item
                    .setTitle(i18n.t("RENDER_MARKDOWN"))
                    .setIcon("book-open")
                    .setSection("pretty-properties")
                    .onClick(async () => {
                        if (propertyFormatObj) {
                            propertyFormatObj.textFormat = "markdown"
                        } else {
                            plugin.settings.propertyFormats[propName] = {
                                format: "",
                                textFormat: "markdown"
                            }
                        }

                        await plugin.saveSettings();
                        updateAllProperties(plugin);
                    })  
                );
            }

        }





        if (
            propertyType == "number" &&
            !plugin.settings.progressProperties[propName]
        ) {
            menu.addItem((item: MenuItem) =>
                item
                .setTitle(i18n.t("SHOW_PROGRESS_BAR"))
                .setIcon("lucide-bar-chart-horizontal-big")
                .setSection("pretty-properties")
                .onClick(async () => {
                    if (propName) {
                        plugin.settings.progressProperties[propName] = { maxNumber: 100 };
                    }
                    await plugin.saveSettings();
                    updateAllProperties(plugin);
                })  
            );
        } else if (plugin.settings.progressProperties[propName]) {
            if (
                plugin.settings.progressProperties[propName].maxProperty
            ) {
                menu.addItem((item: MenuItem) =>
                    item
                    .setTitle(
                        i18n.t("SET_PROGRESS_MAX_VALUE_100")
                    )
                    .setIcon("lucide-bar-chart-horizontal-big")
                    .setSection("pretty-properties")
                    .onClick(async () => {
                        if (propName) {
                            let propSettings = plugin.settings.progressProperties[propName]
                            if (!propSettings) {
                                propSettings = {}
                            }
                            
                            delete propSettings.maxProperty;
                            propSettings.maxNumber = 100;
                            
                        }
                        await plugin.saveSettings();
                        updateAllProperties(plugin)
                    })
                );
            }

            menu.addItem((item: MenuItem) => {
                item.setTitle(
                    i18n.t("SET_PROGRESS_MAX_VALUE_PROPERTY")
                )
                    .setIcon("lucide-bar-chart-horizontal-big")
                    .setSection("pretty-properties");

               
                let sub = item.setSubmenu();
                
                let properties = plugin.app.metadataTypeManager.getAllProperties();
                let numberProperties = Object.keys(properties)
                    .filter((p) => {
                        let type = getPropertyType(p, plugin)
                        return type == "number";
                    })
                    //.map((p) => properties[p].name);

                for (let numberProp of numberProperties) {
                    sub.addItem((subitem: MenuItem) => {
                        if (propName) {

                            let propSettings = plugin.settings.progressProperties[propName]
                            subitem
                            .setTitle(numberProp)
                            .setChecked(
                                propSettings?.maxProperty == numberProp
                            )
                            .onClick(async () => {

                                if (!propSettings) {
                                    propSettings = {}
                                }

                                if (propName) {
                                    delete propSettings?.maxNumber;
                                    propSettings.maxProperty = numberProp;
                                }
                                await plugin.saveSettings();
                                updateAllProperties(plugin)
                            });
                        }
                    });
                }
            });

            menu.addItem((item: MenuItem) =>
                item
                .setTitle(i18n.t("REMOVE_PROGRESS_BAR"))
                .setIcon("lucide-bar-chart-horizontal-big")
                .setSection("pretty-properties")
                .onClick(async () => {
                    if (propName) {
                        delete plugin.settings.progressProperties[
                            propName
                        ];
                    }
                    await plugin.saveSettings();
                    updateAllProperties(plugin)
                })
            );
        }
    }
    
}





