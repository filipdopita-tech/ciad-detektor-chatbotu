# Karta v Internetovém obchodě Chrome · čeština (výchozí jazyk)

## Název (max 75 znaků)
Detektor chatbotů · CIAD

## Krátký popis (max 132 znaků)
Ukáže, zda stránka má chatovací okno (chatbot) a zda rozhraní sděluje, že odpovídá stroj. Nic neodesílá ani neukládá.

## Podrobný popis
Detektor chatbotů vám po kliknutí na ikonu řekne dvě věci o stránce, na které jste.

Chatovací okno. Zda stránka má chatovací okno (chatbot), a pokud umíme určit dodavatele, uvedeme který.

Odpovídá stroj. Zda rozhraní sděluje, že na druhé straně je stroj. Pokud ano, ukážeme doslovnou citaci z rozhraní. Pokud ne, napíšeme „signál nenalezen“. Pokud to bez otevření okna nejde poznat, napíšeme „nelze určit“.

Rozšíření chatovací okno neotevírá a nic do něj nepíše. Čte jen popisky a text spouštěčů a útvarů v rohu stránky. Proto u části stránek uvidíte „nelze určit“, a v popupu stojí „Okno jsme neotevírali.“

Signál, ne právní posouzení. Čl. 50 odst. 1 nařízení (EU) 2024/1689 ukládá povinnost poskytovatelům systémů AI určených k přímé interakci s fyzickými osobami. Živý chat s člověkem pod ni nespadá. Výsledek rozšíření nic neříká o tom, zda web zákon dodržuje.

Soukromí. Rozšíření má jen oprávnění activeTab a scripting, nemá přístup k webům ani k historii. Nic nesbírá, neukládá ani neodesílá, neobsahuje analytiku ani vzdálený kód.

Metodika vychází z měření Českého Institutu pro AI a Data (CIAD): https://ciad.cz/studie/chatboti-oznaceni-ai-act/
Data studie: https://doi.org/10.5281/zenodo.23618801
Odborná zpráva: https://doi.org/10.5281/zenodo.23834833
Zdrojový kód (MIT): https://github.com/filipdopita-tech/ciad-detektor-chatbotu

## Kategorie
Pracovní postupy (Productivity)

## Jazyk
Čeština (výchozí), angličtina

## Zdůvodnění oprávnění
- activeTab: Rozšíření se dotkne stránky jen po kliknutí uživatele na ikonu. Dostane přístup k aktuální kartě, aby ji mohlo zkontrolovat. Žádný jiný přístup k webům nemá.
- scripting: Po kliknutí spustí (chrome.scripting.executeScript) vlastní, v balíku přiložený skript detekce.js na aktuální kartě. Skript vrátí výsledek do popupu. Žádný vzdálený kód se nestahuje.
- host_permissions: nežádá se.

## Jediný účel (single purpose)
Zjistit na aktuální stránce, zda má chatovací okno a zda rozhraní sděluje, že odpovídá stroj.

## Využití dat (Data usage)
Rozšíření nesbírá žádná uživatelská data. Ve všech kategoriích (osobní údaje, zdravotní, finanční, ověřování, komunikace, poloha, historie prohlížení, aktivita uživatele, obsah webu) odpovědět: nesbírá se.
Potvrzení: data se neprodávají třetím stranám, nepoužívají se mimo hlavní účel, nepoužívají se k posuzování úvěruschopnosti.
Poznámka k formuláři: Chrome může obsah stránky číst jen lokálně při kontrole. Nic z něj neopouští prohlížeč.

## URL zásad ochrany soukromí
https://filipdopita-tech.github.io/ciad-detektor-chatbotu/

## URL webu
https://ciad.cz/studie/chatboti-oznaceni-ai-act/

## Grafika
- Screenshoty 1280×800: screenshot-01-chat-a-signal-stroj.png, screenshot-02-chat-nelze-urcit.png, screenshot-03-bez-chatu.png (fiktivní „Ukázková firma s.r.o.“)
- Malá promo dlaždice 440×280: promo-dlazdice-440x280.png
- Ikona 128: ext/icons/icon-128.png (v balíku)
