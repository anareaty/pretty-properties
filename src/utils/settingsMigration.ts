import PrettyPropertiesPlugin from "src/main"
import { getPropertyType } from "./propertyUtils";
import { DEFAULT_SETTINGS, PPPluginSettings } from "src/settings/settings";


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