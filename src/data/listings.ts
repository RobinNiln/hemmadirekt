import { IMG } from '../lib/images'

// Mockdata för bostäder till salu. I en riktig version hämtas detta från en backend.

export type PropertyType = 'Lägenhet' | 'Radhus' | 'Villa'

export interface Listing {
  id: string
  street: string
  area: string
  city: string
  type: PropertyType
  tenure: 'Bostadsrätt' | 'Äganderätt'
  rooms: number
  size: number
  floor?: string
  price: number
  fee: number // månadsavgift (bostadsrätt) eller driftkostnad (äganderätt)
  built: number
  association?: string
  images: string[]
  description: string
  highlights: string[]
  viewing: { date: string; start: string; end: string; spotsLeft: number }
  daysOnMarket: number
  isNew?: boolean
}

export const RINGVAGEN_ID = 'ringvagen-128'

export const RINGVAGEN_DESCRIPTION =
  'Ljus och välplanerad trea högt upp i huset med generöst ljusinsläpp från två väderstreck. Lägenheten har en genomtänkt planlösning där det rymliga vardagsrummet med fina takhöjder och bevarade detaljer från 1920-talet skapar en naturlig samlingspunkt.\n\nKöket är renoverat 2021 med ljusa luckor, stenbänkskiva och gott om förvaring, och har plats för matbord för sex personer. Två separata sovrum ligger avskilt mot den lugna gården. Badrummet är helkaklat med dusch, handdukstork och tvättmaskin.\n\nFöreningen är välskött och ekonomiskt stabil, med stambyte genomfört 2018. Här bor du mitt på Södermalm med Tantolunden, Skanstull och Ringens kommunikationer bara några minuter bort.'

