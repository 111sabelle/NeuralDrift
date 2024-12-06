import opentype from 'opentype.js';
import { Point as ContourPoint } from '../types';  // 使用已存在的 Point 接口
import { lerp, random, noise, map } from './mathUtils';
import { InkEffect } from './inkEffects';

export class FontProcessor {
    private font: opentype.Font | null = null;
    private readonly fontSize = 150;
    private readonly particleSize = 1.5;
    private readonly strokeDensity = 2;
    private readonly maxStrokeWidth = 12;
    private readonly minStrokeWidth = 3;
    private readonly noiseScale = 0.03;
    private readonly baseOpacity = 200;
    private readonly gridSize = 1.5;

    async loadFont(url: string): Promise<void> {
        try {
            this.font = await opentype.load(url);
        } catch (err) {
            console.error('Font loading failed:', err);
            throw err;
        }
    }

    getTextContours(text: string, offsetX: number, offsetY: number): ContourPoint[][] {
        if (!this.font) throw new Error('Font not loaded');

        const path = this.font.getPath(text, offsetX, offsetY + this.fontSize, this.fontSize);
        return this.processPath(path);
    }

    private processPath(path: opentype.Path): ContourPoint[][] {
        const contours: ContourPoint[][] = [];
        let currentContour: ContourPoint[] = [];

        path.commands.forEach(cmd => {
            switch(cmd.type) {
                case 'M':
                    if (currentContour.length > 0) {
                        contours.push(currentContour);
                    }
                    currentContour = [{x: cmd.x, y: cmd.y}];
                    break;
                case 'L':
                    currentContour.push({x: cmd.x, y: cmd.y});
                    break;
                case 'C':
                    currentContour.push(...this.getCubicBezierPoints(
                        currentContour[currentContour.length-1],
                        {x: cmd.x1, y: cmd.y1},
                        {x: cmd.x2, y: cmd.y2},
                        {x: cmd.x, y: cmd.y},
                        15
                    ));
                    break;
                case 'Q':
                    currentContour.push(...this.getQuadraticBezierPoints(
                        currentContour[currentContour.length-1],
                        {x: cmd.x1, y: cmd.y1},
                        {x: cmd.x, y: cmd.y},
                        10
                    ));
                    break;
                case 'Z':
                    if (currentContour.length > 0) {
                        currentContour.push(currentContour[0]); // Close path
                        contours.push(currentContour);
                        currentContour = [];
                    }
                    break;
            }
        });

        if (currentContour.length > 0) {
            contours.push(currentContour);
        }

        return contours;
    }

    private getCubicBezierPoints(p0: ContourPoint, p1: ContourPoint, p2: ContourPoint, p3: ContourPoint, numPoints: number): ContourPoint[] {
        const points: ContourPoint[] = [];
        for (let t = 0; t <= 1; t += 1 / numPoints) {
            const mt = 1 - t;
            const mt2 = mt * mt;
            const mt3 = mt2 * mt;
            const t2 = t * t;
            const t3 = t2 * t;
            
            points.push({
                x: mt3 * p0.x + 3 * mt2 * t * p1.x + 3 * mt * t2 * p2.x + t3 * p3.x,
                y: mt3 * p0.y + 3 * mt2 * t * p1.y + 3 * mt * t2 * p2.y + t3 * p3.y
            });
        }
        return points;
    }

    private getQuadraticBezierPoints(p0: ContourPoint, p1: ContourPoint, p2: ContourPoint, numPoints: number): ContourPoint[] {
        const points: ContourPoint[] = [];
        for (let t = 0; t <= 1; t += 1 / numPoints) {
            const mt = 1 - t;
            points.push({
                x: mt * mt * p0.x + 2 * mt * t * p1.x + t * t * p2.x,
                y: mt * mt * p0.y + 2 * mt * t * p1.y + t * t * p2.y
            });
        }
        return points;
    }

    generateParticles(contours: ContourPoint[][]): ContourPoint[] {
        const particles: ContourPoint[] = [];
        
        contours.forEach(contour => {
            for (let i = 1; i < contour.length; i++) {
                const prev = contour[i-1];
                const curr = contour[i];
                particles.push(...this.generateStrokeParticles(prev, curr));
            }
        });

        return particles;
    }

    private generateStrokeParticles(start: ContourPoint, end: ContourPoint): ContourPoint[] {
        const particles: ContourPoint[] = [];
        const angle = Math.atan2(end.y - start.y, end.x - start.x);
        const distance = Math.hypot(end.x - start.x, end.y - start.y);

        for (let d = 0; d < distance; d += this.strokeDensity) {
            const t = d / distance;
            const x = lerp(start.x, end.x, t);
            const y = lerp(start.y, end.y, t);
            
            const strokeWidth = lerp(
                this.minStrokeWidth,
                this.maxStrokeWidth,
                noise(x * 0.05, y * 0.05)
            );

            for (let w = -strokeWidth/2; w <= strokeWidth/2; w += this.particleSize * 1.5) {
                const px = x + Math.cos(angle + Math.PI/2) * w + random(-0.3, 0.3);
                const py = y + Math.sin(angle + Math.PI/2) * w + random(-0.3, 0.3);
                
                particles.push({
                    x: px,
                    y: py,
                    width: map(Math.abs(w), 0, strokeWidth/2, 1, 0.4),
                    density: this.baseOpacity
                });

                if (random(0, 1) < 0.3) {
                    particles.push(...InkEffect.createSpread(px, py, 3));
                }
            }
        }

        return particles;
    }
}