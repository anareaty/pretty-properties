import PrettyPropertiesPlugin from "src/main"
import { getPropertyType } from "./propertyUtils"
import { getTextLightness } from "../updates/updatePills";

declare global {
    interface Window { PrettyPropertiesApi: API; }
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
            return "rgba(var(--color-" + colorSetting + "-rgb), 0.2)"
        } else if (colorSetting == "none") {
            return "transparent"
        } else if (colorSetting == "default") {
            return ""
        } else if (colorSetting && typeof colorSetting != "string") {
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
        } else if (colorSetting && typeof colorSetting != "string") {

            return "hsl(" + colorSetting.h + " ," + colorSetting.s + "% ," + colorSetting.l + "%)"
        } else {
            let bgColorSetting = this.getPropertyBackgroundColorSetting(propName, propValue)
            if (typeof bgColorSetting == "string" && colors.find(c => c == bgColorSetting)) {
                return "rgba(var(--color-" + bgColorSetting + "-rgb), 1)"
            } else if (bgColorSetting && typeof bgColorSetting != "string") {
                let textLightness = getTextLightness(bgColorSetting)
                return "hsl(" + bgColorSetting.h + " ," + bgColorSetting.s + "% ," + textLightness + "%)"
            } 
        }
        return ""
    }

    getPropertyBackgroundColorSetting (propName: string, propValue: string) {
        return this.plugin.settings.propertyColors?.[propName]?.[propValue]?.pillColor || "default"
    }

    getPropertyTextColorSetting (propName: string, propValue: string) {
        return this.plugin.settings.propertyColors?.[propName]?.[propValue]?.textColor || "default"
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