"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AddStatements = exports.simpleInsert = exports.getSourceText = void 0;
const schematics_1 = require("@angular-devkit/schematics");
const change_1 = require("@schematics/angular/utility/change");
function getSourceText(host, filePath) {
    const text = host.read(filePath);
    if (text === null) {
        throw new schematics_1.SchematicsException(`File ${filePath} does not exist.`);
    }
    return text.toString('utf-8');
}
exports.getSourceText = getSourceText;
function simpleInsert(sourceText, fileToEdit, labels, statements) {
    let labelMap = {};
    return labels.map((label, i) => {
        if (labelMap[label] === undefined)
            labelMap[label] = 0;
        labelMap[label]++;
        let count = labelMap[label];
        let index = getPosition(sourceText, label, count) + label.length;
        return new change_1.InsertChange(fileToEdit, index, `\n${statements[i]}`);
    });
}
exports.simpleInsert = simpleInsert;
function AddStatements(filePath, labels, statements, tree) {
    // getSourceText
    let text = tree.read(filePath); // reads the file from the tree
    if (!text) {
        throw new schematics_1.SchematicsException(`${filePath} does not exist.`); // throw an error if the file doesn't exist
    }
    let sourceText = text.toString('utf-8');
    let index = 0;
    const exportRecorder = tree.beginUpdate(filePath);
    let labelMap = {};
    for (let i = 0; i < labels.length; i++) {
        // sourceText = sourceText.slice(index);
        if (labelMap[labels[i]] === undefined)
            labelMap[labels[i]] = 0;
        labelMap[labels[i]]++;
        let count = labelMap[labels[i]];
        index = getPosition(sourceText, labels[i], count) + labels[i].length;
        // declares import
        const insertChange = new change_1.InsertChange(filePath, index, `\n${statements[i]}`);
        exportRecorder.insertLeft(insertChange.pos, insertChange.toAdd);
    }
    tree.commitUpdate(exportRecorder);
}
exports.AddStatements = AddStatements;
function getPosition(string, subString, index) {
    return string.split(subString, index).join(subString).length;
}
//# sourceMappingURL=statements-adder.js.map