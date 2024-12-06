import { LoadingSpinner } from './LoadingSpinner';

interface TransactionConfirmDialogProps {
    isOpen: boolean;
    onConfirm: () => void;
    onCancel: () => void;
    title: string;
    message: string;
    loading?: boolean;
}

export const TransactionConfirmDialog: React.FC<TransactionConfirmDialogProps> = ({
    isOpen,
    onConfirm,
    onCancel,
    title,
    message,
    loading
}) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
                <h3 className="text-lg font-semibold mb-4">{title}</h3>
                <p className="text-gray-600 mb-6">{message}</p>
                <div className="flex justify-end space-x-4">
                    <button
                        onClick={onCancel}
                        disabled={loading}
                        className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onConfirm}
                        disabled={loading}
                        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-blue-300"
                    >
                        {loading ? <LoadingSpinner size="sm" /> : 'Confirm'}
                    </button>
                </div>
            </div>
        </div>
    );
};