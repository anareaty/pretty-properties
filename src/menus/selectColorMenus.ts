import { HSL, Menu, MenuItem, setIcon } from "obsidian";
import PrettyPropertiesPlugin from "src/main";
import { i18n } from "src/localization/localization";
import { ColorPickerModal } from "src/modals/colorPickerModal";
import { updateRelativeDateColors } from "src/utils/updates/updateStyles";
import { updateAllProperties } from "src/utils/updates/updateElements";
import { PillColorSettings } from "src/settings/settings";






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
        "accent",
        "none",
        "default"
    ];

    let pillColorSettings: PillColorSettings | undefined
    let savedColor: string | HSL | undefined

    if (
        colorList == "propertyPillColors" ||
        colorList == "propertyLongtextColors" ||
        colorList == "tagColors"
    ) {
        pillColorSettings = plugin.settings[colorList][pillVal]
    }

    else if (
        colorList == "dateColors" && 
        (pillVal == "future" || pillVal == "present" || pillVal == "past")
    ) {
        pillColorSettings = plugin.settings[colorList][pillVal]
    }

    if (pillColorSettings && (colorType == "pillColor" || colorType == "textColor")) {
        savedColor = pillColorSettings[colorType]
    }

    for (let color of colors) {

        menu.addItem((item: MenuItem) => {
            item.setIcon("square");
            if (color != "default" && color != "none" && color != "accent") {
                item.iconEl.style =
                    "color: transparent; background-color: rgba(var(--color-" +
                    color +
                    "-rgb), 0.3);";
            } else if (color == "accent") {
                item.iconEl.style =
                    "color: transparent; background-color: hsla(var(--interactive-accent-hsl), 0.3);";
            } else if (color == "none") {
                item.iconEl.style = "opacity: 0.2;";
            }

            item.setTitle(i18n.t(color)).onClick(async() => {
                if (colorType == "pillColor" || colorType == "textColor") {
                    if (color == "default") {						
                        delete pillColorSettings?.[colorType]
                    } else {   
                        if (!pillColorSettings) {
                            pillColorSettings = {
                                pillColor: "default",
                                textColor: "default"
                            }
                        }
                        pillColorSettings[colorType] = color;    
                    }
                }

                await plugin.saveSettings();
                updateAllProperties(plugin)

                if (colorList == "dateColors") {
                    updateRelativeDateColors(plugin)
                }
            });
            
            item.setChecked(savedColor == color)

            if (color == "default") {
                item.setChecked(savedColor == color || !savedColor)
            }
        });
    }

    menu.addItem((item: MenuItem) => {
        item.setTitle(i18n.t("CUSTOM_COLOR"))
        item.setIcon("square");
        item.iconEl.classList.add("menu-item-custom-color")
        item.onClick(() => {
            new ColorPickerModal(plugin.app, plugin, pillVal, colorList, colorType).open()
        })
            item.setChecked(savedColor != undefined && typeof savedColor != "string")
    })
}



export const createColorMenu = (pillVal: string, colorList: string, colorType: string, plugin: PrettyPropertiesPlugin, menu: Menu) => {
    let itemTitle = i18n.t("SELECT_COLOR")
    let iconName = "paintbrush"
  
    if (colorType == "textColor") {
      itemTitle = i18n.t("SELECT_TEXT_COLOR")
      iconName = "type"
    }
  
    menu.addItem(
    (item: MenuItem) => {
        if (pillVal)
        item
            .setTitle(itemTitle)
            .setIcon(iconName)
            .setSection("pretty-properties");
        
        let sub = item.setSubmenu();
        setColorMenuItems(sub, pillVal, colorList, colorType, plugin);
    });
};






export const createColorButton = (parent: HTMLElement, value: string, plugin: PrettyPropertiesPlugin) => {
    if(plugin.settings.enableColoredProperties && plugin.settings.enableColorButton) {
        let isBase = parent.classList.contains("bases-table-cell")

        if (value && (!isBase || plugin.settings.enableColorButtonInBases)) {
            let colorButton = createEl("button")
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
