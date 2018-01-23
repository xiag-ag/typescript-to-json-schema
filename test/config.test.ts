import * as Ajv from "ajv";
import { assert } from "chai";
import { readFileSync } from "fs";
import { resolve } from "path";

import { createFormatter } from "../factory/formatter";
import { createParser } from "../factory/parser";
import { createProgram } from "../factory/program";
import { Config, DEFAULT_CONFIG, PartialConfig } from "../src/Config";
import { SchemaGenerator } from "../src/SchemaGenerator";

const validator = new Ajv();
const metaSchema = require("ajv/lib/refs/json-schema-draft-04.json");
validator.addMetaSchema(metaSchema, "http://json-schema.org/draft-04/schema#");

type TestConfig = Partial<PartialConfig> & {type: string};
function assertSchema(name: string, testConfig: TestConfig): void {
    it(name, () => {
        const basePath = "test/config";
        const config: Config = {
            ... DEFAULT_CONFIG,
            ...testConfig,
            path: resolve(`${basePath}/${name}/*.ts`),
        };

        const program = createProgram(config);
        const generator = new SchemaGenerator(
            program,
            createParser(program, config),
            createFormatter(config),
        );

        const expected = JSON.parse(readFileSync(resolve(`${basePath}/${name}/schema.json`), "utf8"));
        const actual = JSON.parse(JSON.stringify(generator.createSchema(config.type)));

        assert.isObject(actual);
        assert.deepEqual(actual, expected);

        validator.validateSchema(actual);
        assert.equal(validator.errors, null);
    });
}

describe("config", () => {
    assertSchema("expose-all-topref-true", {type: "MyObject", expose: "all", topRef: true, jsDoc: "none"});
    assertSchema("expose-all-topref-false", {type: "MyObject", expose: "all", topRef: false, jsDoc: "none"});

    assertSchema("expose-none-topref-true", {type: "MyObject", expose: "none", topRef: true, jsDoc: "none"});
    assertSchema("expose-none-topref-false", {type: "MyObject", expose: "none", topRef: false, jsDoc: "none"});

    assertSchema("expose-export-topref-true", {type: "MyObject", expose:  "export", topRef: true, jsDoc: "none"});
    assertSchema("expose-export-topref-false", {type: "MyObject", expose: "export", topRef: false, jsDoc: "none"});

    assertSchema("jsdoc-complex-none", {type: "MyObject", expose: "export", topRef: true, jsDoc: "none"});
    assertSchema("jsdoc-complex-basic", {type: "MyObject", expose: "export", topRef: true, jsDoc: "basic"});
    assertSchema("jsdoc-complex-extended", {type: "MyObject", expose: "export", topRef: true, jsDoc: "extended"});
    assertSchema("jsdoc-description-only", {type: "MyObject", expose: "export", topRef: true, jsDoc: "extended"});

    assertSchema("jsdoc-inheritance", {type: "MyObject", expose: "export", topRef: true, jsDoc: "extended"});
});
