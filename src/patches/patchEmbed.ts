import PrettyPropertiesPlugin from "src/main"
import { around, dedupe } from "monkey-around";
import { updateCoverForView } from "src/utils/updates/updateCovers";


export const patchEmbed = async (plugin: PrettyPropertiesPlugin) => {
    
    //@ts-ignore
    plugin.patches.uninstallPPEmbedPatch = around(plugin.app.embedRegistry.embedByExtension, {
        md(old: any) {
            return dedupe("pp-patch-embed-around-key", old, (...args: any[]) => {
                let view = old && old.apply(this, args)

                
                if (view.containerEl.classList.contains("canvas-node-content")) {
                    view.previewMode.renderer.onRender = new Proxy(view.previewMode.renderer.onRender, {
                        apply(onRender, thisArg2, args2) {
                            let result = onRender.call(thisArg2, ...args2)
                            updateCoverForView(view, plugin)  
                            return result
                        }
                    })
                }

                return view
            })
        }
    })
}











