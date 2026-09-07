
import PrettyPropertiesPlugin from "src/main"
import { updateLongtext, updateMultiselectPill, updateNumberWidget, updateTagPill } from "src/updates/updatePills"
import { updateDateInput, updateDateTimeInput } from "src/updates/updateDates"
import { around, dedupe } from "monkey-around";
import { updateAllMetadataContainers } from "src/updates/updateHiddenProperties";
import { AliasesPropertyWidgetComponent, MultitextPropertyWidgetComponent, PropertyWidgetComponentBase, TagsPropertyWidgetComponent, TypeInfo } from "@obsidian-typings/obsidian-public-latest";


type WidgetArgs = [
  HTMLElement, 
  string | number | boolean | string[] | null | undefined, {
    key: string;
    sourcePath: string;
}]


interface MetadataTypeManagerOld {
  getTypeInfo: (obj: {key: string, value: unknown}) => TypeInfo
}



export const updateWidgets = (type: string, rendered: PropertyWidgetComponentBase, args: WidgetArgs, plugin: PrettyPropertiesPlugin) => {

  let el = args[0]
  let propName = args[2].key;
  let sourcePath = args[2].sourcePath;
  let value = args[1]
  let parent = el.parentElement


  let valueOldVersion = value as unknown
  if (valueOldVersion && typeof valueOldVersion == "object" && "value" in valueOldVersion) {
    value = valueOldVersion.value as string | number | boolean | string[] | null | undefined
  }

  if (!parent?.instanceOf(HTMLElement)) return
  parent.setAttribute("data-source-path", sourcePath)




  

  if (type == "multitext" || type == "aliases") {
    let renderedTyped = rendered as MultitextPropertyWidgetComponent | AliasesPropertyWidgetComponent
    let elements = renderedTyped?.multiselect.elements

    if (elements.length == 0) {
      parent?.classList.add("is-empty")
    } else {
      parent?.classList.remove("is-empty")
    }
    for (let element of elements) {
      updateMultiselectPill(element, propName, plugin)
    }
  }





  if (type == "tags") {

    let renderedTyped = rendered as TagsPropertyWidgetComponent
    let elements = renderedTyped?.multiselect.elements
    if (elements.length == 0) {
      parent?.classList.add("is-empty")
    } else {
      parent?.classList.remove("is-empty")
    }

    for (let element of elements) {

      
      
      updateTagPill(element, plugin)
    }
  }



  



  if (type == "date") {
    let input = el.querySelector("input");
    
    if (input) {
      updateDateInput(input, plugin)
      input.onchange = () => {
        updateDateInput(input, plugin)
      }
      input.onblur = () => {
        updateDateInput(input, plugin)
      }
    }
  }





  if (type == "datetime") {
    let input = el.querySelector("input");
    updateDateTimeInput(input!, plugin)
    input!.onchange = () => {
      updateDateTimeInput(input!, plugin)
    }
    input!.onblur = () => {
      updateDateTimeInput(input!, plugin)
    }
  }





  if (type == "number") {
    let input = el.querySelector("input");
    updateNumberWidget(propName, input!.value, parent, sourcePath, plugin)
    input!.onchange = () => {
      updateNumberWidget(propName, input!.value, parent, sourcePath, plugin)
      updateAllMetadataContainers(plugin)
    }
  }


  

  if (type == "text") {
    let longText = el.querySelector(".metadata-input-longtext");
    let link = el.querySelector(".metadata-link");


    

    if (longText?.instanceOf(HTMLElement)) {
      updateLongtext(longText, plugin, propName);
      longText.onblur = () => {
        updateLongtext(longText, plugin, propName);
        let link = el.querySelector(".metadata-link");
        if (link) {
          parent?.classList.remove("is-empty")
          updateAllMetadataContainers(plugin)
        }
      };
    } else if (link) {
      parent?.classList.remove("is-empty")
      updateAllMetadataContainers(plugin)
    }

    

    if (propName == plugin.settings.bannerProperty) {
      el.classList.add("banner-property-value")
    }

    if (propName == plugin.settings.iconProperty) {
      el.classList.add("icon-property-value")
    }

    if (propName == plugin.settings.coverProperties[0]?.property) {
      el.classList.add("cover-property-value")
    }
  }






  if (type == "unknown") {
    let input = el.querySelector(".mod-unknown")
    if (input?.instanceOf(HTMLElement) && input.innerText == "null") {
      parent?.classList.add("is-empty")
    } else {
      parent?.classList.remove("is-empty")
    }
  }


  if (type == "checkbox") {
    let input = el.querySelector(".metadata-input-checkbox")
    if (input?.instanceOf(HTMLElement)) {
      let indeterminate = input.getAttribute("data-indeterminate")
      if (indeterminate == "true") {
        parent?.classList.add("is-empty")
      } else {
        parent?.classList.remove("is-empty")
      }

      input.onchange = () => {
        let indeterminate = input.getAttribute("data-indeterminate")
        if (indeterminate == "true") {
          parent?.classList.add("is-empty")
        } else {
          parent?.classList.remove("is-empty")
        }
        updateAllMetadataContainers(plugin)
      }
    }
  }


  

  

  if (plugin.settings.hiddenProperties.find(p => p.toLowerCase() == propName.toLowerCase())) {
    parent?.classList.add("pp-property-hidden")
  }

  if (plugin.settings.hiddenWhenEmptyProperties.find(p => p.toLowerCase() == propName.toLowerCase())) {
    parent?.classList.add("pp-property-hidden-when-empty")
  }



  updateAllMetadataContainers(plugin)
  
}


export const patchPropertyWidgets = (plugin: PrettyPropertiesPlugin) => {
  let metadataTypeManager = plugin.app.metadataTypeManager
  let widgets = metadataTypeManager.registeredTypeWidgets

  let unknownWidget
  if (metadataTypeManager.getWidget) {
    unknownWidget = metadataTypeManager.getWidget(" ");
  } else {

    let metadataTypeManagerOldVersion = metadataTypeManager as unknown as MetadataTypeManagerOld
    unknownWidget = metadataTypeManagerOldVersion.getTypeInfo({key: " ", value: "unknown"}).inferred

  }
  widgets.unknown = unknownWidget;

  plugin.patches.uninstallWidgetPatch = {}

  for (let type in widgets) {
      let widget = widgets[type]
      if (!widget) continue

      plugin.patches.uninstallWidgetPatch[type] = around(widget, {
        render(oldRender) {
          return dedupe("pp-patch-widgets-around-key", oldRender, (...args) => {
            let rendered = oldRender && oldRender.apply(this, args)
            let widgetArgs = args as WidgetArgs
            updateWidgets(type, rendered, widgetArgs, plugin)

            if (type == "multitext" || type == "tags" || type == "aliases") {
              let multiRendered = rendered as MultitextPropertyWidgetComponent
              let renderValues = multiRendered.multiselect.renderValues
                multiRendered.multiselect.renderValues = new Proxy(renderValues, {
                  apply(renderValues, thisArg2) {
                    renderValues.call(thisArg2)
                    updateWidgets(type, rendered, widgetArgs, plugin)
                    return undefined
                  }
                })
            }
            return rendered
          })
        }
    })
  }
}





