import { useCallback } from 'react';
import { toast, ToastOptions } from 'react-toastify';

interface ToastMessage {
    title: string;
    description: string;
    status: 'info' | 'success' | 'error' | 'warning';
}

export function useToast() {
    return useCallback(({ title, description, status }: ToastMessage) => {
        const options: ToastOptions = {
            position: 'top-right',
            autoClose: 5000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true
        };

        switch (status) {
            case 'success':
                toast.success(`${title}: ${description}`, options);
                break;
            case 'error':
                toast.error(`${title}: ${description}`, options);
                break;
            case 'warning':
                toast.warning(`${title}: ${description}`, options);
                break;
            default:
                toast.info(`${title}: ${description}`, options);
        }
    }, []);
}