# Phonetic API server for KVP

Small python http API server for KVP (Khyentse Vision Project) phonetics


## install

```sh
$ pip3 install -U flask flask-cors botok bophono
$ npm install
```

## run

```sh
$ npm run dev
```

## test

visit `'http://localhost:5000/` or use the API through CLI:

```sh
$ curl 'http://localhost:5000/segment' -d 'str=གང་གི་བློ་གྲོས་'
```

## TODO

For word splitting, from THL phonetics app
- single syllable + pa/ba/po/bo/mo (not "ma" as it is often a negative) makes a word
- "ma" + single syllable + pa/ba makes a word (ex. "ma bcos pa")
- single syllable + med/ldan/bral/bya/can makes a word, unless followed by pa/ba.