const { MongoClient, ServerApiVersion } = require('mongodb');

const dbUser = process.env.DB_USER;
const dbPass = process.env.DB_PASS;
const hasAtlasCreds = dbUser && dbPass;

const uri = process.env.MONGODB_URI || (hasAtlasCreds
    ? `mongodb+srv://${dbUser}:${dbPass}@cluster0.vyznij5.mongodb.net/?appName=Cluster0`
    : 'mongodb://127.0.0.1:27017/bytedrop_db');

const clientOptions = hasAtlasCreds ? {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
} : {};

const client = new MongoClient(uri, clientOptions);

async function connectDatabase() {
    try {
        await client.connect();
        const db = client.db('bytedrop_db');
        return {
            db,
            collections: {
                users: db.collection('users'),
                parcels: db.collection('parcels'),
                payments: db.collection('payments'),
                riders: db.collection('riders'),
                trackings: db.collection('trackings')
            }
        };
    } catch (error) {
        console.error('Database connection error:', error);
        throw error;
    }
}

module.exports = { connectDatabase, client };

