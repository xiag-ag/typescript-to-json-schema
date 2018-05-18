export interface OptionalConfig {
    expose: "all" | "none" | "export";
    topRef: boolean;
    jsDoc: "none" | "extended" | "basic";
    sortProps: boolean;
}
export interface ProgramConfig extends OptionalConfig {
    path: string;
    type: string;
}

export const DEFAULT_CONFIG: OptionalConfig = {
    expose: "export",
    topRef: true,
    jsDoc: "extended",
    sortProps: true,
};
