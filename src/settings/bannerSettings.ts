import { Setting } from 'obsidian';
import { i18n } from 'src/localization/localization';
import { 
	updateBannerStyles,  
	updateIconStyles
} from 'src/utils/updates/updateStyles';
import { PPSettingTab } from 'src/settings/settings';
import { updateAllBanners } from 'src/utils/updates/updateBanners';



export const showBannerSettings = (settingTab: PPSettingTab) => {
    const {containerEl, plugin} = settingTab

    new Setting(containerEl)
        .setName(i18n.t("ENABLE_BANNER"))
        .addToggle(toggle => toggle
            .setValue(plugin.settings.enableBanner)
            .onChange(async (value) => {
                plugin.settings.enableBanner = value
                await plugin.saveSettings();
                settingTab.display();
                updateAllBanners(plugin);
                updateBannerStyles(plugin);
            }));

    if (plugin.settings.enableBanner) {
        new Setting(containerEl)
        .setName(i18n.t("BANNER_PROPERTY"))
        .addText(text => text
            .setPlaceholder('banner')
            .setValue(plugin.settings.bannerProperty)
            .onChange(async (value) => {
                plugin.settings.bannerProperty = value;
                await plugin.saveSettings();
                updateAllBanners(plugin);
            }));

        new Setting(containerEl)
        .setName(i18n.t("BANNER_POSITION_PROPERTY"))
        .addText(text => text
            .setPlaceholder('banner_position')
            .setValue(plugin.settings.bannerPositionProperty)
            .onChange(async (value) => {
                plugin.settings.bannerPositionProperty = value;
                await plugin.saveSettings();
                updateAllBanners(plugin);
            }));

        new Setting(containerEl)
        .setName(i18n.t("BANNERS_FOLDER"))
        .addText(text => text
            .setValue(plugin.settings.bannersFolder)
            .onChange(async (value) => {
                plugin.settings.bannersFolder = value;
                await plugin.saveSettings();
            }));

        new Setting(containerEl)
        .setName(i18n.t("BANNER_FADING"))
        .addToggle(toggle => toggle
            .setValue(plugin.settings.bannerFading)
            .onChange(async (value) => {
                plugin.settings.bannerFading = value
                await plugin.saveSettings();
                updateBannerStyles(plugin);
            }));

        new Setting(containerEl)
        .setName(i18n.t("BANNER_HEIGHT"))
        .addText(text => {
            text.inputEl.type = "number"
            text.setValue(plugin.settings.bannerHeight.toString())
            .setPlaceholder('150')
            .onChange(async (value) => {
                if (!value) value = "0"
                plugin.settings.bannerHeight = Number(value);
                await plugin.saveSettings();
                updateBannerStyles(plugin);
            })
        });

        new Setting(containerEl)
        .setName(i18n.t("BANNER_HEIGHT_MOBILE"))
        .addText(text => {
            text.inputEl.type = "number"
            text.setValue(plugin.settings.bannerHeightMobile.toString())
            .setPlaceholder('100')
            .onChange(async (value) => {
                if (!value) value = "0"
                plugin.settings.bannerHeightMobile = Number(value);
                await plugin.saveSettings();
                updateBannerStyles(plugin);
            })
        });

        new Setting(containerEl)
        .setName(i18n.t("GAP_AFTER_BANNER"))
        .setDesc(i18n.t("CAN_BE_POSITIVE_OR_NEGATIVE"))
        .addText(text => {
            text.inputEl.type = "number"
            text.setValue(plugin.settings.bannerMargin.toString())
            .setPlaceholder('-20')
            .onChange(async (value) => {
                if (!value) value = "0"
                plugin.settings.bannerMargin = Number(value);
                await plugin.saveSettings();
                updateBannerStyles(plugin);
            })
        });


        new Setting(containerEl)
        .setName(i18n.t("GAP_AFTER_BANNER_MOBILE"))
        .setDesc(i18n.t("CAN_BE_POSITIVE_OR_NEGATIVE"))
        .addText(text => {
            text.inputEl.type = "number"
            text.setValue(plugin.settings.bannerMarginMobile.toString())
            .setPlaceholder('-20')
            .onChange(async (value) => {
                if (!value) value = "0"
                plugin.settings.bannerMarginMobile = Number(value);
                await plugin.saveSettings();
                updateBannerStyles(plugin);
            })
        });


        new Setting(containerEl)
        .setName(i18n.t("GAP_AFTER_BANNER_WITH_ICON"))
        .setDesc(i18n.t("CAN_BE_POSITIVE_OR_NEGATIVE"))
        .addText(text => {
            text.inputEl.type = "number"
            text.setValue(plugin.settings.bannerIconGap.toString())
            .setPlaceholder('-20')
            .onChange(async (value) => {
                if (!value) value = "0"
                plugin.settings.bannerIconGap = Number(value);
                await plugin.saveSettings();
                updateIconStyles(plugin);
            })
        });

        new Setting(containerEl)
        .setName(i18n.t("GAP_AFTER_BANNER_WITH_ICON_MOBILE"))
        .setDesc(i18n.t("CAN_BE_POSITIVE_OR_NEGATIVE"))
        .addText(text => {
            text.inputEl.type = "number"
            text.setValue(plugin.settings.bannerIconGapMobile.toString())
            .setPlaceholder('-20')
            .onChange(async (value) => {
                if (!value) value = "0"
                plugin.settings.bannerIconGapMobile = Number(value);
                await plugin.saveSettings();
                updateIconStyles(plugin);
            })
        });
    }
}