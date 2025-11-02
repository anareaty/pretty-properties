import { Setting } from 'obsidian';
import { i18n } from 'src/localization/localization';
import {   
	updateIconStyles
} from 'src/utils/updates/updateStyles';
import { PPSettingTab } from 'src/settings/settings';
import { updateAllIcons } from 'src/utils/updates/updateIcons';




export const showIconSettings = (settingTab: PPSettingTab) => {
    const {containerEl, plugin} = settingTab

    new Setting(containerEl)
        .setName(i18n.t("ENABLE_ICONS"))
        .addToggle(toggle => toggle
            .setValue(plugin.settings.enableIcon)
            .onChange(async (value) => {
                plugin.settings.enableIcon = value
                await plugin.saveSettings();
                settingTab.display();
                updateAllIcons(plugin)
                updateIconStyles(plugin);
            }));

    

    if (plugin.settings.enableIcon) {
        new Setting(containerEl)
        .setName(i18n.t("ICON_PROPERTY"))
        .addText(text => text
            .setPlaceholder('icon')
            .setValue(plugin.settings.iconProperty)
            .onChange(async (value) => {
                plugin.settings.iconProperty = value;
                await plugin.saveSettings();
                updateAllIcons(plugin)
            }));

        new Setting(containerEl)
        .setName(i18n.t("ICONS_FOLDER"))
        .addText(text => text
            .setValue(plugin.settings.iconsFolder)
            .onChange(async (value) => {
                plugin.settings.iconsFolder = value;
                await plugin.saveSettings();
            }));

        new Setting(containerEl)
        .setName(i18n.t("SHOW_ICONS_IN_PAGE_PREVIEWS"))
        .addToggle(toggle => toggle
            .setValue(plugin.settings.enableIconsInPopover)
            .onChange(async (value) => {
                plugin.settings.enableIconsInPopover = value
                await plugin.saveSettings();
            }));

        new Setting(containerEl)
        .setName(i18n.t("ICON_SIZE"))
        .addText(text => {
            text.inputEl.type = "number"
            text.setValue(plugin.settings.iconSize.toString())
            .setPlaceholder('70')
            .onChange(async (value) => {
                if (!value) value = "0"
                plugin.settings.iconSize = Number(value);
                await plugin.saveSettings();
                updateIconStyles(plugin);
            })
        });

        new Setting(containerEl)
        .setName(i18n.t("ICON_SIZE_MOBILE"))
        .addText(text => {
            text.inputEl.type = "number"
            text.setValue(plugin.settings.iconSizeMobile.toString())
            .setPlaceholder('70')
            .onChange(async (value) => {
                if (!value) value = "0"
                plugin.settings.iconSizeMobile = Number(value);
                await plugin.saveSettings();
                updateIconStyles(plugin);
            })
        });


        new Setting(containerEl)
        .setName(i18n.t("ICON_SIZE_POPOVER"))
        .addText(text => {
            text.inputEl.type = "number"
            text.setValue(plugin.settings.iconSizePopover.toString())
            .setPlaceholder('70')
            .onChange(async (value) => {
                if (!value) value = "0"
                plugin.settings.iconSizePopover = Number(value);
                await plugin.saveSettings();
                updateIconStyles(plugin);
            })
        });

        new Setting(containerEl)
        .setName(i18n.t("ICON_COLOR"))
        .addColorPicker(color => color
            .setValue(plugin.settings.iconColor)
            .onChange(async (value) => {
                plugin.settings.iconColor = value
                await plugin.saveSettings();
                updateIconStyles(plugin);
            })
        )
        .addButton(btn => btn
            .setIcon("rotate-ccw")
            .onClick(async (e) => {
                plugin.settings.iconColor = ""
                plugin.saveSettings();
                updateIconStyles(plugin);
                settingTab.display()
            })
        )

        new Setting(containerEl)
        .setName(i18n.t("ICON_COLOR_DARK"))
        .addColorPicker(color => color
            .setValue(plugin.settings.iconColorDark)
            .onChange(async (value) => {
                plugin.settings.iconColorDark = value
                await plugin.saveSettings();
                updateIconStyles(plugin);
            })
        )
        .addButton(btn => btn
            .setIcon("rotate-ccw")
            .onClick(async (e) => {
                plugin.settings.iconColorDark = ""
                plugin.saveSettings();
                updateIconStyles(plugin);
                settingTab.display()
            })
        )

        new Setting(containerEl)
        .setName(i18n.t("ICON_BACKGROUND"))
        .addToggle(toggle => toggle
            .setValue(plugin.settings.iconBackground)
            .onChange(async (value) => {
                plugin.settings.iconBackground = value
                await plugin.saveSettings();
                updateIconStyles(plugin);
            }));

        new Setting(containerEl)
        .setName(i18n.t("ICON_LEFT_MARGIN"))
        .setDesc(i18n.t("CAN_BE_POSITIVE_OR_NEGATIVE"))
        .addText(text => {
            text.inputEl.type = "number"
            text.setValue(plugin.settings.iconLeftMargin.toString())
            .setPlaceholder('100')
            .onChange(async (value) => {
                if (!value) value = "0"
                plugin.settings.iconLeftMargin = Number(value);
                await plugin.saveSettings();
                updateIconStyles(plugin);
            })
        });

        new Setting(containerEl)
        .setName(i18n.t("ICON_TOP_MARGIN_WITHOUT_BANNER"))
        .setDesc(i18n.t("CAN_BE_POSITIVE_OR_NEGATIVE"))
        .addText(text => {
            text.inputEl.type = "number"
            text.setValue(plugin.settings.iconTopMarginWithoutBanner.toString())
            .setPlaceholder('0')
            .onChange(async (value) => {
                if (!value) value = "0"
                plugin.settings.iconTopMarginWithoutBanner = Number(value);
                await plugin.saveSettings();
                updateIconStyles(plugin);
            })
        });

        new Setting(containerEl)
        .setName(i18n.t("ICON_TOP_MARGIN_WITH_BANNER"))
        .setDesc(i18n.t("CAN_BE_POSITIVE_OR_NEGATIVE"))
        .addText(text => {
            text.inputEl.type = "number"
            text.setValue(plugin.settings.iconTopMargin.toString())
            .setPlaceholder('100')
            .onChange(async (value) => {
                if (!value) value = "0"
                plugin.settings.iconTopMargin = Number(value);
                await plugin.saveSettings();
                updateIconStyles(plugin);
            })
        });

        new Setting(containerEl)
        .setName(i18n.t("ICON_TOP_MARGIN_WITH_BANNER_MOBILE"))
        .setDesc(i18n.t("CAN_BE_POSITIVE_OR_NEGATIVE"))
        .addText(text => {
            text.inputEl.type = "number"
            text.setValue(plugin.settings.iconTopMarginMobile.toString())
            .setPlaceholder('100')
            .onChange(async (value) => {
                if (!value) value = "0"
                plugin.settings.iconTopMarginMobile = Number(value);
                await plugin.saveSettings();
                updateIconStyles(plugin);
            })
        });

        new Setting(containerEl)
        .setName(i18n.t("GAP_AFTER_ICON_WITHOUT_BANNER"))
        .setDesc(i18n.t("CAN_BE_POSITIVE_OR_NEGATIVE"))
        .addText(text => {
            text.inputEl.type = "number"
            text.setValue(plugin.settings.iconGap.toString())
            .setPlaceholder('-20')
            .onChange(async (value) => {
                if (!value) value = "0"
                plugin.settings.iconGap = Number(value);
                await plugin.saveSettings();
                updateIconStyles(plugin);
            })
        });
    }
}