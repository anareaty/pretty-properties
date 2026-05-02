import { Menu, MenuItem, setIcon } from "obsidian";
import PrettyPropertiesPlugin from "src/main";
import { i18n } from "src/localization/localization";
import { ColorPickerModal } from "src/modals/colorPickerModal";
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
        "accent",
        "none",
        "default"
    ];

    for (let color of colors) {
        menu.addItem((item: MenuItem) => {
            
            item.setIcon("square");

            if (color != "default" && color != "none" && color != "accent") {
                //@ts-ignore
                item.iconEl.style =
                    "color: transparent; background-color: rgba(var(--color-" +
                    color +
                    "-rgb), 0.3);";
            } else if (color == "accent") {
                //@ts-ignore
                item.iconEl.style =
                    "color: transparent; background-color: hsla(var(--interactive-accent-hsl), 0.3);";
            } else if (color == "none") {
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
				//updateAllPropertyFormats(plugin);

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
        //@ts-ignore
        let sub = item.setSubmenu();
        setColorMenuItems(sub, pillVal, colorList, colorType, plugin);
    });
};








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
