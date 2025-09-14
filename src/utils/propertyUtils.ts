import { TFile } from "obsidian";
import PrettyPropertiesPlugin from "src/main";

export const removeProperty = async (propName: string, plugin: PrettyPropertiesPlugin) => {
    let file = plugin.app.workspace.getActiveFile();
    if (file instanceof TFile) {
        plugin.app.fileManager.processFrontMatter(file, (fm) => {
            if (fm[propName]) delete fm[propName];
        });
    }
}

export const getCurrentProperty = (propName: string, plugin: PrettyPropertiesPlugin) => {
    let prop: any;
    let file = plugin.app.workspace.getActiveFile();
    if (file instanceof TFile) {
        let cache = plugin.app.metadataCache.getFileCache(file);
        let frontmatter = cache?.frontmatter;
        prop = frontmatter?.[propName];
    }
    return prop;
}


export const getPropertyValue = (e: MouseEvent, plugin: PrettyPropertiesPlugin) => {
    let targetEl = e.target;
    let text;
    if (targetEl instanceof HTMLElement) {
        let valueTextEl =
            targetEl.closest(".metadata-input-longtext") ||
            targetEl.closest(".multi-select-pill-content");
        let valueInputEl =
            targetEl.closest(".metadata-input-number") ||
            targetEl.closest(".metadata-input-text");
        let checkboxEl = targetEl.closest(".metadata-input-checkbox");

        if (valueTextEl instanceof HTMLElement) {
            text = valueTextEl.innerText;
        } else if (valueInputEl instanceof HTMLInputElement) {
            text = valueInputEl.value;
        } else if (checkboxEl) {
            e.preventDefault();
            let currentFile = plugin.app.workspace.getActiveFile();
            let propEl = targetEl.closest(".metadata-property");
            let prop = propEl!.getAttribute("data-property-key");
            if (currentFile instanceof TFile && prop) {
                text = plugin.app.metadataCache.getFileCache(currentFile)!.frontmatter![prop];
            }
        }
    }
    return text;
}




