import { AbstractInputSuggest, FrontMatterCache, PopoverSuggest, setIcon, TFile } from "obsidian"
import PrettyPropertiesPlugin from "src/main"
import { setPillStyles } from "./updatePills"


export const updateSelectButton = (pill: HTMLElement, propName: string, value: string, sourcePath: string, plugin: PrettyPropertiesPlugin) => {

    let selectButton = createEl("button")
    setIcon(selectButton, "chevron-down")
    selectButton.classList.add("pp-property-select-button")
    pill.append(selectButton)


    

    selectButton.onmousedown = (e) => {
        e.preventDefault()
        e.stopPropagation()

        if (plugin.activeSuggest) {
            plugin.activeSuggest.close()
        }
        
        let hiddenInput = document.body.createEl("input", {cls: "pp-hidden-suggest-input"})

        hiddenInput.setCssStyles({
            left: `${e.clientX}px`,
            top: `${e.clientY}px`,
        })

        plugin.activeSuggest = new SelectSuggester(plugin, hiddenInput, propName, sourcePath)

        hiddenInput.focus()

        const originalClose = plugin.activeSuggest.close.bind(plugin.activeSuggest);
        plugin.activeSuggest.close = () => {
            originalClose();
            hiddenInput?.remove();
        };
    }
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

