
export const removeAll = async() => {
    let formulaProps = document.querySelectorAll(".has-math")
    for (let formulaProp of formulaProps) {
        let formula = formulaProp.querySelector(".math-wrapper")
        formulaProp.classList.remove("has-math")
        formula?.remove()
    }

    let dateProps = document.querySelectorAll(".has-custom-date")
    for (let dateProp of dateProps) {
        let custom = dateProp.querySelector(".custom-date")
        dateProp.classList.remove("has-custom-date")
        custom?.remove()
    }

    let colorButtons = document.querySelectorAll(".longtext-color-button")
    for (let button of colorButtons) {
        button.remove()
    }

    let progressWrappers = document.querySelectorAll(".metadata-progress-wrapper")
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