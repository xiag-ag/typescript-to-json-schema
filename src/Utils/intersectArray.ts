export function intersectArray<T>(array: T[], ...others: T[][]): T[] {
    return array.filter((value) => others.some((other) => other.indexOf(value) >= 0));
}
