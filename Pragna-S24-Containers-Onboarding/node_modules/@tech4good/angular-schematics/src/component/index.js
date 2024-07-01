"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.component = void 0;
const schematics_1 = require("@angular-devkit/schematics");
const change_1 = require("@schematics/angular/utility/change");
const find_module_1 = require("@schematics/angular/utility/find-module");
const parse_name_1 = require("@schematics/angular/utility/parse-name");
const validation_1 = require("@schematics/angular/utility/validation");
const workspace_1 = require("@schematics/angular/utility/workspace");
const core_1 = require("@angular-devkit/core");
const statements_adder_1 = require("../shared/statements-adder");
function addInserts(options) {
    return (host, context) => {
        if (!options.module) {
            return host;
        }
        const modulePath = options.module;
        const sourceText = (0, statements_adder_1.getSourceText)(host, modulePath);
        context.logger.info(`modulePath: ${modulePath}`);
        // Get parameters for adding declaration to module (including import)
        context.logger.info(`options.path: ${options.path}`);
        const componentPath = `/${options.path}/` +
            core_1.strings.dasherize(options.name) + '/' +
            core_1.strings.dasherize(options.name) + '.component';
        context.logger.info(`componentPath: ${componentPath}`);
        const relativePath = (0, find_module_1.buildRelativePath)(modulePath, componentPath);
        context.logger.info(`relativePath: ${relativePath}`);
        const classifiedName = core_1.strings.classify(options.name) + 'Component';
        context.logger.info(`classifiedName: ${classifiedName}`);
        const isSharedModule = options.module.startsWith('/src/app/shared');
        let insertChanges = (0, statements_adder_1.simpleInsert)(sourceText, modulePath, [
            '// Components',
            '// Components',
            // If the module is shared, then add an export too
            ...isSharedModule ? ['// Components'] : [],
        ], [
            `import { ${classifiedName} } from '${relativePath}';`,
            `    ${classifiedName},`,
            ...isSharedModule ? [`    ${classifiedName},`] : [],
        ]);
        const declarationRecorder = host.beginUpdate(modulePath);
        for (const change of insertChanges) {
            if (change instanceof change_1.InsertChange) {
                declarationRecorder.insertLeft(change.pos, change.toAdd);
            }
        }
        host.commitUpdate(declarationRecorder);
        return host;
    };
}
function component(options) {
    return (tree, context) => __awaiter(this, void 0, void 0, function* () {
        // Make sure the command is executed in the directory where the component should be generated
        if (!options.inDirectory) {
            context.logger.info("Please navigate to the directory where you want to generate the component.");
            return (0, schematics_1.noop)();
        }
        const workspace = yield (0, workspace_1.getWorkspace)(tree);
        const project = workspace.projects.get(options.project);
        if (!project) {
            throw new schematics_1.SchematicsException(`Project "${options.project}" does not exist.`);
        }
        context.logger.info(`options.path: ${options.path}`);
        if (options.path === undefined) {
            options.path = (0, workspace_1.buildDefaultPath)(project);
        }
        context.logger.info(`options.path: ${options.path}`);
        options.module = (0, find_module_1.findModuleFromOptions)(tree, options);
        context.logger.info(`options.module: ${options.module}`);
        const parsedPath = (0, parse_name_1.parseName)(options.path, options.name);
        options.name = parsedPath.name;
        options.path = parsedPath.path;
        (0, validation_1.validateHtmlSelector)(options.selector);
        const templateSource = (0, schematics_1.apply)((0, schematics_1.url)('./files'), [
            (0, schematics_1.applyTemplates)(Object.assign(Object.assign({}, core_1.strings), options)),
            (0, schematics_1.move)(parsedPath.path),
        ]);
        return (0, schematics_1.chain)([
            addInserts(options),
            (0, schematics_1.mergeWith)(templateSource)
        ]);
    });
}
exports.component = component;
//# sourceMappingURL=index.js.map