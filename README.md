# Beredskab — five HTML app concepts for Denmark

Five distinct, interactive UI prototypes translating Denmark’s official preparedness guidance into practical everyday tools. Every concept has Danish and English modes, responsive layouts and browser-local persistence.

**Start with [`index.html`](index.html)** to browse the five directions. Download or clone the repository and open it in a modern browser; no installation, build step, account or API key is required.

## The five ideas

| Prototype | Core idea | Working interactions | Visual direction |
| --- | --- | --- | --- |
| [01 · Klar72](01-klar72.html) | A household preparedness dashboard | Household size, water calculator, checklist, progress, completed/missing filters, text export | Civic navy, warm red, structured dashboard |
| [02 · Skab](02-skab.html) | A rotating household supply shelf | Add/edit/delete custom items, adjust stock and targets, search, categories, dates, shopping-list export | Sage green, natural paper tones, original shelf illustration |
| [03 · Rolig](03-rolig.html) | Calm, guided scenario practice | Power outage, water disruption and siren exercises; steps, checkmarks, completion feedback, offline HTML download | Dark navy, amber, focused step-by-step guidance |
| [04 · Sammen](04-sammen.html) | A preparedness plan for family and neighbours | Contacts, task assignment, meeting/backup locations, printable emergency card | Soft blue, open spacing, original relationship illustration |
| [05 · Parat](05-parat.html) | Small actions and practical learning | Five short lessons, saved completion, five-question quiz, answer explanations and best score | Warm terracotta, lavender, original journey illustration |

These are **independent concept prototypes**, designed as proposals for a citizen-facing preparedness service. They are not commissioned, approved or operated by a Danish authority. No official logos are used. Rolig contains practice scenarios, not current incidents or live warnings.

## Official sources

Sources reviewed **20 October 2026**:

- [Styrelsen for Samfundssikkerhed — Forberedt på kriser](https://samsik.dk/forberedt/)
- [Danish Emergency Management Agency — Prepared for crises (English)](https://www.brs.dk/en/prepared/)
- [Beredskabsstyrelsen — Om varsling / S!RENEN](https://www.brs.dk/da/sirenen/om-varsling/)
- [Miljøstyrelsen — Forberedt på kriser: drinking water and hygiene](https://mst.dk/borger/sundhed-og-kemi/forberedt-paa-kriser)
- [Danish food authority — food supplies, storage and preparation](https://foedevarestyrelsen.dk/kost-og-foedevarer/foedevaresikkerhed/foedevareberedskab/forberedt-paa-kriser)

The main planning baseline is **three days** of household preparedness and **three litres of water per person per day**, or nine litres per person for three days. Water for pets is additional and depends on their needs. Food targets in Skab are **editable demo examples**, not official quantities or a complete meal plan. Checklist percentages reflect user checkmarks, not an assessment of safety.

The Danish material is currently available through SAMSIK. The prototypes link both to this material and to relevant Beredskabsstyrelsen guidance. Current official instructions always take priority over saved prototype content. The English UI is a prototype translation of the content and points to the official English guidance.

## Local data and offline use

- Everything runs in the browser. There is no backend, tracking, login, notification service or external asset dependency.
- Each prototype uses its own versioned `localStorage` key. The language preference is shared. User-entered names are preserved in either language.
- Sammen does not send invitations or messages and does not synchronise across devices. Example people have no real phone numbers.
- Skab starts with clearly labelled sample data. Date reminders appear only when the page is opened; no background notifications are sent. A user-selected review date is different from a manufacturer’s expiry date.
- All five HTML files are self-contained. Download the full repository to retain the gallery links. Each app also works independently when opened as a local file.
- Local storage for `file:` URLs varies between browsers; a local HTTP server gives more consistent persistence. Blocked storage produces a visible message, and the open session still works.
- Rolig’s download saves a standalone HTML guide. Progress remains associated with the browser/origin and is not transferred into the downloaded file.
- Sammen’s print button prints the emergency-card content and supports saving as PDF through the browser print dialog.

## Development and checks

The committed HTML is ready to open. `build_prototypes.py` is the optional source generator, using only Python’s standard library. It rebuilds the six HTML files and a local `dist/` preview directory:

```bash
python build_prototypes.py
node tests/verify-prototypes.mjs
```

For a local HTTP preview, run a static server in this directory, for example:

```bash
python -m http.server 8000
```

Then open `http://localhost:8000/`.

Source-level verification covers JavaScript parsing and execution, both language modes, relative links, household water calculations and limits, persisted progress, stock changes, date filtering, add/delete forms, escaped user content, shopping exports, guided scenarios, print-card content and quiz feedback/scoring. Tests use a minimal document harness, not a browser rendering engine.

Visual browser QA was blocked by the environment’s browser security policy. Responsive breakpoints, keyboard focus styles, labelled form fields, reduced-motion support and print rules are implemented in source, but mobile rendering, screen-reader behaviour and print pagination still need real-browser review.
