import PrettyPropertiesPlugin from "src/main"
import { updateImagesInPopover } from "src/utils/updates/updateElements"
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

        let embed = this.embed

       

        if (embed) {
          let popover = this

          if (embed.containerEl?.classList.contains("markdown-embed")) {
            updateImagesInPopover(this, plugin)

            if (embed.previewMode) {
              embed.previewMode.onRenderComplete = new Proxy(embed.previewMode.onRenderComplete, {
                apply(old2, thisArg2) {
                  updateImagesInPopover(popover, plugin)
                  return old2.call(thisArg2)
                }
              })
            }
            
            if (embed.showEditor) {
              embed.showEditor = new Proxy(embed.showEditor, {
                apply(old2, thisArg2, args2: {x: number, y: number}[]) {
                  let result = old2.call(thisArg2, ...args2)
                  updateImagesInPopover(popover, plugin)
                  return result
                }
              })
            }
          }
        }
      
        return old && old.apply(this, args)
      })
    }   
  })
}

