interface LoadingSpinnerProps {
    size?: 'sm' | 'md' | 'lg';
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ size = 'lg' }) => {
    const sizeClasses = {
        sm: 'h-4 w-4 border-2',
        md: 'h-8 w-8 border-2',
        lg: 'h-32 w-32 border-2'
    };

    return (
        <div className="flex justify-center items-center">
            <div className={`animate-spin rounded-full border-t-2 border-b-2 border-gray-900 ${sizeClasses[size]}`}></div>
        </div>
    );
};