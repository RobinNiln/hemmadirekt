import type { Bid, SaleState } from '../state/types'
import { formatDateShort } from './format'

// ---------------------------------------------------------------------------
// Dokumentregistret: räknar ut VILKA dokument som behövs och VAR de står,
// utifrån bostadstyp och hur långt affären har kommit.
// Allt här är demo – inga verkliga juridiska dokument skapas.
// ---------------------------------------------------------------------------

export type DocId =
  | 'agare' | 'objekt' | 'energi' | 'forening' | 'besiktning'
  | 'fastighetsbeteckning' | 'fastighetsinfo' | 'servitut' | 'pantbrev' | 'inteckningar' | 'taxering' | 'fragelista'
  | 'budhistorik' | 'kopare' | 'finansiering'
  | 'avtal' | 'bilagor' | 'besiktningsvillkor' | 'medlem'
  | 'handpenning' | 'likvid'
  | 'kopebrev' | 'slutbetalning' | 'nycklar' | 'lagfart'

export type Phase = 'fore' | 'bud' | 'avtal' | 'betalning' | 'tilltrade'

export const PHASES: { id: Phase; label: string; text: string }[] = [
  { id: 'fore', label: 'Före försäljning', text: 'Uppgifter om dig och bostaden som köpare behöver se.' },
  { id: 'bud', label: 'Budgivning och köpare', text: 'Vem som lagt bud och vem som blir köpare.' },
  { id: 'avtal', label: 'Avtal', text: 'Avtalet och det som hör till det.' },
  { id: 'betalning', label: 'Betalning', text: 'Handpenning och slutlig uträkning.' },
  { id: 'tilltrade', label: 'Tillträde', text: 'Dagen då köparen betalar och får nycklarna.' },
]

// ✓ Klar · ● Pågår · ○ Inte påbörjad · ⚠ Kräver åtgärd · ⏳ Väntar på annan part · – Ej aktuellt
export type StatusKind = 'done' | 'progress' | 'todo' | 'action' | 'waiting' | 'na'

export interface DocStatus {
  kind: StatusKind
  label: string
}

export type Responsible = 'Säljare' | 'Köpare' | 'Säljare + köpare' | 'Bostadsrättsföreningen' | 'Vi hämtar automatiskt'

export interface DocItem {
  id: DocId
  name: string
  phase: Phase
  short: string // en rad på kortet
  what: string // Vad är detta?
  when: string // När behövs det?
  responsible: Responsible
  optional?: boolean
  status: DocStatus
}

const S = {
  done: (label = 'Klar'): DocStatus => ({ kind: 'done', label }),
  progress: (label = 'Pågår'): DocStatus => ({ kind: 'progress', label }),
  todo: (label = 'Inte påbörjad'): DocStatus => ({ kind: 'todo', label }),
  action: (label = 'Kräver åtgärd'): DocStatus => ({ kind: 'action', label }),
  waiting: (label = 'Väntar på annan part'): DocStatus => ({ kind: 'waiting', label }),
  na: (label = 'Ej aktuellt'): DocStatus => ({ kind: 'na', label }),
}

export function daysUntil(iso: string): number {
  if (!iso) return 0
  return Math.ceil((new Date(iso + 'T12:00:00').getTime() - Date.now()) / 86400000)
}

export function contractName(s: SaleState) {
  return s.property.kind === 'brf' ? 'Överlåtelseavtal' : 'Köpekontrakt'
}

export function isSignedContract(s: SaleState) {
  return s.contract.signedBySeller && s.contract.signedByBuyer
}

export function buyerHasFinancing(s: SaleState, bid: Bid | null) {
  if (!bid) return false
  if (s.docs.financingRegistered || bid.bidderId === 'direct-buyer') return true
  return !!s.interested.find((i) => i.id === bid.bidderId)?.loanPromise
}

