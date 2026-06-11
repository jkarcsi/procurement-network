// Beachhead kategóriák (facility + compliance klaszter) és magyar régiók.
// A seed és az AI-fallback is innen dolgozik.

export type CategoryDef = {
  id: string;
  name: string;
  keywords: string[];
  clarifyQuestions: string[];
};

export const CATEGORIES: CategoryDef[] = [
  {
    id: "takaritas",
    name: "Takarítás",
    keywords: ["takarít", "tisztít", "higién", "irodatakar"],
    clarifyQuestions: [
      "Mekkora a takarítandó terület (m²) és milyen típusú (iroda, üzem, raktár, üzlet)?",
      "Milyen gyakorisággal van szükség takarításra (napi, heti, alkalmi)?",
      "Hány telephelyről van szó, és pontosan hol találhatók?",
      "Munkaidőben vagy munkaidőn kívül történjen a takarítás?",
      "Vannak speciális igények (nagytakarítás, ablaktisztítás, fertőtlenítés)?",
    ],
  },
  {
    id: "hvac",
    name: "HVAC / klíma karbantartás",
    keywords: ["klíma", "klima", "hvac", "légkondi", "legkondi", "hűtés", "futes", "fűtés", "szellőz"],
    clarifyQuestions: [
      "Hány darab és milyen típusú klíma/HVAC berendezésről van szó?",
      "Telepítésre, karbantartásra vagy javításra van szükség?",
      "Milyen gyakoriságú karbantartást szeretnél (éves, féléves, negyedéves)?",
      "Hol találhatók a berendezések (telephely, emelet, gépészeti tér)?",
      "Van érvényes klímagáz-nyilvántartási kötelezettség alá eső berendezés (3 kg/5 t CO2e felett)?",
    ],
  },
  {
    id: "orzes-vedelem",
    name: "Őrzés-védelem",
    keywords: ["őrzés", "orzes", "biztonsági", "biztonsag", "vagyonvéd", "vagyonved", "portaszolgálat", "portaszolgalat", "beléptet", "beleptet"],
    clarifyQuestions: [
      "Milyen szolgáltatásra van szükség (élőerős őrzés, portaszolgálat, távfelügyelet, járőrözés)?",
      "Milyen időbeosztásban (0-24, éjszakai, hétvégi, munkaidőn kívüli)?",
      "Hány telephelyet és mekkora területet kell védeni?",
      "Van meglévő biztonságtechnikai rendszer (kamera, riasztó, beléptető)?",
      "Mikortól és milyen időtávra keresel szolgáltatót?",
    ],
  },
  {
    id: "munkavedelem",
    name: "Munkavédelem",
    keywords: ["munkavéd", "munkaved", "kockázatértékel", "kockazatertekel", "üzemorvos", "uzemorvos", "munkabiztons"],
    clarifyQuestions: [
      "Hány munkavállalót érint a szolgáltatás, és milyen tevékenységi körben dolgoznak?",
      "Milyen feladatokra van szükség (kockázatértékelés, oktatás, szabályzatok, bejárások)?",
      "Van jelenleg munkavédelmi szolgáltatód, és mikor jár le a szerződés?",
      "Hány telephelyen kell ellátni a feladatokat?",
      "Veszélyességi osztály szempontjából milyen besorolású a tevékenység (ha ismert)?",
    ],
  },
  {
    id: "tuzvedelem",
    name: "Tűzvédelem",
    keywords: ["tűzvéd", "tuzved", "tűzoltó", "tuzolto", "tűzjelz", "tuzjelz", "menekülés", "menekules"],
    clarifyQuestions: [
      "Milyen szolgáltatásra van szükség (tűzvédelmi szabályzat, oktatás, eszköz-felülvizsgálat, tűzjelző karbantartás)?",
      "Mekkora az épület/telephely, és milyen funkciójú (iroda, üzem, raktár, vendéglátás)?",
      "Hány tűzoltó készülék, tűzcsap, tűzjelző eszköz van (ha ismert)?",
      "Folyamatos megbízást vagy egyszeri felülvizsgálatot keresel?",
      "Mikor volt az utolsó tűzvédelmi felülvizsgálat?",
    ],
  },
  {
    id: "it-support",
    name: "IT üzemeltetés / support",
    keywords: ["it ", "informatik", "rendszergazda", "support", "szerver", "hálózat", "halozat", "microsoft 365", "laptop"],
    clarifyQuestions: [
      "Hány felhasználót / munkaállomást kell támogatni?",
      "Milyen rendszereket használtok (Microsoft 365, Google Workspace, saját szerver, felhő)?",
      "Helyszíni jelenlétre is szükség van, vagy elég a távoli support?",
      "Milyen SLA-t vársz el (válaszidő, rendelkezésre állás)?",
      "Van jelenlegi IT szolgáltató, és mi a váltás fő oka?",
    ],
  },
];

