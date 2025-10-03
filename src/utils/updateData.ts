import PrettyPropertiesPlugin from "src/main";

export const updateData = (plugin: PrettyPropertiesPlugin) => {
    if (plugin.settings.dataVersion < 1) {

        const updateColorObject = async (colorObject: any) => {
            for (let color in colorObject) {
                colorObject[color] = {
                    pillColor: colorObject[color]
                }
            }
        } 

        updateColorObject(plugin.settings.propertyPillColors)
        updateColorObject(plugin.settings.propertyLongtextColors)
        updateColorObject(plugin.settings.tagColors)
       
        plugin.settings.dataVersion = 1
        plugin.saveSettings()
    }
}