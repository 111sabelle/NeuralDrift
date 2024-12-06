import { useRouter } from 'next/router';
import Navbar from '../../components/Navbar';
import { NFTDisplay } from '../../components/NFTDisplay';

export default function NFTPage() {
    const router = useRouter();
    const { tokenId } = router.query;

    return (
        <div className="min-h-screen bg-gray-100 flex flex-col">
            <Navbar />
            <main className="flex-1 container mx-auto px-4 py-8">
                {tokenId && (
                    <NFTDisplay
                        tokenId={tokenId as string}
                        className="mb-8"
                    />
                )}
            </main>
        </div>
    );
}