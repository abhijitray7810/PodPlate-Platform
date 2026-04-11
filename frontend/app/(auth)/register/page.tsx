'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { register } from '@/lib/auth';
import { useAuthStore } from '@/store/authStore';

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();
  const login = useAuthStore((state) => state.login);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const user = await register({ name, email, password });
      login(user);
      router.push('/');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Registration failed');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-400 to-red-500">
      <div className="bg-white p-8 rounded-2xl shadow-lg w-full max-w-md">
        <h1 className="text-3xl font-bold text-center mb-2">Create Account</h1>
        <p className="text-gray-500 text-center mb-6">Sign up to get started</p>
        {error && <p className="text-red-500 text-sm mb-4 text-center">{error}</p>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <input className="w-full border rounded-lg px-4 py-3" placeholder="Full name" value={name} onChange={e => setName(e.target.value)} required />
          <input className="w-full border rounded-lg px-4 py-3" placeholder="Email" type="email" value={email} onChange={e => setEmail(e.target.value)} required />
          <input className="w-full border rounded-lg px-4 py-3" placeholder="Password" type="password" value={password} onChange={e => setPassword(e.target.value)} required />
          <button className="w-full bg-gray-900 text-white py-3 rounded-lg font-semibold" type="submit">Create Account</button>
        </form>
        <p className="text-center mt-4 text-sm">Already have an account? <a href="/login" className="text-orange-500 font-semibold">Sign in</a></p>
      </div>
    </div>
  );
}
