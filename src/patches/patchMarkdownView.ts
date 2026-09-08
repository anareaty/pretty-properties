import PrettyPropertiesPlugin from "src/main"
import { updateImagesForView } from "src/updates/updateElements"
import { around, dedupe } from "monkey-around";
import { MarkdownView } from "obsidian";
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

        // We need a function to bind this, so we can reach it later in lover level functions
        const getView = () => this
        let file = args[0]
        let cache = plugin.app.metadataCache.getFileCache(file)
        let frontmatter = cache?.frontmatter

        if (frontmatter) {
          let mcHidden = true

          for (let propName in frontmatter) {
            let value: unknown = frontmatter[propName]

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

        if (metadataEditor && !metadataEditor.pp_patched) {
          metadataEditor.pp_patched = true

          const untypedMetadataEditor = (metadataEditor as unknown) as Record<string, unknown>
          const old_metadataEditor_save = untypedMetadataEditor.save as (...args: unknown[]) => unknown

          metadataEditor.save = (...args2) => {
            let result = old_metadataEditor_save.call(metadataEditor, ...args2);
            updateMetadataEditor(metadataEditor, plugin)
            return result;
          }
        }



        // Update images after the view is completely rendered

        const previewMode = this.previewMode


        const untypedPreviewMode = (previewMode as unknown) as Record<string, unknown>
        const old_onRenderComplete = untypedPreviewMode.onRenderComplete as (...args: unknown[]) => unknown


        previewMode.onRenderComplete = (...args2) => {
          let result = old_onRenderComplete.call(previewMode, ...args2) 
          let view = getView()
          updateImagesForView(view, plugin)
          return result
        }





        // Update title icon if needed

        const editMode = this.editMode
        const untypedEditMode = (editMode as unknown) as Record<string, unknown>
        const old_editMode_show = untypedEditMode.show as (...args: unknown[]) => unknown


        editMode.show = (...args2) => {
          let result = old_editMode_show.call(editMode, ...args2) 
          let view = getView()
          void renderTitleIcon(view, plugin)
          return result
        }

        return old && old.apply(this, args)
      })
    }
  })
}















