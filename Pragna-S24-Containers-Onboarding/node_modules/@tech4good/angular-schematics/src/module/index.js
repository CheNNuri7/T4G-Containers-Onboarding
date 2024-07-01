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
exports.module = void 0;
const schematics_1 = require("@angular-devkit/schematics");
const change_1 = require("@schematics/angular/utility/change");
const find_module_1 = require("@schematics/angular/utility/find-module");
const parse_name_1 = require("@schematics/angular/utility/parse-name");
const workspace_1 = require("@schematics/angular/utility/workspace");
const core_1 = require("@angular-devkit/core");
const statements_adder_1 = require("../shared/statements-adder");
function addInserts(options) {
    return (host, context) => {
        const classifiedName = core_1.strings.classify(options.name);
        const dasherizedName = core_1.strings.dasherize(options.name);
        const modulePath = '//src/app/' +
            core_1.strings.dasherize(options.name) + '/' +
            core_1.strings.dasherize(options.name) + '.module';
        context.logger.info(`modulePath: ${modulePath}`);
        if (!options.lazyLoading) {
            // Add app module changes if not lazy loaded
            const appModulePath = '//src/app/app.module.ts';
            const appModuleText = (0, statements_adder_1.getSourceText)(host, appModulePath);
            context.logger.info(`appModulePath: ${appModulePath}`);
            const appModuleToModulePath = (0, find_module_1.buildRelativePath)(appModulePath, modulePath);
            let insertChanges = (0, statements_adder_1.simpleInsert)(appModuleText, appModulePath, [
                '// Feature Modules',
                '// Feature Modules'
            ], [
                `import { ${classifiedName}Module } from '${appModuleToModulePath}';`,
                `    ${classifiedName}Module,`
            ]);
            const declarationRecorder = host.beginUpdate(appModulePath);
            for (const change of insertChanges) {
                if (change instanceof change_1.InsertChange) {
                    declarationRecorder.insertLeft(change.pos, change.toAdd);
                }
            }
            host.commitUpdate(declarationRecorder);
        }
        else {
            // Add app-routing module changes if lazy loaded
            const appRoutingModulePath = '//src/app/app-routing.module.ts';
            const appRoutingModuleText = (0, statements_adder_1.getSourceText)(host, appRoutingModulePath);
            const appRoutingModuleToModulePath = (0, find_module_1.buildRelativePath)(appRoutingModulePath, modulePath);
            context.logger.info(`appRoutingModuleToModulePath: ${appRoutingModuleToModulePath}`);
            let insertChanges = (0, statements_adder_1.simpleInsert)(appRoutingModuleText, appRoutingModulePath, [
                'const appRoutes: Routes = ['
            ], [
                `  { path: '${dasherizedName}', loadChildren: () => import('${appRoutingModuleToModulePath}').then((mod) => mod.${classifiedName}Module) },`
            ]);
            context.logger.info(`insertChanges: ${insertChanges}`);
            const declarationRecorder = host.beginUpdate(appRoutingModulePath);
            for (const change of insertChanges) {
                if (change instanceof change_1.InsertChange) {
                    declarationRecorder.insertLeft(change.pos, change.toAdd);
                }
            }
            host.commitUpdate(declarationRecorder);
        }
        return host;
    };
}
function module(options) {
    return (tree, context) => __awaiter(this, void 0, void 0, function* () {
        context.logger.info("Starting module generation");
        const workspace = yield (0, workspace_1.getWorkspace)(tree);
        const project = workspace.projects.get(options.project);
        if (!project) {
            throw new schematics_1.SchematicsException(`Project "${options.project}" does not exist.`);
        }
        if (options.path === undefined) {
            options.path = (0, workspace_1.buildDefaultPath)(project);
        }
        const parsedPath = (0, parse_name_1.parseName)(options.path, options.name);
        options.name = parsedPath.name;
        options.path = parsedPath.path;
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
exports.module = module;
//# sourceMappingURL=index.js.map