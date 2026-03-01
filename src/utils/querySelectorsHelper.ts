// Query selectors not only whithin the current document, but also within iframes (for example canvas nodes)


export const querySelectorsWithIframes = (query: string) => {
    return querySelectorsInRootAndIframes(document, query);
};

export const querySelectorsWithIframesForContainer = (query: string, container: HTMLElement) => {
    return querySelectorsInRootAndIframes(container, query);
};

function querySelectorsInRootAndIframes(root: ParentNode, query: string): Element[] {
    const results: Element[] = Array.from(root.querySelectorAll(query));
    const iframes = Array.from(root.querySelectorAll("iframe"));

    for (const iframe of iframes) {
        const frameDoc = safeGetFrameDocument(iframe);
        if (!frameDoc)
            continue;

        results.push(...Array.from(frameDoc.querySelectorAll(query)));
    }
    return results;
}

function safeGetFrameDocument(iframe: HTMLIFrameElement): Document | null {
    try {
        return iframe.contentDocument ?? iframe.contentWindow?.document ?? null;
    } catch {
        return null;
    }
}
