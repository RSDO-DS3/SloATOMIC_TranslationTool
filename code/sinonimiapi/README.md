# API za pridobivanje sinonimov 

Storitev teče na podanem portu v nadrejenem [docker-compose.yml](../docker-compose.yml) (privzeto 4000). 

## Opis API 

`getSynonym` - vrne sinonim za podano geslo 

**Parametri:**
- `geslo`  - query parameter, beseda za katero iščemo sinonim  

### Primer klica: 

`GET http://localhost:4000/api/getSynonym?geslo=voda`

Rezultat: 
```json
[
    {"naziv":"mokri element","razlaga":"naravna prozorna teko\u010dina brez barve, vonja in okusa"},
    
    {"naziv":"vodica","razlaga":"naravna prozorna teko\u010dina brez barve, vonja in okusa"},
    
    {"naziv":"vodka","razlaga":"naravna prozorna teko\u010dina brez barve, vonja in okusa"},
    
    {"naziv":"\u017eabja pija\u010da","razlaga":"naravna prozorna teko\u010dina brez barve, vonja in okusa"}

]
```