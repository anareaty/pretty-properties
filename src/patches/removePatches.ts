import PrettyPropertiesPlugin from "src/main"

export const unPatchWidgets = async (plugin: PrettyPropertiesPlugin) => {
  //@ts-ignore
  let widgets = plugin.app.metadataTypeManager.registeredTypeWidgets
  for (let type in widgets) {
    plugin.patches.uninstallWidgetPatch[type]()
  }

  //@ts-ignore
  if (plugin.app.viewRegistry.viewByType.tag) {
    plugin.patches.uninstallPPTagViewPatch()
    let tagLeaves = plugin.app.workspace.getLeavesOfType("tag")
    for (let tagLeaf of tagLeaves) {
      //@ts-ignore
      tagLeaf.rebuildView()
    }
  }
  
  plugin.patches.uninstallPPMarkdownPatch()

  //@ts-ignore
	let bases = plugin.app.internalPlugins.getEnabledPluginById("bases")
  if (bases) {
    plugin.patches.uninstallPPBaseCardsPatch()
    plugin.patches.uninstallPPBaseTablePatch()
    if (bases.registrations.list) {
      plugin.patches.uninstallPPBaseListPatch()
    }
  }
  
}