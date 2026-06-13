import Constants from 'expo-constants';
import { useEffect, useRef, useState } from 'react';
import { Platform, Text, View } from 'react-native';
import MapView, { Marker, PROVIDER_DEFAULT, PROVIDER_GOOGLE } from 'react-native-maps';

import { DEFAULT_DELTA, type AnimalMapProps, type MapRegion } from './AnimalMap.types';
import { clusterExpansionRegion, useClusters } from './useClusters';

// Google provider needs a native key on iOS; fall back to Apple Maps until set.
const iosHasGoogleKey = Constants.expoConfig?.extra?.hasGoogleMapsIosKey === true;
const provider = Platform.OS === 'ios' && !iosHasGoogleKey ? PROVIDER_DEFAULT : PROVIDER_GOOGLE;

export function AnimalMap({
  points,
  initialRegion,
  onRegionChange,
  onPointPress,
  onLongPress,
  showsUserLocation = false,
  center,
  centerKey,
}: AnimalMapProps) {
  const mapRef = useRef<MapView>(null);
  const [region, setRegion] = useState<MapRegion>(initialRegion);
  const clusters = useClusters(points, region);

  useEffect(() => {
    if (center && centerKey != null) {
      mapRef.current?.animateToRegion({ ...center, ...DEFAULT_DELTA }, 500);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- centerKey is the trigger by design
  }, [centerKey]);

  return (
    <MapView
      ref={mapRef}
      provider={provider}
      style={{ flex: 1 }}
      initialRegion={initialRegion}
      onRegionChangeComplete={(next) => {
        setRegion(next);
        onRegionChange?.(next);
      }}
      onLongPress={(event) => onLongPress?.(event.nativeEvent.coordinate)}
      showsUserLocation={showsUserLocation}
      showsMyLocationButton={false}
      toolbarEnabled={false}
      accessibilityLabel="Map of strays"
    >
      {clusters.map((point) =>
        point.isCluster ? (
          <Marker
            key={point.id}
            coordinate={{ latitude: point.latitude, longitude: point.longitude }}
            anchor={{ x: 0.5, y: 0.5 }}
            tracksViewChanges={false}
            accessibilityLabel={`Group of ${point.count} strays`}
            onPress={() => {
              mapRef.current?.animateToRegion(clusterExpansionRegion(points, point, region), 300);
            }}
          >
            <View
              className="items-center justify-center rounded-full border-2 border-white"
              style={{
                width: 40,
                height: 40,
                backgroundColor: point.color,
                shadowColor: '#000',
                shadowOpacity: 0.25,
                shadowRadius: 3,
                shadowOffset: { width: 0, height: 1 },
                elevation: 3,
              }}
            >
              <Text className="text-sm font-bold text-white">{point.count}</Text>
            </View>
          </Marker>
        ) : (
          <Marker
            key={point.id}
            coordinate={{ latitude: point.latitude, longitude: point.longitude }}
            anchor={{ x: 0.5, y: 0.5 }}
            tracksViewChanges={false}
            accessibilityLabel="Animal location"
            onPress={() => onPointPress?.(point.id)}
          >
            <View
              className="rounded-full border-2 border-white"
              style={{
                width: 22,
                height: 22,
                backgroundColor: point.color,
                shadowColor: '#000',
                shadowOpacity: 0.25,
                shadowRadius: 2,
                shadowOffset: { width: 0, height: 1 },
                elevation: 3,
              }}
            />
          </Marker>
        ),
      )}
    </MapView>
  );
}
