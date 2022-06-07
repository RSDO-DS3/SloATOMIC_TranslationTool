/**/
db = db.getSiblingDB('rsdo');

function numbering(col){
    var cursor = col.find().sort({_id: 1}); 
    var bulkOp = col.initializeOrderedBulkOp();
    var count = 0; 
    var batchSize = 5000;
    while(cursor.hasNext()){
        var docSlo = cursor.next(); 
        bulkOp.find({'_id': docSlo._id}).updateOne({
            '$set' : {'rownum' : ++count}
        });
        if(count % batchSize == 0){
            bulkOp.execute();   
            bulkOp = col.initializeOrderedBulkOp();
            print('Updated ' + count + ' docs...');
        }        
    }
    if(count > 0){
        bulkOp.execute();
    }
}

numbering(db.dev);
numbering(db.test);
numbering(db.train);
