type SomeType = number;

export type MyType = keyof SomeType;


// will not support primitive keys
const a: MyType = "toString";
const b: MyType = "toFixed";
const c: MyType = "valueOf";
