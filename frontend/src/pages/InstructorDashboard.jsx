import React, { useEffect, useState } from 'react';
import api from '../api/api';
import { User, Edit, X, LayoutDashboard, Bell, Clock, Menu, LogOut, MessageSquare } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const InstructorDashboard = () => {
    const [students, setStudents] = useState([]);
    const [announcements, setAnnouncements] = useState([]);
    const [feedback, setFeedback] = useState([]);
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [selectedStudentForProfile, setSelectedStudentForProfile] = useState(null);
    const [grades, setGrades] = useState([]);
    const [editName, setEditName] = useState('');
    const [editRollNumber, setEditRollNumber] = useState('');
    const [editCourse, setEditCourse] = useState('');
    const [loading, setLoading] = useState(true);
    
    // Sidebar/Tab State
    const [activeTab, setActiveTab] = useState('students');
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);

    const userStr = localStorage.getItem('user');
    const user = userStr ? JSON.parse(userStr) : null;
    const navigate = useNavigate();

    const fetchDashboardData = async () => {
        try {
            const [studentsRes, announcementsRes, feedbackRes] = await Promise.all([
                api.get('/instructor/students'),
                api.get('/announcements'),
                api.get('/instructor/feedback')
            ]);
            setStudents(studentsRes.data);
            setAnnouncements(announcementsRes.data);
            setFeedback(feedbackRes.data);
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

    const handleEditMarks = (student) => {
        setSelectedStudent(student);
        setGrades(
            student.grades.length > 0
                ? student.grades.map(g => ({
                    subject: g.subject,
                    marks: g.marks,
                    presentClasses: g.presentClasses || 0,
                    totalClasses: g.totalClasses || 0,
                }))
                : [{ subject: '', marks: 0, presentClasses: 0, totalClasses: 0 }]
        );
    };

    const handleEditProfile = (student) => {
        setSelectedStudentForProfile(student);
        setEditName(student.user?.name || '');
        setEditRollNumber(student.rollNumber || '');
        setEditCourse(student.course || '');
    };

    const handleUpdateMarks = async () => {
        try {
            await api.put(`/instructor/marks/${selectedStudent._id}`, { grades });
            setSelectedStudent(null);
            fetchDashboardData();
        } catch (err) {
            alert('Update failed');
        }
    };

    const handleUpdateProfile = async () => {
        try {
            await api.put(`/instructor/student/${selectedStudentForProfile._id}`, { 
                name: editName, 
                rollNumber: editRollNumber,
                course: editCourse
            });
            setSelectedStudentForProfile(null);
            fetchDashboardData();
        } catch (err) {
            alert('Update profile failed');
        }
    };

    const addGradeField = () => setGrades([...grades, { subject: '', marks: 0, presentClasses: 0, totalClasses: 0 }]);
    const removeGradeField = (index) => setGrades(grades.filter((_, i) => i !== index));

    const updateGrade = (index, field, value) => {
        const updated = [...grades];
        updated[index][field] = field === 'subject' ? value : Number(value);
        setGrades(updated);
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
            <span style={{ fontSize: '0.8rem', color: 'var(--primary)', fontWeight: '600' }}>
                {timeLeft.days}d {timeLeft.hours}h {timeLeft.minutes}m {timeLeft.seconds}s
            </span>
        );
    };

    if (loading) return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>Loading...</div>;

    return (
        <div style={{ display: 'flex', minHeight: '100vh', background: '#f8fafc' }}>
            {/* Sidebar */}
            <div style={{
                width: isSidebarOpen ? '260px' : '80px',
                background: '#0f172a',
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
                    {isSidebarOpen && <span style={{ fontWeight: 'bold', fontSize: '1.2rem' }}>Instructor</span>}
                    <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer' }}>
                        {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
                    </button>
                </div>

                <nav style={{ flex: 1, marginTop: '1rem' }}>
                    {[
                        { id: 'students', icon: <LayoutDashboard size={20} />, label: 'Manage Students' },
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
                                background: activeTab === tab.id ? '#1e293b' : 'transparent',
                                borderLeft: activeTab === tab.id ? '4px solid #0ea5e9' : '4px solid transparent',
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
                    style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem', cursor: 'pointer', borderTop: '1px solid #1e293b' }}
                >
                    <LogOut size={20} />
                    {isSidebarOpen && <span>Logout</span>}
                </div>
            </div>

            {/* Main Content */}
            <div style={{ flex: 1, marginLeft: isSidebarOpen ? '260px' : '80px', transition: 'all 0.3s', padding: '2rem' }}>
                {/* Hero Section */}
                <div className="card" style={{
                    background: 'linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)',
                    color: 'white',
                    padding: '2.5rem',
                    marginBottom: '2rem',
                    border: 'none'
                }}>
                    <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Welcome, {user?.name}!</h1>
                    <p style={{ opacity: 0.9 }}>Instructor Portal — Manage student records and view campus updates.</p>
                </div>

                <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
                    {activeTab === 'students' && (
                        <div className="card">
                            <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <LayoutDashboard size={20} /> Manage Students
                            </h3>
                            <div style={{ overflowX: 'auto' }}>
                                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                    <thead>
                                        <tr style={{ borderBottom: '1px solid var(--border)', textAlign: 'left', color: '#64748b' }}>
                                            <th style={{ padding: '1rem 0.5rem' }}>Name</th>
                                            <th style={{ padding: '1rem 0.5rem' }}>Roll No / USN</th>
                                            <th style={{ padding: '1rem 0.5rem' }}>Course</th>
                                            <th style={{ padding: '1rem 0.5rem' }}>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {students.map((student) => (
                                            <tr key={student._id} style={{ borderBottom: '1px solid var(--border)' }}>
                                                <td style={{ padding: '1rem 0.5rem' }}>{student.user?.name}</td>
                                                <td style={{ padding: '1rem 0.5rem' }}>{student.rollNumber || '—'}</td>
                                                <td style={{ padding: '1rem 0.5rem' }}>{student.course || '—'}</td>
                                                <td style={{ padding: '1rem 0.5rem', display: 'flex', gap: '0.5rem' }}>
                                                    <button onClick={() => handleEditProfile(student)} className="btn btn-secondary" style={{ padding: '0.4rem 0.75rem', fontSize: '0.85rem', background: '#e2e8f0' }}>
                                                        <Edit size={14} /> Profile
                                                    </button>
                                                    <button onClick={() => handleEditMarks(student)} className="btn btn-primary" style={{ padding: '0.4rem 0.75rem', fontSize: '0.85rem' }}>
                                                        <Edit size={14} /> Marks & Attendance
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {activeTab === 'announcements' && (
                        <div className="card">
                            <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <Bell size={20} /> Campus Announcements
                            </h3>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
                                {announcements.length > 0 ? announcements.map(ann => (
                                    <div key={ann._id} style={{ padding: '1.5rem', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
                                        <h5 style={{ fontSize: '1.1rem', marginBottom: '0.5rem', color: '#1e293b' }}>{ann.title}</h5>
                                        <p style={{ fontSize: '0.9rem', color: '#64748b', marginBottom: '1.25rem', lineHeight: '1.5' }}>{ann.description}</p>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', paddingTop: '1rem', borderTop: '1px dashed #e2e8f0' }}>
                                            <Clock size={16} color="#64748b" />
                                            <Countdown targetDate={ann.eventDate} />
                                        </div>
                                    </div>
                                )) : <p style={{ textAlign: 'center', color: '#94a3b8', padding: '2rem' }}>No upcoming events announced yet.</p>}
                            </div>
                        </div>
                    )}
                    
                    {activeTab === 'feedback' && (
                        <div className="card">
                            <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <MessageSquare size={20} /> Student Feedback
                            </h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                {feedback.length > 0 ? feedback.map(item => (
                                    <div key={item._id} style={{ padding: '1.5rem', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                            <h5 style={{ fontSize: '1.1rem', color: '#1e293b' }}>{item.studentName || 'Anonymous'}</h5>
                                            <span style={{ fontSize: '0.8rem', color: '#64748b' }}>{new Date(item.submittedAt).toLocaleDateString()}</span>
                                        </div>
                                        <p style={{ fontSize: '0.95rem', color: '#475569', lineHeight: '1.6' }}>{item.message}</p>
                                    </div>
                                )) : <p style={{ textAlign: 'center', color: '#94a3b8', padding: '2rem' }}>No student feedback received yet.</p>}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Edit Marks Modal */}
            {selectedStudent && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
                    <div className="card" style={{ width: '90%', maxWidth: '800px', maxHeight: '90vh', overflowY: 'auto' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                            <h3>Edit Records — {selectedStudent.user?.name}</h3>
                            <button onClick={() => setSelectedStudent(null)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X /></button>
                        </div>
                        
                        <div style={{ marginBottom: '1rem', display: 'grid', gridTemplateColumns: '2.5fr 1fr 1fr 1fr 50px', gap: '1rem', padding: '0 0.5rem', color: '#64748b', fontSize: '0.85rem', fontWeight: 'bold' }}>
                            <span>Subject</span>
                            <span>Marks</span>
                            <span>Present</span>
                            <span>Total</span>
                            <span></span>
                        </div>

                        {grades.map((g, i) => (
                            <div key={i} style={{ display: 'grid', gridTemplateColumns: '2.5fr 1fr 1fr 1fr 50px', gap: '1rem', marginBottom: '1rem', alignItems: 'center' }}>
                                <input placeholder="Subject" value={g.subject} onChange={(e) => updateGrade(i, 'subject', e.target.value)} style={{ padding: '0.75rem', borderRadius: '8px', border: '1px solid #e2e8f0', width: '100%' }} />
                                <input type="number" placeholder="Marks" value={g.marks} onChange={(e) => updateGrade(i, 'marks', e.target.value)} style={{ padding: '0.75rem', borderRadius: '8px', border: '1px solid #e2e8f0', width: '100%' }} />
                                <input type="number" placeholder="Present" value={g.presentClasses} onChange={(e) => updateGrade(i, 'presentClasses', e.target.value)} style={{ padding: '0.75rem', borderRadius: '8px', border: '1px solid #e2e8f0', width: '100%' }} />
                                <input type="number" placeholder="Total" value={g.totalClasses} onChange={(e) => updateGrade(i, 'totalClasses', e.target.value)} style={{ padding: '0.75rem', borderRadius: '8px', border: '1px solid #e2e8f0', width: '100%' }} />
                                <button onClick={() => removeGradeField(i)} style={{ background: '#fee2e2', color: '#ef4444', border: 'none', padding: '0.6rem', borderRadius: '8px', cursor: 'pointer', display: 'flex', justifyContent: 'center' }}><X size={18} /></button>
                            </div>
                        ))}

                        <button onClick={addGradeField} style={{ width: '100%', padding: '1rem', border: '2px dashed #e2e8f0', borderRadius: '8px', background: 'none', cursor: 'pointer', marginBottom: '1.5rem', color: '#64748b', fontWeight: '500' }}>
                            + Add Subject Slot
                        </button>

                        <div style={{ display: 'flex', gap: '1rem' }}>
                            <button onClick={handleUpdateMarks} className="btn btn-primary" style={{ flex: 1 }}>Save Records</button>
                            <button onClick={() => setSelectedStudent(null)} className="btn" style={{ flex: 1, background: '#ef4444', color: 'white' }}>Cancel</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Edit Profile Modal */}
            {selectedStudentForProfile && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
                    <div className="card" style={{ width: '100%', maxWidth: '450px' }}>
                        <h3>Edit Student Profile</h3>
                        <div style={{ marginTop: '1.5rem' }}>
                            <div className="input-group">
                                <label>Student Name</label>
                                <input value={editName} onChange={(e) => setEditName(e.target.value)} />
                            </div>
                            <div className="input-group">
                                <label>Roll Number / USN</label>
                                <input value={editRollNumber} onChange={(e) => setEditRollNumber(e.target.value)} />
                            </div>
                            <div className="input-group">
                                <label>Course</label>
                                <input value={editCourse} onChange={(e) => setEditCourse(e.target.value)} />
                            </div>
                            <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
                                <button onClick={handleUpdateProfile} className="btn btn-primary" style={{ flex: 1 }}>Save Changes</button>
                                <button onClick={() => setSelectedStudentForProfile(null)} className="btn" style={{ flex: 1, background: '#ef4444', color: 'white' }}>Cancel</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default InstructorDashboard;
