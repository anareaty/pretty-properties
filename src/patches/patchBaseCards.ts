import PrettyPropertiesPlugin from "src/main";
import { updateDateInput, updateDateTimeInput } from "src/utils/updates/updateDates";
import { updateCardLongtext, updateValueListElement } from "src/utils/updates/updatePills";
import { around, dedupe } from "monkey-around";
import { BasesPluginInstance } from "@obsidian-typings/obsidian-public-latest";
import { BasesView, BasesViewRegistration } from "obsidian";


interface Bases extends BasesPluginInstance {
    registrations: {cards: BasesViewRegistration}
}

type CardProp = {
    prop: string,
    lineEl: HTMLElement
}

export interface CardsBasesView extends BasesView {
    updateVirtualDisplay: () => void
    items: {
        props: CardProp[]
    }[]
}

export const patchBaseCards = (plugin: PrettyPropertiesPlugin) => {
    let bases = plugin.app.internalPlugins.getEnabledPluginById("bases") as Bases

    if (bases) {
        plugin.patches.uninstallPPBaseCardsPatch = around(bases.registrations.cards, {
            factory(oldFactory) {
              return dedupe("pp-patch-base-cards-around-key", oldFactory, (...args) => {
                let view = oldFactory && oldFactory.apply(this, args) as CardsBasesView

                view.updateVirtualDisplay = new Proxy(view.updateVirtualDisplay, {
                    apply(updateVirtualDisplay, thisArg2) {
                        let update = updateVirtualDisplay.call(thisArg2)
                        processBaseCardProperties(view, plugin)
                        return update
                    }
                })
                return view
              })
            }
        })
    }
}



export const processBaseCardProperties = (view: CardsBasesView, plugin: PrettyPropertiesPlugin) => {
    for (let item of view.items) {
        for (let property of item.props) {
            processBaseCardProperty(property, plugin)
        }
    }
}


const processBaseCardProperty = (property: CardProp, plugin: PrettyPropertiesPlugin) => {
    let prop = property.prop

    if (prop == "note.tags" || prop == "file.tags" || prop.startsWith("formula.")) {
        let elements = property.lineEl.querySelectorAll("a.tag")
        for (let el of elements) {
            if (el?.instanceOf(HTMLElement)) {
                updateValueListElement(el, "data-tag-value", "tag", plugin)
            }
        }
    }

    else if (prop.startsWith("note.")) {
        let propName = prop.replace("note.", "")
        let type = plugin.app.metadataTypeManager.getPropertyInfo(propName)?.widget

        if (type == "multitext" || type == "aliases") {
            let elements = property.lineEl.querySelectorAll(".value-list-element")
            for (let el of elements) {
                if (el?.instanceOf(HTMLElement)) {
                    updateValueListElement(el, "data-property-pill-value", "multiselect-pill", plugin)
                }
            }
        } 
        
        else if (type == "text") {
            let el = property.lineEl
            updateCardLongtext(el, plugin);
        } 

        else if (type == "date") {
            let input = property.lineEl.querySelector("input");
            if (input?.instanceOf(HTMLInputElement)) {
                updateDateInput(input, plugin)
            }
        }

        else if (type == "datetime") {
            let input = property.lineEl.querySelector("input");
            if (input?.instanceOf(HTMLInputElement)) {
                updateDateTimeInput(input, plugin)
            }
        }
    } 
}