// Simplified country centroids for detection — lat/lng for ~195 countries
// Used to match click coordinates to nearest country
export interface CountryCentroid {
  code: string;
  name: string;
  lat: number;
  lng: number;
}

export const countryCentroids: CountryCentroid[] = [
  { code: "AF", name: "Afghanistan", lat: 33.94, lng: 67.71 },
  { code: "AL", name: "Albania", lat: 41.15, lng: 20.17 },
  { code: "DZ", name: "Algeria", lat: 28.03, lng: 1.66 },
  { code: "AR", name: "Argentina", lat: -38.42, lng: -63.62 },
  { code: "AU", name: "Australia", lat: -25.27, lng: 133.78 },
  { code: "AT", name: "Austria", lat: 47.52, lng: 14.55 },
  { code: "BD", name: "Bangladesh", lat: 23.68, lng: 90.36 },
  { code: "BE", name: "Belgium", lat: 50.50, lng: 4.47 },
  { code: "BR", name: "Brazil", lat: -14.24, lng: -51.93 },
  { code: "BG", name: "Bulgaria", lat: 42.73, lng: 25.49 },
  { code: "KH", name: "Cambodia", lat: 12.57, lng: 104.99 },
  { code: "CM", name: "Cameroon", lat: 7.37, lng: 12.35 },
  { code: "CA", name: "Canada", lat: 56.13, lng: -106.35 },
  { code: "CL", name: "Chile", lat: -35.68, lng: -71.54 },
  { code: "CN", name: "China", lat: 35.86, lng: 104.20 },
  { code: "CO", name: "Colombia", lat: 4.57, lng: -74.30 },
  { code: "CD", name: "DR Congo", lat: -4.04, lng: 21.76 },
  { code: "HR", name: "Croatia", lat: 45.10, lng: 15.20 },
  { code: "CU", name: "Cuba", lat: 21.52, lng: -77.78 },
  { code: "CZ", name: "Czech Republic", lat: 49.82, lng: 15.47 },
  { code: "DK", name: "Denmark", lat: 56.26, lng: 9.50 },
  { code: "EG", name: "Egypt", lat: 26.82, lng: 30.80 },
  { code: "ET", name: "Ethiopia", lat: 9.15, lng: 40.49 },
  { code: "FI", name: "Finland", lat: 61.92, lng: 25.75 },
  { code: "FR", name: "France", lat: 46.23, lng: 2.21 },
  { code: "DE", name: "Germany", lat: 51.17, lng: 10.45 },
  { code: "GH", name: "Ghana", lat: 7.95, lng: -1.02 },
  { code: "GR", name: "Greece", lat: 39.07, lng: 21.82 },
  { code: "HU", name: "Hungary", lat: 47.16, lng: 19.50 },
  { code: "IN", name: "India", lat: 20.59, lng: 78.96 },
  { code: "ID", name: "Indonesia", lat: -0.79, lng: 113.92 },
  { code: "IR", name: "Iran", lat: 32.43, lng: 53.69 },
  { code: "IQ", name: "Iraq", lat: 33.22, lng: 43.68 },
  { code: "IE", name: "Ireland", lat: 53.14, lng: -7.69 },
  { code: "IL", name: "Israel", lat: 31.05, lng: 34.85 },
  { code: "IT", name: "Italy", lat: 41.87, lng: 12.57 },
  { code: "JP", name: "Japan", lat: 36.20, lng: 138.25 },
  { code: "JO", name: "Jordan", lat: 30.59, lng: 36.24 },
  { code: "KZ", name: "Kazakhstan", lat: 48.02, lng: 66.92 },
  { code: "KE", name: "Kenya", lat: -0.02, lng: 37.91 },
  { code: "KP", name: "North Korea", lat: 40.34, lng: 127.51 },
  { code: "KR", name: "South Korea", lat: 35.91, lng: 127.77 },
  { code: "KW", name: "Kuwait", lat: 29.31, lng: 47.48 },
  { code: "LB", name: "Lebanon", lat: 33.85, lng: 35.86 },
  { code: "LY", name: "Libya", lat: 26.34, lng: 17.23 },
  { code: "MY", name: "Malaysia", lat: 4.21, lng: 101.98 },
  { code: "MX", name: "Mexico", lat: 23.63, lng: -102.55 },
  { code: "MA", name: "Morocco", lat: 31.79, lng: -7.09 },
  { code: "MM", name: "Myanmar", lat: 21.91, lng: 95.96 },
  { code: "NP", name: "Nepal", lat: 28.39, lng: 84.12 },
  { code: "NL", name: "Netherlands", lat: 52.13, lng: 5.29 },
  { code: "NZ", name: "New Zealand", lat: -40.90, lng: 174.89 },
  { code: "NG", name: "Nigeria", lat: 9.08, lng: 8.68 },
  { code: "NO", name: "Norway", lat: 60.47, lng: 8.47 },
  { code: "PK", name: "Pakistan", lat: 30.38, lng: 69.35 },
  { code: "PS", name: "Palestine", lat: 31.95, lng: 35.23 },
  { code: "PA", name: "Panama", lat: 8.54, lng: -80.78 },
  { code: "PE", name: "Peru", lat: -9.19, lng: -75.02 },
  { code: "PH", name: "Philippines", lat: 12.88, lng: 121.77 },
  { code: "PL", name: "Poland", lat: 51.92, lng: 19.15 },
  { code: "PT", name: "Portugal", lat: 39.40, lng: -8.22 },
  { code: "QA", name: "Qatar", lat: 25.35, lng: 51.18 },
  { code: "RO", name: "Romania", lat: 45.94, lng: 24.97 },
  { code: "RU", name: "Russia", lat: 61.52, lng: 105.32 },
  { code: "SA", name: "Saudi Arabia", lat: 23.89, lng: 45.08 },
  { code: "RS", name: "Serbia", lat: 44.02, lng: 21.01 },
  { code: "SG", name: "Singapore", lat: 1.35, lng: 103.82 },
  { code: "ZA", name: "South Africa", lat: -30.56, lng: 22.94 },
  { code: "ES", name: "Spain", lat: 40.46, lng: -3.75 },
  { code: "LK", name: "Sri Lanka", lat: 7.87, lng: 80.77 },
  { code: "SD", name: "Sudan", lat: 12.86, lng: 30.22 },
  { code: "SE", name: "Sweden", lat: 60.13, lng: 18.64 },
  { code: "CH", name: "Switzerland", lat: 46.82, lng: 8.23 },
  { code: "SY", name: "Syria", lat: 34.80, lng: 38.99 },
  { code: "TW", name: "Taiwan", lat: 23.70, lng: 120.96 },
  { code: "TH", name: "Thailand", lat: 15.87, lng: 100.99 },
  { code: "TR", name: "Turkey", lat: 38.96, lng: 35.24 },
  { code: "UA", name: "Ukraine", lat: 48.38, lng: 31.17 },
  { code: "AE", name: "United Arab Emirates", lat: 23.42, lng: 53.85 },
  { code: "GB", name: "United Kingdom", lat: 55.38, lng: -3.44 },
  { code: "US", name: "United States", lat: 37.09, lng: -95.71 },
  { code: "VE", name: "Venezuela", lat: 6.42, lng: -66.59 },
  { code: "VN", name: "Vietnam", lat: 14.06, lng: 108.28 },
  { code: "YE", name: "Yemen", lat: 15.55, lng: 48.52 },
  { code: "ZW", name: "Zimbabwe", lat: -19.02, lng: 29.15 },
  { code: "AO", name: "Angola", lat: -11.20, lng: 17.87 },
  { code: "EC", name: "Ecuador", lat: -1.83, lng: -78.18 },
  { code: "TN", name: "Tunisia", lat: 33.89, lng: 9.54 },
  { code: "UZ", name: "Uzbekistan", lat: 41.38, lng: 64.59 },
  { code: "BY", name: "Belarus", lat: 53.71, lng: 27.95 },
  { code: "GE", name: "Georgia", lat: 42.32, lng: 43.36 },
  { code: "AM", name: "Armenia", lat: 40.07, lng: 45.04 },
  { code: "AZ", name: "Azerbaijan", lat: 40.14, lng: 47.58 },
  { code: "TZ", name: "Tanzania", lat: -6.37, lng: 34.89 },
  { code: "UG", name: "Uganda", lat: 1.37, lng: 32.29 },
  { code: "MZ", name: "Mozambique", lat: -18.67, lng: 35.53 },
  { code: "SO", name: "Somalia", lat: 5.15, lng: 46.20 },
  { code: "ML", name: "Mali", lat: 17.57, lng: -4.00 },
  { code: "BF", name: "Burkina Faso", lat: 12.24, lng: -1.56 },
  { code: "NE", name: "Niger", lat: 17.61, lng: 8.08 },
  { code: "TD", name: "Chad", lat: 15.45, lng: 18.73 },
];

