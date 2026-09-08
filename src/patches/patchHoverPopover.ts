import PrettyPropertiesPlugin from "src/main"
import { updateImagesInPopover } from "src/updates/updateElements"
import { around, dedupe } from "monkey-around";
import { HoverPopover } from "obsidian";
import { EmbeddedEditorView } from "@obsidian-typings/obsidian-public-latest";


interface Popover extends HoverPopover {
    embed: EmbeddedEditorView
}

export const patchHoverPopover = (plugin: PrettyPropertiesPlugin) => {
  plugin.patches.uninstallPPPopoverPatch = around(HoverPopover.prototype, {
    load(old) {
      return dedupe("pp-patch-popover-show-around-key", old, function(this: Popover, ...args) {

        const getPopover = (() => this).bind(this)
        let embed = this.embed

        if (embed) {

          if (embed.containerEl?.classList.contains("markdown-embed")) {
            updateImagesInPopover(this, plugin)

            const previewMode = embed.previewMode

            if (previewMode) {

              const old_onRenderComplete = previewMode.onRenderComplete

              previewMode.onRenderComplete = (...args2) => {
                let popover = getPopover()
                updateImagesInPopover(popover, plugin)
                return old_onRenderComplete.call(previewMode, ...args2)
              }

            }
            
            if (embed.showEditor) {

              const old_showEditor = embed.showEditor

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

