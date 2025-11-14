import { TFile } from "obsidian";
import PrettyPropertiesPlugin from "src/main";

/**
 * Gets a nested property from an object using dot notation.
 * @param obj The object to get the property from.
 * @param path The path to the property using dot notation (e.g., 'obsidian.icon').
 * @returns The value at the specified path, or undefined if not found.
 */
export const getNestedProperty = (obj: any, path: string): any => {
    if (!obj || !path) {
        return undefined;
    }
    // Split the path by dots and traverse the object
    const keys = path.split('.');
    let result = obj;
    for (const key of keys) {
        if (result === null || result === undefined) {
            return undefined;
        }
        result = result[key];
    }
    return result;
};

/**
 * Sets a nested property in an object using dot notation.
 * @param obj The object to set the property in.
 * @param path The path to the property using dot notation (e.g., 'obsidian.icon').
 * @param value The value to set.
 */
export const setNestedProperty = (obj: any, path: string, value: any): void => {
    if (!obj || !path) {
        return;
    }
    const keys = path.split('.');
    let current = obj;
    
    // Navigate to the parent of the target property
    for (let i = 0; i < keys.length - 1; i++) {
        const key = keys[i];
        // Create intermediate objects if they don't exist
        if (current[key] === null || current[key] === undefined || typeof current[key] !== 'object') {
            current[key] = {};
        }
        current = current[key];
    }
    
    // Set the final property
    current[keys[keys.length - 1]] = value;
};

/**
 * Deletes a nested property from an object using dot notation.
 * @param obj The object to delete the property from.
 * @param path The path to the property using dot notation (e.g., 'obsidian.icon').
 * @returns true if the property was deleted, false otherwise.
 */
export const deleteNestedProperty = (obj: any, path: string): boolean => {
    if (!obj || !path) {
        return false;
    }
    const keys = path.split('.');
    let current = obj;
    
    // Navigate to the parent of the target property
    for (let i = 0; i < keys.length - 1; i++) {
        const key = keys[i];
        if (current[key] === null || current[key] === undefined) {
            return false;
        }
        current = current[key];
    }
    
    // Delete the final property
    const lastKey = keys[keys.length - 1];
    if (lastKey in current) {
        delete current[lastKey];
        return true;
    }
    return false;
};

export const removeProperty = async (propName: string, plugin: PrettyPropertiesPlugin) => {
    let file = plugin.app.workspace.getActiveFile();
    if (file instanceof TFile) {
        plugin.app.fileManager.processFrontMatter(file, (fm) => {
            if (getNestedProperty(fm, propName)) {
                deleteNestedProperty(fm, propName);
            }
        });
    }
}

export const getCurrentProperty = (propName: string, plugin: PrettyPropertiesPlugin) => {
    let prop: any;
    let file = plugin.app.workspace.getActiveFile();
    if (file instanceof TFile) {
        let cache = plugin.app.metadataCache.getFileCache(file);
        let frontmatter = cache?.frontmatter;
        prop = getNestedProperty(frontmatter, propName);
    }
    return prop;
}


export const getPropertyValue = (e: MouseEvent, plugin: PrettyPropertiesPlugin) => {
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
                text = getNestedProperty(plugin.app.metadataCache.getFileCache(currentFile)?.frontmatter, prop);
            }
        }
    }
    return text;
}


export const getPropertyType = (propName: string, plugin: PrettyPropertiesPlugin) => {
    //@ts-ignore
    let propertyTypeObject = plugin.app.metadataTypeManager.getPropertyInfo(propName.toLowerCase());
    let propertyType;
    if (propertyTypeObject) {
        propertyType = propertyTypeObject.widget || propertyTypeObject.type;
    }
    return propertyType
}




