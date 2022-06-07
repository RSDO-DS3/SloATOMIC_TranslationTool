db = db.getSiblingDB('rsdo');
db.createUser({ user: dbUser, pwd: dbPass, roles: ["dbOwner"] });