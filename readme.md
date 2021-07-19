# How to Authenticate Users and Implement CORS

> Based on [how-to-authenticate-users-and-implement-cors-in-nodejs-applications](https://www.freecodecamp.org/news/how-to-authenticate-users-and-implement-cors-in-nodejs-applications/)

Learn how to authenticate users and secure endpoints in Node.js. You'll also see how to implement Cross-Origin Resource Sharing (CORS) in Node.

## Prerequisites

You'll need the following to follow along with this tutorial:

- A working understanding of JavaScript.
- A good understanding of Node.js.
- A working knowledge of MongoDB or another database of your choice.
- Postman and a basic understanding of how it works.

Before we jump into the main part of the article, let's define some terms so we're all on the same page.

## What is Authentication?

Authentication and authorization may seem like the same thing. But there's a big difference between getting into a house (authentication) and what you can do once you're there (authorization).

Authentication is the process of confirming a user's identity by obtaining credentials and using those credentials to validate their identity. If the certificates are valid, the authorization procedure begins.

You are probably already familiar with the authentication process, because we all go through it daily – whether at work (logging onto your computer) or at home (passwords or logging into a website). In fact, most "things" connected to the Internet require you to provide credentials to prove your identity.

## What is Authorization?

Authorization is the process of granting authenticated users access to resources by verifying whether they have system access permissions or not. It also allows you to restrict access privileges by granting or denying specific licenses to authenticated users.

After the system authenticates your identity, authorization occurs, providing you full access to resources such as information, files, databases, finances, locations, and anything else.

This approval impacts your ability to access the system and the extent to which you can do so.

## What is Cross-Origin Resource Sharing (CORS)?

> CORS is an HTTP header-based system that allows a server to specify any other origins (domain, scheme, or port) from which a browser should enable resources to be loaded other than its own.

CORS also uses a system in which browsers send a "preflight" request to the server hosting the cross-origin help to ensure that it will allow the actual request.

We will be using the JSON web token standard to represent claims between two parties

## What are JSON Web Tokens (JWT)?

> JSON Web Tokens (JWT) are an open industry standard defined by RFC 7519 used to represent claims between two parties. jwt.io

You can use jwt.io to decode, verify, and create JWTs, for example.

JWT defines a concise and self-contained way of exchanging information between two parties as a JSON object. You can review and trust this information because it is signed.

JWTs can be signed with a secret (using the HMAC algorithm) or a public/private key pair from RSA or ECDSA. We'll see some examples of how to use them in a bit.

## How to Install Dependencies

We'll install several dependencies like mongoose, jsonwebtoken, express, dotenv, bcryptjs, cors and development dependencies like nodemon to restart the server as we make changes automatically.

Because I'll be using MongoDB in this project, we'll install Mongoose, and the user credentials will be checked against what we have in our database. As a result, the entire authentication process isn't limited to the database we'll use in this tutorial.
```
npm install  cors mongoose express jsonwebtoken dotenv bcryptjs 

npm install nodemon -D
``` 

## How to Create a Node.js Server and Connect your Database

Now, add the following snippets to your app.js, index.js, database.js, and .env files in that order to establish our Node.js server and connect our database on a docker container. Write connection in the [database.js](./config/database.js) and set the variables in [.env](./.env) file.

Start the database server using an image for Mongo, here I'm using the latest version:

```
docker run -d --name mongodb \   
    -v /Users/wendigo/dev/mongo/data:/data/db \
    -e MONGO_INITDB_ROOT_USERNAME=sysadmin \
    -e MONGO_INITDB_ROOT_PASSWORD='elPaso01+' \
    mongo
```

Once executed, take a look and verify that container is running ...

`docker ps`

For more detailed information about the container, you can execute the next command

`docker container inspect mongodb`

Connect to the container, and verify you have access to the database and test some mongo commands like: `show databases` or `use test` and `db.someCollection.find()`

`docker container exec -it mongodb bash`
 
In my case, I've prepare a docker compose file to execute the container and improve with security, here the [content of the file](./mongodb/docker-compose.yaml) 

Execute the same previous command tests to verify the container is working propery.

## Create Schema for user

Create a schema model for users, in the `model` folder set the file `user.js` and export the model for further use.

Next, let's gonna write the register and login fucntions inside the `app.js`

We'll implement these two routes in our application. Before storing the credentials in our database, we'll use JWT to sign them and bycrypt to encrypt them.

- Get user input from the /register route.
- Verify the user's input.
- Check to see if the user has already been created.
- Protect the user's password by encrypting it.
- Make a user account in our database.
- Finally, construct a JWT token that is signed.

> ### Use Mongo on docker.
> 
> Use the docker compose file to run Mongo on docker, take a look to the mongo-init.js which initialize a
> user with admin roles to work with the database. It's needed to connect in secure mode. It's important
> to know that once the docker has the env variables with USER and PASSWORD, mongo starts in secure mode.
>
> [Here the files]('./mongodb')

Invoke the path using curl 

```
curl --location --request POST 'localhost:4001/register' \
--header 'Content-Type: application/json' \
--data-raw '{
    "firstName": "Alberto",
    "lastName": "Farias",
    "email": "cafarias@viewnext.com",
    "password": "12345s7o"
}'
```

The result must looks like this:

```
{
    "first_name": "Alberto",
    "last_name": "Farias",
    "_id": "60f3577332f2a745560038f5",
    "email": "cafarias@viewnext.com",
    "password": "$2a$10$z7no1MbZDeYsy1l5v7F42.ilqalW1bAoR6TL1wdbgWu3Jw3kqHOia",
    "__v": 0,
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoiNjBmMzU3NzMzMmYyYTc0NTU2MDAzOGY1IiwiZW1haWwiOiJjYWZhcmlhc0B2aWV3bmV4dC5jb20iLCJpYXQiOjE2MjY1NjAzNzEsImV4cCI6MTYyNjU3ODM3MX0.ZFScRqGPFR-j2Cy9N3gJ-81XDYuD0KdhUL-R4d_f2zw"
}
```

Here we go with the token in JWT format, to know the content in the JWT token, use the [jwt.io]('http://jwt.io'), paste the above token in the encoded section and you will find the decoded intformation like this:


HEADER:ALGORITHM & TOKEN TYPE
```
{
  "alg": "HS256",
  "typ": "JWT"
}
```

PAYLOAD:DATA
```
{
  "user_id": "60f3577332f2a745560038f5",
  "email": "cafarias@viewnext.com",
  "iat": 1626560371,
  "exp": 1626578371
}
```

Looks fine, contains the information which we gave in the fragment on `app.js`:

````
const token = jwt.sign(
    { user_id: user._id, email }, 
    process.env.TOKEN_KEY,
    { expiresIn: "5h" }
)
```

## The login function

Now, it's time to prepare the Login function:

- Get user input for the /login route.
- Verify the user's input.
- Check to see if the user is genuine.
- Compare the user's password to the one we saved earlier in our database.
- Finally, construct a JWT token that is signed.

Here the invoke with curl

```
curl --location --request POST 'localhost:4001/login' \
--header 'Content-Type: application/json' \
--data-raw '{
    "email": "cafarias@viewnext.com",
    "password": "12345s7o"
}'
````

