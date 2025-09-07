import { WorkspaceLeaf, moment } from "obsidian";
import PrettyPropertiesPlugin from "src/main";
import { addClassestoProperties } from "./updatePills";
import { updateDateInputs } from "./updateDates";

export const updateBaseLeafPills = (leaf: WorkspaceLeaf, plugin: PrettyPropertiesPlugin) => {
    if (plugin.settings.enableBases) {
        let containerEl = leaf.view.containerEl;

        let baseTableContainer = containerEl.querySelector(
            ".bases-table-container"
        );

        if (baseTableContainer) {
            const updateTableBasePills = () => {
                if (baseTableContainer!.classList.contains("is-loading")) {
                    if (
                        !containerEl.querySelector(
                            ".bases-table-container:not(.is-loading"
                        )
                    ) {
                        setTimeout(updateTableBasePills, 50);
                        return;
                    }
                }
                addClassestoProperties(leaf.view, plugin);
                updateDateInputs(leaf.view, plugin)
            };
            updateTableBasePills();
        }

        let baseCardsContainer = containerEl.querySelector(
            ".bases-cards-container"
        );

        if (baseCardsContainer) {
            const updateCardsBasePills = () => {
                if (baseCardsContainer!.classList.contains("is-loading")) {
                    if (
                        !containerEl.querySelector(
                            ".bases-cards-container:not(.is-loading"
                        )
                    ) {
                        setTimeout(updateCardsBasePills, 50);
                        return;
                    }
                }

                let pills = containerEl.querySelectorAll(
                    ".bases-cards-property:not([data-property='note.tags']) .value-list-element:not([data-property-pill-value], :has(a.tag))"
                );
                for (let pill of pills) {
                    if (pill instanceof HTMLElement) {
                        let value = pill.innerText.slice(0, 200).trim();
                        if (value.startsWith("#")) {value = value.replace("#", "")}
                        pill.setAttribute("data-property-pill-value", value);
                    }
                }

                let tagPills = containerEl.querySelectorAll(
                    ".bases-cards-property[data-property='note.tags'] .value-list-element:not([data-property-pill-value], :has(a.tag))"
                );
                for (let pill of tagPills) {
                    if (pill instanceof HTMLElement) {
                        let value = pill.innerText.slice(0, 200).trim();
                        if (value.startsWith("#")) {value = value.replace("#", "")}
                        pill.setAttribute("data-tag-value", value);
                    }
                }

                let formulaTagPills = containerEl.querySelectorAll(
                    ".bases-cards-property a.tag:not([data-tag-value])"
                );

                for (let pill of formulaTagPills) {
                    if (pill instanceof HTMLElement) {
                        let value = pill.innerText.slice(0, 200).trim();
                        if (value.startsWith("#")) {value = value.replace("#", "")}
                        pill.setAttribute("data-tag-value", value);
                    }
                }

                let longTexts = containerEl.querySelectorAll(
                    ".bases-cards-line:not(:has(.value-list-container, .input))"
                );
                for (let pill of longTexts) {
                    if (pill instanceof HTMLElement) {
                        let value = pill.innerText.slice(0, 200).trim();
                        if (value) {
                            pill.setAttribute("data-property-longtext-value", value);
                        }
                    }
                }

                let dateInputs = containerEl.querySelectorAll(
                    ".bases-cards-property .metadata-input-text.mod-date"
                );

                for (let input of dateInputs) {
                    if (input instanceof HTMLInputElement) {
                        let value = input.value;
                        let parent = input.parentElement

                        if (parent instanceof HTMLElement) {
                            if (value) {
                            let currentTime = moment().toISOString(true).slice(0, 10);
                            if (currentTime == value) {
                                parent.setAttribute("data-relative-date", "present");
                            } else if (currentTime > value) {
                                parent.setAttribute("data-relative-date", "past");
                            } else {
                                parent.setAttribute("data-relative-date", "future");
                            }
                            } else {
                            parent.setAttribute("data-relative-date", "none");
                            }
                        }
                    }
                }
            };
            updateCardsBasePills();
        }
    }
}