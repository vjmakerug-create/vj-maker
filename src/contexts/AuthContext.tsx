import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { 
  auth, 
  onAuthStateChanged, 
  firebaseSignIn, 
  firebaseSignUp, 
  firebaseLogout,
  firebaseGoogleSignIn,
  isAdmin,
  User 
} from "@/lib/firebase";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAdminUser: boolean;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUp: (name: string, email: string, phone: string, password: string) => Promise<{ error: Error | null }>;
  signInWithGoogle: () => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      await firebaseSignIn(email, password);
      return { error: null };
    } catch (error: any) {
      return { error };
    }
  };

  const signUp = async (name: string, email: string, phone: string, password: string) => {
    try {
      await firebaseSignUp(email, password, name);
      return { error: null };
    } catch (error: any) {
      return { error };
    }
  };

  const signInWithGoogle = async () => {
    try {
      await firebaseGoogleSignIn();
      return { error: null };
    } catch (error: any) {
      return { error };
    }
  };

  const signOut = async () => {
    await firebaseLogout();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAdminUser: isAdmin(user),
        signIn,
        signUp,
        signInWithGoogle,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
