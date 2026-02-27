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

            try {
              renderTitleIcon(view, plugin)
            } catch {
              console.error("Can not render title icon in preview mode")
            }
            
            return result
          }
        })
          
        this.editMode.show = new Proxy(this.editMode.show, {
          apply(old2, thisArg2, args2) {
            let result = old2.call(thisArg2, ...args2) 

            try {
              renderTitleIcon(view, plugin)
            } catch {
              console.error("Can not render title icon in edit mode")
            }
            
            return result
          }
        })

        this.loadFrontmatter = new Proxy(this.loadFrontmatter, {
          apply(old2, thisArg2, args2) {
            let result = old2.call(thisArg2, ...args2)

            try {
              updateCoverForView(this, plugin)  
            } catch {
              console.error("Can not update cover for markdown view")
            }

            try {
              updateAllMetadataContainers(plugin) 
            } catch {
              console.error("Can not update metadata containers on loading frontmatter")
            }
            
            
            return result
          }
        })


        try {
          await updateImagesForView(this, plugin);
        } catch {
          console.error("Can not update images for file view")
        }
        


        try {
          renderTitleIcon(view, plugin)
        } catch {
          console.error("Can not render title icon on file load")
        }

        
        try {
          updateAllMetadataContainers(plugin) 
        } catch {
          console.error("Can not update metadata containers on file load")
        }
        
        return old && old.apply(this, args)
      })
    }
  })
}






