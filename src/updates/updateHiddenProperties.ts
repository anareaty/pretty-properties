import PrettyPropertiesPlugin from "src/main";
import { CanvasView, MetadataEditor, EmbedMarkdownComponent } from "@obsidian-typings/obsidian-public-latest";
import { MarkdownView } from "obsidian";



export const updateHiddenCSSClasses = (propEl: HTMLElement, propName: string, plugin: PrettyPropertiesPlugin) => {
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
}




// Update metadata editor when properties are edited in the note
// We have to update hidden statuses for all properties and the whole block
// It also helps us to handle property renaming

export const updateMetadataEditor = (metadataEditor: MetadataEditor, plugin: PrettyPropertiesPlugin) => {
    let mcHidden = true

    for (let r of metadataEditor.rendered) {

        let propEl = r.containerEl
        updateHiddenCSSClasses(propEl, r.entry.key, plugin)

        if (propEl.classList.contains("pp-property-hidden")) {
            continue
        }

        if (r.entry.value === null || r.entry.value === "") {
            if (propEl.classList.contains("pp-property-hidden-when-empty") || 
            plugin.settings.hideAllEmptyProperties) {
            continue
            }
        }
        mcHidden = false
    }
    metadataEditor.containerEl.classList.toggle("pp-mc-hidden", mcHidden)
}






// Update all metadata editors to update hidden properties 
// Useful when settings are changed
// We don't need to update metadata editor in hover popover 
// because it is probably not active when this function is called

export const updateProperties = (plugin: PrettyPropertiesPlugin) => {
    
    let leaves = plugin.app.workspace.getLeavesOfType("markdown");
    for (let leaf of leaves) {
        let view = leaf.view
        if (view instanceof MarkdownView) {
            updateMetadataEditor(view.metadataEditor, plugin)
        }
    }

    let canvasLeaves = plugin.app.workspace.getLeavesOfType("canvas");
    for (let leaf of canvasLeaves) {
        let view = leaf.view as CanvasView

        view.canvas?.nodes?.forEach(node => {
            let nodeView = node.child as EmbedMarkdownComponent

            if (nodeView) {
                if ("metadataEditor" in nodeView) {
                    let metadataEditor = nodeView.metadataEditor as MetadataEditor
                    updateMetadataEditor(metadataEditor, plugin)
                }
            }
        })
    }

    let propLeaves = plugin.app.workspace.getLeavesOfType("file-properties");
    for (let leaf of propLeaves) {
        let view = leaf.view
        if ("metadataEditor" in view) {
            let metadataEditor = view.metadataEditor as MetadataEditor
            updateMetadataEditor(metadataEditor, plugin)
        }
    }
}


