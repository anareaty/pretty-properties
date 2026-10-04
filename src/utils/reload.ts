
import PrettyPropertiesPlugin from "src/main";
import { removeAllExtraElements, updateAllProperties } from "src/updates/updateElements";





export const updateAfterEnable = (plugin: PrettyPropertiesPlugin) => {
    let viewTypesToReload = ["tag", "file-properties"]

    plugin.app.workspace.iterateAllLeaves((leaf) => {
        if (leaf) {
            let view = leaf.view
            let viewType = view.getViewType()

            if (viewTypesToReload.find(t => t == viewType)) {
                void leaf.rebuildView()
            }
        }
    })

    updateAllProperties(plugin)
}




export const updateAfterDisable = (plugin: PrettyPropertiesPlugin) => {
    let viewTypesToReload = ["tag", "file-properties", "bases"]

    plugin.app.workspace.iterateAllLeaves((leaf) => {
        if (leaf) {
            let view = leaf.view
            let viewType = view.getViewType()

            if (viewTypesToReload.find(t => t == viewType)) {
                void leaf.rebuildView()
            } 
        }
    })

    removeAllExtraElements(plugin)

}