const bcrypt = require('bcryptjs');
const User = require('../models/User');

const seedAdmin = async () => {
    try {
        const adminEmail = 'admin123@gmail.com';
        const adminPassword = 'Adminadmin@123#';
        const adminName = 'admin';

        let adminAccount = await User.findOne({ email: adminEmail });

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(adminPassword, salt);

        if (!adminAccount) {
            await User.create({
                name: adminName,
                email: adminEmail,
                password: hashedPassword,
                role: 'admin'
            });
            console.log('Admin user seeded successfully');
        } else {
            // Update password in case it needs to be reset to the one provided
            adminAccount.name = adminName;
            adminAccount.password = hashedPassword;
            adminAccount.role = 'admin';
            await adminAccount.save();
            console.log('Admin user updated successfully');
        }
    } catch (error) {
        console.error('Error seeding admin user:', error.message);
    }
};

module.exports = seedAdmin;
