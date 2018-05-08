type SomeGrandParent = {
    a: "a";
};
type SomeParent = SomeGrandParent & {
    b: "b";
};
type SomeObject = SomeParent & {
    c: "c";
};

export type MyType = keyof SomeObject;


const a: MyType = "a";
const b: MyType = "b";
const c: MyType = "c";
// const d: MyType = "d";
