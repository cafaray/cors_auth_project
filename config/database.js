'use strict'
const mongoose = require("mongoose")
const { MONGO_URI } = process.env

exports.connect = () => {
    // Connection to the database:
    console.log('MONGO_URI:', MONGO_URI)
    mongoose.connect(MONGO_URI, {
            useNewUrlParser: true,            
            useUnifiedTopology: true,
            useCreateIndex: true,            
            useFindAndModify: false            
        })
        .then(() => {
            console.log("Successfully connected to Mongo database")
        })
        .catch((err) => {
            console.log("Mongo database connection failed, exiting now ...")
            console.error(err)
            process.exit(1)
        })
}