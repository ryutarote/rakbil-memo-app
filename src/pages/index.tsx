import { useAuth } from '@/contexts/AuthContext';
import { LoginController } from '@/features/auth/LoginController';
import { MemoAppController } from '@/features/memo/MemoAppController';

export default function HomePage() {
	const { isLoggedIn, isLoading: isAuthLoading } = useAuth();

	if (isAuthLoading && !isLoggedIn) {
		return (
			<main className='flex min-h-screen flex-col items-center justify-center p-6 bg-gray-100'>
				<p className='text-lg text-gray-700'>アプリケーションを読み込み中...</p>
			</main>
		);
	}

	if (!isLoggedIn) {
		return (
			<main className='flex min-h-screen flex-col items-center justify-center p-6 bg-gray-50'>
				<div className='w-full max-w-md'>
					<header className='text-center mb-8'>
						<h1 className='text-4xl font-extrabold text-gray-800 tracking-tight'>
							メモアプリ
						</h1>
					</header>
					<LoginController />
				</div>
			</main>
		);
	}

	return <MemoAppController />;
}
