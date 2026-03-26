/**
 * DR-573: Hotel image pools by city (IATA code).
 * Unsplash-hosted images, no download or storage needed.
 * Each hotel picks a different set from its city's pool based on its index.
 */

const BASE = 'https://images.unsplash.com/photo-';
const OPT = '?auto=format&fit=crop&w=800&q=80';
const url = (id: string) => `${BASE}${id}${OPT}`;

type HotelImagePool = { uri: string; category: string }[][];

const POOLS: Record<string, HotelImagePool> = {
  // Paris
  PAR: [
    [
      { uri: url('1502602898657-3e91760cbb34'), category: 'EXTERIOR' },
      { uri: url('1551882547-ff40c63fe5fa'), category: 'ROOM' },
      { uri: url('1414235077428-338989a2e8c0'), category: 'RESTAURANT' },
    ],
    [
      { uri: url('1520250497591-112f2f40a3f4'), category: 'EXTERIOR' },
      { uri: url('1578683010236-d716f9a3f461'), category: 'ROOM' },
      { uri: url('1571896349842-33c89424de2d'), category: 'LOBBY' },
    ],
    [
      { uri: url('1564501049412-61c2a3083791'), category: 'EXTERIOR' },
      { uri: url('1542314831-068cd1dbfeeb'), category: 'ROOM' },
      { uri: url('1566073771259-6a8506099945'), category: 'POOL' },
    ],
    [
      { uri: url('1549294413-26f195200c16'), category: 'EXTERIOR' },
      { uri: url('1455587734955-081b22074882'), category: 'LOBBY' },
      { uri: url('1444201983204-c43d83be0099'), category: 'ROOM' },
    ],
  ],

  // London
  LON: [
    [
      { uri: url('1513635269975-59663e0ac1ad'), category: 'EXTERIOR' },
      { uri: url('1551882547-ff40c63fe5fa'), category: 'ROOM' },
      { uri: url('1455587734955-081b22074882'), category: 'LOBBY' },
    ],
    [
      { uri: url('1526412736048-e8a3bab1df79'), category: 'EXTERIOR' },
      { uri: url('1542314831-068cd1dbfeeb'), category: 'ROOM' },
      { uri: url('1414235077428-338989a2e8c0'), category: 'RESTAURANT' },
    ],
    [
      { uri: url('1529290130-4ca3753253ae'), category: 'EXTERIOR' },
      { uri: url('1578683010236-d716f9a3f461'), category: 'ROOM' },
      { uri: url('1566073771259-6a8506099945'), category: 'POOL' },
    ],
  ],

  // New York
  NYC: [
    [
      { uri: url('1522083165195-3424ed129620'), category: 'EXTERIOR' },
      { uri: url('1551882547-ff40c63fe5fa'), category: 'ROOM' },
      { uri: url('1455587734955-081b22074882'), category: 'LOBBY' },
    ],
    [
      { uri: url('1496417263034-38ec4f0b665a'), category: 'EXTERIOR' },
      { uri: url('1542314831-068cd1dbfeeb'), category: 'ROOM' },
      { uri: url('1414235077428-338989a2e8c0'), category: 'RESTAURANT' },
    ],
    [
      { uri: url('1534430480872-3498386e7856'), category: 'EXTERIOR' },
      { uri: url('1578683010236-d716f9a3f461'), category: 'ROOM' },
      { uri: url('1566073771259-6a8506099945'), category: 'POOL' },
    ],
  ],

  // Rome
  ROM: [
    [
      { uri: url('1552832230-c0197dd311b5'), category: 'EXTERIOR' },
      { uri: url('1542314831-068cd1dbfeeb'), category: 'ROOM' },
      { uri: url('1414235077428-338989a2e8c0'), category: 'RESTAURANT' },
    ],
    [
      { uri: url('1529260830199-42c24126234d'), category: 'EXTERIOR' },
      { uri: url('1551882547-ff40c63fe5fa'), category: 'ROOM' },
      { uri: url('1571896349842-33c89424de2d'), category: 'LOBBY' },
    ],
  ],

  // Barcelona
  BCN: [
    [
      { uri: url('1583422409516-2895a77efded'), category: 'EXTERIOR' },
      { uri: url('1551882547-ff40c63fe5fa'), category: 'ROOM' },
      { uri: url('1566073771259-6a8506099945'), category: 'POOL' },
    ],
    [
      { uri: url('1520250497591-112f2f40a3f4'), category: 'EXTERIOR' },
      { uri: url('1578683010236-d716f9a3f461'), category: 'ROOM' },
      { uri: url('1414235077428-338989a2e8c0'), category: 'RESTAURANT' },
    ],
  ],

  // Amsterdam
  AMS: [
    [
      { uri: url('1534351590666-13e3e96b5702'), category: 'EXTERIOR' },
      { uri: url('1542314831-068cd1dbfeeb'), category: 'ROOM' },
      { uri: url('1455587734955-081b22074882'), category: 'LOBBY' },
    ],
    [
      { uri: url('1584132967334-10e028bd69f7'), category: 'EXTERIOR' },
      { uri: url('1551882547-ff40c63fe5fa'), category: 'ROOM' },
      { uri: url('1414235077428-338989a2e8c0'), category: 'RESTAURANT' },
    ],
  ],

  // Dubai
  DXB: [
    [
      { uri: url('1582719508461-905c673771fd'), category: 'EXTERIOR' },
      { uri: url('1551882547-ff40c63fe5fa'), category: 'ROOM' },
      { uri: url('1566073771259-6a8506099945'), category: 'POOL' },
    ],
    [
      { uri: url('1520250497591-112f2f40a3f4'), category: 'EXTERIOR' },
      { uri: url('1542314831-068cd1dbfeeb'), category: 'ROOM' },
      { uri: url('1571896349842-33c89424de2d'), category: 'LOBBY' },
    ],
    [
      { uri: url('1564501049412-61c2a3083791'), category: 'EXTERIOR' },
      { uri: url('1578683010236-d716f9a3f461'), category: 'ROOM' },
      { uri: url('1414235077428-338989a2e8c0'), category: 'RESTAURANT' },
    ],
  ],

  // Tokyo
  TYO: [
    [
      { uri: url('1540959733332-eab4deabeeaf'), category: 'EXTERIOR' },
      { uri: url('1551882547-ff40c63fe5fa'), category: 'ROOM' },
      { uri: url('1455587734955-081b22074882'), category: 'LOBBY' },
    ],
    [
      { uri: url('1503899036392-e6eda2f0d9b3'), category: 'EXTERIOR' },
      { uri: url('1542314831-068cd1dbfeeb'), category: 'ROOM' },
      { uri: url('1414235077428-338989a2e8c0'), category: 'RESTAURANT' },
    ],
  ],
};

