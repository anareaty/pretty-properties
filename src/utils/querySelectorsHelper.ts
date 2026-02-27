// Query selectors not only whithin the current document, but also within iframes (for example canvas nodes)

export const querySelectorsWithIframes = (query: string) => {
    let simpleQuery = document.querySelectorAll(query)
    let allSelectors = [...simpleQuery]
    let iframes = document.querySelectorAll("iframe")
    
    for (let iframe of iframes) {
        let frameDoc = iframe.contentDocument || iframe.contentWindow?.document
        if (frameDoc) {
            let frameQuery = frameDoc.querySelectorAll(query)
            allSelectors = allSelectors.concat([...frameQuery])
        }
    }
    return allSelectors
}


export const querySelectorsWithIframesForContainer = (query: string, container: HTMLElement) => {
    let simpleQuery = container.querySelectorAll(query)
    let allSelectors = [...simpleQuery]
    let iframes = container.querySelectorAll("iframe")
    
    for (let iframe of iframes) {
        let frameDoc = iframe.contentDocument || iframe.contentWindow?.document
        if (frameDoc) {
            let frameQuery = frameDoc.querySelectorAll(query)
            allSelectors = allSelectors.concat([...frameQuery])
        }
    }
    return allSelectors
}