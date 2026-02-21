import PrettyPropertiesPlugin from "src/main"
import { updateImagesForView } from "src/utils/updates/updateElements"
import { around, dedupe } from "monkey-around";
import { MarkdownView } from "obsidian";
import { renderTitleIcon } from "src/utils/updates/updateIcons";
import { updateAllMetadataContainers } from "src/utils/updates/updateHiddenProperties";
import { updateCoverForView } from "src/utils/updates/updateCovers";



export const patchMarkdownView = async (plugin: PrettyPropertiesPlugin) => {

  plugin.patches.uninstallPPMarkdownPatch = around(MarkdownView.prototype, {

    onLoadFile(old) {
      return dedupe("pp-patch-markdown-around-key", old, async function(...args) {
        let view = this

        this.previewMode.renderer.onRendered = new Proxy(this.previewMode.renderer.onRendered, {
          apply(old2, thisArg2, args2) {
            let result = old2.call(thisArg2, ...args2) 
            renderTitleIcon(view, plugin)
            return result
          }
        })
          
        this.editMode.show = new Proxy(this.editMode.show, {
          apply(old2, thisArg2, args2) {
            let result = old2.call(thisArg2, ...args2) 
            renderTitleIcon(view, plugin)
            return result
          }
        })

        this.loadFrontmatter = new Proxy(this.loadFrontmatter, {
          apply(old2, thisArg2, args2) {
            let result = old2.call(thisArg2, ...args2)
            updateCoverForView(this, plugin)
            updateAllMetadataContainers(plugin)
            return result
          }
        })

        await updateImagesForView(this, plugin);
        renderTitleIcon(view, plugin)
        updateAllMetadataContainers(plugin)
        
        return old && old.apply(this, args)
      })
    }
  })
}






