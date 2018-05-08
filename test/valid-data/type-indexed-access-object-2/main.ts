interface SomeObject {
    abc: "foo";
    def?: "bar";
}

const obj: SomeObject = {abc: "foo"};
export type MyType = typeof obj["def"];


const a: MyType = "bar";
const b: MyType = undefined;
// const c: MyType = "foo";
