export interface MyParent1 {
    parentField1: string;
    [name: string]: string | number | boolean;
}
export interface MyParent2 {
    parentField2: number;
}
export interface MyObject extends MyParent1, MyParent2 {
    objectField: boolean;
}
