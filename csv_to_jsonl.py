#!/usr/bin/env python3

import csv, json, argparse, sys
from pathlib import Path

def main():
    p = argparse.ArgumentParser(description="Convert CSV to JSON Lines (JSONL).")
    p.add_argument("input_csv")
    p.add_argument("output_jsonl")
    p.add_argument("--encoding", default="utf-8-sig")
    p.add_argument("--dialect", default=None)
    p.add_argument("--delimiter", default=None)
    args = p.parse_args()
    in_path, out_path = Path(args.input_csv), Path(args.output_jsonl)

    if not in_path.exists():
        print(f"Input file not found: {in_path}", file=sys.stderr)
        sys.exit(1)

    with in_path.open("r", encoding=args.encoding, newline="") as f:
        sample = f.read(65536); f.seek(0)
        if args.delimiter:
            dialect = csv.excel; dialect.delimiter = args.delimiter
        elif args.dialect:
            dialect = getattr(csv, args.dialect, csv.excel)
        else:
            try:
                dialect = csv.Sniffer().sniff(sample, delimiters=[",",";","|","\t"])
            except csv.Error:
                dialect = csv.excel
        reader = csv.DictReader(f, dialect=dialect)
        with out_path.open("w", encoding="utf-8", newline="\n") as out_f:
            count = 0
            for row in reader:
                clean = {k: (v if v is not None else "") for k, v in row.items()}
                out_f.write(json.dumps(clean, ensure_ascii=False) + "\n")
                count += 1
    print(f"Done. Wrote {count} JSON lines to {out_path}")

if __name__ == "__main__":
    main()
