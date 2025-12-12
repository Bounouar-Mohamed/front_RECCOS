import { css } from '@/styled-system/css';

export const propertyMapStyles = {
  mapContainer: css({
    width: '100%',
    height: '100%',
    borderRadius: { base: '20px', md: '24px', lg: '28px' },
    overflow: 'hidden',
    position: 'relative',
    isolation: 'isolate', // Créer un nouveau contexte de stacking
    // Empêcher la propagation du scroll
    touchAction: 'pan-x pan-y pinch-zoom',
    // Solution robuste : utiliser clip-path pour forcer le borderRadius sur le canvas
    clipPath: { 
      base: 'inset(0 round 20px)', 
      md: 'inset(0 round 24px)', 
      lg: 'inset(0 round 28px)' 
    },
    // Forcer le borderRadius sur tous les éléments Mapbox
    '& .mapboxgl-map': {
      borderRadius: 'inherit',
      overflow: 'hidden',
      width: '100%',
      height: '100%',
    },
    '& .mapboxgl-canvas-container': {
      borderRadius: 'inherit',
      overflow: 'hidden',
      width: '100%',
      height: '100%',
    },
    '& .mapboxgl-canvas': {
      borderRadius: 'inherit',
      display: 'block',
      // Utiliser clip-path comme solution de secours pour le canvas
      clipPath: { 
        base: 'inset(0 round 20px)', 
        md: 'inset(0 round 24px)', 
        lg: 'inset(0 round 28px)' 
      },
    },
    '& .mapboxgl-ctrl-logo': {
      display: 'none', // Masquer le logo Mapbox par défaut
    },
    '& .mapboxgl-ctrl-attrib': {
      display: 'none', // Masquer l'attribution par défaut
    },
  } as any),
};

