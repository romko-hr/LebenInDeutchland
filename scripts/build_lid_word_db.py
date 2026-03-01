#!/usr/bin/env python3
from __future__ import annotations

import csv
import re
import sqlite3
import subprocess
from collections import Counter, defaultdict
from pathlib import Path


ROOT = Path(__file__).resolve().parent.parent
PDF_PATH = ROOT / "data" / "official_bamf_questions.pdf"
TEXT_PATH = ROOT / "data" / "official_bamf_questions.txt"
STOPWORDS_PATH = ROOT / "data" / "german_stopwords.txt"
OUTPUT_TSV = ROOT / "data" / "lid_questions_general_bayern.tsv"
OUTPUT_DB = ROOT / "data" / "lid_words.sqlite3"

SOURCE_URL = (
    "https://www.bamf.de/SharedDocs/Anlagen/DE/Integration/Einbuergerung/"
    "gesamtfragenkatalog-lebenindeutschland.pdf?__blob=publicationFile&v=17"
)
TOKEN_RE = re.compile(r"[A-Za-zÄÖÜäöüß]+", re.UNICODE)
TASK_RE = re.compile(r"^Aufgabe\s+(\d+)$")
STATE_HEADER_RE = re.compile(r"^Fragen für das Bundesland (.+)$")
PAGE_RE = re.compile(r"^Seite\s+\d+\s+von\s+\d+$")
IMAGE_ROW_RE = re.compile(r"^Bild\s+\d+(?:\s+Bild\s+\d+)+$")
IMAGE_OPTION_RE = re.compile(r"^Bild\s+\d+$")
NUMERIC_OPTION_RE = re.compile(r"^\d+$")
GERMAN_ADJECTIVE_STEMS = ("isch", "lich", "ig", "sam", "bar", "haft", "los")
GENDER_BASE_SUFFIXES = (
    "arbeiter",
    "arbeitnehmer",
    "arbeitgeber",
    "bürger",
    "kanzler",
    "minister",
    "präsident",
    "richter",
)
EXACT_LEMMA_MAP = {
    "abgeordneten": "abgeordnete",
    "arbeitet": "arbeiten",
    "arbeitgeberin": "arbeitgeber",
    "arbeitgeberinnen": "arbeitgeber",
    "arbeitnehmerinnen": "arbeitnehmer",
    "aufgaben": "aufgabe",
    "bekommt": "bekommen",
    "bundeskanzlerin": "bundeskanzler",
    "bundeslandes": "bundesland",
    "bundesländer": "bundesland",
    "bundespräsidenten": "bundespräsident",
    "bundespräsidentin": "bundespräsident",
    "bundesratspräsidentin": "bundesratspräsident",
    "bundestagspräsidentin": "bundestagspräsident",
    "bürgerin": "bürger",
    "bürgerinnen": "bürger",
    "darf": "dürfen",
    "deutsche": "deutsch",
    "deutschen": "deutsch",
    "deutscher": "deutsch",
    "deutschlands": "deutschland",
    "demokratische": "demokratisch",
    "demokratischen": "demokratisch",
    "einwohnerinnen": "einwohner",
    "entscheidet": "entscheiden",
    "erste": "erst",
    "europäische": "europäisch",
    "europäischen": "europäisch",
    "freie": "frei",
    "gab": "geben",
    "gehört": "gehören",
    "gehörte": "gehören",
    "genannt": "nennen",
    "gerichte": "gericht",
    "gesetze": "gesetz",
    "geht": "gehen",
    "gilt": "gelten",
    "heißt": "heißen",
    "heutige": "heutig",
    "jahren": "jahr",
    "jahre": "jahr",
    "jüdische": "jüdisch",
    "kinder": "kind",
    "länder": "land",
    "menschen": "mensch",
    "ministerpräsidentin": "ministerpräsident",
    "muss": "müssen",
    "nennt": "nennen",
    "parteien": "partei",
    "richterin": "richter",
    "schulen": "schule",
    "sozialer": "sozial",
    "soziale": "sozial",
    "spricht": "sprechen",
    "steht": "stehen",
    "teilnimmt": "teilnehmen",
    "verträge": "vertrag",
    "wählt": "wählen",
    "gewählt": "wählen",
    "war": "sein",
    "waren": "sein",
    "wurde": "werden",
    "wurden": "werden",
    "zweite": "zweit",
    "zweiten": "zweit",
}


