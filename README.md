# Phonetic API server for KVP

Small python http API server for KVP (Khyentse Vision Project) phonetics


## install

```sh
$ pip3 install -U flask flask-cors botok bophono
```

## run

```sh
$ FLASK_APP=server flask run
```

## test

```sh
$ curl 'http://localhost:5000/segment' -d 'str=གང་གི་བློ་གྲོས་'
```