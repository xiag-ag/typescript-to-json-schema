import { assert } from "chai";
import { resolve } from "path";
import { createGenerator } from "../factory/generator";

function assertSchema(name: string, type: string, message: string): void {
    it(name, () => {
        const basePath = "test/invalid-data";
        const generator = createGenerator({
            path: resolve(`${basePath}/${name}/*.ts`),
            type: type,

            expose: "export",
            topRef: true,
            jsDoc: "none",
            sortProps: true,
        });

        assert.throws(() => generator.createSchema(type), message);
    });
}

describe("invalid-data", () => {
    // TODO: template recursive

    assertSchema("script-empty", "MyType", `No root type "MyType" found`);
    assertSchema("unknown-node-type", "MyType", `Unknown node ""123" + "456""`);
    assertSchema("unknown-initializer", "MyType", `Invalid type query " obj"`);
    assertSchema("conditional-types", "MyType", `Unknown node " T extends boolean ? "yes" : "no""`);

    assertSchema("literal-index-type", "MyType", `Unknown node " ["abc", "def"]`);
    assertSchema("literal-array-type", "MyType", `Unknown node " ["abc", "def"]`);
    assertSchema("literal-object-type", "MyType", `Unknown node " {abc: "def"}`);
});
