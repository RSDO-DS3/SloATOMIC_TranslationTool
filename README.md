# Orodje za gradnjo semantične mreže

V tem repozitoriju se nahaja rezultat aktivnosti A3.2 Orodje za avtomatsko ekstrakcijo relacij za gradnjo semantične mreže in Semantična mreža oz. avtomatsko zgrajena baza znanja, ki je nastalo v okviru projekta Razvoj slovenščine v digitalnem okolju.

---

## Primeri in navodila uporabe

Navodila in napotki za uporabo orodja, za ročno urejanje strojnih prevodov, so na sledeči __[povezavi](./code/README.md)__.

## Predpogoji
Vse komponente so pripravljene v obliki slik [Docker](https://docs.docker.com/get-docker/), torej je potrebno imeti tega nameščenega.

## Oblika dokumentov v `dbssed`
Imamo sledeče datoteke, ki se preslikajo v podatkovno bazo v dockeru.<br>
Podrobnejši opis strukture teh datotek je dostopen na sledeči __[povezavi](./code/dbseed/README.md)__.
```
code
  └──dbseed
     ├──dev.tsv
     ├──test.tsv
     ├──train.tsv
     ├──relations.tsv
     └──user.tsv
```
Lahko jih tudi poljubno preimenujemo, kar nato v [code/dbseed/Dockerfile](./code/dbseed/Dockerfile) prilagodimo. (V tej reviziji smo to načeloma tudi storili)
<br>Za posodobitev teh vrednosti v že obstoječem dockeru, je treba izvesti sledeč ukaz pred `compose up`.
```
docker-compose build
```

## **Zagon**
Za tem, ko nastavimo [okoljske spremenljivke](#okoljske-spremenljivke), v konzoli **v direktoriju `code`** (cd code) izvedemo sledeč ukaz:
```
docker compose up --build -d 
```

## Okoljske spremenljivke
Pred zagonom je potrebno nastaviti okoljske spremenljivke (angl. eviroment variables). Sledeče je potrebno nastaviti na dveh mestih.
1. V `code` in v `code/app` ustvarimo `.env`
2. V vsako izmed teh dveh `.env` datotek prekopiramo vrednosti iz `.env.template`, torej:<br>`code/.env.template` -> `code/.env`<br>`code/app/.env.template` -> `code/app/.env`
3. Izpolnimo vrednosti v na novo narejenih `.env` datotekah

| Spremenljivka          | Opis                                                                                                                                                                                                     |
|------------------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| DB_NAME                | Ime podatkovne baze                                                                                                                                                                                      |
| DB_HOST                | Gostitelj podatkovne baze (npr. `db`)                                                                                                                                                                    |
| DB_USER                | Uporabniško ime uporabnika baze                                                                                                                                                                          |
| DB_PASS                | Geslo uporabnika baze                                                                                                                                                                                    |
| DB_PORT                | Port podatkovne baze                                                                                                                                                                                     |
| DB_EXPORTING           | Sestavljen parameter (načeloma nepotreben, se uporablja le v eni metoid. Se bo morda v kasnejši različici odstranil)<br>Format: mongodb://rootUsername:rootPssword@dbHost:dbPort (tega ročn hardcodajte) |
|                        |                                                                                                                                                                                                          |
| APP_PORT               | (integer) Vrata glavne aplikacije, npr. `3000`, bo aplikacija dostopna na localhost:3000                                                                                                                 |
| MONGO_INITDB_USER      | MongoDb začetni uporabnik                                                                                                                                                                                |
| MONGO_INITDB_PASSWORD  | Njegovo geslo                                                                                                                                                                                            |
| MONGO_EXPRESS_USER     | Mongo express začetni uporabnik                                                                                                                                                                          |
| MONGO_EXPRESS_PASSWORD | Njegovo geslo                                                                                                                                                                                            |
| DBSEED_USER            | Uporabniško ime (načeloma so ta in ta dva zgoraj lahko enaka, po želji...)                                                                                                                               |
| DBSEED_PASS            | Njegovo geslo                                                                                                                                                                                            |
| DBSEED_DBSAFEUSER      | Uporabniško ime uporabnika dbseed baze. (Načeloma enako kot DB_USER)                                                                                                                                     |
| DBSEED_DBSAFEPASS      | Geslo tega. (Načeloma enako kot DB_PASS)                                                                                                                                                                 |
| SINONIMIDB_USER        | Uporabniško ime uporabnika baze sinonimov                                                                                                                                                                |
| SINONIMIDB_PASS        | Geslo tega                                                                                                                                                                                               |

# Opis implementacije

## Spletna aplikacija
Uporabljen je Express.js v arhitekturnem slogu MVC. V [app/app.js](app/app.js) je napisan usmernik (angl. router), ki privzeto preslika naslove URL aplikacije `/<Controller>/<Action>` v ustrezno funkcijo znotraj posameznega Controllerja. Tako npr. `/Record/editFile` izvede klic funkcije editFile. Za razširjanje funkcionalnosti je priporočeno poznavanje tehnologije Node.js

## Podatkovna baza
Uporabljena je podatkovna baza MongoDB z [uradno sliko Docker](https://hub.docker.com/_/mongo). Prilagajanje je mogoče znotraj datotek [docker-compose.yml](docker-compose.yml) ter [db/Dockerfile](./code/db/Dockerfile).

## Servis za inicializacijo baze
Ob prvem zagonu Docker vsebnika se baza napolni s podatki - strojno generiranimi prevodi. Izvorne datoteke je mogoče zamenjati, vendar je zaradi preslikav izvirnik - prevod potrebno zlepiti (konkatenirati) datoteke TSV tako, kot je demonstrirano v implementaciji. Lepljenje je mogoče realizirati na poljuben način, npr. s pomočjo skripte [dbseed/merger.py](./code/dbseed/merger.py).

## Sinonimi
Za sinonime sta uporabljeni sliki Docker, opisani v [sinonimiapi](./code/sinonimiapi) in [sinonimidb](./code/sinonimidb).


## Avtorji:
- [Ivan Kovačič](https://git.lhrs.feri.um.si/ivan.kovacic)
- [Kristjan Žagar](https://git.lhrs.feri.um.si/kristjan.zagar)

---

> Operacijo Razvoj slovenščine v digitalnem okolju sofinancirata Republika Slovenija in Evropska unija iz Evropskega sklada za regionalni razvoj. Operacija se izvaja v okviru Operativnega programa za izvajanje evropske kohezijske politike v obdobju 2014-2020.

![](Logo_EKP_sklad_za_regionalni_razvoj_SLO_slogan.jpg)