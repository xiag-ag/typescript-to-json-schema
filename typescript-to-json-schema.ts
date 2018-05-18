import * as commander from "commander";
import * as stringify from "json-stable-stringify";

import { DEFAULT_CONFIG, ProgramConfig } from "./factory/config";
import { createGenerator } from "./factory/generator";
import { BaseError } from "./src/Error/BaseError";
import { formatError } from "./src/Utils/formatError";

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
