import PrettyPropertiesPlugin from "src/main";
import { updateDateInput, updateDateTimeInput } from "src/utils/updates/updateDates";
import { updateCardLongtext, updateValueListElement } from "src/utils/updates/updatePills";
import { around, dedupe } from "monkey-around";
import { updateBaseProgress } from "src/utils/updates/updateBaseProgress";




export const patchBaseCards = (plugin: PrettyPropertiesPlugin) => {
    //@ts-ignore
	let bases = plugin.app.internalPlugins.getEnabledPluginById("bases")

    if (bases) {

        plugin.patches.uninstallPPBaseCardsPatch = around(bases.registrations.cards, {
            factory(oldFactory: any) {
              return dedupe("pp-patch-base-cards-around-key", oldFactory, (...args: any[]) => {
                let view = oldFactory && oldFactory.apply(this, args)

                view.updateVirtualDisplay = new Proxy(view.updateVirtualDisplay, {
                    apply(updateVirtualDisplay, thisArg2, args2) {
                        let update = updateVirtualDisplay.call(thisArg2, ...args2)
                        for (let item of view.items) {
                            for (let property of item.props) {
                                processBaseCardProperty(property, plugin)
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




const processBaseCardProperty = (property: any, plugin: PrettyPropertiesPlugin) => {
    let prop = property.prop

    if (prop == "note.tags" || prop == "file.tags" || prop == "formula.tags") {
        let elements = property.lineEl.querySelectorAll("a.tag")
        for (let el of elements) {
            updateValueListElement(el, "data-tag-value", "tag", plugin)
        }
    }

    else if (prop.startsWith("note.")) {
        let propName = prop.replace("note.", "")
        //@ts-ignore
        let type = plugin.app.metadataTypeManager.getPropertyInfo(propName)?.widget

        if (type == "multitext") {
            let elements = property.lineEl.querySelectorAll(".value-list-element")
            for (let el of elements) {
                updateValueListElement(el, "data-property-pill-value", "multiselect-pill", plugin)
            }
        } 
        

        else if (type == "text") {
            let el = property.lineEl
            updateCardLongtext(el, plugin);

            


        } 


        else if (type == "date") {
            let input = property.lineEl.querySelector("input");
            if (input instanceof HTMLInputElement) {
                updateDateInput(input, plugin)
            }
        }

        else if (type == "datetime") {
            let input = property.lineEl.querySelector("input");
            if (input instanceof HTMLInputElement) {
                updateDateTimeInput(input, plugin)
            }
        }

        

        
    } 



    // Remove this after Obsidian v.1.10 goes public

    else if (prop.startsWith("formula.pp_progress")) {
        updateBaseProgress(property.el)
    }

}