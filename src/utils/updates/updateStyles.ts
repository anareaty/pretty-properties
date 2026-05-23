import PrettyPropertiesPlugin from "src/main";
import { Platform } from "obsidian";
import { getTextLightness } from "./updatePills";
import { updateHiddenProperties } from "./updateHiddenProperties";


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
        "--banner-height-popover": plugin.settings.bannerHeightPopover + "px",
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


    let bannerIconGapPopover = bannerIconGap + plugin.settings.iconSizePopover - iconSize


    let iconColor = plugin.settings.iconColor;
    let iconColorDark = plugin.settings.iconColorDark;


    if (!iconColor) iconColor = "var(--text-normal)";
    if (!iconColorDark) iconColorDark = "var(--text-normal)";

    let iconBackground = "transparent";
    if (plugin.settings.iconBackground) {
      iconBackground = "var(--background-primary)";
    }

    let iconTopMarginPopover = iconTopMargin - plugin.settings.bannerHeight + plugin.settings.bannerHeightPopover

    let iconProps = {
      "--pp-icon-size": iconSize + "px",
      "--pp-title-icon-size": plugin.settings.titleIconSize + "px",
      "--pp-icon-size-popover": plugin.settings.iconSizePopover + "px",
      "--pp-icon-top-margin": iconTopMargin + "px",
      "--pp-icon-top-margin-popover": iconTopMarginPopover + "px",
      "--pp-icon-top-margin-wb": plugin.settings.iconTopMarginWithoutBanner + "px",
      "--pp-icon-gap": plugin.settings.iconGap + "px",
      "--pp-banner-icon-gap": bannerIconGap + "px",
      "--pp-banner-icon-gap-popover": bannerIconGapPopover + "px",
      "--pp-icon-left-margin": plugin.settings.iconLeftMargin + "px",
      "--pp-icon-color-light": iconColor,
      "--pp-icon-color-dark": iconColorDark,
      "--pp-icon-background": iconBackground
    };
    document.body.setCssProps(iconProps);

    if (plugin.settings.iconInTitle && plugin.settings.titleTextIconMatchTitleSize) {
      document.body.classList.add("text-icon-match-title-size")
    } else {
      document.body.classList.remove("text-icon-match-title-size")
    }
}



export const updateCoverStyles = (plugin: PrettyPropertiesPlugin) => {
    let coverProps = {
    "--cover-width-horizontal": plugin.settings.coverHorizontalWidth + "px",
    "--cover-width-vertical": plugin.settings.coverVerticalWidth + "px",
    "--cover-max-height": plugin.settings.coverMaxHeight + "px",
    "--cover-max-height-top-bottom": plugin.settings.coverMaxHeightTopBottom + "px",
    "--cover-width-initial": plugin.settings.coverDefaultWidth1 + "px",
    "--cover-width-initial-2": plugin.settings.coverDefaultWidth2 + "px",
    "--cover-width-initial-3": plugin.settings.coverDefaultWidth3 + "px",
    "--cover-width-square": plugin.settings.coverSquareWidth + "px",
    "--cover-width-circle": plugin.settings.coverCircleWidth + "px",
    "--cover-max-width-popover": plugin.settings.coverMaxWidthPopover + "px",
    "--cover-max-width-canvas": plugin.settings.coverMaxWidthCanvas + "px"
    }
  document.body.setCssProps(coverProps);

  if (plugin.settings.hideCoverCollapsed) {
    document.body.classList.add("hide-cover-collapsed")
  } else {
    document.body.classList.remove("hide-cover-collapsed")
  }
    
  
  
}



