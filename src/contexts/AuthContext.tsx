import React, {
	createContext,
	useContext,
	useState,
	ReactNode,
	Dispatch,
	SetStateAction,
	useCallback,
} from 'react';
import type { AccessToken } from '@/domain/auth/types';

interface AuthContextType {
	accessToken: AccessToken | null;
	isLoggedIn: boolean;
	login: (token: AccessToken) => void;
	logout: () => void;
	isLoading: boolean;
	setIsLoading: Dispatch<SetStateAction<boolean>>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
	const [accessToken, setAccessToken] = useState<AccessToken | null>(null);
	const [isLoading, setIsLoading] = useState<boolean>(false);

	const login = useCallback((token: AccessToken) => {
		setAccessToken(token);
	}, []);

	const logout = useCallback(() => {
		setAccessToken(null);
	}, []);

	const isLoggedIn = !!accessToken;

	return (
		<AuthContext.Provider
			value={{
				accessToken,
				isLoggedIn,
				login,
				logout,
				isLoading,
				setIsLoading,
			}}
		>
			{children}
		</AuthContext.Provider>
	);
};

export const useAuth = (): AuthContextType => {
	const context = useContext(AuthContext);
	if (context === undefined) {
		throw new Error('useAuth must be used within an AuthProvider');
	}
	return context;
};
