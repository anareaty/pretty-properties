
import PrettyPropertiesPlugin from "src/main"
import { updateLongtext, updateMultiselectPill, updateTagPill } from "src/utils/updates/updatePills"
import { updateDateInput, updateDateTimeInput } from "src/utils/updates/updateDates"
import { updateProgress } from "src/utils/updates/updateProgress"
import { around, dedupe } from "monkey-around";


const updateWidgets = async (type: string, rendered: any, args: any[], plugin: PrettyPropertiesPlugin) => {
  let el = args[0]
  let propName = args[2].key;
  let sourcePath = args[2].sourcePath;
  let value = args[1]
  let parent = el.parentElement


  if (value && value.value) {
    value = value.value;
  }

  if (type == "multitext" || type == "aliases") {
    let elements = rendered?.multiselect.elements 

    if (elements.length == 0) {
      parent.classList.add("is-empty")
    } else {
      parent.classList.remove("is-empty")
    }

    for (let element of elements) {
      updateMultiselectPill(element, plugin)
    }
  }

  if (type == "tags") {
    let elements = rendered?.multiselect.elements 

    if (elements.length == 0) {
      parent.classList.add("is-empty")
    } else {
      parent.classList.remove("is-empty")
    }

    for (let element of elements) {
      updateTagPill(element, plugin)
    }
  }

  if (type == "date") {
    let input = el.querySelector("input");
    updateDateInput(input, plugin)
    input.onchange = () => {
      updateDateInput(input, plugin)
    }
  }

  if (type == "datetime") {
    let input = el.querySelector("input");
    updateDateTimeInput(input, plugin)
    input.onchange = () => {
      updateDateTimeInput(input, plugin)
    }
  }

  if (type == "number") {
    let parent = el.parentElement
    parent.setAttribute("data-source-path", sourcePath)
    updateProgress(parent, plugin, sourcePath)
    let input = el.querySelector("input");
    if (input.value === "") {
      parent.classList.add("is-empty")
    } else {
      parent.classList.remove("is-empty")
    }
    input.onchange = (value: number) => {
      updateProgress(parent, plugin, sourcePath)
      if (input.value === "") {
        parent.classList.add("is-empty")
      } else {
        parent.classList.remove("is-empty")
      }
    }
  }

  if (type == "text") {
    let input = el.querySelector(".metadata-input-longtext");
    updateLongtext(input, plugin);
    input.onblur = () => {
      updateLongtext(input, plugin);
    }

    let parent = el.parentElement
    parent.setAttribute("data-source-path", sourcePath)

    if (propName == plugin.settings.bannerProperty) {
      el.classList.add("banner-property-value")
    }

    if (propName == plugin.settings.iconProperty) {
      el.classList.add("icon-property-value")
    }

    if (propName == plugin.settings.coverProperty) {
      el.classList.add("cover-property-value")
    }
  }

  if (type == "unknown") {
    let input = el.querySelector(".mod-unknown")
    if (input instanceof HTMLElement && input.innerText == "null") {
      parent.classList.add("is-empty")
    } else {
      parent.classList.remove("is-empty")
    }
  }


  if (type == "checkbox") {
    let input = el.querySelector(".metadata-input-checkbox")
    if (input instanceof HTMLElement) {
      let indeterminate = input.getAttribute("data-indeterminate")
      if (indeterminate == "true") {
        parent.classList.add("is-empty")
      } else {
        parent.classList.remove("is-empty")
      }

      input.onchange = () => {
        let indeterminate = input.getAttribute("data-indeterminate")
        if (indeterminate == "true") {
          parent.classList.add("is-empty")
        } else {
          parent.classList.remove("is-empty")
        }
      }
    }
  }

  

  if (plugin.settings.hiddenProperties.find(p => p.toLowerCase() == propName.toLowerCase())) {
    parent.classList.add("pp-property-hidden")
  }

  if (plugin.settings.hiddenWhenEmptyProperties.find(p => p.toLowerCase() == propName.toLowerCase())) {
    parent.classList.add("pp-property-hidden-when-empty")
  }

}


export const patchPropertyWidgets = async (plugin: PrettyPropertiesPlugin) => {
  //@ts-ignore
  let metadataTypeManager = plugin.app.metadataTypeManager
  let widgets = metadataTypeManager.registeredTypeWidgets

  let unknownWidget
  if (metadataTypeManager.getWidget) {
    unknownWidget = metadataTypeManager.getWidget(" ");
  } else {
    unknownWidget = metadataTypeManager.getTypeInfo({key: " ", value: "unknown"}).inferred
  }
  widgets.unknown = unknownWidget;


  plugin.patches.uninstallWidgetPatch = {}

  for (let type in widgets) {
      let widget = widgets[type]

      
      plugin.patches.uninstallWidgetPatch[type] = around(widget, {
        render(oldRender: any) {
          return dedupe("pp-patch-base-cards-around-key", oldRender, (...args: any[]) => {
            
            let rendered = oldRender && oldRender.apply(this, args)
            updateWidgets(type, rendered, args, plugin)
            let renderValues = rendered?.multiselect?.renderValues
            if (renderValues) {
              rendered.multiselect.renderValues = new Proxy(renderValues, {
                apply(renderValues, thisArg2, args2) {
                  let renderedValues = renderValues.call(thisArg2, ...args2)
                  updateWidgets(type, rendered, args, plugin)
                  return renderedValues
                }
              })
            }
            return rendered
          })
        }
    })
  }
}





