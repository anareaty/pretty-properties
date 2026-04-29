import PrettyPropertiesPlugin from "src/main";


export const reloadAllTabs = (plugin: PrettyPropertiesPlugin) => {

    let mdLeaves = plugin.app.workspace.getLeavesOfType("markdown");
    for (let leaf of mdLeaves) {
        //@ts-ignore
        leaf.rebuildView()
    }

    let baseLeaves = plugin.app.workspace.getLeavesOfType("bases");
    for (let leaf of baseLeaves) {
        //@ts-ignore
        leaf.rebuildView()
    }

    let canvasLeaves = plugin.app.workspace.getLeavesOfType("canvas");
    for (let leaf of canvasLeaves) {
        //@ts-ignore
        leaf.rebuildView()
    }
}

