import PrettyPropertiesPlugin from "src/main"
import { updateImagesForView } from "src/utils/updates/updateElements"
import { around, dedupe } from "monkey-around";
import { MarkdownView } from "obsidian";

export const patchMarkdownView = async (plugin: PrettyPropertiesPlugin) => {
  plugin.patches.uninstallPPMarkdownPatch = around(MarkdownView.prototype, {
    onLoadFile(old) {
      return dedupe("pp-patch-markdown-around-key", old, async function(...args) {
        await updateImagesForView(this, plugin);
        return old && old.apply(this, args)
      })
    }    
  })
}

