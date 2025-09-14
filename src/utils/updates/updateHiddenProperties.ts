import PrettyPropertiesPlugin from "src/main";
import { WorkspaceLeaf } from "obsidian";


export const updateHiddenProperty = async (propEl: HTMLElement, propName: string, plugin: PrettyPropertiesPlugin) => {
    if (plugin.settings.hiddenProperties.find(p => p == propName)) {
        propEl.classList.add("hidden")
    } else {
        propEl.classList.remove("hidden")
    }
}


export const updateHiddenPropertiesForLeaf = async (leaf: WorkspaceLeaf, plugin: PrettyPropertiesPlugin) => {
    let view = leaf.view
    let container = view.containerEl;
    let properties = container.querySelectorAll(".metadata-property")

    for (let propEl of properties) {
        if (propEl instanceof HTMLElement) {
            let prop = propEl.getAttribute("data-property-key") || ""
            updateHiddenProperty(propEl, prop, plugin)
        }
    }
}


export const updateHiddenProperties = async (plugin: PrettyPropertiesPlugin) => {
    let leaves = plugin.app.workspace.getLeavesOfType("markdown");
    for (let leaf of leaves) {
        updateHiddenPropertiesForLeaf(leaf, plugin)
    }
}





