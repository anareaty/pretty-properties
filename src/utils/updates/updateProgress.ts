import { setTooltip } from "obsidian";
import PrettyPropertiesPlugin from "src/main";


export const updateProgress = async (propertyEl: HTMLElement, plugin: PrettyPropertiesPlugin) => {
    let propName = propertyEl.getAttribute("data-property-key") || ""
    let progressSettings = plugin.settings.progressProperties[propName]
    let existingProgressWrapper = propertyEl.querySelector(".metadata-progress-wrapper")
		
    if (progressSettings) {
        let maxVal
        if (progressSettings.maxNumber) {
            maxVal = progressSettings.maxNumber
        } else {
            let maxProperty = progressSettings.maxProperty
            let properties = propertyEl.parentElement
            let maxEl = properties?.querySelector("[data-property-key=" + maxProperty+ "] .metadata-input-number")
            if (maxEl instanceof HTMLInputElement) {
                maxVal = maxEl.value
            }
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


export const updateProgressEls = async (container: HTMLElement, plugin: PrettyPropertiesPlugin) => {
    let propertyEls = container.querySelectorAll(".metadata-property")
    for (let propertyEl of propertyEls) {
        if (propertyEl instanceof HTMLElement) {
            updateProgress(propertyEl, plugin)
        }
    }
}