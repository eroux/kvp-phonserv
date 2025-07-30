import inspect
from phonetics import segmentbywords, segmentbyone, segmentbytwo, add_phono

def assert_equal_phonetics(tibetan, expected, mode="words", schema="kvp"):
    clean_tibetan = inspect.cleandoc(tibetan)
    clean_expected = inspect.cleandoc(expected).strip()
    phonetics = phonetics_for(mode, schema, clean_tibetan).strip()
    assert phonetics == clean_expected, f"Tibetan: {clean_tibetan} | Expected: {clean_expected} | Got: {phonetics}"

def phonetics_for(mode, schema, text):
    res = {}
    match mode:
        case "words":
            add_phono(segmentbywords(text), res)
        case "one":
            add_phono(segmentbyone(text), res)
        case "two":
            add_phono(segmentbytwo(text), res)
    return res[schema.lower()]