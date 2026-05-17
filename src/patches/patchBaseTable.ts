import PrettyPropertiesPlugin from "src/main";
import { around, dedupe } from "monkey-around";
import { processTagsInPreviewElement } from "src/extensions/tagPostProcessor";
import { BasesView, BasesViewRegistration } from "obsidian";
import { BasesPluginInstance } from "@obsidian-typings/obsidian-public-latest";



interface Bases extends BasesPluginInstance {
    registrations: {table: BasesViewRegistration}
}

type Cell = {
    prop: string,
    el: HTMLElement
}

interface TableBasesView extends BasesView {
    updateVirtualDisplay: () => void
    rows: {
        cells: Cell[]
    }[]
}

export const patchBaseTable = (plugin: PrettyPropertiesPlugin) => {
	let bases = plugin.app.internalPlugins.getEnabledPluginById("bases") as Bases

   

    if (bases) {
        
        plugin.patches.uninstallPPBaseTablePatch = around(bases.registrations.table, {
            factory(oldFactory) {
              return dedupe("pp-patch-base-table-around-key", oldFactory, (...args) => {
                let view = oldFactory && oldFactory.apply(this, args) as TableBasesView


                

                

                view.updateVirtualDisplay = new Proxy(view.updateVirtualDisplay, {
                    apply(updateVirtualDisplay, thisArg2) {

                        

                        
                        
                        let update = updateVirtualDisplay.call(thisArg2)

                        if (plugin.settings.enableColoredProperties) {
                            for (let row of view.rows) {
                                for (let cell of row.cells) {
                                   
                                    processBaseTableCellTags(cell, plugin)
                                }
                            }
                        }

                        
                        return update
                    }
                })
  
                
                return view
              })
            }
        })



    }
}


export const processBaseTableCellTags = (cell: Cell, plugin: PrettyPropertiesPlugin) => {
    if (cell.prop == "file.tags" || cell.prop.startsWith("formula.")) {
        processTagsInPreviewElement(cell.el, plugin)
    }
}

