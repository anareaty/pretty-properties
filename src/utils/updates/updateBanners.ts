import { MarkdownRenderer, MarkdownView, FrontMatterCache } from "obsidian";
import PrettyPropertiesPlugin from "src/main";

export const updateBannerImages = async (
    view: MarkdownView,
    frontmatter: FrontMatterCache | undefined,
    plugin: PrettyPropertiesPlugin
) => {
    let contentEl = view.contentEl;
    let bannerContainer;
    let mode = view.getMode();

    if (mode == "preview") {
        bannerContainer = contentEl.querySelector(".markdown-reading-view > .markdown-preview-view");
    }

    if (mode == "source") {
        bannerContainer = contentEl.querySelector(".cm-scroller");
    }

    let bannerVal = frontmatter?.[plugin.settings.bannerProperty];
    let positionVal = frontmatter?.[plugin.settings.bannerPositionProperty]

    if (bannerContainer instanceof HTMLElement) {
        let oldBannerDiv = bannerContainer.querySelector(".banner-image");
        let bannerDiv = document.createElement("div");
        bannerDiv.classList.add("banner-image");

        if (bannerVal && plugin.settings.enableBanner) {
            if (bannerVal.startsWith("http"))
                bannerVal = "![](" + bannerVal + ")";
            if (!bannerVal.startsWith("!")) bannerVal = "!" + bannerVal;
            let bannerTemp = document.createElement("div");

			let sourcePath = view.file?.path || ""
            MarkdownRenderer.render(
                plugin.app,
                bannerVal,
                bannerTemp,
                sourcePath,
                plugin
            );
            let image = bannerTemp.querySelector("img");
            if (image) {
                if (positionVal) {
                    image.setAttribute("style", "object-position: center " + positionVal + "%;")
                }

                bannerDiv.append(image);
            }
        }

        if (oldBannerDiv) {
            if (oldBannerDiv.outerHTML != bannerDiv.outerHTML) {
                oldBannerDiv.remove();
                bannerContainer.prepend(bannerDiv);
            }
        } else {
            bannerContainer.prepend(bannerDiv);
        }
    }
}
