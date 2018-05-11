import { BaseType } from "./BaseType";
import { assertDefined } from "../Utils/assert";

export class ReferenceType extends BaseType {
    private type: BaseType | undefined;

    public getId(): string {
        return assertDefined(this.type, "You must call setType() method before using getId() method").getId();
    }

    public getType(): BaseType {
        return assertDefined(this.type, "You must call setType() method before using getType() method");
    }
    public setType(type: BaseType): void {
        this.type = type;
    }
}
