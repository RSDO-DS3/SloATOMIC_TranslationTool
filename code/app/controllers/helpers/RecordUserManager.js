const RecordCont = require('../Record')
const User = require('../../models/User');
const DevRecord = require('../../models/DevRecord');
const TrainRecord = require('../../models/TrainRecord');
const TestRecord = require('../../models/TestRecord');

class RecordUserManager {
    static async AssignRecordsToUser(user, numOfRecord, numOfAssignDev = 0, numOfAssignTrain = 0, numOfAssignTest = 0) {
        let userId = user._id.toString();

        numOfAssignDev = Number(numOfAssignDev)
        numOfAssignTrain = Number(numOfAssignTrain)
        numOfAssignTest = Number(numOfAssignTest)

        //let usr = await User.findById(userId);
        //console.log(usr);

        let remainingDev = await DevRecord.count({'assignedUser': {'$exists': false}});
        let remainingTrain = await TrainRecord.count({'assignedUser': {'$exists': false}});
        let remainingTest = await TestRecord.count({'assignedUser': {'$exists': false}});

        console.log(`Remaining unassigned:\nDev: ${remainingDev}\nTrain: ${remainingTrain}\nTest: ${remainingTest}`);

        let allRecs = remainingDev + remainingTrain + remainingTest;
        if (allRecs === 0) {
            console.log("NO MORE REMAINING RECORDS TO ASSIGN!!!");
            return;
        }

        if (numOfAssignDev === 0 && numOfAssignTrain === 0 && numOfAssignTest === 0) {
            numOfAssignDev = Math.round((remainingDev / allRecs) * numOfRecord);
            numOfAssignTrain = Math.round((remainingTrain / allRecs) * numOfRecord);
            numOfAssignTest = Math.round((remainingTest / allRecs) * numOfRecord);
            user.numRecordsAssigned = [0, numOfAssignDev, 0, numOfAssignTrain, 0, numOfAssignTest];
        } else {
            user.numRecordsAssigned[1] += numOfAssignDev;
            user.numRecordsAssigned[3] += numOfAssignTrain;
            user.numRecordsAssigned[5] += numOfAssignTest;
        }

        console.log(`Assigning this amount of records to ${user.name}:\nDev: ${numOfAssignDev}\nTrain: ${numOfAssignTrain}\nTest: ${numOfAssignTest}`);

        await user.save();

        try {
            for (const rec of [[DevRecord, numOfAssignDev], [TrainRecord, numOfAssignTrain], [TestRecord, numOfAssignTest]]) {
                let m = rec[0];
                let num = rec[1];
                if (num === 0) continue;
                let bw = []
                let docs = await m.find({'assignedUser': {'$exists': false}, 'edited': {'$exists': false}}).limit(num);
                for (const doc of docs) {
                    bw.push({"updateOne": {"filter": {"_id": doc._id.toString()}, "update": {"assignedUser": userId}}})
                }
                await m.bulkWrite(bw);
            }
        } catch (err) {
            console.log(err, "bulkwrite section error while assigning user to records");
        }
    }

    static async UnassignAllRecordsFromUser(user) {
        let userId = user._id.toString();
        user.numRecordsAssigned[1] = 0;
        user.numRecordsAssigned[3] = 0;
        user.numRecordsAssigned[5] = 0;
        await user.save();

        try {
            for (const rec of [DevRecord, TrainRecord, TestRecord]) {
                let bw = []
                let docs = await rec.find({'assignedUser': userId});
                for (const doc of docs) {
                    bw.push({
                        "updateOne": {
                            "filter": {"_id": doc._id.toString()},
                            "update": {"$unset": {"assignedUser": ""}}
                        }
                    })
                }
                await rec.bulkWrite(bw);
            }
        } catch (err) {
            console.log(err, "bulkwrite section error while removing user from records");
        }

    }
}

module.exports = RecordUserManager;