export const lerp = (start: number, end: number, amt: number) => {
    return (1-amt) * start + amt * end;
};

export const random = (min: number, max?: number) => {
    if (max === undefined) {
        max = min;
        min = 0;
    }
    return Math.random() * (max - min) + min;
};

export const noise = (x: number, y: number) => {
    // 使用 simplex-noise 库
    return Math.random(); // 临时实现
};

export const map = (value: number, start1: number, stop1: number, start2: number, stop2: number) => {
    return start2 + (stop2 - start2) * ((value - start1) / (stop1 - start1));
}; 