def load_stopwords(path: Path) -> set[str]:
    with path.open("r", encoding="utf-8") as handle:
        return {
            line.strip().lower()
            for line in handle
            if line.strip() and not line.lstrip().startswith("#")
        }


def tokenize(text: str) -> list[str]:
    return [match.group(0).lower() for match in TOKEN_RE.finditer(text)]


def normalize_space(text: str) -> str:
    return " ".join(text.split())


def derive_lemma(word: str, vocabulary: set[str]) -> tuple[str, str]:
    if word in EXACT_LEMMA_MAP:
        return EXACT_LEMMA_MAP[word], "manual"

    if word.endswith("innen") and len(word) > 7:
        base = word[:-5]
        if base in vocabulary:
            return base, "heuristic"

    if word.endswith("in") and len(word) > 5:
        base = word[:-2]
        if base in vocabulary or base.endswith(GENDER_BASE_SUFFIXES):
            return base, "heuristic"

    if word.endswith("en") and len(word) > 4:
        stem = word[:-2]
        if stem in vocabulary or stem.endswith(GERMAN_ADJECTIVE_STEMS):
            return stem, "heuristic"

    if word.endswith("e") and len(word) > 4:
        stem = word[:-1]
        if stem in vocabulary:
            return stem, "heuristic"

    if word.endswith("er") and len(word) > 5:
        stem = word[:-2]
        if stem in vocabulary or stem.endswith(GERMAN_ADJECTIVE_STEMS):
            return stem, "heuristic"

    if word.endswith("es") and len(word) > 5:
        stem = word[:-2]
        if stem in vocabulary or stem.endswith(GERMAN_ADJECTIVE_STEMS):
            return stem, "heuristic"

    return word, "identity"


def ensure_text_extract() -> None:
    if TEXT_PATH.exists() and TEXT_PATH.stat().st_size > 0:
        return
    if not PDF_PATH.exists():
        raise FileNotFoundError(
            f"Missing {PDF_PATH}. Download the official BAMF PDF first."
        )

    jxa_script = f"""
ObjC.import('Foundation')
ObjC.import('PDFKit')
const pdfURL = $.NSURL.fileURLWithPath('{PDF_PATH.as_posix()}')
const outPath = '{TEXT_PATH.as_posix()}'
const doc = $.PDFDocument.alloc.initWithURL(pdfURL)
if (!doc) {{
  throw new Error('failed to open PDF')
}}
const parts = []
const pages = Number(doc.pageCount)
for (let i = 0; i < pages; i += 1) {{
  const page = doc.pageAtIndex(i)
  const text = page ? ObjC.unwrap(page.string || '') : ''
  if (text) {{
    parts.push(text)
  }}
  parts.push('\\n<<<PAGE_BREAK>>>\\n')
}}
const content = $(parts.join(''))
const ok = content.writeToFileAtomicallyEncodingError($(outPath), true, $.NSUTF8StringEncoding, null)
console.log(ok ? 'ok' : 'failed')
"""
    subprocess.run(
        ["osascript", "-l", "JavaScript"],
        input=jxa_script,
        text=True,
        check=True,
        capture_output=True,
    )
    if not TEXT_PATH.exists() or TEXT_PATH.stat().st_size == 0:
        raise RuntimeError("Failed to extract text from the official BAMF PDF.")


