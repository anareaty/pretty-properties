import PrettyPropertiesPlugin from "src/main"
import { updateImagesForView } from "src/utils/updates/updateElements"
import { around, dedupe } from "monkey-around";
import { MarkdownView } from "obsidian";


export const patchMarkdownView = async (plugin: PrettyPropertiesPlugin) => {
  plugin.patches.uninstallPPMarkdownPatch = around(MarkdownView.prototype, {
    onLoadFile(old) {
      return dedupe("pp-patch-markdown-around-key", old, async function(...args) {
        

        /*
        let view = this

        this.previewMode.renderer.onRendered = new Proxy(this.previewMode.renderer.onRendered, {
          apply(old2, thisArg2, args2) {
            let result = old2.call(thisArg2, ...args2) 
            //console.log(view.contentEl.querySelector(".mod-header .inline-title"))

            wrapInlineTitle(view, plugin)

            return result
          }
        })

        this.editMode.show = new Proxy(this.editMode.show, {
          apply(old2, thisArg2, args2) {
            let result = old2.call(thisArg2, ...args2) 
            //console.log(view.contentEl.querySelector(".cm-sizer .inline-title"))

            wrapInlineTitle(view, plugin)

            return result
          }
        })

        wrapInlineTitle(view, plugin)

        */
        await updateImagesForView(this, plugin);
        return old && old.apply(this, args)
      })
    }
  })
}

/*
const wrapInlineTitle = (view: any, plugin: PrettyPropertiesPlugin) => {
  let currentMode = view.currentMode
  let containerEl = currentMode.containerEl
  if (currentMode.type == "source") {
    containerEl = currentMode.editorEl
  }

  let wrappedTitle = containerEl.querySelector(".title-wrapper .inline-title")

  if (!wrappedTitle) {
    let inlineTitle = containerEl.querySelector(".inline-title")
  
    if (inlineTitle) {
      let titleWrapper = containerEl.querySelector(".title-wrapper")

      if (titleWrapper) {
        titleWrapper.append(inlineTitle)
      } else {
        let parent = inlineTitle.parentElement
        let titleWrapper = document.createElement("div")
        titleWrapper.classList.add("title-wrapper")
        parent.prepend(titleWrapper)
        titleWrapper.append(inlineTitle)
      }
    }
  }
}

*/

