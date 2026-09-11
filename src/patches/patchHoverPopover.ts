import PrettyPropertiesPlugin from "src/main"
import { updateImagesInPopover } from "src/updates/updateElements"
import { around, dedupe } from "monkey-around";
import { HoverPopover } from "obsidian";
import { EmbeddedEditorView } from "@obsidian-typings/obsidian-public-latest";
import { MetadataEditorPatched, patchMetadataEditor } from "./patchMarkdownView";
import { updateMetadataEditor } from "src/updates/updateProperties";


interface EmbeddedEditorViewPatched extends EmbeddedEditorView {
  metadataEditor: MetadataEditorPatched | undefined
}

interface Popover extends HoverPopover {
    embed: EmbeddedEditorViewPatched
}

export const patchHoverPopover = (plugin: PrettyPropertiesPlugin) => {
  
  plugin.patches.uninstallPPPopoverPatch = around(HoverPopover.prototype, {
    load(old) {
      return dedupe("pp-patch-popover-show-around-key", old, function(this: Popover, ...args) {

        const getPopover = () => this
        let embed = this.embed

        if (embed) {

          if (embed.containerEl?.classList.contains("markdown-embed")) {
            updateImagesInPopover(this, plugin)

            let metadataEditor = embed.metadataEditor
            patchMetadataEditor(metadataEditor, plugin)
            if (metadataEditor) updateMetadataEditor(metadataEditor, plugin)

            const previewMode = embed.previewMode

            if (previewMode) {

              const untypedPreviewMode = (previewMode as unknown) as Record<string, unknown>
              const old_onRenderComplete = untypedPreviewMode.onRenderComplete as (...args: unknown[]) => unknown

              previewMode.onRenderComplete = (...args2) => {
                let popover = getPopover()
                updateImagesInPopover(popover, plugin)
                return old_onRenderComplete.call(previewMode, ...args2)
              }
            }
            
            if (embed.showEditor) {

              const untypedEmbed = (embed as unknown) as Record<string, unknown>
              const old_showEditor = untypedEmbed.showEditor as (...args: unknown[]) => unknown

              embed.showEditor = (...args2) => {
                let result = old_showEditor.call(embed, ...args2)
                let popover = getPopover()
                updateImagesInPopover(popover, plugin)
                return result
              }
            }
          }
        }
        return old && old.apply(this, args)
      })
    }   
  })
}

