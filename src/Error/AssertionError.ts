import { BaseError } from "./BaseError";

export class AssertionError extends BaseError {
    public constructor(private details: string) {
        super();
    }

    public get name(): string {
        return "AssertionError";
    }
    public get message(): string {
        return `Assertion error: ${this.details}`;
    }

    public getDetails(): string {
        return this.details;
    }
}
