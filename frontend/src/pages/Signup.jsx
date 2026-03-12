import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff, Check, X } from 'lucide-react';
import { register } from '../api/api';

const Signup = () => {
    const [formData, setFormData] = useState({ name: '', email: '', password: '', role: 'student' });
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
        if (!isPasswordValid) {
            setError('Please meet all password criteria');
            return;
        }
        try {
            const { data } = await register(formData);
            localStorage.setItem('user', JSON.stringify(data));
            localStorage.setItem('token', data.token);
            if (data.role === 'admin') navigate('/admin-dashboard');
            else if (data.role === 'instructor') navigate('/instructor-dashboard');
            else navigate('/student-dashboard');
            window.location.reload();
        } catch (err) {
            setError(err.response?.data?.message || 'Registration failed');
        }
    };

    return (
        <div style={{ maxWidth: '400px', margin: '0 auto' }}>
            <div className="card">
                <h2 style={{ marginBottom: '1.5rem', textAlign: 'center' }}>Create Account</h2>
                {error && <p style={{ color: '#ef4444', marginBottom: '1rem' }}>{error}</p>}
                <form onSubmit={handleSubmit}>
                    <div className="input-group">
                        <label>Name</label>
                        <input type="text" required value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
                    </div>
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
                    <div className="input-group">
                        <label>Role</label>
                        <select value={formData.role} onChange={(e) => setFormData({ ...formData, role: e.target.value })}>
                            <option value="student">Student</option>
                            <option value="instructor">Instructor</option>
                        </select>
                    </div>
                    <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={!isPasswordValid}>Register</button>
                </form>
                <div style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '0.875rem' }}>
                    <p>Already have an account? <Link to="/login" style={{ color: 'var(--primary)', textDecoration: 'none' }}>Login</Link></p>
                </div>
            </div>
        </div>
    );
};

export default Signup;
