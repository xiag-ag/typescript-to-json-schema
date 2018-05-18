import * as path from "path";
import * as ts from "typescript";
import * as commander from "commander";
import * as stringify from "json-stable-stringify";

import { DEFAULT_CONFIG, ProgramConfig } from "./factory/config";
import { createGenerator } from "./factory/generator";
import { BaseError } from "./src/Error/BaseError";
import { UnknownNodeError } from "./src/Error/UnknownNodeError";
import { DiagnosticError } from "./src/Error/DiagnosticError";

const args: any = commander
    .option("-p, --path <path>", "Typescript path")
    .option("-t, --type <name>", "Type name")
    .option(
        "-e, --expose <expose>",
        "Type exposing",
        /^(all|none|export)$/,
        "export",
    )
    .option(
        "-r, --topRef",
        "Create a top-level $ref definition",
        (v: any) => v === "true" || v === "yes" || v === "1",
        true,
    )
    .option(
        "-j, --jsDoc <extended>",
        "Read JsDoc annotations",
        /^(extended|none|basic)$/,
        "extended",
    )
    .option(
        "-s, --sortProps",
        "Sort properties for stable output",
        (v: any) => v === "true" || v === "yes" || v === "1",
        true,
    )
    .parse(process.argv);

const programConfig: ProgramConfig = {
    ...DEFAULT_CONFIG,
    ...args,
};

try {
    const schema = createGenerator(programConfig).createSchema(args.type);
    process.stdout.write(programConfig.sortProps ?
        stringify(schema, {space: 2}) :
        JSON.stringify(schema, null, 2));
} catch (error) {
    if (error instanceof BaseError) {
        process.stderr.write(formatError(error));
        process.exit(1);
    } else {
        throw error;
    }
}

function getNodeLocation(node: ts.Node): [string, number, number] {
    const sourceFile = node.getSourceFile();
    const lineAndChar = ts.getLineAndCharacterOfPosition(sourceFile, node.getStart(sourceFile));
    return [sourceFile.fileName, lineAndChar.line + 1, lineAndChar.character];
}
function formatError(error: BaseError): string {
    if (error instanceof DiagnosticError) {
        const rootDir = process.cwd().split(path.sep)[0] || "/";
        return ts.formatDiagnostics(error.getDiagnostics(), {
            getCanonicalFileName: (fileName: string) => fileName,
            getCurrentDirectory: () => rootDir,
            getNewLine: () => "\n",
        });
    } else if (error instanceof UnknownNodeError) {
        const unknownNode = error.getReference() || error.getNode();
        const nodeFullText = unknownNode.getFullText().trim().split("\n")[0].trim();
        const [sourceFile, lineNumber, charPos] = getNodeLocation(unknownNode);

        return `${error.name}: Unknown node "${nodeFullText}" (ts.SyntaxKind = ${error.getNode().kind}) ` +
            `at ${sourceFile}(${lineNumber},${charPos})\n`;
    }

    return `${error.name}: ${error.message}\n`;
}
