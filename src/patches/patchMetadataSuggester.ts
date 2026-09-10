import PrettyPropertiesPlugin from "src/main"
import { around, dedupe } from "monkey-around";
import { PopoverSuggest } from "obsidian";
import { setPillStyles } from "src/updates/updatePills";


interface PropertyPopoverSuggest extends PopoverSuggest<string> {
  textInputEl: HTMLElement,
}



export const patchMetadataSuggester = (plugin: PrettyPropertiesPlugin) => {
  plugin.patches.uninstallPPSuggesterPatch = around(PopoverSuggest.prototype, {

    open(old) {
      return dedupe("pp-patch-suggest-around-key", old, function(this: PropertyPopoverSuggest) {

        let elements = this.suggestions.suggestions
        let textInputEl = this.textInputEl

        if (textInputEl?.instanceOf(HTMLElement)) {

          // Property suggestions

          let metadataEl = textInputEl.closest(".metadata-property-value")
          let propertyEl = textInputEl.closest(".metadata-property")
          let basePropertyEl = textInputEl.closest(".bases-td")

          if (metadataEl instanceof HTMLElement && (propertyEl || basePropertyEl)) {
              let propName

              if (propertyEl instanceof HTMLElement) {
                propName = propertyEl.getAttribute("data-property-key")
              } else if (basePropertyEl instanceof HTMLElement) {
                let prop = basePropertyEl.getAttribute("data-property")
                propName = prop?.replace(/^note\./, "")
              }

              if (propName) {
                for (let suggestEl of elements) {

                  let text = suggestEl.innerText
                  suggestEl.classList.add("metadata-suggest-item")
                  suggestEl.empty()

                  let suggestPill = suggestEl.createDiv()
                  suggestPill.append(text)
                  suggestPill.classList.add("suggestion-pill")
                  setPillStyles(suggestPill, propName, text, plugin)

                  if (textInputEl.classList.contains("multi-select-input")) {
                    suggestPill.classList.add("multi-suggest-pill")
                  }

                  if (textInputEl.classList.contains("metadata-input-longtext")) {
                    suggestPill.classList.add("longtext-suggest-pill")
                  }
                }
              }
          }
        } else if (this.suggestions.values[0] && "tag" in this.suggestions.values[0]) {

          // Inline tag suggestions

          for (let suggestEl of elements) {
            let text = suggestEl.innerText
            suggestEl.classList.add("metadata-suggest-item")
            suggestEl.empty()
            let suggestPill = suggestEl.createDiv()
            suggestPill.append(text)
            suggestPill.classList.add("suggestion-pill")
            suggestPill.classList.add("multi-suggest-pill")
            setPillStyles(suggestPill, "tags", text, plugin)
          }
        }

        return old && old.apply(this)
      })
    }

    
  })

  

















}






