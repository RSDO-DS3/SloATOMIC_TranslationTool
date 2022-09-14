const Relation = require('../models/Relation');
const Defaultcomment = require('../models/DefaultComment');
const DevRecord = require('../models/DevRecord');
const TrainRecord = require('../models/TrainRecord');
const TestRecord = require('../models/TestRecord');
const User = require('../models/User')
const Revision = require('../models/Revision');

const fs = require('fs');
const {MongoClient} = require("mongodb");

// const csv = require('csv')

class RecordController {

    static async getPercentageOfFilesOnly(model, percentage) {
        // This method is redundant here as it was rewritten and moved into a script instead

        let allItems = await model.find().lean();

        let key = "origedge";
        let arr2 = [];
        allItems.forEach((x) => {
            // Checking if there is any object in arr2
            // which contains the key value
            if (arr2.some((val) => {
                return val[key] == x[key];
            })) {
                // If yes! then increase the occurrence by 1
                arr2.forEach((k) => {
                    if (k[key] === x[key]) {
                        k["occurrence"]++;
                    }
                })

            } else {
                // If not! Then create a new object initialize
                let a = {};
                a[key] = x[key];
                a["occurrence"] = 1;
                arr2.push(a);
            }
        })
        arr2.forEach((val, idx) => arr2[idx]["occurrence"] = Math.ceil(val["occurrence"] * percentage));

        let ret = [];
        for (const val of arr2) {
            let part = await model.find({
                key: val[key]
            }).limit(val["occurrence"]).lean();
            ret.push(...part);
        }


    }

    static async editFile(req, res, next) {
        try {
            let userId = res.locals?.user?._id;
            if (!userId) {
                return res.status(400).send("No user found");
            }

            let {page, perpage, unedited, file, filter_text} = req.query;
            if (!page) page = 1; else page = Number(page);
            if (!perpage) perpage = 10; else perpage = Number(perpage);
            if (!unedited) unedited = false; else unedited = true;
            file = file || 'dev.tsv';

            let queryparamsurl = `&file=${file}`;
            if (unedited) queryparamsurl += `&unedited=true`;
            if (perpage) queryparamsurl += `&perpage=${perpage}`;
            if (filter_text) queryparamsurl += `&filter_text=${filter_text}`;

            if (filter_text && !req.session?.queryparamsurlPrev?.includes(`filter_text=${filter_text}`)) {
                page = 1;
            }

            let filter = {};
            if (unedited) {
                filter['edited'] = {'$exists': false};
            }
            if (!res.locals.user.admin) {
                filter['assignedUser'] = {'$exists': true, '$eq': userId};
            }
            if (filter_text) {
                let search_for_oh, search_for_ot, search_for_h, search_for_t, search_for_ed;
                search_for_oh = search_for_ot = search_for_h = search_for_t = search_for_ed = `.*${filter_text}.*`;
                if (filter_text.startsWith("{")) {
                    search_for_oh = search_for_ot = search_for_h = search_for_t = search_for_ed = "";
                    let obj = JSON.parse(filter_text);
                    if (obj["oh"]) search_for_oh = obj["oh"];
                    if (obj["ot"]) search_for_ot = obj["ot"];
                    if (obj["h"]) search_for_h = obj["h"];
                    if (obj["t"]) search_for_t = obj["t"];
                    if (obj["ed"]) search_for_ed = obj["ed"];
                }

                filter['$or'] = [];

                if (search_for_oh)
                    filter['$or'].push({'orighead': {'$regex': search_for_oh}});
                if (search_for_ot)
                    filter['$or'].push({'origtail': {'$regex': search_for_ot}});
                if (search_for_h)
                    filter['$or'].push({'head': {'$regex': search_for_h}});
                if (search_for_t)
                    filter['$or'].push({'tail': {'$regex': search_for_t}});
                if (search_for_ed)
                    filter['$or'].push({'edge': {'$regex': search_for_ed}});
            }

            let model = DevRecord;
            if (file == 'train.tsv') model = TrainRecord;
            if (file == 'test.tsv') model = TestRecord;

            res.locals.total = Math.ceil((await model.count(filter)) / perpage);
            if (page > res.locals.total) page = res.locals.total;

            res.locals.page = page;
            res.locals.file = file;
            res.locals.filter_text = filter_text;
            res.locals.unedited = unedited;

            res.locals.queryparamsurl = queryparamsurl;
            req.session.queryparamsurlPrev = queryparamsurl;

            res.locals.perpage = perpage;
            res.locals.relations = await Relation.find().lean();
            res.locals.defaultComments = await Defaultcomment.find().lean();

            res.locals.records = await model.find(filter)
                .populate({
                    path: 'revisions',
                    populate: {path: 'user'}
                }).skip((page - 1) * perpage).limit(perpage).lean();


            // await this.getPercentageOfFilesOnly(model, 0.1);

            res.render('index');
        } catch (err) {
            next(err);
        }
    }

