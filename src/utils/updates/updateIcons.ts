import { MarkdownView, FrontMatterCache, getIcon, MarkdownRenderer } from "obsidian";
import PrettyPropertiesPlugin from "src/main";

export const updateIcons = async (
    view: MarkdownView,
    frontmatter: FrontMatterCache | undefined,
    plugin: PrettyPropertiesPlugin
) => {
    let contentEl = view.contentEl;
    let iconContainer;
    let mode = view.getMode();

    if (mode == "preview") {
        iconContainer = contentEl.querySelector(".markdown-reading-view > .markdown-preview-view");
    }

    if (mode == "source") {
        iconContainer = contentEl.querySelector(".cm-scroller");
    }

    let iconVal = frontmatter?.[plugin.settings.iconProperty];

    if (iconContainer instanceof HTMLElement) {
        let oldIconDiv = iconContainer.querySelector(".icon-wrapper");
        let iconDiv = document.createElement("div");
        iconDiv.classList.add("icon-wrapper");

        if (iconVal && plugin.settings.enableIcon) {
            let image:
                | HTMLDivElement
                | HTMLImageElement
                | SVGSVGElement
                | null = getIcon(iconVal);

            if (!image) {
                let iconLink = iconVal;
                if (iconLink.startsWith("http"))
                    iconLink = "![](" + iconLink + ")";
                if (!iconLink.startsWith("!")) iconLink = "!" + iconLink;
                let iconTemp = document.createElement("div");
                MarkdownRenderer.render(
                    plugin.app,
                    iconLink,
                    iconTemp,
                    "",
                    plugin
                );
                image = iconTemp.querySelector("img");
            }

            if (!image) {
                image = document.createElement("div");
                image.classList.add("pp-text-icon");
                let symbolArr = [...iconVal];
                let iconSymbol = symbolArr[0];
                image.append(iconSymbol);
            }

            if (image) {
                image.classList.add("pp-icon");
				let iconOuter = iconDiv.createEl("div", {
                    cls: "icon-outer",
                });
                let iconSizer = iconOuter.createEl("div", {
                    cls: "icon-sizer",
                });
                let iconImage = iconSizer.createEl("div", {
                    cls: "icon-image",
                });
                iconImage.append(image);
            }
        }

        if (oldIconDiv) {
            if (oldIconDiv.outerHTML != iconDiv.outerHTML) {
                oldIconDiv.remove();
                iconContainer.prepend(iconDiv);
            }
        } else {
            iconContainer.prepend(iconDiv);
        }
    }
}
