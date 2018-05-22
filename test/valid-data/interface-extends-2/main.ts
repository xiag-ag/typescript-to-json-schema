export interface MyGrandParent {
    grandParentField: string;
    [name: string]: string | number | boolean;
}
export interface MyParent extends MyGrandParent {
    parentField: number;
}
export interface MyObject extends MyParent {
    objectField: boolean;
}
