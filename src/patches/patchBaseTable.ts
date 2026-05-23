import PrettyPropertiesPlugin from "src/main";
import { around, dedupe } from "monkey-around";
import { processTagsInPreviewElement } from "src/extensions/tagPostProcessor";
import { BasesView, BasesViewRegistration } from "obsidian";
import { BasesPluginInstance, PropertyWidgetComponentBase } from "@obsidian-typings/obsidian-public-latest";



interface Bases extends BasesPluginInstance {
    registrations: {table: BasesViewRegistration}
}

type TableCell = {
    prop: string,
    el: HTMLElement,
    renderer: {
        propertyEditor: PropertyWidgetComponentBase,
        inferredType: {type: string},
        entry: {file: {path: string}},
        el: HTMLElement,
        val: string
    }
}

export interface TableBasesView extends BasesView {
    updateVirtualDisplay: () => void
    rows: {
        cells: TableCell[]
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



export const processBaseTableCellTags = (cell: TableCell, plugin: PrettyPropertiesPlugin) => {
    if (cell.prop == "file.tags" || cell.prop.startsWith("formula.")) {
        processTagsInPreviewElement(cell.el, plugin)
    }
}
