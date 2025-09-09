// Database initialization and migration script
import { sequelize, models } from './database';

async function initializeDatabase() {
  try {
    console.log('🔄 Initializing database...');

    // Test connection
    await sequelize.authenticate();
    console.log('✅ Database connection established');

    // Sync all models (create tables)
    await sequelize.sync({ force: false, alter: true });
    console.log('✅ Database tables synchronized');

    // Create junction tables for many-to-many relationships
    await createJunctionTables();

    console.log('🎉 Database initialization complete!');
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    throw error;
  }
}

async function createJunctionTables() {
  // IOC - Threat Actor junction table
  await sequelize.query(`
    CREATE TABLE IF NOT EXISTS ioc_threat_actors (
      ioc_id UUID NOT NULL REFERENCES iocs(id) ON DELETE CASCADE,
      threat_actor_id UUID NOT NULL REFERENCES threat_actors(id) ON DELETE CASCADE,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      PRIMARY KEY (ioc_id, threat_actor_id)
    );
  `);

  // IOC - Malware Family junction table
  await sequelize.query(`
    CREATE TABLE IF NOT EXISTS ioc_malware_families (
      ioc_id UUID NOT NULL REFERENCES iocs(id) ON DELETE CASCADE,
      malware_family_id UUID NOT NULL REFERENCES malware_families(id) ON DELETE CASCADE,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      PRIMARY KEY (ioc_id, malware_family_id)
    );
  `);

  // IOC - Campaign junction table
  await sequelize.query(`
    CREATE TABLE IF NOT EXISTS ioc_campaigns (
      ioc_id UUID NOT NULL REFERENCES iocs(id) ON DELETE CASCADE,
      campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      PRIMARY KEY (ioc_id, campaign_id)
    );
  `);

  console.log('✅ Junction tables created');
}

async function seedDatabase() {
  try {
    console.log('🌱 Seeding database with initial data...');

    // Seed threat actors
    const threatActors = [
      {
        name: 'APT29',
        aliases: ['Cozy Bear', 'The Dukes'],
        description: 'Russian state-sponsored cyber espionage group',
        country: 'Russia',
        sophistication_level: 'advanced',
        primary_motivation: 'Espionage',
        first_seen: new Date('2008-01-01'),
        is_active: true
      },
      {
        name: 'Lazarus Group',
        aliases: ['Guardians of Peace'],
        description: 'North Korean state-sponsored cyber warfare group',
        country: 'North Korea',
        sophistication_level: 'advanced',
        primary_motivation: 'Sabotage',
        first_seen: new Date('2009-01-01'),
        is_active: true
      },
      {
        name: 'FIN7',
        aliases: ['Carbanak'],
        description: 'Financially motivated cybercrime group',
        country: 'Russia',
        sophistication_level: 'high',
        primary_motivation: 'Financial Gain',
        first_seen: new Date('2013-01-01'),
        is_active: true
      }
    ];

    for (const actor of threatActors) {
      await models.ThreatActor.findOrCreate({
        where: { name: actor.name },
        defaults: actor
      });
    }

    // Seed malware families
    const malwareFamilies = [
      {
        name: 'TrickBot',
        aliases: ['TrickLoader'],
        description: 'Banking trojan and malware distribution platform',
        category: 'trojan',
        platform: ['Windows'],
        first_seen: new Date('2016-01-01'),
        is_active: true
      },
      {
        name: 'Emotet',
        aliases: ['Geodo'],
        description: 'Modular banking trojan and malware loader',
        category: 'trojan',
        platform: ['Windows'],
        first_seen: new Date('2014-01-01'),
        is_active: true
      },
      {
        name: 'Cobalt Strike',
        aliases: ['Beacon'],
        description: 'Commercial penetration testing tool used by threat actors',
        category: 'backdoor',
        platform: ['Windows', 'Linux', 'macOS'],
        first_seen: new Date('2015-01-01'),
        is_active: true
      }
    ];

    for (const malware of malwareFamilies) {
      await models.MalwareFamily.findOrCreate({
        where: { name: malware.name },
        defaults: malware
      });
    }

    console.log('✅ Database seeded successfully');
  } catch (error) {
    console.error('❌ Database seeding failed:', error);
    throw error;
  }
}

// Export functions for use in other modules
export { initializeDatabase, seedDatabase };

// Run if called directly
if (require.main === module) {
  initializeDatabase()
    .then(() => seedDatabase())
    .then(() => {
      console.log('🎉 Database setup complete!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Database setup failed:', error);
      process.exit(1);
    });
}
