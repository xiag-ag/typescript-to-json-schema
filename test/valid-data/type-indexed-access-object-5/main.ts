type SomeGrandParent = {
    a: "a";
};
type SomeParent = SomeGrandParent & {
    a: "b";
    b: "b";
};
type SomeObject = SomeParent & {
    a: "c";
    c: "c";
};

export type MyType = SomeObject["a"];


// const a: MyType = "a";
// const b: MyType = "b";
// const c: MyType = "c";
