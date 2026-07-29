import { connectDatabase } from '../config/database';
import User from '../models/User';
import Hospital from '../models/Hospital';
import BloodBank from '../models/BloodBank';
import Donor from '../models/Donor';
import BloodInventory from '../models/BloodInventory';
import logger from '../utils/logger';

const BLOOD_GROUPS = ['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-'];

async function seedDatabase() {
  try {
    await connectDatabase();
    logger.info('Connected to MongoDB');

    // Clear existing data
    await User.deleteMany({});
    await Hospital.deleteMany({});
    await BloodBank.deleteMany({});
    await Donor.deleteMany({});
    await BloodInventory.deleteMany({});
    logger.info('Cleared existing data');

    // Create Hospital Users
    const hospitalUsers = await User.insertMany([
      {
        email: 'hospital1@example.com',
        password: 'SecurePass123!', // Will be hashed by pre-save hook
        name: 'St Mary Hospital',
        role: 'Hospital',
      },
      {
        email: 'hospital2@example.com',
        password: 'SecurePass123!',
        name: 'City Medical Center',
        role: 'Hospital',
      },
      {
        email: 'hospital3@example.com',
        password: 'SecurePass123!',
        name: 'Apollo Hospital',
        role: 'Hospital',
      },
    ]);

    // Create Blood Bank Users
    const bloodBankUsers = await User.insertMany([
      {
        email: 'bloodbank1@example.com',
        password: 'SecurePass123!',
        name: 'National Blood Bank',
        role: 'BloodBank',
      },
      {
        email: 'bloodbank2@example.com',
        password: 'SecurePass123!',
        name: 'Regional Blood Center',
        role: 'BloodBank',
      },
    ]);

    // Create Donor Users
    const donorUsers = await User.insertMany([
      {
        email: 'donor1@example.com',
        password: 'SecurePass123!',
        name: 'John Doe',
        role: 'Donor',
      },
      {
        email: 'donor2@example.com',
        password: 'SecurePass123!',
        name: 'Jane Smith',
        role: 'Donor',
      },
    ]);

    // Create Admin User
    const adminUser = await User.create({
      email: 'admin@example.com',
      password: 'AdminPass123!',
      name: 'Admin User',
      role: 'Admin',
    });

    logger.info(`Created ${hospitalUsers.length + bloodBankUsers.length + donorUsers.length + 1} users`);

    // Create Hospitals
    const hospitals = await Hospital.insertMany([
      {
        name: 'St Mary Hospital',
        email: hospitalUsers[0].email,
        phone: '+91-9876543210',
        city: 'Boston',
        state: 'MA',
        location: {
          type: 'Point',
          coordinates: [-71.0589, 42.3601],
        },
      },
      {
        name: 'City Medical Center',
        email: hospitalUsers[1].email,
        phone: '+91-9876543211',
        city: 'New York',
        state: 'NY',
        location: {
          type: 'Point',
          coordinates: [-74.006, 40.7128],
        },
      },
      {
        name: 'Apollo Hospital',
        email: hospitalUsers[2].email,
        phone: '+91-9876543212',
        city: 'San Francisco',
        state: 'CA',
        location: {
          type: 'Point',
          coordinates: [-122.4194, 37.7749],
        },
      },
    ]);

    logger.info(`Created ${hospitals.length} hospitals`);

    // Create Blood Banks
    const bloodBanks = await BloodBank.insertMany([
      {
        name: 'National Blood Bank',
        email: bloodBankUsers[0].email,
        phone: '+91-9876543213',
        city: 'Boston',
        state: 'MA',
        location: {
          type: 'Point',
          coordinates: [-71.0565, 42.3585],
        },
      },
      {
        name: 'Regional Blood Center',
        email: bloodBankUsers[1].email,
        phone: '+91-9876543214',
        city: 'New York',
        state: 'NY',
        location: {
          type: 'Point',
          coordinates: [-74.0075, 40.7110],
        },
      },
    ]);

    logger.info(`Created ${bloodBanks.length} blood banks`);

    // Create Donors
    const donors = await Donor.insertMany([
      {
        fullName: 'John Doe',
        email: donorUsers[0].email,
        phone: '+91-9876543220',
        bloodGroup: 'O+',
        age: 35,
        gender: 'Male',
        city: 'Boston',
        state: 'MA',
        location: {
          type: 'Point',
          coordinates: [-71.0589, 42.3601],
        },
        availabilityStatus: 'Available',
      },
      {
        fullName: 'Jane Smith',
        email: donorUsers[1].email,
        phone: '+91-9876543221',
        bloodGroup: 'A+',
        age: 28,
        gender: 'Female',
        city: 'New York',
        state: 'NY',
        location: {
          type: 'Point',
          coordinates: [-74.006, 40.7128],
        },
        availabilityStatus: 'Available',
      },
      ...Array.from({ length: 8 }, (_, i) => ({
        fullName: `Donor ${i + 3}`,
        email: `donor${i + 3}@example.com`,
        phone: `+91-987654${3220 + i}`,
        bloodGroup: BLOOD_GROUPS[i % BLOOD_GROUPS.length],
        age: 25 + (i % 40),
        gender: i % 2 === 0 ? 'Male' : 'Female',
        city: ['Boston', 'New York', 'San Francisco'][i % 3],
        state: ['MA', 'NY', 'CA'][i % 3],
        location: {
          type: 'Point',
          coordinates: [
            [-71.0589, 42.3601, -74.006, 40.7128, -122.4194, 37.7749][i % 6],
            [-71.0589, 42.3601, -74.006, 40.7128, -122.4194, 37.7749][i % 6],
          ],
        },
        availabilityStatus: 'Available',
      })),
    ]);

    logger.info(`Created ${donors.length} donors`);

    // Create Blood Inventory
    const inventoryItems = [];
    for (const hospital of hospitals) {
      for (const bloodGroup of BLOOD_GROUPS) {
        const expiryDate = new Date();
        expiryDate.setDate(expiryDate.getDate() + (15 + Math.floor(Math.random() * 30)));

        inventoryItems.push({
          hospitalId: hospital._id,
          bloodGroup,
          units: Math.floor(Math.random() * 100) + 20,
          status: 'Available',
          collectionDate: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
          expiryDate,
        });
      }
    }

    // Add blood bank inventory
    for (const bloodBank of bloodBanks) {
      for (const bloodGroup of BLOOD_GROUPS) {
        const expiryDate = new Date();
        expiryDate.setDate(expiryDate.getDate() + (20 + Math.floor(Math.random() * 25)));

        inventoryItems.push({
          hospitalId: bloodBank._id,
          bloodGroup,
          units: Math.floor(Math.random() * 150) + 50,
          status: 'Available',
          collectionDate: new Date(Date.now() - Math.random() * 25 * 24 * 60 * 60 * 1000),
          expiryDate,
        });
      }
    }

    await BloodInventory.insertMany(inventoryItems);
    logger.info(`Created ${inventoryItems.length} blood inventory records`);

    logger.info('✓ Database seeding completed successfully');
    process.exit(0);
  } catch (error) {
    logger.error('Database seeding failed:', error);
    process.exit(1);
  }
}

// Run if executed directly
if (require.main === module) {
  seedDatabase();
}

export default seedDatabase;
