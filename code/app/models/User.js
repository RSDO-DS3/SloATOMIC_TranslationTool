const {Schema, model, Types} = require('mongoose');

const userSchema = new Schema(
    {
        username: String,
        password: String,
        email: String,
        name: String,
        organisation: String,
        admin: {type: Boolean, default: false},
        avatar: String,
        numRecordsAssigned: [{type: Schema.Types.Number}] // [#devDone, #dev, #trainDone, #train, #testDone, #test]
    }
);

userSchema.virtual('initials').get(function () {
    return this.name.split(' ').map(s => s[0]).join('');
});

userSchema.set('toObject', {getters: true});


const User = model('User', userSchema);

module.exports = User; 