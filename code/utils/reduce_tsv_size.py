import math

import pandas as pd


def count_lines_enumrate(file_name):
    fp = open(file_name, 'r')
    for line_count, line in enumerate(fp):
        pass
    return line_count


def get_reduced_tsvs(tsv_loc_base_path, tsv_files, new_size_ratio, save_to):
    for tsv_fn in tsv_files:
        key = "origedge"

        file = f"{tsv_loc_base_path}/{tsv_fn}.tsv"
        num_lines = count_lines_enumrate(file)
        chunksize = 10000
        tsv = pd.read_csv(file, sep='\t', iterator=True, chunksize=chunksize, on_bad_lines='warn')

        # get relations ratio
        relations = {}
        for tsv_part in tsv:
            for relation in tsv_part[key]:
                try:
                    relations[relation] += 1
                except:
                    relations[relation] = 0

        # set new allowed max
        relations = {k: math.ceil(v * new_size_ratio) for (k, v) in relations.items()}

        # loop again, this time reading until reaching the limit

        # tsv = pd.read_csv(file, sep='\t', iterator=True, chunksize=chunksize)
        with open(file, "r", encoding="utf-8") as in_file:
            head = in_file.readline()
            with open(f"{save_to}/{tsv_fn}_smaller_{new_size_ratio}.tsv", "w", encoding="utf-8") as out_file:
                # head = '\t'.join(pd.read_csv(file, sep='\t', nrows=1).columns) + '\n'
                out_file.write(head)
                idx = head.split('\t').index(key)
                for in_line in in_file:
                    # out_file.write(tsv.head())
                    rel = in_line.split('\t')[idx]
                    if relations[rel] > 0:
                        relations[rel] -= 1
                        out_file.write(in_line)

        print(f"Done with {tsv_fn}")


if __name__ == '__main__':
    reduction_ratio = 0.1
    tsv_location = "C:/Users/kikiw/Desktop/projects/RSDO_Semanticna_Mreza/code/dbseed"
    tsv_files = ["dev", "test", "train"]
    # tsv_files = ["dev"]
    get_reduced_tsvs(tsv_location, tsv_files, reduction_ratio, ".")
