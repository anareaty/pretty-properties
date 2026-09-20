import PrettyPropertiesPlugin from "src/main"
import { around, dedupe } from "monkey-around";
import { PopoverSuggest, SearchResult } from "obsidian";
import { setPillStyles } from "src/updates/updatePills";


interface PropertyPopoverSuggest extends PopoverSuggest<string> {
  context?: { key: string },
  inputEl?: HTMLElement
}

interface TagSearchResult extends SearchResult {
  tag: string
}



export const patchMetadataSuggester = (plugin: PrettyPropertiesPlugin) => {

  plugin.patches.uninstallPPSuggesterPatch = around(PopoverSuggest.prototype, {

    open(old) {
      return dedupe("pp-patch-suggest-around-key", old, function (this: PropertyPopoverSuggest) {

        if (plugin.settings.enableColoredProperties) {
          let elements = this.suggestions.suggestions
          let inputEl = this.inputEl

          if (inputEl?.instanceOf(HTMLElement) && this.context) {

            // Property suggestions

            let isMultiSelect = inputEl.classList.contains("multi-select-input")
            let isLongtext = inputEl.classList.contains("metadata-input-longtext")

            if (isMultiSelect || isLongtext) {
              let propName = this.context.key

              if (propName) {
                for (let suggestEl of elements) {
                  let text = suggestEl.textContent || ""
                  suggestEl.classList.add("metadata-suggest-item")
                  suggestEl.empty()

                  let suggestPill = suggestEl.createDiv()
                  suggestPill.append(text)
                  suggestPill.classList.add("suggestion-pill")
                  setPillStyles(suggestPill, propName, text, plugin)

                  if (isMultiSelect) {
                    suggestPill.classList.add("multi-suggest-pill")
                  }

                  else if (isLongtext) {
                    suggestPill.classList.add("longtext-suggest-pill")
                  }
                }
              }
            }

          } else {

            // Tag suggestions

            let suggestion = this.suggestions.values[0]
            if (suggestion && typeof suggestion == "object" && "tag" in suggestion) {
              for (let i = 0; i < elements.length; i++) {

                let suggestion = this.suggestions.values[i] as TagSearchResult
                let text = suggestion.tag
                let suggestEl = elements[i]

                if (suggestEl) {
                  suggestEl.classList.add("metadata-suggest-item")
                  suggestEl.empty()
                  let suggestPill = suggestEl.createDiv()
                  suggestPill.append(text)
                  suggestPill.classList.add("suggestion-pill")
                  suggestPill.classList.add("multi-suggest-pill")
                  setPillStyles(suggestPill, "tags", text, plugin)
                }
              }
            }
          }
        }
        return old && old.apply(this)
      })
    }
  })
}




