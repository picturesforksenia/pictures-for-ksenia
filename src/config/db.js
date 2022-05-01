module.exports = {
    uri: `mongodb+srv://${process.env.MONGODB_URI}?retryWrites=true&w=majority`,
    database: process.env.MONGODB_DB,
    collection: 'pictures',
};