import * as Ajv from "ajv";
import { assert } from "chai";
import { readFileSync } from "fs";
import { resolve } from "path";
import { createFormatter } from "../factory/formatter";
import { createParser } from "../factory/parser";
import { createProgram } from "../factory/program";
import { Config } from "../src/Config";
import { SchemaGenerator } from "../src/SchemaGenerator";

const validator = new Ajv();
const metaSchema = require("ajv/lib/refs/json-schema-draft-04.json");
validator.addMetaSchema(metaSchema, "http://json-schema.org/draft-04/schema#");

function assertSchema(name: string, type: string): void {
    it(name, () => {
        const basePath = "test/valid-data";
        const config: Config = {
            path: resolve(`${basePath}/${name}/*.ts`),
            type: type,

            expose: "export",
            topRef: true,
            jsDoc: "none",
            sortProps: true,
        };

        const program = createProgram(config);
        const generator = new SchemaGenerator(
            program,
            createParser(program, config),
            createFormatter(config),
        );

        const expected = JSON.parse(readFileSync(resolve(`${basePath}/${name}/schema.json`), "utf8"));
        const actual = JSON.parse(JSON.stringify(generator.createSchema(type)));

        assert.isObject(actual);
        assert.deepEqual(actual, expected);

        validator.validateSchema(actual);
        assert.equal(validator.errors, null);
    });
}

describe("valid-data", () => {
    // TODO: generics recursive

    assertSchema("simple-object", "SimpleObject");

    assertSchema("interface-single", "MyObject");
    assertSchema("interface-multi", "MyObject");
    assertSchema("interface-recursion", "MyObject");
    assertSchema("interface-extra-props", "MyObject");

    assertSchema("structure-private", "MyObject");
    assertSchema("structure-anonymous", "MyObject");
    assertSchema("structure-recursion", "MyObject");
    assertSchema("structure-extra-props", "MyObject");

    assertSchema("enums-string", "Enum");
    assertSchema("enums-number", "Enum");
    assertSchema("enums-initialized", "Enum");
    assertSchema("enums-compute", "Enum");
    assertSchema("enums-mixed", "Enum");
    assertSchema("enums-complex", "Enum");
    assertSchema("enums-member", "MyObject");

    assertSchema("string-literals", "MyObject");
    assertSchema("string-literals-inline", "MyObject");
    assertSchema("string-literals-null", "MyObject");

    assertSchema("namespace-deep-1", "RootNamespace.Def");
    assertSchema("namespace-deep-2", "RootNamespace.SubNamespace.HelperA");
    assertSchema("namespace-deep-3", "RootNamespace.SubNamespace.HelperB");

    assertSchema("import-simple", "MyObject");
    assertSchema("import-exposed", "MyObject");
    assertSchema("import-anonymous", "MyObject");

    assertSchema("type-aliases-primitive", "MyString");
    assertSchema("type-aliases-object", "MyAlias");
    assertSchema("type-aliases-mixed", "MyObject");
    assertSchema("type-aliases-union", "MyUnion");
    assertSchema("type-aliases-tuple-1", "MyTuple");
    assertSchema("type-aliases-tuple-2", "MyTuple");
    assertSchema("type-aliases-tuple-3", "MyTuple");
    assertSchema("type-aliases-anonymous", "MyObject");
    assertSchema("type-aliases-local-namespace", "MyObject");
    assertSchema("type-aliases-recursive-anonymous", "MyAlias");
    assertSchema("type-aliases-recursive-export", "MyObject");

    assertSchema("type-maps", "MyObject");
    assertSchema("type-primitives", "MyObject");
    assertSchema("type-union", "TypeUnion");
    assertSchema("type-union-tagged", "Shape");
    assertSchema("type-union-primitive", "MyObject");
    assertSchema("type-intersection", "MyObject");
    assertSchema("type-intersection-additional-props", "MyObject");

    assertSchema("type-typeof", "MyType");
    assertSchema("type-typeof-value", "MyType");
    assertSchema("type-indexed-access-tuple-1", "MyType");
    assertSchema("type-indexed-access-tuple-2", "MyType");
    assertSchema("type-indexed-access-object-1", "MyType");
    assertSchema("type-indexed-access-object-2", "MyType");
    assertSchema("type-keyof-tuple", "MyType");
    assertSchema("type-keyof-object", "MyType");
    assertSchema("type-mapped-simple", "MyObject");
    assertSchema("type-mapped-index", "MyObject");
    assertSchema("type-mapped-literal", "MyObject");
    assertSchema("type-mapped-generic", "MyObject");
    assertSchema("type-mapped-native", "MyObject");

    assertSchema("generic-simple", "MyObject");
    assertSchema("generic-arrays", "MyObject");
    assertSchema("generic-multiple", "MyObject");
    assertSchema("generic-multiargs", "MyObject");
    assertSchema("generic-anonymous", "MyObject");
    assertSchema("generic-recursive", "MyObject");
    assertSchema("generic-hell", "MyObject");

    assertSchema("nullable-null", "MyObject");

    assertSchema("undefined-alias", "MyType");
    assertSchema("undefined-union", "MyType");
    assertSchema("undefined-property", "MyType");
});
