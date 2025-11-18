import PrettyPropertiesPlugin from "src/main"
import { getPropertyType } from "./propertyUtils"
import { getTextLightness } from "./updates/updatePills";

declare global {
    interface Window { PrettyPropertiesApi: any; }
}
window.PrettyPropertiesApi = window.PrettyPropertiesApi || {}

const colors = [
    "red",
    "orange",
    "yellow",
    "green",
    "cyan",
    "blue",
    "purple",
    "pink"
];

export class API {
    plugin: PrettyPropertiesPlugin

    constructor(plugin: PrettyPropertiesPlugin) {
		this.plugin = plugin
	}

    

    getPropertyBackgroundColorValue(propName: string, propValue: string) {
        let colorSetting = this.getPropertyBackgroundColorSetting(propName, propValue)
        if (typeof colorSetting == "string" && colors.find(c => c == colorSetting)) {
            return "rgba(var(--color-" + colorSetting + "-rgb), 0.3)"
        } else if (colorSetting == "none") {
            return "transparent"
        } else if (colorSetting == "default") {
            return ""
        } else if (colorSetting.h !== undefined) {
            return "hsl(" + colorSetting.h + " ," + colorSetting.s + "% ," + colorSetting.l + "%)"
        }
        return ""
    }

    getPropertyTextColorValue (propName: string, propValue: string) {
        let colorSetting = this.getPropertyTextColorSetting(propName, propValue)
        if (typeof colorSetting == "string" && colors.find(c => c == colorSetting)) {
            return "rgba(var(--color-" + colorSetting + "-rgb), 1)"
        } else if (colorSetting == "none") {
            return "transparent"
        } else if (colorSetting != "default") {
            console.log(colorSetting)
            return "hsl(" + colorSetting.h + " ," + colorSetting.s + "% ," + colorSetting.l + "%)"
        } else {
            let bgColorSetting = this.getPropertyBackgroundColorSetting(propName, propValue)
            if (typeof bgColorSetting == "string" && colors.find(c => c == bgColorSetting)) {
                return "rgba(var(--color-" + bgColorSetting + "-rgb), 1)"
            } else if (bgColorSetting.h !== undefined) {
                let textLightness = getTextLightness(bgColorSetting)
                return "hsl(" + bgColorSetting.h + " ," + bgColorSetting.s + "% ," + textLightness + "%)"
            } 
        }
        return ""
    }

    getPropertyBackgroundColorSetting (propName: string, propValue: string) {
        let propType = getPropertyType(propName, this.plugin)
        if (propType == "text") {
            return this.plugin.settings.propertyLongtextColors?.[propValue]?.pillColor || "default"
        } else if (propType == "multitext" || propType == "aliases") {
            return this.plugin.settings.propertyPillColors?.[propValue]?.pillColor || "default"
        } else if (propType == "tags") {
            return this.plugin.settings.tagColors?.[propValue]?.pillColor || "default"
        }
    }

    getPropertyTextColorSetting (propName: string, propValue: string) {
        let propType = getPropertyType(propName, this.plugin)
        if (propType == "text") {
            return this.plugin.settings.propertyLongtextColors?.[propValue]?.textColor || "default"
        } else if (propType == "multitext" || propType == "aliases") {
            return this.plugin.settings.propertyPillColors?.[propValue]?.textColor || "default"
        } else if (propType == "tags") {
            return this.plugin.settings.tagColors?.[propValue]?.textColor || "default"
        }
    }

    setPPColorStyles (el: HTMLElement, propName: string, propValue: string) {
        let bgColor = this.getPropertyBackgroundColorValue(propName, propValue)
        let textColor = this.getPropertyTextColorValue(propName, propValue)
        el.setCssProps({
            "background-color": bgColor,
            "color": textColor
        })

        
    }

    setPPTextColor (el: HTMLElement, propName: string, propValue: string) {
        let textColor = this.getPropertyTextColorValue(propName, propValue)
        el.setCssProps({
            "color": textColor
        })
    }

    setPPBackgroundColor (el: HTMLElement, propName: string, propValue: string) {
        let bgColor = this.getPropertyBackgroundColorValue(propName, propValue)
        el.setCssProps({
            "background-color": bgColor
        })
    }
}

export const createApi = (plugin: PrettyPropertiesPlugin) => {
    plugin.api = new API(plugin)
    window.PrettyPropertiesApi = plugin.api
}