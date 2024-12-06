import { Point } from '../types';
import { noise, lerp, random, map } from './mathUtils';

export class ParticleSystem {
    private readonly particleSize = 1.5;
    private readonly strokeDensity = 2;
    private readonly maxStrokeWidth = 12;
    private readonly minStrokeWidth = 3;
    private readonly noiseScale = 0.03;

    generateParticles(contours: Point[][], weight: number = 1): Point[] {
        const particles: Point[] = [];
        
        contours.forEach(contour => {
            for (let i = 1; i < contour.length; i++) {
                const prev = contour[i-1];
                const curr = contour[i];
                
                this.generateStrokeParticles(prev, curr, weight, particles);
            }
        });
        
        return particles;
    }

    private generateStrokeParticles(prev: Point, curr: Point, weight: number, particles: Point[]) {
        const angle = Math.atan2(curr.y - prev.y, curr.x - prev.x);
        const distance = Math.hypot(curr.x - prev.x, curr.y - prev.y);
        
        for (let d = 0; d < distance; d += this.strokeDensity) {
            const t = d / distance;
            const x = lerp(prev.x, curr.x, t);
            const y = lerp(prev.y, curr.y, t);
            
            const strokeWidth = lerp(
                this.minStrokeWidth,
                this.maxStrokeWidth,
                noise(x * 0.05, y * 0.05)
            ) * weight;

            this.generateStrokeWidth(x, y, angle, strokeWidth, particles);
        }
    }

    private generateStrokeWidth(x: number, y: number, angle: number, strokeWidth: number, particles: Point[]) {
        for (let w = -strokeWidth/2; w <= strokeWidth/2; w += this.particleSize * 1.5) {
            const px = x + Math.cos(angle + Math.PI/2) * w + random(-0.3, 0.3);
            const py = y + Math.sin(angle + Math.PI/2) * w + random(-0.3, 0.3);
            
            particles.push({
                x: px,
                y: py,
                width: map(Math.abs(w), 0, strokeWidth/2, 1, 0.4)
            });
        }
    }
}