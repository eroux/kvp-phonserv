from flask import Flask, json, request
from botok import Text
import sys
sys.path.append('../bophono')
import bophono
from botok import Text, WordTokenizer

api = Flask("KVP")

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
    return res

def add_phono(in_str, res):
    words = in_str.split()
    res_kvp = ""
    res_api = ""
    for word in words:
        res_kvp += PHON_KVP.get_api(word)+'  '
        res_api += PHON_API.get_api(word)+'  '
    res["kvp"] = res_kvp
    res["api"] = res_api

@api.route('/segment', methods=['POST'])
def segment_and_phon():
  in_str = request.form['str']
  seg = segment(in_str)
  res = { "segmented" : seg }
  add_phono(seg, res)
  return json.dumps(res, ensure_ascii=False)

@api.route('/api', methods=['POST'])
def phon():
  in_str = request.form['str']
  res = {}
  add_phono(in_str, res)
  return json.dumps(res, ensure_ascii=False)


if __name__ == '__main__':
    api.run() 
