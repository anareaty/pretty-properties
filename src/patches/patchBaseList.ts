import PrettyPropertiesPlugin from "src/main";
import { updateDateInput, updateDateTimeInput } from "src/utils/updates/updateDates";
import { updateCardLongtext, updateValueListElement } from "src/utils/updates/updatePills";
import { around, dedupe } from "monkey-around";


export const patchBaseList = (plugin: PrettyPropertiesPlugin) => {
    //@ts-ignore
	let bases = plugin.app.internalPlugins.getEnabledPluginById("bases")

    if (bases && bases.registrations.list) {


        plugin.patches.uninstallPPBaseListPatch = around(bases.registrations.list, {
            factory(oldFactory: any) {
              return dedupe("pp-patch-base-list-around-key", oldFactory, (...args: any[]) => {
                let view = oldFactory && oldFactory.apply(this, args)

                view.updateVirtualDisplay = new Proxy(view.updateVirtualDisplay, {
                    apply(updateVirtualDisplay, thisArg2, args2) {
                        let update = updateVirtualDisplay.call(thisArg2, ...args2)
                        processBaseListProperties(view, plugin)
                        return update
                    }
                })

                return view
              })
            }
        })





    }
    
}





export const processBaseListProperties = (view: any, plugin: PrettyPropertiesPlugin) => {
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


const processBaseListProperty = (property: any, plugin: PrettyPropertiesPlugin) => {
    
    let prop = property.propertyId

    if (prop == "note.tags" || prop == "file.tags" || prop.startsWith("formula.")) {
        let elements = property.el.querySelectorAll("a.tag")
        for (let el of elements) {
            updateValueListElement(el, "data-tag-value", "tag", plugin)
        }
    }


    else if (prop.startsWith("note.")) {
        let propName = prop.replace("note.", "")
        //@ts-ignore
        let type = plugin.app.metadataTypeManager.getPropertyInfo(propName)?.widget

        if (type == "multitext" || type == "aliases") {

           

            
            let elements = property.el.querySelectorAll(".value-list-element")
            for (let el of elements) {
                updateValueListElement(el, "data-property-pill-value", "multiselect-pill", plugin)
            }
                
        } 
        
       
        else if (type == "text") {
            let el = property.el
            updateCardLongtext(el, plugin);
        } 
 

        else if (type == "date") {
            let input = property.el.querySelector("input");
            if (input.instanceOf(HTMLInputElement)) {
                updateDateInput(input, plugin)
            }
        }

        else if (type == "datetime") {
            let input = property.el.querySelector("input");
            if (input.instanceOf(HTMLInputElement)) {
                updateDateTimeInput(input, plugin)
            }
        }

        

        

        
    }
    
}