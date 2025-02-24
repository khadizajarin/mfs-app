"use client"
import { GoogleAuthProvider, createUserWithEmailAndPassword, getAuth, onAuthStateChanged, signInWithEmailAndPassword, signInWithPopup, signOut } from "firebase/auth";
import {auth} from "./firebase.config"
import { createContext, useEffect, useState } from "react";



export const AuthContext = createContext(null);

// const auth = getAuth(app);


const AuthProvider = ({children}) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [locationState, setLocationState] = useState(null);

    //create user with google
    const provider = new GoogleAuthProvider();
    const createUserGoogle = () => {
        setLoading(true);
        return signInWithPopup(auth, provider);
    }

    //create user for register route
    const createUser = (email, password) => {
        setLoading(true);
        return createUserWithEmailAndPassword(auth, email, password);
    };

    //signIn user for login route
    const signIn = (email,password) => {
        setLoading(true);
        return signInWithEmailAndPassword(auth, email, password);
    }

    //logout user 
    const logOut = () => {
        setLoading(true);
        return signOut(auth);
    }

    //observer
    useEffect( () => {
        const unSubscribe = onAuthStateChanged(auth, currentUser => {
            setUser(currentUser);
            setLoading(false);
        })
        return () => {
            unSubscribe();
        }
    }, [])



    const authInfo ={
        user,
        loading,
        setUser,
        createUser,
        signIn,
        createUserGoogle,
        logOut,
        // locationState, 
        // setLocationState
    }

    
    return (
        <AuthContext.Provider value = {authInfo}>
                {children}
        </AuthContext.Provider>
    );
};

export default AuthProvider;