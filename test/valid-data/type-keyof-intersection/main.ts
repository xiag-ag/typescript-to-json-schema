export type MyType = keyof (
    {a: "a", c: "c", d: 1} |
    {b: "b", c: "C", d: 2}
);

const c: MyType = "c";
const d: MyType = "d";

// @ts-ignore
const a: MyType = "a";
// @ts-ignore
const b: MyType = "b";
