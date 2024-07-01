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
exports.entity = void 0;
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
        const camelizedName = core_1.strings.camelize(options.name);
        context.logger.info(`names: ${classifiedName}, ${camelizedName}`);
        // Add core module changes
        const coreModulePath = options.module;
        const coreModuleText = (0, statements_adder_1.getSourceText)(host, coreModulePath);
        context.logger.info(`modulePath: ${coreModulePath}`);
        const entityEffectsPath = `/${options.path}/` +
            core_1.strings.dasherize(options.name) + '/' +
            core_1.strings.dasherize(options.name) + '.effects';
        context.logger.info(`entityEffectsPath: ${entityEffectsPath}`);
        const coreToEffectsPath = (0, find_module_1.buildRelativePath)(coreModulePath, entityEffectsPath);
        context.logger.info(`coreToEffectsPath: ${coreToEffectsPath}`);
        let insertChangesInCore = (0, statements_adder_1.simpleInsert)(coreModuleText, coreModulePath, [
            '// Entity Effects',
            '// Entity Effects'
        ], [
            `import { ${classifiedName}Effects } from '${coreToEffectsPath}';`,
            `      ${classifiedName}Effects,`
        ]);
        // Add app reducer changes
        const appReducerPath = '//src/app/core/store/app.reducer.ts';
        const appReducerText = (0, statements_adder_1.getSourceText)(host, appReducerPath);
        context.logger.info(`appReducerPath: ${appReducerPath}`);
        const entityReducerPath = `/${options.path}/` +
            core_1.strings.dasherize(options.name) + '/' +
            core_1.strings.dasherize(options.name) + '.reducer';
        context.logger.info(`entityReducerPath: ${entityReducerPath}`);
        const appToEntityReducerPath = (0, find_module_1.buildRelativePath)(appReducerPath, entityReducerPath);
        let insertChangesInAppReducer = (0, statements_adder_1.simpleInsert)(appReducerText, appReducerPath, [
            '// Entity Reducers',
            '// Entity State',
            '// Entity Reducers'
        ], [
            `import * as from${classifiedName} from '${appToEntityReducerPath}';`,
            `  ${camelizedName}: from${classifiedName}.State;`,
            `  ${camelizedName}: from${classifiedName}.reducer,`
        ]);
        // Add app selector changes
        const appSelectorPath = '//src/app/core/store/app.selectors.ts';
        const appSelectorText = (0, statements_adder_1.getSourceText)(host, appSelectorPath);
        const entityServicePath = `/${options.path}/` +
            core_1.strings.dasherize(options.name) + '/' +
            core_1.strings.dasherize(options.name) + '.service';
        const appToEntityServicePath = (0, find_module_1.buildRelativePath)(appSelectorPath, entityServicePath);
        let insertChangesInAppSelector = (0, statements_adder_1.simpleInsert)(appSelectorText, appSelectorPath, [
            '// Entity Selectors',
            '// Entity Selectors',
            '// Entity Selectors'
        ], [
            `import { ${classifiedName}Service } from '${appToEntityServicePath}';`,
            `    private ${camelizedName}: ${classifiedName}Service,`,
            `  public get${classifiedName} = this.${camelizedName}.get${classifiedName};\n  public get${classifiedName}s = this.${camelizedName}.get${classifiedName}s;\n  public select${classifiedName} = this.${camelizedName}.select${classifiedName};\n  public select${classifiedName}s = this.${camelizedName}.select${classifiedName}s;`
        ]);
        context.logger.info(`about to start committing`);
        // For each of the files and corresponding set of changes, commit to the tree
        [
            [coreModulePath, insertChangesInCore],
            [appReducerPath, insertChangesInAppReducer],
            [appSelectorPath, insertChangesInAppSelector]
        ].map(([filePath, insertChanges]) => {
            const declarationRecorder = host.beginUpdate(filePath);
            for (const change of insertChanges) {
                if (change instanceof change_1.InsertChange) {
                    declarationRecorder.insertLeft(change.pos, change.toAdd);
                }
            }
            host.commitUpdate(declarationRecorder);
        });
        return host;
    };
}
function entity(options) {
    return (tree, context) => __awaiter(this, void 0, void 0, function* () {
        // Make sure the command is executed in the directory where the component should be generated
        if (!options.inDirectory) {
            context.logger.info("Please navigate to the directory where you want to generate the entity.");
            return (0, schematics_1.noop)();
        }
        const workspace = yield (0, workspace_1.getWorkspace)(tree);
        const project = workspace.projects.get(options.project);
        if (!project) {
            throw new schematics_1.SchematicsException(`Project "${options.project}" does not exist.`);
        }
        if (options.path === undefined) {
            options.path = (0, workspace_1.buildDefaultPath)(project);
        }
        options.module = (0, find_module_1.findModuleFromOptions)(tree, options);
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
exports.entity = entity;
//# sourceMappingURL=index.js.map