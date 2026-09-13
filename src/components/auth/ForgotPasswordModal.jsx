import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { X, KeyRound, CheckCircle2 } from 'lucide-react';

export function ForgotPasswordModal({ isOpen, onClose }) {
  const { getSecurityQuestion, verifySecurityAnswer, resetPassword } = useAuth();
  
  const [step, setStep] = useState(1); // 1: Username, 2: Question, 3: New Password, 4: Success
  const [username, setUsername] = useState('');
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleClose = () => {
    setStep(1);
    setUsername('');
    setQuestion('');
    setAnswer('');
    setNewPassword('');
    setError('');
    onClose();
  };

  const handleNextStep1 = () => {
    setError('');
    if (!username.trim()) {
      setError('Please enter your username');
      return;
    }
    const res = getSecurityQuestion(username.trim());
    if (res.success) {
      setQuestion(res.question);
      setStep(2);
    } else {
      setError(res.error || 'User not found');
    }
  };

  const handleNextStep2 = () => {
    setError('');
    if (!answer.trim()) {
      setError('Please provide an answer');
      return;
    }
    const res = verifySecurityAnswer(username.trim(), answer.trim());
    if (res.success) {
      setStep(3);
    } else {
      setError(res.error || 'Incorrect answer');
    }
  };

  const handleNextStep3 = () => {
    setError('');
    if (!newPassword.trim() || newPassword.length < 4) {
      setError('Password must be at least 4 characters long');
      return;
    }
    const res = resetPassword(username.trim(), newPassword);
    if (res.success) {
      setStep(4);
    } else {
      setError('Failed to reset password');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl animate-scaleIn">
        
        <div className="flex justify-between items-center p-5 border-b border-stone-100">
          <div className="flex items-center gap-2 text-amber-700 font-bold">
            <KeyRound size={20} />
            <span>Reset Password</span>
          </div>
          <button 
            onClick={handleClose}
            className="p-1.5 hover:bg-stone-100 text-stone-500 rounded-full transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-6">
          {error && (
            <div className="mb-4 p-3 bg-rose-50 text-rose-700 text-xs font-semibold rounded-xl text-center">
              {error}
            </div>
          )}

          {step === 1 && (
            <div className="space-y-4 text-sm">
              <p className="text-stone-600">Enter your username to begin password recovery.</p>
              <div>
                <label className="text-xs font-bold uppercase text-stone-600 block mb-1">Username</label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-amber-500/20"
                  placeholder="e.g. admin"
                  autoFocus
                />
              </div>
              <button
                onClick={handleNextStep1}
                className="w-full py-3 bg-stone-900 hover:bg-stone-800 text-white rounded-2xl font-bold transition-all cursor-pointer shadow-md"
              >
                Find Account
              </button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4 text-sm">
              <p className="text-stone-600">Answer your security question to verify your identity.</p>
              <div className="p-3 bg-amber-50 border border-amber-100 rounded-xl text-amber-900 font-medium text-center">
                {question}
              </div>
              <div>
                <label className="text-xs font-bold uppercase text-stone-600 block mb-1">Your Answer</label>
                <input
                  type="text"
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                  className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-amber-500/20"
                  placeholder="Security answer"
                  autoFocus
                />
              </div>
              <button
                onClick={handleNextStep2}
                className="w-full py-3 bg-stone-900 hover:bg-stone-800 text-white rounded-2xl font-bold transition-all cursor-pointer shadow-md"
              >
                Verify Answer
              </button>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4 text-sm">
              <p className="text-stone-600">Enter your new password below.</p>
              <div>
                <label className="text-xs font-bold uppercase text-stone-600 block mb-1">New Password</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-amber-500/20"
                  placeholder="••••••••"
                  autoFocus
                />
              </div>
              <button
                onClick={handleNextStep3}
                className="w-full py-3 bg-amber-600 hover:bg-amber-700 text-white rounded-2xl font-bold transition-all cursor-pointer shadow-md"
              >
                Save New Password
              </button>
            </div>
          )}

          {step === 4 && (
            <div className="text-center space-y-4 py-4">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center">
                <CheckCircle2 size={32} />
              </div>
              <h3 className="font-heading font-bold text-xl text-stone-900">
                Password Reset!
              </h3>
              <p className="text-sm text-stone-500">
                Your password has been successfully updated.
              </p>
              <button
                onClick={handleClose}
                className="w-full py-3 bg-stone-900 hover:bg-stone-800 text-white rounded-2xl font-bold transition-all cursor-pointer shadow-md"
              >
                Back to Sign In
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
