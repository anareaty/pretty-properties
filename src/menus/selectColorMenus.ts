import { Menu, MenuItem, setIcon } from "obsidian";
import PrettyPropertiesPlugin from "src/main";
import { i18n } from "src/localization/localization";
import { ColorPickerModal } from "src/modals/colorPickerModal";
import MenuManager from "src/utils/menuManager";
import { updateRelativeDateColors } from "src/utils/updates/updateStyles";
import { updateAllProperties } from "src/utils/updates/updateElements";




export const setColorMenuItems = (menu: Menu, pillVal: string, colorList: string, colorType: string, plugin: PrettyPropertiesPlugin) => {

    let colors = [
        "red",
        "orange",
        "yellow",
        "green",
        "cyan",
        "blue",
        "purple",
        "pink",
        "none",
        "default"
    ];

    for (let color of colors) {
        menu.addItem((item: MenuItem) => {
            
            item.setIcon("square");

            if (color != "default" && color != "none") {
                //@ts-ignore
                item.iconEl.style =
                    "color: transparent; background-color: rgba(var(--color-" +
                    color +
                    "-rgb), 0.3);";
            }

            if (color == "none") {
                //@ts-ignore
                item.iconEl.style = "opacity: 0.2;";
            }

            item.setTitle(i18n.t(color)).onClick(() => {
                
                if (color == "default") {						
                    //@ts-ignore
                    if (pillVal) delete plugin.settings[colorList][pillVal]?.[colorType];
                } else {
                    
                    //@ts-ignore
                    if (pillVal) {
                        //@ts-ignore
                        if (!plugin.settings[colorList][pillVal]) {
                            //@ts-ignore
                          plugin.settings[colorList][pillVal] = {
                            pillColor: "default",
                            textColor: "default"
                          }
                        }
                        //@ts-ignore
                        plugin.settings[colorList][pillVal][colorType] = color;
                    }    
                }

                plugin.saveSettings();
                updateAllProperties(plugin)

                if (colorList == "dateColors") {
                    updateRelativeDateColors(plugin)
                }
            });
            //@ts-ignore
            item.setChecked(plugin.settings[colorList][pillVal]?.[colorType] == color)

            if (color == "default") {
                //@ts-ignore
                item.setChecked(plugin.settings[colorList][pillVal]?.[colorType] == color || !plugin.settings[colorList][pillVal]?.[colorType])
            }
        });
    }

    menu.addItem((item: MenuItem) => {
        item.setTitle(i18n.t("CUSTOM_COLOR"))
        item.setIcon("square");
        //@ts-ignore
        item.iconEl.classList.add("menu-item-custom-color")
        item.onClick(() => {
            new ColorPickerModal(plugin.app, plugin, pillVal, colorList, colorType).open()
        })
        //@ts-ignore
            item.setChecked(plugin.settings[colorList][pillVal]?.[colorType]?.h !== undefined)
    })
}



var createColorMenu = (pillVal: string, colorList: string, colorType: string, plugin: PrettyPropertiesPlugin, menu: Menu | MenuManager) => {
    let itemTitle = i18n.t("SELECT_COLOR")
    let iconName = "paintbrush"
  
    if (colorType == "textColor") {
      itemTitle = i18n.t("SELECT_TEXT_COLOR")
      iconName = "type"
    }
  
    if (menu instanceof MenuManager) {
      menu.addItemAfter(
        ["clipboard"],
        itemTitle,
        (item) => {
          if (pillVal)
            item
              .setTitle(itemTitle)
              .setIcon(iconName)
              .setSection("pretty-properties");
            //@ts-ignore
            let sub = item.setSubmenu();
            setColorMenuItems(sub, pillVal, colorList, colorType, plugin);
        }
      );
    } else if (menu instanceof Menu) {
      menu.addItem(
        (item: MenuItem) => {
          if (pillVal)
            item
              .setTitle(itemTitle)
              .setIcon(iconName)
              .setSection("pretty-properties");
            //@ts-ignore
            let sub = item.setSubmenu();
            setColorMenuItems(sub, pillVal, colorList, colorType, plugin);
        }
      );
    }
};






