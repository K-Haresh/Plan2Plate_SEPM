'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';

export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: '',
  });
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const token = searchParams.get('token');
  const email = searchParams.get('email');

  useEffect(() => {
    if (!token || !email) {
      setMessage('Invalid reset link. Please request a new password reset.');
    }
  }, [token, email]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');
    setIsLoading(true);

    if (formData.password !== formData.confirmPassword) {
      setMessage('Passwords do not match');
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token,
          email,
          password: formData.password,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage('Password reset successful! Redirecting to login...');
        setTimeout(() => {
          router.push('/');
        }, 2000);
      } else {
        setMessage(data.error || 'Failed to reset password. Please try again.');
      }
    } catch (error) {
      setMessage('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-200 flex flex-col justify-center items-center px-4 py-12">
      <div className="max-w-xl w-full space-y-8">
        <div className="flex flex-col items-center">
          <div className="w-80 h-80 relative mb-8">
            <Image
              src="/images/plan2plate.jpg"
              alt="Plan2Plate"
              fill
              className="object-contain transform hover:scale-105 transition-transform duration-300"
              priority
              quality={100}
            />
          </div>
          <h2 className="text-4xl font-bold text-gray-900 mb-2">Reset Password</h2>
          <p className="text-gray-600 text-center max-w-sm">
            Enter your new password below.
          </p>
        </div>

        {message && (
          <div className={`border-l-4 p-4 rounded-md shadow-sm ${
            message.toLowerCase().includes('successful')
              ? 'bg-green-50 border-green-500 text-green-700'
              : 'bg-blue-50 border-blue-500 text-blue-700'
          }`}>
            {message}
          </div>
        )}

        <div className="bg-white p-8 rounded-xl shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                New Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                value={formData.password}
                onChange={handleChange}
                className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                placeholder="Enter your new password"
                disabled={isLoading || !token || !email}
                minLength={6}
              />
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                Confirm New Password
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                required
                value={formData.confirmPassword}
                onChange={handleChange}
                className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                placeholder="Confirm your new password"
                disabled={isLoading || !token || !email}
                minLength={6}
              />
            </div>

            <button
              type="submit"
              className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white transition-colors ${
                isLoading || !token || !email
                  ? 'bg-indigo-400 cursor-not-allowed'
                  : 'bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'
              }`}
              disabled={isLoading || !token || !email}
            >
              {isLoading ? 'Resetting Password...' : 'Reset Password'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
} 