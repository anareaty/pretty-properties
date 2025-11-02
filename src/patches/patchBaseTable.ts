import PrettyPropertiesPlugin from "src/main";
import { updateTag } from "src/utils/updates/updatePills";
import { around, dedupe } from "monkey-around";
import { updateBaseProgress } from "src/utils/updates/updateBaseProgress";


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
                                    if (cell.prop == "file.tags" || cell.prop.startsWith("formula.")) {
                                        let elements = cell.el.querySelectorAll("a.tag")
                                        for (let el of elements) {
                                            updateTag(el, plugin)
                                        }
                                    }

                                    // Remove this after Obsidian v.1.10 goes public

                                    if (cell.prop.startsWith("formula.pp_progress")) {
                                        updateBaseProgress(cell.el)
                                    }


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

