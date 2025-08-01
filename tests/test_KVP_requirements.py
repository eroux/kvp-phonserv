import os
import pytest

import csv

from .test_helpers import assert_equal_phonetics

def load_csv(filename):
    csv_file_path = os.path.join(os.path.dirname(__file__), filename)
    with open(csv_file_path, 'r') as file:
        reader = csv.reader(file)
        header = next(reader)  # Get the header row
        tibetan_idx = header.index("Tibetan")
        kvp_idx = header.index("KVP")
        return [(row[kvp_idx], row[tibetan_idx]) for row in reader]

new_requirements_cases = load_csv('KVP_requirements.csv')

@pytest.mark.parametrize("expected, tibetan", new_requirements_cases)
def test_kvp_new_requirements_csv(expected, tibetan):
    assert_equal_phonetics(tibetan, expected, mode="words", schema="kvp")

def test_custom_exceptions():
    # Imperative endings should always be separate (chik and shok in all forms)
    cases = [
        ("བཀྲ་ཤིས་ཤོག", "tashi shok"),
        ("འཇོམས་འགྱུར་ཅིག", "jom gyur chik"),
        ("ཡོང་ཅིག", "yong chik"),
        ("ཉོན་ཤིག", "nyön shik"),
        ("ལྟ་ཞིག", "ta zhik"),
        ("སྐད་ཆ་ཤོད་གཅིག", "kecha shö chik"),
        ("བྲིས་ཤིགས", "dri shik"),
        ("འགྲོ་ཤོག", "dro shok"),
        ("འདུག་ཞོག", "duk zhok"),
        ("འཇུག་ཞོགས", "juk zhok"),
        ("ཕེབས་ཤོགས", "peb shok"),
        ("ཕྱག་འཚལ་བ་ནི་ཉི་ཤུ་རྩ་གཅིག", "chagtsal ba ni nyishu tsa chik"),
        ("བཀྲ་ཤིས་བདེ་ལེགས་ཕུན་སུམ་ཚོགས་པར་ཤོག", "tashi delek pünsum tsogpar shok"),
        ("གསོལ་བ་འདེབས་སོ་བཞེད་དོན་ལྷུན་གྲུབ་ཤོག", "sölwa deb so zhedön lhündrub shok"),
        ("འགེགས་རྣམས་མེད་ཅིང་སོ་སོར་འཇོམས་འགྱུར་ཅིག", "gek nammé ching sosor jom gyur chik"),
    ]
    for tib, expected in cases:
        assert_equal_phonetics(tib, expected, mode="words", schema="kvp")