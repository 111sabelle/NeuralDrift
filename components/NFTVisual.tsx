import React, { useEffect, useRef, useState } from "react";
import P5 from "p5";
import { TokenInfo } from "../types";
import { Point } from "../types";

interface NFTVisualProps {
  tokens: TokenInfo[];
  isDisplayPeriod: boolean;
}

// 常量配置
const CANVAS_SIZE = 600;
const FONT_SIZE = 100;
const PARTICLE_SIZE = 1.5;
const STROKE_DENSITY = 2;
const MAX_STROKE_WIDTH = 12;
const MIN_STROKE_WIDTH = 3;
const NOISE_SCALE = 0.03;
const BASE_OPACITY = 200;

export const NFTVisual: React.FC<NFTVisualProps> = ({
  tokens,
  isDisplayPeriod,
}) => {
  const canvasRef = useRef<HTMLDivElement>(null);
  const p5Instance = useRef<P5>();
  const [font, setFont] = useState<P5.Font | null>(null);
  const [fontLoaded, setFontLoaded] = useState(false);

  const generatePointsFromText = (
    p: P5,
    font: P5.Font,
    text: string,
    center: { x: number; y: number }
  ) => {
    console.log("生成文本点阵:", { text, center });

    const points: Point[] = [];
    const textWidth = p.textWidth(text);
    const x = center.x - textWidth / 2;
    const y = center.y;

    // 获取文本轮廓点
    const textPoints = font.textToPoints(text, x, y, FONT_SIZE, {
      sampleFactor: 0.3,
      simplifyThreshold: 0,
    });

    console.log("生成的点数量:", textPoints.length);

    return textPoints.map((point) => ({
      x: point.x,
      y: point.y,
      width: 1,
    }));
  };

  const blendMultipleParticles = (
    allPoints: Array<{ points: Point[]; weight: number }>
  ): Point[] => {
    if (allPoints.length === 0) return [];

    const maxLength = Math.max(...allPoints.map((p) => p.points.length));
    const blendedPoints: Point[] = [];

    for (let i = 0; i < maxLength; i++) {
      let blendedX = 0;
      let blendedY = 0;
      let totalWeight = 0;
      let width = 0;

      allPoints.forEach(({ points, weight }) => {
        if (i < points.length) {
          blendedX += points[i].x * weight;
          blendedY += points[i].y * weight;
          width += (points[i].width || 1) * weight;
          totalWeight += weight;
        }
      });

      if (totalWeight > 0) {
        blendedPoints.push({
          x: blendedX / totalWeight,
          y: blendedY / totalWeight,
          width: width / totalWeight,
        });
      }
    }

    return blendedPoints;
  };

  const generateInkEffects = (p: P5, points: Point[]): Point[] => {
    return points.map((point) => ({
      ...point,
      width: p.map(
        p.noise(point.x * NOISE_SCALE, point.y * NOISE_SCALE),
        0,
        1,
        MIN_STROKE_WIDTH,
        MAX_STROKE_WIDTH
      ),
      density: BASE_OPACITY,
      type: "ink" as const,
    }));
  };

  const drawPoints = (p: P5, points: Point[]) => {
    p.noStroke();
    points.forEach((point) => {
      const alpha = point.width ? point.width * BASE_OPACITY : BASE_OPACITY;
      p.fill(0, alpha);
      p.ellipse(point.x, point.y, PARTICLE_SIZE, PARTICLE_SIZE);
    });
  };

  const drawInkEffects = (p: P5, points: Point[]) => {
    p.noStroke();
    points.forEach((point) => {
      if (point.density && point.width) {
        p.fill(0, point.density);
        p.ellipse(point.x, point.y, point.width, point.width);
      }
    });
  };

  useEffect(() => {
    if (!canvasRef.current || tokens.length === 0) return;

    console.log("NFTVisual tokens:", tokens);
    console.log("NFTVisual isDisplayPeriod:", isDisplayPeriod);

    const sketch = (p: P5) => {
      let blendedPoints: Point[] = [];
      let inkPoints: Point[] = [];
      let fontRef: P5.Font | null = null;
      let cachedPoints: Point[] = []; // 用于缓存生成的点阵

      p.preload = () => {
        fontRef = p.loadFont(
          "/fonts/638538048043b31b724cc980_SourceCodePro-VariableFont_wght.ttf"
        );
      };

      p.setup = () => {
        p.createCanvas(CANVAS_SIZE, CANVAS_SIZE);
        p.background(255);

        if (!fontRef) return; // 确保字体已加载

        const canvasCenter = { x: CANVAS_SIZE / 2, y: CANVAS_SIZE / 2 };

        if (isDisplayPeriod) {
          // 显示期只生成一次点阵
          cachedPoints = generatePointsFromText(
            p,
            fontRef,
            tokens[0].symbol,
            canvasCenter
          );
        } else {
          // 非显示期生成所有点阵并混合
          const totalValue = tokens.reduce(
            (sum, token) => sum + (token.usdValue || 0),
            0
          );

          const allPoints = tokens.map((token) => ({
            points: generatePointsFromText(
              p,
              fontRef as P5.Font,
              token.symbol,
              canvasCenter
            ),
            weight: (token.usdValue || 0) / totalValue,
          }));

          blendedPoints = blendMultipleParticles(allPoints);
          inkPoints = generateInkEffects(p, blendedPoints);

          cachedPoints = blendedPoints.concat(inkPoints);
        }
      };

      p.draw = () => {
        if (!fontRef || cachedPoints.length === 0) return; // 确保字体和点阵已加载

        p.background(255);

        if (isDisplayPeriod) {
          // 显示期绘制缓存的点阵
          drawPoints(p, cachedPoints);
        } else {
          // 绘制混合点阵和墨水效果
          drawPoints(p, blendedPoints);
          drawInkEffects(p, inkPoints);
        }
      };
    };

    p5Instance.current = new P5(sketch, canvasRef.current);

    return () => {
      p5Instance.current?.remove();
    };
  }, [tokens, isDisplayPeriod]);

  return (
    <div
      ref={canvasRef}
      className="flex justify-center items-center bg-white"
      style={{ width: CANVAS_SIZE, height: CANVAS_SIZE }}
    />
  );
};

export default NFTVisual;
