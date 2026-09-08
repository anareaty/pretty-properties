import { MarkdownRenderChild, MarkdownRenderer } from "obsidian";
import PrettyPropertiesPlugin from "src/main";
import { getFormattedString } from "src/utils/formatUtils";


export const updatePropertyFormatting = (
    el: HTMLElement, 
    propName: string, 
    value: string | null,
    type: string,
    propertyFormat: string | undefined, 
    propertyTextFormat: string,

    plugin: PrettyPropertiesPlugin 
) => {





    let propValueEl = el.querySelector(".metadata-property-value")
    if (!(propValueEl?.instanceOf(HTMLElement))) return
    let existingOverlay = el.querySelector(".pp-formatted-value-overlay")



    // Prevent refreshing when meta bind input is active, i.e. the slider is dragged etc. 
    // Only refresh once the dragged element is released

    let activeInput = existingOverlay?.querySelector(".mb-input input:active")
    if (activeInput) {
        let mouseUpEvent = () => {
            if (!(propValueEl?.instanceOf(HTMLElement))) return
            let currentValue = getCurrentPropertyElValue(propValueEl, type)
            updatePropertyFormatting(el, propName, currentValue, type, propertyFormat, propertyTextFormat, plugin)
            document.removeEventListener("mouseup", mouseUpEvent)
        }
        document.addEventListener("mouseup", mouseUpEvent)
        return
    }


    
        


    existingOverlay?.remove()
    el.classList.remove("has-property-formatting")
    

    if (!propertyFormat || !value) return

    let overlayElement = createSpan()
    overlayElement.classList.add("pp-formatted-value-overlay")
    overlayElement.classList.add(type + "-overlay")
    propValueEl.before(overlayElement)

    let formattedValue = value || ""
    formattedValue = computeFormattedValue(plugin, propName, propertyFormat, value)
    setOverlayContent(formattedValue, propertyTextFormat, overlayElement, el, plugin)

    el.classList.add("has-property-formatting")

    return overlayElement
}




export const computeFormattedValue = (
    plugin: PrettyPropertiesPlugin,
    propertyName: string,
    propertyFormat: string,
    currentValue: string | null 
): string =>  {
    const rawText = currentValue || ""

    if (propertyFormat == "{{propertyValue}}") {
        return rawText;
    }

    try {
        return getFormattedString(propertyName, rawText, propertyFormat);
    } catch {
        return rawText;
    }
}







export const clearUnusedRenderComponents = (plugin: PrettyPropertiesPlugin) => {
    plugin.activeRenderComponents = plugin.activeRenderComponents.filter((component: MarkdownRenderChild) => {
        if (!document.body.contains(component.containerEl)) {
            component.unload()
            return false
        }
        return true
    })
}



export const setOverlayContent = (rawContent: string, propertyTextFormat: string, overlayEl: HTMLElement, propertyEl: HTMLElement, plugin: PrettyPropertiesPlugin) => {
	if (propertyTextFormat == "markdown") {
		let sourcePath = propertyEl.getAttribute("data-source-path") || ""
        let renderComponent = new MarkdownRenderChild(overlayEl)
        clearUnusedRenderComponents(plugin)
        plugin.activeRenderComponents.push(renderComponent)
        renderComponent.load();
		void MarkdownRenderer.render(plugin.app, rawContent, overlayEl, sourcePath, renderComponent)
	} else {
		overlayEl.append(rawContent)
	}
}



const getCurrentPropertyElValue = (propValueEl: HTMLElement, type: string) => {
    if (type == "number") {
        let valueInput = propValueEl?.querySelector("input")
        if (valueInput?.instanceOf(HTMLInputElement)) {
            return valueInput.value
        }
    } else if (type == "text") {
        let valueInput = propValueEl?.querySelector(".metadata-input-longtext")
        if (valueInput?.instanceOf(HTMLElement)) {
            return valueInput.textContent
        }
    }
    return null
}



export const getPropertyFormatObj = (propName: string, text: string, plugin: PrettyPropertiesPlugin) => {
    let propertyFormatObj = plugin.settings.propertyFormats[propName]
    let propertyFormat = propertyFormatObj?.format
    let propertyTextFormat = "raw"
    let isMD = plugin.settings.markdownProperties.find(p => p == propName)
    if (isMD) propertyTextFormat = "markdown"

    // Always render as markdown if text is formatted as MathJax
    if (plugin.settings.enableMath) {
        let match = text?.match(/^(\$\$)(.+)(\$\$)$/)
        if (!match) {
            match = text?.match(/^(\$)(.+)(\$)$/)
        }

        if (match) {
            propertyTextFormat = "markdown"
        }
    }

    // We need to create overlay even for empty format if property is set to render as Markdown
    if (!propertyFormat && propertyTextFormat == "markdown") {
      propertyFormat = "{{propertyValue}}"
    }

    

    return {
        format: propertyFormat,
        textFormat: propertyTextFormat
    }

}


