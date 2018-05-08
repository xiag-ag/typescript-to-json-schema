type SomeTuple = [
    12,
    "baz"
];

export type MyType = keyof SomeTuple;


const el0: MyType = "0";
const el1: MyType = "1";
// const el2: MyType = "2";
