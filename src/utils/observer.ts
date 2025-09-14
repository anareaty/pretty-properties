import { WorkspaceLeaf } from "obsidian";
import PrettyPropertiesPlugin from "src/main";
import { updateDateInputs } from "./updates/updateDates";
import { updateBaseLeafPills } from "./updates/updateBasePills";
import { updateBaseLeafProgress } from "./updates/updateBaseProgress";
import { updateViewProgress } from "./updates/updateProgress";
import { updatePill } from "./updates/updatePills";
import { updateHiddenProperty } from "./updates/updateHiddenProperties";
import { setPillStyles } from "./updates/updatePills";
import { updateCardPill } from "./updates/updatePills";

export const startObservingLeaf = (leaf: WorkspaceLeaf, type: string, plugin: PrettyPropertiesPlugin) => {

    /*
    let view = leaf.view;
    let targetNode = view.containerEl;
    let observer = new MutationObserver((mutations) => {

        let baseMutation;
        let multiSelectMutation;
        let progressMutation;
        
        for (let mutation of mutations) {
            let target = mutation.target;

            if (target instanceof HTMLElement) {
                if (
                    target.classList.contains("bases-view") ||
                    target.classList.contains("bases-table-container") ||
                    target.classList.contains("bases-tbody") ||
                    target.classList.contains("bases-tr") ||
                    target.classList.contains("bases-cards-container") ||
                    target.classList.contains("bases-cards-group") ||
                    target.classList.contains("bases-cards-line") ||
                    target.classList.contains("bases-cards-item")
                ) {
                    baseMutation = true;
                    break;
                }

                if (target.classList.contains("metadata-properties")) {
                    multiSelectMutation = true;
                    progressMutation = true;
                    break;
                }

                if (
                    target.classList.contains("multi-select-container") ||
                    target.classList.contains("value-list-container") ||
                    target.classList.contains("metadata-input-longtext")
                ) {
                    multiSelectMutation = true;
                    if (progressMutation) break;
                }

                let progressEl = target.closest(
                    '[data-property*="formula.pp_progress"]'
                );

                if (
                    progressEl &&
                    target.classList.contains("bases-rendered-value")
                ) {
                    progressMutation = true;
                    if (multiSelectMutation) break;
                }
            }
        }

        if (multiSelectMutation) {
            addClassestoProperties(view, plugin);
            updateDateInputs(view, plugin)
            updateBaseLeafPills(leaf, plugin);
        }
        if (progressMutation) {
            updateViewProgress(view, plugin);
            updateBaseLeafProgress(leaf, plugin);
        }

        if (baseMutation) {
            updateBaseLeafPills(leaf, plugin);
            updateBaseLeafProgress(leaf, plugin);
        }

    });
    observer.observe(targetNode, { childList: true, subtree: true });
    plugin.observers.push(observer);

    */
}






export const startGlobalObserver = (plugin: PrettyPropertiesPlugin) => {

    plugin.globalObserver = new MutationObserver((mutations) => {
        for (let mutation of mutations) {
            processMutation(mutation, plugin)
        }
    })

    plugin.globalObserver.observe(document, { childList: true, subtree: true });
}




