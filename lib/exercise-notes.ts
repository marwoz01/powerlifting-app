/**
 * Fallback exercise notes for when AI doesn't provide them.
 * Key = lowercase exercise name substring match.
 */
const EXERCISE_NOTES: Record<string, string> = {
  // Main lifts
  'back squat': 'Pełna głębokość (biodra poniżej kolan). Kolana w linii palców, klatka wysoko. Kontrolowany excentric.',
  'przysiad': 'Pełna głębokość (biodra poniżej kolan). Kolana w linii palców, klatka wysoko. Kontrolowany excentric.',
  'bench press': 'Łopatki ściągnięte i wciśnięte w ławkę. Sztanga na linii brodawek. Kontrolowany opust, eksplozywne wyciskanie.',
  'wyciskanie': 'Łopatki ściągnięte i wciśnięte w ławkę. Sztanga na linię brodawek. Kontrolowany opust, eksplozywne wyciskanie.',
  'deadlift': 'Plecy proste przez cały ruch. Sztanga blisko ciała. Biodra i ramiona podnoszą się razem.',
  'martwy ciąg': 'Plecy proste przez cały ruch. Sztanga blisko ciała. Biodra i ramiona podnoszą się razem.',

  // Squat variations
  'front squat': 'Łokcie wysoko, klatka pionowo. Głębokość pełna — łatwiej niż w back squat. Mniejszy ciężar, większy zakres.',
  'przysiad frontowy': 'Łokcie wysoko, klatka pionowo. Głębokość pełna. Mniejszy ciężar, większy zakres ruchu.',
  'pause squat': 'Pauza 2-3s w dole bez odbicia. Utrzymaj napięcie core i pozycję klatki przez całą pauzę.',
  'tempo squat': 'Kontrolowany excentric 3-4s. Bez pauzy na dole, eksplozywny powrót. Buduje kontrolę i siłę pozycyjną.',
  'bulgarian': 'Stopa tylna na ławce, tułów lekko pochylony do przodu. Kolano przedniej nogi nie wychodzi za palce.',
  'bułgarskie': 'Stopa tylna na ławce, tułów lekko pochylony do przodu. Kolano przedniej nogi nie wychodzi za palce.',

  // Bench variations
  'close grip': 'Wąski chwyt (na szerokość ramion). Łokcie bliżej ciała. Większe zaangażowanie tricepsów.',
  'wąski chwyt': 'Chwyt na szerokość ramion. Łokcie bliżej ciała. Większe zaangażowanie tricepsów.',
  'pause bench': 'Pauza 1-2s na klatce. Bez odbicia sztangi — buduje siłę z martwego punktu.',
  'larsen press': 'Nogi uniesione — brak napędu z nóg. Testuje czystą siłę górnej partii ciała.',
  'spoto press': 'Sztanga zatrzymuje się 2-3 cm nad klatką. Buduje siłę w najtrudniejszym punkcie wyciskania.',
  'floor press': 'Leżąc na podłodze — ograniczony zakres ruchu. Fokus na lockout i tricepsy.',

  // Deadlift variations
  'sumo': 'Szerokie rozstawienie stóp, chwyt wewnątrz kolan. Tułów bardziej pionowy niż w konwencjonalnym.',
  'deficit': 'Stań na podwyższeniu 3-5 cm. Większy zakres ruchu — buduje siłę z podłogi.',
  'romanian': 'Kolana lekko ugięte (stały kąt). Ruch w biodrach — czujesz rozciąganie hamstringów. Sztanga blisko ud.',
  'rdl': 'Kolana lekko ugięte (stały kąt). Ruch w biodrach — czujesz rozciąganie hamstringów. Sztanga blisko ud.',
  'stiff leg': 'Nogi prawie proste. Maksymalne rozciągnięcie hamstringów. Kontrolowane tempo — nie szarpać.',
  'block pull': 'Sztanga startuje z podwyższenia. Fokus na lockout — biodra do przodu, barki do tyłu.',
  'pause deadlift': 'Pauza 2s na wysokości kolan. Utrzymaj pozycję pleców. Buduje siłę w martwym punkcie.',

  // Accessories
  'row': 'Łopatki ściągnięte na górze. Łokcie blisko ciała. Kontrolowany powrót — nie rzucaj ciężaru.',
  'wiosło': 'Łopatki ściągnięte na górze. Łokcie blisko ciała. Kontrolowany powrót — nie rzucaj ciężaru.',
  'pull-up': 'Pełen zakres — od wyprostu do brody nad drążkiem. Kontrolowany excentric. Nie kiwaj się.',
  'podciąganie': 'Pełen zakres — od wyprostu do brody nad drążkiem. Kontrolowany excentric. Nie kiwaj się.',
  'lat pulldown': 'Ciągnij do klatki, łopatki w dół. Kontrolowany powrót — czujesz rozciągnięcie najszerszych.',
  'ściąganie': 'Ciągnij do klatki, łopatki w dół. Kontrolowany powrót — czujesz rozciągnięcie najszerszych.',
  'ohp': 'Sztanga startuje na obojczykach. Głowa przechodzi do przodu po minięciu twarzy. Lockout nad głową.',
  'overhead': 'Sztanga startuje na obojczykach. Głowa przechodzi do przodu po minięciu twarzy. Lockout nad głową.',
  'dip': 'Tułów lekko pochylony do przodu (klatka) lub pionowo (triceps). Pełna głębokość — łokcie do 90°.',
  'face pull': 'Ciągnij do twarzy, łokcie wysoko. Rozróżniaj rotację zewnętrzną na końcu. Lekki ciężar, dużo powtórzeń.',
  'curl': 'Łokcie nieruchomo przy tułowiu. Kontrolowany excentric. Nie kiwaj ciałem — izoluj biceps.',
  'uginanie': 'Łokcie nieruchomo przy tułowiu. Kontrolowany excentric. Nie kiwaj ciałem — izoluj biceps.',
  'tricep': 'Pełne wyprostowanie ramion. Łokcie nieruchomo. Kontrolowane tempo — nie rzucaj ciężaru.',
  'extension': 'Pełen zakres ruchu. Na dole czujesz rozciągnięcie. Kontrolowany powrót do góry.',
  'lateral raise': 'Lekki ciężar, prowadź łokciami. Unieś do poziomu ramion. Kontrolowane opuszczanie.',
  'wznosy': 'Lekki ciężar, prowadź łokciami. Unieś do poziomu ramion. Kontrolowane opuszczanie.',
  'leg press': 'Stopy na szerokość bioder, wysoko na platformie. Kolana nie schodzą do klatki — kontroluj zakres.',
  'hack squat': 'Plecy przylegają do oparcia. Pełna głębokość. Stopy razem = quady, szerzej = pośladki.',
  'hip thrust': 'Łopatki na ławce. Wypchnij biodra do pełnego wyprostu. Ściskaj pośladki na górze 1-2s.',
  'plank': 'Ciało w jednej linii — nie unoś bioder. Napnij brzuch jakby ktoś miał Cię uderzyć. Oddychaj normalnie.',
  'leg curl': 'Kontrolowany ruch. Na dole pełne wyprostowanie. Nie używaj momentum — izoluj hamstringi.',
  'leg extension': 'Pełne wyprostowanie kolana na górze. Kontrolowane opuszczanie. Izolacja quadów.',
  'good morning': 'Sztanga na plecach. Ukłon w biodrach z lekko ugiętymi kolanami. Czujesz hamstringi. Plecy proste.',
  'hip adduct': 'Kontrolowany ruch, pełen zakres. Ściskaj na moment w pozycji skurczonej.',
  'hyperextension': 'Ruch w biodrach, nie w kręgosłupie. Napnij pośladki na górze. Nie przeprostowuj pleców.',
};

export function getExerciseNote(exerciseName: string): string | null {
  const name = exerciseName.toLowerCase();
  for (const [key, note] of Object.entries(EXERCISE_NOTES)) {
    if (name.includes(key)) return note;
  }
  return null;
}
