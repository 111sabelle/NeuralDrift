import type P5 from 'p5';
import opentype from 'opentype.js';
import { TokenInfo, Point } from '../types';

// 使用 Promise 来确保 p5 只被加载一次
let p5Promise: Promise<typeof P5> | null = null;

const getP5 = async (): Promise<typeof P5> => {
    if (!p5Promise) {
        p5Promise = typeof window !== 'undefined'
            ? import('p5').then(module => module.default)
            : Promise.reject(new Error('Window is not defined'));
    }
    return p5Promise;
};

export class TextBlender {
    private p5Instance: P5 | null = null;
    private font: any;
    private blendedPoints: Point[] = [];
    private inkPoints: Point[] = [];
    private tokenData: TokenInfo[] = [];
    private isDisplayPeriod: boolean = false;
    private width: number = 800;
    private height: number = 800;
    
    // 视觉参数配置
    private readonly PARTICLE_SIZE = 1.5;
    private readonly STROKE_DENSITY = 2;
    private readonly MAX_STROKE_WIDTH = 12;
    private readonly MIN_STROKE_WIDTH = 3;
    private readonly GRID_SIZE = 1.5;
    private readonly BASE_OPACITY = 200;
    private readonly NOISE_SCALE = 0.03;
    private readonly FONT_SIZE = 150;

    constructor(canvas: HTMLCanvasElement) {
        this.initializeP5(canvas).catch(error => {
            console.error('Failed to initialize TextBlender:', error);
        });
    }

    private async initializeP5(canvas: HTMLCanvasElement) {
        try {
            const p5 = await getP5();
            this.p5Instance = new p5((p: P5) => {
                p.preload = () => this.preload(p);
                p.setup = () => this.setup(p);
                p.draw = () => this.draw(p);
            }, canvas);
        } catch (error) {
            console.error('Failed to initialize p5:', error);
        }
    }

    private async preload(p: P5) {
        try {
            this.font = await opentype.load('/fonts/SourceCodePro-Light.ttf');
        } catch (error) {
            console.error('Failed to load font:', error);
        }
    }

    private setup(p: P5) {
        p.createCanvas(this.width, this.height);
        p.background(255);
        p.frameRate(30);
    }

    public updateTokenData(tokens: TokenInfo[]) {
        this.tokenData = tokens
            .filter(token => token.usdValue > 0)
            .sort((a, b) => b.usdValue - a.usdValue);
        
        if (this.font) {
            this.updateBlendedText();
        }
    }

    public updateDisplayState(isDisplay: boolean) {
        this.isDisplayPeriod = isDisplay;
        if (this.font && this.tokenData.length > 0) {
            this.updateBlendedText();
        }
    }

    public resize(width: number, height: number) {
        this.width = width;
        this.height = height;
        if (this.p5Instance) {
            this.p5Instance.resizeCanvas(width, height);
            if (this.font && this.tokenData.length > 0) {
                this.updateBlendedText();
            }
        }
    }

    public cleanup() {
        if (this.p5Instance) {
            this.p5Instance.remove();
            this.p5Instance = null;
        }
    }

    private getTextContours(text: string, offsetX: number, offsetY: number): Point[][] {
        const path = this.font.getPath(text, offsetX, offsetY + this.FONT_SIZE, this.FONT_SIZE);
        let contours: Point[][] = [];
        let currentContour: Point[] = [];

        path.commands.forEach((cmd: any) => {
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
                    const cubicPoints = this.getCubicBezierPoints(
                        currentContour[currentContour.length-1],
                        {x: cmd.x1, y: cmd.y1},
                        {x: cmd.x2, y: cmd.y2},
                        {x: cmd.x, y: cmd.y},
                        10
                    );
                    currentContour.push(...cubicPoints);
                    break;
                case 'Q':
                    const quadPoints = this.getQuadraticBezierPoints(
                        currentContour[currentContour.length-1],
                        {x: cmd.x1, y: cmd.y1},
                        {x: cmd.x, y: cmd.y},
                        10
                    );
                    currentContour.push(...quadPoints);
                    break;
                case 'Z':
                    if (currentContour.length > 0) {
                        contours.push(currentContour);
                    }
                    currentContour = [];
                    break;
            }
        });

        if (currentContour.length > 0) {
            contours.push(currentContour);
        }

