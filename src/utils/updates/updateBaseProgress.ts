import { setTooltip } from "obsidian";


const setCircleProgressStyles = (progress: HTMLElement, percent: number) => {
    let styleProps = {
        background: `radial-gradient(closest-side, var(--color-progress-background) 64%, transparent 65% 100%),
        conic-gradient(var(--color-progress) ${percent}%, var(--background-secondary) 0)`
    }
    if (percent >= 100) {
        styleProps.background = `radial-gradient(closest-side, var(--color-progress-background) 64%, transparent 65% 100%),
        conic-gradient(var(--color-progress-completed) ${percent}%, var(--background-secondary) 0)`
    }
    progress.setCssProps(styleProps)
}


export const updateBaseProgress = async (progressEl: HTMLElement) => {

	let propName = progressEl.getAttribute("data-property") || ""
	if (propName?.startsWith("formula.pp_progress")) {
		let cell = progressEl.querySelector(".bases-table-cell")

		let isBaseCard
		if (!cell) {
			cell = progressEl.querySelector(".bases-cards-line")
			isBaseCard = true
		}

		let existingProgressWrapper = progressEl.querySelector(".metadata-progress-wrapper")

		if (cell instanceof HTMLElement) {
			let valueString = cell.innerText
			
			let valueParts = valueString.match(/(\d+)(\/)(\d+)/);
			if (valueParts) {
				let value = Number(valueParts[1]);
				let max = Number(valueParts[3]);
				let percent = Math.round((value * 100) / max)
				let progress

				if (existingProgressWrapper instanceof HTMLElement) {
					let existingProgressValue = existingProgressWrapper.getAttribute("data-progress-value")
					if (existingProgressValue == valueString) {
						return
					} else {

						//update existing progress
						if (!isBaseCard && propName.startsWith("formula.pp_progress_circle")) {   
							progress = existingProgressWrapper.querySelector("div.metadata-circle-progress")
							if (progress instanceof HTMLElement) {
								setCircleProgressStyles(progress, percent)
							}
						} else {
							progress = existingProgressWrapper.querySelector("progress.metadata-progress")
							if (progress instanceof HTMLProgressElement) {
								progress.value = value;
								progress.max = max;
							}
						}
						existingProgressWrapper.setAttribute("data-progress-value", valueString)
					}
				} else {
					//create new progress

					let progressWrapper = document.createElement("div");
					progressWrapper.classList.add("metadata-progress-wrapper");
					progressWrapper.setAttribute("data-progress-value", valueString)
				
					if (!isBaseCard && progressEl.getAttribute("data-property")?.startsWith("formula.pp_progress_circle")) {
						progress = document.createElement("div");
						progress.classList.add("metadata-circle-progress");
						setCircleProgressStyles(progress, percent)
						
					} else {
						progress = document.createElement("progress");
						progress.classList.add("metadata-progress");
						progress.value = value;
						progress.max = max;
					}

					progressWrapper.append(progress);
					progressEl.classList.add("has-progress-bar");
					progressEl.prepend(progressWrapper);
				}

				

				let percentString = " " + percent + " %";
				if (progress instanceof HTMLElement) {
					setTooltip(progress, percentString, {
						delay: 500,
						placement: "top",
					});
				}
			} else {
				// delete old progress
				existingProgressWrapper?.remove()
			}
		}
	}
}




export const updateBaseProgressEls = async (node: HTMLElement) => {
	let properties = node.querySelectorAll("[data-property^='formula.pp_progress']")

	for (let property of properties) {
		if (property instanceof HTMLElement) {
			updateBaseProgress(property)
		}
	}
}






