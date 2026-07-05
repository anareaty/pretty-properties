/* Here we are using some helpers from https://www.npmjs.com/package/handlebars.moment */
/* but rewritten to work better with Obsidian */

import lodash from "lodash"
import { moment } from "obsidian";
import momentDurationFormatSetup from "moment-duration-format";


interface Duration extends moment.Duration {
    format(template?: string, precision?: number, settings?: any): string;
    format(template?: string, settings?: any): string;
    format(settings?: any): string;
}

let currentLocale = moment.locale()
momentDurationFormatSetup(moment)
moment.locale(currentLocale)




const momentFormatMap: Record<string, string> = {
    dates: "date",
    months: "month",
    years: "year",
    isoweekday: "isoWeekday",
    dayofyear: "dayOfYear",
    isoweek: "isoWeek",
    isoweeks: "isoWeek",
    weekyear: "weekYear",
    isoweekyear: "isoWeekYear",
    zoneabbr: "zoneAbbr",
    zonename: "zoneName",
    tostring: "toString",
    string: "toString",
    str: "toString",
    valueof: "valueOf",
    value: "valueOf",
    val: "valueOf",
    fromnow: "fromNow",
    daysinmonth: "daysInMonth",
    todate: "toDate",
    toarray: "toArray",
    array: "toArray",
    tojson: "toJSON",
    json: "toJSON",
    toisostring: "toISOString",
    isostring: "toISOString"
}

const weekdayMap: Record<string, string> = {
    L: "dddd",
    S: "ddd",
    XS: "dd"
};



const durationMethodMap: Record<string, string> = {
    asmilliseconds: "asMilliseconds",
    asseconds: "asSeconds",
    asminutes: "asMinutes",
    ashours: "asHours",
    asdays: "asDays",
    asweeks: "asWeeks",
    asmonths: "asMonths",
    asyears: "asYears"
};


const durationGetArray = [
    "ms",
    "s",
    "m",
    "h",
    "d",
    "w",
    "M",
    "y"
];


let durationGetMap: Record<string, boolean> = {};

for (let i in durationGetArray) {
    let durationKey = durationGetArray[i]!
    durationGetMap[durationKey] = true;
}


function hasKey<T extends object>(obj: T, key: string): key is Extract<keyof T, string> {
    return key in obj;
}


