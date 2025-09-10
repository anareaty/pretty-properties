import PrettyPropertiesPlugin from "src/main";
import { Platform } from "obsidian";



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



export const updateHiddenProperties = (plugin: PrettyPropertiesPlugin) => {
    let styleText = "";
    for (let prop of plugin.settings.hiddenProperties) {
        styleText = styleText +
        "body:not(.show-hidden-properties) .workspace-leaf-content[data-type='markdown'] .metadata-property[data-property-key='" + prop + "'] {display: none;}\n" +
        "body:not(.show-hidden-properties) .hover-popover .metadata-property[data-property-key='" + prop + "'] {display: none;}\n"
    }

    let oldStyle = document.head.querySelector("style#pp-hide-properties");
    if (oldStyle) oldStyle.remove();
    const style = document.createElement("style");
    style.textContent = styleText;
    style.id = "pp-hide-properties";
    document.head.appendChild(style);
}



const getTextLightness = (color: any) => {
    let textLightness = 30
    if (color.l < 80) textLightness = 20
    if (color.l < 70) textLightness = 10
    if (color.l < 60) textLightness = 5
    if (color.l < 50) textLightness = 95
    if (color.l < 40) textLightness = 90
    if (color.l < 30) textLightness = 80
    return textLightness
}


export const updatePillColors = (plugin: PrettyPropertiesPlugin) => {
    let styleText = "";
    let transparentPropsDataString = ".test,"
    let tagColors = plugin.settings.tagColors
    let propertyPillColors = plugin.settings.propertyPillColors
    let propertyLongtextColors = plugin.settings.propertyLongtextColors
    let colors = ["red", "orange", "yellow", "green", "cyan", "blue", "purple", "pink", "none", "default"]

    

    if (plugin.settings.enableColoredProperties) {

        for (let prop in propertyPillColors) {
            let color = propertyPillColors[prop]

            if (colors.find(c => c == color)) {
                styleText = styleText +
                "[data-property-pill-value='" + prop + "'] {\n" +
                "--pill-color-rgb: var(--color-" + color + "-rgb); \n" +
                "--pill-background-modified: rgba(var(--pill-color-rgb), 0.2); \n" + 
                "--pill-background-hover-modified: rgba(var(--pill-color-rgb), 0.3);}\n";
            } else {

                let textLightness = getTextLightness(color)

                let hslString = color.h + " ," + color.s + "% ," + color.l + "%"
                let hslStringHover = color.h + " ," + color.s + "% ," + (color.l - 5) + "%"
                let hslStringText = color.h + " ," + color.s + "% ," + textLightness + "%"
                
                styleText = styleText +
                "[data-property-pill-value='" + prop + "'] {\n" +
                "--pill-background-hsl: " + hslString + "; \n" + 
                "--pill-background-hover-hsl: " + hslStringHover + "; \n" + 
                "--pill-text-hsl: " + hslStringText + " ; \n" +
                "--pill-background-modified:  hsl(var(--pill-background-hsl)) ; \n" + 
                "--pill-background-hover-modified:  hsl(var(--pill-background-hover-hsl)) ; \n" +
                "--pill-color:  hsl(var(--pill-text-hsl))  !important; \n" +
                "--pill-color-hover: hsl(var(--pill-text-hsl)) ; \n" +
                "--pill-color-remove: hsl(var(--pill-text-hsl)) ; \n" +
                "--pill-color-remove-hover: hsl(var(--pill-text-hsl))" +
                ";}\n";
            }

            if (plugin.settings.addPillPadding == "colored" && color != "none") {

                styleText = styleText +
                    ".metadata-property-value .multi-select-pill[data-property-pill-value='" + prop + "'],\n" + 
                    "[data-property*='note'] .value-list-element[data-property-pill-value='" + prop + "'],\n" +
                    "[data-property*='formula.tags'] .value-list-element[data-property-pill-value='" + prop + "']\n" +
                    " {\n" +
                    "--pill-padding-x: var(--tag-padding-x);\n}\n" + 
                    ".metadata-property-value .metadata-input-longtext[data-property-pill-value='" + prop + "'],\n" + 
                    ".bases-cards-line[data-property-longtext-value='" + prop + "']\n" +
                    " {\n" +
                    "--longtext-margin: var(--input-padding);\n}\n"
            }

            if (color == "none") {
                transparentPropsDataString = transparentPropsDataString +
                "[data-property-pill-value='" + prop + "'],"
            }
        }



        for (let prop in tagColors) {
            let color = tagColors[prop]

            if (colors.find(c => c == color)) {
                styleText = styleText +
                "[data-tag-value='" + prop + "'] {\n" +
                "--tag-color-rgb: var(--color-" + color + "-rgb); \n" +
                "--tag-color-modified: rgba(var(--tag-color-rgb), 1); \n" + 
                "--tag-background-modified: rgba(var(--tag-color-rgb), 0.2); \n" + 
                "--tag-background-hover-modified: rgba(var(--tag-color-rgb), 0.3);}\n";
            } else {

                let textLightness = getTextLightness(color)

                let hslString = color.h + " ," + color.s + "% ," + color.l + "%"
                let hslStringHover = color.h + " ," + color.s + "% ," + (color.l - 5) + "%"
                let hslStringText = color.h + " ," + color.s + "% ," + textLightness + "%"
                
                styleText = styleText +
                "[data-tag-value='" + prop + "'] {\n" +
                "--pill-background-hsl: " + hslString + "; \n" + 
                "--pill-background-hover-hsl: " + hslStringHover + "; \n" + 
                "--pill-text-hsl: " + hslStringText + " ; \n" +
                "--tag-background-modified:  hsl(var(--pill-background-hsl)) ; \n" + 
                "--tag-background-hover-modified:  hsl(var(--pill-background-hover-hsl)) ; \n" +
                "--tag-color-modified:  hsl(var(--pill-text-hsl))  !important; \n" +
                "--tag-color-hover: hsl(var(--pill-text-hsl)) ; \n" +
                "--pill-color-remove: hsl(var(--pill-text-hsl)) ; \n" +
                "--pill-color-remove-hover: hsl(var(--pill-text-hsl))" +
                ";}\n";
            }

            if (plugin.settings.addPillPadding == "colored" && color != "none") {

                styleText = styleText +
                    ".metadata-property-value .multi-select-pill[data-property-pill-value='" + prop + "'],\n" + 
                    "[data-property*='note'] .value-list-element[data-property-pill-value='" + prop + "'],\n" +
                    "[data-property*='formula.tags'] .value-list-element[data-property-pill-value='" + prop + "']\n" +
                    " {\n" +
                    "--pill-padding-x: var(--tag-padding-x);\n}\n" + 
                    ".metadata-property-value .metadata-input-longtext[data-property-pill-value='" + prop + "'],\n" + 
                    ".bases-cards-line[data-property-longtext-value='" + prop + "']\n" +
                    " {\n" +
                    "--longtext-margin: var(--input-padding);\n}\n"
            }

            if (color == "none") {
                transparentPropsDataString = transparentPropsDataString +
                "[data-property-pill-value='" + prop + "'],"
            }
        }



        for (let prop in propertyLongtextColors) {
            let color = propertyLongtextColors[prop]

            if (colors.find(c => c == color)) {
                styleText = styleText +
                "[data-property-longtext-value='" + prop + "'] {\n" +
                "--longtext-bg-color: rgba(var(--color-" + color + "-rgb), 0.2);\n}\n";
            } else {

                let textLightness = 30
                if (color.l < 80) textLightness = 20
                if (color.l < 70) textLightness = 10
                if (color.l < 60) textLightness = 5
                if (color.l < 50) textLightness = 95
                if (color.l < 40) textLightness = 90
                if (color.l < 30) textLightness = 80

                let hslString = color.h + " ," + color.s + "% ," + color.l + "%"
                let hslStringText = color.h + " ," + color.s + "% ," + textLightness + "%"

                styleText = styleText +
                "[data-property-longtext-value='" + prop + "'] {\n" +
                "--pill-background-hsl: " + hslString + "; \n" + 
                "--pill-text-hsl: " + hslStringText + " ; \n" +
                "--longtext-bg-color: hsl(var(--pill-background-hsl)); " + 
                "--metadata-input-text-color-modified: hsl(var(--pill-text-hsl)) \n}\n";
            }

            if (plugin.settings.addPillPadding == "colored" && color != "none") {
                styleText = styleText +
                    ".metadata-property-value .metadata-input-longtext[data-property-longtext-value='" + prop + "'],\n" + 
                    ".bases-cards-line[data-property-longtext-value='" + prop + "']\n" +
                    " {\n" +
                    "--longtext-margin: var(--input-padding);\n}\n"
            }

            if (color == "none") {
                transparentPropsDataString = transparentPropsDataString +
                "[data-property-longtext-value='" + prop + "'],"
            }

            if (plugin.settings.addPillPadding == "non-transparent" && color != "none") {
                styleText = styleText +
                    ".metadata-property-value .metadata-input-longtext[data-property-longtext-value='" + prop + "'],\n" + 
                    ".bases-cards-line[data-property-longtext-value='" + prop + "']\n" +
                    " {\n" +
                    "--longtext-margin: var(--input-padding);\n}\n"
            }
        }

        if (plugin.settings.addPillPadding == "all") {
            styleText = styleText +
            "\n.metadata-property-value .multi-select-pill," +
            "[data-property*='note'] .value-list-element," +
            "[data-property*='formula.tags'] .value-list-element" +
            " {\n" +
            "--pill-padding-x: var(--tag-padding-x);\n}\n" + 
            ".metadata-property-value .metadata-input-longtext,\n" + 
            ".bases-cards-line\n" +
            " {\n" +
            "--longtext-margin: var(--input-padding);\n}\n"
        }

        if (plugin.settings.addPillPadding == "non-transparent") {
            transparentPropsDataString = transparentPropsDataString.slice(0, -1)
            styleText = styleText +
            ".metadata-property-value .multi-select-pill:not(" + transparentPropsDataString + "),\n" + 
            "[data-property*='note'] .value-list-element:not(" + transparentPropsDataString + ")," +
            "[data-property*='formula.tags'] .value-list-element:not(" + transparentPropsDataString + ")" +
            " {\n" +
            "--pill-padding-x: var(--tag-padding-x);\n}\n" + 
            ".metadata-property-value .metadata-input-longtext:not(" + transparentPropsDataString + "),\n" + 
            " {\n" +
            "--pill-padding-x: var(--tag-padding-x);\n}\n" 
        }
    }

    if (plugin.settings.enableColoredInlineTags) {
        for (let prop in tagColors) {
            let color = tagColors[prop]

            if (colors.find(c => c == color)) {
                styleText = styleText +
                ".cm-hashtag:has([data-tag-value='" + prop + "']), " +
                ".cm-tag-" + prop + ", " +
                "a.tag[href='#" + prop + "'] {\n" +
                "--pill-color-rgb: var(--color-" + color + "-rgb); \n" +
                "--tag-color-modified: rgba(var(--pill-color-rgb), 1); \n" + 
                "--tag-background-modified: rgba(var(--pill-color-rgb), 0.2); \n" + 
                "--tag-background-hover-modified: rgba(var(--pill-color-rgb), 0.3);}\n";
            } else {

                let textLightness = getTextLightness(color)

                let hslString = color.h + " ," + color.s + "% ," + color.l + "%"
                let hslStringHover = color.h + " ," + color.s + "% ," + (color.l - 5) + "%"
                let hslStringText = color.h + " ," + color.s + "% ," + textLightness + "%"
                
                styleText = styleText +
                ".cm-tag-" + prop + ", " +
                ".cm-hashtag:has([data-tag-value='" + prop + "']), " +
                "a.tag[href='#" + prop + "']  {\n" +
                "--pill-background-hsl: " + hslString + "; \n" + 
                "--pill-background-hover-hsl: " + hslStringHover + "; \n" + 
                "--pill-text-hsl: " + hslStringText + " ; \n" +
                "--tag-background-modified:  hsl(var(--pill-background-hsl)) ; \n" + 
                "--tag-background-hover-modified:  hsl(var(--pill-background-hover-hsl)) ; \n" + 
                "--tag-color-modified:  hsl(var(--pill-text-hsl)) ; \n" +
                ";}\n";
            }
        }
    }

    let oldStyle = document.head.querySelector("style#pp-pill-colors");
    if (oldStyle) oldStyle.remove();
    const style = document.createElement("style");
    style.textContent = styleText;
    style.id = "pp-pill-colors";
    document.head.appendChild(style);

    if (plugin.settings.addBaseTagColor) {
        document.body.classList.add("pp-base-tag-color")
    } else {
        document.body.classList.remove("pp-base-tag-color")
    }
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



export const updateBaseStyles = (plugin: PrettyPropertiesPlugin) => {
    if (plugin.settings.enableBases) {
        document.body.classList.add("pp-bases-enabled")
    } else {
        document.body.classList.remove("pp-bases-enabled")
    }
}
