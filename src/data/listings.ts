import { IMG } from '../lib/images'

// Mockdata för bostäder till salu. I en riktig version hämtas detta från en backend.
// Strukturen följer datamodellen i specen: typ, pris, avgift, rum, sovrum, boyta,
// våning, hiss, byggår, koordinater, egenskaper, beskrivning, bilder, säljare, visningar, status.

export type PropertyType = 'Bostadsrätt' | 'Villa' | 'Radhus' | 'Fritidshus'
export const PROPERTY_TYPES: PropertyType[] = ['Bostadsrätt', 'Villa', 'Radhus', 'Fritidshus']

export interface Viewing {
  date: string
  start: string
  end: string
  spotsLeft: number
}

export interface Listing {
  id: string
  street: string
  postalCode?: string
  area: string
  city: string
  type: PropertyType
  tenure: 'Bostadsrätt' | 'Äganderätt'
  price: number
  priceType?: 'Utgångspris' | 'Fast pris'
  fee: number // månadsavgift (bostadsrätt) eller driftkostnad (äganderätt)
  rooms: number
  bedrooms: number
  size: number // boyta m²
  plotArea?: number // tomtarea m²
  floor?: string
  elevator: boolean
  built: number
  association?: string
  coordinates: [number, number]
  features: string[] // id:n från data/features.ts eller egna egenskaper
  headline?: string
  description: string
  images: string[]
  imageRotations?: number[] // rotation per bild (grader), om säljaren roterat
  sellerId: string
  daysOnMarket: number
  publishedAt: string
  viewing: Viewing
  status: 'published' | 'sold'
  isNew?: boolean
}

export const RINGVAGEN_ID = 'ringvagen-128'

export const RINGVAGEN_DESCRIPTION =
  'Ljus och välplanerad trea högt upp i huset med generöst ljusinsläpp från två väderstreck. Lägenheten har en genomtänkt planlösning där det rymliga vardagsrummet med fina takhöjder blir en naturlig samlingspunkt.\n\nKöket är renoverat med ljusa luckor och gott om förvaring, och har plats för matbord. Två separata sovrum ligger avskilt mot den lugna gården. Badrummet är helkaklat med dusch och tvättmaskin.\n\nBalkongen vetter mot gården. Huset har hiss.'

const daysAgo = (d: number) => new Date(Date.now() - d * 86400000).toISOString()

type Raw = Omit<Listing, 'publishedAt' | 'status' | 'tenure' | 'sellerId'> & { sellerId?: string }

