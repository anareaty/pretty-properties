import PrettyPropertiesPlugin from "src/main";
import { updateDateInputs } from "./updates/updateDates";
import { updateBaseProgress, updateBaseProgressEls } from "./updates/updateBaseProgress";
import { 
    updateBaseCardPills, 
    updateBaseTablePills, 
    updatePill, 
    updateInlineTags, 
    updateLongtext, 
    updatePills 
} from "./updates/updatePills";
import { updateProgress, updateProgressEls } from "./updates/updateProgress";
import { updateHiddenProperty} from "./updates/updateHiddenProperties";
import { updateHiddenPropertiesForContainer } from "./updates/updateHiddenProperties";
import { updateBaseMath, updateBaseMathEls, updateMathForChangedEl } from "./updates/updateMath";
import { updateTagPaneTags } from "./updates/updatePills";
import { updateNoteMath, updateNoteMathEls } from "./updates/updateMath";


export const startObserver = (plugin: PrettyPropertiesPlugin) => {
    plugin.observer = new MutationObserver((mutations) => {
        for (let mutation of mutations) {
            processMutation(mutation, plugin)
        }
    })
    plugin.observer.observe(document, { childList: true, subtree: true });
}


const processMutation = async (mutation: MutationRecord, plugin: PrettyPropertiesPlugin) => {
    let target = mutation.target
    let addedNodes = mutation.addedNodes
    
    if (target instanceof HTMLElement) {

       if (plugin.settings.enableBases) {
            if (target.classList.contains("bases-cards-line")) {
                let parent = target.parentElement
                if (parent instanceof HTMLElement) {
                    updateBaseCardPills(parent, plugin)
                    updateBaseProgress(parent)
                    updateBaseMath(parent, plugin)
                    updateDateInputs(parent, plugin)
                } 
                return
            }
        }

        if (addedNodes.length == 0) return
        

        if (target.classList.contains("metadata-properties")) {
            for (let node of addedNodes) {
                if (node instanceof HTMLElement) {
                    updatePills(node, plugin)
                    updateDateInputs(node, plugin)
                    updateProgress(node, plugin)
                    if (plugin.settings.enableMath) {
                        updateNoteMath(node, plugin)
                    }
                    
                    updateHiddenProperty(node, plugin)
                }
            }
            return
        }


        if (target.classList.contains("multi-select-container")) {
            updatePills(target, plugin)
            return
        }

        if (target.classList.contains("metadata-input-longtext")) {
            updateLongtext(target, plugin)
            if (plugin.settings.enableMath) {
                updateMathForChangedEl(target, plugin)
            }  
            return
        }


        


        if (plugin.settings.enableBases) {

            if (target.classList.contains("multi-select-pill")) {
                let property = target.closest(".bases-td")
                let propName = property?.getAttribute("data-property") || ""
                if (target instanceof HTMLElement) {
                    updatePill(target, propName, plugin)
                }
                return
            }

            if (target.classList.contains("bases-tbody")) {  
                for (let node of addedNodes) {
                    if (node instanceof HTMLElement) {
                        updateDateInputs(node, plugin)
                        updateBaseTablePills(node, plugin)
                        updateBaseProgressEls(node)
                        updateBaseMathEls(node, plugin)
                    }
                }         
                return
            }

            if (target.classList.contains("bases-tr")) {  
                for (let node of addedNodes) {
                    if (node instanceof HTMLElement) {
                        updateDateInputs(node, plugin)
                        updateBaseTablePills(node, plugin)
                        updateBaseProgress(node)
                        updateBaseMath(node, plugin)
                    }
                }         
                return
            }

            if (target.classList.contains("bases-table-cell")) {
                let parent = target.parentElement
                if (parent instanceof HTMLElement) {
                    updateBaseProgress(parent) 
                    updateBaseMath(parent, plugin)
                    updateDateInputs(parent, plugin)
                } 
                return
            }

            if (target.classList.contains("value-list-element")) {
                updateInlineTags(target, plugin)
                return
            }

            if (target.classList.contains("bases-cards-container") || 
            target.classList.contains("bases-cards-group") || 
            target.classList.contains("value-list-container") || 
            target.classList.contains("bases-cards-item")) {
                for (let node of addedNodes) {
                    if (node instanceof HTMLElement) {
                        updateBaseCardPills(node, plugin)
                        updateBaseProgressEls(node)
                        updateBaseMathEls(node, plugin)
                        updateDateInputs(node, plugin) 
                    }
                }
                return
            }

            if (target.classList.contains("bases-cards-property")) {
                updateBaseCardPills(target, plugin)
                updateBaseProgress(target)
                updateBaseMath(target, plugin)
                updateDateInputs(target, plugin)
                return
            }

            
        }
        
        // Hover-popover
        
        if (target.classList.contains("markdown-preview-sizer")) {        
            updatePills(target, plugin)
            updateDateInputs(target, plugin)
            updateProgressEls(target, plugin)
            if (plugin.settings.enableMath) {
                updateNoteMathEls(target, plugin)
            }
            updateHiddenPropertiesForContainer(target, plugin)
            return 
        }


        if (plugin.settings.enableColoredTagsInTagPane && target.className == "" && target.parentElement?.classList.contains("tag-container")) {
            for (let node of addedNodes) {
                if (node instanceof HTMLElement) {
                    updateTagPaneTags(target, plugin)
                }
            }
            return;
        }
    }
}



