// Share property colors with Notebook Navigator plugin

import { HSL, Plugin } from "obsidian"
import PrettyPropertiesPlugin from "src/main"
import { PillColorSettings } from "src/settings/settings"
import { updateAllProperties } from "src/updates/updateElements";


interface NNPlugin extends Plugin {
    api: NNAPI
}



interface NNAPI {
    on: (event: string, callback: () => void) => void,
    metadata: {
        getTagMeta: (tagVal: string) => PropertyMetadata,
        getPropertyMeta: (nodeId: string) => PropertyMetadata,
        setTagMeta: (tagVal: string, meta: PropertyMetadata) => void,
        setPropertyMeta: (nodeId: string, meta: PropertyMetadata) => void
    },
    propertyNodes: {
        buildValue: (key: string, value: string) => string
    }
}


interface PropertyMetadata {
    color?: string;
    backgroundColor?: string;
    icon?: string;
}


const getNNApi = (plugin: PrettyPropertiesPlugin) => {
    let nn = plugin.app.plugins.getPlugin("notebook-navigator") as NNPlugin
    return nn?.api
}






export const registerNNListener = (plugin: PrettyPropertiesPlugin) => {
    let nnApi = getNNApi(plugin)
    if (!nnApi) return

    nnApi.on("property-changed", () => {
        if (plugin.settings.preferNNColors) {
            updateAllProperties(plugin)
        }
    })
}






export const getNNColorSetting = (
    propName: string,
    propVal: string, 
    plugin: PrettyPropertiesPlugin
) => {

    if (!plugin.settings.preferNNColors) return

    let nnApi = getNNApi(plugin)
    if (!nnApi) return

    let meta

    if (propName == "tags") {
        meta = nnApi.metadata.getTagMeta(propVal)
    } else {
        let propId = nnApi.propertyNodes.buildValue(propName, propVal)
        meta = nnApi.metadata.getPropertyMeta(propId)
    }

    let NNColorSetting: PillColorSettings = {}

    if (meta) {
        let color = meta.color
        let bgColor = meta.backgroundColor

        if (color && typeof color == "string" && color.startsWith("#")) {
            let nnColor = convertHexToHSL(color)
            if (nnColor) {
                NNColorSetting.textColor = nnColor
            }
        }

        if (bgColor && typeof bgColor == "string" && bgColor.startsWith("#")) {
            let nnBgColor = convertHexToHSL(bgColor)
            if (nnBgColor) {
                NNColorSetting.pillColor = nnBgColor
            }
        }
    }

    return NNColorSetting
}





export const setNotebookNavigatorColors = (
    pillColorSettings: PillColorSettings,
    propName: string, 
    propVal: string, 
    plugin: PrettyPropertiesPlugin
) => {

    if (!plugin.settings.enableSetNNColors) return

    let nnApi = getNNApi(plugin)
    if (!nnApi) return



    let pillColor = pillColorSettings["pillColor"]
    let textColor = pillColorSettings["textColor"]

    setNotebookNavigatorColor(pillColor, propName, propVal, "pillColor", nnApi)
    setNotebookNavigatorColor(textColor, propName, propVal, "textColor", nnApi)
}




export const setNotebookNavigatorColor = (
    color: string | HSL | undefined, 
    propName: string, 
    propVal: string, 
    colorType: string, 
    nnApi: NNAPI
) => {



  let themeColors = [
    "red",
    "orange",
    "yellow",
    "green",
    "cyan",
    "blue",
    "purple",
    "pink"
  ]

  let meta: Record<string, string | null> = {}

  if (typeof color == "string" && themeColors.find(c => c == color)) {
    if (colorType == "pillColor") {
      meta.backgroundColor = "rgba(var(--color-" + color + "-rgb), 0.25)"
    } else if (colorType == "textColor") {
      meta.color = "rgba(var(--color-" + color + "-rgb), 1)"
    }
  } else if (color == "accent") {
    if (colorType == "pillColor") {
      meta.backgroundColor = "hsla(var(--interactive-accent-hsl), 0.25)"
    } else if (colorType == "textColor") {
      meta.color = "var(--text-accent)"
    }
  } 

  else if (color && typeof color != "string") {
    let hslString = color.h + " ," + color.s + "% ," + color.l + "%";
    if (colorType == "pillColor") {
      meta.backgroundColor = "hsl(" + hslString + ")"
    } else if (colorType == "textColor") {
        let hslStringText = color.h + " ," + color.s + "% ," + color.l + "%";
        meta.color = "hsl(" + hslStringText + ")"
    }
  }
  
  else {

    
    if (colorType == "pillColor") {
      meta.backgroundColor = null
    } else if (colorType == "textColor") {
      meta.color = null
    }
  }

  if (propName == "tags") {
    nnApi.metadata.setTagMeta(propVal, meta)
  } else {

    let propId = nnApi.propertyNodes.buildValue(propName, propVal)
    nnApi.metadata.setPropertyMeta(propId, meta)
  }
}



const convertHexToHSL = (hex: string): HSL | undefined => {
  hex = hex.replace(/#/g, '');
    if (hex.length === 3) {
        hex = hex.split('').map(function (hex) {
            return hex + hex;
        }).join('');
    }

    hex = hex.slice(0, 6)

    let result = /^([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})[\da-z]{0,0}$/i.exec(hex);
    if (!result || !result[1] || !result[2] || !result[3]) return

    let r = parseInt(result[1], 16);
    let g = parseInt(result[2], 16);
    let b = parseInt(result[3], 16);
    r = r / 255
    g = g / 255
    b = b / 255
    let max = Math.max(r, g, b),
        min = Math.min(r, g, b);
    let h = 0
    let s, l = (max + min) / 2;
    if (max == min) {
        h = s = 0;
    } else {
        let d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch (max) {
            case r:
                h = (g - b) / d + (g < b ? 6 : 0);
                break;
            case g:
                h = (b - r) / d + 2;
                break;
            case b:
                h = (r - g) / d + 4;
                break;
        }
        h /= 6;
    }
    s = s * 100;
    s = Math.round(s);
    l = l * 100;
    l = Math.round(l);
    h = Math.round(360 * h);

    return { h, s, l }
}