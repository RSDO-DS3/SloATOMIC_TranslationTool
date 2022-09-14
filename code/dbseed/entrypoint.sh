#!/bin/bash
found=$(mongo --host mongodb://db:27017/rsdo --authenticationDatabase admin --username $DBUSER --password $DBPASS  --eval "db.dev.findOne();" | grep head | wc -c)
echo $found

if [ $found -eq "0" ]; then
    echo "Seeding database....."
    mongoimport --host db --authenticationDatabase admin --username $DBUSER --password $DBPASS --db rsdo --collection dev --type tsv --file /data/dev.tsv --headerline 
    mongoimport --host db --authenticationDatabase admin --username $DBUSER --password $DBPASS --db rsdo --collection test --type tsv  --file /data/test.tsv --headerline 
    mongoimport --host db --authenticationDatabase admin --username $DBUSER --password $DBPASS --db rsdo --collection train --type tsv --file /data/train.tsv --headerline 
    mongoimport --host db --authenticationDatabase admin --username $DBUSER --password $DBPASS --db rsdo --collection relations --type tsv --file /data/relations.tsv --headerline 
    mongoimport --host db --authenticationDatabase admin --username $DBUSER --password $DBPASS --db rsdo --collection defaultComments --type tsv --file /data/defaultComments.tsv --headerline
    echo "Adding admin user....."
    mongoimport --host db --authenticationDatabase admin --username $DBUSER --password $DBPASS --db rsdo --collection users --type tsv --file /data/user.tsv --headerline     
    mongo  --host db --authenticationDatabase admin --username $DBUSER --password $DBPASS --eval "var dbUser = '$DBSAFEUSER'; var dbPass='$DBSAFEPASS'"  /data/createUser.js
    # mongo  --host db --authenticationDatabase admin --username $DBUSER --password $DBPASS  /data/createRowNumbering.js
else 
    echo "DB already seeded, skipping...."
fi
