import PrettyPropertiesPlugin from "src/main"
import { updateImagesForView } from "src/updates/updateElements"
import { around, dedupe } from "monkey-around";
import { MarkdownView } from "obsidian";
import { renderTitleIcon } from "src/updates/updateIcons";
import { updateHiddenCSSClasses, updateMetadataEditor } from "src/updates/updateHiddenProperties";
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



        // Patch metadata editor so we can update hidden properties when the property name is edited

        let metadataEditor = this.metadataEditor as MetadataEditorPatched

        updateMetadataEditor(metadataEditor, plugin)
        if (metadataEditor && !metadataEditor.pp_patched) {
          metadataEditor.pp_patched = true

          metadataEditor.save = new Proxy(metadataEditor.save, {
            apply(save, thisArg) {
              let result = save.call(thisArg);
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
            renderTitleIcon(view, plugin)
            return result
          }
        })

        return old && old.apply(this, args)
      })
    }
  })
}