// Generic fallback pool (used for any city not listed above)
const DEFAULT_POOL: HotelImagePool = [
  [
    { uri: url('1566073771259-6a8506099945'), category: 'EXTERIOR' },
    { uri: url('1551882547-ff40c63fe5fa'), category: 'ROOM' },
    { uri: url('1455587734955-081b22074882'), category: 'LOBBY' },
  ],
  [
    { uri: url('1520250497591-112f2f40a3f4'), category: 'EXTERIOR' },
    { uri: url('1578683010236-d716f9a3f461'), category: 'ROOM' },
    { uri: url('1414235077428-338989a2e8c0'), category: 'RESTAURANT' },
  ],
  [
    { uri: url('1564501049412-61c2a3083791'), category: 'EXTERIOR' },
    { uri: url('1542314831-068cd1dbfeeb'), category: 'ROOM' },
    { uri: url('1571896349842-33c89424de2d'), category: 'LOBBY' },
  ],
  [
    { uri: url('1529290130-4ca3753253ae'), category: 'EXTERIOR' },
    { uri: url('1444201983204-c43d83be0099'), category: 'ROOM' },
    { uri: url('1566073771259-6a8506099945'), category: 'POOL' },
  ],
];

/**
 * Returns a set of images for a hotel based on city and index.
 * Different hotels in the same city get different images.
 */
export function getHotelImages(
  cityCode: string | null,
  hotelIndex: number
): { uri: string; category: string }[] {
  const pool = (cityCode && POOLS[cityCode.toUpperCase()]) || DEFAULT_POOL;
  return pool[hotelIndex % pool.length];
}
