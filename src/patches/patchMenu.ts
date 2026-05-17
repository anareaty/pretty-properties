import PrettyPropertiesPlugin from "src/main"
import { around, dedupe } from "monkey-around";
import { Menu } from "obsidian";
import { createColorMenu } from "src/menus/selectColorMenus";
import { i18n } from "src/localization/localization";
import { handlePropertyMenu } from "src/menus/propertyMenu";
import { handleBannerMenu } from "src/menus/bannerMenu";
import { handleCoverMenu } from "src/menus/coverMenu";
import { handleIconMenu } from "src/menus/iconMenu";




export const patchMenu = (plugin: PrettyPropertiesPlugin) => {
  plugin.patches.uninstallPPMenuPatch = around(Menu.prototype, {
    showAtMouseEvent(old) {

    
      return dedupe("pp-patch-menu-around-key", old, function(this: Menu, e) {
        
        let target = e.target
        
        if (target instanceof Element) {


            // Tag menu
            let tag = target.closest(".cm-hashtag")
            if (tag?.instanceOf(HTMLElement)) {
                handleTagMenu(this, tag, plugin);
                return old && old.apply(this, [e])
            }


            // Property pill menu
            let pill = target.closest(".multi-select-pill")
            if (pill?.instanceOf(HTMLElement)) {
                handlePillMenu(this, pill, plugin);
                return old && old.apply(this, [e])
            }


            // Property settings menu
            let propertyIcon = target.closest(".metadata-property-icon")
            if (propertyIcon) {
                let propEl = target.closest(".metadata-property");
                if (propEl?.instanceOf(HTMLElement)) {
                    handlePropertyMenu(this, propEl, plugin);
                    return old && old.apply(this, [e])
                }
            }


            // Tag pane menu 
            let tagPaneTag = target.closest(".tag-pane-tag")
            if (tagPaneTag?.instanceOf(HTMLElement)) {
                handleTagPaneMenu(this, tagPaneTag, plugin);
                return old && old.apply(this, [e])
            }


            // Banner menu
            let banner = target.closest(".banner-image")
            if (banner?.instanceOf(HTMLElement)) {
                handleBannerMenu(this, plugin);
                return old && old.apply(this, [e])
            }


            //Cover menu
            let cover = target.closest(".metadata-side-image")
            if (cover?.instanceOf(HTMLElement)) {
                handleCoverMenu(this, plugin);
                return old && old.apply(this, [e])
            }


            //Icon menu
            let icon = target.closest(".pp-icon")
            if (icon instanceof Element) {
                handleIconMenu(this, plugin);
                return old && old.apply(this, [e])
            }

        }
        return old && old.apply(this, [e])
      })
    }
  })
}






const handleTagMenu = (menu: Menu, tag: Element | null, plugin: PrettyPropertiesPlugin) => {

    if (plugin.settings.enableColoredInlineTags) {
        if (tag && tag.classList.contains("cm-hashtag-begin") && tag.classList.contains("cm-hashtag-inner")) {
            tag = tag.parentElement?.nextElementSibling?.firstElementChild || null
        }

        if (tag?.instanceOf(HTMLElement)) {
            let tagText = tag.getAttribute("data-tag-value") || ""
            if (tagText) {
                createColorMenu(tagText, "tagColors", "pillColor", plugin, menu);
                createColorMenu(tagText, "tagColors", "textColor", plugin, menu);
            }
        }
    }

    menu.addItem((item) => item
        .setTitle(i18n.t("DELETE_TAG"))
        .setIcon("delete")
        .setSection("selection")
        .onClick(() => {
            removeTagAtCursor(plugin)
        })
    );
}




const removeTagAtCursor = (plugin: PrettyPropertiesPlugin) => {
    let editor = plugin.app.workspace.activeEditor?.editor
    if (!editor) return
    let cursor = editor.getCursor()
    let lineText = editor.getLine(cursor.line)
    let tagStart = 0

    for (let i = 0; i < lineText.length; i++) {
    let char = lineText[i]
    if (char == " " && i < cursor.ch) {
        tagStart = i + 1
        }
    }

    let lineTextStart = lineText.slice(0, tagStart)
    let lineTextRemaining = lineText
    .replace(lineTextStart, "")
    .replace(/^#[^ ]+$/, "")
    .replace(/#[^ ]+ /, "")

    lineText = lineTextStart + lineTextRemaining                        
    editor.setLine(cursor.line, lineText)
    editor.setSelection({line: cursor.line, ch: tagStart})
}





const handlePillMenu = (menu: Menu, pill: HTMLElement, plugin: PrettyPropertiesPlugin) => {
    if (plugin.settings.enableColoredProperties) {
        let pillVal = pill.getAttribute("data-property-pill-value");
        let tagVal = pill.getAttribute("data-tag-value");

        if (pillVal) {
            createColorMenu(pillVal, "propertyPillColors", "pillColor", plugin, menu);
            createColorMenu(pillVal, "propertyPillColors", "textColor", plugin, menu);
        } else if (tagVal) {
            createColorMenu(tagVal, "tagColors", "pillColor", plugin, menu);
            createColorMenu(tagVal, "tagColors", "textColor", plugin, menu);
        }
    }
}





const handleTagPaneMenu = (menu: Menu, tagPaneTag: HTMLElement, plugin: PrettyPropertiesPlugin) => {
    if (tagPaneTag?.instanceOf(HTMLElement)) {
        let tag = tagPaneTag.querySelector("span.tree-item-inner-text")
        let parent = tagPaneTag.querySelector("span.tag-pane-tag-parent")
        let parentText = ""
        if (parent?.instanceOf(HTMLElement)) {
            parentText = parent.innerText
        }
        if (tag?.instanceOf(HTMLElement)) {
            let tagText = parentText + tag.innerText
            if (tagText) {
                createColorMenu(tagText, "tagColors", "pillColor", plugin, menu);
                createColorMenu(tagText, "tagColors", "textColor", plugin, menu);
            }
        }
    }
}




