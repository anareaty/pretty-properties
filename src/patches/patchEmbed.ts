import PrettyPropertiesPlugin from "src/main"
import { around, dedupe } from "monkey-around";
import { updateCoverForView } from "src/updates/updateCovers";
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

    plugin.patches.uninstallPPEmbedPatch = around(plugin.app.embedRegistry.embedByExtension, {
        md(old) {
            return dedupe("pp-patch-embed-around-key", old, (...args) => {
                let view = old && old.apply(this, args) as EmbedMarkdownComponentExtended
                
                    if (view.containerEl.classList.contains("canvas-node-content")) {

                        const renderer = view.previewMode.renderer as ReadViewRendererExtended
                        const old_renderer_onRender = renderer.onRender

                        renderer.onRender = (...args2) => {
                            let result = old_renderer_onRender.call(renderer, ...args2)
                            updateCoverForView(view, plugin)  
                            return result
                        }

                    }
                return view
            })
        }
    })
}











