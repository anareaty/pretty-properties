import { App, Component, Keymap, Menu } from "obsidian";

export function hookUpLinks(
	app: App,
	component: Component,
	containerEl: HTMLElement,
	sourcePath: string
) {
	component.registerDomEvent(containerEl, "mouseover", (evt: MouseEvent) => {
		const data = getAnchorAndLinkText(evt);
		if (!data)
			return;

		app.workspace.trigger("hover-link", {
			event: evt,
			source: "preview",
			hoverParent: { hoverPopover: null },
			targetEl: data.anchor,
			linktext: data.linkText,
			sourcePath,
		});
	});

	component.registerDomEvent(containerEl, "click", (evt: MouseEvent) => {
		const data = getAnchorAndLinkText(evt);
		if (!data)
			return;
		if (evt.button !== 0)
			return;

		evt.preventDefault();
		void app.workspace.openLinkText(data.linkText, sourcePath, Keymap.isModEvent(evt));
	});

	component.registerDomEvent(containerEl, "auxclick", (evt: MouseEvent) => {
		const data = getAnchorAndLinkText(evt);
		if (!data)
			return;
		if (evt.button !== 1)
			return;

		evt.preventDefault();
		void app.workspace.openLinkText(data.linkText, sourcePath, "tab");
	});

	component.registerDomEvent(containerEl, "contextmenu", (evt: MouseEvent) => {
		const anchor = getClosestAnchor(evt.target);
		if (!anchor)
			return;

		if (isInternalLink(anchor)) {
			const linkText = getLinkText(anchor);
			if (!linkText)
				return;

			evt.preventDefault();
			evt.stopPropagation();

			const menu = new Menu();
			(app.workspace as any).handleLinkContextMenu?.(
				menu,
				linkText,
				sourcePath,
				app.workspace.getMostRecentLeaf()
			);

			menu.showAtMouseEvent(evt);
			return;
		}

		if (!isExternalLink(anchor))
			return;

		const url = getLinkText(anchor);
		if (!url)
			return;

		evt.preventDefault();
		evt.stopPropagation();

		const menu = new Menu();
		(app.workspace as any).handleExternalLinkContextMenu?.(menu, url, app.workspace.getMostRecentLeaf());
		menu.showAtMouseEvent(evt);
	});

	component.registerDomEvent(containerEl, "dragstart", (evt: DragEvent) => {
		const data = getAnchorAndLinkText(evt);
		if (!data)
			return;

		const file = app.metadataCache.getFirstLinkpathDest(data.linkText, sourcePath);
		if (!file)
			return;

		const dragManager: any = (app as any).dragManager;
		if (dragManager?.dragFile && dragManager?.onDragStart) {
			const dragData = dragManager.dragFile(evt, file);

			dragManager.onDragStart(evt, dragData);
			return;
		}
	});
}

function getAnchorAndLinkText(evt: Event): { anchor: HTMLAnchorElement; linkText: string } | null {
	const anchor = getClosestAnchor(evt.target);
	if (!anchor)
		return null;

	if (!isInternalLink(anchor))
		return null;

	const linkText = getLinkText(anchor);
	if (!linkText)
		return null;

	return { anchor, linkText };
}

function getClosestAnchor(target: EventTarget | null): HTMLAnchorElement | null {
	if (!(target instanceof HTMLElement))
		return null;
	return  target.closest("a");
}

function isInternalLink(anchor: HTMLAnchorElement): boolean {
	return anchor.classList.contains("internal-link");
}

function isExternalLink(anchor: HTMLAnchorElement): boolean {
	return anchor.classList.contains("external-link");
}

function getLinkText(anchor: HTMLAnchorElement): string | null {
	return anchor.getAttribute("href");
}
