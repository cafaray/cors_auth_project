'use strict'

require("dotenv").config()
require("./config/database").connect()

const express = require('express')
const cors = require("cors")
const User = require('./model/user')
const bcrypt = require('bcryptjs')
const jwt = require("jsonwebtoken")
const auth = require("./middleware/auth")

const app = express();
app.use(express.json({ limit: "50mb" }))
app.use(cors())

// TODO: all related business code goes here ...

app.post("/register", async (req, res) => {
    try {
        // get the user input
        const { firstName, lastName, email, password } = req.body

        // validate user input:
        if (!(email && password && lastName && firstName)){
            res.status(400).send("Bad request, all fields are required!")
            return
        }

        // before register, check if user already exists in database
        const oldUser = await User.findOne({ email })
        if (oldUser) {
            res.status(409).send("Bad request, user already exists!")
            return
        }

        // Encrypt user password
        const encryptedUserPassword = await bcrypt.hash(password, 10)

        const user = await User.create({
            first_name: firstName,
            last_name: lastName,
            email: email,
            password: encryptedUserPassword
        })

        const token = jwt.sign(
            { user_id: user._id, email }, 
            process.env.TOKEN_KEY,
            { expiresIn: "5h" }
        )
        
        user.token = token

        res.status(200).json(user)

    }catch(err) {
        console.error(err)
    }
})

app.post("/login", async (req, res) => {
    try {
        const {email, password} = req.body

        // validate user and password inputs
        if (!(email && password)) {
            return res.status(400).send("All inputs are required!")
        }

        const user = await User.findOne({ email })
        if (user && (await bcrypt.compare(password, user.password))) {
            // everything goes right, so create the jwt token
            const token = jwt.sign(
                {user_id: user._id, email },
                process.env.TOKEN_KEY,
                { expiresIn: '5h' }
            )
            user.token = token
            return res.status(200).json(user)
        }
        return res.status(401).send('Invalid credentials')
    } catch (err) {
        console.error(err)
    }
})

app.get("/welcome", auth, (req, res) => {
    return res.status(200).send("Welcome to FreeCodeCamp 🙌")
})
module.exports = app