
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

  if (value && value.value) {
    value = value.value;
  } 

  if (type == "multitext") {
    let elements = rendered?.multiselect.elements 
    for (let element of elements) {
      updateMultiselectPill(element, plugin)
    }
  }

  if (type == "tags") {
    let elements = rendered?.multiselect.elements 
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
    input.onchange = () => {
      updateProgress(parent, plugin, sourcePath)
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

  if (plugin.settings.hiddenProperties.find(p => p == propName)) {
    let parent = el.parentElement
    parent.classList.add("pp-property-hidden")
  }
}


export const patchPropertyWidgets = (plugin: PrettyPropertiesPlugin) => {
  //@ts-ignore
  let widgets = plugin.app.metadataTypeManager.registeredTypeWidgets

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





