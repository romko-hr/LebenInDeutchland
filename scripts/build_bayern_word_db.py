#!/usr/bin/env python3
from __future__ import annotations

import csv
import re
import sqlite3
from collections import Counter, defaultdict
from pathlib import Path


ROOT = Path(__file__).resolve().parent.parent
QUESTIONS_TSV = ROOT / "data" / "bayern_questions.tsv"
STOPWORDS_TXT = ROOT / "data" / "bayern_stopwords.txt"
OUTPUT_DB = ROOT / "data" / "bayern_words.sqlite3"

TOKEN_RE = re.compile(r"[A-Za-zÄÖÜäöüß]+", re.UNICODE)
IMAGE_OPTION_RE = re.compile(r"^Bild\s+\d+$")


def load_stopwords(path: Path) -> set[str]:
    with path.open("r", encoding="utf-8") as handle:
        return {
            line.strip().lower()
            for line in handle
            if line.strip() and not line.lstrip().startswith("#")
        }


def tokenize(text: str) -> list[str]:
    return [match.group(0).lower() for match in TOKEN_RE.finditer(text)]


def main() -> None:
    stopwords = load_stopwords(STOPWORDS_TXT)
    frequency = Counter()
    question_usage: dict[str, set[int]] = defaultdict(set)
    rows: list[dict[str, str]] = []

    with QUESTIONS_TSV.open("r", encoding="utf-8", newline="") as handle:
        reader = csv.DictReader(handle, delimiter="\t")
        for row in reader:
            rows.append(row)
            question_id = int(row["question_id"])
            corpus_parts = [row["question"]]
            options = [row[key] for key in ("option_a", "option_b", "option_c", "option_d") if row[key]]
            if not (options and all(IMAGE_OPTION_RE.match(option) for option in options)):
                for option in options:
                    if not IMAGE_OPTION_RE.match(option):
                        corpus_parts.append(option)
            joined_text = " ".join(corpus_parts)
            for token in tokenize(joined_text):
                if token in stopwords:
                    continue
                frequency[token] += 1
                question_usage[token].add(question_id)

    if OUTPUT_DB.exists():
        OUTPUT_DB.unlink()

    connection = sqlite3.connect(OUTPUT_DB)
    try:
        cursor = connection.cursor()
        cursor.executescript(
            """
            CREATE TABLE metadata (
                key TEXT PRIMARY KEY,
                value TEXT NOT NULL
            );

            CREATE TABLE source_questions (
                question_id INTEGER PRIMARY KEY,
                question_text TEXT NOT NULL,
                option_a TEXT,
                option_b TEXT,
                option_c TEXT,
                option_d TEXT,
                source_notes TEXT
            );

            CREATE TABLE stopwords (
                word TEXT PRIMARY KEY
            );

            CREATE TABLE word_frequency (
                word TEXT PRIMARY KEY,
                frequency INTEGER NOT NULL,
                question_count INTEGER NOT NULL
            );

            CREATE VIEW ranked_word_frequency AS
            SELECT
                word,
                frequency,
                question_count,
                RANK() OVER (ORDER BY frequency DESC, word ASC) AS frequency_rank
            FROM word_frequency
            ORDER BY frequency DESC, word ASC;
            """
        )

        cursor.executemany(
            "INSERT INTO metadata(key, value) VALUES(?, ?)",
            [
                ("source_name", "BAMF Gesamtfragenkatalog Leben in Deutschland"),
                (
                    "source_url",
                    "https://www.bamf.de/SharedDocs/Anlagen/DE/Integration/Einbuergerung/gesamtfragenkatalog-lebenindeutschland.pdf?__blob=publicationFile&v=17",
                ),
                ("source_version", "Stand 07.05.2025 (official source current on 2026-02-28)"),
                ("scope", "Questions 301-310 for Bayern only"),
                ("tokenizer", "Unicode letters only; punctuation, slashes, and hyphens split tokens"),
            ],
        )

        cursor.executemany(
            """
            INSERT INTO source_questions(
                question_id, question_text, option_a, option_b, option_c, option_d, source_notes
            ) VALUES(
                :question_id, :question, :option_a, :option_b, :option_c, :option_d, :source_notes
            )
            """,
            rows,
        )

        cursor.executemany(
            "INSERT INTO stopwords(word) VALUES(?)",
            [(word,) for word in sorted(stopwords)],
        )

        cursor.executemany(
            "INSERT INTO word_frequency(word, frequency, question_count) VALUES(?, ?, ?)",
            [
                (word, count, len(question_usage[word]))
                for word, count in sorted(frequency.items(), key=lambda item: (-item[1], item[0]))
            ],
        )

        connection.commit()
    finally:
        connection.close()


if __name__ == "__main__":
    main()
