import PrettyPropertiesPlugin from "src/main";
import { updateDateInput, updateDateTimeInput } from "src/updates/updateDates";
import { updateCardLongtext, updateValueListElement } from "src/updates/updatePills";
import { around, dedupe } from "monkey-around";
import { BasesPluginInstance } from "@obsidian-typings/obsidian-public-latest";
import { BasesEntry, BasesView, BasesViewRegistration, requireApiVersion } from "obsidian";
import { getPropertyType } from "src/utils/propertyUtils";

interface Bases extends BasesPluginInstance {
    registrations: {list: BasesViewRegistration}
}

type ListCell = {
    propertyId: string,
    el: HTMLElement
}

export interface ListBasesView extends BasesView {
    updateVirtualDisplay: () => void
    rowsMap: {
        get: (entry: BasesEntry) => {cells: ListCell[]}
    }
}



export const patchBaseList = (plugin: PrettyPropertiesPlugin) => {
    let bases = plugin.app.internalPlugins.getEnabledPluginById("bases") as Bases
    if (!bases || !bases.registrations.list) return

    plugin.patches.uninstallPPBaseListPatch = around(bases.registrations.list, {
        factory(oldFactory) {
            return dedupe("pp-patch-base-list-around-key", oldFactory, (...args) => {
            let view = oldFactory && oldFactory.apply(this, args) as ListBasesView

            let old_view_updateVirtualDisplay = view.updateVirtualDisplay
            
            view.updateVirtualDisplay = (...args2) => {
                let update = old_view_updateVirtualDisplay.call(view)
                processBaseListProperties(view, plugin)
                return update
            }

            return view
            })
        }
    })
    
}



export const processBaseListProperties = (view: ListBasesView, plugin: PrettyPropertiesPlugin) => {
    if (requireApiVersion("1.10.0")) {
        let data = view.data?.data
        if (data) {
            for (let entry of data) {
                let row = view.rowsMap.get(entry)
            
                if (row) {
                    for (let cell of row.cells) {
                        processBaseListProperty(cell, plugin)
                    }
                }
            }
        }
    }
        
}



const processBaseListProperty = (property: ListCell, plugin: PrettyPropertiesPlugin) => {
    let prop = property.propertyId

    if (prop == "note.tags" || prop == "file.tags" || prop.startsWith("formula.")) {
        let elements = property.el.querySelectorAll("a.tag")
        for (let el of elements) {
            if (el?.instanceOf(HTMLElement)) {
                updateValueListElement(el, "tags", "tag", plugin)
            }
        }
    }

    else if (prop.startsWith("note.")) {
        let propName = prop.replace("note.", "")
        let type = getPropertyType(propName, plugin)

        if (type == "multitext" || type == "aliases") {
            let elements = property.el.querySelectorAll(".value-list-element")
            for (let el of elements) {
                if (el?.instanceOf(HTMLElement)) {
                    updateValueListElement(el, propName, "multiselect-pill", plugin)
                }
            }
        } 
       
        else if (type == "text") {
            let el = property.el
            updateCardLongtext(el, propName, plugin);
        } 
 
        else if (type == "date") {
            let input = property.el.querySelector("input");
            if (input?.instanceOf(HTMLInputElement)) {
                updateDateInput(input, plugin)
            }
        }

        else if (type == "datetime") {
            let input = property.el.querySelector("input");
            if (input?.instanceOf(HTMLInputElement)) {
                updateDateTimeInput(input, plugin)
            }
        }
    }
}