export function buildDocs(s: SaleState, bid: Bid | null): DocItem[] {
  const brf = s.property.kind === 'brf'
  const accepted = !!bid
  const signed = isSignedContract(s)
  const c = s.contract
  const d = s.docs
  const cl = s.closing
  const auto = S.done('Klar · hämtad automatiskt')
  const list: DocItem[] = []
  const add = (x: DocItem) => list.push(x)

  // ---------------- Före försäljning ----------------
  add({
    id: 'agare', name: 'Ägaruppgifter', phase: 'fore', responsible: 'Säljare',
    short: 'Vem som äger bostaden och hur stor andel.',
    what: 'Uppgifter om dig som säljer: namn, personnummer och hur stor del av bostaden du äger. Äger ni bostaden tillsammans måste alla ägare vara med.',
    when: 'Direkt när försäljningen startar.',
    status: S.done('Klar · verifierad med BankID'),
  })
  add({
    id: 'objekt', name: 'Objektsinformation', phase: 'fore', responsible: 'Säljare',
    short: 'Fakta om bostaden som visas för köpare.',
    what: 'En sammanställning av fakta om bostaden – adress, storlek, rum, avgift och förening. Det är den köpare läser innan de bestämmer sig.',
    when: 'Innan annonsen publiceras.',
    status: s.published || s.mode === 'direct' ? S.done() : S.progress('Pågår · blir klar vid publicering'),
  })
  if (!brf) {
    add({
      id: 'fastighetsbeteckning', name: 'Fastighetsbeteckning', phase: 'fore', responsible: 'Vi hämtar automatiskt',
      short: 'Fastighetens unika "namn" i fastighetsregistret.',
      what: 'Varje fastighet i Sverige har en beteckning, till exempel "Haninge Exempelby 3:45". Den används i köpekontraktet för att det ska vara tydligt exakt vilken fastighet som säljs.',
      when: 'Innan köpekontraktet skrivs.',
      status: auto,
    })
  }
  add({
    id: 'energi', name: 'Energideklaration', phase: 'fore', responsible: brf ? 'Bostadsrättsföreningen' : 'Säljare',
    short: brf ? 'Husets energiförbrukning, från föreningen.' : 'Husets energiförbrukning och energiklass.',
    what: brf
      ? 'En deklaration av hur mycket energi huset gör av med. För bostadsrätter är det föreningen som ansvarar för den – vi hämtar den åt dig.'
      : 'En deklaration av hur mycket energi huset gör av med. Säljaren av ett småhus ansvarar för att en giltig energideklaration finns.',
    when: 'Innan bostaden marknadsförs.',
    status: auto,
  })
  if (brf) {
    add({
      id: 'forening', name: 'Föreningsinformation', phase: 'fore', responsible: 'Säljare',
      short: 'Uppgifter om bostadsrättsföreningen.',
      what: 'Föreningens namn, organisationsnummer, avgift och kontaktuppgifter. Köpare vill veta att föreningen är stabil, och uppgifterna används i avtalet och medlemsansökan.',
      when: 'Innan annonsen publiceras.',
      status: d.associationVerified ? S.done() : S.action('Kontrollera uppgifter'),
    })
  } else {
    add({ id: 'fastighetsinfo', name: 'Fastighetsinformation', phase: 'fore', responsible: 'Vi hämtar automatiskt', short: 'Tomtareal, byggnader och ägarhistorik.', what: 'Uppgifter från fastighetsregistret om tomtens storlek, byggnader och tidigare ägare.', when: 'Innan annonsen publiceras.', status: auto })
    add({ id: 'servitut', name: 'Servitut', phase: 'fore', responsible: 'Vi hämtar automatiskt', short: 'Rättigheter som följer med fastigheten.', what: 'Ett servitut är en rätt för någon annan att använda en del av fastigheten, till exempel en väg eller en ledning. Köparen behöver veta om sådant finns.', when: 'Innan köpekontraktet skrivs.', status: auto })
    add({ id: 'pantbrev', name: 'Pantbrev', phase: 'fore', responsible: 'Vi hämtar automatiskt', short: 'Säkerhet för lån på fastigheten.', what: 'Pantbrev visar hur mycket fastigheten har belånats. De följer med vid försäljningen och påverkar köparens kostnad för nya pantbrev.', when: 'Innan köpekontraktet skrivs.', status: auto })
    add({ id: 'inteckningar', name: 'Inteckningar', phase: 'fore', responsible: 'Vi hämtar automatiskt', short: 'Registrerade inteckningar i fastigheten.', what: 'En sammanställning av inteckningar som finns registrerade. Används tillsammans med pantbreven.', when: 'Innan köpekontraktet skrivs.', status: auto })
    add({ id: 'taxering', name: 'Taxeringsinformation', phase: 'fore', responsible: 'Vi hämtar automatiskt', short: 'Taxeringsvärde och typkod.', what: 'Fastighetens taxeringsvärde, som bland annat styr fastighetsavgiften och kostnaden för lagfart.', when: 'Innan annonsen publiceras.', status: auto })
    add({
      id: 'fragelista', name: 'Säljarens frågelista', phase: 'fore', responsible: 'Säljare',
      short: 'Det du vet om husets skick.',
      what: 'Ett frågeformulär där du berättar vad du känner till om huset – till exempel fuktskador, renoveringar och avlopp. Det skyddar både dig och köparen.',
      when: 'Innan visning.',
      status: d.questionnaireDone ? S.done() : S.action('Kräver åtgärd'),
    })
  }
  add({
    id: 'besiktning', name: 'Besiktningsprotokoll', phase: 'fore', responsible: brf ? 'Säljare' : 'Köpare', optional: true,
    short: brf ? 'Valfritt – protokoll från en besiktning.' : 'Rekommenderas – resultat från besiktningen.',
    what: brf
      ? 'Ett protokoll från en besiktning av lägenheten. Det är ovanligt för bostadsrätter men kan ge köpare extra trygghet.'
      : 'Resultatet av en besiktning av huset. Köparen har undersökningsplikt och brukar anlita en besiktningsman. Har du en säljarbesiktning kan du ladda upp den här.',
    when: brf ? 'Frivilligt, när som helst före avtalet.' : 'Före köpekontraktet, eller enligt ett besiktningsvillkor.',
    status: d.inspectionFile ? S.done('Uppladdad') : S.todo(brf ? 'Valfritt' : 'Rekommenderas'),
  })

  // ---------------- Budgivning och köpare ----------------
  if (s.mode === 'sell') {
    add({
      id: 'budhistorik', name: 'Budhistorik', phase: 'bud', responsible: 'Vi hämtar automatiskt',
      short: 'Alla bud, i den ordning de kom in.',
      what: 'Budhistoriken skapas automatiskt från registrerade bud. Den visar belopp, budgivare och tid för varje bud.',
      when: 'Under budgivningen – sparas för hela affären.',
      status: s.bids.length ? S.done() : S.todo('Skapas när första budet kommer'),
    })
  }
  add({
    id: 'kopare', name: 'Köparuppgifter', phase: 'bud', responsible: 'Köpare',
    short: 'Vem som köper bostaden.',
    what: 'Köparens namn och personnummer, verifierat med BankID. Används i avtalet.',
    when: 'När du valt köpare.',
    status: accepted ? S.done('Klar · identitet verifierad') : S.todo('När du valt köpare'),
  })
  add({
    id: 'finansiering', name: 'Finansieringsuppgifter', phase: 'bud', responsible: 'Köpare',
    short: 'Att köparen har pengar till köpet.',
    what: 'Uppgift om att köparen har ett lånelöfte eller på annat sätt kan betala. Det minskar risken att affären går om intet.',
    when: 'Innan avtalet skrivs.',
    status: !accepted ? S.todo('När du valt köpare') : buyerHasFinancing(s, bid) ? S.done('Klar · lånelöfte registrerat') : S.waiting('Väntar på köparens lånelöfte'),
  })

  // ---------------- Avtal ----------------
  const cName = contractName(s)
  add({
    id: 'avtal', name: cName, phase: 'avtal', responsible: 'Säljare + köpare',
    short: brf ? 'Det viktigaste dokumentet i affären.' : 'Avtalet om köpet av fastigheten.',
    what: brf
      ? 'Avtalet där du överlåter bostadsrätten till köparen. Här står pris, handpenning, tillträdesdag och villkor. Vi guidar dig genom det steg för steg.'
      : 'Avtalet om köpet av fastigheten. Här står pris, handpenning, tillträdesdag, villkor och vad som ingår. Vi guidar dig genom det steg för steg.',
    when: 'Efter att du valt köpare.',
    status: signed
      ? S.done('Klart · signerat')
      : c.approved
        ? S.waiting('Väntar på signering')
        : c.draftCreated
          ? S.progress('Utkast skapat')
          : accepted && c.step > 1
            ? S.progress(`Pågår · steg ${c.step} av 8`)
            : accepted
              ? S.todo('Inte påbörjad')
              : S.todo('Efter att du valt köpare'),
  })
  add({
    id: 'bilagor', name: 'Bilagor', phase: 'avtal', responsible: 'Säljare',
    short: 'Vad som ingår och övriga underlag.',
    what: 'Bilagor till avtalet, till exempel listan över vad som ingår i köpet och objektsinformationen.',
    when: 'Tillsammans med avtalet.',
    status: signed ? S.done() : c.draftCreated ? S.progress('Skapas med avtalet') : S.todo('Skapas med avtalet'),
  })
  if (!brf) {
    const on = c.conditions.inspection
    add({
      id: 'besiktningsvillkor', name: 'Besiktningsvillkor', phase: 'avtal', responsible: 'Säljare + köpare', optional: !on,
      short: 'Köparen får besiktiga efter kontraktet.',
      what: 'Ett villkor i köpekontraktet som ger köparen rätt att besiktiga huset efter att kontraktet skrivits, och häva köpet om allvarliga fel upptäcks.',
      when: 'Väljs i köpekontraktet.',
      status: !accepted ? S.todo('Väljs i avtalet') : on ? (signed ? S.done('Klar · ingår i kontraktet') : S.progress('Valt i avtalet')) : S.na('Ej valt i avtalet'),
    })
  }
  if (brf) {
    const m = d.membership
    add({
      id: 'medlem', name: 'Medlemsansökan BRF', phase: 'avtal', responsible: 'Köpare',
      short: 'Köparen ansöker om medlemskap i föreningen.',
      what: 'Köparen behöver normalt godkännas som medlem i bostadsrättsföreningen. Ansökan skickas till styrelsen, som fattar beslut.',
      when: 'Efter att avtalet signerats.',
      status: m.approved ? S.done('Klar · godkänd av föreningen') : m.sent ? S.waiting('Väntar på föreningen') : m.created ? S.action('Skicka till föreningen') : signed ? S.action('Kräver åtgärd') : S.todo('Efter att avtalet signerats'),
    })
  }

  // ---------------- Betalning ----------------
  const dep = d.deposit
  const depDays = daysUntil(dep.dueDate)
  add({
    id: 'handpenning', name: 'Handpenning', phase: 'betalning', responsible: 'Köpare',
    short: 'Första delen av betalningen, oftast 10 %.',
    what: 'Handpenningen är normalt en del av köpeskillingen och betalas före tillträdet. Vi skapar ett underlag med belopp och förfallodatum.',
    when: 'Strax efter att avtalet signerats.',
    status: dep.registered
      ? S.done('Klar · registrerad')
      : dep.created
        ? S.waiting('Väntar på köparens betalning')
        : signed
          ? S.action(depDays > 0 ? `Förfallodatum om ${depDays} ${depDays === 1 ? 'dag' : 'dagar'}` : 'Förfaller idag')
          : S.todo('Efter att avtalet signerats'),
  })
  add({
    id: 'likvid', name: 'Likvidavräkning', phase: 'betalning', responsible: 'Säljare',
    short: 'Uträkning av vad som är kvar att betala.',
    what: 'En uträkning av vad köparen ska betala på tillträdesdagen: köpeskillingen minus handpenningen, plus eller minus eventuella justeringar.',
    when: 'Inför tillträdet.',
    status: d.settlement.created ? S.done() : signed ? S.todo('Inte påbörjad · görs inför tillträdet') : S.todo('Inför tillträdet'),
  })

  // ---------------- Tillträde ----------------
  if (!brf) {
    add({
      id: 'kopebrev', name: 'Köpebrev', phase: 'tilltrade', responsible: 'Säljare + köpare',
      short: 'Bekräftelse på att köpet är fullföljt.',
      what: 'Bekräftar att köpeskillingen har betalats och att köpet fullföljts. Köpebrevet behövs när köparen söker lagfart.',
      when: 'På tillträdesdagen.',
      status: d.deedPrepared ? S.done() : cl.finalPayment ? S.action('Förbered köpebrev') : S.todo('Skapas på tillträdesdagen'),
    })
  }
  add({
    id: 'slutbetalning', name: 'Slutbetalning', phase: 'tilltrade', responsible: 'Köpare',
    short: 'Resten av köpeskillingen betalas.',
    what: 'På tillträdesdagen betalar köparen det som står kvar enligt likvidavräkningen.',
    when: `På tillträdesdagen${c.accessDate ? ` (${formatDateShort(c.accessDate)})` : ''}.`,
    status: cl.finalPayment ? S.done('Klar · mottagen') : S.todo('På tillträdesdagen'),
  })
  add({
    id: 'nycklar', name: 'Nyckelöverlämning', phase: 'tilltrade', responsible: 'Säljare',
    short: 'Köparen får nycklarna.',
    what: 'När slutbetalningen är mottagen lämnar du över alla nycklar, taggar och koder till köparen.',
    when: 'På tillträdesdagen.',
    status: cl.keysHandedOver ? S.done('Klar · överlämnade') : S.todo('På tillträdesdagen'),
  })
  if (!brf) {
    add({
      id: 'lagfart', name: 'Lagfartsunderlag', phase: 'tilltrade', responsible: 'Köpare',
      short: 'Köparen ansöker om lagfart.',
      what: 'Lagfart är beviset på vem som äger en fastighet. Köparen ansöker om det efter tillträdet, med köpekontrakt och köpebrev som underlag.',
      when: 'Efter tillträdet.',
      status: d.titlePrepared ? S.done('Klar · underlag förberett') : cl.completed ? S.action('Förbered lagfartsunderlag') : S.todo('Efter tillträdet'),
    })
  }
  return list
}

