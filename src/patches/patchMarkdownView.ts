import PrettyPropertiesPlugin from "src/main"
import { updateImagesForView } from "src/updates/updateElements"
import { around, dedupe } from "monkey-around";
import { MarkdownEditView, MarkdownPreviewView, MarkdownView } from "obsidian";
import { renderTitleIcon } from "src/updates/updateIcons";
import { updateMetadataEditor } from "src/updates/updateHiddenProperties";
import { MetadataEditor } from "@obsidian-typings/obsidian-public-latest";


export interface MetadataEditorPatched extends MetadataEditor {
  pp_patched: boolean,
  synchronize: (...args: unknown[]) => unknown
}

export interface MarkdownPreviewViewPatched extends MarkdownPreviewView {
  pp_patched: boolean,
  onRenderComplete: (...args: unknown[]) => unknown
}

export interface MarkdownEditViewPatched extends MarkdownEditView {
  pp_patched: boolean,
  show: (...args: unknown[]) => unknown
}


// Patch metadata editor so we can update the hidden state of properties block every time when properties are changed

export const patchMetadataEditor = (metadataEditor: MetadataEditorPatched | undefined, plugin: PrettyPropertiesPlugin) => {
  if (metadataEditor && !metadataEditor.pp_patched) {
    metadataEditor.pp_patched = true
    const old_metadataEditor_synchronize = metadataEditor.synchronize

    metadataEditor.synchronize = (...args2) => {
      let result = old_metadataEditor_synchronize.call(metadataEditor, ...args2);
      updateMetadataEditor(metadataEditor, plugin)
      return result;
    }
  }
}





export const patchMarkdownView = (plugin: PrettyPropertiesPlugin) => {

  plugin.patches.uninstallPPMarkdownPatch = around(MarkdownView.prototype, {

    onLoadFile(old) {

      return dedupe("pp-patch-markdown-around-key", old, async function(this: MarkdownView, ...args) {

        // We need a function to bind this, so we can reach it later in lower level functions
        const getView = () => this

        let metadataEditor = this.metadataEditor as MetadataEditorPatched | undefined
        patchMetadataEditor(metadataEditor, plugin)

        // Update images after the view is completely rendered

        const previewMode = this.previewMode as MarkdownPreviewViewPatched
        const old_onRenderComplete = previewMode.onRenderComplete

        previewMode.onRenderComplete = (...args2) => {
          let result = old_onRenderComplete.call(previewMode, ...args2) 
          let view = getView()
          updateImagesForView(view, plugin)
          return result
        }


        // Update title icon if needed

        const editMode = this.editMode as MarkdownEditViewPatched
        const old_editMode_show = editMode.show

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















