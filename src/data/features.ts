// Katalog över bostadsegenskaper. Samma id:n används i annonser, köparprofiler och matchning.

export interface FeatureCategory {
  id: string
  label: string
  items: { id: string; label: string }[]
}

export const FEATURE_CATEGORIES: FeatureCategory[] = [
  {
    id: 'ute',
    label: 'Uteplats',
    items: [
      { id: 'balkong', label: 'Balkong' },
      { id: 'terrass', label: 'Terrass' },
      { id: 'uteplats', label: 'Uteplats' },
      { id: 'tradgard', label: 'Trädgård' },
      { id: 'ingen-uteplats', label: 'Ingen uteplats' },
    ],
  },
  {
    id: 'bostaden',
    label: 'Bostaden',
    items: [
      { id: 'hiss', label: 'Hiss' },
      { id: 'oppen-planlosning', label: 'Öppen planlösning' },
      { id: 'separat-kok', label: 'Separat kök' },
      { id: 'hornlage', label: 'Hörnläge' },
      { id: 'genomgaende', label: 'Genomgående' },
      { id: 'etage', label: 'Etage' },
      { id: 'hogst-upp', label: 'Högst upp' },
      { id: 'egen-entre', label: 'Egen entré' },
    ],
  },
  {
    id: 'bekvamligheter',
    label: 'Bekvämligheter',
    items: [
      { id: 'diskmaskin', label: 'Diskmaskin' },
      { id: 'tvattmaskin', label: 'Tvättmaskin' },
      { id: 'torktumlare', label: 'Torktumlare' },
      { id: 'badkar', label: 'Badkar' },
      { id: 'gast-wc', label: 'Gäst-WC' },
      { id: 'golvvarme', label: 'Golvvärme' },
      { id: 'eldstad', label: 'Eldstad' },
      { id: 'kakelugn', label: 'Kakelugn' },
      { id: 'ac', label: 'Luftkonditionering' },
    ],
  },
  {
    id: 'forvaring',
    label: 'Förvaring',
    items: [
      { id: 'forrad', label: 'Förråd' },
      { id: 'kladkammare', label: 'Klädkammare' },
      { id: 'vind', label: 'Vind' },
      { id: 'kallare', label: 'Källare' },
    ],
  },
  {
    id: 'bil',
    label: 'Bil',
    items: [
      { id: 'garage', label: 'Garage' },
      { id: 'parkeringsplats', label: 'Parkeringsplats' },
      { id: 'laddplats', label: 'Laddplats' },
      { id: 'boendeparkering', label: 'Boendeparkering' },
    ],
  },
  {
    id: 'kvaliteter',
    label: 'Kvaliteter',
    items: [
      { id: 'renoverat-kok', label: 'Renoverat kök' },
      { id: 'renoverat-badrum', label: 'Renoverat badrum' },
      { id: 'originaldetaljer', label: 'Originaldetaljer' },
      { id: 'sekelskifte', label: 'Sekelskifte' },
      { id: 'nyproduktion', label: 'Nyproduktion' },
      { id: 'sjoutsikt', label: 'Sjöutsikt' },
      { id: 'naturutsikt', label: 'Naturutsikt' },
      { id: 'cityutsikt', label: 'Cityutsikt' },
      { id: 'ljusinslapp', label: 'Mycket ljusinsläpp' },
    ],
  },
]

// Egenskaper som bara kan komma från bilder eller egen text.
const EXTRA_LABELS: Record<string, string> = {
  parkett: 'Parkettgolv',
  dusch: 'Dusch',
}

const LABELS: Record<string, string> = Object.fromEntries(FEATURE_CATEGORIES.flatMap((c) => c.items.map((i) => [i.id, i.label])))

// Okända id:n är egna egenskaper som säljaren skrivit själv – då är id:t själva texten.
export function featureLabel(id: string): string {
  return LABELS[id] ?? EXTRA_LABELS[id] ?? id
}