def finalize_question(question: dict[str, object] | None, parsed: list[dict[str, object]]) -> None:
    if question is None:
        return

    question_text = normalize_space(" ".join(question["question_lines"]))  # type: ignore[index]
    options = [
        normalize_space(" ".join(parts))
        for parts in question["option_lines"]  # type: ignore[index]
    ]

    section = question["section"]
    local_number = question["question_number_in_section"]
    if section == "general":
        question_id = int(local_number)
        section_name = "general"
        state_code = "DE"
    elif section == "Bayern":
        question_id = 300 + int(local_number)
        section_name = "state"
        state_code = "BY"
    else:
        return

    source_notes: list[str] = []
    if options and all(IMAGE_OPTION_RE.match(option) for option in options):
        source_notes.append("Official PDF uses image labels for answer options.")
    elif options and all(NUMERIC_OPTION_RE.match(option) for option in options):
        source_notes.append("Official PDF uses numeric-only answer options.")

    parsed.append(
        {
            "question_id": question_id,
            "section": section_name,
            "state_code": state_code,
            "question_number_in_section": int(local_number),
            "question_text": question_text,
            "option_a": options[0] if len(options) > 0 else "",
            "option_b": options[1] if len(options) > 1 else "",
            "option_c": options[2] if len(options) > 2 else "",
            "option_d": options[3] if len(options) > 3 else "",
            "source_notes": " ".join(source_notes),
        }
    )


def parse_official_questions(text: str) -> list[dict[str, object]]:
    parsed: list[dict[str, object]] = []
    current_section: str | None = None
    current_question: dict[str, object] | None = None

    for raw_line in text.splitlines():
        line = raw_line.strip()
        if not line or line == "<<<PAGE_BREAK>>>" or PAGE_RE.match(line):
            continue
        if line == "Teil I":
            finalize_question(current_question, parsed)
            current_question = None
            current_section = None
            continue
        if line == "Allgemeine Fragen":
            finalize_question(current_question, parsed)
            current_question = None
            current_section = "general"
            continue
        if line == "Teil II":
            finalize_question(current_question, parsed)
            current_question = None
            current_section = None
            continue

        state_match = STATE_HEADER_RE.match(line)
        if state_match:
            finalize_question(current_question, parsed)
            current_question = None
            current_section = state_match.group(1)
            continue

        task_match = TASK_RE.match(line)
        if task_match:
            finalize_question(current_question, parsed)
            current_question = {
                "section": current_section,
                "question_number_in_section": int(task_match.group(1)),
                "question_lines": [],
                "option_lines": [],
            }
            continue

        if current_question is None:
            continue

        if IMAGE_ROW_RE.match(line):
            continue

        if line.startswith(""):
            option_text = normalize_space(line[1:].strip())
            current_question["option_lines"].append([option_text])  # type: ignore[index]
            continue

        if current_question["option_lines"]:  # type: ignore[index]
            current_question["option_lines"][-1].append(line)  # type: ignore[index]
        else:
            current_question["question_lines"].append(line)  # type: ignore[index]

    finalize_question(current_question, parsed)
    parsed.sort(key=lambda row: int(row["question_id"]))
    return parsed


def write_tsv(rows: list[dict[str, object]]) -> None:
    with OUTPUT_TSV.open("w", encoding="utf-8", newline="") as handle:
        writer = csv.DictWriter(
            handle,
            fieldnames=[
                "question_id",
                "section",
                "state_code",
                "question_number_in_section",
                "question_text",
                "option_a",
                "option_b",
                "option_c",
                "option_d",
                "source_notes",
            ],
            delimiter="\t",
        )
        writer.writeheader()
        writer.writerows(rows)


def corpus_parts(row: dict[str, object]) -> list[str]:
    parts = [str(row["question_text"])]
    options = [
        str(row["option_a"]),
        str(row["option_b"]),
        str(row["option_c"]),
        str(row["option_d"]),
    ]
    if options and all(IMAGE_OPTION_RE.match(option) for option in options if option):
        return parts
    for option in options:
        if not option or IMAGE_OPTION_RE.match(option):
            continue
        parts.append(option)
    return parts


