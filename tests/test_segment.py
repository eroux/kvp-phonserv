import unittest
from .test_helpers import assert_equal_phonetics

class TestSegmentation(unittest.TestCase):
    def test_segmentbywords(self):
        assert_equal_phonetics(
          "གང་ གི་ བློ་གྲོས་",
          "gang gi lodrö",
          mode="words",
          schema="kvp"
        )

    def test_segmentbytwo(self):
        assert_equal_phonetics(
          "ཇི་སྙེད་དོན་ཀུན་ཇི་བཞིན་གཟིགས་ཕྱིར་ཉིད་ཀྱི་ཐུགས་ཀར་གླེགས་བམ་འཛིན།།",
          "jinyé dönkün jizhin zigchir nyikyi tugkar legbamdzin",
          mode="two",
          schema="kvp"
        )

    def test_segmentbyone(self):
        assert_equal_phonetics(
          "ཇི་སྙེད་དོན་ཀུན་ཇི་བཞིན་གཟིགས་ཕྱིར་ཉིད་ཀྱི་ཐུགས་ཀར་གླེགས་བམ་འཛིན།།",
          "ji nyé dön kün ji zhin zik chir nyi kyi tuk kar lek bam dzin",
          mode="one",
          schema="kvp"
        )

if __name__ == '__main__':
    unittest.main()
