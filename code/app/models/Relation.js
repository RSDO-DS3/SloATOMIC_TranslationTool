const {Schema, model, Types} = require('mongoose');

const relationSchema = new Schema(
    {
        username: String,
        password: String,
        name: String
    }
);

const Relation = model('Relation', relationSchema, 'relations');

module.exports = Relation; 