/**
 * Fallback exercise notes for when AI doesn't provide them.
 * Key = lowercase exercise name substring match.
 * All notes in full Polish sentences, no abbreviations or anglicisms.
 */
const EXERCISE_NOTES: Record<string, string> = {
  // Główne boje
  'back squat':
    'Schodź do pełnej głębokości — biodra poniżej kolan. Kolana prowadź w linii palców stóp, klatkę piersiową trzymaj wysoko. Opuszczaj sztangę kontrolowanym ruchem.',
  'przysiad':
    'Schodź do pełnej głębokości — biodra poniżej kolan. Kolana prowadź w linii palców stóp, klatkę piersiową trzymaj wysoko. Opuszczaj sztangę kontrolowanym ruchem.',
  'bench press':
    'Ściągnij łopatki i wciśnij je w ławkę. Opuszczaj sztangę na linię brodawek sutkowych. Opuszczanie kontrolowane, wyciskanie dynamiczne.',
  'wyciskanie leżąc':
    'Ściągnij łopatki i wciśnij je w ławkę. Opuszczaj sztangę na linię brodawek sutkowych. Opuszczanie kontrolowane, wyciskanie dynamiczne.',
  'wyciskanie':
    'Ściągnij łopatki i wciśnij je w ławkę. Sztanga na linię brodawek sutkowych. Kontrolowane opuszczanie, dynamiczne wyciskanie.',
  'deadlift':
    'Utrzymuj proste plecy przez cały ruch. Prowadź sztangę blisko ciała. Biodra i ramiona powinny podnosić się jednocześnie.',
  'martwy ciąg':
    'Utrzymuj proste plecy przez cały ruch. Prowadź sztangę blisko ciała. Biodra i ramiona powinny podnosić się jednocześnie.',

  // Warianty przysiadu
  'front squat':
    'Trzymaj łokcie wysoko, a tułów pionowo. Schodź do pełnej głębokości. Używaj mniejszego ciężaru niż w przysiadzie tylnym, ale z większym zakresem ruchu.',
  'przysiad frontowy':
    'Trzymaj łokcie wysoko, a tułów pionowo. Schodź do pełnej głębokości. Używaj mniejszego ciężaru niż w przysiadzie tylnym, ale z większym zakresem ruchu.',
  'pause squat':
    'Zatrzymaj się na 2–3 sekundy w najniższym punkcie bez odbijania się. Przez całą pauzę utrzymuj napięcie brzucha i pozycję klatki piersiowej.',
  'tempo squat':
    'Opuszczaj się przez 3–4 sekundy kontrolowanym ruchem. Na dole bez zatrzymania — dynamiczny powrót do góry. Buduje kontrolę i siłę pozycyjną.',
  'bulgarian':
    'Tylna stopa oparta na ławce, tułów lekko pochylony do przodu. Pilnuj, żeby kolano przedniej nogi nie wychodziło daleko przed palce stóp.',
  'bułgarskie':
    'Tylna stopa oparta na ławce, tułów lekko pochylony do przodu. Pilnuj, żeby kolano przedniej nogi nie wychodziło daleko przed palce stóp.',
  'pin squat':
    'Ustaw sztangę na asekuracji na wysokości najniższego punktu przysiadu. Startuj z dołu bez rozbiegu — buduje siłę startową.',
  'anderson':
    'Ustaw sztangę na asekuracji na wysokości najniższego punktu przysiadu. Startuj z dołu bez rozbiegu — buduje siłę startową.',

  // Warianty wyciskania
  'close grip':
    'Chwyć sztangę na szerokość ramion. Łokcie prowadź bliżej tułowia. Większe zaangażowanie tricepsów niż w szerokim chwycie.',
  'wąski chwyt':
    'Chwyć sztangę na szerokość ramion. Łokcie prowadź bliżej tułowia. Większe zaangażowanie tricepsów niż w szerokim chwycie.',
  'pause bench':
    'Zatrzymaj sztangę na klatce piersiowej na 1–2 sekundy. Nie odbijaj — buduje siłę wyciskania z martwego punktu.',
  'larsen':
    'Wykonuj wyciskanie z uniesionymi nogami, bez napędu z nóg. Testuje czystą siłę górnej partii ciała.',
  'spoto':
    'Zatrzymaj sztangę 2–3 centymetry nad klatką piersiową. Buduje siłę w najtrudniejszym punkcie wyciskania.',
  'floor press':
    'Wyciskaj leżąc na podłodze — ograniczony zakres ruchu. Skupia pracę na końcowej fazie wyciskania i tricepsach.',
  'board press':
    'Opuszczaj sztangę na deskę na klatce piersiowej. Ogranicza zakres ruchu i buduje siłę w końcowej fazie wyciskania.',
  'incline dumbbell':
    'Ustaw ławkę pod kątem 30–45 stopni. Opuszczaj hantle do pełnego rozciągnięcia klatki piersiowej. Kontrolowane tempo w obu kierunkach.',

  // Warianty martwego ciągu
  'sumo':
    'Szerokie rozstawienie stóp, chwyt wewnątrz kolan. Tułów bardziej pionowy niż w wariancie klasycznym. Odpychaj podłogę nogami.',
  'deficit':
    'Stań na podwyższeniu 3–5 centymetrów. Większy zakres ruchu buduje siłę zrywania z podłogi.',
  'romanian':
    'Utrzymuj kolana lekko ugięte przez cały ruch. Pracuj w biodrach — poczuj rozciąganie mięśni dwugłowych uda. Prowadź sztangę blisko ud.',
  'rumuński':
    'Utrzymuj kolana lekko ugięte przez cały ruch. Pracuj w biodrach — poczuj rozciąganie mięśni dwugłowych uda. Prowadź sztangę blisko ud.',
  'rdl':
    'Utrzymuj kolana lekko ugięte przez cały ruch. Pracuj w biodrach — poczuj rozciąganie mięśni dwugłowych uda. Prowadź sztangę blisko ud.',
  'stiff leg':
    'Nogi prawie proste przez cały ruch. Maksymalnie rozciągaj mięśnie dwugłowe uda. Kontrolowane tempo — nie szarpaj ciężaru.',
  'block pull':
    'Sztanga startuje z podwyższenia. Skupia pracę na końcowej fazie ciągu — wypychaj biodra do przodu, cofaj ramiona.',
  'rack pull':
    'Sztanga startuje z podwyższenia na stojakach. Skupia pracę na końcowej fazie ciągu — wypychaj biodra do przodu, cofaj ramiona.',
  'pause deadlift':
    'Zatrzymaj sztangę na 2 sekundy na wysokości kolan. Utrzymaj pozycję pleców i napięcie brzucha. Buduje siłę w martwym punkcie.',
  'tempo deadlift':
    'Opuszczaj i podnoś sztangę przez 3 sekundy w każdą stronę. Kontrolowany ruch buduje świadomość pozycji ciała w każdej fazie.',

  // Ćwiczenia pleców
  'row':
    'Na górze ściągnij łopatki do siebie. Łokcie prowadź blisko tułowia. Opuszczaj ciężar kontrolowanym ruchem.',
  'wiosło':
    'Na górze ściągnij łopatki do siebie. Łokcie prowadź blisko tułowia. Opuszczaj ciężar kontrolowanym ruchem.',
  'wiosłowanie':
    'Na górze ściągnij łopatki do siebie. Łokcie prowadź blisko tułowia. Opuszczaj ciężar kontrolowanym ruchem.',
  'pull-up':
    'Zacznij od pełnego wyprostu ramion, ciągnij aż broda znajdzie się nad drążkiem. Opuszczaj się kontrolowanym ruchem. Nie kołysz ciałem.',
  'podciąganie':
    'Zacznij od pełnego wyprostu ramion, ciągnij aż broda znajdzie się nad drążkiem. Opuszczaj się kontrolowanym ruchem. Nie kołysz ciałem.',
  'lat pulldown':
    'Ciągnij drążek do klatki piersiowej, łopatki prowadź w dół. Przy powrocie poczuj rozciągnięcie mięśni najszerszych grzbietu.',
  'ściąganie':
    'Ciągnij drążek do klatki piersiowej, łopatki prowadź w dół. Przy powrocie poczuj rozciągnięcie mięśni najszerszych grzbietu.',
  'cable row':
    'Ciągnij uchwyt do brzucha, ściągając łopatki. Utrzymuj tułów nieruchomo. Kontrolowany powrót z pełnym rozciągnięciem.',
  'seated row':
    'Ciągnij uchwyt do brzucha, ściągając łopatki. Utrzymuj tułów nieruchomo. Kontrolowany powrót z pełnym rozciągnięciem.',
  'face pull':
    'Ciągnij linkę do wysokości twarzy, łokcie prowadź wysoko. Na końcu dodaj rotację zewnętrzną ramion. Używaj lekkiego ciężaru i dużo powtórzeń.',
  'band pull':
    'Rozciągaj gumę na wysokości klatki piersiowej, ściągając łopatki. Na końcu ruchu zatrzymaj się na sekundę. Ćwiczenie rozgrzewkowe i profilaktyczne dla barków.',

  // Ramiona i barki
  'curl':
    'Łokcie trzymaj nieruchomo przy tułowiu. Opuszczaj ciężar kontrolowanym ruchem. Nie pomagaj sobie kołysaniem ciała — izoluj bicepsy.',
  'uginanie':
    'Łokcie trzymaj nieruchomo przy tułowiu. Opuszczaj ciężar kontrolowanym ruchem. Nie pomagaj sobie kołysaniem ciała — izoluj bicepsy.',
  'hammer curl':
    'Chwyt młotkowy — dłonie zwrócone do siebie. Pracuj kontrolowanym ruchem, łokcie nieruchomo. Angażuje przedramiona i ramienno-promieniowy.',
  'incline curl':
    'Usiądź na ławce pochylonej pod kątem 45 stopni. Opuszczaj hantle do pełnego rozciągnięcia bicepsów. Kontrolowane tempo w obu kierunkach.',
  'tricep':
    'Wyprostuj ramiona do końca w każdym powtórzeniu. Łokcie trzymaj nieruchomo. Kontrolowane tempo — nie rzucaj ciężaru.',
  'prostowanie':
    'Wyprostuj ramiona do końca w każdym powtórzeniu. Łokcie trzymaj nieruchomo. Kontrolowane tempo — nie rzucaj ciężaru.',
  'overhead tricep':
    'Opuść ciężar za głowę do pełnego rozciągnięcia głowy długiej tricepsa. Wyprostuj ramiona do końca. Łokcie trzymaj blisko głowy.',
  'francuskie':
    'Opuść ciężar za głowę do pełnego rozciągnięcia głowy długiej tricepsa. Wyprostuj ramiona do końca. Łokcie trzymaj blisko głowy.',
  'pushdown':
    'Wypychaj linkę w dół do pełnego wyprostu ramion. Łokcie przyciśnięte do tułowia. Kontrolowany powrót do góry.',
  'lateral raise':
    'Używaj lekkiego ciężaru, prowadź ruch łokciami. Unieś ramiona do poziomu barków. Opuszczaj kontrolowanym ruchem.',
  'wznosy':
    'Używaj lekkiego ciężaru, prowadź ruch łokciami. Unieś ramiona do poziomu barków. Opuszczaj kontrolowanym ruchem.',
  'rear delt':
    'Pochyl tułów do przodu. Unieś ramiona na boki prowadząc łokciami. Ściskaj łopatki na górze ruchu. Lekki ciężar, dużo powtórzeń.',
  'odwodzenie':
    'Pochyl tułów do przodu. Unieś ramiona na boki prowadząc łokciami. Ściskaj łopatki na górze ruchu. Lekki ciężar, dużo powtórzeń.',
  'ohp':
    'Sztanga startuje na obojczykach. Po minięciu twarzy przesuń głowę do przodu pod sztangę. Zakończ ruch z ramionami wyprostowanymi nad głową.',
  'overhead press':
    'Sztanga startuje na obojczykach. Po minięciu twarzy przesuń głowę do przodu pod sztangę. Zakończ ruch z ramionami wyprostowanymi nad głową.',

  // Nogi — akcesoria
  'leg press':
    'Stopy na szerokość bioder, umieszczone wysoko na platformie. Nie pozwól, żeby kolana schodziły do klatki piersiowej — kontroluj zakres ruchu.',
  'hack squat':
    'Plecy przylegają do oparcia przez cały ruch. Schodź do pełnej głębokości. Stopy bliżej siebie mocniej angażują mięśnie czworogłowe.',
  'hip thrust':
    'Łopatki oparte na ławce. Wypchnij biodra do pełnego wyprostu. Na górze ściśnij pośladki i przytrzymaj przez 1–2 sekundy.',
  'leg curl':
    'Kontrolowany ruch w obu kierunkach. Na dole wyprostuj nogi do końca. Nie pomagaj sobie rozpędem — izoluj mięśnie dwugłowe uda.',
  'seated leg curl':
    'Kontrolowany ruch w obu kierunkach. Na dole poczuj rozciągnięcie mięśni dwugłowych uda. Nie pomagaj sobie rozpędem.',
  'leg extension':
    'Wyprostuj kolana do końca na górze każdego powtórzenia. Opuszczaj kontrolowanym ruchem. Izolacja mięśni czworogłowych.',
  'hip adduct':
    'Kontrolowany ruch w pełnym zakresie. W pozycji skurczonej przytrzymaj na moment. Ćwiczenie ważne dla profilaktyki kontuzji w trójboju.',
  'przywodzenie':
    'Kontrolowany ruch w pełnym zakresie. W pozycji skurczonej przytrzymaj na moment. Ćwiczenie ważne dla profilaktyki kontuzji w trójboju.',
  'good morning':
    'Sztanga na plecach, ukłon w biodrach z lekko ugiętymi kolanami. Poczuj rozciągnięcie mięśni dwugłowych uda. Plecy proste przez cały ruch.',
  'hyperextension':
    'Pracuj w biodrach, nie w kręgosłupie. Na górze napnij pośladki. Nie przeprostowuj pleców powyżej poziomu.',
  'split squat':
    'Nogi w wykroku, tułów lekko pochylony do przodu. Schodź aż kolano tylnej nogi prawie dotknie podłogi. Kontrolowane tempo.',

  // Brzuch i stabilizacja
  'plank':
    'Utrzymuj ciało w jednej linii od głowy do pięt — nie unoś bioder. Napnij mięśnie brzucha i oddychaj równomiernie.',
  'pallof press':
    'Stań bokiem do wyciągu. Wypchnij uchwyt przed siebie i przytrzymaj. Nie pozwól, żeby ciężar obrócił twój tułów. Wykonaj po obu stronach.',
  'ab wheel':
    'Wyciągaj wałek jak najdalej przed siebie, utrzymując napięcie brzucha. Wracaj kontrolowanym ruchem. Nie wyginaj pleców w łuk.',
  'hanging leg raise':
    'Zwisaj na drążku i podnoś proste nogi do poziomu. Nie kołysz się — kontroluj ruch brzuchem. Opuszczaj nogi powoli.',
  'unoszenie nóg':
    'Zwisaj na drążku i podnoś proste nogi do poziomu. Nie kołysz się — kontroluj ruch brzuchem. Opuszczaj nogi powoli.',

  // Inne
  'dip':
    'Pochyl tułów lekko do przodu, żeby mocniej zaangażować klatkę piersiową, lub trzymaj go pionowo, żeby skupić pracę na tricepsach. Schodź do kąta 90 stopni w łokciach.',
  'lu raise':
    'Unieś hantle przed siebie do poziomu oczu, a potem rozłóż na boki. Kontrolowane tempo. Lekki ciężar — ćwiczenie na zdrowie barków.',
  'external rotation':
    'Rotacja zewnętrzna ramienia z gumą lub lekkim ciężarem. Łokieć przyciśnięty do boku. Powolny, kontrolowany ruch. Profilaktyka kontuzji barku.',
  'copenhagen':
    'Podpórka boczna z nogą opartą o ławkę. Unoś biodra, angażując mięśnie przywodzące. Ćwiczenie profilaktyczne — zapobiega urazom pachwiny.',
};

export function getExerciseNote(exerciseName: string): string | null {
  const name = exerciseName.toLowerCase();
  for (const [key, note] of Object.entries(EXERCISE_NOTES)) {
    if (name.includes(key)) return note;
  }
  return null;
}
