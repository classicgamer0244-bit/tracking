/**
 * Best-effort geocoding for the live shipments map. Shipment locations are
 * free-text ("Seattle, WA") rather than lat/lng, so this resolves a city (or
 * failing that, a country centroid) to approximate coordinates for display
 * purposes only — not suitable for anything requiring precision.
 */

type LatLng = [number, number]; // [longitude, latitude] — d3-geo/react-simple-maps order

const CITY_COORDS: Record<string, LatLng> = {
  "new york": [-74.006, 40.7128],
  "los angeles": [-118.2437, 34.0522],
  chicago: [-87.6298, 41.8781],
  seattle: [-122.3321, 47.6062],
  austin: [-97.7431, 30.2672],
  portland: [-122.6765, 45.5231],
  "san francisco": [-122.4194, 37.7749],
  boston: [-71.0589, 42.3601],
  miami: [-80.1918, 25.7617],
  denver: [-104.9903, 39.7392],
  dallas: [-96.797, 32.7767],
  houston: [-95.3698, 29.7604],
  atlanta: [-84.388, 33.749],
  london: [-0.1276, 51.5072],
  manchester: [-2.2426, 53.4808],
  birmingham: [-1.8904, 52.4862],
  toronto: [-79.3832, 43.6532],
  vancouver: [-123.1207, 49.2827],
  montreal: [-73.5673, 45.5017],
  berlin: [13.405, 52.52],
  munich: [11.582, 48.1351],
  hamburg: [9.9937, 53.5511],
  paris: [2.3522, 48.8566],
  madrid: [-3.7038, 40.4168],
  rome: [12.4964, 41.9028],
  amsterdam: [4.9041, 52.3676],
  brussels: [4.3517, 50.8503],
  zurich: [8.5417, 47.3769],
  vienna: [16.3738, 48.2082],
  stockholm: [18.0686, 59.3293],
  copenhagen: [12.5683, 55.6761],
  oslo: [10.7522, 59.9139],
  dublin: [-6.2603, 53.3498],
  lisbon: [-9.1393, 38.7223],
  warsaw: [21.0122, 52.2297],
  accra: [-0.187, 5.6037],
  kumasi: [-1.6244, 6.6885],
  lagos: [3.3792, 6.5244],
  abuja: [7.3986, 9.0765],
  nairobi: [36.8219, -1.2921],
  "cape town": [18.4241, -33.9249],
  johannesburg: [28.0473, -26.2041],
  cairo: [31.2357, 30.0444],
  casablanca: [-7.5898, 33.5731],
  sydney: [151.2093, -33.8688],
  melbourne: [144.9631, -37.8136],
  brisbane: [153.0251, -27.4698],
  perth: [115.8605, -31.9505],
  auckland: [174.7633, -36.8485],
  tokyo: [139.6503, 35.6762],
  osaka: [135.5023, 34.6937],
  seoul: [126.978, 37.5665],
  beijing: [116.4074, 39.9042],
  shanghai: [121.4737, 31.2304],
  "hong kong": [114.1694, 22.3193],
  singapore: [103.8198, 1.3521],
  bangkok: [100.5018, 13.7563],
  "kuala lumpur": [101.6869, 3.139],
  jakarta: [106.8456, -6.2088],
  manila: [120.9842, 14.5995],
  mumbai: [72.8777, 19.076],
  delhi: [77.1025, 28.7041],
  bangalore: [77.5946, 12.9716],
  dubai: [55.2708, 25.2048],
  "abu dhabi": [54.3773, 24.4539],
  doha: [51.531, 25.2854],
  "tel aviv": [34.7818, 32.0853],
  istanbul: [28.9784, 41.0082],
  "mexico city": [-99.1332, 19.4326],
  "sao paulo": [-46.6333, -23.5505],
  "rio de janeiro": [-43.1729, -22.9068],
  "buenos aires": [-58.3816, -34.6037],
  bogota: [-74.0721, 4.711],
  lima: [-77.0428, -12.0464],
  santiago: [-70.6693, -33.4489],
};

const COUNTRY_CENTROIDS: Record<string, LatLng> = {
  "united states": [-98.5795, 39.8283],
  usa: [-98.5795, 39.8283],
  "united kingdom": [-2.0, 54.0],
  uk: [-2.0, 54.0],
  canada: [-106.3468, 56.1304],
  germany: [10.4515, 51.1657],
  france: [2.2137, 46.2276],
  spain: [-3.7492, 40.4637],
  italy: [12.5674, 41.8719],
  netherlands: [5.2913, 52.1326],
  belgium: [4.4699, 50.5039],
  switzerland: [8.2275, 46.8182],
  austria: [14.5501, 47.5162],
  sweden: [18.6435, 60.1282],
  denmark: [9.5018, 56.2639],
  norway: [8.4689, 60.472],
  ireland: [-8.2439, 53.4129],
  portugal: [-8.2245, 39.3999],
  poland: [19.1451, 51.9194],
  ghana: [-1.0232, 7.9465],
  nigeria: [8.6753, 9.082],
  kenya: [37.9062, -0.0236],
  "south africa": [22.9375, -30.5595],
  egypt: [30.8025, 26.8206],
  morocco: [-7.0926, 31.7917],
  australia: [133.7751, -25.2744],
  "new zealand": [174.886, -40.9006],
  japan: [138.2529, 36.2048],
  "south korea": [127.7669, 35.9078],
  china: [104.1954, 35.8617],
  "hong kong": [114.1694, 22.3193],
  singapore: [103.8198, 1.3521],
  thailand: [100.9925, 15.87],
  malaysia: [101.9758, 4.2105],
  indonesia: [113.9213, -0.7893],
  philippines: [121.774, 12.8797],
  india: [78.9629, 20.5937],
  uae: [53.8478, 23.4241],
  "united arab emirates": [53.8478, 23.4241],
  qatar: [51.1839, 25.3548],
  israel: [34.8516, 31.0461],
  turkey: [35.2433, 38.9637],
  mexico: [-102.5528, 23.6345],
  brazil: [-51.9253, -14.235],
  argentina: [-63.6167, -38.4161],
  colombia: [-74.2973, 4.5709],
  peru: [-75.0152, -9.19],
  chile: [-71.543, -35.6751],
  ghanaian: [-1.0232, 7.9465],
};

function normalize(value: string): string {
  return value
    .toLowerCase()
    .replace(/\bsorting facility\b/g, "")
    .replace(/\bfacility\b/g, "")
    .replace(/\bhub\b/g, "")
    .replace(/\bwarehouse\b/g, "")
    .split(",")[0]
    .trim();
}

/** Resolves a free-text location like "Portland, OR sorting facility" or a city+country pair to [lng, lat]. */
export function resolveCoords(location: string | null | undefined, country?: string | null): LatLng | null {
  if (location) {
    const key = normalize(location);
    if (CITY_COORDS[key]) return CITY_COORDS[key];
  }
  if (country) {
    const key = country.toLowerCase().trim();
    if (COUNTRY_CENTROIDS[key]) return COUNTRY_CENTROIDS[key];
  }
  if (location) {
    // Last-ditch: the part after a comma is often the state/country.
    const parts = location.split(",");
    const last = parts[parts.length - 1]?.toLowerCase().trim();
    if (last && COUNTRY_CENTROIDS[last]) return COUNTRY_CENTROIDS[last];
  }
  return null;
}

export function interpolate(from: LatLng, to: LatLng, fraction: number): LatLng {
  const f = Math.max(0, Math.min(1, fraction));
  return [from[0] + (to[0] - from[0]) * f, from[1] + (to[1] - from[1]) * f];
}
