#!/usr/bin/env python3
"""Build a static quiz dataset with answer keys and Ukrainian translations."""

from __future__ import annotations

import csv
import json
import time
from pathlib import Path
from typing import Any
from urllib.error import HTTPError, URLError
from urllib.parse import quote
from urllib.request import Request, urlopen

ROOT = Path(__file__).resolve().parent.parent
TSV_PATH = ROOT / "data" / "lid_questions_general_bayern.tsv"
OUTPUT_PATH = ROOT / "web" / "questions-bank.js"

SOURCE_URL = "https://lebenindeutsch.land/api/download-questions"
TRANSLATE_URL = "https://translate.googleapis.com/translate_a/single"
BATCH_MARKER = "ZXCVSEPZXCV"
BATCH_SEPARATOR = f"\n{BATCH_MARKER}\n"

FALLBACK_TRANSLATIONS = {
    "Bild 1": "Зображення 1",
    "Bild 2": "Зображення 2",
    "Bild 3": "Зображення 3",
    "Bild 4": "Зображення 4",
}


def load_official_rows() -> list[dict[str, str]]:
    with TSV_PATH.open("r", encoding="utf-8", newline="") as handle:
        rows = list(csv.DictReader(handle, delimiter="\t"))

    rows.sort(key=lambda row: int(row["question_id"]))
    if len(rows) != 310:
        raise ValueError(f"Expected 310 official rows, got {len(rows)}")

    return rows


def fetch_answer_source() -> list[dict[str, Any]]:
    payload = json.dumps(
        {
            "include_germany": True,
            "bundeslaender": ["BY"],
            "format": "json",
            "language": "de",
        }
    ).encode("utf-8")
    request = Request(
        SOURCE_URL,
        data=payload,
        headers={
            "Content-Type": "application/json",
            "User-Agent": "Mozilla/5.0",
        },
        method="POST",
    )

    with urlopen(request, timeout=30) as response:
        payload_data = json.loads(response.read().decode("utf-8"))

    questions = payload_data["content"]["questions"]
    if len(questions) != 310:
        raise ValueError(f"Expected 310 answer records, got {len(questions)}")

    return questions


def normalize_text(value: str) -> str:
    normalized = " ".join(value.replace("…", "...").split())
    normalized = normalized.replace(" / ", "/").replace(" /", "/").replace("/ ", "/")
    normalized = normalized.replace("„", '"').replace("“", '"').replace("‚", "'").replace("‘", "'")
    return normalized.strip().casefold()


def correct_index_for(source_question: dict[str, Any]) -> int:
    correct_answer = normalize_text(source_question["correct_answer"])
    normalized_options = [normalize_text(option) for option in source_question["options"]]

    for index, option in enumerate(normalized_options):
        if option == correct_answer:
            return index

    raise ValueError(f"Could not find correct answer for source question {source_question['id']}")


def translate_batch(texts: list[str], cache: dict[str, str]) -> None:
    pending = []

    for text in texts:
        stripped = text.strip()
        if not stripped:
            continue
        if stripped in FALLBACK_TRANSLATIONS:
            cache[stripped] = FALLBACK_TRANSLATIONS[stripped]
            continue
        if stripped in cache:
            continue
        pending.append(stripped)

    if not pending:
        return

    joined = BATCH_SEPARATOR.join(pending)
    query = f"{TRANSLATE_URL}?client=gtx&sl=de&tl=uk&dt=t&q={quote(joined, safe='')}"
    request = Request(query, headers={"User-Agent": "Mozilla/5.0"})

    for attempt in range(4):
        try:
            with urlopen(request, timeout=30) as response:
                payload = json.loads(response.read().decode("utf-8"))
            translated = "".join(part[0] for part in payload[0] if part and part[0]).strip()
            translated_parts = translated.split(BATCH_SEPARATOR)
            if len(translated_parts) != len(pending):
                raise ValueError("Unexpected translation batch split")
            for source, target in zip(pending, translated_parts):
                cache[source] = target.strip()
            time.sleep(0.08)
            return
        except (HTTPError, URLError, TimeoutError, ValueError) as error:
            if attempt == 3:
                raise RuntimeError(
                    f"Translation batch failed for {len(pending)} texts"
                ) from error
            time.sleep(0.6 * (attempt + 1))

    raise RuntimeError(f"Translation batch failed for {len(pending)} texts")


def translate_text(text: str, cache: dict[str, str]) -> str:
    stripped = text.strip()
    if not stripped:
        return ""

    if stripped in FALLBACK_TRANSLATIONS:
        return FALLBACK_TRANSLATIONS[stripped]

    if stripped not in cache:
        translate_batch([stripped], cache)

    return cache[stripped]


def verify_alignment(rows: list[dict[str, str]], source_questions: list[dict[str, Any]]) -> None:
    for index, (row, source_question) in enumerate(zip(rows, source_questions), start=1):
        local_id = int(row["question_id"])
        source_id = source_question["id"]

        if local_id <= 300 and source_id != str(local_id):
            raise ValueError(
                f"Question order mismatch at position {index}: local {local_id}, source {source_id}"
            )

        if local_id > 300 and not str(source_id).startswith("BL_"):
            raise ValueError(
                f"Expected Bayern source id at position {index}, got {source_id!r}"
            )


def build_bank() -> list[dict[str, Any]]:
    rows = load_official_rows()
    source_questions = fetch_answer_source()
    verify_alignment(rows, source_questions)

    cache: dict[str, str] = {}
    all_texts = []
    for source_question in source_questions:
        all_texts.append(source_question["question"])
        all_texts.extend(source_question["options"])

    unique_texts = list(dict.fromkeys(text for text in all_texts if text.strip()))
    batch_size = 15
    total_batches = (len(unique_texts) + batch_size - 1) // batch_size
    for index in range(0, len(unique_texts), batch_size):
        batch = unique_texts[index : index + batch_size]
        translate_batch(batch, cache)
        print(f"Translated batch {index // batch_size + 1}/{total_batches}")

    bank: list[dict[str, Any]] = []

    for row, source_question in zip(rows, source_questions):
        question_de = source_question["question"]
        options_de = list(source_question["options"])
        if options_de == ["1", "2", "3", "4"]:
            options_de = ["Bild 1", "Bild 2", "Bild 3", "Bild 4"]
        bank.append(
            {
                "id": int(row["question_id"]),
                "section": row["section"],
                "stateCode": row["state_code"] or None,
                "questionDe": question_de,
                "questionUk": translate_text(question_de, cache),
                "options": [
                    {
                        "de": option_de,
                        "uk": translate_text(option_de, cache),
                    }
                    for option_de in options_de
                ],
                "correctIndex": correct_index_for(source_question),
            }
        )

    return bank


def main() -> int:
    bank = build_bank()
    OUTPUT_PATH.write_text(
        "window.quizQuestionBank = " + json.dumps(bank, ensure_ascii=False, indent=2) + ";\n",
        encoding="utf-8",
    )
    print(f"Wrote {len(bank)} questions to {OUTPUT_PATH}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
