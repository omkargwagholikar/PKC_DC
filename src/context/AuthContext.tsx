// import { createContext, useContext, useState, useEffect } from 'react';
// import { jwtDecode } from "jwt-decode";

// interface JWTPayload {
//   user_name: string;
//   is_judge: boolean;
//   is_player: boolean;
//   exp: number;
// }

// interface Tokens {
//   access: string;
//   refresh: string;
// }

// interface AuthContextType {
//   tokens: Tokens | null;
//   setTokens: (tokens: Tokens | null) => void;
//   isLoggedIn: boolean;
//   setIsLoggedIn: (value: boolean) => void;
//   userInfo: {
//     username: string;
//     isJudge: boolean;
//     isPlayer: boolean;
//   } | null;
// }

// const AuthContext = createContext<AuthContextType | undefined>(undefined);

// export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
//   const [tokens, setTokens] = useState<Tokens | null>(null);
//   const [isLoggedIn, setIsLoggedIn] = useState(false);
//   const [userInfo, setUserInfo] = useState<AuthContextType['userInfo']>(null);

//   useEffect(() => {
//     if (tokens?.access) {
//       try {
//         const decoded = jwtDecode<JWTPayload>(tokens.access);
//         setUserInfo({
//           username: decoded.user_name,
//           isJudge: decoded.is_judge,
//           isPlayer: decoded.is_player
//         });
//         setIsLoggedIn(true);
//       } catch (error) {
//         console.error('Error decoding token:', error);
//         setUserInfo(null);
//         setIsLoggedIn(false);
//       }
//     } else {
//       setUserInfo(null);
//       setIsLoggedIn(false);
//     }
//   }, [tokens]);

//   return (
//     <AuthContext.Provider 
//       value={{ 
//         tokens, 
//         setTokens, 
//         isLoggedIn, 
//         setIsLoggedIn,
//         userInfo
//       }}
//     >
//       {children}
//     </AuthContext.Provider>
//   );
// };

// export const useAuth = () => {
//   const context = useContext(AuthContext);
//   if (context === undefined) {
//     throw new Error('useAuth must be used within an AuthProvider');
//   }
//   return context;
// };

// export const withAuth = (WrappedComponent: React.ComponentType, requiredRole?: 'judge' | 'player') => {
//   return function WithAuthWrapper(props: any) {
//     const { isLoggedIn, userInfo } = useAuth();

//     if (!isLoggedIn) {
//       // Redirect to login page or show unauthorized message
//       return <div>Please log in to access this page</div>;
//     }

//     if (requiredRole) {
//       const hasRequiredRole = requiredRole === 'judge' ? userInfo?.isJudge : userInfo?.isPlayer;
//       if (!hasRequiredRole) {
//         return <div>You don't have permission to access this page</div>;
//       }
//     }

//     return <WrappedComponent {...props} />;
//   };
// };


import { createContext, useContext, useState, useEffect } from 'react';
import Cookies from 'js-cookie'; // Import js-cookie library
import {jwtDecode} from 'jwt-decode'; // Ensure you have jwt-decode installed

interface JWTPayload {
  user_name: string;
  is_judge: boolean;
  is_player: boolean;
  exp: number;
}

interface Tokens {
  access: string;
  refresh: string;
}

interface AuthContextType {
  tokens: Tokens | null;
  setTokens: (tokens: Tokens | null) => void;
  isLoggedIn: boolean;
  setIsLoggedIn: (value: boolean) => void;
  userInfo: {
    username: string;
    isJudge: boolean;
    isPlayer: boolean;
  } | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [tokens, setTokensState] = useState<Tokens | null>(() => {
    // Load tokens from cookies on initial render
    const access = Cookies.get('access');
    const refresh = Cookies.get('refresh');
    return access && refresh ? { access, refresh } : null;
  });
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userInfo, setUserInfo] = useState<AuthContextType['userInfo']>(null);

  const setTokens = (tokens: Tokens | null) => {
    if (tokens) {
      Cookies.set('access', tokens.access, { secure: true });
      Cookies.set('refresh', tokens.refresh, { secure: true });
    } else {
      Cookies.remove('access');
      Cookies.remove('refresh');
    }
    setTokensState(tokens);
  };

  useEffect(() => {
    if (tokens?.access) {
      try {
        const decoded = jwtDecode<JWTPayload>(tokens.access);
        setUserInfo({
          username: decoded.user_name,
          isJudge: decoded.is_judge,
          isPlayer: decoded.is_player,
        });
        setIsLoggedIn(true);
      } catch (error) {
        console.error('Error decoding token:', error);
        setUserInfo(null);
        setIsLoggedIn(false);
      }
    } else {
      setUserInfo(null);
      setIsLoggedIn(false);
    }
  }, [tokens]);

  return (
    <AuthContext.Provider
      value={{
        tokens,
        setTokens,
        isLoggedIn,
        setIsLoggedIn,
        userInfo,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const withAuth = (WrappedComponent: React.ComponentType, requiredRole?: 'judge' | 'player') => {
  return function WithAuthWrapper(props: any) {
    const { isLoggedIn, userInfo } = useAuth();

    if (!isLoggedIn) {
      return <div>Please log in to access this page</div>;
    }

    if (requiredRole) {
      const hasRequiredRole = requiredRole === 'judge' ? userInfo?.isJudge : userInfo?.isPlayer;
      if (!hasRequiredRole) {
        return <div>You don't have permission to access this page</div>;
      }
    }

    return <WrappedComponent {...props} />;
  };
};
