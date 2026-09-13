import React, { createContext, useContext, useState, useEffect } from 'react';
import { LocalStorageDB, STORAGE_KEYS, SEED_USERS } from '../services/db';
import { db, collection, doc, getDocs, setDoc } from '../services/firebase';

const AuthContext = createContext(null);
const AUTH_STORAGE_KEY = 'shivamroyoils_auth_session_v1';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem(AUTH_STORAGE_KEY);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [loading, setLoading] = useState(false);

  // Sync users from Firestore on boot
  useEffect(() => {
    async function syncUsers() {
      try {
        const snap = await getDocs(collection(db, 'users'));
        if (!snap.empty) {
          const remoteUsers = snap.docs.map(d => ({ id: d.id, ...d.data() }));
          LocalStorageDB.set(STORAGE_KEYS.USERS, remoteUsers);
        } else {
          // Seed the initial admin user to Firestore
          for (const u of SEED_USERS) {
            await setDoc(doc(db, 'users', u.id), u);
          }
        }
      } catch (err) {
        console.warn('Firestore users sync offline/fallback:', err.message);
      }
    }
    syncUsers();
  }, []);

  const getUsers = () => {
    const users = LocalStorageDB.get(STORAGE_KEYS.USERS, null);
    if (!users || !Array.isArray(users) || users.length === 0) {
      LocalStorageDB.set(STORAGE_KEYS.USERS, SEED_USERS);
      return SEED_USERS;
    }
    return users;
  };

  const login = async (username, password) => {
    setLoading(true);
    await new Promise(r => setTimeout(r, 400)); // Smooth UI transition

    const users = getUsers();
    const cleanUser = (username || '').trim().toLowerCase();
    const cleanPass = (password || '').trim();

    const foundUser = users.find(
      u => (u.username || '').toLowerCase() === cleanUser && u.password === cleanPass
    );

    if (foundUser) {
      const sessionUser = {
        id: foundUser.id || 'user_1',
        username: foundUser.username,
        name: foundUser.name,
        role: foundUser.role,
        token: `token-${Date.now()}`
      };
      setUser(sessionUser);
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(sessionUser));
      setLoading(false);
      return { success: true, user: sessionUser };
    } else {
      setLoading(false);
      return { success: false, error: 'Invalid username or password' };
    }
  };

  const getSecurityQuestion = (username) => {
    const users = getUsers();
    const cleanUser = (username || '').trim().toLowerCase();
    const foundUser = users.find(u => (u.username || '').toLowerCase() === cleanUser);
    if (foundUser) {
      return { success: true, question: foundUser.security_question };
    }
    return { success: false, error: 'User not found' };
  };

  const verifySecurityAnswer = (username, answer) => {
    const users = getUsers();
    const cleanUser = (username || '').trim().toLowerCase();
    const foundUser = users.find(u => (u.username || '').toLowerCase() === cleanUser);
    if (foundUser && (foundUser.security_answer || '').toLowerCase().trim() === (answer || '').toLowerCase().trim()) {
      return { success: true };
    }
    return { success: false, error: 'Incorrect answer' };
  };

  const resetPassword = async (username, newPassword) => {
    const users = getUsers();
    const cleanUser = (username || '').trim().toLowerCase();
    
    let targetUser = null;
    const updatedUsers = users.map(u => {
      if ((u.username || '').toLowerCase() === cleanUser) {
        targetUser = { ...u, password: newPassword };
        return targetUser;
      }
      return u;
    });

    if (targetUser) {
      try {
        await setDoc(doc(db, 'users', targetUser.id || 'user_1'), targetUser);
      } catch (err) {
        console.warn('Firestore password reset sync failed:', err.message);
      }
    }

    LocalStorageDB.set(STORAGE_KEYS.USERS, updatedUsers);
    return { success: true };
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem(AUTH_STORAGE_KEY);
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      isAuthenticated: !!user, 
      login, 
      logout, 
      loading,
      getSecurityQuestion,
      verifySecurityAnswer,
      resetPassword
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
