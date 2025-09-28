import { match } from "assert"
import { finishRenderMath, loadMathJax, renderMath } from "obsidian"
import { platform } from "os"
import PrettyPropertiesPlugin from "src/main"



export const tryLoadMath = (plugin: PrettyPropertiesPlugin) => {
    if (plugin.settings.enableMath) {
        loadMathJax()
    }
}

export const updateBaseMath = (mathEl: HTMLElement, plugin:PrettyPropertiesPlugin) => {

    

    let mathProperties = plugin.settings.mathProperties
    let property = mathEl.getAttribute("data-property")?.replace("note.", "") || ""
    let existingMathWrapper = mathEl.querySelector(".math-wrapper")

    if (!plugin.settings.enableMath || !plugin.settings.enableBases || !mathProperties.find(p => p == property)) {
        
        existingMathWrapper?.remove()
        mathEl.classList.remove("has-math")
        return
    }

    
    let isCard = mathEl.classList.contains("bases-cards-property")

    let valueEl = mathEl.querySelector(".metadata-input-longtext")
    if (isCard) {
        valueEl = mathEl.querySelector(".bases-rendered-value")
    }

    let existingValue = existingMathWrapper?.getAttribute("data-math") || ""

    

    if (valueEl instanceof HTMLElement) {
        let text = valueEl.innerText
        let match = text?.match(/^(\$\$)(.+)(\$\$)$/)
        if (!match) {
            match = text?.match(/^(\$)(.+)(\$)$/)
        }

        
        if (match) {
            let formula = match[2]
            let symbols = match[1]

            if (existingValue == text) {
                return
            } 
            
            existingMathWrapper?.remove()

            let display = false

            if (symbols == "$$" && !isCard) {
                display = true
            }
            
            
            let math = renderMath(formula, display)
            finishRenderMath()


            
            if (math) {
                mathEl.classList.add("has-math")
                let mathWrapper = document.createElement("div")
                mathWrapper.classList.add("math-wrapper")
                mathWrapper.setAttribute("data-math", text)
                mathWrapper.append(math)



                if (isCard) {
                    mathEl.append(mathWrapper)
                } else {

                    mathEl.prepend(mathWrapper)
                    mathWrapper.onclick = () => {
                        
                        valueEl.focus()
                    }
                    
                }
                
            }
        } else {
            //remove formula
            
            existingMathWrapper?.remove()
            mathEl.classList.remove("has-math")
        }

    }
}


export const updateBaseMathEls = (node: HTMLElement, plugin: PrettyPropertiesPlugin) => {
    let mathProperties = plugin.settings.mathProperties

    // update existing

    let mathEls = node.querySelectorAll(".has-math[data-property]")
    for (let mathEl of mathEls) {
        if (mathEl instanceof HTMLElement) {
            updateBaseMath(mathEl, plugin)
        }
    }

    // add new
    for (let mathProp of mathProperties) {
        let mathEls = node.querySelectorAll("[data-property='note." + mathProp + "']:not(.has-math)")
        for (let mathEl of mathEls) {
            if (mathEl instanceof HTMLElement) {
                updateBaseMath(mathEl, plugin)
            }
        }
    }

    
}




export const updateNoteMath = (mathEl: HTMLElement, plugin: PrettyPropertiesPlugin) => {

    

    let propName = mathEl.getAttribute("data-property-key") || ""
    let existingMathWrapper = mathEl.querySelector(".math-wrapper")
    
    let mathProperties = plugin.settings.mathProperties
    if (!mathProperties.find(p => p == propName) || !plugin.settings.enableMath) {
        
        existingMathWrapper?.remove()
        mathEl.classList.remove("has-math")
        return
    }

    

    
    let existingValue = existingMathWrapper?.getAttribute("data-math") || ""
    let valueEl = mathEl.querySelector(".metadata-input-longtext")

    if (valueEl instanceof HTMLElement) {
        let text = valueEl.innerText
        let match = text?.match(/^(\$\$)(.+)(\$\$)$/)
        if (!match) {
            match = text?.match(/^(\$)(.+)(\$)$/)
        }

        if (match) {

            let formula = match[2]
            let symbols = match[1]

            

            if (existingValue == text) {
                return
            } 

            
            
            existingMathWrapper?.remove()

            let display = false

            if (symbols == "$$") {
                display = true
            }
            
            let math = renderMath(formula, display)
            finishRenderMath()
            
            if (math) {

                
                mathEl.classList.add("has-math")
                let mathWrapper = document.createElement("div")
                mathWrapper.classList.add("math-wrapper")
                mathWrapper.setAttribute("data-math", text)
                mathWrapper.append(math)

                let mathKeyEl = mathEl.querySelector(".metadata-property-key");

                

                if (mathKeyEl instanceof HTMLElement) {
                    mathKeyEl.after(mathWrapper);
                }
                
            }
        } else {
            //remove formula
            
            existingMathWrapper?.remove()
            mathEl.classList.remove("has-math")
        }

    }


}



export const updateNoteMathEls = (container: HTMLElement, plugin: PrettyPropertiesPlugin) => {
    let mathEls = container.querySelectorAll(".metadata-property")
    for (let mathEl of mathEls) {
        if (mathEl instanceof HTMLElement) {
            updateNoteMath(mathEl, plugin)
        }
    }
}




export const updateMathForChangedEl = (textEl: HTMLElement, plugin:PrettyPropertiesPlugin) => {
    let propName = ""
    let basePropertyEl = textEl.closest("[data-property]")

    if (basePropertyEl instanceof HTMLElement) {
        propName = basePropertyEl.getAttribute("data-property")?.replace("note.", "") || ""
        if (plugin.settings.mathProperties.find(p => p == propName)) {
            updateBaseMath(basePropertyEl, plugin)
        }
    }
}