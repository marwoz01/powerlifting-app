/**
 * Exercise alternatives grouped by movement pattern.
 * Each group contains exercises that can be swapped for each other.
 * The first element is typically the "default" but any can replace any.
 */

export interface AlternativeGroup {
  pattern: string; // movement pattern label
  exercises: Array<{
    name: string;
    note: string;
  }>;
}

const ALTERNATIVE_GROUPS: AlternativeGroup[] = [
  // === SQUAT VARIATIONS ===
  {
    pattern: 'Wariant przysiadu (techniczny)',
    exercises: [
      { name: 'Pause Squat', note: 'Zatrzymaj się na 2 sekundy w najniższym punkcie bez odbijania. Utrzymaj napięcie brzucha przez całą pauzę.' },
      { name: 'Tempo Squat', note: 'Opuszczaj się przez 3–4 sekundy kontrolowanym ruchem. Na dole bez zatrzymania — dynamiczny powrót do góry.' },
      { name: 'Front Squat', note: 'Trzymaj łokcie wysoko i tułów pionowo. Schodź do pełnej głębokości. Mniejszy ciężar, większy zakres ruchu.' },
      { name: 'Pin Squat', note: 'Startuj z dołu bez rozbiegu — buduje siłę startową. Ustaw asekurację na wysokości najniższego punktu.' },
      { name: 'Belt Squat', note: 'Obciążenie na pasie, bez obciążenia kręgosłupa. Pełna głębokość, skupienie na pracy nóg.' },
    ],
  },
  {
    pattern: 'Przysiad dodatkowy (wolumen)',
    exercises: [
      { name: 'Bulgarian Split Squat', note: 'Tylna stopa oparta na ławce, tułów lekko pochylony. Kontrolowane opuszczanie do pełnej głębokości.' },
      { name: 'Hack Squat', note: 'Plecy przylegają do oparcia przez cały ruch. Schodź do pełnej głębokości.' },
      { name: 'Leg Press', note: 'Stopy wysoko na platformie na szerokość bioder. Kontroluj zakres ruchu — kolana nie schodzą do klatki.' },
      { name: 'Goblet Squat', note: 'Trzymaj hantlę przy klatce piersiowej. Schodź do pełnej głębokości z łokciami wewnątrz kolan.' },
    ],
  },

  // === BENCH VARIATIONS ===
  {
    pattern: 'Wariant wyciskania (techniczny)',
    exercises: [
      { name: 'Pause Bench Press', note: 'Zatrzymaj sztangę na sekundę na klatce piersiowej. Nie odbijaj — buduje siłę wyciskania z martwego punktu.' },
      { name: 'Close Grip Bench', note: 'Chwyć sztangę na szerokość ramion. Łokcie prowadź bliżej tułowia. Większe zaangażowanie tricepsów.' },
      { name: 'Spoto Press', note: 'Zatrzymaj sztangę 2–3 centymetry nad klatką piersiową. Buduje siłę w najtrudniejszym punkcie wyciskania.' },
      { name: 'Larsen Press', note: 'Nogi uniesione — brak napędu z nóg. Testuje czystą siłę górnej partii ciała.' },
      { name: 'Floor Press', note: 'Wyciskaj leżąc na podłodze — ograniczony zakres ruchu. Skupia pracę na tricepsach i końcowej fazie wyciskania.' },
      { name: 'Tempo Bench Press', note: 'Opuszczaj sztangę przez 3 sekundy kontrolowanym ruchem. Buduje kontrolę i siłę w fazie negatywnej.' },
    ],
  },
  {
    pattern: 'Wyciskanie dodatkowe (wolumen)',
    exercises: [
      { name: 'Incline Dumbbell Press', note: 'Ławka pod kątem 30–45 stopni. Opuść hantle do pełnego rozciągnięcia klatki piersiowej. Kontrolowane tempo.' },
      { name: 'Dumbbell Bench Press', note: 'Większy zakres ruchu niż ze sztangą. Opuść hantle do pełnego rozciągnięcia klatki piersiowej.' },
      { name: 'Machine Chest Press', note: 'Stabilna pozycja — skupienie na pracy mięśni bez konieczności stabilizacji. Pełen zakres ruchu.' },
      { name: 'Dips (na poręczach)', note: 'Pochyl tułów do przodu. Schodź do kąta 90 stopni w łokciach. Kontrolowane opuszczanie.' },
    ],
  },

  // === DEADLIFT VARIATIONS ===
  {
    pattern: 'Wariant martwego ciągu (techniczny)',
    exercises: [
      { name: 'Pause Deadlift', note: 'Zatrzymaj sztangę na 2 sekundy na wysokości kolan. Utrzymaj pozycję pleców i napięcie brzucha.' },
      { name: 'Deficit Deadlift', note: 'Stań na podwyższeniu 3–5 centymetrów. Większy zakres ruchu buduje siłę zrywania z podłogi.' },
      { name: 'Tempo Deadlift', note: 'Opuszczaj i podnoś sztangę przez 3 sekundy. Kontrolowany ruch buduje świadomość pozycji ciała.' },
      { name: 'Block Pull / Rack Pull', note: 'Sztanga startuje z podwyższenia. Skupia pracę na końcowej fazie ciągu — biodra do przodu, ramiona do tyłu.' },
    ],
  },
  {
    pattern: 'Biodra / tylny łańcuch',
    exercises: [
      { name: 'Rumuński martwy ciąg (RDL)', note: 'Utrzymuj kolana lekko ugięte. Pracuj w biodrach — poczuj rozciągnięcie mięśni dwugłowych uda.' },
      { name: 'Stiff Leg Deadlift', note: 'Nogi prawie proste. Maksymalne rozciągnięcie mięśni dwugłowych uda. Kontrolowane tempo.' },
      { name: 'Hip Thrust', note: 'Łopatki oparte na ławce. Wypchnij biodra do pełnego wyprostu. Ściśnij pośladki na górze przez 1–2 sekundy.' },
      { name: 'Good Morning', note: 'Sztanga na plecach, ukłon w biodrach. Poczuj rozciągnięcie mięśni dwugłowych uda. Plecy proste.' },
      { name: 'Cable Pull-Through', note: 'Stań tyłem do wyciągu. Ruch w biodrach jak w martwym ciągu, napnij pośladki na końcu ruchu.' },
    ],
  },

  // === BACK / PULLING ===
  {
    pattern: 'Ściąganie pionowe (plecy)',
    exercises: [
      { name: 'Podciąganie na drążku (Pull-ups)', note: 'Zacznij od pełnego wyprostu ramion, ciągnij aż broda znajdzie się nad drążkiem. Kontrolowany powrót.' },
      { name: 'Podciąganie z obciążeniem', note: 'Dodawaj obciążenie na pasie. Pełen zakres ruchu od wyprostu do brody nad drążkiem.' },
      { name: 'Ściąganie drążka (Lat Pulldown)', note: 'Ciągnij drążek do klatki piersiowej, łopatki prowadź w dół. Kontrolowany powrót.' },
      { name: 'Ściąganie drążka neutralnym chwytem', note: 'Chwyt neutralny — dłonie zwrócone do siebie. Ciągnij do klatki piersiowej. Mniejsze obciążenie nadgarstków.' },
    ],
  },
  {
    pattern: 'Wiosłowanie (plecy)',
    exercises: [
      { name: 'Wiosłowanie sztangą', note: 'Pochyl tułów do przodu. Ciągnij sztangę do brzucha, ściągając łopatki. Kontrolowany powrót.' },
      { name: 'Seated Cable Row', note: 'Ciągnij uchwyt do brzucha, ściągając łopatki. Utrzymuj tułów nieruchomo. Kontrolowany powrót.' },
      { name: 'Dumbbell Row', note: 'Oprzyj rękę i kolano o ławkę. Ciągnij hantlę do biodra, ściskając łopatkę na górze.' },
      { name: 'Chest-Supported Row', note: 'Klatka piersiowa oparta o ławkę — eliminuje oszukiwanie tułowiem. Skupienie na pracy pleców.' },
      { name: 'T-Bar Row', note: 'Pochyl tułów do przodu, ciągnij uchwyt do klatki. Ściągaj łopatki na górze ruchu.' },
    ],
  },

  // === SHOULDERS ===
  {
    pattern: 'Wznosy boczne (barki)',
    exercises: [
      { name: 'Lateral Raise (hantle)', note: 'Lekki ciężar, prowadź ruch łokciami. Unieś ramiona do poziomu barków. Kontrolowane opuszczanie.' },
      { name: 'Lateral Raise (linka)', note: 'Stań bokiem do wyciągu. Prowadź ruch łokciem, unieś do poziomu barków. Stałe napięcie przez cały ruch.' },
      { name: 'Lateral Raise (maszyna)', note: 'Stabilna pozycja na maszynie. Unieś ramiona do poziomu barków. Kontrolowane tempo w obu kierunkach.' },
      { name: 'Lu Raise', note: 'Unieś hantle przed siebie do poziomu oczu, potem rozłóż na boki. Lekki ciężar — ćwiczenie na zdrowie barków.' },
    ],
  },
  {
    pattern: 'Tylne deltoidalne',
    exercises: [
      { name: 'Rear Delt Fly (hantle)', note: 'Pochyl tułów do przodu. Unieś ramiona na boki prowadząc łokciami. Ściskaj łopatki na górze.' },
      { name: 'Rear Delt Fly (linka)', note: 'Skrzyżuj linki na wyciągu. Ciągnij na boki prowadząc łokciami. Stałe napięcie przez cały ruch.' },
      { name: 'Face Pull', note: 'Ciągnij linkę do twarzy, łokcie wysoko. Na końcu dodaj rotację zewnętrzną ramion.' },
      { name: 'Band Pull-apart', note: 'Rozciągaj gumę na wysokości klatki piersiowej, ściągając łopatki. Zatrzymaj się na sekundę na końcu.' },
      { name: 'Reverse Pec Deck', note: 'Usiądź twarzą do oparcia maszyny. Rozciągaj ramiona na boki, ściskając łopatki na końcu ruchu.' },
    ],
  },

  // === TRICEPS ===
  {
    pattern: 'Triceps',
    exercises: [
      { name: 'Tricep Pushdown (linka)', note: 'Wypychaj linkę w dół do pełnego wyprostu ramion. Łokcie przyciśnięte do tułowia.' },
      { name: 'Overhead Tricep Extension', note: 'Opuść ciężar za głowę do pełnego rozciągnięcia głowy długiej tricepsa. Łokcie blisko głowy.' },
      { name: 'Skull Crushers', note: 'Opuść sztangę do czoła lub za głowę. Łokcie nieruchomo, wyprostuj ramiona do końca.' },
      { name: 'Dips (wąski chwyt)', note: 'Tułów pionowo, łokcie blisko ciała. Schodź do kąta 90 stopni. Skupienie na tricepsach.' },
      { name: 'Kickback (hantle)', note: 'Pochyl tułów do przodu. Wyprostuj ramię do tyłu, ściskając triceps na górze. Kontrolowane tempo.' },
    ],
  },

  // === BICEPS ===
  {
    pattern: 'Biceps',
    exercises: [
      { name: 'Dumbbell Curl', note: 'Łokcie nieruchomo przy tułowiu. Kontrolowane opuszczanie. Nie pomagaj sobie kołysaniem ciała.' },
      { name: 'Incline Dumbbell Curl', note: 'Ławka pod kątem 45 stopni. Opuść hantle do pełnego rozciągnięcia bicepsów. Kontrolowane tempo.' },
      { name: 'Hammer Curl', note: 'Chwyt młotkowy — dłonie zwrócone do siebie. Kontrolowany ruch, łokcie nieruchomo.' },
      { name: 'Barbell Curl', note: 'Sztanga na szerokość ramion. Łokcie przy tułowiu. Kontrolowane opuszczanie — nie oszukuj.' },
      { name: 'Cable Curl', note: 'Stałe napięcie przez cały ruch. Łokcie nieruchomo, pełen zakres ruchu.' },
      { name: 'Preacher Curl', note: 'Ramiona oparte o podpórkę — eliminuje oszukiwanie. Pełne rozciągnięcie na dole.' },
    ],
  },

  // === LEGS (QUADS) ===
  {
    pattern: 'Prostowanie kolan (czworogłowe)',
    exercises: [
      { name: 'Leg Extension', note: 'Wyprostuj kolana do końca na górze. Kontrolowane opuszczanie. Izolacja mięśni czworogłowych.' },
      { name: 'Sissy Squat', note: 'Odchyl tułów do tyłu, kolana do przodu. Pełen zakres ruchu. Mocno angażuje czworogłowe.' },
    ],
  },

  // === LEGS (HAMSTRINGS) ===
  {
    pattern: 'Zginanie kolan (dwugłowe uda)',
    exercises: [
      { name: 'Seated Leg Curl', note: 'Kontrolowany ruch. Na dole poczuj rozciągnięcie mięśni dwugłowych uda. Bez rozpędu.' },
      { name: 'Lying Leg Curl', note: 'Leżąc na brzuchu, zginaj kolana kontrolowanym ruchem. Pełen zakres na dole.' },
      { name: 'Nordic Hamstring Curl', note: 'Opuszczaj się jak najwolniej, kontrolując ruch. Potężne ćwiczenie ekscentryczne na dwugłowe uda.' },
    ],
  },

  // === ADDUCTORS ===
  {
    pattern: 'Przywodzenie (adduktory)',
    exercises: [
      { name: 'Przywodzenie nóg na maszynie (Hip Adduction)', note: 'Kontrolowany ruch w pełnym zakresie. Przytrzymaj na moment w pozycji skurczonej.' },
      { name: 'Copenhagen Adduction', note: 'Podpórka boczna z nogą na ławce. Unoś biodra angażując przywodziciele. Profilaktyka kontuzji.' },
      { name: 'Cable Hip Adduction', note: 'Stań bokiem do wyciągu, ciągnij nogę do środka. Kontrolowany ruch, pełen zakres.' },
    ],
  },

  // === CORE ===
  {
    pattern: 'Stabilizacja / brzuch',
    exercises: [
      { name: 'Pallof Press', note: 'Stań bokiem do wyciągu. Wypchnij uchwyt przed siebie. Nie pozwól na obrót tułowia. Obie strony.' },
      { name: 'Ab Wheel Rollout', note: 'Wyciągaj wałek przed siebie utrzymując napięcie brzucha. Wracaj kontrolowanym ruchem.' },
      { name: 'Hanging Leg Raise', note: 'Zwisaj na drążku, podnoś proste nogi do poziomu. Kontroluj ruch brzuchem.' },
      { name: 'Cable Crunch', note: 'Klęknij przed wyciągiem. Zwijaj tułów w dół napinając mięśnie brzucha. Kontrolowany powrót.' },
      { name: 'Plank', note: 'Utrzymuj ciało w jednej linii od głowy do pięt. Napnij brzuch i oddychaj równomiernie.' },
      { name: 'Dead Bug', note: 'Leżąc na plecach, wyprostuj naprzemiennie rękę i nogę. Dolna część pleców przyciśnięta do podłogi.' },
    ],
  },
];

