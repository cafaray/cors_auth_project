use admin

db.createUser({
    user: 'mongoadmin',
    pwd: 'mongoadmin',
    // roles: [ { role: "userAdminAnyDatabase", db: "admin" }, "readWriteAnyDatabase" ]
    roles: [
        { role: "userAdminAnyDatabase", db: "admin" }, 
        { role: 'dbOwner', db: 'application_database' },
        "readWriteAnyDatabase"
    ],
});