export const updateRelativeDateColors = (plugin: PrettyPropertiesPlugin) => {

  let colors = ["red", "orange", "yellow", "green", "cyan", "blue", "purple", "pink"];

  let future = plugin.settings.dateColors.future
  let present= plugin.settings.dateColors.present
  let past = plugin.settings.dateColors.past

  let futureColor = future.pillColor
  let presentColor = present.pillColor
  let pastColor = past.pillColor

  let futureBaseTextColor = future.textColor
  let presentBaseTextColor = present.textColor
  let pastBaseTextColor = past.textColor

  

  let futureBgColor = ""
  let futureTextColor = ""
  let presentBgColor = ""
  let presentTextColor = ""
  let pastBgColor = ""
  let pastTextColor = ""

  let coloredDatesClass = ""

 
  if (colors.find((c) => c == futureColor) && typeof futureColor == "string") {
    futureBgColor = "rgba(var(--color-" + futureColor + "-rgb), 0.2)"
    coloredDatesClass = "colored-dates"
  } else if (futureColor && typeof futureColor != "string") {
      let textLightness = getTextLightness(futureColor);
      let hslString = futureColor.h + " ," + futureColor.s + "% ," + futureColor.l + "%";
      let hslStringText = futureColor.h + " ," + futureColor.s + "% ," + textLightness + "%";
      futureBgColor = "hsl(" + hslString + ")"
      futureTextColor = "hsl(" + hslStringText + ")"
      coloredDatesClass = "colored-dates"
  }

  if (colors.find((c) => c == presentColor) && typeof presentColor == "string") {
    presentBgColor = "rgba(var(--color-" + presentColor + "-rgb), 0.2)"
    coloredDatesClass = "colored-dates"
  } else if (presentColor && typeof presentColor != "string") {
    let textLightness = getTextLightness(presentColor);
    let hslString = presentColor.h + " ," + presentColor.s + "% ," + presentColor.l + "%";
    let hslStringText = presentColor.h + " ," + presentColor.s + "% ," + textLightness + "%";
    presentBgColor = "hsl(" + hslString + ")"
    presentTextColor = "hsl(" + hslStringText + ")"
    coloredDatesClass = "colored-dates"
  }

  if (colors.find((c) => c == pastColor) && typeof pastColor == "string") {
    pastBgColor = "rgba(var(--color-" + pastColor + "-rgb), 0.2)"
    coloredDatesClass = "colored-dates"
  } else if (pastColor && typeof pastColor != "string") {
    let textLightness = getTextLightness(pastColor);
    let hslString = pastColor.h + " ," + pastColor.s + "% ," + pastColor.l + "%";
    let hslStringText = pastColor.h + " ," + pastColor.s + "% ," + textLightness + "%";
    pastBgColor = "hsl(" + hslString + ")"
    pastTextColor = "hsl(" + hslStringText + ")"
    coloredDatesClass = "colored-dates"
  }

  if (colors.find((c) => c == futureBaseTextColor) && typeof futureBaseTextColor == "string") {
    futureTextColor = "rgb(var(--color-" + futureBaseTextColor + "-rgb))"
  } else if (futureBaseTextColor && typeof futureBaseTextColor != "string") {
    let hslStringText = futureBaseTextColor.h + " ," + futureBaseTextColor.s + "% ," + futureBaseTextColor.l + "%";
    futureTextColor = "hsl(" + hslStringText + ")"
  } else if (futureBaseTextColor == "none") {
    futureTextColor = "var(--text-normal)"
  }

  if (colors.find((c) => c == presentBaseTextColor) && typeof presentBaseTextColor == "string") {
    presentTextColor = "rgb(var(--color-" + presentBaseTextColor + "-rgb))"
  } else if (presentBaseTextColor && typeof presentBaseTextColor != "string") {
    let hslStringText = presentBaseTextColor.h + " ," + presentBaseTextColor.s + "% ," + presentBaseTextColor.l + "%";
    presentTextColor = "hsl(" + hslStringText + ")"
  } else if (presentBaseTextColor == "none") {
    presentTextColor = "var(--text-normal)"
  }


  if (colors.find((c) => c == pastBaseTextColor) && typeof pastBaseTextColor == "string") {
    pastTextColor = "rgb(var(--color-" + pastBaseTextColor + "-rgb))"
  } else if (pastBaseTextColor && typeof pastBaseTextColor != "string") {
    let hslStringText = pastBaseTextColor.h + " ," + pastBaseTextColor.s + "% ," + pastBaseTextColor.l + "%";
    pastTextColor = "hsl(" + hslStringText + ")"
  } else if (pastBaseTextColor == "none") {
    pastTextColor = "var(--text-normal)"
  }
	
  let relativeDatesProps = {
    "--date-future-background": futureBgColor,
    "--date-future-color": futureTextColor,
    "--date-present-background": presentBgColor,
    "--date-present-color": presentTextColor,
    "--date-past-background": pastBgColor,
    "--date-past-color": pastTextColor,

  }
  document.body.setCssProps(relativeDatesProps);
  document.body.classList.add(coloredDatesClass)
}



export const updatePillPaddings = (plugin: PrettyPropertiesPlugin) => {
    let pillPaddingOptions = ["all", "none", "colored", "non-transparent"]
    for (let option of pillPaddingOptions) {
        document.body.classList.remove("pp-pill-padding-" + option)
    }
    document.body.classList.add("pp-pill-padding-" + plugin.settings.addPillPadding)
}



export const updateHiddenPropertiesInPropTab = (plugin: PrettyPropertiesPlugin) => {
  let hidden = plugin.settings.hidePropertiesInPropTab
  document.body.classList.toggle("hidden-props-in-prop-tab", hidden)
  updateHiddenProperties(plugin)
}


export const updateHiddenEmptyProperties = (plugin: PrettyPropertiesPlugin) => {
  let hideAllEmptyProperties = plugin.settings.hideAllEmptyProperties
  document.body.classList.toggle("hide-all-empty-properties", hideAllEmptyProperties)
}


export const updateHiddenMetadataContainer = (plugin: PrettyPropertiesPlugin) => {
  let hideMetadataContainerIfAllPropertiesHiddenEditing = plugin.settings.hideMetadataContainerIfAllPropertiesHiddenEditing
  document.body.classList.toggle("hide-metadata-if-props-empty-editing", hideMetadataContainerIfAllPropertiesHiddenEditing)

  let hideMetadataContainerIfAllPropertiesHiddenReading = plugin.settings.hideMetadataContainerIfAllPropertiesHiddenReading
  document.body.classList.toggle("hide-metadata-if-props-empty-reading", hideMetadataContainerIfAllPropertiesHiddenReading)
}


export const updateAutoHideProps = (plugin: PrettyPropertiesPlugin) => {
  let autoHidePropertiesWithBanner = plugin.settings.autoHidePropertiesWithBanner
  document.body.classList.toggle("autohide-props-with-banner", autoHidePropertiesWithBanner)
}


export const updateBaseTagsStyle = (plugin: PrettyPropertiesPlugin) => {
  document.body.classList.toggle("base-tags-style", plugin.settings.addBaseTagColor)
}


export const updateHidePropTitle = (plugin: PrettyPropertiesPlugin) => {
  document.body.classList.toggle("hide-properties-title", plugin.settings.hidePropTitle)
}


export const updateHideMetadataAddButton = (plugin: PrettyPropertiesPlugin) => {
  document.body.classList.toggle("hide-metadata-add-button", plugin.settings.hideAddPropertyButton)
}


export const updateTheme = (plugin: PrettyPropertiesPlugin) => {
  let theme = (plugin.app.customCss as {theme: string} | undefined)?.theme
  if (theme) {
    document.body.setAttr('data-theme', theme);
  } else {
    document.body.removeAttribute('data-theme');
  }
}