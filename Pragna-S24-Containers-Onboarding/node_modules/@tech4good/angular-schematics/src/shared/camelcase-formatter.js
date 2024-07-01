"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CamelCaseFormatter = void 0;
function CamelCaseFormatter(name, lower) {
    // e.g. list-style-image to ListStyleImage
    let camelName = name.charAt(0).toUpperCase() + name.substr(1);
    if (name.indexOf('-') != -1) {
        const names = name.split('-');
        for (var i = 0; i < names.length; i++) {
            names[i] = names[i].charAt(0).toUpperCase() + names[i].substr(1);
        }
        camelName = names.join("");
    }
    if (lower)
        camelName = camelName.charAt(0).toLowerCase() + camelName.substr(1);
    return camelName;
}
exports.CamelCaseFormatter = CamelCaseFormatter;
//# sourceMappingURL=camelcase-formatter.js.map