/**
 * Find alternative exercises for a given exercise name.
 * Returns the group of alternatives (excluding the current exercise).
 */
export function getAlternatives(exerciseName: string): AlternativeGroup | null {
  const name = exerciseName.toLowerCase();

  for (const group of ALTERNATIVE_GROUPS) {
    const match = group.exercises.some((ex) => {
      const exName = ex.name.toLowerCase();
      // Match if exercise name contains the alternative name or vice versa
      return name.includes(exName) || exName.includes(name)
        // Also match partial keywords for common exercises
        || matchKeywords(name, exName);
    });

    if (match) {
      return {
        ...group,
        exercises: group.exercises.filter((ex) => {
          const exName = ex.name.toLowerCase();
          return !(name.includes(exName) || exName.includes(name) || matchKeywords(name, exName));
        }),
      };
    }
  }
  return null;
}

/** Fuzzy keyword matching for exercise names */
function matchKeywords(a: string, b: string): boolean {
  // Extract meaningful keywords (3+ chars)
  const getKeywords = (s: string) =>
    s.split(/[\s()\/,\-]+/).filter((w) => w.length >= 3).map((w) => w.toLowerCase());

  const kw_a = getKeywords(a);
  const kw_b = getKeywords(b);

  // If at least 2 keywords match, consider it the same exercise
  let matches = 0;
  for (const w of kw_a) {
    if (kw_b.some((k) => k.includes(w) || w.includes(k))) matches++;
  }
  return matches >= 2;
}
