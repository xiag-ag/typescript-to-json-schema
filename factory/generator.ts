import { Config } from "../src/Config";
import { SchemaGenerator } from "../src/SchemaGenerator";

import { createProgram } from "./program";
import { createParser } from "./parser";
import { createFormatter } from "./formatter";

export function createGenerator(config: Config): SchemaGenerator {
    const program = createProgram(config);
    const parser = createParser(program, config);
    const formatter = createFormatter(config);

    return new SchemaGenerator(program, parser, formatter);
}