export const REGIONS: { id: string; name: string }[] = [
  { id: "budapest", name: "Budapest" },
  { id: "pest", name: "Pest vármegye" },
  { id: "bacs-kiskun", name: "Bács-Kiskun" },
  { id: "baranya", name: "Baranya" },
  { id: "bekes", name: "Békés" },
  { id: "borsod-abauj-zemplen", name: "Borsod-Abaúj-Zemplén" },
  { id: "csongrad-csanad", name: "Csongrád-Csanád" },
  { id: "fejer", name: "Fejér" },
  { id: "gyor-moson-sopron", name: "Győr-Moson-Sopron" },
  { id: "hajdu-bihar", name: "Hajdú-Bihar" },
  { id: "heves", name: "Heves" },
  { id: "jasz-nagykun-szolnok", name: "Jász-Nagykun-Szolnok" },
  { id: "komarom-esztergom", name: "Komárom-Esztergom" },
  { id: "nograd", name: "Nógrád" },
  { id: "somogy", name: "Somogy" },
  { id: "szabolcs-szatmar-bereg", name: "Szabolcs-Szatmár-Bereg" },
  { id: "tolna", name: "Tolna" },
  { id: "vas", name: "Vas" },
  { id: "veszprem", name: "Veszprém" },
  { id: "zala", name: "Zala" },
];

export const REGION_KEYWORDS: Record<string, string[]> = {
  budapest: ["budapest", "bp", "főváros", "fovaros"],
  pest: ["pest vármegye", "pest megye", "érd", "erd", "gödöllő", "godollo", "vác", "vac", "cegléd", "cegled", "szentendre", "dunakeszi", "budaörs", "budaors"],
  "bacs-kiskun": ["kecskemét", "kecskemet", "baja", "kiskunfélegyháza"],
  baranya: ["pécs", "pecs", "mohács", "mohacs"],
  bekes: ["békéscsaba", "bekescsaba", "gyula", "orosháza"],
  "borsod-abauj-zemplen": ["miskolc", "ózd", "ozd", "kazincbarcika"],
  "csongrad-csanad": ["szeged", "hódmezővásárhely", "hodmezovasarhely", "szentes"],
  fejer: ["székesfehérvár", "szekesfehervar", "dunaújváros", "dunaujvaros"],
  "gyor-moson-sopron": ["győr", "gyor", "sopron", "mosonmagyaróvár", "mosonmagyarovar"],
  "hajdu-bihar": ["debrecen", "hajdúszoboszló", "hajduszoboszlo"],
  heves: ["eger", "gyöngyös", "gyongyos", "hatvan"],
  "jasz-nagykun-szolnok": ["szolnok", "jászberény", "jaszbereny"],
  "komarom-esztergom": ["tatabánya", "tatabanya", "esztergom", "komárom", "komarom", "tata"],
  nograd: ["salgótarján", "salgotarjan", "balassagyarmat"],
  somogy: ["kaposvár", "kaposvar", "siófok", "siofok"],
  "szabolcs-szatmar-bereg": ["nyíregyháza", "nyiregyhaza", "mátészalka", "mateszalka"],
  tolna: ["szekszárd", "szekszard", "paks"],
  vas: ["szombathely", "sárvár", "sarvar", "kőszeg", "koszeg"],
  veszprem: ["veszprém", "veszprem", "pápa", "papa", "ajka", "balatonfüred", "balatonfured"],
  zala: ["zalaegerszeg", "nagykanizsa", "keszthely"],
};

export const GENERIC_CLARIFY_QUESTIONS = [
  "Pontosan milyen szolgáltatásra vagy termékre van szükséged?",
  "Hol történne a teljesítés (település, telephely)?",
  "Milyen mennyiségben / gyakorisággal van rá szükség?",
  "Mikor kellene elindulnia a szolgáltatásnak?",
  "Van keretösszeg vagy árelvárás, amit érdemes tudnia a beszállítóknak?",
];
