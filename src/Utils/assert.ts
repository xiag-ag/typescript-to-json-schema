import { AssertionError } from "../Error/AssertionError";

export function assertDefined<TValue>(
    value: TValue | undefined,
    message?: string,
): TValue {
    if (value === undefined) {
        throw new AssertionError(message || `Value "${value}" should not be undefined`);
    }

    return value;
}

export function assertInstanceOf<TType>(
    value: any,
    type: {new (...args: any[]): TType},
    message?: string,
): TType {
    if (!(value instanceof type)) {
        throw new AssertionError(`Value "${value}" should be instanceof "${type.name}"`);
    }

    return value;
}
