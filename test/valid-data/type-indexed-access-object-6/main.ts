type SomeObjectA = {
    a: "a";
};
type SomeObjectB = {
    a: "b";
};
type SomeObject = SomeObjectA & SomeObjectB;

export type MyType = SomeObject["a"];


// const a: MyType = "a";
// const b: MyType = "b";
