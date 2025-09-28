import PrettyPropertiesPlugin from "src/main";


export const updateHiddenProperty = async (propEl: HTMLElement, plugin: PrettyPropertiesPlugin) => {
    let propName = propEl.getAttribute("data-property-key") || ""
    if (plugin.settings.hiddenProperties.find(p => p == propName)) {
        propEl.classList.add("pp-property-hidden")
    } else {
        propEl.classList.remove("pp-property-hidden")
    }
}


export const updateHiddenPropertiesForContainer = async (container: HTMLElement, plugin: PrettyPropertiesPlugin) => {
    let properties = container.querySelectorAll(".metadata-property")

    for (let propEl of properties) {
        if (propEl instanceof HTMLElement) {
            updateHiddenProperty(propEl, plugin)
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





