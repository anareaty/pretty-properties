import { FrontMatterCache, TFile } from "obsidian";
import PrettyPropertiesPlugin from "src/main";



export const getNestedProperty = (obj: FrontMatterCache, path: string): string | string[] | number | boolean | null | undefined => {
    if (!obj || !path) {
        return undefined;
    }
    let val: unknown


    // Split the path by dots and traverse the object
    const keys = path.split('.');
    let result = obj;

    const isStringsArray = (arr: unknown) => {
        return Array.isArray(arr) && arr.every(i => typeof i === "string")
    }
    
    for (let i = 0; i < keys.length; i++) {
        let key = keys[i]
        if (key) {
            if (result === null || result === undefined) {
                return undefined;
            }

            result = result[key] as FrontMatterCache

            if (i == keys.length - 1) {
                val = result as unknown
            } 
        }   
    }

    if (
        val == null ||
        val == undefined ||
        typeof val == "string" || 
        typeof val == "number" || 
        typeof val == "boolean" ||
        isStringsArray(val) 
    ) {
        return val
    }
    return undefined;
};


export const setNestedProperty = (obj: FrontMatterCache, path: string, value: string | string[] | number | boolean | null | undefined): void => {
    if (!obj || !path) {
        return;
    }
    const keys = path.split('.');
    let current = obj;
    
    // Navigate to the parent of the target property
    for (let i = 0; i < keys.length - 1; i++) {
        const key = keys[i];
        if (key) {
            // Create intermediate objects if they don't exist
            if (current[key] === null || current[key] === undefined || typeof current[key] !== 'object') {
                current[key] = {};
            }
            current = current[key] as FrontMatterCache;
        }
    }
    
    // Set the final property
    let lastKey = keys[keys.length - 1] 
    if (lastKey) {
        current[lastKey] = value;
    }
    
};

/**
 * Deletes a nested property from an object using dot notation.
 * @param obj The object to delete the property from.
 * @param path The path to the property using dot notation (e.g., 'obsidian.icon').
 * @returns true if the property was deleted, false otherwise.
 */
export const deleteNestedProperty = (obj: FrontMatterCache, path: string): boolean => {
    if (!obj || !path) {
        return false;
    }
    const keys = path.split('.');
    let current = obj;
    
    // Navigate to the parent of the target property
    for (let i = 0; i < keys.length - 1; i++) {
        const key = keys[i];
        if (key) {
            if (current[key] === null || current[key] === undefined) {
                return false;
            }
            current = current[key] as FrontMatterCache;
        }
        
    }
    
    // Delete the final property
    const lastKey = keys[keys.length - 1];
    if (lastKey && lastKey in current) {
        delete current[lastKey];
        return true;
    }
    return false;
};

export const removeProperty = (propName: string, plugin: PrettyPropertiesPlugin) => {
    let file = plugin.app.workspace.getActiveFile();
    if (file instanceof TFile) {
        void plugin.app.fileManager.processFrontMatter(file, (fm: FrontMatterCache) => {
            if (getNestedProperty(fm, propName)) {
                deleteNestedProperty(fm, propName);
            }
        });
    }
}

export const getCurrentProperty = (propName: string, plugin: PrettyPropertiesPlugin) => {
    let prop: string | string[] | number | boolean | null | undefined
    let file = plugin.app.workspace.getActiveFile();
    if (file instanceof TFile) {
        let cache = plugin.app.metadataCache.getFileCache(file);
        let frontmatter = cache?.frontmatter;
        if (frontmatter) {
            prop = getNestedProperty(frontmatter, propName);
        }
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

        if (valueTextEl?.instanceOf(HTMLElement)) {
            text = valueTextEl.innerText;
        } else if (valueInputEl?.instanceOf(HTMLInputElement)) {
            text = valueInputEl.value;
        } else if (checkboxEl) {
            e.preventDefault();
            let currentFile = plugin.app.workspace.getActiveFile();
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


export const getPropertyType = (propName: string, plugin: PrettyPropertiesPlugin) => {
    let propertyTypeObject = plugin.app.metadataTypeManager.getPropertyInfo(propName.toLowerCase());
    let propertyType;
    if (propertyTypeObject) {

        propertyType = propertyTypeObject.widget

        // Old versions of Obsidian used property "type" instead of "widget"
        if (!propertyType) {
            let propertyTypeObjectOldVersion = propertyTypeObject as unknown
            if (propertyTypeObjectOldVersion && 
                typeof propertyTypeObjectOldVersion == "object" && 
                "type" in propertyTypeObjectOldVersion) 
            {
                propertyType = propertyTypeObjectOldVersion.type;
            }
        }
    }
    return propertyType
}







