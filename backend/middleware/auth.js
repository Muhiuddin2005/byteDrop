const admin = require('../config/firebase');

const verifyFBToken = async (req, res, next) => {
    if (!process.env.FB_SERVICE_KEY) {
        req.decoded_email = req.headers['x-dev-email'] || 'dev-user@example.com';
        return next();
    }

    const token = req.headers.authorization;

    if (!token) {
        return res.status(401).send({ message: 'unauthorized access' })
    }

    try {
        const idToken = token.split(' ')[1];
        const decoded = await admin.auth().verifyIdToken(idToken);
        req.decoded_email = decoded.email;
        next();
    }
    catch (err) {
        return res.status(401).send({ message: 'unauthorized access' })
    }
}

const verifyAdmin = async (req, res, next) => {
    if (!req.collections) {
        return res.status(500).send({ message: 'Database collections not available' });
    }
    const { users } = req.collections;
    const email = req.decoded_email;
    const query = { email };
    const user = await users.findOne(query);

    if (!user || user.role !== 'admin') {
        return res.status(403).send({ message: 'forbidden access' });
    }

    next();
}

const verifyRider = async (req, res, next) => {
    if (!req.collections) {
        return res.status(500).send({ message: 'Database collections not available' });
    }
    const { users } = req.collections;
    const email = req.decoded_email;
    const query = { email };
    const user = await users.findOne(query);

    if (!user || user.role !== 'rider') {
        return res.status(403).send({ message: 'forbidden access' });
    }

    next();
}

module.exports = { verifyFBToken, verifyAdmin, verifyRider };

