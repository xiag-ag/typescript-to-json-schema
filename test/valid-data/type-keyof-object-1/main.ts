interface SomeInterface {
    foo: 12;
    bar: "baz";
}

export type MyType = keyof SomeInterface;


const a: MyType = "foo";
const b: MyType = "bar";
// const c: MyType = "unknown";
