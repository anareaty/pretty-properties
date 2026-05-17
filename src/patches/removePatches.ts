import PrettyPropertiesPlugin from "src/main"

export const unPatchWidgets = (plugin: PrettyPropertiesPlugin) => {

  let patches = plugin.patches

  for (let p in patches) {
    let patch = patches[p]
    if (typeof patch == "object") {
      for (let w in patch) {
        let widgetPatch = patch[w]
        if (widgetPatch) {
          widgetPatch()
        }
      }
    } else if (patch) {
      patch()
    }
  }  
}