import { SuggestModal, App, MarkdownRenderer, TFile } from "obsidian";
import PrettyPropertiesPlugin from "./main";


export class ImageSuggestModal extends SuggestModal<string> {
    plugin: PrettyPropertiesPlugin
	resolve: any
	reject:any
	values: string[] 
	names?: string[]
    shape: string
	constructor(app: App, plugin: PrettyPropertiesPlugin, resolve: any, reject:any, shape: string, values: string[], names?: string[]) {
	  super(app);
	  this.plugin = plugin;
	  this.resolve = resolve
	  this.reject = reject
	  this.values = values
	  this.names = names 
      this.shape = shape
	}

    getSuggestions(query:string): string[] {
        return this.values.filter((val) => {
            return val.toLowerCase().includes(query.toLowerCase())
        });
    }
    async renderSuggestion(val: string, el: Element) {
        let path = val
        let nameParts = val.split("/")
        let name = nameParts[nameParts.length - 1].replace(/(.*)(\.[^\.]+)$/, "$1")
        if (this.names) {
            name = this.names[this.values.indexOf(val)]
        }
        let file = this.app.vault.getAbstractFileByPath(path)
        if (file instanceof TFile) {
            let link = this.app.fileManager.generateMarkdownLink(file, "")
            let image = document.createElement("div")
            await MarkdownRenderer.render(this.app, link, image, "", this.plugin)
            el.classList.add("image-suggestion-item")
            el.classList.add(this.shape)
            image.append(name)
            el.append(image)
        } else {
            el.append(name)
        }
        
    }
    onChooseSuggestion(val: string) {
        this.resolve(val)
    } 
}