// Räknas i "X av Y dokument klara": obligatoriska dokument som är aktuella.
export function countsTowardTotal(doc: DocItem) {
  return !doc.optional && doc.status.kind !== 'na'
}

// ---------------------------------------------------------------------------
// Nästa steg-motorn: svarar alltid på frågan "vad behöver jag göra nu?"
// ---------------------------------------------------------------------------
export interface NextStep {
  title: string
  text: string
  cta: string
  to: string
}

const DOCS = '/min-forsaljning/dokument'

export function nextStep(s: SaleState, bid: Bid | null, highest: Bid | null): NextStep {
  const brf = s.property.kind === 'brf'
  const signed = isSignedContract(s)
  const c = s.contract
  const d = s.docs
  const cName = contractName(s).toLowerCase()

  if (s.mode === 'sell' && !s.published) return { title: 'Slutför din annons', text: 'Din annons är inte publicerad än. Fortsätt där du slutade.', cta: 'Fortsätt', to: '/salj/start' }
  if (brf && !d.associationVerified) return { title: 'Kontrollera föreningsinformationen', text: 'Vi har hämtat uppgifterna om föreningen. Titta igenom dem så att de stämmer innan de hamnar i avtalet.', cta: 'Kontrollera uppgifter', to: `${DOCS}?doc=forening` }
  if (!brf && !d.questionnaireDone) return { title: 'Fyll i säljarens frågelista', text: 'Berätta vad du vet om husets skick. Det tar ungefär fem minuter och skyddar både dig och köparen.', cta: 'Starta', to: `${DOCS}?doc=fragelista` }

  if (!bid) {
    if (s.bids.length && highest) return { title: `Du har ${s.bids.length} bud`, text: `Högsta budet är ${highest.amount.toLocaleString('sv-SE')} kr från ${highest.bidderName}. När du valt köpare skapar vi ${cName}et.`, cta: 'Till budgivningen', to: '/min-forsaljning/budgivning' }
    if (s.marketSimulated) return { title: 'Visningen är genomförd', text: 'Du har fått intressenter. Bud brukar komma in inom några dagar efter visningen.', cta: 'Se intressenter', to: '/min-forsaljning/intressenter' }
    return { title: 'Din annons är ute – nu väntar vi på visningen', text: 'Dokumenten inför försäljningen är klara. Köpare kan nu hitta bostaden och boka plats på visningen.', cta: 'Visa annonsen', to: '/bostad/ringvagen-128' }
  }

  if (!buyerHasFinancing(s, bid)) return { title: 'Köparen behöver visa finansiering', text: `${bid.bidderName} har inte registrerat något lånelöfte än. Du kan påbörja avtalet ändå, men vänta med att signera tills det är klart.`, cta: 'Se finansiering', to: `${DOCS}?doc=finansiering` }
  if (!c.draftCreated) return { title: 'Bra! Budet är accepterat.', text: `Nästa steg är att skapa ${cName}et. Det tar cirka fem minuter.`, cta: c.step > 1 ? 'Fortsätt' : 'Starta', to: '/min-forsaljning/avtal' }
  if (!signed) return { title: c.approved ? 'Dags att signera' : 'Granska avtalsutkastet', text: c.approved ? 'Avtalet är godkänt. Nu signerar du och köparen digitalt.' : 'Utkastet är klart. Läs igenom det och godkänn det för signering.', cta: 'Fortsätt', to: '/min-forsaljning/avtal' }

  if (brf && !d.membership.created) return { title: 'Avtalet är klart.', text: 'Nästa steg är att skicka medlemsansökan till bostadsrättsföreningen.', cta: 'Fortsätt', to: `${DOCS}?doc=medlem` }
  if (brf && !d.membership.sent) return { title: 'Skicka medlemsansökan', text: 'Ansökan är skapad. Skicka den till föreningen så att styrelsen kan fatta beslut.', cta: 'Skicka till föreningen', to: `${DOCS}?doc=medlem` }
  if (!d.deposit.created) return { title: 'Skapa handpenningsunderlaget', text: 'Köparen ska betala handpenningen snart. Vi skapar underlaget med belopp och förfallodatum.', cta: 'Skapa underlag', to: `${DOCS}?doc=handpenning` }
  if (!d.settlement.created) return { title: 'Förbered likvidavräkningen', text: 'Inför tillträdet räknar vi ut vad köparen har kvar att betala.', cta: 'Skapa likvidavräkning', to: `${DOCS}?doc=likvid` }
  if (brf && !d.membership.approved) return { title: 'Väntar på föreningen', text: 'Medlemsansökan är skickad. Du får en notis när styrelsen har fattat beslut.', cta: 'Se status', to: `${DOCS}?doc=medlem` }
  if (!s.closing.completed) {
    if (!brf && s.closing.finalPayment && !d.deedPrepared) return { title: 'Förbered köpebrevet', text: 'Slutbetalningen är mottagen. Nu bekräftar ni köpet med ett köpebrev.', cta: 'Förbered köpebrev', to: `${DOCS}?doc=kopebrev` }
    return { title: 'Förbered tillträdet', text: `Allt är klart inför tillträdet ${formatDateShort(c.accessDate)}. På dagen bockar du av slutbetalning och nycklar.`, cta: 'Till tillträdet', to: '/min-forsaljning/tilltrade' }
  }
  if (!brf && !d.deedPrepared) return { title: 'Förbered köpebrevet', text: 'Köpebrevet behövs för att köparen ska kunna söka lagfart.', cta: 'Förbered köpebrev', to: `${DOCS}?doc=kopebrev` }
  if (!brf && !d.titlePrepared) return { title: 'Köparen ansöker om lagfart', text: 'Sista steget: underlaget till köparens lagfartsansökan.', cta: 'Förbered lagfartsunderlag', to: `${DOCS}?doc=lagfart` }
  return { title: 'Affären är genomförd', text: 'Alla dokument är klara och sparade. Grattis!', cta: 'Se dokumenten', to: DOCS }
}
