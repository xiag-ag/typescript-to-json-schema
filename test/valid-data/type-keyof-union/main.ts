type SomeType = {a: number} & {b: string};

export type MyType = keyof (SomeType & {c: string});


const a: MyType = "a";
const b: MyType = "b";
const c: MyType = "c";
