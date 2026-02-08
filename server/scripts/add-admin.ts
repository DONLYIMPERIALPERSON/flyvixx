import 'reflect-metadata';
import { AppDataSource } from '../src/config/database';
import { Admin, AdminStatus } from '../src/models/Admin';
import { logger } from '../src/utils/logger';

async function addAdmin(email: string, name?: string) {
    try {
        // Initialize database connection
        await AppDataSource.initialize();
        logger.info('Database connection established');

        const adminRepository = AppDataSource.getRepository(Admin);

        // Check if admin already exists
        const existingAdmin = await adminRepository.findOne({ where: { email } });
        if (existingAdmin) {
            logger.warn(`Admin with email ${email} already exists`);
            return;
        }

        // Create new admin
        const admin = new Admin();
        admin.id = `admin_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        admin.email = email;
        admin.name = name;
        admin.status = AdminStatus.ACTIVE;

        // Save admin to database
        await adminRepository.save(admin);

        logger.info(`✅ Admin added successfully:`);
        logger.info(`   ID: ${admin.id}`);
        logger.info(`   Email: ${admin.email}`);
        logger.info(`   Name: ${admin.name || 'Not provided'}`);
        logger.info(`   Status: ${admin.status}`);

    } catch (error) {
        logger.error('❌ Failed to add admin:', error);
        throw error;
    } finally {
        // Close database connection
        await AppDataSource.destroy();
    }
}

// Get command line arguments
const args = process.argv.slice(2);
const email = args[0];
const name = args[1];

if (!email) {
    console.log('Usage: npm run add-admin <email> [name]');
    console.log('Example: npm run add-admin admin@flyvixx.com "Admin User"');
    process.exit(1);
}

addAdmin(email, name)
    .then(() => {
        console.log('\n🎉 Admin registration completed!');
        process.exit(0);
    })
    .catch((error) => {
        console.error('\n💥 Admin registration failed:', error);
        process.exit(1);
    });