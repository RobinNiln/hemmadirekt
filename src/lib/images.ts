// Exempelbilder från Unsplash (fria att använda).
// Om en bild inte går att ladda visar <Photo> en snygg reservyta i stället.
// Byt gärna till egna bilder: lägg dem i mappen public/ och skriv t.ex. './bilder/kok.jpg'.

const u = (id: string, w = 1200) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&q=75`

export const IMG = {
  heroHome: u('photo-1600585154340-be6161a56a0c', 1800),
  livingBright: u('photo-1502672260266-1c1ef2d93688'),
  livingScandi: u('photo-1586023492125-27b2c045efd7'),
  livingWarm: u('photo-1493809842364-78817add7ffb'),
  livingModern: u('photo-1618221195710-dd6b41faaea6'),
  livingSofa: u('photo-1583847268964-b28dc8f51f92'),
  livingOpen: u('photo-1560185893-a55cbc8c57e8'),
  apartment: u('photo-1522708323590-d24dbb6b0267'),
  apartment2: u('photo-1560448204-e02f11c3d0e2'),
  interior: u('photo-1513694203232-719a280e022c'),
  kitchen: u('photo-1484154218962-a197022b5858'),
  kitchen2: u('photo-1556912173-3bb406ef7e77'),
  kitchenHouse: u('photo-1600566753190-17f0baa2a6c3'),
  bedroom: u('photo-1505691938895-1758d7feb511'),
  bedroom2: u('photo-1540518614846-7eded433c457'),
  bathroom: u('photo-1584622650111-993a426fbf0a'),
  houseLiving: u('photo-1600210492486-724fe5c67fb0'),
  houseInterior: u('photo-1600607687939-ce8a6c25118c'),
  houseKitchen: u('photo-1600121848594-d8644e57abab'),
  villa: u('photo-1564013799919-ab600027ffc6'),
  villa2: u('photo-1570129477492-45c003edd2be'),
  villa3: u('photo-1512917774080-9991f1c4c750'),
  houseExterior: u('photo-1600047509807-ba8f99d2cdde'),
}

// Åtta exempelbilder som "laddas upp" i säljarflödet.
export const EXAMPLE_UPLOADS = [
  { id: 'p1', url: IMG.livingBright, label: 'Vardagsrum' },
  { id: 'p2', url: IMG.kitchen, label: 'Kök' },
  { id: 'p3', url: IMG.livingScandi, label: 'Vardagsrum, detalj' },
  { id: 'p4', url: IMG.bedroom, label: 'Sovrum' },
  { id: 'p5', url: IMG.apartment, label: 'Matplats' },
  { id: 'p6', url: IMG.bedroom2, label: 'Sovrum 2' },
  { id: 'p7', url: IMG.bathroom, label: 'Badrum' },
  { id: 'p8', url: IMG.interior, label: 'Hall' },
]
