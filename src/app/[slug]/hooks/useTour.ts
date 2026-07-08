import { useEffect, useState } from "react";
import { TOUR_KEY, TOUR_STEPS } from "../constants";

interface UseTourResult {
  tourEtapa: number | null;
  proximaTour: () => void;
  fecharTour: () => void;
}

export function useTour(
  authLoading: boolean,
  carregandoConversa: boolean,
  mensagensLength: number
): UseTourResult {
  const [tourEtapa, setTourEtapa] = useState<number | null>(null);
  const [tourIniciado, setTourIniciado] = useState(false);

  // -------- Tour: disparar após tudo carregado (1x por dispositivo) --------
  useEffect(() => {
    if (authLoading || carregandoConversa || mensagensLength === 0 || tourIniciado) return;
    const visto = localStorage.getItem(TOUR_KEY);
    if (!visto) {
      setTourIniciado(true);
      setTourEtapa(0);
    }
  }, [authLoading, carregandoConversa, mensagensLength, tourIniciado]);

  const proximaTour = () => {
    if (tourEtapa === null) return;
    if (tourEtapa < TOUR_STEPS.length - 1) {
      setTourEtapa(tourEtapa + 1);
    } else {
      localStorage.setItem(TOUR_KEY, "true");
      setTourEtapa(null);
    }
  };

  const fecharTour = () => {
    localStorage.setItem(TOUR_KEY, "true");
    setTourEtapa(null);
  };

  return { tourEtapa, proximaTour, fecharTour };
}
