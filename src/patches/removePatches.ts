import PrettyPropertiesPlugin from "src/main"

export const unPatchWidgets = async (plugin: PrettyPropertiesPlugin) => {
  for (let p in plugin.patches) {
    if (typeof plugin.patches[p] == "object") {
      for (let w in plugin.patches[p]) {
        plugin.patches[p][w]()
      }
    } else {
      plugin.patches[p]()
    }
  }  
}