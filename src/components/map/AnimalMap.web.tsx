/// <reference types="google.maps" />
import { APIProvider, Map, Marker, useMap } from '@vis.gl/react-google-maps';
import { useEffect, useState } from 'react';
import { Text, View } from 'react-native';

import { GOOGLE_MAPS_WEB_KEY } from '@/constants/config';

import { regionToZoom, type AnimalMapProps, type MapRegion } from './AnimalMap.types';
import { clusterExpansionRegion, useClusters } from './useClusters';

// google.maps.SymbolPath.CIRCLE — numeric constant avoids touching the global
// before the Maps JS API has loaded.
const SYMBOL_CIRCLE = 0;

function regionFromBounds(map: google.maps.Map): MapRegion | null {
  const bounds = map.getBounds();
  const mapCenter = map.getCenter();
  if (!bounds || !mapCenter) return null;
  const ne = bounds.getNorthEast();
  const sw = bounds.getSouthWest();
  return {
    latitude: mapCenter.lat(),
    longitude: mapCenter.lng(),
    latitudeDelta: Math.abs(ne.lat() - sw.lat()),
    longitudeDelta: Math.abs(ne.lng() - sw.lng()),
  };
}

function MapContent({
  points,
  initialRegion,
  onRegionChange,
  onPointPress,
  center,
  centerKey,
}: AnimalMapProps) {
  const map = useMap();
  const [region, setRegion] = useState<MapRegion>(initialRegion);
  const clusters = useClusters(points, region);

  useEffect(() => {
    if (map && center && centerKey != null) {
      map.panTo({ lat: center.latitude, lng: center.longitude });
      map.setZoom(15);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- centerKey is the trigger by design
  }, [centerKey, map]);

  return (
    <>
      {clusters.map((point) =>
        point.isCluster ? (
          <Marker
            key={point.id}
            position={{ lat: point.latitude, lng: point.longitude }}
            title={`${point.count} strays`}
            icon={{
              path: SYMBOL_CIRCLE,
              scale: 18,
              fillColor: point.color,
              fillOpacity: 1,
              strokeColor: '#FFFFFF',
              strokeWeight: 2,
            }}
            label={{ text: String(point.count), color: '#FFFFFF', fontWeight: '700', fontSize: '13px' }}
            onClick={() => {
              const next = clusterExpansionRegion(points, point, region);
              map?.panTo({ lat: next.latitude, lng: next.longitude });
              map?.setZoom(regionToZoom(next));
            }}
          />
        ) : (
          <Marker
            key={point.id}
            position={{ lat: point.latitude, lng: point.longitude }}
            icon={{
              path: SYMBOL_CIRCLE,
              scale: 10,
              fillColor: point.color,
              fillOpacity: 1,
              strokeColor: '#FFFFFF',
              strokeWeight: 2,
            }}
            onClick={() => onPointPress?.(point.id)}
          />
        ),
      )}
      <RegionWatcher onRegion={(r) => { setRegion(r); onRegionChange?.(r); }} />
    </>
  );
}

function RegionWatcher({ onRegion }: { onRegion: (region: MapRegion) => void }) {
  const map = useMap();
  useEffect(() => {
    if (!map) return;
    const listener = map.addListener('idle', () => {
      const region = regionFromBounds(map);
      if (region) onRegion(region);
    });
    return () => listener.remove();
  }, [map, onRegion]);
  return null;
}

export function AnimalMap(props: AnimalMapProps) {
  if (!GOOGLE_MAPS_WEB_KEY) {
    return (
      <View className="flex-1 items-center justify-center gap-2 bg-stone-100 p-8 dark:bg-stone-900">
        <Text className="text-lg font-semibold text-stone-700 dark:text-stone-300">
          Map not configured
        </Text>
        <Text className="text-center text-sm text-stone-500 dark:text-stone-400">
          Set EXPO_PUBLIC_GOOGLE_MAPS_WEB_KEY in .env (Google Cloud → Maps JavaScript API) and
          restart the dev server.
        </Text>
      </View>
    );
  }

  return (
    <APIProvider apiKey={GOOGLE_MAPS_WEB_KEY}>
      <Map
        style={{ flex: 1 }}
        defaultCenter={{ lat: props.initialRegion.latitude, lng: props.initialRegion.longitude }}
        defaultZoom={regionToZoom(props.initialRegion)}
        gestureHandling="greedy"
        disableDefaultUI
        zoomControl
        clickableIcons={false}
        onContextmenu={(event) => {
          const latLng = event.detail.latLng;
          if (latLng) props.onLongPress?.({ latitude: latLng.lat, longitude: latLng.lng });
        }}
      >
        <MapContent {...props} />
      </Map>
    </APIProvider>
  );
}
