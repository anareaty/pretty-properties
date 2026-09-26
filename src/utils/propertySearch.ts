import PrettyPropertiesPlugin from "src/main";
import { GlobalSearchPluginInstance } from "@obsidian-typings/obsidian-public-latest";
import { getNestedProperty } from "./propertyUtils";
import { TFile } from "obsidian";

interface GlobalSearchPluginInstanceExtended extends GlobalSearchPluginInstance {
	openGlobalSearch: (search: string) => void
}

export const registerPropertySearch = (e: PointerEvent, plugin: PrettyPropertiesPlugin) => {
    if (plugin.settings.enablePropertySearch) {
        let targetEl = e.target;
        let searchPlugin = plugin.app.internalPlugins.getEnabledPluginById("global-search") as GlobalSearchPluginInstanceExtended | null

        if (searchPlugin && targetEl instanceof HTMLElement) {

            if ((e.ctrlKey || e.metaKey)) {
                if (targetEl.classList.contains("internal-link")) return
                let propEl = targetEl.closest(".metadata-property");
                if (!propEl) return
                let filePath = propEl.getAttribute("data-source-path")
                if (!filePath) return

                let value = getClickedPropertyValue(e, plugin, filePath);

                if (value !== undefined) {
                    let prop = propEl.getAttribute("data-property-key");

                    if (prop && value && typeof value == "string") {
                        let search = "[" + prop + ': "' + value + '"]';
                        searchPlugin.openGlobalSearch(search);
                    }
                }
            }
        }
    }
}



const getClickedPropertyValue = (e: MouseEvent, plugin: PrettyPropertiesPlugin, filePath: string) => {
    let targetEl = e.target;
    let text;

    if (targetEl instanceof HTMLElement && targetEl.classList.contains("custom-date")) {
        targetEl = targetEl.previousSibling
    }

    if (targetEl instanceof HTMLElement) {
        let valueTextEl =
            targetEl.closest(".metadata-input-longtext") ||
            targetEl.closest(".multi-select-pill-content");
        let valueInputEl =
            targetEl.closest(".metadata-input-number") ||
            targetEl.closest(".metadata-input-text");
        let checkboxEl = targetEl.closest(".metadata-input-checkbox");

        if (valueTextEl?.instanceOf(HTMLElement)) {
            text = valueTextEl.textContent || ""
        } else if (valueInputEl?.instanceOf(HTMLInputElement)) {
            text = valueInputEl.value;
        } else if (checkboxEl) {
            e.preventDefault();
            let currentFile = plugin.app.vault.getAbstractFileByPath(filePath)
            let propEl = targetEl.closest(".metadata-property");
            let prop = propEl!.getAttribute("data-property-key");
            if (currentFile instanceof TFile && prop) {
                let frontmatter = plugin.app.metadataCache.getFileCache(currentFile)?.frontmatter
                if (frontmatter) {
                    text = getNestedProperty(frontmatter, prop);
                }
            }
        }
    }
    return text;
}