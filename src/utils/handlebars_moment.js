// This is a copy of handlebars.moment.js from https://github.com/solidgoldpig/handlebars.moment
// whith some changes.
// We need to use the edited version in order to use the Obsidian's version of moment.
// The original code requires moment directly and it is not localised properly.

import { moment } from "obsidian";

(function (moduleFactory) {
    if (typeof exports === "object") {
        
        // We replace require("moment") with the moment imported from "obsidian"
        // It is the only change we need to do
        //module.exports = moduleFactory(require("lodash"), require("moment"));
        module.exports = moduleFactory(require("lodash"), moment);

    } else if (typeof define === "function" && define.amd) {
        define(["lodash", "moment"], moduleFactory);
    } else if (typeof window !== 'undefined' && window != null && window.moment) {
        window.HandlebarsMoment = moduleFactory;
        // moduleFactory(_, moment);
    }
}(function (_, moment) {

/**
 * @module handlebars%moment
 * @description  Helpers providing [Moment.js](http://momentjs.com) functionality
 *
 *     var Handlebars = require("handlebars");
 *     var MomentHelper = require("handlebars.moment");
 *     MomentHelper.registerHelpers(Handlebars);
 * 
 * @returns {object} MomentHelper instance
 */

    var MomentHelpers = function (Handlebars) {
        var momentFormatMap = {
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
        };
        var weekdayMap = {
            L: "dddd",
            S: "ddd",
            XS: "dd"
        };

        /**
         * @template moment
         * @block helper
         * @param {string|date} [0] Date string|object
         * @param {string} [1] Date format / Moment method
         * @param {*} [2] Moment method params
         * @param {*} [3] Moment method params 1
         * @param {*} [4] Moment method params 2
         * @param {string|date} [date] Alternative date
         * @param {string} [format] Alternative format
         * @param {string} [input] Format to use to parse date
         * @param {string} [lang] Specific locale to use
         * @param {number|string} [type] Type of weekday (L|S|XS|number)
         * @param {boolean} [suffix]
         * @param {boolean} [utc]
         * @param {boolean} [local]
         * @param {string} [from]
         * @param {string} [unixfrom]
         * @param {string} [max]
         * @param {string} [min]
         * @param {string} [unixmax]
         * @param {string} [unixmin]
         * @param {string} [startOf]
         * @param {string} [endOf]
         * @param {number|string} [add]
         * @param {number|string} [subtract]
         * @param {number} [addparam] Value to use if add is number
         * @param {number} [subtractparam] Value to use if subtract is number
         * @param {number} [amount] Value to use if add|subtract are strings
         * @param {string} [diff]
         * @param {string} [unixdiff]
         * @param {string} [unitdiff] Value for Moment method params 1 if diff
         * @param {boolean} [nosuffix] Value for Moment method params 2 if diff
         * 
         * @description  Outputs a date
         *
         * Current date
         * 
         *     {{moment}}
         *
         * Specific date
         * 
         *     {{moment d}}
         *     {{moment date=d}}
         *
         * Date format
         *
         *     {{moment d "YY, MMM dd"}}
         *     {{moment date=d format="DD/MM/YYYY"}}
         *     {{moment d unix=true}}
         *
         * Date input parsing
         * 
         *     {{moment dinput input="DD-YYYY-MM"}}
         *
         * Date timezone
         * 
         *     {{moment dstr utc=true}}
         *     {{moment dstr local=true}}
         *
         * Date units
         * 
         *     {{moment d "millisecond"}}
         *     {{moment d "second"}}
         *     {{moment d "minute"}}
         *     {{moment d "hour"}}
         *     {{moment d "date"}}
         *     {{moment d "day"}}
         *     {{moment d "weekday"}}
         *     {{moment d "weekday" type="s"}}
         *     {{moment d "weekday" type="xs"}}
         *     {{moment d "weekday" type="number"}}
         *     {{moment d "isoweekday"}}
         *     {{moment d "dayofyear"}}
         *     {{moment d "week"}}
         *     {{moment d "isoweek"}}
         *     {{moment d "month"}}
         *     {{moment d "year"}}
         *     {{moment d "weekyear"}}
         *     {{moment d "isoweekyear"}}
         *
         * Date manipulation
         * 
         *     {{moment d add="days" amount="7"}}
         *     {{moment d add="365" addparam="d"}}
         *     {{moment d subtract="days" amount="7"}}
         *     {{moment d subtract="365" subtractparam="d"}}
         *
         * Start and end of years
         * 
         *     {{moment d startof="year"}}
         *     {{moment d endof="year"}}
         *
         * Date max/min
         * 
         *     {{moment d max=dmax}}
         *     {{moment d min=dmin}}
         *
         * Date from now and specific dates
         *  
         *     {{moment d "fromNow"}}
         *     {{moment d "from" dfrom}}
         *
         * Difference between dates
         * 
         *     {{moment d diff=ddiff}}
         *
         * Date as calendar time
         * 
         *     {{moment d "calendar"}}
         *
         * Date as strings
         *
         *     {{moment d "str"}}
         *     {{moment d "val"}}
         *     {{moment d "unix"}}
         *
         * Moment utils
         * 
         *     {{moment d "daysinmonth"}}
         *     {{moment d "todate"}}
         *     {{moment d "array"}}
         *     {{moment d "isostring"}}
         *
         * Helper parameters map to those of Moment.js unless noted
         */
        Handlebars.registerHelper("moment", function() {
            var args = Array.prototype.slice.call(arguments),
                options = args.pop(),
                date = args.shift(),
                format = args.shift(),
                formatParams = args.shift(),
                formatParams1 = args.shift(),
                formatParams2 = args.shift();

            if (options.hash && options.hash.params) {
                options.hash = _.extend({}, options.hash.params, options.hash);
                delete options.hash.params;
            }
            var params = options.hash;
            if (!date) {
                date = params.date;
            }
            function marshallDate (date, unix) {
                if (typeof date === "string" && date.match(/^\d+(\.\d+){0,1}$/)) {
                    date = +date;
                }
                if (unix && typeof date === "number") {
                    date = date * 1000;
                }
                return date;
            }
            date = marshallDate(date, params.unix);
            var max = marshallDate(params.max, params.unixmax);
            var min = marshallDate(params.min, params.unixmin);

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

            var ofMethod = "start";
            var ofType = params.startOf || params.startof;
            if (!ofType) {
                ofType = params.endOf || params.endof;
                if (ofType) {
                    ofMethod = "end";
                }
            }

            /*if (!formatParams) {
                formatParams = params.formatparams || params.fnparams;
                if (formatParams === undefined) {
                    if (params.suffix !== undefined) {
                        formatParams = params.suffix;
                    }
                }
            }*/

            var momentObj;
            

            if (moment.isMoment(date)) {
                momentObj = date.clone();
            } else {
                var momentFn = params.utc ? moment.utc : moment;
                momentObj = momentFn(date, params.input);
            }

            

            

            if (params.lang) {
                momentObj.lang(params.lang);
            }

            if (max) {
                momentObj = moment.max(moment(max), momentObj);
            }
            if (min) {
                momentObj = moment.min(moment(min), momentObj);
            }

            if (ofType) {
                momentObj = momentObj[ofMethod + "Of"](ofType);
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

            function manipulateMoment (method) {
                var arg = params[method];
                if (arg) {
                    var argParam = params[method + "param"];
                    if (argParam === undefined) {
                        argParam = params.amount;
                    }
                    var args = arg;
                    if (argParam) {
                        var addNum = +arg;
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

            var momentOutput = momentObj[format] ? momentObj[format](formatParams, formatParams1, formatParams2) : momentObj.format(format);

            return momentOutput;
        });

        var durationMethodMap = {
            asmilliseconds: "asMilliseconds",
            asseconds: "asSeconds",
            asminutes: "asMinutes",
            ashours: "asHours",
            asdays: "asDays",
            asweeks: "asWeeks",
            asmonths: "asMonths",
            asyears: "asYears"
        };
        var durationGetArray = [
            "ms",
            "s",
            "m",
            "h",
            "d",
            "w",
            "M",
            "y"
        ];
        var durationGetMap = {};
        for (var i in durationGetArray) {
            durationGetMap[durationGetArray[i]] = true;
        }

        /**
         * @template duration
         * @block helper
         * @param {string} [duration] Length of duration
         * @param {string} [input] Unit of duration
         * @param {number} [add]
         * @param {number} [subtract]
         * @param {number} [addunit|addparam] 
         * @param {number} [subtractunit|subtractparam]
         * @param {string} [as] Sets duration method to as
         * @param {string} [get] Sets duration method to get
         * @param {string} [humanize] Sets duration method to humanize
         * @param {boolean} [suffix=false]
         * 
         * @description  Outputs a duration
         * 
         * Duration - implictly in milliseconds
         * 
         *     {{duration d}}
         * 
         * Duration with explicit input date unit type
         *     
         *     {{duration d input="s"}}
         * 
         * Amount of date units in duration
         * 
         *     {{duration d "seconds"}}
         *     {{duration d "minutes"}}
         *     {{duration d "years"}}
         *     {{duration d get="seconds"}}
         *     {{duration d "s"}}
         * 
         * Duration as date units
         * 
         *     {{duration d "asseconds"}}
         *     {{duration d "asminutes"}}
         *     {{duration d "asyears"}}
         *     {{duration d as="seconds"}}
         * 
         * Humanize duration output
         * 
         *     {{duration d "humanize"}}
         *     {{duration d "humanize" true}}
         *     {{duration d suffix=true}}
         * 
         * Manipulate durations
         * 
         *     {{duration d add=damount as="milliseconds"}}
         *     {{duration d subtract=damount as="seconds"}}
         *     {{duration d subtract=damount as="days"}}
         */
        Handlebars.registerHelper("duration", function() {
            var args = Array.prototype.slice.call(arguments),
                options = args.pop(),
                duration = args.shift(),
                method = args.shift(),
                methodArg = args.shift();

            if (options.hash && options.hash.params) {
                options.hash = _.extend({}, options.hash.params, options.hash);
                delete options.hash.params;
            }
            var params = options.hash;
            if (!duration) {
                duration = params.duration;
            }
            if (typeof duration === "string" && duration.match(/^\d+$/)) {
                duration = +duration;
            }

            var durationObj = moment.duration(duration, params.input);

            function manipulateDuration (method) {
                var arg = params[method];
                if (arg) {
                    if (!isNaN(+arg)) {
                        arg = +arg;
                    }
                    var argParam = params[method + "unit"];
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

            if (!durationObj[method]) {
                method = "humanize";
            }

            if (method === "humanize") {
                if (methodArg === undefined) {
                    methodArg = params.suffix;
                }
            }

            return durationObj[method](methodArg);
        });
    };

    var external = {
        /**
         * @method registerHelpers
         * @static
         * @param {object} hbars Handlebars instance
         * @description Register MomentHelper helpers with Handlebars
         *
         * - {@link template:moment}
         * - {@link template:duration}
         */
        registerHelpers: function (hbars) {
            MomentHelpers(hbars);
        }
    };

    return external;

}));