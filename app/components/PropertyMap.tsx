'use client';

import { useEffect, useRef, useMemo } from 'react';
import { createRoot } from 'react-dom/client';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { propertyMapStyles } from './propertyMap.styles';
import { MapPropertyPopupCard } from './MapPropertyPopupCard';

// Interface pour une propriété dans le mode multi-propriétés
export interface MapProperty {
    id: string | number;
    latitude: number;
    longitude: number;
    title?: string;
    location?: string;
    price?: number;
    investorCount?: number;
    propertyType?: string;
    squareFeet?: number;
    bedrooms?: number;
    bathrooms?: number;
    image?: string;
}

interface PropertyMapProps {
    // Mode simple (une seule propriété)
    latitude?: number;
    longitude?: number;
    title?: string;
    location?: string;
    price?: number;
    investorCount?: number;
    propertyType?: string;
    squareFeet?: number;
    bedrooms?: number;
    bathrooms?: number;
    image?: string;
    // Mode multi-propriétés
    properties?: MapProperty[];
    // Options communes
    hideCloseButton?: boolean;
    showNavigationControls?: boolean;
    onLoad?: () => void;
    hidden?: boolean;
}

// Coordonnées par défaut (Dubai)
const DEFAULT_CENTER: [number, number] = [55.2708, 25.2048];

