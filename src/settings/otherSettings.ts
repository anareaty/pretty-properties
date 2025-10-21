import { Setting, loadMathJax, Notice } from 'obsidian';
import { i18n } from 'src/localization/localization';
import { DEFAULT_SETTINGS, PPSettingTab } from 'src/settings/settings';
import { updateLongTexts } from 'src/utils/updates/updatePills';
import { updateHiddenProperties } from 'src/utils/updates/updateHiddenProperties';
import { updateBannerStyles, updateBaseTagsStyle, updateCoverStyles, updateHiddenPropertiesInPropTab, updateIconStyles, updatePillPaddings, updateRelativeDateColors } from 'src/utils/updates/updateStyles';
import { updateAllProperties } from 'src/utils/updates/updateElements';





export const showOtherSettings = (settingTab: PPSettingTab) => {
    const {containerEl, plugin} = settingTab

    new Setting(containerEl)
        .setName(i18n.t("ENABLE_MATH"))
        .addToggle(toggle => toggle
            .setValue(plugin.settings.enableMath)
            .onChange(async (value) => {
                plugin.settings.enableMath = value
                await plugin.saveSettings();
                //@ts-ignore
                if (plugin.settings.enableMath && !window.MathJax) {
                    loadMathJax()
                }
                updateLongTexts(document.body, plugin)			
            }));


    new Setting(containerEl)
        .setName(i18n.t("CLEAR_SETTINGS"))
        .setDesc(i18n.t("CLEAR_SETTINGS_DESCRIPTION"))
        .addButton(button => button
            .setButtonText(i18n.t("CLEAR"))
            .setClass("mod-warning")
            .onClick(async () => {
                plugin.settings = Object.assign({}, DEFAULT_SETTINGS);
                await plugin.saveSettings();
                updateRelativeDateColors(plugin)
                updateBannerStyles(plugin);
                updateIconStyles(plugin);
                updateCoverStyles(plugin);
                updatePillPaddings(plugin)
                updateHiddenPropertiesInPropTab(plugin)
                updateBaseTagsStyle(plugin)
                updateAllProperties(plugin)
                settingTab.display();
                new Notice(i18n.t("CLEAR_SETTINGS_NOTICE"))
            }))
}