    static async updateRecordsHeads(req, res, next) {
        try {
            let {newHeadVal, oldHeadVal, file} = req.body;

            let recordModel = DevRecord;
            if (file == 'train.tsv') recordModel = TrainRecord;
            if (file == 'test.tsv') recordModel = TestRecord;

            // let records1 = await recordModel.find({head: oldHeadVal}).lean();
            // let records1 = [];
            // let records2 = await recordModel.find({newHead: oldHeadVal, assignedUser: res.locals?.user?._id}).lean();
            // let records1 = await recordModel.find({head: oldHeadVal, assignedUser: res.locals?.user?._id}).lean();
            // let records = [...records1, ...records2]
            let records = await recordModel.find({
                '$or': [{newHead: oldHeadVal}, {head: oldHeadVal}],
                assignedUser: res.locals?.user?._id
            }).lean();

            records = records.filter(r => !r.newHead || r.newHead === oldHeadVal);
            if (records.length === 0) {
                return res.status(404).send("No records found");
            }

            let replaced = records.length;
            let prog = [];
            for (const record of records) {
                if (record.hasOwnProperty('newHead') && record.newHead !== oldHeadVal) continue;
                req.body['id'] = record._id;
                req.body['head'] = newHeadVal;
                req.body['tail'] = record.newTail ?? record.tail;
                req.body['comment'] = "Edited head with head mass editor";
                req.body['massEditing'] = true;
                let rec = await this.updateRecord(req, res, next);
                if (rec === false) {
                    return res.status(500).send("Error at head mass update.");
                } else if (rec === true) {
                    replaced -= 1; // temporary, todo: Delete when resolving the other two todos at ownership bewlow
                    continue;
                }
                prog = rec.numRecordsAssigned;
            }
            let ret = {progress: prog, updated: replaced}

            res.status(200).send(ret);
        } catch (err) {
            console.error(err);
            res.status(500).send(err.message);
        }
    }

    static async updateRecordMany(req, res, next) {
        try {
            let {toUpdate} = req.body;

            for (const toProc of toUpdate) {
                req.body['id'] = toProc.id;
                req.body['head'] = toProc.head;
                req.body['tail'] = toProc.tail;
                req.body['comment'] = toProc.comment;
                req.body['file'] = toProc.file;
                req.body['unchanged'] = toProc.unchanged;
                let rec = await this.updateRecord(req, res, next);
                if (rec === false) {
                    return res.status(500).send("Error at mass update.");
                }
                // in case you'd need records
            }

            res.status(200).send("OK");

        } catch (err) {
            console.error(err);
            res.status(500).send(err.message);
        }
    }