export const LISTINGS: Listing[] = [
  {
    id: RINGVAGEN_ID,
    street: 'Ringvägen 128',
    area: 'Södermalm',
    city: 'Stockholm',
    type: 'Lägenhet',
    tenure: 'Bostadsrätt',
    rooms: 3,
    size: 76,
    floor: '4 av 5',
    price: 4495000,
    fee: 4250,
    built: 1929,
    association: 'Bostadsrättsföreningen Solgläntan',
    images: [IMG.livingBright, IMG.kitchen, IMG.livingScandi, IMG.bedroom, IMG.apartment, IMG.bedroom2, IMG.bathroom, IMG.interior],
    description: RINGVAGEN_DESCRIPTION,
    highlights: ['Hiss', 'Balkong mot gård', 'Renoverat kök 2021', 'Stambyte 2018'],
    viewing: { date: '2026-10-04', start: '13:00', end: '14:00', spotsLeft: 12 },
    daysOnMarket: 3,
    isNew: true,
  },
  {
    id: 'rorstrandsgatan-34',
    street: 'Rörstrandsgatan 34',
    area: 'Vasastan',
    city: 'Stockholm',
    type: 'Lägenhet',
    tenure: 'Bostadsrätt',
    rooms: 2,
    size: 57,
    floor: '3 av 6',
    price: 5295000,
    fee: 3450,
    built: 1911,
    association: 'BRF Rörstrand 7',
    images: [IMG.livingWarm, IMG.kitchen2, IMG.bedroom2, IMG.bathroom],
    description:
      'Charmig tvåa i klassiskt sekelskifteshus på en av Vasastans mest omtyckta gator. Högt i tak, fiskbensparkett och kakelugn i vardagsrummet. Köket har plats för matbord och fönster mot den grönskande gården.\n\nFöreningen är stabil med låg belåning. Caféer, restauranger och Karlbergssjön finns runt hörnet.',
    highlights: ['Kakelugn', 'Fiskbensparkett', 'Lugnt läge mot gård'],
    viewing: { date: '2026-10-04', start: '11:00', end: '11:45', spotsLeft: 6 },
    daysOnMarket: 5,
  },
  {
    id: 'hagerstensvagen-112',
    street: 'Hägerstensvägen 112',
    area: 'Aspudden',
    city: 'Stockholm',
    type: 'Lägenhet',
    tenure: 'Bostadsrätt',
    rooms: 3,
    size: 72,
    floor: '2 av 3',
    price: 4195000,
    fee: 4600,
    built: 1947,
    association: 'BRF Aspen 4',
    images: [IMG.livingScandi, IMG.apartment2, IMG.kitchen, IMG.bedroom],
    description:
      'Trivsam och ljus trea i populära Aspudden med närhet till både tunnelbana och natur. Genomgående planlösning med fönster åt två håll, balkong i västerläge och ett praktiskt kök med matplats.\n\nFöreningen har nyligen renoverat fasaden och tvättstugan. Aspuddsbadet och Vinterviken nås på några minuter.',
    highlights: ['Balkong i väster', 'Nära tunnelbana', 'Fönster åt två håll'],
    viewing: { date: '2026-10-05', start: '17:30', end: '18:15', spotsLeft: 9 },
    daysOnMarket: 1,
    isNew: true,
  },
  {
    id: 'kungsholms-strand-167',
    street: 'Kungsholms strand 167',
    area: 'Kungsholmen',
    city: 'Stockholm',
    type: 'Lägenhet',
    tenure: 'Bostadsrätt',
    rooms: 1,
    size: 38,
    floor: '5 av 7',
    price: 2950000,
    fee: 2180,
    built: 1934,
    association: 'BRF Strandkanten',
    images: [IMG.livingSofa, IMG.kitchen2, IMG.bathroom],
    description:
      'Smart planerad etta med vattenutsikt över Karlbergskanalen. Sovalkov, fräscht kök och badrum renoverat 2020. Perfekt första bostad eller pied-à-terre i city.',
    highlights: ['Vattenutsikt', 'Sovalkov', 'Hiss'],
    viewing: { date: '2026-10-04', start: '15:00', end: '15:30', spotsLeft: 14 },
    daysOnMarket: 7,
  },
  {
    id: 'lugnets-alle-52',
    street: 'Lugnets allé 52',
    area: 'Hammarby Sjöstad',
    city: 'Stockholm',
    type: 'Lägenhet',
    tenure: 'Bostadsrätt',
    rooms: 4,
    size: 98,
    floor: '6 av 8',
    price: 6850000,
    fee: 6120,
    built: 2004,
    association: 'BRF Sjöstadsporten',
    images: [IMG.livingModern, IMG.kitchenHouse, IMG.bedroom, IMG.bathroom],
    description:
      'Rymlig fyra med stor inglasad balkong och kvällssol över Hammarby sjö. Öppen planlösning mellan kök och vardagsrum, tre sovrum och två badrum. Garageplats finns att hyra i huset.',
    highlights: ['Inglasad balkong', 'Två badrum', 'Garage i huset'],
    viewing: { date: '2026-10-06', start: '18:00', end: '18:45', spotsLeft: 10 },
    daysOnMarket: 2,
  },
  {
    id: 'sockenvagen-211',
    street: 'Sockenvägen 211',
    area: 'Enskede',
    city: 'Stockholm',
    type: 'Villa',
    tenure: 'Äganderätt',
    rooms: 5,
    size: 142,
    price: 9950000,
    fee: 4200,
    built: 1938,
    images: [IMG.villa, IMG.houseLiving, IMG.houseKitchen, IMG.bedroom2],
    description:
      'Välbevarad 30-talsvilla på lummig tomt i Enskede. Stora sällskapsytor, fyra sovrum och en trädgård med äppelträd och altan i söderläge. Huset har nytt tak och bergvärme.',
    highlights: ['Tomt 612 m²', 'Bergvärme', 'Altan i söder'],
    viewing: { date: '2026-10-04', start: '14:00', end: '15:00', spotsLeft: 8 },
    daysOnMarket: 4,
  },
  {
    id: 'tallkrogsvagen-18',
    street: 'Tallkrogsvägen 18',
    area: 'Tallkrogen',
    city: 'Stockholm',
    type: 'Radhus',
    tenure: 'Äganderätt',
    rooms: 4,
    size: 110,
    price: 7250000,
    fee: 3100,
    built: 1936,
    images: [IMG.houseExterior, IMG.houseInterior, IMG.kitchenHouse, IMG.bedroom],
    description:
      'Funkisradhus i barnvänliga Tallkrogen. Ljusa rum i tre plan, trädgård med uteplats och förråd. Skolor, förskolor och tunnelbana finns på gångavstånd.',
    highlights: ['Trädgård', 'Tre plan', 'Nära skolor'],
    viewing: { date: '2026-10-05', start: '12:00', end: '13:00', spotsLeft: 11 },
    daysOnMarket: 6,
  },
  {
    id: 'linnegatan-41',
    street: 'Linnégatan 41',
    area: 'Linnéstaden',
    city: 'Göteborg',
    type: 'Lägenhet',
    tenure: 'Bostadsrätt',
    rooms: 2,
    size: 61,
    floor: '3 av 4',
    price: 3995000,
    fee: 3900,
    built: 1898,
    association: 'BRF Linnéträdet',
    images: [IMG.livingOpen, IMG.kitchen, IMG.bedroom2],
    description:
      'Karaktärsfull tvåa i landshövdingehus med välbevarade detaljer. Stort vardagsrum med burspråk, separat kök och sovrum mot tyst gård. Mitt i Linnéstadens liv med Slottsskogen runt hörnet.',
    highlights: ['Burspråk', 'Slottsskogen nära', 'Sekelskiftesdetaljer'],
    viewing: { date: '2026-10-04', start: '12:00', end: '12:45', spotsLeft: 7 },
    daysOnMarket: 3,
  },
  {
    id: 'luthagsesplanaden-22',
    street: 'Luthagsesplanaden 22',
    area: 'Luthagen',
    city: 'Uppsala',
    type: 'Lägenhet',
    tenure: 'Bostadsrätt',
    rooms: 3,
    size: 74,
    floor: '2 av 4',
    price: 3450000,
    fee: 4450,
    built: 1952,
    association: 'BRF Esplanaden',
    images: [IMG.apartment2, IMG.kitchen2, IMG.bedroom, IMG.bathroom],
    description:
      'Välplanerad trea i lugna Luthagen med gångavstånd till centrum och universitetet. Balkong mot trädgården, rymligt kök och två sovrum. Föreningen har egen bastu och cykelrum.',
    highlights: ['Balkong', 'Bastu i föreningen', 'Gångavstånd till centrum'],
    viewing: { date: '2026-10-05', start: '13:00', end: '13:45', spotsLeft: 13 },
    daysOnMarket: 8,
  },
]
