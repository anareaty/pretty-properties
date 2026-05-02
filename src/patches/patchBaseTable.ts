import PrettyPropertiesPlugin from "src/main";
import { around, dedupe } from "monkey-around";
import { processTagsInPreviewElement } from "src/extensions/tagPostProcessor";


export const patchBaseTable = (plugin: PrettyPropertiesPlugin) => {
    //@ts-ignore
	let bases = plugin.app.internalPlugins.getEnabledPluginById("bases")

    if (bases) {
        plugin.patches.uninstallPPBaseTablePatch = around(bases.registrations.table, {
            factory(oldFactory: any) {
              return dedupe("pp-patch-base-table-around-key", oldFactory, (...args: any[]) => {
                let view = oldFactory && oldFactory.apply(this, args)


                view.updateVirtualDisplay = new Proxy(view.updateVirtualDisplay, {
                    apply(updateVirtualDisplay, thisArg2, args2) {
                        
                        let update = updateVirtualDisplay.call(thisArg2, ...args2)

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


export const processBaseTableCellTags = (cell: any, plugin: PrettyPropertiesPlugin) => {
    if (cell.prop == "file.tags" || cell.prop.startsWith("formula.")) {
        processTagsInPreviewElement(cell.el, plugin)
    }
}

