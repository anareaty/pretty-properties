import { MarkdownRenderer } from "obsidian";
import PrettyPropertiesPlugin from "src/main";


export const updatePropertyFormatting = (
    el: HTMLElement, 
    propName: string, 
    value: any,
    type: string,
    propertyFormat: any, 
    propertyTextFormat: string,
    plugin: PrettyPropertiesPlugin
) => {

 

    let propValueEl = el.querySelector(".metadata-property-value")
    if (!(propValueEl instanceof HTMLElement)) return
    let existingOverlay = el.querySelector(".pp-formatted-value-overlay")



    // Prevent refreshing when meta bind input is active, i.e. the slider is dragged etc. 
    // Only refresh once the dragged element is released

    let activeInput = existingOverlay?.querySelector(".mb-input input:active")
    if (activeInput) {
        let mouseUpEvent = () => {
            if (!(propValueEl instanceof HTMLElement)) return
            let currentValue = getCurrentPropertyElValue(propValueEl, type)
            updatePropertyFormatting(el, propName, currentValue, type, propertyFormat, propertyTextFormat, plugin)
            document.removeEventListener("mouseup", mouseUpEvent)
        }
        document.addEventListener("mouseup", mouseUpEvent)
        return
    }


    
        


    existingOverlay?.remove()
    el.classList.remove("has-property-formatting")
    

    if (!propertyFormat) return


    

    let overlayElement = document.createElement("span")
    overlayElement.classList.add("pp-formatted-value-overlay")
    overlayElement.classList.add(type + "-overlay")
    propValueEl.before(overlayElement)

    let formattedValue = computeFormattedValue(plugin, propName, propertyFormat, value)
    setOverlayContent(formattedValue, propertyTextFormat, overlayElement, el, plugin)

    el.classList.add("has-property-formatting")
}




export const computeFormattedValue = (
    plugin: PrettyPropertiesPlugin,
    propertyName: string,
    propertyFormat: unknown,
    currentValue: unknown
): string =>  {
    const rawText = String(currentValue ?? "");
    try {
        return plugin.formatter.format(propertyName, rawText, propertyFormat as any);
    } catch {
        return rawText;
    }
}



export const setOverlayContent = (rawContent: string, propertyTextFormat: string, overlayEl: HTMLElement, propertyEl: HTMLElement, plugin: PrettyPropertiesPlugin) => {
	if (propertyTextFormat == "markdown") {
		let sourcePath = propertyEl.getAttribute("data-source-path") || ""
		MarkdownRenderer.render(plugin.app, rawContent, overlayEl, sourcePath, plugin)
	} else {
		overlayEl.append(rawContent)
	}
}


const getCurrentPropertyElValue = (propValueEl: HTMLElement, type: string) => {
    if (type == "number") {
        let valueInput = propValueEl?.querySelector("input")
        if (valueInput instanceof HTMLInputElement) {
            return valueInput.value
        }
    } else if (type == "text") {
        let valueInput = propValueEl?.querySelector(".metadata-input-longtext")
        if (valueInput instanceof HTMLElement) {
            return valueInput.textContent
        }
    }
    return null
}



export const getPropertyFormatObj = (propName: string, plugin: PrettyPropertiesPlugin) => {
    let propertyFormatObj = plugin.settings.propertyFormats.find(p => p.property == propName)
    let propertyFormat = propertyFormatObj?.format
    let propertyTextFormat = propertyFormatObj?.textFormat || "raw"

    // We need to create overlay even for empty format if property is set to render as Markdown
    if (!propertyFormat && propertyTextFormat == "markdown") {
      propertyFormat = "{{propertyValue}}"
    }

    return {
        format: propertyFormat,
        textFormat: propertyTextFormat
    }

}


