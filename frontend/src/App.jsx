import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Login from './pages/Login';
import Signup from './pages/Signup';
import ForgotPassword from './pages/ForgotPassword';
import StudentDashboard from './pages/StudentDashboard';
import InstructorDashboard from './pages/InstructorDashboard';
import AdminDashboard from './pages/AdminDashboard';
import Navbar from './components/Navbar';

function AppContent() {
    const userStr = localStorage.getItem('user');
    const user = userStr ? JSON.parse(userStr) : null;
    const location = useLocation();

    // Routes that should NOT have the global navbar and container padding
    const isDashboard = location.pathname.includes('dashboard');

    return (
        <>
            {!isDashboard && <Navbar />}
            <div className={isDashboard ? "" : "container"} style={isDashboard ? {} : { marginTop: '2rem' }}>
                <Routes>
                    <Route path="/login" element={<Login />} />
                    <Route path="/signup" element={<Signup />} />
                    <Route path="/forgot-password" element={<ForgotPassword />} />

                    <Route
                        path="/student-dashboard"
                        element={user?.role === 'student' ? <StudentDashboard /> : <Navigate to="/login" />}
                    />
                    <Route
                        path="/instructor-dashboard"
                        element={user?.role === 'instructor' ? <InstructorDashboard /> : <Navigate to="/login" />}
                    />
                    <Route
                        path="/admin-dashboard"
                        element={(user?.role === 'admin' || user?.user?.role === 'admin') ? <AdminDashboard /> : <Navigate to="/login" />}
                    />

                    <Route path="/" element={<Navigate to="/login" />} />
                </Routes>
            </div>
        </>
    );
}

function App() {
    return (
        <Router>
            <AppContent />
        </Router>
    );
}

export default App;
