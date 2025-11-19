const mongoose = require('mongoose');
const path = require('path');
const User = require(path.join(__dirname, '..', 'src', 'models', 'User'));
require('dotenv').config();

const MAPPINGS = {
  'Weekdays (9 AM - 5 PM)': { days: ['Mon','Tue','Wed','Thu','Fri'], start: '09:00', end: '17:00', label: 'Weekdays (9 AM - 5 PM)' },
  'Evenings (6 PM - 10 PM)': { days: ['Mon','Tue','Wed','Thu','Fri'], start: '18:00', end: '22:00', label: 'Evenings (6 PM - 10 PM)' },
  'Weekends': { days: ['Sat','Sun'], start: '09:00', end: '18:00', label: 'Weekends' },
  'Flexible': { days: ['Any'], start: null, end: null, label: 'Flexible' },
};

const run = async () => {
  const uri = process.env.MONGO_URI || process.env.MONGO_URL || 'mongodb://localhost:27017/senior_junior';
  console.log('Connecting to DB', uri);
  await mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
  console.log('Connected to DB. Scanning users for legacy availability strings...');

  const users = await User.find({ 'seniorProfile.availability': { $elemMatch: { $type: 'string' } } });
  console.log(`Found ${users.length} users with legacy availability strings.`);

  for (const user of users) {
    const updatedAvailability = (user.seniorProfile?.availability || []).map((a) => {
      if (typeof a === 'string') {
        if (MAPPINGS[a]) return MAPPINGS[a];
        return { type: 'legacy', label: a };
      }
      return a; // keep object as-is
    });

    user.seniorProfile.availability = updatedAvailability;
    await user.save();
    console.log(`Migrated availability for user ${user._id}`);
  }

  console.log('Migration complete.');
  process.exit(0);
};

run().catch(err => {
  console.error(err);
  process.exit(1);
});