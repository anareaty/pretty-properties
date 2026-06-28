import PrettyPropertiesPlugin from "src/main"
import { updateImagesForView } from "src/updates/updateElements"
import { around, dedupe } from "monkey-around";
import { MarkdownView } from "obsidian";
import { renderTitleIcon } from "src/updates/updateIcons";
import { updateAllMetadataContainers } from "src/updates/updateHiddenProperties";
import { updateCoverForView } from "src/updates/updateCovers";
import { ReadViewRenderer } from "@obsidian-typings/obsidian-public-latest";


type simpleFunc = () => void

interface ReadViewRendererExtended extends ReadViewRenderer {
  onRendered: (f: simpleFunc) => void
}

export const patchMarkdownView = (plugin: PrettyPropertiesPlugin) => {

  plugin.patches.uninstallPPMarkdownPatch = around(MarkdownView.prototype, {

    onLoadFile(old) {
      return dedupe("pp-patch-markdown-around-key", old, async function(this: MarkdownView, ...args) {

        const getView = (() => this).bind(this)

        const onRendered = (this.previewMode.renderer as ReadViewRendererExtended).onRendered;

        (this.previewMode.renderer as ReadViewRendererExtended).onRendered = new Proxy(onRendered, {
          async apply(old2, thisArg2, args2: simpleFunc[]) {

            let result = old2.call(thisArg2, ...args2) 



            try {
              let view = getView()
              renderTitleIcon(view, plugin)
            } catch {
              console.error("Can not render title icon in preview mode")
            }
            
            return result
          }
        })
          
        this.editMode.show = new Proxy(this.editMode.show, {
          apply(old2, thisArg2) {

            let result = old2.call(thisArg2) 

            try {
              let view = getView()
              renderTitleIcon(view, plugin)
            } catch {
              console.error("Can not render title icon in edit mode")
            }
            
            return result
          }
        })

        this.loadFrontmatter = new Proxy(this.loadFrontmatter, {
          apply(old2, thisArg2, args2: string[]) {


            let result = old2.call(thisArg2, ...args2)

            try {
              let view = getView()
              updateCoverForView(view, plugin)  
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
          updateImagesForView(this, plugin);
        } catch {
          console.error("Can not update images for file view")
        }
        


        try {
          renderTitleIcon(this, plugin)
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















