import { Definition } from "./Definition";
import { StringMap } from "../Utils/StringMap";

export interface Schema extends Definition {
    $schema: string;
    definitions: StringMap<Definition>;
}
