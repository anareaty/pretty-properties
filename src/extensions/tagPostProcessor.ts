import PrettyPropertiesPlugin from "src/main"
import { setPillStyles } from "src/utils/updates/updatePills";


export const registerTagPostProcessor = (plugin: PrettyPropertiesPlugin) => {
    plugin.registerMarkdownPostProcessor((el, ctx) => {
        const tags = el.findAll("a.tag")

        for (let tag of tags) {
            if (tag instanceof HTMLElement) {
                let value = tag.innerText.replace("#", "")
                setPillStyles(tag, "data-tag-value", value, "tag", plugin)
            }
        }
    });
}

