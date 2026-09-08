import PrettyPropertiesPlugin from "src/main"
import { around, dedupe } from "monkey-around";
import { PopoverSuggest } from "obsidian";
import { setPillStyles } from "src/updates/updatePills";


interface PropertyPopoverSuggest extends PopoverSuggest<string> {
  textInputEl: HTMLElement,
  suggestInnerEl: HTMLElement
}



export const patchMetadataSuggester = (plugin: PrettyPropertiesPlugin) => {


  
  plugin.patches.uninstallPPSuggesterPatch = around(PopoverSuggest.prototype, {


    
    open(old) {

      

    
      return dedupe("pp-patch-suggest-around-key", old, function(this: PropertyPopoverSuggest) {

        let elements = this.suggestions.suggestions

        let textInputEl = this.textInputEl

        if (textInputEl?.instanceOf(HTMLElement)) {
            let metadataEl = textInputEl.closest(".metadata-property-value")
            let propertyEl = textInputEl.closest(".metadata-property")
            let basePropertyEl = textInputEl.closest(".bases-td")

            if (metadataEl instanceof HTMLElement && (propertyEl || basePropertyEl)) {
                let type = metadataEl.getAttribute("data-property-type")
                let propName

                if (propertyEl instanceof HTMLElement) {
                  propName = propertyEl.getAttribute("data-property-key")
                } else if (basePropertyEl instanceof HTMLElement) {
                  let prop = basePropertyEl.getAttribute("data-property")
                  propName = prop?.replace(/^note\./, "")
                }

                if (type && propName) {
                  for (let suggestEl of elements) {


                    
                    let text = suggestEl.innerText


                    setPillStyles(suggestEl, propName, text, plugin)

                    if (type == "tags" || type == "multitext" || type == "aliases") {
                      suggestEl.classList.add("multi-suggest-item")
                      this.suggestInnerEl.classList.add("metadata-multi-suggestion")
                    }

                    if (type == "text") {
                      suggestEl.classList.add("longtext-suggest-item")
                      this.suggestInnerEl.classList.add("metadata-longtext-suggestion")
                    }
                  }
                }
            }
          } else if (this.suggestions.values[0] && "tag" in this.suggestions.values[0]) {
          for (let suggestEl of elements) {
            let text = suggestEl.innerText
              setPillStyles(suggestEl, "tags", text, plugin)
              suggestEl.classList.add("multi-suggest-item")
              this.suggestInnerEl?.classList.add("metadata-multi-suggestion")
          }
        }


        

        let result = old && old.apply(this)


        

        
        
        return result
      })
    }

    
  })

  

















}






