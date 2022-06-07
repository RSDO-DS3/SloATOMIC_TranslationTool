# Skripta za zlivanje train.tsv - predolga za Excel
import os
import sys

train = open('train.tsv', 'r', encoding='utf8')
traineng = open('train-eng.tsv', 'r', encoding='utf8')

out = open('out.tsv', 'w', encoding='utf8')

first = True

for trainline in train:
    parts = trainline.replace('\r', '').replace('\n', '').split('\t')
    partseng = traineng.readline().replace('\r', '').replace('\n', '').split('\t')
    if first:
        out.write(
            f'orighead\torigedge\torigtail\t{parts[0]}\t{parts[1]}\t{parts[2]}\n')
        first = False
    else:
        out.write(
            f'{partseng[0]}\t{partseng[1]}\t{partseng[2]}\t{parts[0]}\t{parts[1]}\t{parts[2]}\n')