const RAW: Raw[] = [
  {
    id: RINGVAGEN_ID, street: 'Ringvägen 128', postalCode: '118 61', area: 'Södermalm', city: 'Stockholm', type: 'Bostadsrätt',
    price: 4495000, priceType: 'Utgångspris', fee: 4250, rooms: 3, bedrooms: 2, size: 76, floor: '4 av 5', elevator: true, built: 1929,
    association: 'Bostadsrättsföreningen Solgläntan', coordinates: [59.3086, 18.0712],
    features: ['balkong', 'hiss', 'oppen-planlosning', 'diskmaskin', 'tvattmaskin', 'dusch', 'renoverat-kok', 'ljusinslapp', 'forrad', 'parkett'],
    headline: 'Ljus trea med balkong och social planlösning', description: RINGVAGEN_DESCRIPTION,
    images: [IMG.livingBright, IMG.kitchen, IMG.livingScandi, IMG.bedroom, IMG.apartment, IMG.bedroom2, IMG.bathroom, IMG.interior],
    daysOnMarket: 3, viewing: { date: '2026-10-04', start: '13:00', end: '14:00', spotsLeft: 12 }, isNew: true,
  },
  {
    id: 'hagerstensvagen-112', street: 'Hägerstensvägen 112', postalCode: '126 49', area: 'Aspudden', city: 'Stockholm', type: 'Bostadsrätt',
    price: 4195000, priceType: 'Utgångspris', fee: 4600, rooms: 3, bedrooms: 2, size: 72, floor: '2 av 4', elevator: true, built: 1947,
    association: 'BRF Aspen 4', coordinates: [59.3067, 18.0017],
    features: ['balkong', 'hiss', 'genomgaende', 'separat-kok', 'tvattmaskin', 'dusch', 'forrad'],
    headline: 'Genomgående trea med balkong i väster', description: 'Trivsam och ljus trea med fönster åt två håll, balkong i västerläge och ett praktiskt kök med matplats. Huset har hiss och föreningen har nyligen renoverat tvättstugan.',
    images: [IMG.livingScandi, IMG.apartment2, IMG.kitchen, IMG.bedroom], daysOnMarket: 1,
    viewing: { date: '2026-10-05', start: '17:30', end: '18:15', spotsLeft: 9 }, isNew: true,
  },
  {
    id: 'hovdingagatan-20', street: 'Hövdingagatan 20', postalCode: '126 52', area: 'Aspudden', city: 'Stockholm', type: 'Bostadsrätt',
    price: 4650000, priceType: 'Utgångspris', fee: 3950, rooms: 3, bedrooms: 2, size: 70, floor: '5 av 6', elevator: true, built: 2021,
    association: 'BRF Hövdingen', coordinates: [59.3051, 18.0046],
    features: ['balkong', 'hiss', 'oppen-planlosning', 'nyproduktion', 'diskmaskin', 'tvattmaskin', 'torktumlare', 'golvvarme', 'ljusinslapp', 'dusch'],
    headline: 'Nyproducerad trea högt upp med västerbalkong', description: 'Nyproducerad trea med öppen planlösning mellan kök och vardagsrum, stora fönsterpartier och balkong i väster. Badrummet har golvvärme och tvättpelare.',
    images: [IMG.livingModern, IMG.kitchen2, IMG.bedroom2, IMG.bathroom], daysOnMarket: 2,
    viewing: { date: '2026-10-04', start: '11:00', end: '11:45', spotsLeft: 14 }, isNew: true,
  },
  {
    id: 'tellusborgsvagen-45', street: 'Tellusborgsvägen 45', postalCode: '126 32', area: 'Midsommarkransen', city: 'Stockholm', type: 'Bostadsrätt',
    price: 3950000, priceType: 'Utgångspris', fee: 4100, rooms: 3, bedrooms: 2, size: 71, floor: '3 av 5', elevator: true, built: 2020,
    association: 'BRF Kransen Park', coordinates: [59.3012, 18.0118],
    features: ['balkong', 'hiss', 'oppen-planlosning', 'nyproduktion', 'diskmaskin', 'tvattmaskin', 'dusch', 'laddplats'],
    headline: 'Modern trea med balkong i nyare hus', description: 'Modern trea i hus från 2020 med öppen planlösning, två sovrum och balkong. Föreningen har laddplatser i garaget.',
    images: [IMG.livingOpen, IMG.kitchen2, IMG.bedroom, IMG.bathroom], daysOnMarket: 6,
    viewing: { date: '2026-10-05', start: '13:00', end: '13:45', spotsLeft: 10 },
  },
  {
    id: 'svandammsvagen-18', street: 'Svandammsvägen 18', postalCode: '126 35', area: 'Midsommarkransen', city: 'Stockholm', type: 'Bostadsrätt',
    price: 5350000, priceType: 'Utgångspris', fee: 5400, rooms: 4, bedrooms: 3, size: 88, floor: '2 av 3', elevator: true, built: 1939,
    association: 'BRF Svandammen', coordinates: [59.3038, 18.0087],
    features: ['balkong', 'hiss', 'separat-kok', 'originaldetaljer', 'badkar', 'tvattmaskin', 'parkeringsplats', 'forrad'],
    headline: 'Fyra rum med originaldetaljer och parkering', description: 'Rymlig fyra i funkishus med bevarade detaljer, tre sovrum och balkong mot gården. Badrum med badkar. Parkeringsplats på gården ingår i föreningens kö.',
    images: [IMG.livingWarm, IMG.kitchen, IMG.bedroom2, IMG.bathroom], daysOnMarket: 9,
    viewing: { date: '2026-10-06', start: '18:00', end: '18:45', spotsLeft: 8 },
  },
  {
    id: 'katarina-bangata-61', street: 'Katarina Bangata 61', postalCode: '116 39', area: 'Södermalm', city: 'Stockholm', type: 'Bostadsrätt',
    price: 5650000, priceType: 'Utgångspris', fee: 3800, rooms: 3, bedrooms: 2, size: 69, floor: '4 av 6', elevator: true, built: 1911,
    association: 'BRF Katarina 12', coordinates: [59.3131, 18.0823],
    features: ['balkong', 'hiss', 'sekelskifte', 'originaldetaljer', 'kakelugn', 'separat-kok', 'dusch', 'ljusinslapp'],
    headline: 'Sekelskiftestrea med kakelugn och balkong', description: 'Charmig trea i sekelskifteshus med kakelugn, höga takhöjder och balkong. Separat kök med matplats.',
    images: [IMG.livingSofa, IMG.kitchen2, IMG.bedroom, IMG.bathroom], daysOnMarket: 12,
    viewing: { date: '2026-10-04', start: '15:00', end: '15:45', spotsLeft: 11 },
  },
  {
    id: 'hornsgatan-154', street: 'Hornsgatan 154', postalCode: '117 28', area: 'Södermalm', city: 'Stockholm', type: 'Bostadsrätt',
    price: 5950000, priceType: 'Utgångspris', fee: 5900, rooms: 4, bedrooms: 3, size: 94, floor: '5 av 6', elevator: true, built: 1931,
    association: 'BRF Hornstull', coordinates: [59.3161, 18.0333],
    features: ['balkong', 'hiss', 'hornlage', 'genomgaende', 'badkar', 'diskmaskin', 'tvattmaskin', 'cityutsikt'],
    headline: 'Fyra i hörnläge med balkong och utsikt', description: 'Fyra i hörnläge med fönster åt tre håll, balkong och utsikt över staden. Badrum med badkar och tvättmaskin.',
    images: [IMG.livingModern, IMG.kitchen, IMG.bedroom2, IMG.bathroom], daysOnMarket: 15,
    viewing: { date: '2026-10-05', start: '12:00', end: '12:45', spotsLeft: 7 },
  },
  {
    id: 'skanegatan-88', street: 'Skånegatan 88', postalCode: '116 37', area: 'Södermalm', city: 'Stockholm', type: 'Bostadsrätt',
    price: 3650000, priceType: 'Utgångspris', fee: 2900, rooms: 2, bedrooms: 1, size: 52, floor: '1 av 5', elevator: false, built: 1928,
    association: 'BRF Nytorget', coordinates: [59.3128, 18.0842],
    features: ['originaldetaljer', 'separat-kok', 'dusch'],
    headline: 'Tvåa vid Nytorget', description: 'Välplanerad tvåa med originaldetaljer ett stenkast från Nytorget. Separat kök och sovrum mot gården.',
    images: [IMG.livingWarm, IMG.kitchen2, IMG.bedroom], daysOnMarket: 5,
    viewing: { date: '2026-10-04', start: '12:00', end: '12:30', spotsLeft: 15 },
  },
  {
    id: 'rorstrandsgatan-34', street: 'Rörstrandsgatan 34', postalCode: '113 40', area: 'Vasastan', city: 'Stockholm', type: 'Bostadsrätt',
    price: 5295000, priceType: 'Utgångspris', fee: 3450, rooms: 2, bedrooms: 1, size: 57, floor: '3 av 6', elevator: true, built: 1911,
    association: 'BRF Rörstrand 7', coordinates: [59.3421, 18.0336],
    features: ['hiss', 'kakelugn', 'sekelskifte', 'originaldetaljer', 'separat-kok'],
    headline: 'Sekelskiftestvåa med kakelugn', description: 'Charmig tvåa i klassiskt sekelskifteshus. Högt i tak, fiskbensparkett och kakelugn i vardagsrummet.',
    images: [IMG.livingWarm, IMG.kitchen2, IMG.bedroom2, IMG.bathroom], daysOnMarket: 5,
    viewing: { date: '2026-10-04', start: '11:00', end: '11:45', spotsLeft: 6 },
  },
  {
    id: 'kungsholms-strand-167', street: 'Kungsholms strand 167', postalCode: '112 48', area: 'Kungsholmen', city: 'Stockholm', type: 'Bostadsrätt',
    price: 2950000, priceType: 'Utgångspris', fee: 2180, rooms: 1, bedrooms: 0, size: 38, floor: '5 av 7', elevator: true, built: 1934,
    association: 'BRF Strandkanten', coordinates: [59.3373, 18.0296],
    features: ['hiss', 'sjoutsikt', 'renoverat-badrum'],
    headline: 'Etta med vattenutsikt', description: 'Smart planerad etta med vattenutsikt över Karlbergskanalen. Sovalkov och badrum renoverat 2020.',
    images: [IMG.livingSofa, IMG.kitchen2, IMG.bathroom], daysOnMarket: 7,
    viewing: { date: '2026-10-04', start: '15:00', end: '15:30', spotsLeft: 14 },
  },
  {
    id: 'lugnets-alle-52', street: 'Lugnets allé 52', postalCode: '120 66', area: 'Hammarby Sjöstad', city: 'Stockholm', type: 'Bostadsrätt',
    price: 6850000, priceType: 'Utgångspris', fee: 6120, rooms: 4, bedrooms: 3, size: 98, floor: '6 av 8', elevator: true, built: 2004,
    association: 'BRF Sjöstadsporten', coordinates: [59.3029, 18.1025],
    features: ['balkong', 'hiss', 'oppen-planlosning', 'sjoutsikt', 'garage', 'diskmaskin', 'tvattmaskin', 'badkar'],
    headline: 'Rymlig fyra med inglasad balkong och sjöutsikt', description: 'Rymlig fyra med inglasad balkong och kvällssol över Hammarby sjö. Tre sovrum och två badrum.',
    images: [IMG.livingModern, IMG.kitchenHouse, IMG.bedroom, IMG.bathroom], daysOnMarket: 2,
    viewing: { date: '2026-10-06', start: '18:00', end: '18:45', spotsLeft: 10 },
  },
  {
    id: 'hammarbyvagen-32', street: 'Hammarbyvägen 32', postalCode: '121 46', area: 'Hammarbyhöjden', city: 'Stockholm', type: 'Bostadsrätt',
    price: 3595000, priceType: 'Utgångspris', fee: 4300, rooms: 3, bedrooms: 2, size: 68, floor: '3 av 3', elevator: false, built: 1943,
    association: 'BRF Höjden 9', coordinates: [59.2951, 18.1024],
    features: ['balkong', 'hogst-upp', 'naturutsikt', 'separat-kok', 'dusch'],
    headline: 'Trea högst upp med utsikt över grönska', description: 'Trea högst upp i huset med balkong och utsikt över grönområdet. Skogen och Nackareservatet ligger nära.',
    images: [IMG.livingScandi, IMG.kitchen, IMG.bedroom2], daysOnMarket: 4,
    viewing: { date: '2026-10-05', start: '11:00', end: '11:45', spotsLeft: 12 },
  },
  {
    id: 'signalgatan-7', street: 'Signalgatan 7', postalCode: '169 72', area: 'Solna', city: 'Solna', type: 'Bostadsrätt',
    price: 3890000, priceType: 'Utgångspris', fee: 3350, rooms: 2, bedrooms: 1, size: 58, floor: '7 av 12', elevator: true, built: 2022,
    association: 'BRF Signalen', coordinates: [59.3601, 18.0006],
    features: ['balkong', 'hiss', 'nyproduktion', 'oppen-planlosning', 'cityutsikt', 'golvvarme', 'laddplats'],
    headline: 'Nyproducerad tvåa med utsikt', description: 'Nyproducerad tvåa högt upp med balkong och utsikt. Öppen planlösning och golvvärme i badrummet.',
    images: [IMG.livingOpen, IMG.kitchen2, IMG.bathroom], daysOnMarket: 8,
    viewing: { date: '2026-10-04', start: '14:00', end: '14:45', spotsLeft: 13 },
  },
  {
    id: 'sockenvagen-211', street: 'Sockenvägen 211', postalCode: '122 63', area: 'Enskede', city: 'Stockholm', type: 'Villa',
    price: 9950000, priceType: 'Utgångspris', fee: 4200, rooms: 5, bedrooms: 4, size: 142, plotArea: 612, elevator: false, built: 1938,
    coordinates: [59.2775, 18.0691],
    features: ['tradgard', 'uteplats', 'garage', 'kallare', 'eldstad', 'badkar', 'tvattmaskin'],
    headline: 'Trettiotalsvilla med lummig trädgård', description: 'Välbevarad 30-talsvilla på lummig tomt. Stora sällskapsytor, fyra sovrum och en trädgård med altan i söderläge.',
    images: [IMG.villa, IMG.houseLiving, IMG.houseKitchen, IMG.bedroom2], daysOnMarket: 4,
    viewing: { date: '2026-10-04', start: '14:00', end: '15:00', spotsLeft: 8 },
  },
  {
    id: 'tallkrogsvagen-18', street: 'Tallkrogsvägen 18', postalCode: '122 60', area: 'Tallkrogen', city: 'Stockholm', type: 'Radhus',
    price: 7250000, priceType: 'Utgångspris', fee: 3100, rooms: 4, bedrooms: 3, size: 110, plotArea: 240, elevator: false, built: 1936,
    coordinates: [59.2713, 18.0856],
    features: ['tradgard', 'uteplats', 'forrad', 'parkeringsplats', 'tvattmaskin'],
    headline: 'Funkisradhus med trädgård', description: 'Funkisradhus med ljusa rum i tre plan, trädgård med uteplats och förråd.',
    images: [IMG.houseExterior, IMG.houseInterior, IMG.kitchenHouse, IMG.bedroom], daysOnMarket: 6,
    viewing: { date: '2026-10-05', start: '12:00', end: '13:00', spotsLeft: 11 },
  },
  {
    id: 'nockebyvagen-40', street: 'Nockebyvägen 40', postalCode: '167 71', area: 'Bromma', city: 'Stockholm', type: 'Villa',
    price: 12900000, priceType: 'Utgångspris', fee: 5200, rooms: 6, bedrooms: 4, size: 168, plotArea: 820, elevator: false, built: 1928,
    coordinates: [59.3294, 17.9291],
    features: ['tradgard', 'terrass', 'garage', 'laddplats', 'eldstad', 'badkar', 'gast-wc', 'originaldetaljer'],
    headline: 'Stor villa med terrass och garage', description: 'Rymlig villa från 1928 med originaldetaljer, terrass mot trädgården och garage med laddplats.',
    images: [IMG.villa3, IMG.houseLiving, IMG.houseKitchen, IMG.bedroom], daysOnMarket: 10,
    viewing: { date: '2026-10-06', start: '17:00', end: '18:00', spotsLeft: 6 },
  },
  {
    id: 'sjovagen-3', street: 'Sjövägen 3', postalCode: '139 90', area: 'Värmdö', city: 'Värmdö', type: 'Fritidshus',
    price: 3450000, priceType: 'Utgångspris', fee: 1900, rooms: 3, bedrooms: 2, size: 64, plotArea: 1450, elevator: false, built: 1968,
    coordinates: [59.2891, 18.5503],
    features: ['tradgard', 'terrass', 'sjoutsikt', 'naturutsikt', 'eldstad'],
    headline: 'Fritidshus med sjöutsikt', description: 'Fritidshus på naturtomt med sjöutsikt, stor terrass och braskamin.',
    images: [IMG.villa2, IMG.houseInterior, IMG.kitchenHouse], daysOnMarket: 11,
    viewing: { date: '2026-10-04', start: '12:00', end: '13:00', spotsLeft: 9 },
  },
  {
    id: 'linnegatan-41', street: 'Linnégatan 41', postalCode: '413 04', area: 'Linnéstaden', city: 'Göteborg', type: 'Bostadsrätt',
    price: 3995000, priceType: 'Utgångspris', fee: 3900, rooms: 2, bedrooms: 1, size: 61, floor: '3 av 4', elevator: false, built: 1898,
    association: 'BRF Linnéträdet', coordinates: [57.6967, 11.9523],
    features: ['sekelskifte', 'originaldetaljer', 'separat-kok'],
    headline: 'Karaktärsfull tvåa i landshövdingehus', description: 'Karaktärsfull tvåa i landshövdingehus med burspråk och sovrum mot tyst gård.',
    images: [IMG.livingOpen, IMG.kitchen, IMG.bedroom2], daysOnMarket: 3,
    viewing: { date: '2026-10-04', start: '12:00', end: '12:45', spotsLeft: 7 },
  },
  {
    id: 'luthagsesplanaden-22', street: 'Luthagsesplanaden 22', postalCode: '753 10', area: 'Luthagen', city: 'Uppsala', type: 'Bostadsrätt',
    price: 3450000, priceType: 'Utgångspris', fee: 4450, rooms: 3, bedrooms: 2, size: 74, floor: '2 av 4', elevator: true, built: 1952,
    association: 'BRF Esplanaden', coordinates: [59.8625, 17.6263],
    features: ['balkong', 'hiss', 'separat-kok', 'tvattmaskin'],
    headline: 'Välplanerad trea med balkong', description: 'Välplanerad trea i lugna Luthagen med balkong mot trädgården och rymligt kök.',
    images: [IMG.apartment2, IMG.kitchen2, IMG.bedroom, IMG.bathroom], daysOnMarket: 8,
    viewing: { date: '2026-10-05', start: '13:00', end: '13:45', spotsLeft: 13 },
  },
]

export const LISTINGS: Listing[] = RAW.map((r) => ({
  ...r,
  tenure: r.type === 'Bostadsrätt' ? 'Bostadsrätt' : 'Äganderätt',
  sellerId: r.sellerId ?? `seller-${r.id}`,
  publishedAt: daysAgo(r.daysOnMarket),
  status: 'published',
}))

// Bostadstyp → vilken sorts dokument som behövs (bostadsrätt eller fastighet).
export function kindForType(t: PropertyType): 'brf' | 'villa' {
  return t === 'Bostadsrätt' ? 'brf' : 'villa'
}
