import { CachedMetadata, setTooltip, TFile } from "obsidian";
import PrettyPropertiesPlugin from "src/main";
import { getNestedProperty } from "../propertyUtils";


export const updateProgress = async (propertyEl: HTMLElement, plugin: PrettyPropertiesPlugin, sourcePath?: string) => {
    if (propertyEl.classList.contains("bases-td")) {
        return
    }
    
    let propName = propertyEl.getAttribute("data-property-key") || ""
    let progressSettings = plugin.settings.progressProperties[propName]
    let existingProgressWrapper = propertyEl.querySelector(".metadata-progress-wrapper")
	
    if (progressSettings) {
        let maxVal
        if (progressSettings.maxNumber) {
            maxVal = progressSettings.maxNumber
        } else {
            let maxProperty = progressSettings.maxProperty

            if (!sourcePath) {
                sourcePath = propertyEl.getAttribute("data-source-path") || ""
            }

            let cache = plugin.app.metadataCache.getCache(sourcePath)
            maxVal = getNestedProperty(cache?.frontmatter, maxProperty)
        }

        if (maxVal) {  
            let value = 0
            let valueString = ""
            let valueEl = propertyEl.querySelector(".metadata-input-number")
            if (valueEl instanceof HTMLInputElement) {
                valueString = valueEl.value
                value = Number(valueString)
                if (!valueString || !value) value = 0
            }
            
            let percent = Math.round((value * 100) / maxVal) + " %";
            let progress

            if (existingProgressWrapper instanceof HTMLElement) {
                let existingProgressValue = existingProgressWrapper.getAttribute("data-progress-percent")
                if (existingProgressValue == percent) {
                    return
                } else {
                    //update existing progress
                    progress = existingProgressWrapper.querySelector("progress.metadata-progress")
                    if (progress instanceof HTMLProgressElement) {
                        progress.value = value;
                        progress.max = maxVal;
                    }
                    existingProgressWrapper.setAttribute("data-progress-percent", percent)
                }

            } else {
                //create new progress
                let progressWrapper = document.createElement("div");
                progressWrapper.classList.add("metadata-progress-wrapper");
                progressWrapper.setAttribute("data-progress-percent", percent)
                progress = document.createElement("progress");
                progress.classList.add("metadata-progress");
                progress.value = value;
                progress.max = maxVal;

                setTooltip(progress, percent, {
                    delay: 500,
                    placement: "top",
                });
                
                progressWrapper.append(progress);
                let propertyKeyEl = propertyEl.querySelector(".metadata-property-key");

                if (propertyKeyEl instanceof HTMLElement) {
                    propertyKeyEl.after(progressWrapper);
                }
            }

        } else {
        existingProgressWrapper?.remove()
        }
    } else {
        existingProgressWrapper?.remove()
    }
}







export const updateAllProgressElsOnMaxChange = async (file: TFile, cache: CachedMetadata, plugin: PrettyPropertiesPlugin) => {
    for (let prop in plugin.settings.progressProperties) {
        let maxProperty = plugin.settings.progressProperties[prop].maxProperty
        let maxVal = getNestedProperty(cache.frontmatter, maxProperty)
        if (maxVal !== undefined) {
            let numbers = document.querySelectorAll("input.metadata-input-number")
            for (let input of numbers) {
                if (input instanceof HTMLElement) {
                    let num = input.closest(".metadata-property")
                    let sourcePath = num?.getAttribute("data-source-path") || ""
                    if (num instanceof HTMLElement) {
                        updateProgress(num, plugin, sourcePath)
                        input.onchange = () => {
                            if (num instanceof HTMLElement) updateProgress(num, plugin, sourcePath)
                        }
                    }
                }
            }
        }
    }
}