import PrettyPropertiesPlugin from "src/main";


export const updateHiddenProperty = async (propEl: HTMLElement, plugin: PrettyPropertiesPlugin) => {
    let propName = propEl.getAttribute("data-property-key") || ""
    if (plugin.settings.hiddenProperties.find(p => p.toLowerCase() == propName.toLowerCase())) {
        propEl.classList.add("pp-property-hidden")
    } else {
        propEl.classList.remove("pp-property-hidden")
    }

    if (plugin.settings.hiddenWhenEmptyProperties.find(p => p.toLowerCase() == propName.toLowerCase())) {
        propEl.classList.add("pp-property-hidden-when-empty")
    } else {
        propEl.classList.remove("pp-property-hidden-when-empty")
    }

    let metadataContainer = propEl.closest(".metadata-container")
    if (metadataContainer instanceof HTMLElement) {
        hideMetadataContainerIfAllPropertiesHidden(metadataContainer)
    }
}



export const hideMetadataContainerIfAllPropertiesHidden = (metadataContainer: HTMLElement) => {

    let propertiesNotHidden = metadataContainer.querySelectorAll(".metadata-property:not(.pp-property-hidden, .is-empty.pp-property-hidden-when-empty)")
    
    //console.log(metadataContainer.querySelectorAll(".metadata-property"))
    
    let propertiesNotEmptyOrHidden = metadataContainer.querySelectorAll(".metadata-property:not(.pp-property-hidden, .is-empty)")

    if (propertiesNotHidden.length == 0) {
        metadataContainer.classList.add("pp-mc-hidden")
    } else {
        metadataContainer.classList.remove("pp-mc-hidden")
    }

    if (propertiesNotEmptyOrHidden.length == 0) {
        metadataContainer.classList.add("pp-mc-empty-hidden")
    } else {
        metadataContainer.classList.remove("pp-mc-empty-hidden")
    }
}



export const updateAllMetadataContainers = () => {

    let metadataContainers = document.querySelectorAll(".metadata-container")
    for (let metadataContainer of metadataContainers) {
        if (metadataContainer instanceof HTMLElement) {
            hideMetadataContainerIfAllPropertiesHidden(metadataContainer)
        }
    }
}






export const updateHiddenPropertiesForContainer = async (container: HTMLElement, plugin: PrettyPropertiesPlugin) => {
    let properties = container.querySelectorAll(".metadata-property")

    
    for (let propEl of properties) {
        if (propEl instanceof HTMLElement) {
            updateHiddenProperty(propEl, plugin);
        }
    }
}


export const updateHiddenProperties = async (plugin: PrettyPropertiesPlugin) => {
    
    let leaves = plugin.app.workspace.getLeavesOfType("markdown");
    for (let leaf of leaves) {
        let view = leaf.view
        let container = view.containerEl;
        updateHiddenPropertiesForContainer(container, plugin)
    }

    let propLeaves = plugin.app.workspace.getLeavesOfType("file-properties");
    for (let leaf of propLeaves) {
        let view = leaf.view
        let container = view.containerEl;
        updateHiddenPropertiesForContainer(container, plugin)
    }
}