Here the result:

```
{
    "first_name": "Alberto",
    "last_name": "Farias",
    "_id": "60f3577332f2a745560038f5",
    "email": "cafarias@viewnext.com",
    "password": "$2a$10$z7no1MbZDeYsy1l5v7F42.ilqalW1bAoR6TL1wdbgWu3Jw3kqHOia",
    "__v": 0,
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoiNjBmMzU3NzMzMmYyYTc0NTU2MDAzOGY1IiwiZW1haWwiOiJjYWZhcmlhc0B2aWV3bmV4dC5jb20iLCJpYXQiOjE2MjY1OTk5OTksImV4cCI6MTYyNjYxNzk5OX0.Xi5Hu1X6YYDq4h-oMY3N3lLjZ1sgrHOtelE2lpzik1o"
}
```

## Middleware for Authentication

Now, we'll establish a route that requires a user token in the header, which will be the JWT token we created before.

Add the logic code inside the `auth.js` in `middleware` folder. To test the middleware, create the /welcome route and edit `app.js` with a Welcome message.

When we try to access the `/welcome` route we just built without sending a token in the header with the `x-access-token` key, we get the Message

Invoke the url:

`curl --location --request GET 'localhost:4001/welcome'`

this is the respose:
`A token is required for authentication!`

now, send the token in the header:

```
curl --location --request GET 'localhost:4001/welcome' \
--header 'x-access-token: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoiNjBmMzU3NzMzMmYyYTc0NTU2MDAzOGY1IiwiZW1haWwiOiJjYWZhcmlhc0B2aWV3bmV4dC5jb20iLCJpYXQiOjE2MjY2MjQ0NzMsImV4cCI6MTYyNjY0MjQ3M30.9hAtrSuYH2Hlhpdvo3-bt9wvgoGTAARO1LIJfthV5DI'
```

this is the respose:
`Welcome to FreeCodeCamp 🙌`

## Implement Cross-Origin Resource Sharing (CORS)

CORS is a Node.js package that provides a Connect/Express middleware that you can. use to enable CORS with a variety of parameters.

- It's easy to use (Enable All CORS Requests)

Adding the following snippet to app.js allows us to add CORS to our application and enable all CORS requests.

```
const cors = require("cors") //Newly added
const app = express()

app.use(cors()) // Newly added


app.use(express.json({ limit: "50mb" }))
```

> You can enable CORS for a single route. Using the /welcome route as an example, you can activate CORS for a single route in your application by adding the following snippet in app.js:
> ` app.get('/welcome', cors(), auth, (req, res) => { ... `

### Configure CORS

We can set options in the CORS package by adding parameters to configure it, as shown below:

```
const corsOptions = {
  origin: 'http://example.com',
  optionsSuccessStatus: 200 // for some legacy browsers
}
```
