export type MyType = keyof (
    ({a: "a"} & {c: "c"} & {d: 1}) |
    ({b: "b"} & {c: "C"} & {d: 2})
);

// const a: MyType = "a";
// const b: MyType = "b";
const c: MyType = "c";
const d: MyType = "d";
