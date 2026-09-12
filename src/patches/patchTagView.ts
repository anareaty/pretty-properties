import PrettyPropertiesPlugin from "src/main"
import { updateTagPaneTags } from "src/updates/updatePills"
import { around, dedupe } from "monkey-around";
import { TagView } from "@obsidian-typings/obsidian-public-latest";




interface TagViewExtended extends TagView {
  requestUpdateTags: () => unknown,
  tagDoms: Record<string, {el: HTMLElement}>
}


export const patchTagView = (plugin: PrettyPropertiesPlugin) => {
    
    let tagViewCreator = plugin.app.viewRegistry.getViewCreatorByType("tag")
    if (tagViewCreator) {

      plugin.patches.uninstallPPTagViewPatch = around(plugin.app.viewRegistry.viewByType, {
        tag(oldTag) {
          return dedupe("pp-patch-tag-view-around-key", oldTag, (...args) => {
            let view = oldTag && oldTag.apply(this, args) as TagViewExtended


            const old_requestUpdateTags = view.requestUpdateTags

            view.requestUpdateTags = (...args2) => {
              let update = old_requestUpdateTags.call(view, ...args2)
              updateTagPaneTags(view.containerEl, plugin)   
              return update
            }

            view.updateTags()
            let tagDoms = view.tagDoms

            Object.keys(tagDoms).forEach((tag: string) => {
              let tagEl = tagDoms[tag]?.el

              if (tagEl) {
                updateTagPaneTags(tagEl, plugin)
              }
            })

            return view
          })
        }
    })


    plugin.app.workspace.onLayoutReady(() => {
      let tagLeaves = plugin.app.workspace.getLeavesOfType("tag")
      for (let tagLeaf of tagLeaves) {
        void tagLeaf.rebuildView()
      }
    })




  }
}











