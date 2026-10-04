import PrettyPropertiesPlugin from "src/main";


export const reloadAllTabs = (plugin: PrettyPropertiesPlugin) => {
    let viewTypesToReload = ["canvas", "markdown", "bases", "tag", "file-properties"]

    plugin.app.workspace.iterateAllLeaves(async (leaf) => {
        if (leaf) {
            let viewType = leaf.view.getViewType()

            if (viewTypesToReload.find(t => t == viewType)) {
                await leaf.rebuildView()
            }
        }
    })
}

