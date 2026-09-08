import PrettyPropertiesPlugin from "src/main";
import { around, dedupe } from "monkey-around";
import { BasesPluginInstance } from "@obsidian-typings/obsidian-public-latest";
import { BasesView, BasesViewRegistration } from "obsidian";
import { processBaseCardProperty } from "./patchBaseCards";


interface Bases extends BasesPluginInstance {
    registrations: {kanban: BasesViewRegistration}
}

export interface KanbanBasesView extends BasesView {
    updateVirtualDisplay: () => void
    columns: {
        items: {
            props: {
                prop: string,
                lineEl: HTMLElement
            }[]
        }[]
    }[]
    
}


export const patchBaseKanban = (plugin: PrettyPropertiesPlugin) => {
    let bases = plugin.app.internalPlugins.getEnabledPluginById("bases") as Bases
    if (!bases || !bases.registrations.kanban) return

    plugin.patches.uninstallPPBaseCardsPatch = around(bases.registrations.kanban, {
        factory(oldFactory) {
            return dedupe("pp-patch-base-cards-around-key", oldFactory, (...args) => {
            let view = oldFactory && oldFactory.apply(this, args) as KanbanBasesView

            let old_view_updateVirtualDisplay = view.updateVirtualDisplay
            
            view.updateVirtualDisplay = (...args2) => {
                let update = old_view_updateVirtualDisplay.call(view)
                processBaseKanbanProperties(view, plugin)
                return update
            }

            return view
            })
        }
    })
}


export const processBaseKanbanProperties = (view: KanbanBasesView, plugin: PrettyPropertiesPlugin) => {
    for (let column of view.columns) {
        for (let item of column.items) {
            for (let property of item.props) {
                processBaseCardProperty(property, plugin)
            }
        }
    }
}


