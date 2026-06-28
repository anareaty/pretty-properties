import PrettyPropertiesPlugin from "src/main"
import { updateTagPaneTags } from "src/updates/updatePills"
import { around, dedupe } from "monkey-around";
import { TagView } from "@obsidian-typings/obsidian-public-latest";




interface TagViewExtended extends TagView {
  requestUpdateTags: () => unknown,
  tagDoms: Record<string, HTMLElement>[]
}


export const patchTagView = (plugin: PrettyPropertiesPlugin) => {
    
    let tagViewCreator = plugin.app.viewRegistry.getViewCreatorByType("tag")
    if (tagViewCreator) {

      plugin.patches.uninstallPPTagViewPatch = around(plugin.app.viewRegistry.viewByType, {
        tag(oldTag) {
          return dedupe("pp-patch-tag-view-around-key", oldTag, (...args) => {
            let view = oldTag && oldTag.apply(this, args) as TagViewExtended

            view.requestUpdateTags = new Proxy(view.requestUpdateTags, {
              apply(requestUpdateTags, thisArg2) {

               
                let update = requestUpdateTags.call(thisArg2)
                updateTagPaneTags(view.containerEl, plugin)   
                return update
              }
            })

            view.updateTags()
            let tagDoms = view.tagDoms

          
            Object.keys(tagDoms).forEach((key) => {
              let tag = Number(key)
              let tagEl = tagDoms[tag]?.el
              if (tagEl) {
                updateTagPaneTags(tagEl, plugin)
              }
            })


            
            return view
          })
        }
    })


    plugin.app.workspace.onLayoutReady(async () => {
      let tagLeaves = plugin.app.workspace.getLeavesOfType("tag")
      for (let tagLeaf of tagLeaves) {
        await tagLeaf.rebuildView()
      }
    })
  }
}











