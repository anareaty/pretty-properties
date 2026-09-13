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






export const clearUnusedRenderComponents = (plugin: PrettyPropertiesPlugin, overlayEl?: HTMLElement) => {
    plugin.activeRenderComponents = plugin.activeRenderComponents.filter((component: MarkdownRenderChild) => {

        // Unload component if it's container element is not attached to the DOM
        if (!component.containerEl.isConnected) {

            // Check if element should be attached
            // We skip newly rendered elements, because property widgets will render first and be added to the DOM later
            // This way the component will be unloaded only when we change the layout or edit the existing property,
            // but it will not be unloaded when the next property in the same note is rendered
            
            if (!overlayEl || overlayEl.isConnected) {
                component.unload()
                return false
            }
        }
        return true
    })    
}



export const setOverlayContent = (rawContent: string, propertyTextFormat: string, overlayEl: HTMLElement, propertyEl: HTMLElement, plugin: PrettyPropertiesPlugin) => {
	if (propertyTextFormat == "markdown") {
		let sourcePath = propertyEl.getAttribute("data-source-path") || ""

        // We don't have availiable component to render Markdown, so we have to create a new one.
        // We need to unload component after markdown rendering so plugin do not create tons of unused components.
        // However user may chose to use Meta Bind inside Markdown, and it requires the component to stay loaded.
        // Because of that we need to add some logic to unload previously loaded components without breaking Meta Bind
        // We will unload them here and also add events on 'layout-change' and 'active-leaf-change'
        
        let renderComponent = new MarkdownRenderChild(overlayEl)
        renderComponent.load();
		void MarkdownRenderer.render(plugin.app, rawContent, overlayEl, sourcePath, renderComponent)

        // We need to check if element has Meta Bind input in it
        let mbInput = overlayEl.querySelector(".mb-input")

        if (mbInput) {
            // If there is Meta Bind input, store component to unload it later
            plugin.activeRenderComponents.push(renderComponent)
            
        } else {
            // If the is no Meta Bind input, unload immediately for better performance
            renderComponent.unload()
        }

        // Unload previously stored render components that are not used anymore
        clearUnusedRenderComponents(plugin, overlayEl)
        
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



export const getPropertyFormatObj = (propKey: string, text: string, plugin: PrettyPropertiesPlugin) => {

    // Get the real propname instead of the lowercase version
    let propName = plugin.app.metadataTypeManager.getPropertyInfo(propKey.toLowerCase())?.name

    let propertyFormatObj
    let isMD

    if (propName) {
        propertyFormatObj = plugin.settings.propertyFormats[propName]
        isMD = plugin.settings.markdownProperties.find(p => p.toLowerCase() == propName.toLowerCase())
    }
    
    let propertyFormat = propertyFormatObj?.format
    let propertyTextFormat = "raw"

    
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


