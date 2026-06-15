import React, { useEffect, useState } from 'react';
import { AuthContext } from './AuthContext';
import { createUserWithEmailAndPassword, GoogleAuthProvider, onAuthStateChanged, signInWithEmailAndPassword, signInWithPopup, signOut, updateProfile, updatePassword } from 'firebase/auth';
import { auth } from '../../firebase/firebase.init';

const googleProvider = new GoogleAuthProvider();

const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    const registerUser = (email, password) => {
        setLoading(true);
        return createUserWithEmailAndPassword(auth, email, password)
    }

    const signInUser = (email, password) => {
        setLoading(true);
        return signInWithEmailAndPassword(auth, email, password)
    }

    const signInGoogle = () => {
        setLoading(true);
        return signInWithPopup(auth, googleProvider);
    }

    const logOut = () => {
        setLoading(true);
        return signOut(auth);
    }

    const updateUserProfile = (profile) =>{
        return updateProfile(auth.currentUser, profile)
    }

    const updateUserPassword = (newPassword) => {
        return updatePassword(auth.currentUser, newPassword);
    }

    // observe user state
    useEffect(() => {
        const unSubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
            setLoading(false);
        })
        return () => {
            unSubscribe();
        }
    }, [])

    // load saved theme on initial mount
    useEffect(() => {
        const savedTheme = localStorage.getItem('theme') || 'light';
        document.querySelector('html').setAttribute('data-theme', savedTheme);
    }, []);

    const authInfo = {
        user,
        loading,
        registerUser,
        signInUser,
        signInGoogle,
        logOut,
        updateUserProfile,
        updateUserPassword
    }

    return (
        <AuthContext value={authInfo}>
            {children}
        </AuthContext>
    );
};

export default AuthProvider;