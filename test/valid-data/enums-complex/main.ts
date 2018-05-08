export enum Enum {
    INDEX_1,
    INDEX_2,

    NUMBER_1 = 10,
    NUMBER_2 = 20,

    BOOL_1 = true as any,
    BOOL_2 = false as any,

    STR_1 = "str" as any,
    STR_2 = `tpl` as any,

    NULL_1 = null,
    NULL_2 = null as any,

    ANY_1 = <any>true,
    ANY_2 = <any>100,
    ANY_3 = <any>"any",
    ANY_4 = <any>null,

    COMPLEX = (<any>"()" as any) as any,
}