// Convert lat/lng to 3D sphere coordinates
export function latLngToVector3(lat: number, lng: number, radius: number = 1): [number, number, number] {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lng + 180) * (Math.PI / 180);
  const x = -(radius * Math.sin(phi) * Math.cos(theta));
  const z = radius * Math.sin(phi) * Math.sin(theta);
  const y = radius * Math.cos(phi);
  return [x, y, z];
}

// Find nearest country to a 3D point on the sphere
export function findNearestCountry(
  point: { x: number; y: number; z: number },
  radius: number = 1
): CountryCentroid | null {
  let nearest: CountryCentroid | null = null;
  let minDist = Infinity;

  // Convert 3D point back to lat/lng
  const r = Math.sqrt(point.x ** 2 + point.y ** 2 + point.z ** 2);
  const lat = 90 - Math.acos(point.y / r) * (180 / Math.PI);
  const lng = -(Math.atan2(point.z, -point.x) * (180 / Math.PI)) - 180;
  const normalizedLng = ((lng + 540) % 360) - 180;

  for (const country of countryCentroids) {
    const dlat = lat - country.lat;
    const dlng = normalizedLng - country.lng;
    // Weight longitude by latitude for better accuracy near poles
    const cosLat = Math.cos(lat * (Math.PI / 180));
    const dist = Math.sqrt(dlat * dlat + (dlng * cosLat) * (dlng * cosLat));
    if (dist < minDist) {
      minDist = dist;
      nearest = country;
    }
  }

  // Only match if reasonably close (within ~15 degrees)
  return minDist < 15 ? nearest : null;
}
