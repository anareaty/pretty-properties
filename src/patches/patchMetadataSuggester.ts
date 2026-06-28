import PrettyPropertiesPlugin from "src/main"
import { around, dedupe } from "monkey-around";
import { PopoverSuggest } from "obsidian";
import { setPillStyles } from "src/updates/updatePills";




export const patchMetadataSuggester = (plugin: PrettyPropertiesPlugin) => {


  
  plugin.patches.uninstallPPSuggesterPatch = around(PopoverSuggest.prototype, {


    
    open(old) {

      

    
      return dedupe("pp-patch-suggest-around-key", old, function(this: any) {

        let elements = this.suggestions.suggestions
        let textInputEl = this.textInputEl

        if (textInputEl instanceof HTMLElement) {
            let metadataEl = textInputEl.closest(".metadata-property-value")
            if (metadataEl instanceof HTMLElement) {
                let type = metadataEl.getAttribute("data-property-type")

                if (type) {
                  for (let suggestEl of elements) {


                    
                    let text = suggestEl.innerText

                    if (type == "tags") {
                      setPillStyles(suggestEl, "data-tag-value", text, "tag", plugin)
                    } 
                    
                    else if (type == "multitext" || type == "aliases") {
                      setPillStyles(suggestEl, "data-property-pill-value", text, "multiselect-pill", plugin)
                    }

                    if (type == "tags" || type == "multitext" || type == "aliases") {
                      suggestEl.classList.add("multi-suggest-item")
                      this.suggestInnerEl.classList.add("metadata-multi-suggestion")
                    }

                    if (type == "text") {
                      setPillStyles(suggestEl, "data-property-longtext-value", text, "longtext", plugin)
                      suggestEl.classList.add("longtext-suggest-item")
                      this.suggestInnerEl.classList.add("metadata-longtext-suggestion")
                    }
                  }
                }
            }
        } else if (this.suggestions.values[0]?.tag) {
          for (let suggestEl of elements) {
            let text = suggestEl.innerText
              setPillStyles(suggestEl, "data-tag-value", text, "tag", plugin)
              suggestEl.classList.add("multi-suggest-item")
              this.suggestInnerEl.classList.add("metadata-multi-suggestion")
          }
        }


        

        let result = old && old.apply(this)


        

        
        
        return result
      })
    }

    
  })

  

















}






