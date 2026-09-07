import { HSL, Menu, MenuItem, setIcon } from "obsidian";
import PrettyPropertiesPlugin from "src/main";
import { i18n } from "src/localization/localization";
import { ColorPickerModal } from "src/modals/colorPickerModal";
import { updateRelativeDateColors } from "src/updates/updateStyles";
import { updateAllProperties } from "src/updates/updateElements";
import { PillColorSettings } from "src/settings/settings";




const colors = [
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




export const propertyColorSaveCallback = async (
    propName: string,
    propVal: string,
    pillColorSettings: PillColorSettings,
    plugin: PrettyPropertiesPlugin
) => {
    if (!plugin.settings.propertyColors[propName]) plugin.settings.propertyColors[propName] = {}
    plugin.settings.propertyColors[propName][propVal] = pillColorSettings
    await plugin.saveSettings();
    updateAllProperties(plugin)
    plugin.settingTab?.update()
}



export const dateColorSaveCallback = async (
    relativeVal: string,
    pillColorSettings: PillColorSettings,
    plugin: PrettyPropertiesPlugin
) => {
    plugin.settings.dateColors[relativeVal] = pillColorSettings
    await plugin.saveSettings();
    updateAllProperties(plugin)
    plugin.settingTab?.update()
    updateRelativeDateColors(plugin) 
}



export const setDateColorMenuItems = (
    menu: Menu, 
    relativeVal: string,
    colorType: string,
    plugin: PrettyPropertiesPlugin,
) => {
    let pillColorSettings = plugin.settings.dateColors[relativeVal]
    let saveCallback = (pillColorSettings: PillColorSettings) => {
        void dateColorSaveCallback(relativeVal, pillColorSettings, plugin)
    }
    setColorMenuItems(menu, colorType, pillColorSettings, saveCallback, plugin)
}



export const setColorMenuItems = (
    menu: Menu, 
    colorType: string, 
    pillColorSettings: PillColorSettings | undefined,
    saveCallback: (pillColorSettings: PillColorSettings | undefined) => void,
    plugin: PrettyPropertiesPlugin,
) => {

    let savedColor: string | HSL | undefined

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

            item.setTitle(i18n.t(color))
            .onClick(async() => {


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

                saveCallback(pillColorSettings)
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
            new ColorPickerModal(colorType, pillColorSettings, saveCallback, plugin).open()
        })
            item.setChecked(savedColor != undefined && typeof savedColor != "string")
    })
}


























export const createColorMenu = (
    propName: string, 
    propVal: string, 
    colorType: string, 
    menu: Menu,
    plugin: PrettyPropertiesPlugin
) => {

    let pillColorSettings = plugin.settings.propertyColors[propName]?.[propVal]
    let saveCallback = (pillColorSettings: PillColorSettings) => {
        void propertyColorSaveCallback(propName, propVal, pillColorSettings, plugin)
    }

    let itemTitle = i18n.t("SELECT_COLOR")
    let iconName = "paintbrush"
  
    if (colorType == "textColor") {
      itemTitle = i18n.t("SELECT_TEXT_COLOR")
      iconName = "type"
    }

    menu.addItem(
    (item: MenuItem) => {
        item
            .setTitle(itemTitle)
            .setIcon(iconName)
            .setSection("pretty-properties");
        
        let sub = item.setSubmenu();
        setColorMenuItems(sub, colorType, pillColorSettings, saveCallback, plugin);
    });
};


























export const createColorButton = (parent: HTMLElement, propName: string, value: string, plugin: PrettyPropertiesPlugin) => {
    if(plugin.settings.enableColoredProperties) {

        if (value) {
            let colorButton = createEl("button")
            setIcon(colorButton, "palette")
            colorButton.classList.add("longtext-color-button")
            parent.append(colorButton)
            colorButton.setAttribute("data-value", value)

            colorButton.onclick = (e) => {
                let pillVal = value
                let menu = new Menu();
                createColorMenu(propName, pillVal, "pillColor", menu, plugin);
                createColorMenu(propName, pillVal, "textColor", menu, plugin);
                menu.showAtMouseEvent(e)
            }
        }
    }
}
