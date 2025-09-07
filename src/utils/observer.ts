import { WorkspaceLeaf } from "obsidian";
import PrettyPropertiesPlugin from "src/main";
import { addClassestoProperties } from "./updates/updatePills";
import { updateDateInputs } from "./updates/updateDates";
import { updateBaseLeafPills } from "./updates/updateBasePills";
import { updateBaseLeafProgress } from "./updates/updateBaseProgress";
import { updateViewProgress } from "./updates/updateProgress";

export const startObservingLeaf = (leaf: WorkspaceLeaf, type: string, plugin: PrettyPropertiesPlugin) => {
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
}