import React, { createContext, useContext, useState, useEffect } from 'react';
import { LocalStorageDB, STORAGE_KEYS, SEED_USERS } from '../services/db';
import { db, collection, doc, getDocs, setDoc, deleteDoc, withTimeout } from '../services/firebase';

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

  const [usersList, setUsersList] = useState(() => {
    const localUsers = LocalStorageDB.get(STORAGE_KEYS.USERS, null);
    if (!localUsers || !Array.isArray(localUsers) || localUsers.length === 0) {
      LocalStorageDB.set(STORAGE_KEYS.USERS, SEED_USERS);
      return SEED_USERS;
    }
    return localUsers;
  });

  const [loading, setLoading] = useState(false);

  // Fast non-blocking sync of users from Firestore on boot
  useEffect(() => {
    async function syncUsers() {
      try {
        const snap = await withTimeout(getDocs(collection(db, 'users')), 600, null);
        if (snap && !snap.empty) {
          const remoteUsers = snap.docs.map(d => ({ id: d.id, ...d.data() }));
          LocalStorageDB.set(STORAGE_KEYS.USERS, remoteUsers);
          setUsersList(remoteUsers);
        } else if (snap && snap.empty) {
          // Non-blocking seed of initial admin user to Firestore in background
          for (const u of SEED_USERS) {
            setDoc(doc(db, 'users', u.id), u).catch(() => {});
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
    await new Promise(r => setTimeout(r, 300)); // Smooth UI transition

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
        role: foundUser.role || 'admin',
        email: foundUser.email || '',
        phone: foundUser.phone || '',
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
    setUsersList(updatedUsers);
    return { success: true };
  };

  // Change password for currently logged-in user with old password check
  const changePassword = async (oldPassword, newPassword) => {
    if (!user) return { success: false, error: 'Not authenticated' };
    const users = getUsers();
    const currentUser = users.find(u => u.id === user.id || u.username.toLowerCase() === user.username.toLowerCase());

    if (!currentUser) return { success: false, error: 'User account not found' };
    if (currentUser.password !== oldPassword) {
      return { success: false, error: 'Current password is incorrect' };
    }

    const updatedUser = { ...currentUser, password: newPassword };
    const updatedUsers = users.map(u => u.id === currentUser.id ? updatedUser : u);

    LocalStorageDB.set(STORAGE_KEYS.USERS, updatedUsers);
    setUsersList(updatedUsers);

    try {
      await setDoc(doc(db, 'users', updatedUser.id), updatedUser);
    } catch (err) {
      console.warn('Firestore sync failed:', err.message);
    }

    return { success: true };
  };

  // Update Admin Profile (name, email, phone)
  const updateProfile = async (updates) => {
    if (!user) return { success: false, error: 'Not authenticated' };
    const users = getUsers();
    const currentUser = users.find(u => u.id === user.id || u.username.toLowerCase() === user.username.toLowerCase());

    if (!currentUser) return { success: false, error: 'User not found' };

    const updatedUser = {
      ...currentUser,
      name: updates.name || currentUser.name,
      email: updates.email !== undefined ? updates.email : (currentUser.email || ''),
      phone: updates.phone !== undefined ? updates.phone : (currentUser.phone || '')
    };

    const updatedUsers = users.map(u => u.id === currentUser.id ? updatedUser : u);
    LocalStorageDB.set(STORAGE_KEYS.USERS, updatedUsers);
    setUsersList(updatedUsers);

    const updatedSession = {
      ...user,
      name: updatedUser.name,
      email: updatedUser.email,
      phone: updatedUser.phone
    };
    setUser(updatedSession);
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(updatedSession));

    try {
      await setDoc(doc(db, 'users', updatedUser.id), updatedUser);
    } catch (err) {
      console.warn('Firestore user update failed:', err.message);
    }

    return { success: true, user: updatedSession };
  };

  // Add new staff/cashier/admin user
  const addUser = async (userData) => {
    const users = getUsers();
    const cleanUsername = (userData.username || '').trim().toLowerCase();

    if (!cleanUsername) return { success: false, error: 'Username is required' };
    if (users.some(u => u.username.toLowerCase() === cleanUsername)) {
      return { success: false, error: 'Username already exists' };
    }

    const newUser = {
      id: `user_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 6)}`,
      name: (userData.name || 'Staff Member').trim(),
      username: cleanUsername,
      password: userData.password || 'password123',
      role: userData.role || 'cashier', // 'admin' | 'cashier' | 'manager' | 'staff'
      email: userData.email || '',
      phone: userData.phone || '',
      security_question: userData.security_question || 'What is your favorite color?',
      security_answer: userData.security_answer || 'blue',
      created_at: new Date().toISOString()
    };

    const updatedUsers = [...users, newUser];
    LocalStorageDB.set(STORAGE_KEYS.USERS, updatedUsers);
    setUsersList(updatedUsers);

    try {
      await setDoc(doc(db, 'users', newUser.id), newUser);
    } catch (err) {
      console.warn('Firestore add user sync failed:', err.message);
    }

    return { success: true, user: newUser };
  };

  // Delete user
  const deleteUser = async (userId) => {
    if (user?.id === userId) {
      return { success: false, error: 'You cannot delete your own logged-in account' };
    }
    const users = getUsers();
    const updatedUsers = users.filter(u => u.id !== userId);

    LocalStorageDB.set(STORAGE_KEYS.USERS, updatedUsers);
    setUsersList(updatedUsers);

    try {
      await deleteDoc(doc(db, 'users', userId));
    } catch (err) {
      console.warn('Firestore user deletion sync fallback:', err.message);
    }

    return { success: true };
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem(AUTH_STORAGE_KEY);
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      usersList,
      isAuthenticated: !!user, 
      login, 
      logout, 
      loading,
      getSecurityQuestion,
      verifySecurityAnswer,
      resetPassword,
      changePassword,
      updateProfile,
      addUser,
      deleteUser,
      getUsers
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