export const registerCustomHelpers = (handlebars: typeof Handlebars) => {


    handlebars.registerHelper("moment", function() {
        let args = Array.prototype.slice.call(arguments)
        let options = args.pop()
        let date = args.shift()
        let format = args.shift()
        let formatParams = args.shift()
        let formatParams1 = args.shift()
        let formatParams2 = args.shift()

        if (options.hash && options.hash.params) {
            options.hash = lodash.extend({}, options.hash.params, options.hash);
            delete options.hash.params;
        }
        let params = options.hash;
        
        if (!date) {
            date = params.date;
        }


        function marshallDate (date: unknown, unix: unknown) {
            if (typeof date === "string" && date.match(/^\d+(\.\d+){0,1}$/)) {
                date = +date;
            }
            if (unix && typeof date === "number") {
                date = date * 1000;
            }
            return date;
        }
        date = marshallDate(date, params.unix);
        let max = marshallDate(params.max, params.unixmax);
        let min = marshallDate(params.min, params.unixmin);

        if (!format) {
            format = params.format || params.fn;
        }
        if (momentFormatMap[format]) {
            format = momentFormatMap[format];
        }
        if (format === "weekday") {
            params.type = params.type ? params.type.toUpperCase() : null;
            if (params.type !== "NUMBER") {
                if (weekdayMap[params.type]) {
                    format = weekdayMap[params.type];
                } else {
                    format = weekdayMap.L;
                }
            }
        }

        let ofMethod = "start";
        let ofType = params.startOf || params.startof;
        if (!ofType) {
            ofType = params.endOf || params.endof;
            if (ofType) {
                ofMethod = "end";
            }
        }


        let momentObj: moment.Moment

        if (moment.isMoment(date)) {
            momentObj = date.clone();
        } else {
            let momentFn = params.utc ? moment.utc : moment;
            momentObj = momentFn(date, params.input);
        }


        if (max) {
            momentObj = moment.max(moment(max), momentObj);
        }
        if (min) {
            momentObj = moment.min(moment(min), momentObj);
        }

        if (ofType) {
            if (ofMethod == "start") {
                momentObj = momentObj.startOf(ofType)
            } else if (ofMethod == "end") {
                momentObj = momentObj.endOf(ofType)
            }
        }

        if (params.nosuffix === undefined && params.suffix !== undefined) {
            params.nosuffix = !params.suffix;
        }

        if (params.from) {
            format = "from";
            formatParams = marshallDate(params.from, params.unixfrom);
        }
        if (format === "fromNow") {
            if (formatParams === undefined) {
                formatParams = params.nosuffix;
            }
        }
        if (format === "from") {
            if (formatParams1 === undefined) {
                formatParams1 = params.nosuffix;
            }
        }
        if (params.diff) {
            format = "diff";
            formatParams = marshallDate(params.diff, params.unixdiff);
        }
        if (format === "diff") {
            if (formatParams1 === undefined) {
                formatParams1 = params.unitdiff;
            }
            if (formatParams2 === undefined) {
                formatParams2 = params.nosuffix;
            }
        }

        function manipulateMoment(method: "add" | "subtract") {
            let arg = params[method];
            if (arg) {
                let argParam = params[method + "param"];
                if (argParam === undefined) {
                    argParam = params.amount;
                }
                let args = arg;
                if (argParam) {
                    let addNum = +arg;
                    args = {};
                    if (isNaN(addNum)) {
                        args[arg] = +argParam;
                    } else {
                        args[argParam] = addNum;
                    }
                }
                momentObj[method](args);
            }
        }
        manipulateMoment("add");
        manipulateMoment("subtract");

        if (params.local) {
            momentObj.local();
        } else if (params.utc) {
            momentObj.utc();
        }

        let momentOutput = ""

        if (hasKey(momentObj, format)) {
            let getMomentOutput = momentObj[format] as (f: typeof formatParams, f1: typeof formatParams1, f2: typeof formatParams2) => string
            momentOutput = getMomentOutput(formatParams, formatParams1, formatParams2)
        } else {
            momentOutput = momentObj.format(format)
        }

        return momentOutput;
    });





    handlebars.registerHelper("duration", function() {
        let args = Array.prototype.slice.call(arguments),
            options = args.pop(),
            duration = args.shift(),
            method = args.shift(),
            methodArg = args.shift();

        if (options.hash && options.hash.params) {
            options.hash = lodash.extend({}, options.hash.params, options.hash);
            delete options.hash.params;
        }
        let params = options.hash;
        if (!duration) {
            duration = params.duration;
        }
        if (typeof duration === "string" && duration.match(/^\d+$/)) {
            duration = +duration;
        }

        let durationObj = moment.duration(duration, params.input);

        function manipulateDuration (method: "add" | "subtract") {
            let arg = params[method];
            if (arg) {
                if (!isNaN(+arg)) {
                    arg = +arg;
                }
                let argParam = params[method + "unit"];
                if (argParam === undefined) {
                    argParam = params[method + "param"];
                }
                durationObj[method](arg, argParam);
            }
        }
        manipulateDuration("add");
        manipulateDuration("subtract");

        if (!method) {
            method = params.method;
        }
        if (durationGetMap[method]) {
            methodArg = method;
            method = "get";
        }
        if (durationMethodMap[method]) {
            method = durationMethodMap[method];
        }
        if (params.as) {
            method = "as";
            methodArg = params.as;
        } else if (params.get) {
            method = "get";
            methodArg = params.get;
        }

        if (!hasKey(durationObj, method) || !durationObj[method]) {
            method = "humanize";
        }

        if (method === "humanize") {
            if (methodArg === undefined) {
                methodArg = params.suffix;
            }
        }

        let durationOutput = ""

        if (hasKey(durationObj, method)) {
            let durationMethod = durationObj[method] as (m: typeof methodArg) => string
            durationOutput = durationMethod(methodArg);
        } 

        return durationOutput
    });







		
		

    handlebars.registerHelper("durationHumanized", (
        time: number, 
        unit: moment.DurationInputArg2 | undefined, 
        withSuffixOrOptions?: boolean | Handlebars.HelperOptions
    ) => {
        const withSuffix = typeof withSuffixOrOptions === "boolean" ? withSuffixOrOptions : false;
        return moment.duration(time, unit).humanize(withSuffix);
    });


    handlebars.registerHelper("durationFormatted", (
        time: number, 
        unit: moment.DurationInputArg2 | undefined, 
        formatOrOptions?: string | Handlebars.HelperOptions
    ) => {
        const format = typeof formatOrOptions === "string" ? formatOrOptions : "HH:mm:ss";
        let duration = moment.duration(time, unit) as Duration
        return duration.format(format);
    });
    

    handlebars.registerHelper("durationAbbreviated", (
        time: number, 
        unit: moment.DurationInputArg2 | undefined
    ) => {
        const duration = moment.duration(time, unit);
        const parts: string[] = [];
        if (duration.years() > 0) parts.push(`${duration.years()}y`);
        if (duration.months() > 0) parts.push(`${duration.months()}mo`);
        if (duration.weeks() > 0) parts.push(`${duration.weeks()}w`);
        if (duration.days() > 0) parts.push(`${duration.days()}d`);
        if (duration.hours() > 0) parts.push(`${duration.hours()}h`);
        if (duration.minutes() > 0) parts.push(`${duration.minutes()}m`);
        if (duration.seconds() > 0) parts.push(`${duration.seconds()}s`);
        if (duration.milliseconds() > 0 || parts.length === 0) parts.push(`${duration.milliseconds()}ms`);
        return parts.join(" ");
    });
	}