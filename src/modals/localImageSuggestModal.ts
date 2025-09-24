import { SuggestModal, TFile, App, MarkdownRenderer } from "obsidian";
import PrettyPropertiesPlugin from "src/main";


export class LocalImageSuggestModal extends SuggestModal<string> {
    plugin: PrettyPropertiesPlugin
    values: string[] 
    names?: string[]
    shape: string
    propName: string
    constructor(app: App, plugin: PrettyPropertiesPlugin, propName: string, shape: string, values: string[], names?: string[]) {
      super(app);
      this.plugin = plugin;
      this.values = values
      this.names = names 
      this.shape = shape
      this.propName = propName
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
    onChooseSuggestion(imagePath: string) {
        if (imagePath) {
            let imageFile = this.app.vault.getAbstractFileByPath(imagePath)
            let file = this.app.workspace.getActiveFile()

            if (imageFile instanceof TFile && file instanceof TFile) {
                let imageLink = this.app.fileManager.generateMarkdownLink(imageFile, "").replace(/^\!/, "")
                this.app.fileManager.processFrontMatter(file, fm => {
                    fm[this.propName] = imageLink
                })
            }
        }
    } 
}