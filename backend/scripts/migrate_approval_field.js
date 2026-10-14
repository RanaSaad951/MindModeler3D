/**
 * ONE-TIME MIGRATION: migrate_approval_field.js
 * ──────────────────────────────────────────────
 * Removes the legacy `isApproved` field from ALL User documents.
 * Ensures all Patients have isApprovedByAdmin = true.
 *
 * Run ONCE from the backend directory:
 *   node scripts/migrate_approval_field.js
 */

require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGO_URI;

if (!MONGODB_URI) {
  console.error('❌  MONGO_URI not found in .env — aborting.');
  process.exit(1);
}

async function migrate() {
  await mongoose.connect(MONGODB_URI);
  console.log('✅  Connected to MongoDB');

  // ── Step 1: Remove the stale `isApproved` field from every document ──
  const unsetResult = await mongoose.connection.collection('users').updateMany(
    { isApproved: { $exists: true } },
    { $unset: { isApproved: '' } }
  );
  console.log(`🧹  Removed legacy 'isApproved' field from ${unsetResult.modifiedCount} document(s).`);

  // ── Step 2: Ensure all Patients have isApprovedByAdmin = true ──
  const patientResult = await mongoose.connection.collection('users').updateMany(
    { role: 'Patient', isApprovedByAdmin: { $ne: true } },
    { $set: { isApprovedByAdmin: true } }
  );
  console.log(`✅  Set isApprovedByAdmin=true on ${patientResult.modifiedCount} Patient document(s).`);

  // ── Step 3: Print summary ──
  const doctors  = await mongoose.connection.collection('users').countDocuments({ role: 'Doctor' });
  const approved = await mongoose.connection.collection('users').countDocuments({ role: 'Doctor', isApprovedByAdmin: true });
  const pending  = doctors - approved;
  console.log(`\n📊  Doctor summary → Total: ${doctors} | Approved: ${approved} | Pending: ${pending}`);

  await mongoose.disconnect();
  console.log('\n🎉  Migration complete. Legacy field fully removed.');
}

migrate().catch((err) => {
  console.error('Migration failed:', err);
  mongoose.disconnect();
  process.exit(1);
});
