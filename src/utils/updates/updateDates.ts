import { moment } from "obsidian";
import PrettyPropertiesPlugin from "src/main";


export const updateDateInput = async (input: HTMLInputElement, plugin: PrettyPropertiesPlugin) => {
	let value = input.value;
	let parent = input.parentElement
	let customDateFormat = plugin.settings.customDateFormat

	if (parent instanceof HTMLElement) {
		let isBase = parent.classList.contains("bases-table-cell")
		let existingCustomDateElement = parent.querySelector(".custom-date")
		//let disabled = input.disabled

		if (plugin.settings.enableCustomDateFormat && 
			customDateFormat && 
			//!disabled &&
			(!isBase || (plugin.settings.enableBases && plugin.settings.enableCustomDateFormatInBases))) {

				
			let customDate = moment(value).format(customDateFormat);
			
			if (existingCustomDateElement instanceof HTMLElement &&
				existingCustomDateElement.innerText != customDate && 
				customDate != "Invalid date") {
				existingCustomDateElement.textContent = customDate
				parent.classList.add("has-custom-date")
				
			} else if (!existingCustomDateElement && customDate != "Invalid date") {
				let customDateEl = document.createElement("span")
				customDateEl.classList.add("custom-date")
				customDateEl.append(customDate)
				input.after(customDateEl)
				parent.classList.add("has-custom-date")
	
			} else if (existingCustomDateElement && customDate == "Invalid date") {
				existingCustomDateElement.textContent = ""
				parent.classList.remove("has-custom-date")
			}

		} else if (existingCustomDateElement) {
			existingCustomDateElement.textContent = ""
			parent.classList.remove("has-custom-date")
		}

		if (value) {
			let currentTime = moment().toISOString(true).slice(0, 10);
			if (currentTime == value) {
				parent.setAttribute("data-relative-date", "present");
			} else if (currentTime > value) {
				parent.setAttribute("data-relative-date", "past");
			} else {
				parent.setAttribute("data-relative-date", "future");
			}
		} else {
			parent.setAttribute("data-relative-date", "none");
		}
	}
}



export const updateDateTimeInput = async (input: HTMLInputElement, plugin: PrettyPropertiesPlugin) => {
	let value = input.value;
	let parent = input.parentElement
	let customDateTimeFormat = plugin.settings.customDateTimeFormat

	if (parent instanceof HTMLElement) {
		let isBase = parent.classList.contains("bases-table-cell")
		let existingCustomDateElement = parent.querySelector(".custom-date")

		if (plugin.settings.enableCustomDateFormat && 
			customDateTimeFormat && 
			(!isBase || (plugin.settings.enableBases && plugin.settings.enableCustomDateFormatInBases))) {

			let customDate = moment(value).format(customDateTimeFormat);
			
			if (existingCustomDateElement instanceof HTMLElement && 
				existingCustomDateElement.innerText != customDate && 
				customDate != "Invalid date") {
	
				existingCustomDateElement.textContent = customDate
				parent.classList.add("has-custom-date")
				
			} else if (!existingCustomDateElement && customDate != "Invalid date") {
				let customDateEl = document.createElement("span")
				customDateEl.classList.add("custom-date")
				customDateEl.append(customDate)
				input.after(customDateEl)
				parent.classList.add("has-custom-date")
	
			} else if (existingCustomDateElement && customDate == "Invalid date") {
				existingCustomDateElement.textContent = ""
				parent.classList.remove("has-custom-date")
			}
		}  else if (existingCustomDateElement) {
			existingCustomDateElement.textContent = ""
			parent.classList.remove("has-custom-date")
		}

		if (value) {
			let currentTime = moment().toISOString(true).slice(0, 16);
			value = value.slice(0, 16);
			if (currentTime == value) {
				parent.setAttribute("data-relative-date", "present");
			} else if (currentTime > value) {
				parent.setAttribute("data-relative-date", "past");
			} else {
				parent.setAttribute("data-relative-date", "future");
			}
		} else {
			parent.setAttribute("data-relative-date", "none");
		}
	}
}



