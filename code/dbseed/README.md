V datoteki [Dockerfile](Dockerfile) opišemo, katere datoteke želimo prenesti v docker 

```
     ├──dev.tsv
     ├──test.tsv
     ├──train.tsv
     ├──relations.tsv
     ├──defaultComments.tsv
     └──user.tsv
```

## dev,test,train.tsv
| Entiteta | Opis                                                          |
|----------|---------------------------------------------------------------|
| orighead | Originalna glava v angleščini oz. kakšnem drugem tujem jeziku |
| oriedge  | Relacija (npr. xIntent)                                       |
| origtail | Originalni rep v angleščini oz. kakšnem drugem jeziku         |
| head     | strojni prevod `orighead` v slovenščino                       |
| edge     | Relacija                                                      |
| tail     | strojni prevod `origedge` v slovenščino                       |

## user.tsv
V tej datoteki definiramo začetnega admin uporabnika, geslo je v našem primeru kodirano z [bcrypt](https://bcrypt-generator.com/)

| Entiteta     | Opis                             |
|--------------|----------------------------------|
| username     | Uporabniško ime                  |
| password     | Zakodirano geslo uporabnika      |
| admin        | (boolean) ali je uporabnik admin |
| name         | Polno ime uporabnika             |
| organisation | Ime organizacije v kateri dela   |
| email        | E-pošta uporabnika               |

## relations.tsv
| Entiteta    | Opis                                      |
|-------------|-------------------------------------------|
| name        | ime relacije (npr. xIntent)                |
| description | opis relacije (npr. ker OsebaX ima namen) |

## defaultComments.tsv
| Entiteta | Opis |
|----------|--|
| comment  | Ena izmed možnosti za privzet komentar |

## Opozorilo!
Te `.tsv` datoteke morejo imeti novo vrstico na koncu dokumenta, če ne se izpusti zadnja vrstica zapisanih elementov.