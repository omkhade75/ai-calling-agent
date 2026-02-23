import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { apiFetch } from '@/lib/api';
import { useNavigate } from 'react-router-dom';
import { Session, User as SupabaseUser } from '@supabase/supabase-js';

// We map Supabase User to our local User interface as best as possible
interface User {
    id: string;
    email: string;
    displayName?: string;
    publicKey?: string;
    secretKey?: string;
}

interface AuthContextType {
    user: User | null;
    session: Session | null;
    loading: boolean;
    login: (token: string, userData: User) => void; // Keep for backward compatibility or remove usage in Auth.tsx
    logout: () => void;
    refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [session, setSession] = useState<Session | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Initial session fetch
        refreshUser();

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, newSession) => {
            setSession(newSession);
            if (newSession?.user) {
                try {
                    const { user: backendUser } = await apiFetch<{ user: User }>('/auth/me');
                    setUser({
                        id: newSession.user.id,
                        email: newSession.user.email || '',
                        displayName: newSession.user.user_metadata?.displayName || 'User',
                        publicKey: backendUser?.publicKey,
                        secretKey: backendUser?.secretKey,
                    });
                } catch (e) {
                    console.error("Failed to sync backend user", e);
                    setUser(null);
                }
            } else {
                setUser(null);
            }
            setLoading(false);
        });

        return () => subscription.unsubscribe();
    }, []);

    const refreshUser = async () => {
        setLoading(true);
        try {
            const { data: { session: newSession }, error } = await supabase.auth.getSession();
            if (error) throw error;

            setSession(newSession);
            if (newSession?.user) {
                const { user: backendUser } = await apiFetch<{ user: User }>('/auth/me');
                setUser({
                    id: newSession.user.id,
                    email: newSession.user.email || '',
                    displayName: newSession.user.user_metadata?.displayName || 'User',
                    publicKey: backendUser?.publicKey,
                    secretKey: backendUser?.secretKey,
                });
            } else {
                setUser(null);
            }
        } catch (error) {
            console.error('Failed to fetch session', error);
            setUser(null);
            setSession(null);
        } finally {
            setLoading(false);
        }
    };

    const login = (token: string, userData: User) => {
        // This is kept mainly if we manually want to set user, 
        // but with Supabase onAuthStateChange handles it.
        setUser(userData);
    };

    const logout = async () => {
        await supabase.auth.signOut();
        setUser(null);
        setSession(null);
    };

    return (
        <AuthContext.Provider value={{ user, session, loading, login, logout, refreshUser }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
