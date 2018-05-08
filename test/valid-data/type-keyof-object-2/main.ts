interface SomeGrandParent {
    a: "a";
}
interface SomeParent extends SomeGrandParent {
    b: "b";
}
interface SomeObject extends SomeParent {
    c: "c";
}

export type MyType = keyof SomeObject;


const a: MyType = "a";
const b: MyType = "b";
const c: MyType = "c";
// const d: MyType = "d";
