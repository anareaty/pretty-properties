import {i18n} from "../localization/localization";
import {TextAreaComponent} from "obsidian";
import PrettyPropertiesPlugin from "../main";
import { registerPropertyFormatter } from "./propertyFormatter";
import { updateLongTexts } from "./updates/updatePills";

export function enhanceFormatTextArea(
	plugin: PrettyPropertiesPlugin,
	text: TextAreaComponent,
	initialValue: string,
	onValidChange: (value: string) => Promise<void> | void,
) {
	text.setValue(initialValue);
	text.setPlaceholder(i18n.t("PROPERTY_FORMAT_PLACEHOLDER"));

	const textareaEl = text.inputEl
	const parent = textareaEl.parentElement;
	if (!parent) return;

	const wrapper = createDiv();
	wrapper.addClass("pp-format-wrapper");
	parent.insertBefore(wrapper, textareaEl);
	wrapper.appendChild(textareaEl);

	const errorEl = createDiv();
	errorEl.addClass("pp-format-error");
	
	wrapper.appendChild(errorEl);

	const applyValidationState = (tpl: string) => {
		const err = plugin.formatter?.validateTemplate(tpl);

		if (err) {
			textareaEl.addClass("pp-format-invalid");
			errorEl.textContent = err;
			
		} else {
			textareaEl.removeClass("pp-format-invalid");
			errorEl.textContent = "";
			
		}
	};

	applyValidationState(initialValue);

	text.onChange(async (value: string) => {
		if (value) {
			registerPropertyFormatter(plugin, true)
			
		}
		await onValidChange(value);
		applyValidationState(value);
		updateLongTexts(document.body, plugin)
		
	});
}
