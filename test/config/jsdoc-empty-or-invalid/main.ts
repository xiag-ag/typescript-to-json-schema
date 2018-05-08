/**
 * @title Some title here
 * @description Some description here
 */
export interface MyObject {
    /**
     * @minLength 123
     * @default {"abc": 123}
     */
    validJsDoc: any;
    /**
     * @minLength ABC
     * @default {"abc": ABC}
     */
    invalidJsDoc: any;
    /**
     * @minLength
     * @default
     */
    emptyJsDoc: any;
}
