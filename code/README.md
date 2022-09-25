# Navodila za uporabo
Orodje se uporablja za pregled strojno prevedenih besedil.<br>
Pregledujemo prevod glave (angl. head) in repa (angl. tail).<br>
Pri prevodu repa je treba upoštevati relacijo (po navadi posledico) in glavo (situacijo).
<br><br>
Na glavnem pogledu imamo zgoraj iskalnik, če bi želeli kakšno določeno ključno besedo poiskati.<br>
V sami sredini strani imamo seznam prevodov, ki jih preverimo, če so ustrezni ali ne.<br>
**Nasvet:** Glede na to, da se glave večinoma ponavljajo, __najprej preglejte repe.__<br>
Nato pa z množičnim urejevalnikom uredite glavo, če je ta tuti narobe. (primeri uporabe sledi nekje spodaj)<br>
<br>
![main view](../images/mainView.png)
## Urejanje prevodov
- V primeru, da je prevod popolnoma ustrezen, pritisnemo na gumb OK<br>
  ![main view](../images/okTranslation.gif)
- Če je treba urediti rep prevoda, tega uredimo z razširitvijo elementa in uredbo besedila
  ![main view](../images/editExample.gif)
- V primeru, ko je treba urediti glavo, da ne urejamo vsake posebej, si lahko poslužimo ali z naprednim urejevalnikom
  <br>ali pa s pritiskom na element s:<br>
  **- sredinskim miškinim gumbom** ...ali<br>
  **- SHIFT + levi miškin klik** ...ali<br>
  **- CTRL + levi miškin klik**<br>
  (ponovno izpostavljam: najprej preglejte repe, nato s to funkcionalnostjo uredite glave)
  ![main view](../images/editingMultipleHeads.gif)
  lahko tudi uporabimo _(Napredni urejevalnik, ki uredi le vidne elemente, (**klik s sredinskim gumbom pa uredi vse**))_<br>
  <img src="../images/napredniUrejevalnik.png" alt="a" width="700"/>
- Če nismo prepričani glede prevoda in nočemo zapravljati časa na njem predolgo, ga lahko začasno označimo z gumbom `skip`
  ![main view](../images/skipExample.gif)

## Ko pregledamo vse prevode
Ko končamo pregled vseh prevodov, lahko zaprosimo administratorja za dodelitev več prevodov, če je teh še kaj ostalo.<br>
![main view](../images/doneAll.png)
<br>Po potrebi lahko tudi izvozimo dodeljene prevode v datoteko .tsv
<br>
![main view](../images/export1.png)