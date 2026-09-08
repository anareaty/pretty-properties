/* Here we are using some helpers from https://www.npmjs.com/package/handlebars.moment */
/* but rewritten to work better with Obsidian */

import { moment } from "obsidian";
import momentDurationFormatSetup from "moment-duration-format";


interface Duration extends moment.Duration {
    format(template?: string, precision?: number, settings?: unknown): string;
    format(template?: string, settings?: unknown): string;
    format(settings?: unknown): string;
}

let currentLocale = moment.locale();
(momentDurationFormatSetup as (m: typeof moment) => void)(moment)
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


for (let durationKey of durationGetArray) {
    if (durationKey) {
        durationGetMap[durationKey] = true;
    }
}


function hasKey<T extends object>(obj: T, key: string): key is Extract<keyof T, string> {
    return key in obj;
}


export const registerCustomHelpers = (handlebars: typeof Handlebars) => {


    handlebars.registerHelper("moment", function(...args) {
        let options = args.pop() as {hash: {
            params?: Record<string, any>,
            date?: string | number,
            max?: string, 
            unixmax?: string,
            min?: string,
            unixmin?: string,
            unix?: string,
            format?: string,
            fn?: string,
            startOf?: moment.unitOfTime.StartOf,
            startof?: moment.unitOfTime.StartOf,
            endOf?: moment.unitOfTime.StartOf,
            endof?: moment.unitOfTime.StartOf,
            type?: string | null,
            utc?: string,
            input?: string,
            suffix?: string,
            nosuffix?: boolean,
            from?: string,
            unixfrom?: string,
            diff?: string,
            unixdiff?: string,
            unitdiff?: string,
            amount?: string,
            local?: string,
            add?: string,
            addparam?: string,
            subtract?: string,
            subtractparam?: string,

        }}
        let date = args.shift() as string | number | undefined
        let format = args.shift() as string | undefined
        let formatParams = args.shift() as number | boolean | undefined
        let formatParams1 = args.shift() as string | boolean | undefined
        let formatParams2 = args.shift() as boolean | undefined

        if (options.hash && options.hash.params) {
            options.hash = { ...(options.hash?.params || {}), ...(options.hash || {}) }
            delete options.hash.params;
        }
        let params = options.hash;
        
        if (!date) {
            date = params.date;
        }


        function marshallDate (date: unknown, unix: unknown): number | undefined {
            if (typeof date === "string" && date.match(/^\d+(\.\d+){0,1}$/)) {
                date = +date;
            }
            if (unix && typeof date === "number") {
                date = date * 1000;
            }
            return date as number | undefined;
        }
        date = marshallDate(date, params.unix);



        
        let max = marshallDate(params.max, params.unixmax);
        let min = marshallDate(params.min, params.unixmin);

        if (!format) {
            format = params.format || params.fn;
        }
        if (format && momentFormatMap[format]) {
            format = momentFormatMap[format];
        }
        if (format === "weekday") {
            params.type = typeof params.type == "string" ? params.type.toUpperCase() : null;
            if (params.type !== "NUMBER") {
                if (params.type && weekdayMap[params.type]) {
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

                let argParam = params[method + "param" as "addparam" | "subtractparam"];
                if (argParam === undefined) {
                    argParam = params.amount;
                }
                let args: string | Record<string, number> = arg;
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


        if (format && hasKey(momentObj, format)) {
            let getMomentOutput = momentObj[format] as (f: typeof formatParams, f1: typeof formatParams1, f2: typeof formatParams2) => string
            momentOutput = getMomentOutput(formatParams, formatParams1, formatParams2)
        } else {
            momentOutput = momentObj.format(format)
        }


        return momentOutput;
    });















    handlebars.registerHelper("duration", function(...args) {

    const options = args.pop() as {hash: {
            params?: Record<string, any>,
            duration: string,
            input?: moment.DurationInputArg2,
            add?: string,
            addparam?: moment.DurationInputArg2,
            addunit?: moment.DurationInputArg2,
            subtract?: string,
            subtractparam?: moment.DurationInputArg2,
            subtractunit?: moment.DurationInputArg2,
            method?: string,
            as?: string,
            get?: string,
            suffix?: string,
        }
    }
    
    let duration = args.shift() as string | number | undefined
    let method = args.shift() as string | undefined
    let methodArg = args.shift() as string | undefined

    if (options.hash && options.hash.params) {
        options.hash = { ...(options.hash?.params || {}), ...(options.hash || {}) }


        delete options.hash.params;
    }
    
    const params = options.hash || {};
    
    if (!duration) {
        duration = params.duration;
    }
    if (typeof duration === "string" && duration.match(/^\d+$/)) {
        duration = +duration;
    }

    const durationObj = moment.duration(duration, params.input);

    function manipulateDuration (methodName: "add" | "subtract") {
        let arg: string | number | undefined = params[methodName];
        if (arg) {
            if (!isNaN(+arg)) {
                arg = +arg;
            }
            let argParam = params[method + "unit"  as "addunit" | "subtractunit"];
            if (argParam === undefined) {
                argParam = params[method + "param"  as "addparam" | "subtractparam"];
            }
            durationObj[methodName](arg, argParam);
        }
    }
    manipulateDuration("add");
    manipulateDuration("subtract");

    if (!method) {
        method = params.method;
    }
    if (method && durationGetMap[method]) {
        methodArg = method;
        method = "get";
    }
    if (method && durationMethodMap[method]) {
        method = durationMethodMap[method];
    }
    if (params.as) {
        method = "as";
        methodArg = params.as;
    } else if (params.get) {
        method = "get";
        methodArg = params.get;
    }

    if (!method || !hasKey(durationObj, method) || typeof durationObj[method] !== "function") {
        method = "humanize";
    }

    if (method === "humanize") {
        if (methodArg === undefined) {
            methodArg = params.suffix;
        }
    }

    let durationOutput: string = "";

    if (hasKey(durationObj, method)) {
        const durationMethod = durationObj[method]  as (m: typeof methodArg) => string
        if (typeof durationMethod === "function") {
            durationOutput = durationMethod.call(durationObj, methodArg);
        }
    } 

    return durationOutput;
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

        // Пытаемся воспроизвести поведение dayjs с помощью moment чтобы не устанавливать лишних зависимостей

        const map: Record<string, () => string> = {
            // 1. Стандартные токены Day.js (возвращают ОСТАТОК)
            'ss': () => String(duration.seconds()).padStart(2, '0'),
            's':  () => String(duration.seconds()),
            'mm': () => String(duration.minutes()).padStart(2, '0'),
            'm':  () => String(duration.minutes()),
            'HH': () => String(duration.hours()).padStart(2, '0'),
            'H':  () => String(duration.hours()),
            'DD': () => String(duration.days()).padStart(2, '0'),
            'D':  () => String(duration.days()),

            // 2. Токены в квадратных скобках (возвращают ПОЛНОЕ значение, округленное вниз)
            '[ss]': () => String(Math.floor(duration.asSeconds())).padStart(2, '0'),
            '[s]':  () => String(Math.floor(duration.asSeconds())),
            '[mm]': () => String(Math.floor(duration.asMinutes())).padStart(2, '0'),
            '[m]':  () => String(Math.floor(duration.asMinutes())),
            '[HH]': () => String(Math.floor(duration.asHours())).padStart(2, '0'),
            '[H]':  () => String(Math.floor(duration.asHours())),
            '[DD]': () => String(Math.floor(duration.asDays())).padStart(2, '0'),
            '[D]':  () => String(Math.floor(duration.asDays())),
        };

        // Регулярное выражение ищет токены в скобках вроде [ss] или обычные ss, mm, HH и т.д.
        const regex = /\[[a-zA-Z]+\]|ss|s|mm|m|HH|H|DD|D/g;

        // Заменяем найденные токены на значения из карты, а все остальные символы (например, ":") оставляем как есть
        return format.replace(regex, (match) => {
            return map[match] ? map[match]() : match;
        });
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
    














