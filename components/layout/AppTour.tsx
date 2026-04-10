'use client';

import { useEffect } from 'react';
import { driver, type DriveStep } from 'driver.js';
import 'driver.js/dist/driver.css';

const TOUR_KEY = 'pl-tour-done';

export function AppTour() {
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (localStorage.getItem(TOUR_KEY)) return;

    const timeout = setTimeout(() => {
      const steps: DriveStep[] = [
        {
          element: '#tour-workout',
          popover: {
            title: 'Twój następny trening',
            description:
              'Tu zobaczysz co masz dziś do zrobienia. Strzałki pozwalają przeglądać inne dni i tygodnie. Kliknij "Rozpocznij trening" żeby zacząć.',
            side: 'bottom',
            align: 'center',
          },
        },
        {
          element: '#tour-progress',
          popover: {
            title: 'Postęp cyklu',
            description:
              'Pasek pokazuje ile treningów już za Tobą z całego cyklu. Każdy ukończony trening automatycznie się tutaj liczy.',
            side: 'bottom',
            align: 'center',
          },
        },
      ];

      if (document.getElementById('tour-lifts')) {
        steps.push({
          element: '#tour-lifts',
          popover: {
            title: 'Progres siłowy',
            description:
              'Twoje aktualne 1RM vs cel na koniec cyklu. Ciężary aktualizują się automatycznie na podstawie RPE z treningów (autoregulacja).',
            side: 'top',
            align: 'center',
          },
        });
      }

      steps.push(
        {
          element: '#tour-nav-program',
          popover: {
            title: 'Podgląd programu',
            description:
              'Tutaj zobaczysz cały plan — wszystkie tygodnie, fazy (hipertrofia → siła → peaking) i ćwiczenia w każdym dniu.',
            side: 'top',
            align: 'center',
          },
        },
        {
          element: '#tour-nav-workout',
          popover: {
            title: 'Trening',
            description:
              'Główny przycisk — prowadzi do aktualnego treningu. Podczas sesji loguj serie, wagi i RPE. Po zakończeniu AI przeanalizuje Twoje wyniki.',
            side: 'top',
            align: 'center',
          },
        },
        {
          element: '#tour-nav-history',
          popover: {
            title: 'Historia',
            description:
              'Przegląd wszystkich ukończonych treningów z logami, notatkami i analizą AI.',
            side: 'top',
            align: 'center',
          },
        },
        {
          element: '#tour-nav-settings',
          popover: {
            title: 'Ustawienia',
            description:
              'Zmiana 1RM (automatycznie przelicza ciężary), klucze API, dane osobowe i generowanie nowego cyklu.',
            side: 'top',
            align: 'center',
          },
        },
      );

      const tour = driver({
        showProgress: true,
        animate: true,
        overlayColor: 'black',
        popoverClass: 'app-tour-popover',
        nextBtnText: 'Dalej',
        prevBtnText: 'Wstecz',
        doneBtnText: 'Zaczynamy!',
        progressText: '{{current}} z {{total}}',
        steps,
        onDestroyed: () => {
          localStorage.setItem(TOUR_KEY, 'true');
        },
      });

      tour.drive();
    }, 600);

    return () => clearTimeout(timeout);
  }, []);

  return null;
}
