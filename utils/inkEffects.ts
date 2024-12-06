import { Point as ContourPoint } from '../types';

export class InkEffect {
    static createSpread(centerX: number, centerY: number, radius: number): ContourPoint[] {
        const spreadPoints: ContourPoint[] = [];
        const numPoints = Math.floor(Math.random() * 3) + 3;
        
        for (let i = 0; i < numPoints; i++) {
            const angle = Math.random() * Math.PI * 2;
            const r = Math.random() * radius * 0.7 + radius * 0.3;
            spreadPoints.push({
                x: centerX + Math.cos(angle) * r,
                y: centerY + Math.sin(angle) * r,
                density: this.mapRange(r, 0, radius, 0.8, 0.2),
                type: 'ink'
            });
        }
        
        return spreadPoints;
    }

    private static mapRange(value: number, start1: number, stop1: number, start2: number, stop2: number): number {
        return start2 + (stop2 - start2) * ((value - start1) / (stop1 - start1));
    }
}