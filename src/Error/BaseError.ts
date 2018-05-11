export abstract class BaseError implements Error {
    public readonly stack!: string;

    protected constructor() {
        Error.captureStackTrace(this, this.constructor);
    }

    public abstract get name(): string;
    public abstract get message(): string;
}
