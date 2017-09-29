module.exports = {
    dataDb: 'mongodb://localhost:27017/site',
    userCollection: "user",
    postCollection: "post",
    settingCollection: "settings",
    session: {
        secret: 'admine',
        key: 'admine',
        maxAge: 2592000000
    }
}