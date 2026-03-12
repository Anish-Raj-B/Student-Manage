import React, { useEffect, useState } from 'react';
import api from '../api/api';
import { Trash, Edit, Settings as SettingsIcon, Bell, Plus, Clock, X, LayoutDashboard, Menu, LogOut, Users, MessageSquare } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const AdminDashboard = () => {
    const [users, setUsers] = useState([]);
    const [announcements, setAnnouncements] = useState([]);
    const [feedback, setFeedback] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);
    const [selectedFeedback, setSelectedFeedback] = useState(null);
    const [editFeedbackMsg, setEditFeedbackMsg] = useState('');
    const [editName, setEditName] = useState('');
    const [editEmail, setEditEmail] = useState('');
    const [editRole, setEditRole] = useState('');
    const [editRollNumber, setEditRollNumber] = useState('');

    // Attendance Settings
    const [attendanceLimit, setAttendanceLimit] = useState(75);
    const [editLimit, setEditLimit] = useState(75);
    const [settingsSaved, setSettingsSaved] = useState('');

    // Announcement State
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [eventDate, setEventDate] = useState('');
    const [showAnnounceModal, setShowAnnounceModal] = useState(false);
    
    const [loading, setLoading] = useState(true);

    // Sidebar/Tab State
    const [activeTab, setActiveTab] = useState('users');
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);

    const userStr = localStorage.getItem('user');
    const user = userStr ? JSON.parse(userStr) : null;
    const navigate = useNavigate();

    const fetchData = async () => {
        try {
            const [usersRes, settingsRes, announcementsRes, feedbackRes] = await Promise.all([
                api.get('/admin/users'),
                api.get('/admin/settings'),
                api.get('/announcements'),
                api.get('/admin/feedback')
            ]);
            setUsers(usersRes.data);
            setAttendanceLimit(settingsRes.data.attendanceLimit);
            setEditLimit(settingsRes.data.attendanceLimit);
            setAnnouncements(announcementsRes.data);
            setFeedback(feedbackRes.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this user?')) {
            try {
                await api.delete(`/admin/user/${id}`);
                fetchData();
            } catch (err) {
                alert('Delete failed');
            }
        }
    };

    const handleUpdateUser = async () => {
        try {
            await api.put(`/admin/user/${selectedUser._id}`, {
                name: editName,
                email: editEmail,
                role: editRole,
                rollNumber: editRole === 'student' ? editRollNumber : undefined
            });
            setSelectedUser(null);
            fetchData();
        } catch (err) {
            alert('Update failed');
        }
    };

    const handleSaveSettings = async () => {
        try {
            await api.put('/admin/settings', { attendanceLimit: editLimit });
            setAttendanceLimit(editLimit);
            setSettingsSaved('✅ Saved!');
            setTimeout(() => setSettingsSaved(''), 3000);
        } catch (err) {
            alert('Setting update failed');
        }
    };

    const handleAddAnnouncement = async (e) => {
        e.preventDefault();
        try {
            await api.post('/announcements', { title, description, eventDate });
            setTitle('');
            setDescription('');
            setEventDate('');
            setShowAnnounceModal(false);
            fetchData();
        } catch (err) {
            alert('Failed to add announcement');
        }
    };

    const deleteAnnouncement = async (id) => {
        if (window.confirm('Delete this announcement?')) {
            try {
                await api.delete(`/announcements/${id}`);
                fetchData();
            } catch (err) {
                alert('Delete failed');
            }
        }
    };

    const handleDeleteFeedback = async (id) => {
        if (window.confirm('Are you sure you want to delete this feedback?')) {
            try {
                await api.delete(`/admin/feedback/${id}`);
                fetchData();
            } catch (err) {
                alert('Delete failed');
            }
        }
    };

    const handleUpdateFeedback = async () => {
        try {
            await api.put(`/admin/feedback/${selectedFeedback._id}`, { message: editFeedbackMsg });
            setSelectedFeedback(null);
            fetchData();
        } catch (err) {
            alert('Update failed');
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
            const timer = setTimeout(() => setTimeLeft(calculateTimeLeft()), 1000);
            return () => clearTimeout(timer);
        });
        if (Object.keys(timeLeft).length === 0) return <span>Started!</span>;
        return (
            <span style={{ fontSize: '0.8rem', color: '#6366f1', fontWeight: 'bold' }}>
                {timeLeft.days}d {timeLeft.hours}h {timeLeft.minutes}m {timeLeft.seconds}s
            </span>
        );
    };

    if (loading) return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>Loading Admin Portal...</div>;

    return (
        <div style={{ display: 'flex', minHeight: '100vh', background: '#f8fafc' }}>
            {/* Sidebar */}
            <div style={{
                width: isSidebarOpen ? '260px' : '80px',
                background: '#1e1b4b',
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
                    {isSidebarOpen && <span style={{ fontWeight: 'bold', fontSize: '1.2rem' }}>Administrator</span>}
                    <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer' }}>
                        {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
                    </button>
                </div>

                <nav style={{ flex: 1, marginTop: '1rem' }}>
                    {[
                        { id: 'users', icon: <Users size={20} />, label: 'User Management' },
                        { id: 'settings', icon: <SettingsIcon size={20} />, label: 'Settings' },
                        { id: 'announcements', icon: <Bell size={20} />, label: 'Announcements' },
                        { id: 'feedback', icon: <MessageSquare size={20} />, label: 'Student Feedback' },
                    ].map(tab => (
                        <div
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            style={{
                                padding: '1rem 1.5rem',
                                display: 'flex',
                                alignItems: 'center',
                                cursor: 'pointer',
                                background: activeTab === tab.id ? '#312e81' : 'transparent',
                                borderLeft: activeTab === tab.id ? '4px solid #818cf8' : '4px solid transparent',
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
                    style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem', cursor: 'pointer', borderTop: '1px solid #312e81' }}
                >
                    <LogOut size={20} />
                    {isSidebarOpen && <span>Logout</span>}
                </div>
            </div>

            {/* Main Content */}
            <div style={{ flex: 1, marginLeft: isSidebarOpen ? '260px' : '80px', transition: 'all 0.3s', padding: '2rem' }}>
                {/* Hero Section */}
                <div className="card" style={{
                    background: 'linear-gradient(135deg, #4338ca 0%, #6366f1 100%)',
                    color: 'white',
                    padding: '2.5rem',
                    marginBottom: '2rem',
                    border: 'none'
                }}>
                    <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Welcome, {user?.name}!</h1>
                    <p style={{ opacity: 0.9 }}>Administrator Dashboard — Manage system users, configuration, and official announcements.</p>
                </div>

                <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
                    {activeTab === 'users' && (
                        <div className="card">
                            <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                <LayoutDashboard size={22} color="#4f46e5" /> User Management
                            </h3>
                            <div style={{ overflowX: 'auto' }}>
                                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                    <thead>
                                        <tr style={{ borderBottom: '1px solid var(--border)', textAlign: 'left', color: '#64748b' }}>
                                            <th style={{ padding: '1rem 0.5rem' }}>Name</th>
                                            <th style={{ padding: '1rem 0.5rem' }}>Email</th>
                                            <th style={{ padding: '1rem 0.5rem' }}>Role</th>
                                            <th style={{ padding: '1rem 0.5rem' }}>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {users.map((u) => (
                                            <tr key={u._id} style={{ borderBottom: '1px solid var(--border)' }}>
                                                <td style={{ padding: '1rem 0.5rem', fontWeight: '500' }}>{u.name}</td>
                                                <td style={{ padding: '1rem 0.5rem' }}>{u.email}</td>
                                                <td style={{ padding: '1rem 0.5rem' }}>
                                                    <span style={{ fontSize: '0.75rem', fontWeight: 'bold', padding: '0.2rem 0.6rem', borderRadius: '12px', background: '#e2e8f0', color: '#475569', textTransform: 'capitalize' }}>
                                                        {u.role}
                                                    </span>
                                                </td>
                                                <td style={{ padding: '1rem 0.5rem', display: 'flex', gap: '0.5rem' }}>
                                                    <button onClick={() => {
                                                        setSelectedUser(u);
                                                        setEditName(u.name);
                                                        setEditEmail(u.email);
                                                        setEditRole(u.role);
                                                        setEditRollNumber(u.rollNumber || '');
                                                    }} className="btn" style={{ padding: '0.4rem', background: '#3b82f6', color: 'white' }}>
                                                        <Edit size={16} />
                                                    </button>
                                                    <button onClick={() => handleDelete(u._id)} className="btn" style={{ padding: '0.4rem', background: '#fee2e2', color: '#ef4444' }}>
                                                        <Trash size={16} />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {activeTab === 'settings' && (
                        <div className="card" style={{ maxWidth: '600px' }}>
                            <h4 style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
                                <SettingsIcon size={20} color="#4f46e5" /> Attendance Configuration
                            </h4>
                            <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '1.5rem' }}>Define the minimum attendance percentage required for students to be marked as \"Status: OK\".</p>
                            <div className="input-group">
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>Attendance Limit (%)</label>
                                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                                    <input type="number" min="0" max="100" value={editLimit} onChange={(e) => setEditLimit(e.target.value)} style={{ width: '100px', padding: '0.75rem', borderRadius: '8px', border: '1px solid #e2e8f0' }} />
                                    <button onClick={handleSaveSettings} className="btn btn-primary" style={{ padding: '0.75rem 1.5rem' }}>Update Limit</button>
                                </div>
                                {settingsSaved && <p style={{ fontSize: '0.8rem', color: '#16a34a', marginTop: '0.75rem' }}>{settingsSaved}</p>}
                            </div>
                        </div>
                    )}

                    {activeTab === 'announcements' && (
                        <div className="card">
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                                <h4 style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                    <Bell size={20} color="#4f46e5" /> Announcement Management
                                </h4>
                                <button onClick={() => setShowAnnounceModal(true)} style={{ background: '#4f46e5', color: 'white', border: 'none', padding: '0.5rem 1rem', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem' }}>
                                    <Plus size={18} /> New Announcement
                                </button>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' }}>
                                {announcements.length > 0 ? announcements.map(ann => (
                                    <div key={ann._id} style={{ padding: '1.25rem', borderRadius: '12px', background: 'white', border: '1px solid #e2e8f0', position: 'relative', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
                                        <h5 style={{ fontSize: '1.05rem', marginBottom: '0.5rem', paddingRight: '25px', color: '#1e1b4b' }}>{ann.title}</h5>
                                        <p style={{ fontSize: '0.9rem', color: '#64748b', marginBottom: '1rem', lineHeight: '1.5' }}>{ann.description}</p>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '1rem', borderTop: '1px solid #f1f5f9' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                                <Clock size={14} color="#6366f1" />
                                                <Countdown targetDate={ann.eventDate} />
                                            </div>
                                            <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{new Date(ann.eventDate).toLocaleDateString()}</span>
                                        </div>
                                        <button onClick={() => deleteAnnouncement(ann._id)} style={{ position: 'absolute', top: '15px', right: '15px', background: 'none', border: 'none', color: '#cbd5e1', cursor: 'pointer', transition: 'color 0.2s' }} onMouseOver={(e) => e.target.style.color = '#ef4444'} onMouseOut={(e) => e.target.style.color = '#cbd5e1'}>
                                            <X size={20} />
                                        </button>
                                    </div>
                                )) : <p style={{ textAlign: 'center', color: '#94a3b8', padding: '3rem' }}>No announcements published yet.</p>}
                            </div>
                        </div>
                    )}

                    {activeTab === 'feedback' && (
                        <div className="card">
                            <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                <MessageSquare size={22} color="#4f46e5" /> Student Feedback
                            </h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                {feedback.length > 0 ? feedback.map(item => (
                                    <div key={item._id} style={{ padding: '1.5rem', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0', position: 'relative' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                            <h5 style={{ fontSize: '1.1rem', color: '#1e1b4b' }}>{item.studentName || 'Anonymous'}</h5>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                                <span style={{ fontSize: '0.8rem', color: '#64748b' }}>{new Date(item.submittedAt).toLocaleDateString()}</span>
                                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                    <button onClick={() => {
                                                        setSelectedFeedback(item);
                                                        setEditFeedbackMsg(item.message);
                                                    }} style={{ background: 'none', border: 'none', color: '#3b82f6', cursor: 'pointer' }}><Edit size={16} /></button>
                                                    <button onClick={() => handleDeleteFeedback(item._id)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer' }}><Trash size={16} /></button>
                                                </div>
                                            </div>
                                        </div>
                                        <p style={{ fontSize: '1rem', color: '#334155', lineHeight: '1.6' }}>{item.message}</p>
                                    </div>
                                )) : <p style={{ textAlign: 'center', color: '#94a3b8', padding: '3rem' }}>No student feedback found.</p>}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Edit User Modal */}
            {selectedUser && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15, 23, 42, 0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(4px)' }}>
                    <div className="card" style={{ width: '100%', maxWidth: '500px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                            <h3>Edit User Settings</h3>
                            <button onClick={() => setSelectedUser(null)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X /></button>
                        </div>
                        <div className="input-group">
                            <label>Name</label>
                            <input value={editName} onChange={(e) => setEditName(e.target.value)} />
                        </div>
                        <div className="input-group">
                            <label>Email</label>
                            <input value={editEmail} onChange={(e) => setEditEmail(e.target.value)} />
                        </div>
                        <div className="input-group">
                            <label>System Role</label>
                            <select value={editRole} onChange={(e) => setEditRole(e.target.value)} style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #e2e8f0', background: 'white' }}>
                                <option value="student">Student</option>
                                <option value="instructor">Instructor</option>
                                <option value="admin">Admin</option>
                            </select>
                        </div>
                        {editRole === 'student' && (
                            <div className="input-group">
                                <label>Roll Number / USN</label>
                                <input value={editRollNumber} onChange={(e) => setEditRollNumber(e.target.value)} />
                            </div>
                        )}
                        <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
                            <button onClick={handleUpdateUser} className="btn btn-primary" style={{ flex: 1 }}>Apply Changes</button>
                            <button onClick={() => setSelectedUser(null)} className="btn" style={{ flex: 1, background: '#f1f5f9', color: '#475569' }}>Cancel</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Edit Feedback Modal */}
            {selectedFeedback && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15, 23, 42, 0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(4px)' }}>
                    <div className="card" style={{ width: '100%', maxWidth: '500px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                            <h3>Edit Feedback</h3>
                            <button onClick={() => setSelectedFeedback(null)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X /></button>
                        </div>
                        <div className="input-group">
                            <label>Feedback Message</label>
                            <textarea value={editFeedbackMsg} onChange={(e) => setEditFeedbackMsg(e.target.value)} style={{ width: '100%', height: '150px', padding: '0.75rem', borderRadius: '8px', border: '1px solid #e2e8f0', outline: 'none', fontFamily: 'inherit' }} />
                        </div>
                        <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
                            <button onClick={handleUpdateFeedback} className="btn btn-primary" style={{ flex: 1 }}>Update Feedback</button>
                            <button onClick={() => setSelectedFeedback(null)} className="btn" style={{ flex: 1, background: '#f1f5f9', color: '#475569' }}>Cancel</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Announcement Creation Modal */}
            {showAnnounceModal && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15, 23, 42, 0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(4px)' }}>
                    <div className="card" style={{ width: '100%', maxWidth: '450px' }}>
                        <h3>Create Announcement</h3>
                        <form onSubmit={handleAddAnnouncement} style={{ marginTop: '1.5rem' }}>
                            <div className="input-group">
                                <label>Title of Event</label>
                                <input required value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Enter a descriptive title" />
                            </div>
                            <div className="input-group">
                                <label>Detailed Description</label>
                                <textarea required value={description} onChange={(e) => setDescription(e.target.value)} style={{ width: '100%', height: '100px', padding: '0.75rem', borderRadius: '8px', border: '1px solid #e2e8f0', outline: 'none', fontFamily: 'inherit' }} />
                            </div>
                            <div className="input-group">
                                <label>Scheduled Date & Time</label>
                                <input required type="datetime-local" value={eventDate} onChange={(e) => setEventDate(e.target.value)} style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #e2e8f0' }} />
                            </div>
                            <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
                                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>Publish Event</button>
                                <button type="button" onClick={() => setShowAnnounceModal(false)} className="btn" style={{ flex: 1, background: '#f1f5f9', color: '#475569' }}>Discard</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminDashboard;
