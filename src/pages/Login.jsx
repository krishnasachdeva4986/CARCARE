// src/pages/Login.jsx
// Login and signup screens with real user registration via userStore.

import { useState } from 'react';
import { useApp } from '../context/AppContext';
// import { findUser, registerUser, emailExists } from '../data/userStore'; //delect krni h

export default function Login() {
  const { dispatch } = useApp();
  const [mode, setMode] = useState('login'); // 'login' | 'signup'
  const [form, setForm] = useState({
    name: '', phone: '', email: '', password: '', confirmPassword: '', remember: false,
    city: '', pincode: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  function update(field, value) {
    setForm(f => ({ ...f, [field]: value }));
    setError('');
  }

  // function handleSubmit(e) {
  //   e.preventDefault();
  //   setError('');

  //   if (mode === 'login') {
  //     if (!form.email || !form.password) {
  //       setError('Please enter your email and password.');
  //       return;
  //     }
  //     setLoading(true);
  //     setTimeout(() => {
  //       const user = findUser(form.email, form.password);
  //       setLoading(false);
  //       if (!user) {
  //         setError('Incorrect email or password. Please try again.');
  //         return;
  //       }
  //       dispatch({ type: 'LOGIN', payload: { user } });
  //     }, 700);
  //   } else {
  //     // Sign up
  //     if (!form.name || !form.email || !form.phone || !form.password || !form.city || !form.pincode) {
  //       setError('Please fill in all required fields.');
  //       return;
  //     }
  //     if (!/^\d{6}$/.test(form.pincode)) {
  //       setError('Enter a valid 6-digit pincode.');
  //       return;
  //     }
  //     if (form.password.length < 6) {
  //       setError('Password must be at least 6 characters.');
  //       return;
  //     }
  //     if (form.password !== form.confirmPassword) {
  //       setError('Passwords do not match.');
  //       return;
  //     }
  //     if (emailExists(form.email)) {
  //       setError('An account with this email already exists. Please sign in.');
  //       return;
  //     }
  //     setLoading(true);
  //     setTimeout(() => {
  //       const user = registerUser({
  //         name: form.name,
  //         email: form.email,
  //         phone: form.phone,
  //         password: form.password,
  //         city: form.city,
  //         pincode: form.pincode,
  //       });
  //       setLoading(false);
  //       dispatch({ type: 'LOGIN', payload: { user } });
  //     }, 900);
  //   }
  // }



  
  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    if (!form.email || !form.password) {
      setError('Please enter your email and password.');
      return;
    }

    if (mode === 'signup') {
      if (
        !form.name ||
        !form.phone ||
        !form.city ||
        !form.pincode
      ) {
        setError('Please fill in all required fields.');
        return;
      }

      if (!/^\d{6}$/.test(form.pincode)) {
        setError('Enter a valid 6-digit pincode.');
        return;
      }

      if (form.password.length < 6) {
        setError('Password must be at least 6 characters.');
        return;
      }

      if (form.password !== form.confirmPassword) {
        setError('Passwords do not match.');
        return;
      }
    }

    setLoading(true);

    try {
      const url =
        mode === 'signup'
          ? 'http://localhost:5000/signup'
          : 'http://localhost:5000/login';

      const body =
        mode === 'signup'
          ? {
              name: form.name,
              email: form.email,
              password: form.password,
              phone: form.phone,
              city: form.city,
              pincode: form.pincode
            }
          : {
              email: form.email,
              password: form.password
            };

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || 'Something went wrong.');
        return;
      }

      if (mode === 'signup') {
        setError('');
        setMode('login');
        setForm(f => ({
          ...f,
          password: '',
          confirmPassword: ''
        }));
        alert('Account created! Please sign in.');
      } else {
        dispatch({
          type: 'LOGIN',
          payload: { user: data.user }
        });
      }
    } catch (error) {
      setError('Cannot connect to server. Please try again.');
    } finally {
      setLoading(false);
    }
  }


  

  return (
    <div className="login-shell">
      {/* Left — branding */}
      <div className="login-left">
        <div className="login-brand">CarCare</div>
        <p className="login-tagline">Everything your car needs, in one place.</p>
        <div className="login-features">
          {[
            'Scheduled servicing at certified centers',
            'Doorstep pickup & drop service',
            'Emergency roadside assistance',
            'Community help from nearby drivers',
          ].map(f => (
            <div key={f} className="login-feature">
              <div className="login-feature-dot" />
              <span>{f}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Right — form */}
      <div className="login-right">
        <div className="login-form-container">
          {mode === 'login' ? (
            <>
              <h1 className="login-form-title">Welcome back</h1>
              <p className="login-form-sub">Sign in to your CarCare account</p>

              <form className="login-form-fields" onSubmit={handleSubmit}>
                <div className="form-group">
                  <label className="form-label" htmlFor="login-email">Email address</label>
                  <input
                    id="login-email"
                    type="email"
                    className="form-input"
                    placeholder="you@example.com"
                    value={form.email}
                    onChange={e => update('email', e.target.value)}
                    autoComplete="email"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="login-password">Password</label>
                  <input
                    id="login-password"
                    type="password"
                    className="form-input"
                    placeholder="Your password"
                    value={form.password}
                    onChange={e => update('password', e.target.value)}
                    autoComplete="current-password"
                  />
                </div>

                <div className="login-extras">
                  <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={form.remember}
                      onChange={e => update('remember', e.target.checked)}
                    />
                    Remember me
                  </label>
                  <span className="login-link" tabIndex={0}>Forgot password?</span>
                </div>

                {error && <p style={{ color: 'var(--color-red)', fontSize: '0.82rem' }}>{error}</p>}

                <button
                  type="submit"
                  className="btn btn-primary btn-full"
                  style={{ marginTop: 4, padding: '10px 0' }}
                  disabled={loading}
                  id="btn-sign-in"
                >
                  {loading ? 'Signing in…' : 'Sign In'}
                </button>
              </form>

              <p className="login-switch">
                Don't have an account?{' '}
                <span className="login-link" onClick={() => { setMode('signup'); setError(''); }} tabIndex={0}>
                  Create one
                </span>
              </p>
            </>
          ) : (
            <>
              <h1 className="login-form-title">Create account</h1>
              <p className="login-form-sub">Join CarCare — it's free to get started</p>

              <form className="login-form-fields" onSubmit={handleSubmit}>
                <div className="form-group">
                  <label className="form-label" htmlFor="signup-name">Full name</label>
                  <input
                    id="signup-name"
                    type="text"
                    className="form-input"
                    placeholder="Your full name"
                    value={form.name}
                    onChange={e => update('name', e.target.value)}
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label" htmlFor="signup-phone">Phone number</label>
                    <input
                      id="signup-phone"
                      type="tel"
                      className="form-input"
                      placeholder="+91 98765 43210"
                      value={form.phone}
                      onChange={e => update('phone', e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label" htmlFor="signup-email">Email address</label>
                    <input
                      id="signup-email"
                      type="email"
                      className="form-input"
                      placeholder="you@example.com"
                      value={form.email}
                      onChange={e => update('email', e.target.value)}
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label" htmlFor="signup-city">City / Area</label>
                    <input
                      id="signup-city"
                      type="text"
                      className="form-input"
                      placeholder="e.g., Chandigarh"
                      value={form.city}
                      onChange={e => update('city', e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label" htmlFor="signup-pincode">Pincode</label>
                    <input
                      id="signup-pincode"
                      type="text"
                      inputMode="numeric"
                      maxLength={6}
                      className="form-input"
                      placeholder="e.g., 160002"
                      value={form.pincode}
                      onChange={e => update('pincode', e.target.value.replace(/\D/g, '').slice(0, 6))}
                    />
                  </div>
                </div>
                <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: -6 }}>
                  We use this to find your nearest service center and assign the closest technician during emergencies.
                </p>

                <div className="form-group">
                  <label className="form-label" htmlFor="signup-password">Password</label>
                  <input
                    id="signup-password"
                    type="password"
                    className="form-input"
                    placeholder="Min. 6 characters"
                    value={form.password}
                    onChange={e => update('password', e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="signup-confirm">Confirm password</label>
                  <input
                    id="signup-confirm"
                    type="password"
                    className="form-input"
                    placeholder="Confirm your password"
                    value={form.confirmPassword}
                    onChange={e => update('confirmPassword', e.target.value)}
                  />
                </div>

                {error && <p style={{ color: 'var(--color-red)', fontSize: '0.82rem' }}>{error}</p>}

                <button
                  type="submit"
                  className="btn btn-primary btn-full"
                  style={{ padding: '10px 0' }}
                  disabled={loading}
                  id="btn-create-account"
                >
                  {loading ? 'Creating account…' : 'Create Account'}
                </button>
              </form>

              <p className="login-switch">
                Already have an account?{' '}
                <span className="login-link" onClick={() => { setMode('login'); setError(''); }} tabIndex={0}>
                  Sign in
                </span>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
