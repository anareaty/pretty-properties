import PrettyPropertiesPlugin from "src/main";
import { Platform, MarkdownView, FileView } from "obsidian";
import { EditorView } from '@codemirror/view';
import { getTextLightness } from "./updatePills";




export const updateBannerStyles = (plugin: PrettyPropertiesPlugin) => {
    let bannerHeight = plugin.settings.bannerHeight;
    let bannerMargin = plugin.settings.bannerMargin;
    if (Platform.isMobile) {
        bannerHeight = plugin.settings.bannerHeightMobile;
        bannerMargin = plugin.settings.bannerMarginMobile;
    } 
    let bannerFading = "none";
    if (plugin.settings.bannerFading) {
        bannerFading = "linear-gradient(to bottom, black 25%, transparent)";
    }
    let bannerProps = {
        "--banner-height": bannerHeight + "px",
        "--banner-margin": bannerMargin + "px",
        "--banner-fading": bannerFading
    };
    document.body.setCssProps(bannerProps);
}



export const updateIconStyles = (plugin: PrettyPropertiesPlugin) => {
    let iconTopMargin = plugin.settings.iconTopMargin;
    let bannerIconGap = plugin.settings.bannerIconGap;
    let iconSize = plugin.settings.iconSize;
    if (Platform.isMobile) {
      iconTopMargin = plugin.settings.iconTopMarginMobile;
      bannerIconGap = plugin.settings.bannerIconGapMobile;
      iconSize = plugin.settings.iconSizeMobile;
    } 
    let iconColor = plugin.settings.iconColor;
    if (!iconColor)
      iconColor = "var(--text-normal)";
    let iconBackground = "transparent";
    if (plugin.settings.iconBackground) {
      iconBackground = "var(--background-primary)";
    }
    let iconProps = {
      "--pp-icon-size": iconSize + "px",
      "--pp-icon-top-margin": iconTopMargin + "px",
      "--pp-icon-top-margin-wb": plugin.settings.iconTopMarginWithoutBanner + "px",
      "--pp-icon-gap": plugin.settings.iconGap + "px",
      "--pp-banner-icon-gap": bannerIconGap + "px",
      "--pp-icon-left-margin": plugin.settings.iconLeftMargin + "px",
      "--pp-icon-color": iconColor,
      "--pp-icon-background": iconBackground
    };
    document.body.setCssProps(iconProps);
}



export const updateCoverStyles = (plugin: PrettyPropertiesPlugin) => {
    let coverProps = {
    "--cover-width-horizontal": plugin.settings.coverHorizontalWidth + "px",
    "--cover-width-vertical": plugin.settings.coverVerticalWidth + "px",
    "--cover-max-height": plugin.settings.coverMaxHeight + "px",
    "--cover-width-initial": plugin.settings.coverDefaultWidth1 + "px",
    "--cover-width-initial-2": plugin.settings.coverDefaultWidth2 + "px",
    "--cover-width-initial-3": plugin.settings.coverDefaultWidth3 + "px",
    "--cover-width-square": plugin.settings.coverSquareWidth + "px",
    "--cover-width-circle": plugin.settings.coverCircleWidth + "px"
    }
  document.body.setCssProps(coverProps);
}






export const updateRelativeDateColors = (plugin: PrettyPropertiesPlugin) => {
  let colors = ["red", "orange", "yellow", "green", "cyan", "blue", "purple", "pink"];
  let futureColor = plugin.settings.dateFutureColor;
  let presentColor = plugin.settings.datePresentColor;
  let pastColor = plugin.settings.datePastColor;

  let futureBgColor = ""
  let futureTextColor = ""
  let presentBgColor = ""
  let presentTextColor = ""
  let pastBgColor = ""
  let pastTextColor = ""
 
  if (colors.find((c) => c == futureColor)) {
    futureBgColor = "rgba(var(--color-" + futureColor + "-rgb), 0.2)"
  } else if (futureColor.h !== undefined) {
      let textLightness = getTextLightness(futureColor);
      let hslString = futureColor.h + " ," + futureColor.s + "% ," + futureColor.l + "%";
      let hslStringText = futureColor.h + " ," + futureColor.s + "% ," + textLightness + "%";
      futureBgColor = "hsl(" + hslString + ")"
      futureTextColor = "hsl(" + hslStringText + ")"
  }

  if (colors.find((c) => c == presentColor)) {
    presentBgColor = "rgba(var(--color-" + presentColor + "-rgb), 0.2)"
  } else if (presentColor.h !== undefined) {
    let textLightness = getTextLightness(presentColor);
    let hslString = presentColor.h + " ," + presentColor.s + "% ," + presentColor.l + "%";
    let hslStringText = presentColor.h + " ," + presentColor.s + "% ," + textLightness + "%";
    presentBgColor = "hsl(" + hslString + ")"
    presentTextColor = "hsl(" + hslStringText + ")"
  }

  if (colors.find((c) => c == pastColor)) {
    pastBgColor = "rgba(var(--color-" + pastColor + "-rgb), 0.2)"
  } else if (pastColor.h !== undefined) {
    let textLightness = getTextLightness(pastColor);
    let hslString = pastColor.h + " ," + pastColor.s + "% ," + pastColor.l + "%";
    let hslStringText = pastColor.h + " ," + pastColor.s + "% ," + textLightness + "%";
    pastBgColor = "hsl(" + hslString + ")"
    pastTextColor = "hsl(" + hslStringText + ")"
  }
	
  let relativeDatesProps = {
    "--date-future-background": futureBgColor,
    "--date-future-color": futureTextColor,
    "--date-present-background": presentBgColor,
    "--date-present-color": presentTextColor,
    "--date-past-background": pastBgColor,
    "--date-past-color": pastTextColor

  }
  document.body.setCssProps(relativeDatesProps);
}



export const updatePillPaddings = (plugin: PrettyPropertiesPlugin) => {
    let pillPaddingOptions = ["all", "none", "colored", "non-transparent"]
    for (let option of pillPaddingOptions) {
        document.body.classList.remove("pp-pill-padding-" + option)
    }
    document.body.classList.add("pp-pill-padding-" + plugin.settings.addPillPadding)
}





