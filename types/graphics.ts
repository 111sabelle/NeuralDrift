export interface Point {
    x: number;
    y: number;
    width?: number;
    density?: number;
    type?: 'main' | 'ink';
}

export interface Contour {
    points: Point[];
    weight: number;
}

export interface PathCommand {
    type: string;
    x: number;
    y: number;
    x1?: number;
    y1?: number;
    x2?: number;
    y2?: number;
}