import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { forgotPassword } from '../api/api';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await forgotPassword({ email });
            setMessage('If an account exists for this email, we have sent a reset link.');
        } catch (err) {
            setMessage('Something went wrong. Please try again.');
        }
    };

    return (
        <div style={{ maxWidth: '400px', margin: '0 auto' }}>
            <div className="card">
                <h2 style={{ marginBottom: '1.5rem', textAlign: 'center' }}>Reset Password</h2>
                {message && <p style={{ color: message.includes('Reset link sent') || message.includes('account exists') ? '#10b981' : '#ef4444', marginBottom: '1rem' }}>{message}</p>}
                <form onSubmit={handleSubmit}>
                    <div className="input-group">
                        <label>Email Address</label>
                        <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
                    </div>
                    <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>Send Link</button>
                </form>
                <div style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '0.875rem' }}>
                    <p><Link to="/login" style={{ color: 'var(--primary)', textDecoration: 'none' }}>Back to Login</Link></p>
                </div>
            </div>
        </div>
    );
};

export default ForgotPassword;