def build_database(rows: list[dict[str, object]], stopwords: set[str]) -> None:
    word_totals = Counter()
    word_totals_general = Counter()
    word_totals_bayern = Counter()
    question_usage = defaultdict(set)
    question_usage_general = defaultdict(set)
    question_usage_bayern = defaultdict(set)
    word_question_usage_rows: list[tuple[str, int, int]] = []
    question_sections: dict[int, str] = {}

    for row in rows:
        question_id = int(row["question_id"])
        section = str(row["section"])
        question_sections[question_id] = section
        token_counts = Counter()
        for part in corpus_parts(row):
            for token in tokenize(part):
                if token in stopwords:
                    continue
                token_counts[token] += 1

        for word, count in sorted(token_counts.items()):
            word_question_usage_rows.append((word, question_id, count))
            word_totals[word] += count
            question_usage[word].add(question_id)
            if section == "general":
                word_totals_general[word] += count
                question_usage_general[word].add(question_id)
            else:
                word_totals_bayern[word] += count
                question_usage_bayern[word].add(question_id)

    vocabulary = set(word_totals)
    lemma_map: dict[str, str] = {}
    lemma_map_rows: list[tuple[str, str, str]] = []
    lemma_variant_sets = defaultdict(set)
    for word in sorted(vocabulary):
        lemma, strategy = derive_lemma(word, vocabulary)
        lemma_map[word] = lemma
        lemma_map_rows.append((word, lemma, strategy))
        lemma_variant_sets[lemma].add(word)

    lemma_question_occurrences = defaultdict(int)
    for word, question_id, count in word_question_usage_rows:
        lemma = lemma_map[word]
        lemma_question_occurrences[(lemma, question_id)] += count

    lemma_totals = Counter()
    lemma_totals_general = Counter()
    lemma_totals_bayern = Counter()
    lemma_question_usage = defaultdict(set)
    lemma_question_usage_general = defaultdict(set)
    lemma_question_usage_bayern = defaultdict(set)
    lemma_question_usage_rows: list[tuple[str, int, int]] = []

    for (lemma, question_id), count in sorted(lemma_question_occurrences.items()):
        lemma_question_usage_rows.append((lemma, question_id, count))
        lemma_totals[lemma] += count
        lemma_question_usage[lemma].add(question_id)
        if question_sections[question_id] == "general":
            lemma_totals_general[lemma] += count
            lemma_question_usage_general[lemma].add(question_id)
        else:
            lemma_totals_bayern[lemma] += count
            lemma_question_usage_bayern[lemma].add(question_id)

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
                section TEXT NOT NULL,
                state_code TEXT NOT NULL,
                question_number_in_section INTEGER NOT NULL,
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

            CREATE TABLE word_question_usage (
                word TEXT NOT NULL,
                question_id INTEGER NOT NULL,
                occurrence_count INTEGER NOT NULL,
                PRIMARY KEY (word, question_id),
                FOREIGN KEY (question_id) REFERENCES source_questions(question_id)
            );

            CREATE TABLE word_frequency (
                word TEXT PRIMARY KEY,
                frequency_total INTEGER NOT NULL,
                frequency_general INTEGER NOT NULL,
                frequency_bayern INTEGER NOT NULL,
                question_count_total INTEGER NOT NULL,
                question_count_general INTEGER NOT NULL,
                question_count_bayern INTEGER NOT NULL
            );

            CREATE TABLE lemma_map (
                word TEXT PRIMARY KEY,
                lemma TEXT NOT NULL,
                strategy TEXT NOT NULL,
                FOREIGN KEY (word) REFERENCES word_frequency(word)
            );

            CREATE TABLE lemma_question_usage (
                lemma TEXT NOT NULL,
                question_id INTEGER NOT NULL,
                occurrence_count INTEGER NOT NULL,
                PRIMARY KEY (lemma, question_id),
                FOREIGN KEY (question_id) REFERENCES source_questions(question_id)
            );

            CREATE TABLE lemma_frequency (
                lemma TEXT PRIMARY KEY,
                frequency_total INTEGER NOT NULL,
                frequency_general INTEGER NOT NULL,
                frequency_bayern INTEGER NOT NULL,
                question_count_total INTEGER NOT NULL,
                question_count_general INTEGER NOT NULL,
                question_count_bayern INTEGER NOT NULL,
                variant_count INTEGER NOT NULL
            );

            CREATE VIEW ranked_word_frequency AS
            SELECT
                word,
                frequency_total,
                frequency_general,
                frequency_bayern,
                question_count_total,
                question_count_general,
                question_count_bayern,
                RANK() OVER (ORDER BY frequency_total DESC, word ASC) AS frequency_rank
            FROM word_frequency
            ORDER BY frequency_total DESC, word ASC;

            CREATE VIEW ranked_lemma_frequency AS
            SELECT
                lemma,
                frequency_total,
                frequency_general,
                frequency_bayern,
                question_count_total,
                question_count_general,
                question_count_bayern,
                variant_count,
                RANK() OVER (ORDER BY frequency_total DESC, lemma ASC) AS frequency_rank
            FROM lemma_frequency
            ORDER BY frequency_total DESC, lemma ASC;
            """
        )

        cursor.executemany(
            "INSERT INTO metadata(key, value) VALUES(?, ?)",
            [
                ("source_name", "BAMF Gesamtfragenkatalog Leben in Deutschland"),
                ("source_url", SOURCE_URL),
                ("source_version", "Stand 07.05.2025 (official source current on 2026-02-28)"),
                ("scope", "General questions 1-300 plus Bayern questions 301-310"),
                ("question_count_total", str(len(rows))),
                (
                    "tokenizer",
                    "Unicode letters only; punctuation, slashes, and hyphens split tokens",
                ),
                (
                    "lemmatizer",
                    "Corpus-specific German normalization: manual mappings plus conservative suffix heuristics.",
                ),
            ],
        )

        cursor.executemany(
            """
            INSERT INTO source_questions(
                question_id,
                section,
                state_code,
                question_number_in_section,
                question_text,
                option_a,
                option_b,
                option_c,
                option_d,
                source_notes
            ) VALUES(
                :question_id,
                :section,
                :state_code,
                :question_number_in_section,
                :question_text,
                :option_a,
                :option_b,
                :option_c,
                :option_d,
                :source_notes
            )
            """,
            rows,
        )

        cursor.executemany(
            "INSERT INTO stopwords(word) VALUES(?)",
            [(word,) for word in sorted(stopwords)],
        )

        cursor.executemany(
            """
            INSERT INTO word_question_usage(word, question_id, occurrence_count)
            VALUES(?, ?, ?)
            """,
            word_question_usage_rows,
        )

        cursor.executemany(
            """
            INSERT INTO word_frequency(
                word,
                frequency_total,
                frequency_general,
                frequency_bayern,
                question_count_total,
                question_count_general,
                question_count_bayern
            ) VALUES(?, ?, ?, ?, ?, ?, ?)
            """,
            [
                (
                    word,
                    total,
                    word_totals_general[word],
                    word_totals_bayern[word],
                    len(question_usage[word]),
                    len(question_usage_general[word]),
                    len(question_usage_bayern[word]),
                )
                for word, total in sorted(word_totals.items(), key=lambda item: (-item[1], item[0]))
            ],
        )

        cursor.executemany(
            "INSERT INTO lemma_map(word, lemma, strategy) VALUES(?, ?, ?)",
            lemma_map_rows,
        )

        cursor.executemany(
            """
            INSERT INTO lemma_question_usage(lemma, question_id, occurrence_count)
            VALUES(?, ?, ?)
            """,
            lemma_question_usage_rows,
        )

        cursor.executemany(
            """
            INSERT INTO lemma_frequency(
                lemma,
                frequency_total,
                frequency_general,
                frequency_bayern,
                question_count_total,
                question_count_general,
                question_count_bayern,
                variant_count
            ) VALUES(?, ?, ?, ?, ?, ?, ?, ?)
            """,
            [
                (
                    lemma,
                    total,
                    lemma_totals_general[lemma],
                    lemma_totals_bayern[lemma],
                    len(lemma_question_usage[lemma]),
                    len(lemma_question_usage_general[lemma]),
                    len(lemma_question_usage_bayern[lemma]),
                    len(lemma_variant_sets[lemma]),
                )
                for lemma, total in sorted(
                    lemma_totals.items(),
                    key=lambda item: (-item[1], item[0]),
                )
            ],
        )

        connection.commit()
    finally:
        connection.close()


def main() -> None:
    ensure_text_extract()
    stopwords = load_stopwords(STOPWORDS_PATH)
    text = TEXT_PATH.read_text(encoding="utf-8")
    rows = parse_official_questions(text)
    write_tsv(rows)
    build_database(rows, stopwords)


if __name__ == "__main__":
    main()
