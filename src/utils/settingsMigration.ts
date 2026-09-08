import PrettyPropertiesPlugin from "src/main"
import { getPropertyType } from "./propertyUtils";
import { DEFAULT_SETTINGS, PPPluginSettings } from "src/settings/settings";
import { FrontMatterCache } from "obsidian";


export const migrateColorSettings = async (plugin:PrettyPropertiesPlugin) => {

    let propertyPillColors = plugin.settings.propertyPillColors
    let propertyLongtextColors = plugin.settings.propertyLongtextColors
    let tagColors = plugin.settings.tagColors

    if ((Object.keys(propertyPillColors).length > 0) ||
    (Object.keys(propertyLongtextColors).length > 0) ||
    (Object.keys(tagColors).length > 0)) {

        let properties = plugin.app.metadataTypeManager.getAllProperties();
        let propertyKeys = Object.keys(properties);

        for (let key of propertyKeys) {
            let propObj = properties[key]!;
            let propName = propObj.name;
            let type = getPropertyType(propName, plugin);

            if (type == "aliases") type = "multitext";
            if (!type) type = "text";
            if (type != "text" && type != "multitext") continue;
            
            let values = plugin.app.metadataCache.getFrontmatterPropertyValuesForKey(propName)

            for (let value of values) {
                let colorSettingsObj
        
                if (type == "multitext") {
                    colorSettingsObj = propertyPillColors[value]
                }
                else if (type == "text") {
                    colorSettingsObj = propertyLongtextColors[value]
                }
        
                if (colorSettingsObj) {
                    if (!plugin.settings.propertyColors[propName]) {
                        plugin.settings.propertyColors[propName] = {}
                    }
                    plugin.settings.propertyColors[propName][value] = colorSettingsObj
                }
            }
        }

        plugin.settings.propertyColors.tags = tagColors
        await plugin.saveSettings()
    }
}
  
  
  
  
export const migrateCoverSettings = async (data: PPPluginSettings, plugin: PrettyPropertiesPlugin) => {
    if (!Array.isArray(data.coverProperties)) {
        const coverProperty = data.coverProperty ?? DEFAULT_SETTINGS.coverProperties[0]?.property;
        const extra = Array.isArray(data.extraCoverProperties) ? data.extraCoverProperties : [];

        if (coverProperty) {
            data.coverProperties = [
                { property: coverProperty, format: "" },
                ...extra.map((p: string) => ({ property: p, format: "" })),
            ];
            delete data.coverProperty;
            delete data.extraCoverProperties;
        }
        await plugin.saveData(data);
    }
}





export const migrateCoverProperties = async (plugin: PrettyPropertiesPlugin) => {

    if (plugin.settings.coverClassesMigrated) return

    let files = plugin.app.vault.getMarkdownFiles()
    for (let file of files) {
        await plugin.app.fileManager.processFrontMatter(file, (fm: FrontMatterCache) => {

            let cssclasses = fm.cssclasses as string[] | null

            if (Array.isArray(cssclasses)) {
                
                if (cssclasses.includes("cover-vertical")) {
                    fm.cover_shape = "vertical-cover"

                }

                if (cssclasses.includes("cover-vertical-cover")) {
                    fm.cover_shape = "vertical-cover"
                }

                if (cssclasses.includes("cover-vertical-contain")) {
                    fm.cover_shape = "vertical-contain"
                }

                if (cssclasses.includes("cover-horizontal")) {
                    fm.cover_shape = "horizontal-cover"
                }

                if (cssclasses.includes("cover-horizontal-cover")) {
                    fm.cover_shape = "horizontal-cover"
                }

                if (cssclasses.includes("cover-horizontal-contain")) {
                    fm.cover_shape = "horizontal-contain"
                }

                if (cssclasses.includes("cover-square")) {
                    fm.cover_shape = "square"
                }

                if (cssclasses.includes("cover-circle")) {
                    fm.cover_shape = "circle"
                }


                if (cssclasses.includes("cover-initial")) {
                    fm.cover_shape = "initial"
                }

                if (cssclasses.includes("cover-initial-width-2")) {
                    fm.cover_shape = "initial-2"
                }

                if (cssclasses.includes("cover-initial-width-3")) {
                    fm.cover_shape = "initial-3"
                }

                if (cssclasses.includes("cover-left")) {
                    fm.cover_position = "left"
                }

                if (cssclasses.includes("cover-right")) {
                    fm.cover_position = "right"
                }

                if (cssclasses.includes("cover-top")) {
                    fm.cover_position = "top"
                }

                if (cssclasses.includes("cover-bottom")) {
                    fm.cover_position = "bottom"
                }
            }
        })
    }

    plugin.settings.coverClassesMigrated = true
    plugin.saveSettings()
}
