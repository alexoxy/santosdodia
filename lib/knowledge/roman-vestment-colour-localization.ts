import type { LiturgicalToolLocale } from './liturgical-calendar-localization';
import type { RomanVestmentColourCode, RomanVestmentColourResolution } from './roman-vestment-colours';

export type RomanVestmentColourGuideEntry = {
  code: RomanVestmentColourCode;
  label: string;
  usage: string;
};

const colourLabels: Record<LiturgicalToolLocale, Record<RomanVestmentColourCode, string>> = {
  pt: { white: 'Branco', red: 'Vermelho', green: 'Verde', violet: 'Roxo', black: 'Preto', rose: 'Rosa' },
  en: { white: 'White', red: 'Red', green: 'Green', violet: 'Violet', black: 'Black', rose: 'Rose' },
  es: { white: 'Blanco', red: 'Rojo', green: 'Verde', violet: 'Morado', black: 'Negro', rose: 'Rosa' },
  it: { white: 'Bianco', red: 'Rosso', green: 'Verde', violet: 'Viola', black: 'Nero', rose: 'Rosaceo' }
};

const colourUsage: Record<LiturgicalToolLocale, Record<RomanVestmentColourCode, string>> = {
  pt: {
    white: 'Tempo Pascal e Tempo do Natal; celebrações do Senhor fora da Paixão, da Virgem Maria, dos Anjos e dos Santos não mártires, com as demais indicações próprias da IGMR.',
    red: 'Domingo de Ramos, Sexta-Feira Santa, Pentecostes, celebrações da Paixão do Senhor, Apóstolos, Evangelistas e Mártires.',
    green: 'Ofícios e Missas do Tempo Comum.',
    violet: 'Advento e Quaresma; pode também usar-se nos Ofícios e Missas de defuntos.',
    black: 'Pode usar-se, onde for costume, nas Missas de defuntos.',
    rose: 'Pode usar-se, onde for costume, no III Domingo do Advento (Gaudete) e no IV Domingo da Quaresma (Laetare).'
  },
  en: {
    white: 'Easter and Christmas seasons; celebrations of the Lord other than the Passion, the Blessed Virgin Mary, Angels and non-martyr Saints, with the other proper indications of the GIRM.',
    red: 'Palm Sunday, Good Friday, Pentecost, celebrations of the Lord’s Passion, Apostles, Evangelists and Martyrs.',
    green: 'Offices and Masses of Ordinary Time.',
    violet: 'Advent and Lent; it may also be used in Offices and Masses for the Dead.',
    black: 'May be used, where customary, in Masses for the Dead.',
    rose: 'May be used, where customary, on the Third Sunday of Advent (Gaudete) and Fourth Sunday of Lent (Laetare).'
  },
  es: {
    white: 'Tiempo Pascual y de Navidad; celebraciones del Señor fuera de la Pasión, de la Virgen María, de los Ángeles y de los Santos no mártires, con las demás indicaciones propias de la IGMR.',
    red: 'Domingo de Ramos, Viernes Santo, Pentecostés, celebraciones de la Pasión del Señor, Apóstoles, Evangelistas y Mártires.',
    green: 'Oficios y Misas del Tiempo Ordinario.',
    violet: 'Adviento y Cuaresma; puede usarse también en Oficios y Misas de difuntos.',
    black: 'Puede usarse, donde sea costumbre, en las Misas de difuntos.',
    rose: 'Puede usarse, donde sea costumbre, en el III Domingo de Adviento (Gaudete) y IV Domingo de Cuaresma (Laetare).'
  },
  it: {
    white: 'Tempo di Pasqua e di Natale; celebrazioni del Signore fuori della Passione, della Vergine Maria, degli Angeli e dei Santi non martiri, con le altre indicazioni proprie dell’OGMR.',
    red: 'Domenica delle Palme, Venerdì Santo, Pentecoste, celebrazioni della Passione del Signore, Apostoli, Evangelisti e Martiri.',
    green: 'Uffici e Messe del Tempo Ordinario.',
    violet: 'Avvento e Quaresima; può essere usato anche negli Uffici e nelle Messe per i defunti.',
    black: 'Può essere usato, dove è consuetudine, nelle Messe per i defunti.',
    rose: 'Può essere usato, dove è consuetudine, nella III Domenica di Avvento (Gaudete) e IV Domenica di Quaresima (Laetare).'
  }
};

