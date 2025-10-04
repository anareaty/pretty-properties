import PrettyPropertiesPlugin from "src/main";

export const updateData = (plugin: PrettyPropertiesPlugin) => {

    // Update old version of settings without text colors to new version with text colors 

    if (plugin.settings.dataVersion < 1) {

        const updateColorObject = async (colorObject: any) => {
            for (let color in colorObject) {
                let colorValue = colorObject[color]
                if ( colorValue && (typeof colorValue == "string" || colorValue.h !== undefined) ) {
                    colorObject[color] = {
                        pillColor: colorValue
                    }
                }
            }
        } 

        updateColorObject(plugin.settings.propertyPillColors)
        updateColorObject(plugin.settings.propertyLongtextColors)
        updateColorObject(plugin.settings.tagColors)

        

        //@ts-ignore
        if (plugin.settings.dateFutureColor) {
            //@ts-ignore
            plugin.settings.dateColors.future.pillColor = plugin.settings.dateFutureColor
            //@ts-ignore
            delete plugin.settings.dateFutureColor
        }

        //@ts-ignore
        if (plugin.settings.datePresentColor) {
            //@ts-ignore
            plugin.settings.dateColors.present.pillColor = plugin.settings.datePresentColor
            //@ts-ignore
            delete plugin.settings.datePresentColor
        }

        //@ts-ignore
        if (plugin.settings.datePastColor) {
            //@ts-ignore
            plugin.settings.dateColors.past.pillColor = plugin.settings.datePastColor
            //@ts-ignore
            delete plugin.settings.datePastColor
        }
       
        plugin.settings.dataVersion = 1
        plugin.saveSettings()
    }
}