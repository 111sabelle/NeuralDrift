import Link from 'next/link';
import WalletConnect from './WalletConnect';

const Navbar: React.FC = () => {
    return (
        <nav className="bg-white shadow-lg fixed w-full top-0 z-50">
            <div className="max-w-7xl mx-auto px-4">
                <div className="flex justify-between h-16">
                    <div className="flex items-center">
                        <Link href="/" className="text-2xl font-bold text-gray-800 hover:text-gray-600 transition-colors">
                            Neural Drift
                        </Link>
                    </div>
                    <div className="flex items-center">
                        <WalletConnect />
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;