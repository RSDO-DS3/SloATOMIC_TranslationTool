const {Schema, model} = require('mongoose');

const revisionSchema = new Schema(
    {
        head: String,
        edge: String,
        tail: String,
        user: {type: Schema.Types.ObjectId, ref: 'User'},
        comment: String,
        createdAt: {type: Schema.Types.Date, default: Date.now},
        file: String
    }
);

const Revision = model('Revision', revisionSchema);

module.exports = Revision; 