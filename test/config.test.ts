import * as Ajv from "ajv";
import { assert } from "chai";
import { readFileSync } from "fs";
import { resolve } from "path";
import { DEFAULT_CONFIG, OptionalConfig } from "../factory/config";
import { createGenerator } from "../factory/generator";

const validator = new Ajv();
const metaSchema = require("ajv/lib/refs/json-schema-draft-06.json");
validator.addMetaSchema(metaSchema);

type TestConfig = Partial<OptionalConfig> & {type: string};
function assertSchema(name: string, testConfig: TestConfig): void {
    it(name, () => {
        const basePath = "test/config";
        const generator = createGenerator({
            ... DEFAULT_CONFIG,
            ...testConfig,
            path: resolve(`${basePath}/${name}/*.ts`),
        });

        const expected = JSON.parse(readFileSync(resolve(`${basePath}/${name}/schema.json`), "utf8"));
        const actual = JSON.parse(JSON.stringify(generator.createSchema(testConfig.type)));

        assert.isObject(actual);
        assert.deepEqual(actual, expected);

        validator.validateSchema(actual);
        assert.isNull(validator.errors);
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
    assertSchema("jsdoc-empty-or-invalid", {type: "MyObject", expose: "export", topRef: true, jsDoc: "basic"});

    assertSchema("jsdoc-inheritance", {type: "MyObject", expose: "export", topRef: true, jsDoc: "extended"});
});
