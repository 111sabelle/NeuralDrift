import { ReactNode, useEffect, useState } from 'react';

interface NoSSRProps {
    children: ReactNode;
}

export const NoSSR: React.FC<NoSSRProps> = ({ children }) => {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) {
        return (
            <div style={{ visibility: 'hidden' }}>
                <div className="min-h-screen bg-gray-100">
                    <div className="container mx-auto px-4 py-8">
                        <div className="flex justify-center">
                            <div className="animate-spin h-8 w-8" />
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return <>{children}</>;
};

export default NoSSR;