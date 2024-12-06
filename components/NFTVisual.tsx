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
const FONT_SIZE = 150;
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

      p.setup = () => {
        p.createCanvas(CANVAS_SIZE, CANVAS_SIZE);
        p.background(255);
        p.loadFont(
          "/fonts/638538048043b31b724cc980_SourceCodePro-VariableFont_wght.ttf",
          (f) => setFont(f)
        );
      };

      p.draw = () => {
        if (!font) return;

        p.background(255);
        p.textFont(font);
        p.textSize(FONT_SIZE);
        p.textAlign(p.CENTER, p.CENTER);

        const canvasCenter = { x: CANVAS_SIZE / 2, y: CANVAS_SIZE / 2 };

        if (isDisplayPeriod) {
          // 显示期只显示最高价值代币
          const points = generatePointsFromText(
            p,
            font,
            tokens[0].symbol,
            canvasCenter
          );
          drawPoints(p, points);
        } else {
          // 计算所有代币的总价值
          const totalValue = tokens.reduce(
            (sum, token) => sum + (token.usdValue || 0),
            0
          );

          // 生成每个代币的点阵并计算权重
          const allPoints = tokens.map((token) => ({
            points: generatePointsFromText(p, font, token.symbol, canvasCenter),
            weight: (token.usdValue || 0) / totalValue,
          }));

          blendedPoints = blendMultipleParticles(allPoints);
          inkPoints = generateInkEffects(p, blendedPoints);

          drawPoints(p, blendedPoints);
          drawInkEffects(p, inkPoints);
        }
      };
    };

    p5Instance.current = new P5(sketch, canvasRef.current);

    return () => {
      p5Instance.current?.remove();
    };
  }, [tokens, isDisplayPeriod, font]);

  return (
    <div
      ref={canvasRef}
      className="flex justify-center items-center bg-white"
      style={{ width: CANVAS_SIZE, height: CANVAS_SIZE }}
    />
  );
};

export default NFTVisual;
