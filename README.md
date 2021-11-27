# Phonetic API server for KVP

Small python http API server for KVP (Khyentse Vision Project) phonetics


## run

```sh
$ FLASK_APP=server flask run
```

## test

```sh
$ curl 'http://localhost:5000/segment' -d 'str=གང་གི་བློ་གྲོས་'
```