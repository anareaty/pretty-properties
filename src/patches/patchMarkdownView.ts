import PrettyPropertiesPlugin from "src/main"
import { updateImagesForView } from "src/updates/updateElements"
import { around, dedupe } from "monkey-around";
import { MarkdownView, TFile } from "obsidian";
import { renderTitleIcon } from "src/updates/updateIcons";
import { updateMetadataEditor } from "src/updates/updateHiddenProperties";
import { MetadataEditor } from "@obsidian-typings/obsidian-public-latest";


interface MetadataEditorPatched extends MetadataEditor {
  pp_patched: boolean
}


export const patchMarkdownView = (plugin: PrettyPropertiesPlugin) => {

  plugin.patches.uninstallPPMarkdownPatch = around(MarkdownView.prototype, {

    onLoadFile(old) {
      return dedupe("pp-patch-markdown-around-key", old, async function(this: MarkdownView, ...args) {

        // We need a function to bind this, so we can reach it later in proxy functions
        const getView = (() => this).bind(this)



        

        let file = args[0]

        //console.log(file)

        let cache = plugin.app.metadataCache.getFileCache(file)

        let frontmatter = cache?.frontmatter

        if (frontmatter) {

          let mcHidden = true

          for (let propName in frontmatter) {
            let value = frontmatter[propName]


            if (plugin.settings.hiddenProperties.includes(propName)) {
              continue
            }

            if (value == null || value == "") {
              if (plugin.settings.hiddenWhenEmptyProperties.includes(propName) || plugin.settings.hideAllEmptyProperties) {
                continue
              }
            }
            mcHidden = false
          }

          this.metadataEditor.containerEl.classList.toggle("pp-mc-hidden", mcHidden)
        }



        
        // Patch metadata editor so we can update hidden properties when the property name is edited

        let metadataEditor = this.metadataEditor as MetadataEditorPatched


        //console.log(metadataEditor)

        
        if (metadataEditor && !metadataEditor.pp_patched) {
          metadataEditor.pp_patched = true

          metadataEditor.save = new Proxy(metadataEditor.save, {
            apply(save, thisArg) {
              let result = save.call(thisArg);
              //console.log("hide on metadata save")
              updateMetadataEditor(metadataEditor, plugin)
              return result;
            }
          })





          
        }



        // Update images after the view is completely rendered

        this.previewMode.onRenderComplete = new Proxy(this.previewMode.onRenderComplete, {
          async apply(old2, thisArg2) {
            let result = old2.call(thisArg2) 
            let view = getView()
            updateImagesForView(view, plugin)


            return result
          }
        })



        // Update title icon if needed

        this.editMode.show = new Proxy(this.editMode.show, {
          apply(old2, thisArg2) {
            let result = old2.call(thisArg2) 
            let view = getView()
            void renderTitleIcon(view, plugin)
            return result
          }
        })

        return old && old.apply(this, args)
      })
    }
  })
}















