import PrettyPropertiesPlugin from "src/main";


export const reloadAllTabs = (plugin: PrettyPropertiesPlugin) => {
    plugin.app.workspace.iterateAllLeaves(leaf => {
        //@ts-ignore
        leaf.rebuildView()
    })
}

