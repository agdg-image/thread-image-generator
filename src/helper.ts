

export function getNumber(min: number, value: string, max: number) {

    let valueNum = Number.parseInt(value);

    if (Number.isNaN(valueNum)) {
        valueNum = min;
    }

    return clamp(min, valueNum, max);
}

export function clamp(min: number, value: number, max: number) {

    return Math.max(min, Math.min(value, max));
}
