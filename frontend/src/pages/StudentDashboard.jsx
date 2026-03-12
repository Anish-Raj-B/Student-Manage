import React, { useEffect, useState } from 'react';
import api from '../api/api';
import { User, Book, MessageSquare, Menu, X, Bell, Clock, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const StudentDashboard = () => {
    const [profile, setProfile] = useState(null);
    const [attendanceLimit, setAttendanceLimit] = useState(75);
    const [announcements, setAnnouncements] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('profile');
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [feedback, setFeedback] = useState('');
    const [feedbackMsg, setFeedbackMsg] = useState('');
    const [submitting, setSubmitting] = useState(false);
    
    const navigate = useNavigate();

    const fetchDashboardData = async () => {
        try {
            const [profileRes, announcementsRes] = await Promise.all([
                api.get('/student/me'),
                api.get('/announcements')
            ]);
            setProfile(profileRes.data.profile);
            setAttendanceLimit(profileRes.data.attendanceLimit);
            setAnnouncements(announcementsRes.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
    };

    const handleFeedbackSubmit = async () => {
        if (!feedback.trim()) return;
        setSubmitting(true);
        try {
            await api.post('/student/feedback', { message: feedback });
            setFeedbackMsg('✅ Feedback submitted successfully!');
            setFeedback('');
        } catch (err) {
            setFeedbackMsg('❌ Failed to submit feedback.');
        } finally {
            setSubmitting(false);
            setTimeout(() => setFeedbackMsg(''), 4000);
        }
    };

    // Countdown Component
    const Countdown = ({ targetDate }) => {
        const calculateTimeLeft = () => {
            const difference = +new Date(targetDate) - +new Date();
            let timeLeft = {};

            if (difference > 0) {
                timeLeft = {
                    days: Math.floor(difference / (1000 * 60 * 60 * 24)),
                    hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
                    minutes: Math.floor((difference / 1000 / 60) % 60),
                    seconds: Math.floor((difference / 1000) % 60),
                };
            }
            return timeLeft;
        };

        const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

        useEffect(() => {
            const timer = setTimeout(() => {
                setTimeLeft(calculateTimeLeft());
            }, 1000);
            return () => clearTimeout(timer);
        });

        if (Object.keys(timeLeft).length === 0) return <span>Event Started!</span>;

        return (
            <span style={{ fontSize: '0.85rem', color: 'var(--primary)', fontWeight: '600' }}>
                {timeLeft.days}d {timeLeft.hours}h {timeLeft.minutes}m {timeLeft.seconds}s
            </span>
        );
    };

    if (loading) return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>Loading...</div>;

    const grades = profile?.grades || [];
    const totalPresent = grades.reduce((sum, g) => sum + (g.presentClasses || 0), 0);
    const totalClasses = grades.reduce((sum, g) => sum + (g.totalClasses || 0), 0);
    const overallAttendance = totalClasses > 0
        ? ((totalPresent / totalClasses) * 100).toFixed(1)
        : 0;

    const isLowAttendance = parseFloat(overallAttendance) < attendanceLimit;

    return (
        <div style={{ display: 'flex', minHeight: '100vh', background: '#f0f2f5' }}>
            {/* Sidebar */}
            <div style={{
                width: isSidebarOpen ? '260px' : '80px',
                background: '#1e293b',
                color: 'white',
                transition: 'all 0.3s',
                display: 'flex',
                flexDirection: 'column',
                position: 'fixed',
                top: 0,
                left: 0,
                height: '100vh',
                zIndex: 100
            }}>
                <div style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: isSidebarOpen ? 'space-between' : 'center' }}>
                    {isSidebarOpen && <span style={{ fontWeight: 'bold', fontSize: '1.2rem' }}>Portal</span>}
                    <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer' }}>
                        {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
                    </button>
                </div>

                <nav style={{ flex: 1, marginTop: '1rem' }}>
                    {[
                        { id: 'profile', icon: <User size={20} />, label: 'Profile Detail' },
                        { id: 'marks', icon: <Book size={20} />, label: 'Marks & Attendance' },
                        { id: 'feedback', icon: <MessageSquare size={20} />, label: 'Feedback' },
                    ].map(tab => (
                        <div
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            style={{
                                padding: '1rem 1.5rem',
                                display: 'flex',
                                alignItems: 'center',
                                cursor: 'pointer',
                                background: activeTab === tab.id ? '#334155' : 'transparent',
                                borderLeft: activeTab === tab.id ? '4px solid #6366f1' : '4px solid transparent',
                                gap: '1rem',
                                transition: '0.2s'
                            }}
                        >
                            {tab.icon}
                            {isSidebarOpen && <span>{tab.label}</span>}
                        </div>
                    ))}
                </nav>

                <div
                    onClick={handleLogout}
                    style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem', cursor: 'pointer', borderTop: '1px solid #334155' }}
                >
                    <LogOut size={20} />
                    {isSidebarOpen && <span>Logout</span>}
                </div>
            </div>

            {/* Main Content */}
            <div style={{ flex: 1, marginLeft: isSidebarOpen ? '260px' : '80px', transition: 'all 0.3s', padding: '2rem' }}>
                {/* Hero Section */}
                <div className="card" style={{
                    background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
                    color: 'white',
                    padding: '2.5rem',
                    marginBottom: '2rem',
                    border: 'none'
                }}>
                    <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Welcome, {profile?.user?.name}!</h1>
                    <p style={{ opacity: 0.9 }}>Track your academic progress and stay updated with campus events.</p>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem' }}>
                    <div>
                        {activeTab === 'profile' && (
                            <div className="card">
                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                                    <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <User size={30} color="#64748b" />
                                    </div>
                                    <div>
                                        <h3 style={{ margin: 0 }}>Student Information</h3>
                                        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Personal and Academic details</p>
                                    </div>
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                                    <div>
                                        <p style={{ fontSize: '0.85rem', color: '#64748b' }}>Full Name</p>
                                        <p style={{ fontWeight: '600' }}>{profile?.user?.name}</p>
                                    </div>
                                    <div>
                                        <p style={{ fontSize: '0.85rem', color: '#64748b' }}>USN / Roll Number</p>
                                        <p style={{ fontWeight: '600' }}>{profile?.rollNumber || 'Not Set'}</p>
                                    </div>
                                    <div>
                                        <p style={{ fontSize: '0.85rem', color: '#64748b' }}>Email Address</p>
                                        <p style={{ fontWeight: '600' }}>{profile?.user?.email}</p>
                                    </div>
                                    <div>
                                        <p style={{ fontSize: '0.85rem', color: '#64748b' }}>Course</p>
                                        <p style={{ fontWeight: '600' }}>{profile?.course || 'Not Set'}</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'marks' && (
                            <div className="card">
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                                    <h3>Marks & Attendance</h3>
                                    <div style={{ textAlign: 'right' }}>
                                        <p style={{ fontSize: '0.85rem', color: '#64748b' }}>Avg. Attendance</p>
                                        <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: isLowAttendance ? '#ef4444' : '#22c55e' }}>
                                            {overallAttendance}%
                                        </p>
                                    </div>
                                </div>
                                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                    <thead>
                                        <tr style={{ borderBottom: '1px solid var(--border)', textAlign: 'left' }}>
                                            <th style={{ padding: '1rem 0.5rem' }}>Subject</th>
                                            <th style={{ padding: '1rem 0.5rem' }}>Marks</th>
                                            <th style={{ padding: '1rem 0.5rem' }}>Attendance</th>
                                            <th style={{ padding: '1rem 0.5rem' }}>Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {grades.map((g, i) => {
                                            const pct = g.totalClasses > 0 ? ((g.presentClasses / g.totalClasses) * 100).toFixed(1) : 0;
                                            const low = parseFloat(pct) < attendanceLimit;
                                            return (
                                                <tr key={i} style={{ borderBottom: '1px solid var(--border)' }}>
                                                    <td style={{ padding: '1rem 0.5rem' }}>{g.subject}</td>
                                                    <td style={{ padding: '1rem 0.5rem', fontWeight: 'bold' }}>{g.marks}</td>
                                                    <td style={{ padding: '1rem 0.5rem' }}>{g.presentClasses}/{g.totalClasses} ({pct}%)</td>
                                                    <td style={{ padding: '1rem 0.5rem' }}>
                                                        <span style={{
                                                            padding: '0.25rem 0.5rem',
                                                            borderRadius: '6px',
                                                            fontSize: '0.75rem',
                                                            fontWeight: '600',
                                                            background: low ? '#fee2e2' : '#dcfce7',
                                                            color: low ? '#ef4444' : '#16a34a'
                                                        }}>
                                                            {low ? 'Low' : 'OK'}
                                                        </span>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        )}

                        {activeTab === 'feedback' && (
                            <div className="card">
                                <h3>Feedback</h3>
                                <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '1.5rem' }}>Submit your suggestions or complaints.</p>
                                <textarea
                                    value={feedback}
                                    onChange={(e) => setFeedback(e.target.value)}
                                    placeholder="Enter your feedback here..."
                                    style={{ width: '100%', height: '150px', padding: '1rem', border: '1px solid #e2e8f0', borderRadius: '8px', marginBottom: '1rem' }}
                                />
                                {feedbackMsg && <p style={{ marginBottom: '1rem' }}>{feedbackMsg}</p>}
                                <button
                                    onClick={handleFeedbackSubmit}
                                    disabled={submitting}
                                    className="btn btn-primary"
                                    style={{ width: '100%' }}
                                >
                                    {submitting ? 'Submitting...' : 'Send Feedback'}
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Right Panel - Announcements */}
                    <div>
                        <div className="card" style={{ padding: '1.5rem' }}>
                            <h4 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                                <Bell size={18} /> Announcements
                            </h4>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                {announcements.length > 0 ? announcements.map(ann => (
                                    <div key={ann._id} style={{ padding: '1rem', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                                        <h5 style={{ marginBottom: '0.25rem' }}>{ann.title}</h5>
                                        <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '0.75rem' }}>{ann.description}</p>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                            <Clock size={14} color="#64748b" />
                                            <Countdown targetDate={ann.eventDate} />
                                        </div>
                                    </div>
                                )) : <p style={{ fontSize: '0.85rem', color: '#64748b' }}>No upcoming events.</p>}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StudentDashboard;
