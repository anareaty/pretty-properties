import { AbstractInputSuggest, EventRef, FrontMatterCache, parseLinktext, PopoverSuggest, setIcon, TFile } from "obsidian"
import PrettyPropertiesPlugin from "src/main"
import { setPillStyles } from "./updatePills"


export const updateSelectButton = (pill: HTMLElement, propName: string, propVal: string, sourcePath: string, plugin: PrettyPropertiesPlugin) => {

    let options = getSelectionOptions(propName, sourcePath, plugin)
    if (!options) return
    
    let selectButton = createEl("button")
    setIcon(selectButton, "chevron-down")
    selectButton.classList.add("pp-property-select-button")
    pill.append(selectButton)

    selectButton.onmousedown = (e: PointerEvent) => {
        e.preventDefault()
        e.stopPropagation()

        if (plugin.activeSuggest) {
            plugin.activeSuggest.close()
        }

        plugin.activeSuggest = new CustomPropertySuggester(plugin, propName, propVal, sourcePath, selectButton)
        plugin.activeSuggest.openAtMouseEvent(e)

    }
}



export class CustomPropertySuggester extends PopoverSuggest<string> {
    propName: string
    plugin: PrettyPropertiesPlugin
    sourcePath: string
    propVal: string
    selectButton: HTMLElement

    constructor(plugin: PrettyPropertiesPlugin, propName: string, propVal: string, sourcePath: string, selectButton: HTMLElement) {
        super(plugin.app)
        this.plugin = plugin
        this.sourcePath = sourcePath;
        this.propName = propName;
        this.propVal = propVal
        this.selectButton = selectButton

    }

    getSuggestions(query: string) {
        let propertyEl = this.selectButton.parentElement?.parentElement?.parentElement
        if (propertyEl) {
            this.sourcePath = propertyEl.getAttribute("data-source-path") || this.sourcePath
        }

        return getSelectionOptions(this.propName, this.sourcePath, this.plugin) || []
    }







/*

    t.prototype.renderSuggestion = function(e, t) {
        if ("text" === e.type)
            if (e.text.startsWith("[[") && e.text.endsWith("]]")) {
                t.addClass("mod-complex");
                var n = t.createDiv("suggestion-content")
                    , i = t.createDiv("suggestion-aux")
                    , r = n.createDiv("suggestion-title")
                    , o = n.createDiv("suggestion-note")
                    , a = dd(e.text.slice(2, -2))
                    , s = a.title
                    , l = a.href
                    , c = a.isAlias;
                c && o.setText(l),
                i.createSpan({
                    cls: "suggestion-flair"
                }, (function(e) {
                    c ? (IM(e, "lucide-forward"),
                    JM(e, pb.interface.tooltip.alias())) : IM(e, "lucide-link")
                }
                )),
                sx(e.matches, -2),
                hx(r, s, e)
            } else
                t.addClass("mod-nowrap"),
                hx(t, e.text, e);
        else
            IN(e, t, this.manager.global)
    }


*/








      
    renderSuggestion(item: any, el: HTMLElement) {


        if (item.text.startsWith("[[") && item.text.endsWith("]]")) {
            el.addClass("mod-complex")


            let linkText = item.text.slice(2, -2)

            let hasAlias = linkText.match(/(^.*?)(\|)(.+$)/)

            let title = linkText
            let note = ""

            if (hasAlias) {
                title = hasAlias[3]
                note = hasAlias[1]
            } 


            let content = el.createDiv("suggestion-content")
            let auxEl = el.createDiv("suggestion-aux")
            let titleEl = content.createDiv("suggestion-title")
            let noteEl = content.createDiv("suggestion-note")

            titleEl.setText(title)
            noteEl.setText(note)

            auxEl.createSpan({
                cls: "suggestion-flair"
            }, (function(e) {
                if (hasAlias) {
                    setIcon(e, "lucide-forward")
                } else {
                    setIcon(e, "lucide-link")
                }
            }))





        } else {

            let value = item.text
            el.classList.add("metadata-suggest-item");
            let suggestPill = el.createDiv();
            suggestPill.append(value);
            suggestPill.classList.add("suggestion-pill");
            suggestPill.classList.add("longtext-suggest-pill");
            setPillStyles(suggestPill, this.propName, value, this.plugin);
        }

        
        
    }
    
    selectSuggestion(item: any) {
        let value = item.text
        let file = this.plugin.app.vault.getAbstractFileByPath(this.sourcePath);
        if (file instanceof TFile) {
            this.plugin.app.fileManager.processFrontMatter(file, (fm: FrontMatterCache) => {
                fm[this.propName] = value;
            });
        }
        this.close();
    }
    
    openAtMouseEvent(e: PointerEvent) {
        let formattedSuggestions = this.getSuggestions("").map(item => {return {text: item, matches: [], score: 1}})
        if (formattedSuggestions.length == 0) return
        this.suggestions.setSuggestions(formattedSuggestions)
        this.open()
        const targetRect = new DOMRect(e.clientX, e.clientY + 8, 0, 0);
        this.reposition(targetRect)
    }
}



const getSelectionOptions = (propName: string, sourcePath: string, plugin: PrettyPropertiesPlugin) => {
  let propRules = plugin.settings.propertySelectOptions[propName];

  if (!propRules) return

  if (propRules && propRules.length > 0) {

    let pathRules = propRules.filter((s) => {
      return s.path == "/" || sourcePath.startsWith(s.path)
    })

    if (pathRules.length > 0) {
      let preferredRule = pathRules.reduce((a, b) => {
        if (a.path.length > b.path.length) {
          return a;
        } else return b;
      })

      let options = preferredRule.options

      if (options.length > 0) {
        return options
      }
    }
  }

  // If no options set get all existing values instead

  return plugin.app.metadataCache.getFrontmatterPropertyValuesForKey(propName) || []
}







export class SelectSuggester extends AbstractInputSuggest<string> {

    propName: string
    plugin: PrettyPropertiesPlugin
    sourcePath: string

    constructor(plugin: PrettyPropertiesPlugin, input: HTMLInputElement, propName: string, sourcePath: string) {
        super(plugin.app, input)

        this.propName = propName
        this.plugin = plugin
        this.sourcePath = sourcePath
        this.suggestEl.classList.add("mod-property-value")

    }

    getSuggestions(query: string) {
        let propSettings = this.plugin.settings.propertySelectOptions[this.propName]
        let currentSettings = propSettings?.filter(s => {
            if (s.path == "/") s.path = ""
            return this.sourcePath.startsWith(s.path)
        })
        .reduce((a, b) => {
            if(a.path !== "" && b.path !== "" && a.path.length > b.path.length) {
                return a
            } else if (a.path === "") {
                return a
            } else return b
        })
    
        let options = currentSettings?.options || []
        return options
    }


    
    renderSuggestion(value: string, el: HTMLElement): void {
        el.classList.add("metadata-suggest-item")
        let suggestPill = el.createDiv()
        suggestPill.append(value)
        suggestPill.classList.add("suggestion-pill")
        suggestPill.classList.add("longtext-suggest-pill")
        setPillStyles(suggestPill, this.propName, value, this.plugin)
    }
        

    selectSuggestion(value: string, evt: MouseEvent | KeyboardEvent): void { 
        let file = this.plugin.app.vault.getAbstractFileByPath(this.sourcePath)
        if (file instanceof TFile) {
            this.plugin.app.fileManager.processFrontMatter(file, (fm: FrontMatterCache) => {
                fm[this.propName] = value
            })
        }
        this.close();
    }



    
}

