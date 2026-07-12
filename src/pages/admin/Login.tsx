import { useState } from 'react';
import type { FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Lock, Mail, Loader2, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

export default function Login() {
  const { signIn, isAdmin } = useAuth();
  const navigate             = useNavigate();
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [loading,  setLoading]  = useState(false);
  const [showPass, setShowPass] = useState(false);

  if (isAdmin) { navigate('/admin'); return null; }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await signIn(email, password);
      toast.success('Connexion réussie !');
      navigate('/admin');
    } catch {
      toast.error('Email ou mot de passe incorrect');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg-deep flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        {/* Logo */}
        <div className="text-center mb-10">
          <img src="/logo.jpg" alt="Davis Sono Shop" className="w-16 h-16 rounded-2xl bg-white object-cover mx-auto mb-4" />
          <h1 className="text-3xl font-heading font-bold text-white">Davis Sono</h1>
          <p className="text-muted mt-1">Administration</p>
        </div>

        <div className="card p-8">
          <h2 className="text-xl font-heading font-semibold text-white mb-6 text-center">
            Connexion
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm text-muted mb-2">Email</label>
              <div className="relative">
                <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" />
                <input
                  type="email"
                  className="input pl-10"
                  placeholder="admin@davissono.tg"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm text-muted mb-2">Mot de passe</label>
              <div className="relative">
                <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" />
                <input
                  type={showPass ? 'text' : 'password'}
                  className="input pl-10 pr-10"
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  aria-label={showPass ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-muted hover:text-white"
                >
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full justify-center mt-6"
            >
              {loading ? <Loader2 size={18} className="animate-spin" /> : <Lock size={18} />}
              {loading ? 'Connexion…' : 'Se connecter'}
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
