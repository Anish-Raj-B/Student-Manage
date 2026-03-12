const dns = require('dns');
dns.setServers(['8.8.8.8', '1.1.1.1']);

const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/student', require('./routes/studentRoutes'));
app.use('/api/instructor', require('./routes/instructorRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api/announcements', require('./routes/announcementRoutes'));

const PORT = process.env.PORT || 5000;

mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('MongoDB Connected Successfully'))
    .catch(err => {
        console.error('MongoDB Connection Error Details:');
        console.error(err);
        if (err.code === 'ECONNREFUSED' && err.syscall === 'querySrv') {
            console.error('TIP: This is a DNS issue. Try changing your DNS to 8.8.8.8 or using a VPN.');
        }
    });

app.get('/', (req, res) => {
    res.send('MERN Student Manager API is running...');
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
