type IsBoolean<T> = T extends boolean ? "yes" : "no";
export type MyType = IsBoolean<true>;


const a: MyType = "yes";
// const b: MyType = "no";
