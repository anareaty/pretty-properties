import {i18n} from "../localization/localization";
import {TextAreaComponent} from "obsidian";
import PrettyPropertiesPlugin from "../main";

export function enhanceFormatTextArea(
	plugin: PrettyPropertiesPlugin,
	text: TextAreaComponent,
	initialValue: string,
	onValidChange: (value: string) => Promise<void> | void,
) {
	text.setValue(initialValue);
	text.setPlaceholder(i18n.t("PROPERTY_FORMAT_PLACEHOLDER"));

	const textareaEl = text.inputEl as HTMLTextAreaElement;
	const parent = textareaEl.parentElement;
	if (!parent) return;

	const wrapper = document.createElement("div");
	wrapper.addClass("pp-format-wrapper");
	parent.insertBefore(wrapper, textareaEl);
	wrapper.appendChild(textareaEl);

	const errorEl = document.createElement("div");
	errorEl.addClass("pp-format-error");
	errorEl.style.display = "none";
	wrapper.appendChild(errorEl);

	const applyValidationState = (tpl: string) => {
		const err = plugin.formatter.validateTemplate(tpl);

		if (err) {
			textareaEl.addClass("pp-format-invalid");
			errorEl.textContent = err;
			errorEl.style.display = "";
		} else {
			textareaEl.removeClass("pp-format-invalid");
			errorEl.textContent = "";
			errorEl.style.display = "none";
		}
	};

	applyValidationState(initialValue);

	text.onChange(async (value: string) => {
		await onValidChange(value);
		applyValidationState(value);
	});
}