export default function PropertyMap({ 
    latitude, 
    longitude, 
    title, 
    location,
    price,
    investorCount,
    propertyType,
    squareFeet,
    bedrooms,
    bathrooms,
    image,
    properties,
    hideCloseButton = false,
    showNavigationControls = false,
    onLoad, 
    hidden = false 
}: PropertyMapProps) {
    const mapContainerRef = useRef<HTMLDivElement>(null);
    const mapRef = useRef<mapboxgl.Map | null>(null);
    const markersRef = useRef<mapboxgl.Marker[]>([]);
    const popupRootsRef = useRef<Map<string, ReturnType<typeof createRoot>>>(new Map());

    // Mode multi-propriétés ou simple
    const isMultiMode = !!properties && properties.length > 0;

    // Calculer les propriétés à afficher
    const displayProperties = useMemo<MapProperty[]>(() => {
        if (isMultiMode && properties) {
            return properties.filter(p => p.latitude != null && p.longitude != null);
        }
        if (latitude != null && longitude != null) {
            return [{
                id: 'single',
                latitude,
                longitude,
                title,
                location,
                price,
                investorCount,
                propertyType,
                squareFeet,
                bedrooms,
                bathrooms,
                image,
            }];
        }
        return [];
    }, [isMultiMode, properties, latitude, longitude, title, location, price, investorCount, propertyType, squareFeet, bedrooms, bathrooms, image]);

    // Calculer les bounds pour le mode multi
    const mapBounds = useMemo(() => {
        if (displayProperties.length <= 1) return null;
        const bounds = new mapboxgl.LngLatBounds();
        displayProperties.forEach(p => {
            bounds.extend([p.longitude, p.latitude]);
        });
        return bounds;
    }, [displayProperties]);

    // Calculer le centre initial
    const initialCenter = useMemo<[number, number]>(() => {
        if (displayProperties.length === 0) return DEFAULT_CENTER;
        if (displayProperties.length === 1) {
            return [displayProperties[0].longitude, displayProperties[0].latitude];
        }
        // Pour multi, on commence par le centre de Dubai, puis on fait fitBounds
        return DEFAULT_CENTER;
    }, [displayProperties]);

    useEffect(() => {
        if (!mapContainerRef.current || displayProperties.length === 0) return;

        const mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
        if (!mapboxToken) return;
        
        mapboxgl.accessToken = mapboxToken;

        const map = new mapboxgl.Map({
            container: mapContainerRef.current,
            style: 'mapbox://styles/mapbox/dark-v11',
            center: initialCenter,
            zoom: 10,
            pitch: 0,
            bearing: -17.6,
            attributionControl: false,
            antialias: true,
        });

        mapRef.current = map;

        // Ajouter les contrôles de navigation si demandé
        if (showNavigationControls) {
            map.addControl(new mapboxgl.NavigationControl(), 'top-left');
        }

        // Ajouter la couche 3D des bâtiments
        map.on('style.load', () => {
            const layers = map.getStyle().layers;
            const labelLayerId = layers.find(
                (layer: any) => layer.type === 'symbol' && layer.layout && layer.layout['text-field']
            )?.id;

            if (!map.getLayer('add-3d-buildings')) {
                map.addLayer(
                    {
                        id: 'add-3d-buildings',
                        source: 'composite',
                        'source-layer': 'building',
                        filter: ['==', 'extrude', 'true'],
                        type: 'fill-extrusion',
                        minzoom: 15,
                        paint: {
                            'fill-extrusion-color': '#2a2a2a',
                            'fill-extrusion-height': [
                                'interpolate', ['linear'], ['zoom'],
                                15, 0,
                                15.05, ['get', 'height'],
                            ],
                            'fill-extrusion-base': [
                                'interpolate', ['linear'], ['zoom'],
                                15, 0,
                                15.05, ['get', 'min_height'],
                            ],
                            'fill-extrusion-opacity': 0.8,
                        },
                    },
                    labelLayerId
                );
            }

            setTimeout(() => map.resize(), 100);
        });

        map.on('load', () => {
            // Créer les marqueurs pour chaque propriété
            displayProperties.forEach((property, index) => {
                // Fonction flyTo pour cette propriété
                const flyToProperty = () => {
                    map.flyTo({
                        center: [property.longitude, property.latitude],
                        zoom: 16,
                        pitch: 45,
                        bearing: 0,
                        duration: 2000,
                        essential: true,
                        curve: 1.5,
                    });
                };

                // Créer le popup React
                const popupNode = document.createElement('div');
                const popupRoot = createRoot(popupNode);
                popupRootsRef.current.set(String(property.id), popupRoot);

                popupRoot.render(
                    <MapPropertyPopupCard
                        title={property.title}
                        location={property.location}
                        price={property.price}
                        investorCount={property.investorCount}
                        propertyType={property.propertyType}
                        squareFeet={property.squareFeet}
                        bedrooms={property.bedrooms}
                        bathrooms={property.bathrooms}
                        image={property.image}
                    />
                );

                const popup = new mapboxgl.Popup({
                    offset: [0, -10],
                    closeOnClick: false,
                    closeButton: !hideCloseButton,
                    maxWidth: 'none',
                    className: 'mapbox-popup-comic-bubble'
                }).setDOMContent(popupNode);

                // Marqueur avec ondes animées adaptatives au zoom
                const markerElement = document.createElement('div');
                markerElement.className = 'custom-map-marker zoom-low'; // Commence en zoom-low
                markerElement.innerHTML = `
                    <div class="marker-pulse-ring marker-pulse-ring-1"></div>
                    <div class="marker-pulse-ring marker-pulse-ring-2"></div>
                    <div class="marker-pulse-ring marker-pulse-ring-3"></div>
                    <div class="marker-center"></div>
                `;

                const marker = new mapboxgl.Marker({
                    element: markerElement,
                    anchor: 'center',
                })
                    .setLngLat([property.longitude, property.latitude])
                    .setPopup(popup)
                    .addTo(map);

                markersRef.current.push(marker);

                // Gestionnaire de clic sur le popup
                popup.on('open', () => {
                    const popupElement = popup.getElement();
                    if (popupElement) {
                        popupElement.style.cursor = 'pointer';
                        const handlePopupClick = (e: MouseEvent) => {
                            const target = e.target as HTMLElement;
                            if (target.closest('.mapboxgl-popup-close-button')) return;
                            flyToProperty();
                        };
                        popupElement.addEventListener('click', handlePopupClick);
                        popup.on('close', () => {
                            popupElement.removeEventListener('click', handlePopupClick);
                        });
                    }
                });

                // Ouvrir le popup du premier marqueur
                if (index === 0) {
                    requestAnimationFrame(() => {
                        requestAnimationFrame(() => {
                            marker.togglePopup();
                        });
                    });
                }
            });

            // Fonction pour mettre à jour les classes des marqueurs selon le zoom
            const updateMarkersForZoom = () => {
                const zoom = map.getZoom();
                let zoomClass = 'zoom-low';
                
                if (zoom >= 14) {
                    zoomClass = 'zoom-high';
                } else if (zoom >= 12) {
                    zoomClass = 'zoom-medium';
                }

                markersRef.current.forEach(marker => {
                    const el = marker.getElement();
                    el.classList.remove('zoom-low', 'zoom-medium', 'zoom-high');
                    el.classList.add(zoomClass);
                });
            };

            // Écouter les changements de zoom
            map.on('zoom', updateMarkersForZoom);
            // Appliquer immédiatement
            updateMarkersForZoom();

            // Animation d'entrée
            setTimeout(() => {
                if (isMultiMode && mapBounds && displayProperties.length > 1) {
                    // Mode multi : fitBounds puis pitch
                    map.fitBounds(mapBounds, {
                        padding: 80,
                        maxZoom: 13,
                        duration: 2000,
                    });
                    setTimeout(() => {
                        map.easeTo({ pitch: 45, duration: 1000 });
                    }, 2200);
                } else if (displayProperties.length === 1) {
                    // Mode simple : flyTo direct
                    const prop = displayProperties[0];
                    map.flyTo({
                        center: [prop.longitude, prop.latitude],
                        zoom: 16,
                        pitch: 45,
                        bearing: 0,
                        duration: 2000,
                        essential: true,
                        curve: 1.5,
                    });
                }
            }, 300);

            map.resize();

            if (onLoad) {
                onLoad();
            }
        });

        // Gestion du scroll
        const handleWheel = (e: WheelEvent) => {
            if (mapContainerRef.current?.contains(e.target as Node)) {
                e.stopPropagation();
            }
        };

        const handleTouchMove = (e: TouchEvent) => {
            if (mapContainerRef.current?.contains(e.target as Node)) {
                e.stopPropagation();
            }
        };

        mapContainerRef.current?.addEventListener('wheel', handleWheel, { passive: false });
        mapContainerRef.current?.addEventListener('touchmove', handleTouchMove, { passive: false });

        return () => {
            popupRootsRef.current.forEach((root) => root.unmount());
            popupRootsRef.current.clear();
            mapContainerRef.current?.removeEventListener('wheel', handleWheel);
            mapContainerRef.current?.removeEventListener('touchmove', handleTouchMove);
            markersRef.current.forEach(marker => marker.remove());
            markersRef.current = [];
            map.remove();
        };
    }, [displayProperties, initialCenter, isMultiMode, mapBounds, hideCloseButton, showNavigationControls, onLoad]);

    return (
        <div 
            className={propertyMapStyles.mapContainer} 
            ref={mapContainerRef}
            style={{ 
                visibility: hidden ? 'hidden' : 'visible',
                position: hidden ? 'absolute' : 'relative',
                width: hidden ? '1px' : '100%',
                height: hidden ? '1px' : '100%',
                overflow: hidden ? 'hidden' : 'visible',
            }}
        />
    );
}