const processMutation = async (mutation: MutationRecord, plugin: PrettyPropertiesPlugin) => {

    let target = mutation.target
    let addedNodes = mutation.addedNodes

    if (target instanceof HTMLElement) {

        if (target.classList.contains("metadata-properties")) {
            
            for (let node of addedNodes) {
                if (node instanceof HTMLElement && node.classList.contains("metadata-property")) {
                    let propName = node.getAttribute("data-property-key") || ""
                    updateHiddenProperty(node, propName, plugin)
                    let addedPills = node.querySelectorAll(".multi-select-pill")
                    for (let pill of addedPills) {
                        if (pill instanceof HTMLElement) {
                            updatePill(pill, propName, plugin)
                        }
                    }
                }
            }
        
            
            return
        }

        if (target.classList.contains("multi-select-container")) {

            let property = target.closest(".metadata-property")
            if (property instanceof HTMLElement) {
                let propName = property.getAttribute("data-property-key") || ""
                
                for (let node of addedNodes) {
                    if (node instanceof HTMLElement && node.classList.contains("multi-select-pill")) {
                        updatePill(node, propName, plugin)
                    }
                }
            }

            return
        }



        if (target.classList.contains("bases-tbody")) {


            /*
            
            for (let node of addedNodes) {
                if (node instanceof HTMLElement) {

                    let properties = node.querySelectorAll(".bases-td")
                    for (let property of properties) {
                        if (property instanceof HTMLElement) {
                            let propName = property.getAttribute("data-property") || ""
                            if (propName == "note.tags") {propName = "tags"}
                            let addedPills = property.querySelectorAll(".multi-select-pill")
                            for (let pill of addedPills) {
                                if (pill instanceof HTMLElement) {
                                    updatePill(pill, propName, plugin)
                                }
                            }
                        }
                    }

                    updateTagsInElement(node, plugin)
                }
            }

            */

            updateTablePillsInAddedNodes(addedNodes, plugin)

            return
        }


        if (target.classList.contains("bases-tr")) {

            /*
            
            for (let node of addedNodes) {
                if (node instanceof HTMLElement && node.classList.contains("bases-td")) {
                    if (node instanceof HTMLElement) {
                        let propName = node.getAttribute("data-property") || ""
                        if (propName == "note.tags") {propName = "tags"}
                        let addedPills = node.querySelectorAll(".multi-select-pill")
                        for (let pill of addedPills) {
                            if (pill instanceof HTMLElement) {
                                updatePill(pill, propName, plugin)
                            }
                        }
                    }
                    
                    updateTagsInElement(node, plugin)
                }
            }

            */

            updateTablePillsInAddedNodes(addedNodes, plugin)
            return
        }


        if (target.classList.contains("multi-select-pill")) {

            /*
            let ancestor = target.parentElement?.parentElement?.parentElement
            let propName = ""
            if (ancestor?.classList.contains("metadata-property")) {
                propName = ancestor.getAttribute("data-property-key") || ""
            } else if (ancestor?.classList.contains("bases-td")) {
                propName = ancestor.getAttribute("data-property") || ""
                if (propName == "note.tags") {propName = "tags"}
            }

            updatePill(target, propName, plugin)

            */

            updateTablePill(target, plugin)
            return
        }



        if (target.classList.contains("value-list-element")) {

            //let ancestor = target.parentElement?.parentElement?.parentElement
            //if (ancestor?.classList.contains("bases-td")) {
                updateTagsInElement(target, plugin)
            //}
            return
        }


        if (target.classList.contains("bases-cards-container")) {
            for (let node of addedNodes) {
                if (node instanceof HTMLElement) {
                    let properties = node.querySelectorAll(".bases-cards-property")

                    for (let property of properties) {
                        let propName = property.getAttribute("data-property") || ""
                        let addedPills = property.querySelectorAll(".value-list-element:not(:has(a.tag))")
                        for (let pill of addedPills) {
                            if (pill instanceof HTMLElement) {
                                updateCardPill(pill, propName, plugin)
                            }
                        }
                    }
                    
                    updateTagsInElement(node, plugin)
                }
            }
            return
        }




        if (target.classList.contains("bases-cards-group")) {
            for (let node of addedNodes) {
                if (node instanceof HTMLElement) {

                    let properties = node.querySelectorAll(".bases-cards-property")
                    for (let property of properties) {
                        let propName = property.getAttribute("data-property") || ""
                        let addedPills = property.querySelectorAll(".value-list-element:not(:has(a.tag))")
                        for (let pill of addedPills) {
                            if (pill instanceof HTMLElement) {
                                updateCardPill(pill, propName, plugin)
                            }
                        }
                    }
                    
                    updateTagsInElement(node, plugin)
                }
            }
            return
        }






        if (target.classList.contains("value-list-container")) {

            let ancestor = target.parentElement?.parentElement
            if (ancestor?.classList.contains("bases-cards-property")) {
                let propName = ancestor.getAttribute("data-property") || "" 
                let pills = target.querySelectorAll(".value-list-element:not(:has(a.tag))")
                for (let pill of pills) {
                    if (pill instanceof HTMLElement) {
                        updateCardPill(pill, propName, plugin)
                    }
                }
                updateTagsInElement(target, plugin)
                
            }

            return
        }


        if (target.classList.contains("bases-cards-item")) {
            for (let node of addedNodes) {
                
                if (node instanceof HTMLElement) {
                    let propName = node.getAttribute("data-property") || ""
                    let addedPills = node.querySelectorAll(".value-list-element:not(:has(a.tag))")
                    for (let pill of addedPills) {
                        if (pill instanceof HTMLElement) {
                            updateCardPill(pill, propName, plugin)
                        }
                    }
                    
                    
                    updateTagsInElement(node, plugin)
                }
            }
            return
        }


        console.log(target)


        

        

        if (target.closest(".hover-popover")) {
            let properties = target.querySelectorAll(".metadata-property")
            for (let property of properties) {
                if (property instanceof HTMLElement) {
                    let propName = property.getAttribute("data-property-key") || ""
                    updateHiddenProperty(property, propName, plugin)
                    let addedPills = property.querySelectorAll(".multi-select-pill")
                    for (let pill of addedPills) {
                        if (pill instanceof HTMLElement) {
                            updatePill(pill, propName, plugin)
                        }
                    }
                }
            }
            return
        }


        
    }
}






const updateTagsInElement = (el: HTMLElement, plugin: PrettyPropertiesPlugin) => {
    let tags = el.querySelectorAll("a.tag")
    for (let tag of tags) {
        if (tag instanceof HTMLElement) {
            let value = tag.innerText.replace("#", "")
            setPillStyles(tag, "data-tag-value", value, "tag", plugin)
        }
    }
}



const updateTablePill = (pill: HTMLElement, plugin: PrettyPropertiesPlugin) {
    let property = pill.closest(".bases-td")
    let propName = property?.getAttribute("data-property") || ""
    if (pill instanceof HTMLElement) {
        updatePill(pill, propName, plugin)
    }
}



const updateTablePillsInAddedNodes = (addedNodes: NodeList, plugin: PrettyPropertiesPlugin) => {
    for (let node of addedNodes) {
        if (node instanceof HTMLElement) {
            
            let addedPills = node.querySelectorAll(".multi-select-pill")
            for (let pill of addedPills) {
                if (pill instanceof HTMLElement) {
                    updateTablePill(pill, plugin)
                }
            }

            updateTagsInElement(node, plugin)
        }
    }
}