export const handlePillMenu = (e: MouseEvent, el: HTMLElement, plugin: PrettyPropertiesPlugin) => {
    let menuManager = plugin.menuManager
    menuManager.closeAndFlush()
    let pillEl = el.closest(".multi-select-pill");
    if (pillEl instanceof HTMLElement) {
        let pillVal = pillEl?.getAttribute("data-property-pill-value");
        let tagVal = pillEl?.getAttribute("data-tag-value");

        if (pillVal) {
            createColorMenu(pillVal, "propertyPillColors", "pillColor", plugin, menuManager);
            createColorMenu(pillVal, "propertyPillColors", "textColor", plugin, menuManager);
        } else if (tagVal) {
            createColorMenu(tagVal, "tagColors", "pillColor", plugin, menuManager);
            createColorMenu(tagVal, "tagColors", "textColor", plugin, menuManager);
        }
    } 
}

export const handleTagMenu = (e: MouseEvent | TouchEvent, el: HTMLElement, plugin: PrettyPropertiesPlugin) => {
    let menuManager = plugin.menuManager
    menuManager.closeAndFlush()
    let tag = el.closest(".cm-hashtag");
    if (tag?.classList.contains("cm-hashtag-begin") && tag?.classList.contains("cm-hashtag-inner")) {
        tag = tag.parentElement?.nextElementSibling?.firstElementChild || null
        
    }


    if (tag instanceof HTMLElement) {
        let tagText = tag.getAttribute("data-tag-value") || ""
        if (tagText) {
            createColorMenu(tagText, "tagColors", "pillColor", plugin, menuManager);
            createColorMenu(tagText, "tagColors", "textColor", plugin, menuManager);
        }
    }
}



export const handleTagPaneMenu = (e: MouseEvent | TouchEvent, el: HTMLElement, plugin: PrettyPropertiesPlugin) => {
    //@ts-ignore
    let menuExist = plugin.app.plugins.getPlugin("tag-wrangler")

    let wrapper = el.closest(".tag-pane-tag")
    if (wrapper instanceof HTMLElement) {
        let tag = wrapper.querySelector("span.tree-item-inner-text")
        let parent = wrapper.querySelector("span.tag-pane-tag-parent")
        let parentText = ""
        if (parent instanceof HTMLElement) {
            parentText = parent.innerText
        }
        if (tag instanceof HTMLElement) {
            let tagText = parentText + tag.innerText
            if (tagText) {
                if (menuExist) {
                    let menuManager = plugin.menuManager
                    menuManager.closeAndFlush()
                    createColorMenu(tagText, "tagColors", "pillColor", plugin, menuManager);
                    createColorMenu(tagText, "tagColors", "textColor", plugin, menuManager);
                } else {
                    let ev = e as MouseEvent
                    let menu = new Menu();
                    createColorMenu(tagText, "tagColors", "pillColor", plugin, menu);
                    createColorMenu(tagText, "tagColors", "textColor", plugin, menu);
                    menu.showAtMouseEvent(ev)
                }
            }
        }
    }
}


export const createColorButton = async (parent: HTMLElement, value: string, plugin: PrettyPropertiesPlugin) => {
    if(plugin.settings.enableColoredProperties && plugin.settings.enableColorButton) {
        let isBase = parent.classList.contains("bases-table-cell")

        if (value && (!isBase || plugin.settings.enableColorButtonInBases)) {
            let colorButton = document.createElement("button")
            setIcon(colorButton, "palette")
            colorButton.classList.add("longtext-color-button")
            parent.append(colorButton)
            colorButton.setAttribute("data-value", value)

            colorButton.onclick = (e) => {
                let pillVal = value
                let menu = new Menu();
                createColorMenu(pillVal, "propertyLongtextColors", "pillColor", plugin, menu);
                createColorMenu(pillVal, "propertyLongtextColors", "textColor", plugin, menu);
                menu.showAtMouseEvent(e)
            }
        }
    }
}