        return contours;
    }

    private updateBlendedText() {
        if (!this.p5Instance) return;

        if (this.isDisplayPeriod && this.tokenData.length > 0) {
            const token = this.tokenData[0];
            const textWidth = this.font.getAdvanceWidth(token.symbol, this.FONT_SIZE);
            const offsetX = this.width/2 - textWidth/2;
            const offsetY = this.height/2 - this.FONT_SIZE/2;
            
            const contours = this.getTextContours(token.symbol, offsetX, offsetY);
            this.generateSingleTokenPoints(contours);
        } else {
            const totalValue = this.tokenData.reduce((sum, token) => sum + (token.usdValue || 0), 0);
            const weights = this.tokenData.map(token => (token.usdValue || 0) / totalValue);
            
            let allContours: Array<{points: Point[], weight: number}> = [];
            
            this.tokenData.forEach((token, i) => {
                const textWidth = this.font.getAdvanceWidth(token.symbol, this.FONT_SIZE);
                const offsetX = this.width/2 - textWidth/2;
                const offsetY = this.height/2 - this.FONT_SIZE/2;
                
                const contours = this.getTextContours(token.symbol, offsetX, offsetY);
                contours.forEach(contour => {
                    allContours.push({
                        points: contour,
                        weight: weights[i]
                    });
                });
            });
    
            this.generateBlendedPoints(allContours);
            this.generateInkEffects();
        }
    }

    private generateSingleTokenPoints(contours: Point[][]) {
        this.blendedPoints = [];
        contours.forEach(contour => {
            for (let i = 0; i < contour.length; i += this.STROKE_DENSITY) {
                this.blendedPoints.push({
                    x: contour[i].x,
                    y: contour[i].y,
                    width: 1
                });
            }
        });
    }

    private generateBlendedPoints(contours: Array<{points: Point[], weight: number}>) {
        this.blendedPoints = [];
        const gridSize = this.GRID_SIZE;
        const gridWidth = Math.ceil(this.width / gridSize);
        const gridHeight = Math.ceil(this.height / gridSize);
        
        for (let i = 0; i < gridWidth; i++) {
            for (let j = 0; j < gridHeight; j++) {
                const x = i * gridSize;
                const y = j * gridSize;
                let totalWeight = 0;
                
                contours.forEach(({points, weight}) => {
                    if (this.pointInPolygon({x, y}, points)) {
                        totalWeight += weight;
                    }
                });
                
                if (totalWeight > 0) {
                    this.blendedPoints.push({
                        x,
                        y,
                        width: totalWeight
                    });
                }
            }
        }
    }

    private generateInkEffects() {
        if (!this.p5Instance) return;
        
        this.inkPoints = [];
        const p = this.p5Instance;
        
        this.blendedPoints.forEach(point => {
            const noise = p.noise(point.x * this.NOISE_SCALE, point.y * this.NOISE_SCALE);
            if (noise > 0.7) {
                this.inkPoints.push({
                    x: point.x + p.random(-2, 2),
                    y: point.y + p.random(-2, 2),
                    type: 'ink',
                    density: noise
                });
            }
        });
    }

    private pointInPolygon(point: Point, polygon: Point[]): boolean {
        let inside = false;
        for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
            const xi = polygon[i].x, yi = polygon[i].y;
            const xj = polygon[j].x, yj = polygon[j].y;
            
            const intersect = ((yi > point.y) !== (yj > point.y))
                && (point.x < (xj - xi) * (point.y - yi) / (yj - yi) + xi);
            if (intersect) inside = !inside;
        }
        return inside;
    }

    private getCubicBezierPoints(p0: Point, p1: Point, p2: Point, p3: Point, numPoints: number): Point[] {
        const points: Point[] = [];
        for (let t = 0; t <= 1; t += 1/numPoints) {
            points.push({
                x: this.cubicBezier(p0.x, p1.x, p2.x, p3.x, t),
                y: this.cubicBezier(p0.y, p1.y, p2.y, p3.y, t)
            });
        }
        return points;
    }

    private getQuadraticBezierPoints(p0: Point, p1: Point, p2: Point, numPoints: number): Point[] {
        const points: Point[] = [];
        for (let t = 0; t <= 1; t += 1/numPoints) {
            points.push({
                x: this.quadraticBezier(p0.x, p1.x, p2.x, t),
                y: this.quadraticBezier(p0.y, p1.y, p2.y, t)
            });
        }
        return points;
    }

    private cubicBezier(p0: number, p1: number, p2: number, p3: number, t: number): number {
        return Math.pow(1-t, 3) * p0 +
               3 * Math.pow(1-t, 2) * t * p1 +
               3 * (1-t) * Math.pow(t, 2) * p2 +
               Math.pow(t, 3) * p3;
    }

    private quadraticBezier(p0: number, p1: number, p2: number, t: number): number {
        return Math.pow(1-t, 2) * p0 +
               2 * (1-t) * t * p1 +
               Math.pow(t, 2) * p2;
    }

    private draw(p: P5) {
        if (!p) return;
        
        p.background(255);
        p.noStroke();
        
        if (this.isDisplayPeriod) {
            // 显示单个代币的效果
            this.blendedPoints.forEach(pt => {
                p.fill(0, this.BASE_OPACITY);
                p.ellipse(pt.x, pt.y, this.PARTICLE_SIZE * 1.5, this.PARTICLE_SIZE * 1.5);
            });
        } else {
            // 绘制混合效果
            this.blendedPoints.forEach(pt => {
                const alpha = (pt.width || 1) * this.BASE_OPACITY;
                p.fill(0, alpha);
                p.ellipse(pt.x, pt.y, this.PARTICLE_SIZE, this.PARTICLE_SIZE);
            });

            this.inkPoints.forEach(pt => {
                if (pt.type === 'ink' && pt.density) {
                    p.fill(0, pt.density * this.BASE_OPACITY);
                    p.ellipse(pt.x, pt.y, this.PARTICLE_SIZE * 1.2, this.PARTICLE_SIZE * 1.2);
                }
            });
        }
    }
}