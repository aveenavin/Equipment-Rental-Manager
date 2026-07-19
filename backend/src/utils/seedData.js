const mongoose = require('mongoose');
const User = require('../models/User');
const Equipment = require('../models/Equipment');
const Rental = require('../models/Rental');
const Return = require('../models/Return');
const MaintenanceLog = require('../models/MaintenanceLog');
const Payment = require('../models/Payment');

// ─── Helpers ────────────────────────────────────────────────────────────────

/** Return a Date that is `days` days before now. */
const daysAgo = (days) => {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d;
};

/** Return a Date that is `days` days after a base date. */
const addDays = (base, days) => {
  const d = new Date(base);
  d.setDate(d.getDate() + days);
  return d;
};

// ─── Slug generator (mirrors Equipment model pre-save hook) ─────────────────
const makeSlug = (name) =>
  name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-') +
  '-' +
  Date.now() +
  Math.floor(Math.random() * 1000);

// ─── Main seed function ──────────────────────────────────────────────────────

const seedData = async () => {
  try {
    // ── 1. Resolve admin + guard ─────────────────────────────────────────────
    const admin = await User.findOne({ role: 'admin' });
    if (!admin) {
      console.warn('⚠️  No admin user found — skipping data seed. Run seedAdmin first.');
      return;
    }

    const existingEquipmentCount = await Equipment.countDocuments();
    if (existingEquipmentCount > 0) {
      console.log('Development data already exists — skipping seed.');
      return;
    }

    console.log('🌱 Seeding development data…');

    // ── 2. Create customer users ──────────────────────────────────────────────
    const customerDefs = [
      { name: 'James Carter',   email: 'james.carter@example.com',   phone: '555-0101' },
      { name: 'Priya Sharma',   email: 'priya.sharma@example.com',   phone: '555-0102' },
      { name: 'Marcus Johnson', email: 'marcus.johnson@example.com', phone: '555-0103' },
      { name: 'Sofia Russo',    email: 'sofia.russo@example.com',    phone: '555-0104' },
      { name: 'Liam OBrien',    email: 'liam.obrien@example.com',    phone: '555-0105' },
      { name: 'Aisha Patel',    email: 'aisha.patel@example.com',    phone: '555-0106' },
      { name: 'Noah Williams',  email: 'noah.williams@example.com',  phone: '555-0107' },
      { name: 'Emily Chen',     email: 'emily.chen@example.com',     phone: '555-0108' },
    ];

    // Only insert customers that do not already exist (by email)
    const existingEmails = new Set(
      (await User.find({ role: 'customer' }, 'email').lean()).map((u) => u.email)
    );
    const newCustomerDefs = customerDefs.filter((c) => !existingEmails.has(c.email));

    if (newCustomerDefs.length > 0) {
      // insertMany bypasses the pre-save password hash hook.
      // Pre-hash the passwords here so they are stored securely.
      const bcrypt = require('bcryptjs');
      const hashedPassword = await bcrypt.hash('Customer@123', 12);
      await User.insertMany(
        newCustomerDefs.map((c) => ({
          ...c,
          password: hashedPassword,
          role: 'customer',
          status: 'active',
          isVerified: true,
        }))
      );
    }

    const customers = await User.find({
      role: 'customer',
      email: { $in: customerDefs.map((c) => c.email) },
    }).lean();
    console.log(`  ✔ ${customers.length} customers available`);

    // ── 3. Equipment ──────────────────────────────────────────────────────────
    const equipmentDefs = [
      // Heavy Machinery
      {
        name: 'CAT 320 Hydraulic Excavator',
        category: 'heavy-machinery',
        dailyRate: 450, securityDeposit: 2000, serialNumber: 'CAT-EXC-001',
        condition: 'excellent', status: 'available',
        description: 'High-performance 20-ton hydraulic excavator with GPS system, ideal for large earthmoving and demolition projects.',
      },
      {
        name: 'Komatsu D65 Bulldozer',
        category: 'heavy-machinery',
        dailyRate: 380, securityDeposit: 1800, serialNumber: 'KOM-BDZ-002',
        condition: 'good', status: 'rented',
        description: 'Robust crawler-type bulldozer with 6-way blade, ROPS cab, and auto-shift transmission for demanding site work.',
      },
      {
        name: 'Volvo A40G Articulated Hauler',
        category: 'heavy-machinery',
        dailyRate: 500, securityDeposit: 2200, serialNumber: 'VLV-HAL-003',
        condition: 'good', status: 'available',
        description: '40-tonne payload articulated hauler with automatic traction control and onboard weighing system.',
      },
      // Power Tools
      {
        name: 'Hilti TE 60-ATC Rotary Hammer',
        category: 'power-tools',
        dailyRate: 45, securityDeposit: 250, serialNumber: 'HLT-RHM-004',
        condition: 'excellent', status: 'available',
        description: 'Professional SDS Max rotary hammer with active torque control, ideal for heavy chiselling and drilling in concrete.',
      },
      {
        name: 'Makita DGA900Z Angle Grinder',
        category: 'power-tools',
        dailyRate: 30, securityDeposit: 150, serialNumber: 'MAK-AGR-005',
        condition: 'good', status: 'available',
        description: 'Brushless 230mm cordless angle grinder with electronic brake and 3-mode speed selection for versatile cutting tasks.',
      },
      {
        name: 'DeWalt DCD999 Hammer Drill',
        category: 'power-tools',
        dailyRate: 25, securityDeposit: 120, serialNumber: 'DEW-HDR-006',
        condition: 'excellent', status: 'rented',
        description: 'FLEXVOLT Advantage 20V MAX brushless hammer drill with 3-speed transmission and E-Clutch system.',
      },
      // Lifting Equipment
      {
        name: 'Manitowoc 16000 Tower Crane',
        category: 'lifting-equipment',
        dailyRate: 950, securityDeposit: 5000, serialNumber: 'MNT-CRN-007',
        condition: 'good', status: 'available',
        description: 'Top-slewing tower crane with 64m jib, 16-tonne maximum capacity, and frequency-controlled drives for precision lifts.',
      },
      {
        name: 'Genie Z-60 Boom Lift',
        category: 'lifting-equipment',
        dailyRate: 220, securityDeposit: 1200, serialNumber: 'GEN-BLF-008',
        condition: 'excellent', status: 'rented',
        description: 'Articulating boom lift with 18m working height and 7.5m outreach, ANSI-compliant platform controls.',
      },
      {
        name: 'JLG 3246ES Electric Scissor Lift',
        category: 'lifting-equipment',
        dailyRate: 150, securityDeposit: 800, serialNumber: 'JLG-SSL-009',
        condition: 'good', status: 'maintenance',
        description: 'Zero-emission electric scissor lift with 9.9m platform height and 340kg capacity for indoor applications.',
      },
      // Compressors
      {
        name: 'Atlas Copco XATS 900 Compressor',
        category: 'compressors',
        dailyRate: 180, securityDeposit: 900, serialNumber: 'ATL-CMP-010',
        condition: 'good', status: 'available',
        description: 'Portable diesel air compressor delivering 25 cubic metres per minute at 17 bar, suited for large-scale pneumatic tooling.',
      },
      {
        name: 'Ingersoll Rand P185WJD Compressor',
        category: 'compressors',
        dailyRate: 120, securityDeposit: 600, serialNumber: 'ING-CMP-011',
        condition: 'excellent', status: 'available',
        description: 'Portable 185 CFM diesel air compressor with Tier 4F engine, cold-start capability down to -18 degrees Celsius.',
      },
      // Generators
      {
        name: 'Caterpillar XQ2000 Generator',
        category: 'generators',
        dailyRate: 320, securityDeposit: 1500, serialNumber: 'CAT-GEN-012',
        condition: 'excellent', status: 'available',
        description: '2000 kVA rental-grade generator set with paralleling capability and digital AVR for critical power supply.',
      },
      {
        name: 'Aggreko 500kVA Generator',
        category: 'generators',
        dailyRate: 210, securityDeposit: 1000, serialNumber: 'AGG-GEN-013',
        condition: 'good', status: 'rented',
        description: 'Tier 4F compliant 500 kVA trailer-mounted generator with automatic voltage regulation and load management.',
      },
      // Scaffolding
      {
        name: 'Layher Allround Scaffolding Set',
        category: 'scaffolding',
        dailyRate: 85, securityDeposit: 400, serialNumber: 'LAY-SCF-014',
        condition: 'good', status: 'available',
        description: 'Modular ringlock scaffolding system covering 100 square metres, load-rated to 3 kN per square metre, with all couplers and base plates.',
      },
      {
        name: 'Haki System Staircase Tower',
        category: 'scaffolding',
        dailyRate: 60, securityDeposit: 300, serialNumber: 'HAK-STW-015',
        condition: 'fair', status: 'available',
        description: 'Aluminium staircase access tower with 10m working height, self-closing gates, and anti-slip treads.',
      },
      // Vehicles
      {
        name: 'Toyota Land Cruiser 200 4WD',
        category: 'vehicles',
        dailyRate: 110, securityDeposit: 600, serialNumber: 'TOY-LCR-016',
        condition: 'excellent', status: 'available',
        description: 'Heavy-duty 4WD utility vehicle with V8 diesel engine, air conditioning, and site communication equipment.',
      },
      {
        name: 'Ford Transit Crew Van',
        category: 'vehicles',
        dailyRate: 75, securityDeposit: 350, serialNumber: 'FRD-VAN-017',
        condition: 'good', status: 'rented',
        description: '9-seat crew transport van with cargo area, rated for unsealed access roads and construction site use.',
      },
    ];

    const equipmentDocs = equipmentDefs.map((def) => ({
      ...def,
      slug: makeSlug(def.name),
      images: [],
      createdBy: admin._id,
    }));

    const equipmentList = await Equipment.insertMany(equipmentDocs);
    console.log(`  ✔ ${equipmentList.length} equipment items created`);

    // Build lookup: serialNumber → document
    const eqMap = {};
    equipmentList.forEach((eq) => { eqMap[eq.serialNumber] = eq; });

    // ── 4. Rentals ────────────────────────────────────────────────────────────
    const rentalDefs = [
      // ─ Returned (historical, spread over 12 months) ─
      { ci: 0, sn: 'CAT-EXC-001', startDaysAgo: 340, durationDays: 5,  status: 'returned',    notes: 'Foundation excavation for commercial building Phase 1.' },
      { ci: 1, sn: 'HLT-RHM-004', startDaysAgo: 320, durationDays: 3,  status: 'returned',    notes: 'Concrete chiselling for renovation project.' },
      { ci: 2, sn: 'GEN-BLF-008', startDaysAgo: 300, durationDays: 7,  status: 'returned',    notes: 'Facade installation works.' },
      { ci: 3, sn: 'ATL-CMP-010', startDaysAgo: 280, durationDays: 4,  status: 'returned',    notes: 'Sandblasting and surface preparation.' },
      { ci: 4, sn: 'LAY-SCF-014', startDaysAgo: 260, durationDays: 10, status: 'returned',    notes: 'External painting and remediation works.' },
      { ci: 5, sn: 'TOY-LCR-016', startDaysAgo: 240, durationDays: 6,  status: 'returned',    notes: 'Site survey and inspection access.' },
      { ci: 6, sn: 'MAK-AGR-005', startDaysAgo: 220, durationDays: 2,  status: 'returned',    notes: 'Metal fabrication cutting works.' },
      { ci: 7, sn: 'ING-CMP-011', startDaysAgo: 200, durationDays: 5,  status: 'returned',    notes: 'Pneumatic demolition on site.' },
      { ci: 0, sn: 'KOM-BDZ-002', startDaysAgo: 180, durationDays: 8,  status: 'returned',    notes: 'Land clearing for new subdivision.' },
      { ci: 1, sn: 'MNT-CRN-007', startDaysAgo: 160, durationDays: 14, status: 'returned',    notes: 'Steel erection for warehouse structure.' },
      { ci: 2, sn: 'DEW-HDR-006', startDaysAgo: 140, durationDays: 3,  status: 'returned',    notes: 'Anchor drilling for safety railing.' },
      { ci: 3, sn: 'CAT-GEN-012', startDaysAgo: 120, durationDays: 10, status: 'returned',    notes: 'Temporary power supply during grid outage period.' },
      { ci: 4, sn: 'VLV-HAL-003', startDaysAgo: 100, durationDays: 6,  status: 'returned',    notes: 'Bulk earthworks for road realignment.' },
      { ci: 5, sn: 'HAK-STW-015', startDaysAgo: 80,  durationDays: 5,  status: 'returned',    notes: 'Rooftop access for HVAC maintenance.' },
      { ci: 6, sn: 'FRD-VAN-017', startDaysAgo: 60,  durationDays: 7,  status: 'returned',    notes: 'Crew transport for remote site mobilisation.' },
      { ci: 7, sn: 'AGG-GEN-013', startDaysAgo: 45,  durationDays: 5,  status: 'returned',    notes: 'Power for temporary site office and lighting.' },
      // ─ Checked-out (currently active) ─
      { ci: 0, sn: 'KOM-BDZ-002', startDaysAgo: 3,   durationDays: 5,  status: 'checked_out', notes: 'Ongoing earthworks for residential estate.' },
      { ci: 1, sn: 'DEW-HDR-006', startDaysAgo: 2,   durationDays: 4,  status: 'checked_out', notes: 'Post installation for fencing project.' },
      { ci: 2, sn: 'GEN-BLF-008', startDaysAgo: 1,   durationDays: 6,  status: 'checked_out', notes: 'Cladding install on commercial highrise.' },
      { ci: 3, sn: 'AGG-GEN-013', startDaysAgo: 4,   durationDays: 7,  status: 'checked_out', notes: 'Event power supply for outdoor festival.' },
      { ci: 4, sn: 'FRD-VAN-017', startDaysAgo: 2,   durationDays: 5,  status: 'checked_out', notes: 'Crew transport for tunnel inspection project.' },
      // ─ Confirmed (upcoming) ─
      { ci: 5, sn: 'CAT-GEN-012', startDaysAgo: -3,  durationDays: 5,  status: 'confirmed',   notes: 'Standby power for hospital wing shutdown.' },
      { ci: 6, sn: 'ING-CMP-011', startDaysAgo: -5,  durationDays: 3,  status: 'confirmed',   notes: 'Pneumatic pipe installation.' },
      // ─ Pending ─
      { ci: 7, sn: 'HAK-STW-015', startDaysAgo: -7,  durationDays: 4,  status: 'pending',     notes: 'Awaiting site access permit approval.' },
      { ci: 0, sn: 'LAY-SCF-014', startDaysAgo: -10, durationDays: 8,  status: 'pending',     notes: 'Scaffolding for bridge deck inspection.' },
      // ─ Cancelled ─
      { ci: 1, sn: 'VLV-HAL-003', startDaysAgo: 30,  durationDays: 3,  status: 'cancelled',   notes: 'Project cancelled by client.' },
    ];

    const rentalDocs = rentalDefs.map((def) => {
      const eq = eqMap[def.sn];
      const customer = customers[def.ci % customers.length];
      const start = daysAgo(def.startDaysAgo);
      const end = addDays(start, def.durationDays);
      const rentalCost = parseFloat((eq.dailyRate * def.durationDays).toFixed(2));
      const totalAmount = parseFloat((rentalCost + eq.securityDeposit).toFixed(2));

      const doc = {
        customer: customer._id,
        equipment: eq._id,
        startDate: start,
        endDate: end,
        dailyRate: eq.dailyRate,
        totalDays: def.durationDays,
        rentalCost,
        securityDeposit: eq.securityDeposit,
        totalAmount,
        status: def.status,
        notes: def.notes || null,
        handledBy: admin._id,
        confirmedAt: null,
        checkedOutAt: null,
        returnedAt: null,
        cancelledAt: null,
        returnRecord: null,
      };

      if (['confirmed', 'checked_out', 'returned', 'cancelled'].includes(def.status)) {
        doc.confirmedAt = addDays(start, -1);
      }
      if (['checked_out', 'returned'].includes(def.status)) {
        doc.checkedOutAt = start;
      }
      if (def.status === 'returned') {
        doc.returnedAt = end;
      }
      if (def.status === 'cancelled') {
        doc.cancelledAt = addDays(start, -2);
      }

      return doc;
    });

    const rentals = await Rental.insertMany(rentalDocs);
    console.log(`  ✔ ${rentals.length} rentals created`);

    const returnedRentals = rentals.filter((r) => r.status === 'returned');
    const checkedOutRentals = rentals.filter((r) => r.status === 'checked_out');

    // ── 5. Returns ────────────────────────────────────────────────────────────
    const conditions = ['excellent', 'good', 'good', 'good', 'fair'];
    const returnDocs = returnedRentals.map((rental, i) => {
      const conditionAtReturn = conditions[i % conditions.length];
      const isDamaged = (i + 1) % 5 === 0;
      const damageCharges = isDamaged ? parseFloat((rental.securityDeposit * 0.4).toFixed(2)) : 0;
      const depositDeducted = isDamaged ? Math.min(damageCharges, rental.securityDeposit) : 0;
      const depositRefunded = parseFloat((rental.securityDeposit - depositDeducted).toFixed(2));

      return {
        rental: rental._id,
        equipment: rental.equipment,
        customer: rental.customer,
        processedBy: admin._id,
        returnDate: rental.returnedAt || rental.endDate,
        conditionAtReturn,
        isDamaged,
        damageDescription: isDamaged ? 'Minor hydraulic hose wear noted during inspection.' : null,
        damageCharges,
        depositRefunded,
        depositDeducted,
        equipmentStatusAfterReturn: isDamaged ? 'maintenance' : 'available',
        notes: isDamaged ? 'Sent to maintenance workshop for repair.' : 'Equipment returned in satisfactory condition.',
      };
    });

    const returns = await Return.insertMany(returnDocs);
    console.log(`  ✔ ${returns.length} return records created`);

    // Back-link returnRecord on each returned rental
    await Promise.all(
      returns.map((ret, i) =>
        Rental.findByIdAndUpdate(returnedRentals[i]._id, { returnRecord: ret._id })
      )
    );

    // ── 6. Maintenance Logs ───────────────────────────────────────────────────
    const damagedReturns = returns.filter((r) => r.isDamaged);

    const maintenanceDocs = [
      // Auto-generated from damaged returns
      ...damagedReturns.map((ret) => ({
        equipment: ret.equipment,
        reportedBy: admin._id,
        completedBy: null,
        status: 'open',
        priority: 'high',
        description: 'Post-return damage: Minor hydraulic hose wear noted during inspection.',
        estimatedCost: 850,
        actualCost: null,
        scheduledDate: addDays(new Date(), 2),
        completedAt: null,
        triggeredByReturn: ret._id,
      })),
      // Scheduled preventive maintenance (completed)
      {
        equipment: eqMap['JLG-SSL-009']._id,
        reportedBy: admin._id,
        completedBy: admin._id,
        status: 'completed',
        priority: 'medium',
        description: 'Scheduled 500-hour service — hydraulic fluid change, filter replacement, and safety system check.',
        technicianNotes: 'All systems passed inspection. Hydraulic fluid replaced. New filters installed. Battery load tested — within spec.',
        estimatedCost: 600,
        actualCost: 580,
        scheduledDate: daysAgo(15),
        completedAt: daysAgo(13),
        triggeredByReturn: null,
      },
      {
        equipment: eqMap['CAT-EXC-001']._id,
        reportedBy: admin._id,
        completedBy: admin._id,
        status: 'completed',
        priority: 'low',
        description: 'Annual bucket pin and bushing inspection with greasing service.',
        technicianNotes: 'Bucket pins torqued to specification. All bushings greased. No wear beyond acceptable limits.',
        estimatedCost: 200,
        actualCost: 185,
        scheduledDate: daysAgo(50),
        completedAt: daysAgo(48),
        triggeredByReturn: null,
      },
      {
        equipment: eqMap['KOM-BDZ-002']._id,
        reportedBy: admin._id,
        completedBy: admin._id,
        status: 'completed',
        priority: 'medium',
        description: 'Track tension adjustment and undercarriage inspection.',
        technicianNotes: 'Track adjusted to manufacturer specification. Sprocket and idler wear within acceptable range.',
        estimatedCost: 350,
        actualCost: 320,
        scheduledDate: daysAgo(90),
        completedAt: daysAgo(88),
        triggeredByReturn: null,
      },
      {
        equipment: eqMap['MNT-CRN-007']._id,
        reportedBy: admin._id,
        completedBy: null,
        status: 'open',
        priority: 'medium',
        description: 'Slewing ring lubrication and wire rope inspection scheduled.',
        estimatedCost: 750,
        actualCost: null,
        scheduledDate: addDays(new Date(), 5),
        completedAt: null,
        triggeredByReturn: null,
      },
    ];

    const maintenanceLogs = await MaintenanceLog.insertMany(maintenanceDocs);
    console.log(`  ✔ ${maintenanceLogs.length} maintenance logs created`);

    // ── 7. Payments ───────────────────────────────────────────────────────────
    const paymentMethods = ['cash', 'card', 'bank_transfer', 'online'];
    const paymentDocs = [];

    // Returned rentals: full payment lifecycle
    returnedRentals.forEach((rental, i) => {
      const ret = returns[i];
      const method = paymentMethods[i % paymentMethods.length];
      const txBase = `TXN-${i}-${Date.now()}`;

      // Advance (security deposit)
      paymentDocs.push({
        rental: rental._id,
        customer: rental.customer,
        paymentType: 'advance',
        paymentMethod: method,
        amount: rental.securityDeposit,
        direction: 'inbound',
        status: 'completed',
        transactionId: `${txBase}-ADV`,
        recordedBy: admin._id,
        paidAt: addDays(rental.startDate, -1),
        notes: 'Security deposit collected at booking confirmation.',
      });

      // Balance (rental cost)
      paymentDocs.push({
        rental: rental._id,
        customer: rental.customer,
        paymentType: 'balance',
        paymentMethod: method,
        amount: rental.rentalCost,
        direction: 'inbound',
        status: 'completed',
        transactionId: `${txBase}-BAL`,
        recordedBy: admin._id,
        paidAt: rental.checkedOutAt || rental.startDate,
        notes: 'Rental cost settled at checkout.',
      });

      // Damage charge (if applicable)
      if (ret.isDamaged && ret.damageCharges > 0) {
        paymentDocs.push({
          rental: rental._id,
          customer: rental.customer,
          paymentType: 'damage_charge',
          paymentMethod: 'card',
          amount: ret.damageCharges,
          direction: 'inbound',
          status: 'completed',
          transactionId: `${txBase}-DMG`,
          recordedBy: admin._id,
          paidAt: addDays(ret.returnDate, 1),
          notes: 'Damage charge deducted from security deposit.',
        });
      }

      // Deposit refund (outbound)
      if (ret.depositRefunded > 0) {
        paymentDocs.push({
          rental: rental._id,
          customer: rental.customer,
          paymentType: 'deposit_refund',
          paymentMethod: 'bank_transfer',
          amount: ret.depositRefunded,
          direction: 'outbound',
          status: 'completed',
          transactionId: `${txBase}-REF`,
          recordedBy: admin._id,
          paidAt: addDays(ret.returnDate, 2),
          notes: 'Security deposit refunded after return inspection.',
        });
      }
    });

    // Checked-out rentals: advance (deposit) paid at checkout
    checkedOutRentals.forEach((rental, i) => {
      paymentDocs.push({
        rental: rental._id,
        customer: rental.customer,
        paymentType: 'advance',
        paymentMethod: paymentMethods[i % paymentMethods.length],
        amount: rental.securityDeposit,
        direction: 'inbound',
        status: 'completed',
        transactionId: `TXN-CO-${i}-${Date.now()}`,
        recordedBy: admin._id,
        paidAt: rental.checkedOutAt || rental.startDate,
        notes: 'Security deposit collected at equipment checkout.',
      });
    });

    const payments = await Payment.insertMany(paymentDocs);
    console.log(`  ✔ ${payments.length} payment records created`);

    console.log('✅ Development data seed complete.');
  } catch (error) {
    console.error('❌ Data seed failed:', error.message);
    // Non-fatal: log and continue, do not crash the server
  }
};

module.exports = seedData;