    static async updateRecord(req, res, next) {
        let massEditing = false;
        try {
            // todo, if the users edit is so that it reverts the document to the initial state, unset the edited var
            let {id, head, tail, file, comment, unchanged, massEditing, skipping} = req.body;
            skipping = skipping == 1;
            head = head?.trim();
            tail = tail?.trim();
            comment = comment?.trim();
            if (unchanged) {
                comment = "Sistemski komentar: Uporabnik označil prevod kot spremenljiv"
            }

            let recordModel = DevRecord;
            if (file == 'train.tsv') recordModel = TrainRecord;
            if (file == 'test.tsv') recordModel = TestRecord;

            let record = await recordModel.findById(id);
            if (record.assignedUser != req.session.user._id && !req.session.user.admin) {
                // if (massEditing) return false; // temp comment
                if (massEditing) return true; // todo: some kind of info display for how many were not owned
                return res.status(403).send("You don't have acess to this record anymore");
            }
            let prevH = record.newHead ?? record['head'];
            let prevT = record.newTail ?? record['tail'];
            if (prevH === head && prevT === tail && !unchanged && !comment && !skipping) {
                if (massEditing) return false;
                return res.status(400).send("No changes were made.");
            }


            let subOneFromProgress = false;
            let addOneToProgress = false;
            if (record.markedForLater && !skipping) addOneToProgress = true;

            if (!skipping) {
                record.edited = true;
                record.markedForLater = null;
            } else {
                if (record.edited && !record.markedForLater) subOneFromProgress = true;
                record.edited = null;
                record.markedForLater = true;
                comment = "Skipped / Marked for later."
            }

            let revision = {}
            if (!skipping) {
                let r_head, r_tail, exh, ext, lefth, leftt;
                r_head = r_tail = exh = ext = lefth = leftt = "";
                if (!record.revisions?.length) {
                    if (record['head'] !== head) exh = ` --> ${head}`
                    if (record['tail'] !== tail) ext = ` --> ${tail}`
                    lefth = record['head'];
                    leftt = record['tail'];
                } else {
                    let rev = await Revision.findById(record.revisions.at(-1).toString());
                    rev.head = rev.head.split(' --> ').at(-1).trim();
                    rev.tail = rev.tail.split(' --> ').at(-1).trim();
                    if (rev.head !== head) exh = ` --> ${head}`
                    if (rev.tail !== tail) ext = ` --> ${tail}`
                    lefth = rev.head;
                    leftt = rev.tail;
                }

                r_head = `${lefth}${exh}`;
                r_tail = `${leftt}${ext}`;

                revision = await Revision.create({
                    head: r_head,
                    edge: record.edge,
                    tail: r_tail,
                    comment,
                    user: req.session.user
                });
                console.log(record, 'RECCCCCCCCCCC');
                if (!record.newHead && !record.newHead && record.revisions?.length >= 1) addOneToProgress = true;
                record.newHead = head;
                record.newEdge = record.edge;  // this actually stays the same
                record.newTail = tail;
                if (!record.revisions?.length) {
                    record.revisions = [revision];
                } else {
                    record.revisions.push(revision);
                }

                revision = revision.toObject();
            }

            revision.revertedBackToInitial = false;
            if ((record?.head === record?.newHead) && (record?.tail === record?.newTail) && !skipping && !unchanged) {
                record.newHead = null;
                record.newEdge = null;
                record.newTail = null;
                record.edited = null;
                subOneFromProgress = true;
                revision.revertedBackToInitial = true;
            }

            await record.save();

            let user = await User.findById(record.assignedUser);

            if (revision?.head) {
                if (record.assignedUser) {
                    if (file == 'dev.tsv' && (record.revisions.length === 1 || addOneToProgress)) user.numRecordsAssigned[0]++;
                    if (file == 'train.tsv' && (record.revisions.length === 1 || addOneToProgress)) user.numRecordsAssigned[2]++;
                    if (file == 'test.tsv' && (record.revisions.length === 1 || addOneToProgress)) user.numRecordsAssigned[4]++;
                    revision.numRecordsAssigned = user.numRecordsAssigned;
                } else {
                    revision.numRecordsAssigned = false;
                }
            }

            if (subOneFromProgress) {
                if (file == 'dev.tsv') user.numRecordsAssigned[0]--;
                if (file == 'train.tsv') user.numRecordsAssigned[2]--;
                if (file == 'test.tsv') user.numRecordsAssigned[4]--;
                revision.numRecordsAssigned = user.numRecordsAssigned;
            }

            user.save();
            req.session.user = user;

            if (massEditing) return revision;

            res.status(200).json(revision);
        } catch (err) {
            console.error(err);
            if (massEditing) return false;
            res.status(500).send(err.message);
        }
    }


    static async exportFile(req, res, next) {
        try {

            let {file, uid, self} = req.query; // req.params.file,  ?file=dev.tsv...
            self = self == '1';

            if (!self && !res.locals.user?.admin) {
                return res.status(403).send("Forbidden! Must be admin...")
            }

            if (!res.locals.user?.admin && (uid !== res.locals.user._id)) {
                return res.status(403).send("Forbidden! Can't export other user's documents as non admin...")
            }

            const {MongoClient} = require('mongodb');
            // or as an es module:
            // import { MongoClient } from 'mongodb'

            // Connection URL
            const url = process.env.DB_EXPORTING
            const client = new MongoClient(url);

            await client.connect();
            const db = client.db('rsdo');
            const collection = db.collection(file.replace('.tsv', ''));

            let filter = {}
            if (self) {
                filter['assignedUser'] = uid;
            }

            const findResult = await collection.find(filter).toArray();
            // console.log(findResult)

            let tempFile = 'out_temp_file.temp'

            let tsvHeader = 'id\thead\tedge\ttail\r\n';
            let tsvBody = findResult
                .map((val) => `${val._id}\t${val.newHead ?? val.head}\t${val.edge}\t${val.newTail ?? val.tail}`)
                .join('\r\n')
            let tsvOut = tsvHeader + tsvBody

            fs.writeFileSync(tempFile, tsvOut);

            let downloadName = `${file.replace('.tsv', '')}_${Date.now()}.tsv`;
            res.download(tempFile, downloadName, (err) => {
                if (err) {
                    console.log(err, "Export file error")
                }
                fs.unlinkSync(tempFile)
            });
        } catch (err) {
            console.error(err);
            res.status(500).send(err.message);
        }
    }

}

module.exports = RecordController; 