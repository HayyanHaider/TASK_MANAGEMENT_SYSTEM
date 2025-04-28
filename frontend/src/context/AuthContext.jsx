import React, { createContext, useContext, useState } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    const login = async (credentials) => {
        // Here you would typically make an API call to your backend
        // For now, we'll just set isAuthenticated to true
        setIsAuthenticated(true);
        // Store role_id in localStorage (temporary solution)
        localStorage.setItem('role_id', credentials.role_id || '4'); // Default to client role
    };

    const logout = async () => {
        setIsAuthenticated(false);
        localStorage.removeItem('role_id');
    };

    const value = {
        isAuthenticated,
        login,
        logout
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}; 