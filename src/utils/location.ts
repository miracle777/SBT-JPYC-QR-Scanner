/**
 * 位置情報を取得
 */
export async function getCurrentLocation(): Promise<{
  latitude: number;
  longitude: number;
  accuracy?: number;
} | null> {
  if (!navigator.geolocation) {
    console.warn('Geolocation is not supported by this browser.');
    return null;
  }

  console.log('Requesting geolocation...');
  
  return new Promise((resolve) => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        console.log('Geolocation acquired:', position.coords);
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
        });
      },
      (error) => {
        console.warn('Error getting location:', error.message, error.code);
        resolve(null);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000, // 10秒に延長
        maximumAge: 0,
      }
    );
  });
}

/**
 * 緯度経度から住所を取得（OpenStreetMap Nominatim使用）
 */
export async function getAddressFromCoordinates(
  latitude: number,
  longitude: number
): Promise<string | null> {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&accept-language=ja`,
      {
        headers: {
          'User-Agent': 'SBT-JPYC-QR-Scanner',
        },
      }
    );

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    
    // 住所情報を構築
    const address = data.address;
    if (!address) return null;

    // 日本の住所形式に整形
    const parts = [];
    if (address.country === '日本') {
      if (address.state) parts.push(address.state);
      if (address.city || address.town || address.village) {
        parts.push(address.city || address.town || address.village);
      }
      if (address.suburb) parts.push(address.suburb);
      if (address.road) parts.push(address.road);
    } else {
      // 日本以外の場合はdisplay_nameを使用
      return data.display_name;
    }

    return parts.length > 0 ? parts.join(' ') : data.display_name;
  } catch (error) {
    console.warn('Error getting address:', error);
    return null;
  }
}

/**
 * 位置情報と住所を取得
 */
export async function getLocationWithAddress(): Promise<{
  latitude: number;
  longitude: number;
  accuracy?: number;
  address?: string;
} | null> {
  console.log('Getting location with address...');
  const location = await getCurrentLocation();
  if (!location) {
    console.log('Location not available');
    return null;
  }

  console.log('Getting address for location:', location);
  const address = await getAddressFromCoordinates(
    location.latitude,
    location.longitude
  );

  const result = {
    ...location,
    address: address || undefined,
  };
  
  console.log('Location with address:', result);
  return result;
}
