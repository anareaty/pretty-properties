import { View, FileView, setTooltip } from "obsidian";
import PrettyPropertiesPlugin from "src/main";

export const updateViewProgress = async (view: View, plugin: PrettyPropertiesPlugin) => {
    let cache;
    if (view instanceof FileView && view.file) {
        cache = plugin.app.metadataCache.getFileCache(view.file);
    }
    let frontmatter = cache?.frontmatter;

    //@ts-ignore
    let mdEditor = view.metadataEditor;
    let mdContainer = mdEditor?.containerEl;

    if (mdContainer instanceof HTMLElement) {
        let oldProgresses = mdContainer.querySelectorAll(".metadata-property > .metadata-progress-wrapper");
        for (let oldProgress of oldProgresses) {
            oldProgress.remove();
        }
    }

    let props = Object.keys(plugin.settings.progressProperties);

    for (let prop of props) {
        let progressVal = frontmatter?.[prop];

        if (
            progressVal !== undefined &&
            mdContainer instanceof HTMLElement
        ) {
            let propertyKeyEl = mdContainer.querySelector(".metadata-property[data-property-key='" + prop + "'] > .metadata-property-key");

            if (propertyKeyEl instanceof HTMLElement) {
                let maxVal;

                if (plugin.settings.progressProperties[prop].maxNumber) {
                    maxVal =
                        plugin.settings.progressProperties[prop].maxNumber;
                } else {
                    let maxProperty =
                        plugin.settings.progressProperties[prop].maxProperty;
                    maxVal = frontmatter?.[maxProperty];
                }

                if (maxVal) {
                    let progressWrapper = document.createElement("div");
                    progressWrapper.classList.add("metadata-progress-wrapper");
                    let progress = document.createElement("progress");
                    progress.classList.add("metadata-progress");
                    progress.max = maxVal;
                    progress.value = progressVal || 0;
                    let percent = " " + Math.round((progress.value * 100) / progress.max) + " %";
                    setTooltip(progress, percent, {
                        delay: 1,
                        placement: "top"
                    });

                    progressWrapper.append(progress);
                    propertyKeyEl.after(progressWrapper);
                }
            }
        }
    }
}