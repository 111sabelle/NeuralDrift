import { useEffect, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import { TokenInfo } from '../types';
import { LoadingSpinner } from './LoadingSpinner';

interface TextBlenderProps {
    tokens: TokenInfo[];
    isDisplayPeriod: boolean;
}

// 将 P5 的导入移到组件内部
const TextBlenderComponent: React.FC<TextBlenderProps> = ({ tokens, isDisplayPeriod }) => {
    const canvasRef = useRef<HTMLDivElement>(null);
    const p5Instance = useRef<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [p5, setP5] = useState<any>(null);

    useEffect(() => {
        let mounted = true;

        const loadP5 = async () => {
            try {
                const P5 = await import('p5');
                if (mounted) {
                    setP5(P5.default);
                    setIsLoading(false);
                }
            } catch (error) {
                console.error('Failed to load p5:', error);
            }
        };

        loadP5();

        return () => {
            mounted = false;
            if (p5Instance.current) {
                p5Instance.current.remove();
            }
        };
    }, []);

    useEffect(() => {
        if (!p5 || !canvasRef.current || isLoading) return;

        // p5 实例化和绘制逻辑
        p5Instance.current = new p5((p: any) => {
            p.setup = () => {
                p.createCanvas(500, 500);
                p.background(255);
            };

            p.draw = () => {
                if (tokens.length === 0) return;
                // 绘制逻辑
            };
        }, canvasRef.current);

        return () => {
            if (p5Instance.current) {
                p5Instance.current.remove();
            }
        };
    }, [p5, tokens, isDisplayPeriod, isLoading]);

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-[500px]">
                <LoadingSpinner />
            </div>
        );
    }

    return <div ref={canvasRef} />;
};

export default TextBlenderComponent;