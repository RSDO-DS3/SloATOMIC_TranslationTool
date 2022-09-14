const { Schema, model } = require('mongoose');

const TrainRecordSchema = new Schema(
    {
        assignedUser: { type: Schema.Types.String, default: "None" },
        markedForLater: { type: Schema.Types.Boolean, default: false },
        orighead: String,
        origtail: String,
        origedge: String,
        head: String,
        edge: String,
        tail: String,
        newHead: { type: Schema.Types.String, default: function () { if (this.head) return this.head; else return null; } },
        newEdge: { type: Schema.Types.String, default: function () { if (this.edge) return this.edge; else return null; } },
        newTail: { type: Schema.Types.String, default: function () { if (this.tail) return this.tail; else return null; } },
        edited: { type: Schema.Types.Boolean, default: false },
        revisions: [{type: Schema.Types.ObjectId, ref: 'Revision'}]
    }
);

const TrainRecord = model('TrainRecord', TrainRecordSchema, 'train');

module.exports = TrainRecord; 