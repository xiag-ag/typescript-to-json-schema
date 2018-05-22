export interface MyGrandParent {
    grandParentField: string;
}
export interface MyParent extends MyGrandParent {
    parentField: number;
}
export interface MyObject extends MyParent {
    objectField: boolean;
}
