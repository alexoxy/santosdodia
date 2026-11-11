import type { Locale } from './i18n';

type VaticanLiveCopy = {
  eyebrow: string;
  title: string;
  intro: string;
  otherLives: string;
};

const COPY: Record<Locale, VaticanLiveCopy> = {
  en: {
    eyebrow: 'Vatican News · official stream',
    title: 'Vatican live',
    intro: 'Follow official papal celebrations, audiences and Vatican News broadcasts. When nothing is live, the official channel remains available.',
    otherLives: 'See other Christian live streams',
  },
  es: {
    eyebrow: 'Vatican News · emisión oficial',
    title: 'Vaticano en directo',
    intro: 'Siga celebraciones papales, audiencias y emisiones oficiales de Vatican News. Cuando no haya un evento en directo, el canal oficial seguirá disponible.',
    otherLives: 'Ver otros directos cristianos',
  },
  pt: {
    eyebrow: 'Vatican News · transmissão oficial',
    title: 'Vaticano em direto',
    intro: 'Acompanhe celebrações papais, audiências e transmissões oficiais do Vatican News. Quando não houver um evento em direto, o canal oficial permanece disponível.',
    otherLives: 'Ver outros diretos cristãos',
  },
  fr: {
    eyebrow: 'Vatican News · diffusion officielle',
    title: 'Vatican en direct',
    intro: 'Suivez les célébrations papales, les audiences et les diffusions officielles de Vatican News. Lorsqu’aucun événement n’est en direct, la chaîne officielle reste disponible.',
    otherLives: 'Voir les autres directs chrétiens',
  },
  fil: {
    eyebrow: 'Vatican News · opisyal na live',
    title: 'Vatican live',
    intro: 'Subaybayan ang mga opisyal na pagdiriwang ng Santo Papa, mga audience at broadcast ng Vatican News. Kapag walang kasalukuyang live, nananatiling available ang opisyal na channel.',
    otherLives: 'Tingnan ang iba pang Christian live',
  },
  ru: {
    eyebrow: 'Vatican News · официальная трансляция',
    title: 'Ватикан в прямом эфире',
    intro: 'Смотрите официальные папские богослужения, аудиенции и трансляции Vatican News. Когда прямого эфира нет, официальный канал остаётся доступен.',
    otherLives: 'Другие христианские трансляции',
  },
  sw: {
    eyebrow: 'Vatican News · matangazo rasmi',
    title: 'Vatican mubashara',
    intro: 'Fuatilia maadhimisho ya Papa, mikutano na matangazo rasmi ya Vatican News. Wakati hakuna tukio la mubashara, chaneli rasmi hubaki inapatikana.',
    otherLives: 'Tazama matangazo mengine ya Kikristo',
  },
  de: {
    eyebrow: 'Vatican News · offizieller Livestream',
    title: 'Vatikan live',
    intro: 'Verfolgen Sie päpstliche Feiern, Audienzen und offizielle Übertragungen von Vatican News. Wenn gerade nichts live ist, bleibt der offizielle Kanal verfügbar.',
    otherLives: 'Weitere christliche Livestreams',
  },
  it: {
    eyebrow: 'Vatican News · diretta ufficiale',
    title: 'Vaticano in diretta',
    intro: 'Segui le celebrazioni papali, le udienze e le trasmissioni ufficiali di Vatican News. Quando non c’è un evento in diretta, il canale ufficiale resta disponibile.',
    otherLives: 'Vedi altre dirette cristiane',
  },
  pl: {
    eyebrow: 'Vatican News · oficjalna transmisja',
    title: 'Watykan na żywo',
    intro: 'Oglądaj oficjalne celebracje papieskie, audiencje i transmisje Vatican News. Gdy nie ma transmisji na żywo, oficjalny kanał pozostaje dostępny.',
    otherLives: 'Zobacz inne transmisje chrześcijańskie',
  },
};

export function getVaticanLiveCopy(locale: Locale): VaticanLiveCopy {
  return COPY[locale] ?? COPY.en;
}
