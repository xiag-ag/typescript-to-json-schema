type SomeType = {a: number} & {b: string};

export type MyType = keyof (SomeType & {c: string});
