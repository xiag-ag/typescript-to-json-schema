export function filterDefined<T>(test: T | undefined): test is T {
    return test !== undefined;
}
