import { MarkdownView, FrontMatterCache, MarkdownRenderer } from "obsidian";
import PrettyPropertiesPlugin from "src/main";

export const updateCoverImages = async (
    view: MarkdownView,
    frontmatter: FrontMatterCache | undefined,
    plugin: PrettyPropertiesPlugin
) => {
    //@ts-ignore
    let mdEditor = view.metadataEditor;
    let mdContainer = mdEditor?.containerEl;
    let coverVal;

    let props = [...plugin.settings.extraCoverProperties];
    props.unshift(plugin.settings.coverProperty);

    for (let prop of props) {
        coverVal = frontmatter?.[prop];
        if (coverVal) break;
    }
    let cssVal = frontmatter?.cssclasses;

    if (mdContainer instanceof HTMLElement) {
        let coverDiv;
        let oldCoverDiv = mdContainer.querySelector(".metadata-side-image");

        if (coverVal && plugin.settings.enableCover) {
            if (coverVal.startsWith("http")) coverVal = "![](" + coverVal + ")";
            if (!coverVal.startsWith("!")) coverVal = "!" + coverVal;
            coverDiv = document.createElement("div");
            coverDiv.classList.add("metadata-side-image");

            if (cssVal && (cssVal.includes("cover-vertical") || cssVal.includes("cover-vertical-cover"))) {
                coverDiv.classList.add("vertical-cover");
            } 
            else if (cssVal && cssVal.includes("cover-vertical-contain")) {
                coverDiv.classList.add("vertical-contain");
            }
            else if (cssVal && cssVal.includes("cover-horizontal-contain")) {
                coverDiv.classList.add("horizontal-contain");
            } 
            else if (cssVal && (cssVal.includes("cover-horizontal") || cssVal.includes("cover-horizontal-cover"))) {
                coverDiv.classList.add("horizontal-cover");
            } 
            else if (cssVal && cssVal.includes("cover-square")) {
                coverDiv.classList.add("square");
            } 
            else if (cssVal && cssVal.includes("cover-circle")) {
                coverDiv.classList.add("circle");
            } 
            else if (cssVal && cssVal.includes("cover-initial-width-2")) {
                coverDiv.classList.add("initial-2");
            }
            else if (cssVal && cssVal.includes("cover-initial-width-3")) {
                coverDiv.classList.add("initial-3");
            }
            else {
                coverDiv.classList.add("initial");
            }

            let coverTemp = document.createElement("div");
            MarkdownRenderer.render(
                plugin.app,
                coverVal,
                coverTemp,
                "",
                plugin
            );
            let image = coverTemp.querySelector("img");
            if (image) {
                coverDiv.append(image);
            }
        }

        if (coverDiv) {
            if (oldCoverDiv) {
                if (coverDiv.outerHTML != oldCoverDiv.outerHTML) {
                    oldCoverDiv.remove();
                    mdContainer.prepend(coverDiv);
                }
            } else {
                mdContainer.prepend(coverDiv);
            }
        } else {
            if (oldCoverDiv) oldCoverDiv.remove();
        }
    }
}