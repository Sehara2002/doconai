'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';

// Create a separate component for the reset password form
function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get('token');

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!token) {
      setError('Invalid or missing reset token.');
    }
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (!newPassword || !confirmPassword) {
      setError('Please fill in both fields.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/user/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token,
          new_password: newPassword,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setMessage('Password reset successful! Redirecting to login...');
        setTimeout(() => router.push('/Client/Login'), 3000);
      } else {
        setError(data.detail || 'Reset failed.');
      }
    } catch (err) {
      setError('Something went wrong. Please try again.');
    }

    setLoading(false);
  };

  return (
    <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md">
      <h2 className="text-2xl font-bold mb-4 text-[#166394]">Reset Your Password</h2>

      {error && <p className="text-red-500 mb-2">{error}</p>}
      {message && <p className="text-green-600 mb-2">{message}</p>}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">New Password</label>
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="w-full px-4 py-2 mt-1 border rounded shadow"
            placeholder="********"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Confirm Password</label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full px-4 py-2 mt-1 border rounded shadow"
            placeholder="********"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-[#166394] text-white py-2 rounded hover:bg-[#1e4561] transition"
        >
          {loading ? 'Resetting...' : 'Reset Password'}
        </button>
      </form>
    </div>
  );
}

// Loading component for Suspense fallback
function LoadingFallback() {
  return (
    <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md">
      <div className="animate-pulse">
        <div className="h-8 bg-gray-200 rounded mb-4"></div>
        <div className="space-y-4">
          <div>
            <div className="h-4 bg-gray-200 rounded mb-2"></div>
            <div className="h-10 bg-gray-200 rounded"></div>
          </div>
          <div>
            <div className="h-4 bg-gray-200 rounded mb-2"></div>
            <div className="h-10 bg-gray-200 rounded"></div>
          </div>
          <div className="h-10 bg-gray-200 rounded"></div>
        </div>
      </div>
    </div>
  );
}

// Main page component wrapped with Suspense
export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-blue-100 to-blue-300 p-4">
      <Suspense fallback={<LoadingFallback />}>
        <ResetPasswordForm />
      </Suspense>
    </div>
  );
}