import PrettyPropertiesPlugin from "src/main"
import { updateImagesInPopover } from "src/utils/updates/updateElements"
import { around, dedupe } from "monkey-around";
import { HoverPopover } from "obsidian";


export const patchHoverPopover = async (plugin: PrettyPropertiesPlugin) => {
  plugin.patches.uninstallPPPopoverPatch = around(HoverPopover.prototype, {
    load(old) {
      return dedupe("pp-patch-popover-show-around-key", old, function(...args) {
        let popover = this

        this.embed.previewMode.onRenderComplete = new Proxy(this.embed.previewMode.onRenderComplete, {
          apply(old2, thisArg2, args2) {
            updateImagesInPopover(popover, plugin)
            return old2.call(thisArg2, ...args2)
          }
        })

        this.embed.showEditor = new Proxy(this.embed.showEditor, {
          apply(old2, thisArg2, args2) {
            let result = old2.call(thisArg2, ...args2)
            updateImagesInPopover(popover, plugin)
            return result
          }
        })

        return old && old.apply(this, args)
      })
    }   
  })
}

