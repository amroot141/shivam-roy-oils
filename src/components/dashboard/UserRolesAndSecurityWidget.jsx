import React, { useState } from 'react';
import { 
  Users, 
  ShieldCheck, 
  UserPlus, 
  KeyRound, 
  Lock, 
  User, 
  Mail, 
  Phone, 
  Trash2, 
  CheckCircle2, 
  AlertCircle, 
  Shield, 
  Save, 
  X,
  BadgeCheck
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { formatDate } from '../../utils/formatters';

export function UserRolesAndSecurityWidget() {
  const { 
    user, 
    usersList, 
    updateProfile, 
    changePassword, 
    addUser, 
    deleteUser 
  } = useAuth();

  // Admin Profile State
  const [profileName, setProfileName] = useState(user?.name || 'Store Admin');
  const [profileEmail, setProfileEmail] = useState(user?.email || '');
  const [profilePhone, setProfilePhone] = useState(user?.phone || '');
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState(false);
  const [profileError, setProfileError] = useState('');

  // Password Change State
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passSaving, setPassSaving] = useState(false);
  const [passSuccess, setPassSuccess] = useState(false);
  const [passError, setPassError] = useState('');

  // Add New User Modal State
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [newUserData, setNewUserData] = useState({
    name: '',
    username: '',
    password: '',
    role: 'cashier',
    email: '',
    phone: '',
    security_question: 'What is your favorite color?',
    security_answer: ''
  });
  const [userSaving, setUserSaving] = useState(false);
  const [userError, setUserError] = useState('');

  // Handle Admin Profile Update
  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setProfileSaving(true);
    setProfileError('');
    setProfileSuccess(false);

    try {
      const res = await updateProfile({
        name: profileName,
        email: profileEmail,
        phone: profilePhone
      });
      if (res.success) {
        setProfileSuccess(true);
        setTimeout(() => setProfileSuccess(false), 3000);
      } else {
        setProfileError(res.error || 'Failed to update profile');
      }
    } catch (err) {
      setProfileError(err.message || 'Error updating profile');
    } finally {
      setProfileSaving(false);
    }
  };

  // Handle Password Change
  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPassError('');
    setPassSuccess(false);

    if (!oldPassword) {
      setPassError('Please enter your current password');
      return;
    }
    if (newPassword.length < 6) {
      setPassError('New password must be at least 6 characters');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPassError('New password and confirm password do not match');
      return;
    }

    setPassSaving(true);
    try {
      const res = await changePassword(oldPassword, newPassword);
      if (res.success) {
        setPassSuccess(true);
        setOldPassword('');
        setNewPassword('');
        setConfirmPassword('');
        setTimeout(() => setPassSuccess(false), 4000);
      } else {
        setPassError(res.error || 'Failed to change password');
      }
    } catch (err) {
      setPassError(err.message || 'Error changing password');
    } finally {
      setPassSaving(false);
    }
  };

  // Handle Add New User
  const handleAddUserSubmit = async (e) => {
    e.preventDefault();
    setUserError('');

    if (!newUserData.name.trim()) {
      setUserError('Name is required');
      return;
    }
    if (!newUserData.username.trim()) {
      setUserError('Username is required');
      return;
    }
    if (!newUserData.password || newUserData.password.length < 4) {
      setUserError('Password must be at least 4 characters');
      return;
    }

    setUserSaving(true);
    try {
      const res = await addUser(newUserData);
      if (res.success) {
        setIsAddUserOpen(false);
        setNewUserData({
          name: '',
          username: '',
          password: '',
          role: 'cashier',
          email: '',
          phone: '',
          security_question: 'What is your favorite color?',
          security_answer: ''
        });
      } else {
        setUserError(res.error || 'Failed to add user');
      }
    } catch (err) {
      setUserError(err.message || 'Error adding user');
    } finally {
      setUserSaving(false);
    }
  };

  // Handle Delete User
  const handleDeleteUser = async (userId, username) => {
    if (userId === user?.id) {
      alert('You cannot delete your own logged-in account!');
      return;
    }

    if (window.confirm(`Are you sure you want to remove user "${username}"?`)) {
      const res = await deleteUser(userId);
      if (!res.success) {
        alert(res.error || 'Failed to delete user');
      }
    }
  };

  const getRoleBadge = (role) => {
    switch ((role || '').toLowerCase()) {
      case 'admin':
        return 'bg-purple-100 text-purple-900 border-purple-300';
      case 'manager':
        return 'bg-blue-100 text-blue-900 border-blue-300';
      case 'cashier':
        return 'bg-emerald-100 text-emerald-900 border-emerald-300';
      default:
        return 'bg-stone-100 text-stone-700 border-stone-300';
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-5 rounded-3xl border border-stone-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 bg-purple-50 text-purple-700 rounded-xl">
              <ShieldCheck size={20} />
            </div>
            <h2 className="text-lg sm:text-xl font-heading font-extrabold text-stone-900">
              User Roles, Staff &amp; Admin Security
            </h2>
          </div>
          <p className="text-xs text-stone-500 mt-1">
            Manage admin credentials, update profile, change password, and create staff accounts with role-based permissions.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsAddUserOpen(true)}
          className="flex items-center gap-1.5 px-4 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-2xl text-xs font-bold shadow-md shadow-amber-600/20 transition-all active:scale-95 cursor-pointer"
        >
          <UserPlus size={15} />
          <span>Add New Staff User</span>
        </button>
      </div>

      {/* 2-Column Split: Profile/Password (Left) & User Management Table (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Admin Profile & Password Change (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Admin Profile Card */}
          <div className="bg-white p-5 sm:p-6 rounded-3xl border border-stone-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <div className="flex items-center gap-2">
                <User size={18} className="text-amber-600" />
                <h3 className="font-heading font-bold text-stone-900 text-sm sm:text-base">
                  Admin Profile Details
                </h3>
              </div>
              <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
                Active Session
              </span>
            </div>

            {profileError && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-700 flex items-center gap-2">
                <AlertCircle size={14} className="shrink-0" />
                <span>{profileError}</span>
              </div>
            )}

            {profileSuccess && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs text-emerald-700 flex items-center gap-2">
                <CheckCircle2 size={14} className="shrink-0" />
                <span>Profile details updated successfully!</span>
              </div>
            )}

            <form onSubmit={handleUpdateProfile} className="space-y-3">
              <div>
                <label className="text-xs font-bold text-stone-700 block mb-1">
                  Full Name / Display Name
                </label>
                <div className="relative">
                  <User size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
                  <input
                    type="text"
                    value={profileName}
                    onChange={(e) => setProfileName(e.target.value)}
                    className="w-full pl-8 pr-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs font-medium focus:outline-hidden focus:ring-1 focus:ring-amber-500"
                    placeholder="Store Admin"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-stone-700 block mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
                  <input
                    type="email"
                    value={profileEmail}
                    onChange={(e) => setProfileEmail(e.target.value)}
                    className="w-full pl-8 pr-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs font-medium focus:outline-hidden focus:ring-1 focus:ring-amber-500"
                    placeholder="admin@shivamroyoils.com"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-stone-700 block mb-1">
                  Phone Number
                </label>
                <div className="relative">
                  <Phone size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
                  <input
                    type="tel"
                    value={profilePhone}
                    onChange={(e) => setProfilePhone(e.target.value)}
                    className="w-full pl-8 pr-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs font-medium focus:outline-hidden focus:ring-1 focus:ring-amber-500"
                    placeholder="+91 98765 01234"
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={profileSaving}
                  className="w-full py-2.5 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-bold shadow-xs transition-all active:scale-98 cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Save size={14} />
                  <span>{profileSaving ? 'Saving...' : 'Update Admin Profile'}</span>
                </button>
              </div>
            </form>
          </div>

          {/* Change Password Card */}
          <div className="bg-white p-5 sm:p-6 rounded-3xl border border-stone-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <div className="flex items-center gap-2">
                <KeyRound size={18} className="text-amber-600" />
                <h3 className="font-heading font-bold text-stone-900 text-sm sm:text-base">
                  Change Admin Password
                </h3>
              </div>
              <Lock size={15} className="text-stone-400" />
            </div>

            {passError && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-700 flex items-center gap-2">
                <AlertCircle size={14} className="shrink-0" />
                <span>{passError}</span>
              </div>
            )}

            {passSuccess && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs text-emerald-700 flex items-center gap-2">
                <CheckCircle2 size={14} className="shrink-0" />
                <span>Password changed successfully!</span>
              </div>
            )}

            <form onSubmit={handleChangePassword} className="space-y-3">
              <div>
                <label className="text-xs font-bold text-stone-700 block mb-1">
                  Current Password
                </label>
                <input
                  type="password"
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  className="w-full px-3.5 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs font-medium focus:outline-hidden focus:ring-1 focus:ring-amber-500"
                  placeholder="Enter current password"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-bold text-stone-700 block mb-1">
                  New Password (min 6 characters)
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-3.5 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs font-medium focus:outline-hidden focus:ring-1 focus:ring-amber-500"
                  placeholder="Enter new password"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-bold text-stone-700 block mb-1">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-3.5 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs font-medium focus:outline-hidden focus:ring-1 focus:ring-amber-500"
                  placeholder="Re-enter new password"
                  required
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={passSaving}
                  className="w-full py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold shadow-md shadow-amber-600/20 transition-all active:scale-98 cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Lock size={14} />
                  <span>{passSaving ? 'Updating...' : 'Update Password'}</span>
                </button>
              </div>
            </form>
          </div>

        </div>

        {/* Right Column: User Roles & Staff Management Table (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-white rounded-3xl border border-stone-200 shadow-xs overflow-hidden">
            <div className="p-5 border-b border-stone-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users size={18} className="text-amber-600" />
                <div>
                  <h3 className="font-heading font-bold text-stone-900 text-base">
                    Staff &amp; User Accounts ({usersList?.length || 0})
                  </h3>
                  <p className="text-xs text-stone-400">
                    Active users authorized for Cashier Counter, Management, or Administration
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsAddUserOpen(true)}
                className="flex items-center gap-1 px-3 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-xl text-xs font-bold transition-colors cursor-pointer"
              >
                <UserPlus size={13} />
                <span>New User</span>
              </button>
            </div>

            {/* Users Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-stone-50/80 text-stone-500 border-b border-stone-200 font-bold uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="py-3 px-4">User</th>
                    <th className="py-3 px-3">Username</th>
                    <th className="py-3 px-3">Role</th>
                    <th className="py-3 px-3">Created</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {(usersList || []).map((u) => {
                    const isCurrent = u.id === user?.id || u.username.toLowerCase() === user?.username.toLowerCase();
                    const initial = (u.name || u.username || 'U').charAt(0).toUpperCase();

                    return (
                      <tr key={u.id} className="hover:bg-stone-50/60 transition-colors">
                        <td className="py-3.5 px-4 font-semibold text-stone-900">
                          <div className="flex items-center gap-2.5">
                            <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-amber-500 to-amber-700 text-white font-bold flex items-center justify-center text-xs shadow-xs shrink-0">
                              {initial}
                            </div>
                            <div className="min-w-0">
                              <p className="font-bold text-stone-900 truncate">{u.name}</p>
                              {u.email && <p className="text-[10px] text-stone-400 truncate">{u.email}</p>}
                            </div>
                          </div>
                        </td>
                        <td className="py-3.5 px-3 font-mono font-bold text-stone-700">
                          @{u.username}
                        </td>
                        <td className="py-3.5 px-3">
                          <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider border ${getRoleBadge(u.role)}`}>
                            {u.role || 'cashier'}
                          </span>
                        </td>
                        <td className="py-3.5 px-3 text-stone-400 text-[11px]">
                          {u.created_at ? formatDate(u.created_at).split(',')[0] : 'Default'}
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          {isCurrent ? (
                            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                              You
                            </span>
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleDeleteUser(u.id, u.username)}
                              className="p-1.5 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                              title="Delete user"
                            >
                              <Trash2 size={15} />
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Role Permissions Legend */}
          <div className="bg-amber-50/50 p-4 rounded-2xl border border-amber-200/60 text-xs text-stone-600 space-y-2">
            <h4 className="font-bold text-stone-900 flex items-center gap-1.5 text-xs">
              <Shield size={14} className="text-amber-600" />
              <span>Role Permissions Matrix</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
              <div>
                <strong className="text-purple-800 uppercase text-[10px]">Admin:</strong> Complete system control, analytics, user management, and store settings.
              </div>
              <div>
                <strong className="text-blue-800 uppercase text-[10px]">Manager:</strong> Inventory CRUD, stock adjustment, sales logs, and customer feedback.
              </div>
              <div>
                <strong className="text-emerald-800 uppercase text-[10px]">Cashier:</strong> Rapid staff POS counter, bill printing, and manual discounts.
              </div>
              <div>
                <strong className="text-stone-800 uppercase text-[10px]">Staff:</strong> View inventory catalog and perform basic checkout operations.
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Add New User Modal */}
      {isAddUserOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-stone-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-amber-50 text-amber-700 rounded-xl">
                  <UserPlus size={18} />
                </div>
                <h3 className="font-heading font-extrabold text-stone-900 text-base">
                  Add New Staff Member
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsAddUserOpen(false)}
                className="p-1.5 text-stone-400 hover:text-stone-700 rounded-xl hover:bg-stone-100 transition-colors cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            {userError && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-700 flex items-center gap-2">
                <AlertCircle size={14} className="shrink-0" />
                <span>{userError}</span>
              </div>
            )}

            <form onSubmit={handleAddUserSubmit} className="space-y-3">
              <div>
                <label className="text-xs font-bold text-stone-700 block mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  value={newUserData.name}
                  onChange={(e) => setNewUserData({ ...newUserData, name: e.target.value })}
                  className="w-full px-3.5 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs font-medium focus:outline-hidden focus:ring-1 focus:ring-amber-500"
                  placeholder="e.g. Rahul Verma"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-bold text-stone-700 block mb-1">
                    Username (Login)
                  </label>
                  <input
                    type="text"
                    value={newUserData.username}
                    onChange={(e) => setNewUserData({ ...newUserData, username: e.target.value.toLowerCase().trim() })}
                    className="w-full px-3.5 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs font-medium focus:outline-hidden focus:ring-1 focus:ring-amber-500"
                    placeholder="e.g. rahul_pos"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-stone-700 block mb-1">
                    Assigned Role
                  </label>
                  <select
                    value={newUserData.role}
                    onChange={(e) => setNewUserData({ ...newUserData, role: e.target.value })}
                    className="w-full px-3.5 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs font-semibold focus:outline-hidden focus:ring-1 focus:ring-amber-500 cursor-pointer"
                  >
                    <option value="cashier">Cashier</option>
                    <option value="manager">Manager</option>
                    <option value="admin">Admin</option>
                    <option value="staff">Staff</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-stone-700 block mb-1">
                  Initial Password
                </label>
                <input
                  type="password"
                  value={newUserData.password}
                  onChange={(e) => setNewUserData({ ...newUserData, password: e.target.value })}
                  className="w-full px-3.5 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs font-medium focus:outline-hidden focus:ring-1 focus:ring-amber-500"
                  placeholder="Set login password"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-bold text-stone-700 block mb-1">
                    Email (Optional)
                  </label>
                  <input
                    type="email"
                    value={newUserData.email}
                    onChange={(e) => setNewUserData({ ...newUserData, email: e.target.value })}
                    className="w-full px-3.5 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs font-medium focus:outline-hidden focus:ring-1 focus:ring-amber-500"
                    placeholder="staff@store.com"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-stone-700 block mb-1">
                    Phone (Optional)
                  </label>
                  <input
                    type="tel"
                    value={newUserData.phone}
                    onChange={(e) => setNewUserData({ ...newUserData, phone: e.target.value })}
                    className="w-full px-3.5 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs font-medium focus:outline-hidden focus:ring-1 focus:ring-amber-500"
                    placeholder="10-digit mobile"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setIsAddUserOpen(false)}
                  className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={userSaving}
                  className="px-5 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold shadow-md shadow-amber-600/20 transition-all active:scale-95 cursor-pointer disabled:opacity-50"
                >
                  {userSaving ? 'Creating...' : 'Create Account'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
