import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import styles from './AuthPage.module.css';

export function RegisterPage() {
  const { register } = useAuth();
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await register(username);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h1 className={styles.title}>notg-reader</h1>
        <p className={styles.subtitle}>Create your account</p>

        <form onSubmit={handleSubmit} className={styles.form}>
          <label className={styles.label}>
            Username
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className={styles.input}
              required
              minLength={3}
              maxLength={50}
              pattern="^[a-zA-Z0-9_-]+$"
              title="Letters, numbers, hyphens, and underscores only"
              autoFocus
            />
          </label>

          {error && <p className={styles.error}>{error}</p>}

          <button type="submit" disabled={loading} className={styles.button}>
            {loading ? 'Setting up...' : 'Create Account'}
          </button>
        </form>

        <p className={styles.link}>
          Already have an account? <Link to="/login">Sign In</Link>
        </p>
      </div>
    </div>
  );
}
