const express = require('express');
const cors = require('cors');
require('dotenv').config();

const { connectDatabase } = require('./config/database');
const { attachCollections } = require('./middleware/collections');
const { initializeModels } = require('./models');
const { initializeControllers } = require('./controllers');

// Import routes
const userRoutes = require('./routes/users');
const parcelRoutes = require('./routes/parcels');
const paymentRoutes = require('./routes/payments');
const riderRoutes = require('./routes/riders');
const trackingRoutes = require('./routes/trackings');

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(cors());

// Root endpoint
app.get('/', (req, res) => {
    res.send('Bytedrop server is running!')
});

// A simple mock query builder for offline fallback
const createMockCollection = (name) => {
    const mockCursor = {
        sort: () => mockCursor,
        limit: () => mockCursor,
        toArray: async () => [],
    };
    return {
        find: () => mockCursor,
        findOne: async () => null,
        insertOne: async () => ({ insertedId: 'mock-id' }),
        updateOne: async () => ({ modifiedCount: 0 }),
        updateOneByEmail: async () => ({ modifiedCount: 0 }),
        estimatedDocumentCount: async () => 0,
        countDocuments: async () => 0,
        aggregate: () => mockCursor,
    };
};

// Initialize database and start server
async function startServer() {
    let collections;
    try {
        // Connect to database
        const dbResult = await connectDatabase();
        collections = dbResult.collections;
        console.log('Connected to MongoDB successfully');
    } catch (error) {
        console.warn('\n========================================================================');
        console.warn('WARNING: Failed to connect to MongoDB. Running in OFFLINE/MOCK DB mode.');
        console.warn('Please check your DB_USER/DB_PASS or run local MongoDB (mongodb://localhost:27017).');
        console.warn('========================================================================\n');
        
        collections = {
            users: createMockCollection('users'),
            parcels: createMockCollection('parcels'),
            payments: createMockCollection('payments'),
            riders: createMockCollection('riders'),
            trackings: createMockCollection('trackings')
        };
    }

    // Attach collections to all requests
    app.use(attachCollections(collections));

    // Initialize models and controllers
    const models = initializeModels(collections);
    const controllers = initializeControllers(models, collections);

    // Register all routes
    userRoutes(app, controllers);
    parcelRoutes(app, controllers);
    paymentRoutes(app, controllers);
    riderRoutes(app, controllers);
    trackingRoutes(app, controllers);

    // Start server
    app.listen(port, () => {
        console.log(`Server listening on port ${port}`)
    });
}

startServer();
