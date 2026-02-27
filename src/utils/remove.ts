import { querySelectorsWithIframes } from "./querySelectorsHelper"

export const removeAll = async() => {
    let formulaProps = querySelectorsWithIframes(".has-math")
    for (let formulaProp of formulaProps) {
        let formula = formulaProp.querySelector(".math-wrapper")
        formulaProp.classList.remove("has-math")
        formula?.remove()
    }

    let dateProps = querySelectorsWithIframes(".has-custom-date")
    for (let dateProp of dateProps) {
        let custom = dateProp.querySelector(".custom-date")
        dateProp.classList.remove("has-custom-date")
        custom?.remove()
    }

    let colorButtons = querySelectorsWithIframes(".longtext-color-button")
    for (let button of colorButtons) {
        button.remove()
    }

    let progressWrappers = querySelectorsWithIframes(".metadata-progress-wrapper")
    for (let progress of progressWrappers) {
    progress.remove()
    }

    let banners = document.querySelectorAll(".banner-image")
    for (let banner of banners) {
        banner.remove()
    }

    let icons = document.querySelectorAll(".icon-wrapper")
    for (let icon of icons) {
        icon.remove()
    }

    let covers = document.querySelectorAll(".metadata-side-image")
    for (let cover of covers) {
        cover.remove()
    }
}


export const removeColorStyles = () => {
    let colorClasses = ["theme-color", "custom-color", "transparent-color", "default-color", "theme-text-color", "custom-text-color", "none-text-color", "default-text-color"];
    for (let colorClass of colorClasses) {

        let queryStrings = [
            ".metadata-container ." + colorClass, 
            ".bases-view ." + colorClass
        ]

        for (let queryString of queryStrings) {
            let elements = querySelectorsWithIframes(queryString)
            for (let el of elements) {
                el.classList.remove(colorClass)
            }
        }
    }
}


export const removeInlineTagsColorStyles = () => {
    let colorClasses = ["theme-color", "custom-color", "transparent-color", "default-color", "theme-text-color", "custom-text-color", "none-text-color", "default-text-color"];
    for (let colorClass of colorClasses) {
        let queryString = ".markdown-preview-sizer a.tag:not(.metadata-container a.tag)"
        let elements = querySelectorsWithIframes(queryString)
        for (let el of elements) {
            el.classList.remove(colorClass)
        }
    }
}

