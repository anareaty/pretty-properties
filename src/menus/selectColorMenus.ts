import { Menu, MenuItem, setIcon } from "obsidian";
import PrettyPropertiesPlugin from "src/main";
import { i18n } from "src/localization/localization";
import { updatePillColors } from "src/utils/updates/updateStyles";
import { ColorPickerModal } from "src/modals/colorPickerModal";



const setColorMenuItems = (menu: Menu, pillVal: string, colorList: string, plugin: PrettyPropertiesPlugin) => {

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
                    if (pillVal) delete plugin.settings[colorList][pillVal];
                } else {
                    
                    //@ts-ignore
                    if (pillVal) plugin.settings[colorList][pillVal] = color;
                }

                plugin.saveSettings();
                updatePillColors(plugin);
            });
            //@ts-ignore
            item.setChecked(plugin.settings[colorList][pillVal] == color)
        });
    }

    menu.addItem((item: MenuItem) => {
        item.setTitle(i18n.t("CUSTOM_COLOR"))
        item.setIcon("square");
        //@ts-ignore
        item.iconEl.classList.add("menu-item-custom-color")
        item.onClick(() => {
            new ColorPickerModal(plugin.app, plugin, pillVal, colorList).open()
        })
        //@ts-ignore
            item.setChecked(plugin.settings[colorList][pillVal]?.h !== undefined)
    })
}



const createColorMenu = (item: MenuItem, pillVal: string, colorList: string, plugin: PrettyPropertiesPlugin) => {
    item.setTitle(i18n.t("SELECT_COLOR"))
        .setIcon("paintbrush")
        .setSection("pretty-properties");
    //@ts-ignore
    let sub = item.setSubmenu() as Menu;
    setColorMenuItems(sub, pillVal, colorList, plugin)
}


export const handlePillMenu = (e: MouseEvent, el: HTMLElement, plugin: PrettyPropertiesPlugin) => {
    let menuManager = plugin.menuManager
    menuManager.closeAndFlush()
    let pillEl = el.closest(".multi-select-pill");
    if (pillEl instanceof HTMLElement) {
        let pillVal = pillEl?.getAttribute("data-property-pill-value");
        let tagVal = pillEl?.getAttribute("data-tag-value");

        if (pillVal) {
            menuManager.addItemAfter(
                ["clipboard"],
                i18n.t("SELECT_COLOR"),
                (item: MenuItem) => {
                    if (pillVal) createColorMenu(item, pillVal, "propertyPillColors", plugin)
                }
            );
        } else if (tagVal) {
            menuManager.addItemAfter(
                ["clipboard"],
                i18n.t("SELECT_COLOR"),
                (item: MenuItem) => {
                    if (tagVal) createColorMenu(item, tagVal, "tagColors", plugin)
                }
            );
        }
    } 
}

export const handleTagMenu = (e: MouseEvent | TouchEvent, el: HTMLElement, plugin: PrettyPropertiesPlugin) => {
    let menuManager = plugin.menuManager
    menuManager.closeAndFlush()
    let tag = el.closest(".cm-hashtag");
    if (tag?.classList.contains("cm-hashtag-begin")) {
        tag = tag.nextElementSibling
    }
    if (tag instanceof HTMLElement) {
        let tagText = tag?.innerText
        if (tagText) {
            menuManager.addItemAfter(
                ["clipboard"],
                i18n.t("SELECT_COLOR"),
                (item: MenuItem) => {
                    if (tagText) createColorMenu(item, tagText, "tagColors", plugin)
                }
            );
        }
    }
}


export const createColorButton = async (parent: HTMLElement, value: string, plugin: PrettyPropertiesPlugin) => {
    if(plugin.settings.enableColoredProperties && plugin.settings.enableColorButton) {
        let isBase = parent.classList.contains("bases-table-cell")

        if (value && (!isBase || plugin.settings.enableColorButtonInBases)) {
            let colorButton = document.createElement("button")
            setIcon(colorButton, "paintbrush")
            colorButton.classList.add("longtext-color-button")
            parent.append(colorButton)
            colorButton.setAttribute("data-value", value)

            colorButton.onclick = (e) => {
                let pillVal = value
                let menu = new Menu();
                setColorMenuItems(menu, pillVal, "propertyLongtextColors", plugin)
                menu.showAtMouseEvent(e)
            }
        }
    }
}
