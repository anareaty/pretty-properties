import PrettyPropertiesPlugin from "src/main"
import { around, dedupe } from "monkey-around";
import { updateCoverForView } from "src/utils/updates/updateCovers";
import { MarkdownPreviewView } from "obsidian";
import { EmbedMarkdownComponent, ReadViewRenderer } from "@obsidian-typings/obsidian-public-latest";
import { TFile } from "obsidian";



interface ReadViewRendererExtended extends ReadViewRenderer {
  onRender: () => void
}


interface EmbedMarkdownComponentExtended extends EmbedMarkdownComponent {
    containerEl: HTMLElement,
    previewMode: MarkdownPreviewView,
	file: TFile
}

export const patchEmbed = (plugin: PrettyPropertiesPlugin) => {
    
    //@ts-ignore
    plugin.patches.uninstallPPEmbedPatch = around(plugin.app.embedRegistry.embedByExtension, {
        md(old) {
            return dedupe("pp-patch-embed-around-key", old, (...args) => {
                let view = old && old.apply(this, args) as EmbedMarkdownComponentExtended
                
                    if (view.containerEl.classList.contains("canvas-node-content")) {
                        (view.previewMode.renderer as ReadViewRendererExtended).onRender = new Proxy((view.previewMode.renderer as ReadViewRendererExtended).onRender, {
                            apply(onRender, thisArg2) {

                                let result = onRender.call(thisArg2)
                                
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











