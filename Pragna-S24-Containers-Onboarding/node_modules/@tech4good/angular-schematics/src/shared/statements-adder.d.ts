import { Tree } from '@angular-devkit/schematics';
import { Change } from '@schematics/angular/utility/change';
export interface IHash {
    [details: string]: number;
}
export declare function getSourceText(host: Tree, filePath: string): string;
export declare function simpleInsert(sourceText: string, fileToEdit: string, labels: string[], statements: string[]): Change[];
export declare function AddStatements(filePath: string, labels: string[], statements: string[], tree: Tree): void;
