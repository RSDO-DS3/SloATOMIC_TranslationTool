FROM mongo 

# Translations
COPY tsv_10percent/dev_smaller_0.1.tsv /data/dev.tsv
COPY tsv_10percent/train_smaller_0.1.tsv /data/train.tsv
COPY tsv_10percent/test_smaller_0.1.tsv /data/test.tsv
COPY ./user.tsv /data/user.tsv

COPY ./relations.tsv /data/relations.tsv

# Seeding scripts 
COPY ./createUser.js /data/createUser.js
COPY ./createRowNumbering.js /data/createRowNumbering.js

COPY ./entrypoint.sh /app/entrypoint.sh

ENTRYPOINT [ "/app/entrypoint.sh" ]