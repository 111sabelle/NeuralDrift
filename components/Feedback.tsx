import { useEffect, useState } from 'react';

interface FeedbackProps {
    message: string;
    type: 'success' | 'error' | 'info';
    duration?: number;
}

export const Feedback: React.FC<FeedbackProps> = ({ 
    message, 
    type, 
    duration = 5000 
}) => {
    const [visible, setVisible] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => setVisible(false), duration);
        return () => clearTimeout(timer);
    }, [duration]);

    if (!visible) return null;

    const bgColor = {
        success: 'bg-green-100 border-green-500 text-green-700',
        error: 'bg-red-100 border-red-500 text-red-700',
        info: 'bg-blue-100 border-blue-500 text-blue-700'
    }[type];

    return (
        <div className={`fixed top-4 right-4 p-4 rounded border ${bgColor} shadow-lg z-50`}>
            {message}
        </div>
    );
}; 