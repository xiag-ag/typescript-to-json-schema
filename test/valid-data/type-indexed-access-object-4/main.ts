interface SomeParent {
    [key: string]: string;
}
interface SomeObject extends SomeParent {
    abc: "foo";
}

const obj: SomeObject = {abc: "foo"};
export type MyType = typeof obj["def"];

const a: MyType = "foo";
const b: MyType = "bar";
// const c: MyType = 123;
// const d: MyType = undefined;
