import PrettyPropertiesPlugin from "src/main"
import { updateTagPaneTags } from "src/utils/updates/updatePills"
import { around, dedupe } from "monkey-around";


export const patchTagView = async (plugin: PrettyPropertiesPlugin) => {
    plugin.app.workspace.onLayoutReady(() => {
      //@ts-ignore
      let tagViewCreator = plugin.app.viewRegistry.getViewCreatorByType("tag")
      if (tagViewCreator) {

        //@ts-ignore
        plugin.patches.uninstallPPTagViewPatch = around(plugin.app.viewRegistry.viewByType, {
          tag(oldTag: any) {
            return dedupe("pp-patch-tag-view-around-key", oldTag, (...args: any[]) => {
              let view = oldTag && oldTag.apply(this, args)

              view.requestUpdateTags = new Proxy(view.requestUpdateTags, {
                apply(requestUpdateTags, thisArg2, args2) {
                  let update = requestUpdateTags.call(thisArg2, ...args2)
                  updateTagPaneTags(view.containerEl, plugin)   
                  return update
                }
              })

              view.updateTags()
              let tagDoms = view.tagDoms
              for (let tag in tagDoms) {
                updateTagPaneTags(tagDoms[tag].el, plugin)
              }

              return view
            })
          }
      })




        let tagLeaves = plugin.app.workspace.getLeavesOfType("tag")
        for (let tagLeaf of tagLeaves) {
          //@ts-ignore
          tagLeaf.rebuildView()
        }
      }
    })
}