import { NextPage } from 'next';

const Custom404: NextPage = () => {
    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
            <div className="text-center">
                <h1 className="text-6xl font-bold text-gray-900">404</h1>
                <p className="text-xl text-gray-600 mt-4">Page Not Found</p>
            </div>
        </div>
    );
};

export default Custom404;