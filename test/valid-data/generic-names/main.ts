export interface PublicGeneric<T> {
    field: T;
}

interface PrivateInterface {
    int: string;
}
export interface PublicInterface {
    int: string;
}

type PrivateType = {
    typ: string;
}
export type PublicType = {
    typ: string;
}

enum PrivateEnum {
    A,
    B,
}
export enum PublicEnum {
    A,
    B,
}

type PrivateAlias = string;
export type PublicAlias = string;

export interface MyObject {
    array1: PublicGeneric<[1, "a", true, null]>;
    array2: PublicGeneric<string[]>;

    enum1: PublicGeneric<PrivateEnum>;
    enum2: PublicGeneric<PublicEnum>;

    literal1: PublicGeneric<123>;
    literal2: PublicGeneric<"abc">;
    literal4: PublicGeneric<true>;
    literal5: PublicGeneric<false>;

    mix1: PublicGeneric<number & string>;
    mix2: PublicGeneric<number | string>;

    object1: PublicGeneric<{structure: any}>;
    object2: PublicGeneric<PrivateInterface>;
    object3: PublicGeneric<PublicInterface>;
    object4: PublicGeneric<PrivateType>;
    object5: PublicGeneric<PublicType>;

    primitive1: PublicGeneric<number>;
    primitive2: PublicGeneric<string>;
    primitive3: PublicGeneric<boolean>;
    primitive4: PublicGeneric<null>;
    primitive5: PublicGeneric<undefined>;
    primitive6: PublicGeneric<any>;
}