const interfaceCopy: Record<LiturgicalToolLocale, {
  title: string;
  defaultLabel: string;
  resolvedLabel: string;
  alternativesLabel: string;
  pendingOccurrence: string;
  optionalChoice: string;
  holySaturday: string;
  festiveVestments: string;
  authorityNote: string;
}> = {
  pt: {
    title: 'Cores dos paramentos',
    defaultLabel: 'Cor por defeito',
    resolvedLabel: 'Cor resolvida',
    alternativesLabel: 'Alternativas permitidas',
    pendingOccurrence: 'A cor final depende ainda da celebração que vencer a precedência neste dia.',
    optionalChoice: 'A norma admite mais do que uma opção; não existe uma única cor obrigatória.',
    holySaturday: 'No Sábado Santo não se celebra Missa antes da Vigília Pascal; na Vigília usa-se branco.',
    festiveVestments: 'Nos dias mais solenes podem usar-se paramentos festivos ou mais nobres, mesmo que não sejam da cor do dia.',
    authorityNote: 'Regra católica romana baseada na Instrução Geral do Missal Romano, nn. 345-346, na edição do Secretariado Nacional de Liturgia.'
  },
  en: {
    title: 'Vestment colours',
    defaultLabel: 'Default colour',
    resolvedLabel: 'Resolved colour',
    alternativesLabel: 'Permitted alternatives',
    pendingOccurrence: 'The final colour still depends on which celebration wins precedence on this date.',
    optionalChoice: 'The norm permits more than one option; there is no single mandatory colour.',
    holySaturday: 'On Holy Saturday Mass is not celebrated before the Easter Vigil; white is used at the Vigil.',
    festiveVestments: 'On more solemn days festive or more noble vestments may be used even if they are not the colour of the day.',
    authorityNote: 'Roman Catholic rule based on the General Instruction of the Roman Missal, nos. 345-346.'
  },
  es: {
    title: 'Colores de los ornamentos',
    defaultLabel: 'Color por defecto',
    resolvedLabel: 'Color resuelto',
    alternativesLabel: 'Alternativas permitidas',
    pendingOccurrence: 'El color final depende todavía de la celebración que prevalezca por precedencia en esta fecha.',
    optionalChoice: 'La norma permite más de una opción; no existe un único color obligatorio.',
    holySaturday: 'El Sábado Santo no se celebra Misa antes de la Vigilia Pascual; en la Vigilia se usa blanco.',
    festiveVestments: 'En los días más solemnes pueden usarse ornamentos festivos o más nobles aunque no sean del color del día.',
    authorityNote: 'Regla católica romana basada en la Instrucción General del Misal Romano, nn. 345-346.'
  },
  it: {
    title: 'Colori dei paramenti',
    defaultLabel: 'Colore predefinito',
    resolvedLabel: 'Colore risolto',
    alternativesLabel: 'Alternative consentite',
    pendingOccurrence: 'Il colore finale dipende ancora dalla celebrazione che prevale secondo la precedenza in questa data.',
    optionalChoice: 'La norma consente più di un’opzione; non esiste un unico colore obbligatorio.',
    holySaturday: 'Il Sabato Santo non si celebra la Messa prima della Veglia Pasquale; nella Veglia si usa il bianco.',
    festiveVestments: 'Nei giorni più solenni possono essere usati paramenti festivi o più nobili anche se non sono del colore del giorno.',
    authorityNote: 'Regola cattolica romana basata sull’Ordinamento Generale del Messale Romano, nn. 345-346.'
  }
};

export function localizeRomanVestmentColour(locale: LiturgicalToolLocale, code: RomanVestmentColourCode): string {
  return colourLabels[locale][code];
}

export function romanVestmentColourGuide(locale: LiturgicalToolLocale): RomanVestmentColourGuideEntry[] {
  return (['white', 'red', 'green', 'violet', 'black', 'rose'] as RomanVestmentColourCode[]).map(code => ({
    code,
    label: colourLabels[locale][code],
    usage: colourUsage[locale][code]
  }));
}

export function romanVestmentColourCopy(locale: LiturgicalToolLocale) {
  return interfaceCopy[locale];
}

export function localizeRomanVestmentColourResolution(locale: LiturgicalToolLocale, resolution: RomanVestmentColourResolution) {
  const copy = interfaceCopy[locale];
  return {
    defaultColourLabel: resolution.defaultColour ? colourLabels[locale][resolution.defaultColour] : null,
    resolvedColourLabel: resolution.resolvedColour ? colourLabels[locale][resolution.resolvedColour] : null,
    permittedAlternativeColourLabels: resolution.permittedAlternativeColours.map(code => colourLabels[locale][code]),
    note: resolution.specialCase === 'holy-saturday-no-mass-before-easter-vigil'
      ? copy.holySaturday
      : resolution.resolutionScope === 'optional-colour'
        ? copy.optionalChoice
        : resolution.finalOccurrenceResolutionRequired
          ? copy.pendingOccurrence
          : null
  };
}
