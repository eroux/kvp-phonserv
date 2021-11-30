from flask import Flask, json, request, send_from_directory
from botok import Text
import sys
sys.path.append('../bophono')
import bophono
from botok import Text, WordTokenizer
import re
from flask_cors import CORS

api = Flask("KVP", static_url_path='', static_folder='web/')
CORS(api)

options_fastidious = {
  'weakAspirationChar': '3',
  'aspirateLowTones': True,
  'prefixStrategy': 'always',
  'aiAffixchar': 'ː',
  'hightonechar':'̄',
  'lowtonechar':'̱',
  'nasalchar': '',
  'stopSDMode': "eow",
  'eatP': False,
  'useUnreleasedStops': True,
  'eatK': False,
  'syllablesepchar': ''
}

WT = WordTokenizer()
PHON_KVP = bophono.UnicodeToApi(schema="KVP", options = {})
PHON_API = bophono.UnicodeToApi(schema="MST", options = options_fastidious)

def botok_tokenizer(in_str):
    return WT.tokenize(in_str)

def botok_modifier(tokens):
    op = []
    for t in tokens:
        op_token = {
            'start': t.start,
            'end': t.start + t.len,
            'type': t.chunk_type
        }
        op.append(op_token)
    return op

def postsegment(in_str):
    # combine particle with previous syllable when there is just one
    in_str = re.sub(r"(^| )([^ ]+)[\u0F0B\u0F0C] +(ཏུ|གི|ཀྱི|གིས|ཀྱིས|ཡིས|ལྡན|བྲལ|ཅན|བ|པ|བོ|ཝོ|མ|མོ|བའི|བར|བས|བའོ|པའི|པར|པས|པའོ|བོའི|བོར|བོས|བོའོ|པོའི|པོར|པོས|པོའོ|མའི|མར|མས|མའོ|མོའི|མོར|མོས|མོའོ)($|[ ་-༔])", r"\1\2་\3\4", in_str)
    in_str = re.sub(r"([\u0F40-\u0FBC]) +([\u0F40-\u0FBC])", r"\1\2", in_str) # merge affixes
    # combine ma with following syllable when there is just one
    return in_str

def segment(in_str):
    try:
        t = Text(in_str, tok_params={'profile': 'GMD'})
        tokens = t.custom_pipeline('dummy', botok_tokenizer, botok_modifier, 'dummy')
    except Exception as e:
        print(e)
        print("botok failed to segment "+in_str)
        return in_str
    res = ''
    first = True
    for token in tokens:
       if not first:
           res += " "
       first = False
       res += in_str[token['start']:token['end']]
    return postsegment(res)

def segmentbytwo(in_str):
    lines = in_str.split("\n")
    res = ""
    for l in lines:
        countsyls = len(re.findall("[\u0F35\u0F37ཀ-\u0f7e\u0F80-\u0FBC]+", l))
        l = re.sub(r"([\u0F35\u0F37ཀ-\u0f7e\u0F80-\u0FBC]+[^\u0F35\u0F37ཀ-\u0f7e\u0F80-\u0FBC]+[\u0F35\u0F37ཀ-\u0f7e\u0F80-\u0FBC]+[^\u0F35\u0F37ཀ-\u0f7e\u0F80-\u0FBC]*)", r"\1 ", l)
        if countsyls % 2 == 1:
            l = re.sub(r" ([\u0F35\u0F37ཀ-\u0f7e\u0F80-\u0FBC]+[^\u0F35\u0F37ཀ-\u0f7e\u0F80-\u0FBC]*)$", r"\1", l)
        res += l+"\n"
    return res

def add_phono(in_str, res):
    lines = in_str.split("\n")
    res_kvp = ""
    res_ipa = ""
    for l in lines:
        words = l.split()
        for word in words:
            res_kvp += PHON_KVP.get_api(word)+'  '
            res_ipa += PHON_API.get_api(word)+'  '
        res_kvp += "\n"
        res_ipa += "\n"
    res["kvp"] = res_kvp
    res["ipa"] = res_ipa

@api.route('/segment', methods=['POST'])
def segment_and_phon():
  in_str = request.form['str']
  seg = segment(in_str)
  res = { "segmented" : seg }
  add_phono(seg, res)
  return json.dumps(res, ensure_ascii=False)

@api.route('/segmentbytwo', methods=['POST'])
def segmentbytwo_and_phon():
  in_str = request.form['str']
  seg = segmentbytwo(in_str)
  res = { "segmented" : seg }
  add_phono(seg, res)
  return json.dumps(res, ensure_ascii=False)

@api.route('/phoneticize', methods=['POST'])
def phon():
  in_str = request.form['str']
  res = {}
  add_phono(in_str, res)
  return json.dumps(res, ensure_ascii=False)

@api.route('/', methods=['GET'])
def default():
    return api.send_static_file('tool.html')

def test():
    print(postsegment("གང་ གི་ བློ་གྲོས་"))
    print(postsegment("ཐུགས་ཀ ར་"))
    print(postsegment("རབ་གསལ་བས། །"))
    print(segmentbytwo("ཇི་སྙེད་དོན་ཀུན་ཇི་བཞིན་གཟིགས་ཕྱིར་ཉིད་ཀྱི་ཐུགས་ཀར་གླེགས་བམ་འཛིན།།"))

if __name__ == '__main__':
    #api.run() 
    test()
