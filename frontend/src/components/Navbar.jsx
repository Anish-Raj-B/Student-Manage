import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Navbar = () => {
    const userStr = localStorage.getItem('user');
    const user = userStr ? JSON.parse(userStr) : null;
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        navigate('/login');
    };

    return (
        <nav className="navbar">
            <div className="container nav-content">
                <Link to="/" className="logo">StudentManager</Link>
                <div className="nav-links">
                    {user ? (
                        <>
                            <span>Welcome, {user.name}</span>
                            <button onClick={handleLogout} className="btn btn-primary" style={{ padding: '0.5rem 1rem' }}>Logout</button>
                        </>
                    ) : (
                        <>
                            <Link to="/login">Login</Link>
                            <Link to="/signup">Signup</Link>
                        </>
                    )}
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
