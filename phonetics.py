import re
from botok import Text, WordTokenizer
import bophono

options_fastidious = {
    'weakAspirationChar': '3',
    'aspirateLowTones': True,
    'prefixStrategy': 'always',
    'aiAffixchar': 'ː',
    #'hightonechar':'̄',
    #'lowtonechar':'̱',
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
    in_str = re.sub(r"(^| )([^ ]+)[\u0F0B\u0F0C] +(ལྡན|བྲལ|ཅན|བ|པ|བོ|ཝོ|མ|མོ|བའི|བར|བས|བའོ|པའི|པར|པས|པའོ|བོའི|བོར|བོས|བོའོ|པོའི|པོར|པོས|པོའོ|མའི|མར|མས|མའོ|མོའི|མོར|མོས|མོའོ)($|[ ་-༔])", r"\1\2་\3\4", in_str)
    in_str = re.sub(r"([\u0F40-\u0FBC]) +([\u0F40-\u0FBC])", r"\1\2", in_str)
    return in_str

def segmentbywords(in_str):
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

def segmentbyone(in_str):
    lines = in_str.split("\n")
    res = ""
    for l in lines:
        l = re.sub(r"([\u0F35\u0F37ཀ-\u0f7e\u0F80-\u0FBC]+[^\u0F35\u0F37ཀ-\u0f7e\u0F80-\u0FBC]*)", r"\1 ", l)
        res += l+"\n"
    return res

def add_phono(in_str, res):
    lines = in_str.split("\n")
    res_kvp = ""
    res_ipa = ""
    for l in lines:
        words = l.split()
        for word in words:
            res_kvp += PHON_KVP.get_api(word)+' '
            res_ipa += PHON_API.get_api(word)+' '
        res_kvp += "\n"
        res_ipa += "\n"
    res["kvp"] = res_kvp
    res["ipa"] = res_ipa
