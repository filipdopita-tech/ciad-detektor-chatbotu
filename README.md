# Detektor chatbotů · CIAD

Malé rozšíření pro Chrome (Manifest V3). Po kliknutí na ikonu ukáže, zda aktuální stránka má chatovací okno (chatbot), jakého je dodavatele a zda rozhraní sděluje, že odpovídá stroj.

**Signál, ne právní posouzení.** Čl. 50 odst. 1 nařízení (EU) 2024/1689 ukládá povinnost poskytovatelům systémů AI určených k přímé interakci s fyzickými osobami. Živý chat s člověkem pod ni nespadá. Rozšíření nikdy netvrdí, že web porušuje nebo splňuje AI Act.

## Co dělá

- **Chatovací okno**: nalezeno (s dodavatelem, pokud ho umí určit) / nenalezeno. Stav „v kódu je chatovací skript, ale okno se nevykreslilo“ se hlásí zvlášť.
- **Odpovídá stroj**: signál nalezen (s doslovnou citací z rozhraní) / signál nenalezen / nelze určit.
- **Okno neotevírá a nic do něj nepíše.** Čte jen popisky a text spouštěčů a útvarů v rohu stránky. Co by vyžadovalo otevření okna, je „nelze určit“ a popup to říká větou „Okno jsme neotevírali.“
- Hybridní nástroje (obsluha člověkem i botem) se bez otevření okna nerozhodují.

## Metodika

Pravidla a signatury dodavatelů jsou přenesené z měření CIAD a jsou okomentované s odkazem, odkud pocházejí (`ext/detekce.js`). Zveřejněná studie: [Kolik českých firem má na webu chatbota a kdo v něm odpovídá](https://ciad.cz/studie/chatboti-oznaceni-ai-act/).

- Data: [10.5281/zenodo.23618801](https://doi.org/10.5281/zenodo.23618801)
- Odborná zpráva: [10.5281/zenodo.23834833](https://doi.org/10.5281/zenodo.23834833)

Rozšíření je jednodušší než měření ve studii: nemá síťový záznam provozu (žádná oprávnění k webům) a neotevírá okno, proto u části stránek vrátí „nelze určit“.

## Soukromí

Oprávnění jen `activeTab` a `scripting`. Žádné `host_permissions`, žádný background, žádná analytika, žádné ukládání, žádný vzdálený kód. Nic se neodesílá. [Zásady ochrany soukromí](https://filipdopita-tech.github.io/ciad-detektor-chatbotu/) · [English](https://filipdopita-tech.github.io/ciad-detektor-chatbotu/en/)

## Vývoj

```
npm test                              # jednotkové testy a fixtures (Playwright Chromium, headless)
node test/e2e-rozsireni.mjs [url...]  # rozšíření načtené v headless Chromiu, jen čtení
```

Balík do Internetového obchodu Chrome je `store/ciad-detektor-chatbotu-1.0.0.zip` (jen obsah `ext/`). Texty karty obchodu: `store/listing-cs.md`, `store/listing-en.md`.

## Licence

Kód: MIT (`LICENSE`). Písmo Aspekta: SIL Open Font License 1.1 (`ext/fonts/OFL-Aspekta.txt`).

Provozuje [Český Institut pro AI a Data z.ú.](https://ciad.cz)
