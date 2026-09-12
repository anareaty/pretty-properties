import * as Handlebars from "handlebars";
import justHelpers from 'just-handlebars-helpers';
import { registerCustomHelpers } from "./handlabarsHelpers";

interface JustHelpers {
	registerHelpers: (handlebars: typeof Handlebars) => void;
}

const handlebars = Handlebars.create();
(justHelpers as JustHelpers).registerHelpers(handlebars);
registerCustomHelpers(handlebars);


export const getFormattedString = (
	propertyName: string,
	propertyValue: unknown,
	formatTemplate: string
) => {

	const compiled = handlebars.compile(formatTemplate, {noEscape: false});
	return compiled({propertyName, propertyValue})
}


export const validateFormatTemplate = (formatTemplate: string): string | null => {
	try {



		const compiled = handlebars.compile(formatTemplate, {noEscape: false});

	


		compiled({"propertyName": "", "propertyValue": ""});
		return null;
	} catch (e) {
		return e instanceof Error ? e.message : String(e);
	}
}