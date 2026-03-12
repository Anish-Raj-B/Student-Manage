import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff, Check, X } from 'lucide-react';
import { login } from '../api/api';

const Login = () => {
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const passwordCriteria = [
        { label: 'At least 8 characters', met: formData.password.length >= 8 },
        { label: 'One uppercase letter', met: /[A-Z]/.test(formData.password) },
        { label: 'One lowercase letter', met: /[a-z]/.test(formData.password) },
        { label: 'One number', met: /[0-9]/.test(formData.password) },
        { label: 'One special character', met: /[^A-Za-z0-9]/.test(formData.password) },
    ];

    const isPasswordValid = passwordCriteria.every(c => c.met);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const { data } = await login(formData);
            localStorage.setItem('user', JSON.stringify(data));
            localStorage.setItem('token', data.token);
            if (data.role === 'admin') navigate('/admin-dashboard');
            else if (data.role === 'instructor') navigate('/instructor-dashboard');
            else navigate('/student-dashboard');
            window.location.reload(); // Force reload to update navbar
        } catch (err) {
            setError(err.response?.data?.message || 'Login failed');
        }
    };

    return (
        <div style={{ maxWidth: '400px', margin: '0 auto' }}>
            <div className="card">
                <h2 style={{ marginBottom: '1.5rem', textAlign: 'center' }}>Welcome Back</h2>
                {error && <p style={{ color: '#ef4444', marginBottom: '1rem' }}>{error}</p>}
                <form onSubmit={handleSubmit}>
                    <div className="input-group">
                        <label>Email Address</label>
                        <input type="email" required value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
                    </div>
                    <div className="input-group">
                        <label>Password</label>
                        <div className="password-input-wrapper">
                            <input 
                                type={showPassword ? 'text' : 'password'} 
                                required 
                                value={formData.password} 
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })} 
                            />
                            <button 
                                type="button" 
                                className="password-toggle" 
                                onClick={() => setShowPassword(!showPassword)}
                                tabIndex="-1"
                            >
                                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                            </button>
                        </div>
                        <div className="password-criteria">
                            {passwordCriteria.map((c, i) => (
                                <div key={i} className={`criteria-item ${c.met ? 'valid' : ''}`}>
                                    {c.met ? <Check size={14} /> : <X size={14} />}
                                    <span>{c.label}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                    <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>Login</button>
                </form>
                <div style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '0.875rem' }}>
                    <p><Link to="/forgot-password" style={{ color: 'var(--primary)', textDecoration: 'none' }}>Forgot Password?</Link></p>
                    <p style={{ marginTop: '0.5rem' }}>Don't have an account? <Link to="/signup" style={{ color: 'var(--primary)', textDecoration: 'none' }}>Signup</Link></p>
                </div>
            </div>
        </div>
    );
};

export default Login;
