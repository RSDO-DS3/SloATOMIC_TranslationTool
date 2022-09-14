const {Schema, model, Types} = require('mongoose');

const defaultCommentSchema = new Schema(
    {
        comment: String,
    }
);

const Relation = model('DefaulComments', defaultCommentSchema, 'defaultComments');

module.exports = Relation;