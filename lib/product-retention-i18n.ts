import type { Locale } from './i18n';

type RetentionCopy = {
  pray: string;
  prayHint: string;
  saved: string;
  savedHint: string;
  calendarHint: string;
  discoverHint: string;
  saveSaint: string;
  savedSaint: string;
  removeSaved: string;
  saveHint: string;
  savedTitle: string;
  savedEmpty: string;
  savedEmptyHint: string;
  remove: string;
  discoverSaints: string;
  prayerEyebrow: string;
  prayerTitle: string;
  prayerIntro: string;
  readings: string;
  readingsBody: string;
  novenas: string;
  novenasBody: string;
  saintsPrayer: string;
  saintsPrayerBody: string;
  viewLiturgy: string;
};

const COPY: Record<Locale, RetentionCopy> = {
  en: {
    pray:'Pray',prayHint:'Readings, prayers and novenas',saved:'Saved',savedHint:'Return to saints you follow',calendarHint:'Browse days and add calendars',discoverHint:'Find by name, patronage and theme',
    saveSaint:'Save saint',savedSaint:'Saved',removeSaved:'Remove from saved',saveHint:'Save this saint for quick access on this device.',savedTitle:'Your saved saints',savedEmpty:'You have not saved any saints yet.',savedEmptyHint:'Open a profile and tap “Save saint”. Saves stay on this device without requiring an account.',remove:'Remove',discoverSaints:'Discover saints',
    prayerEyebrow:'Pray',prayerTitle:'Pray with the Christian calendar',prayerIntro:'Prayers, novenas and readings linked to celebrations, shown only when the source and reuse rights have been validated.',readings:'Daily readings',readingsBody:'Bible references are tied to the official liturgical authority for your tradition and jurisdiction. When text cannot be republished, we link to the authoritative source.',novenas:'Novenas',novenasBody:'Follow novenas connected to upcoming feasts and continue each day. Dates are checked against authoritative liturgical calendars.',saintsPrayer:'Pray with a saint',saintsPrayerBody:'Saint pages can gather traditional or approved prayers while identifying tradition, source and rights.',viewLiturgy:'View liturgy'
  },
  pt: {
    pray:'Rezar',prayHint:'Leituras, orações e novenas',saved:'Guardados',savedHint:'Regresse aos santos que acompanha',calendarHint:'Explore dias e adicione calendários',discoverHint:'Procure por nome, patronato e tema',
    saveSaint:'Guardar santo',savedSaint:'Guardado',removeSaved:'Remover dos guardados',saveHint:'Guarde para regressar rapidamente a este santo neste dispositivo.',savedTitle:'Os seus santos guardados',savedEmpty:'Ainda não guardou nenhum santo.',savedEmptyHint:'Abra um perfil e toque em “Guardar santo”. Os guardados ficam neste dispositivo, sem necessidade de criar conta.',remove:'Remover',discoverSaints:'Descobrir santos',
    prayerEyebrow:'Rezar',prayerTitle:'Rezar com o calendário cristão',prayerIntro:'Orações, novenas e leituras ligadas às celebrações, apresentadas apenas quando a fonte e os direitos de utilização estão validados.',readings:'Leituras do dia',readingsBody:'As referências bíblicas são ligadas à autoridade litúrgica da sua tradição e jurisdição. Quando não pudermos reproduzir o texto, abrimos a fonte oficial.',novenas:'Novenas',novenasBody:'Acompanhe novenas associadas a festas futuras e retome cada dia do percurso. As datas são confirmadas pelo calendário litúrgico oficial.',saintsPrayer:'Rezar com um santo',saintsPrayerBody:'As páginas dos santos podem reunir orações tradicionais ou aprovadas, sempre identificando tradição, fonte e direitos.',viewLiturgy:'Ver liturgia'
  },
  es: {
    pray:'Rezar',prayHint:'Lecturas, oraciones y novenas',saved:'Guardados',savedHint:'Vuelve a los santos que sigues',calendarHint:'Explora días y añade calendarios',discoverHint:'Busca por nombre, patronazgo y tema',
    saveSaint:'Guardar santo',savedSaint:'Guardado',removeSaved:'Quitar de guardados',saveHint:'Guarda este santo para volver rápidamente desde este dispositivo.',savedTitle:'Tus santos guardados',savedEmpty:'Todavía no has guardado ningún santo.',savedEmptyHint:'Abre un perfil y pulsa “Guardar santo”. Los guardados permanecen en este dispositivo sin necesidad de crear una cuenta.',remove:'Quitar',discoverSaints:'Descubrir santos',
    prayerEyebrow:'Rezar',prayerTitle:'Rezar con el calendario cristiano',prayerIntro:'Oraciones, novenas y lecturas vinculadas a las celebraciones, mostradas solo cuando la fuente y los derechos de uso han sido validados.',readings:'Lecturas del día',readingsBody:'Las referencias bíblicas se vinculan a la autoridad litúrgica oficial de tu tradición y jurisdicción. Cuando no podamos reproducir el texto, enlazamos la fuente oficial.',novenas:'Novenas',novenasBody:'Sigue novenas relacionadas con próximas fiestas y continúa cada día. Las fechas se comprueban con calendarios litúrgicos autorizados.',saintsPrayer:'Rezar con un santo',saintsPrayerBody:'Las páginas de los santos pueden reunir oraciones tradicionales o aprobadas, identificando tradición, fuente y derechos.',viewLiturgy:'Ver liturgia'
  },
  fr: {
    pray:'Prier',prayHint:'Lectures, prières et neuvaines',saved:'Enregistrés',savedHint:'Retrouvez les saints que vous suivez',calendarHint:'Parcourez les jours et ajoutez des calendriers',discoverHint:'Cherchez par nom, patronage et thème',
    saveSaint:'Enregistrer',savedSaint:'Enregistré',removeSaved:'Retirer des enregistrés',saveHint:'Enregistrez ce saint pour le retrouver rapidement sur cet appareil.',savedTitle:'Vos saints enregistrés',savedEmpty:'Vous n’avez encore enregistré aucun saint.',savedEmptyHint:'Ouvrez un profil et touchez « Enregistrer ». Les éléments restent sur cet appareil sans compte.',remove:'Retirer',discoverSaints:'Découvrir des saints',
    prayerEyebrow:'Prier',prayerTitle:'Prier avec le calendrier chrétien',prayerIntro:'Prières, neuvaines et lectures liées aux célébrations, affichées uniquement lorsque la source et les droits d’utilisation sont validés.',readings:'Lectures du jour',readingsBody:'Les références bibliques sont liées à l’autorité liturgique officielle de votre tradition et juridiction. Si le texte ne peut pas être reproduit, nous renvoyons vers la source officielle.',novenas:'Neuvaines',novenasBody:'Suivez les neuvaines liées aux fêtes à venir et reprenez chaque jour. Les dates sont vérifiées auprès des calendriers liturgiques officiels.',saintsPrayer:'Prier avec un saint',saintsPrayerBody:'Les pages des saints peuvent réunir des prières traditionnelles ou approuvées en indiquant tradition, source et droits.',viewLiturgy:'Voir la liturgie'
  },
  it: {
    pray:'Pregare',prayHint:'Letture, preghiere e novene',saved:'Salvati',savedHint:'Ritrova i santi che segui',calendarHint:'Esplora i giorni e aggiungi calendari',discoverHint:'Cerca per nome, patronato e tema',
    saveSaint:'Salva santo',savedSaint:'Salvato',removeSaved:'Rimuovi dai salvati',saveHint:'Salva questo santo per ritrovarlo rapidamente su questo dispositivo.',savedTitle:'I tuoi santi salvati',savedEmpty:'Non hai ancora salvato alcun santo.',savedEmptyHint:'Apri un profilo e tocca “Salva santo”. I salvati restano su questo dispositivo senza richiedere un account.',remove:'Rimuovi',discoverSaints:'Scopri i santi',
    prayerEyebrow:'Pregare',prayerTitle:'Pregare con il calendario cristiano',prayerIntro:'Preghiere, novene e letture legate alle celebrazioni, mostrate solo quando fonte e diritti d’uso sono stati verificati.',readings:'Letture del giorno',readingsBody:'I riferimenti biblici sono collegati all’autorità liturgica ufficiale della tua tradizione e giurisdizione. Quando il testo non può essere ripubblicato, rimandiamo alla fonte ufficiale.',novenas:'Novene',novenasBody:'Segui le novene legate alle feste future e continua giorno per giorno. Le date sono verificate sui calendari liturgici autorevoli.',saintsPrayer:'Pregare con un santo',saintsPrayerBody:'Le pagine dei santi possono raccogliere preghiere tradizionali o approvate indicando tradizione, fonte e diritti.',viewLiturgy:'Vedi liturgia'
  },
  de: {
    pray:'Beten',prayHint:'Lesungen, Gebete und Novenen',saved:'Gespeichert',savedHint:'Zu verfolgten Heiligen zurückkehren',calendarHint:'Tage durchsuchen und Kalender hinzufügen',discoverHint:'Nach Name, Patronat und Thema suchen',
    saveSaint:'Heiligen speichern',savedSaint:'Gespeichert',removeSaved:'Aus Gespeichert entfernen',saveHint:'Speichern Sie diesen Heiligen für schnellen Zugriff auf diesem Gerät.',savedTitle:'Ihre gespeicherten Heiligen',savedEmpty:'Sie haben noch keine Heiligen gespeichert.',savedEmptyHint:'Öffnen Sie ein Profil und tippen Sie auf „Heiligen speichern“. Die Auswahl bleibt ohne Konto auf diesem Gerät.',remove:'Entfernen',discoverSaints:'Heilige entdecken',
    prayerEyebrow:'Beten',prayerTitle:'Mit dem christlichen Kalender beten',prayerIntro:'Gebete, Novenen und Lesungen zu Feiern werden nur angezeigt, wenn Quelle und Nutzungsrechte geprüft sind.',readings:'Lesungen des Tages',readingsBody:'Bibelstellen werden mit der offiziellen liturgischen Autorität Ihrer Tradition und Jurisdiktion verknüpft. Wenn der Text nicht wiedergegeben werden darf, verlinken wir auf die offizielle Quelle.',novenas:'Novenen',novenasBody:'Begleiten Sie Novenen zu kommenden Festen Tag für Tag. Die Termine werden anhand autoritativer liturgischer Kalender geprüft.',saintsPrayer:'Mit einem Heiligen beten',saintsPrayerBody:'Heiligenseiten können traditionelle oder approbierte Gebete mit Angabe von Tradition, Quelle und Rechten enthalten.',viewLiturgy:'Liturgie ansehen'
  },
  pl: {
    pray:'Módl się',prayHint:'Czytania, modlitwy i nowenny',saved:'Zapisane',savedHint:'Wróć do obserwowanych świętych',calendarHint:'Przeglądaj dni i dodawaj kalendarze',discoverHint:'Szukaj według imienia, patronatu i tematu',
    saveSaint:'Zapisz świętego',savedSaint:'Zapisano',removeSaved:'Usuń z zapisanych',saveHint:'Zapisz tego świętego, aby szybko wrócić na tym urządzeniu.',savedTitle:'Twoi zapisani święci',savedEmpty:'Nie zapisano jeszcze żadnego świętego.',savedEmptyHint:'Otwórz profil i wybierz „Zapisz świętego”. Zapis pozostaje na tym urządzeniu bez konta.',remove:'Usuń',discoverSaints:'Odkrywaj świętych',
    prayerEyebrow:'Módl się',prayerTitle:'Módl się z kalendarzem chrześcijańskim',prayerIntro:'Modlitwy, nowenny i czytania związane z obchodami są pokazywane tylko po zweryfikowaniu źródła i praw do użycia.',readings:'Czytania dnia',readingsBody:'Odsyłacze biblijne są powiązane z oficjalnym źródłem liturgicznym danej tradycji i jurysdykcji. Gdy tekstu nie można publikować, odsyłamy do źródła oficjalnego.',novenas:'Nowenny',novenasBody:'Śledź nowenny związane z nadchodzącymi świętami dzień po dniu. Daty są sprawdzane w autorytatywnych kalendarzach liturgicznych.',saintsPrayer:'Módl się ze świętym',saintsPrayerBody:'Strony świętych mogą zawierać modlitwy tradycyjne lub zatwierdzone z informacją o tradycji, źródle i prawach.',viewLiturgy:'Zobacz liturgię'
  },
  ru: {
    pray:'Молитва',prayHint:'Чтения, молитвы и новенны',saved:'Сохранённые',savedHint:'Возвращайтесь к святым, за которыми следите',calendarHint:'Просматривайте дни и добавляйте календари',discoverHint:'Ищите по имени, покровительству и теме',
    saveSaint:'Сохранить святого',savedSaint:'Сохранено',removeSaved:'Удалить из сохранённых',saveHint:'Сохраните этого святого для быстрого доступа на этом устройстве.',savedTitle:'Сохранённые святые',savedEmpty:'Вы ещё не сохранили ни одного святого.',savedEmptyHint:'Откройте профиль и нажмите «Сохранить святого». Сохранения остаются на этом устройстве без учётной записи.',remove:'Удалить',discoverSaints:'Найти святых',
    prayerEyebrow:'Молитва',prayerTitle:'Молиться вместе с христианским календарём',prayerIntro:'Молитвы, новенны и чтения, связанные с празднованиями, показываются только после проверки источника и прав использования.',readings:'Чтения дня',readingsBody:'Библейские ссылки привязываются к официальному литургическому источнику вашей традиции и юрисдикции. Если текст нельзя воспроизводить, мы ведём к официальному источнику.',novenas:'Новенны',novenasBody:'Следуйте новеннам перед предстоящими праздниками день за днём. Даты проверяются по авторитетным литургическим календарям.',saintsPrayer:'Молиться со святым',saintsPrayerBody:'Страницы святых могут включать традиционные или одобренные молитвы с указанием традиции, источника и прав.',viewLiturgy:'Открыть литургию'
  },
  fil: {
    pray:'Manalangin',prayHint:'Mga pagbasa, panalangin at nobena',saved:'Naka-save',savedHint:'Balikan ang mga santong sinusubaybayan mo',calendarHint:'Tingnan ang mga araw at magdagdag ng kalendaryo',discoverHint:'Maghanap ayon sa pangalan, patronahe at paksa',
    saveSaint:'I-save ang santo',savedSaint:'Naka-save',removeSaved:'Alisin sa naka-save',saveHint:'I-save ang santong ito para madaling balikan sa device na ito.',savedTitle:'Mga santong naka-save',savedEmpty:'Wala ka pang naka-save na santo.',savedEmptyHint:'Magbukas ng profile at pindutin ang “I-save ang santo”. Mananatili ang mga ito sa device na ito nang walang account.',remove:'Alisin',discoverSaints:'Tuklasin ang mga santo',
    prayerEyebrow:'Manalangin',prayerTitle:'Manalangin kasama ang kalendaryong Kristiyano',prayerIntro:'Mga panalangin, nobena at pagbasa na kaugnay ng pagdiriwang ay ipinapakita lamang kapag nasuri ang pinagmulan at karapatang gamitin.',readings:'Mga pagbasa sa araw',readingsBody:'Ang mga sanggunian sa Bibliya ay inuugnay sa opisyal na awtoridad liturhikal ng iyong tradisyon at hurisdiksiyon. Kung hindi maaaring ilathala muli ang teksto, itinuturo namin ang opisyal na pinagmulan.',novenas:'Mga nobena',novenasBody:'Subaybayan araw-araw ang mga nobenang kaugnay ng paparating na kapistahan. Ang mga petsa ay sinusuri laban sa awtoritatibong kalendaryong liturhikal.',saintsPrayer:'Manalangin kasama ang isang santo',saintsPrayerBody:'Maaaring magsama ang pahina ng santo ng tradisyonal o aprubadong panalangin na may malinaw na tradisyon, pinagmulan at karapatan.',viewLiturgy:'Tingnan ang liturhiya'
  },
  sw: {
    pray:'Omba',prayHint:'Masomo, sala na novena',saved:'Zilizohifadhiwa',savedHint:'Rudi kwa watakatifu unaowafuata',calendarHint:'Vinjari siku na ongeza kalenda',discoverHint:'Tafuta kwa jina, ulinzi na mada',
    saveSaint:'Hifadhi mtakatifu',savedSaint:'Imehifadhiwa',removeSaved:'Ondoa kwenye zilizohifadhiwa',saveHint:'Hifadhi mtakatifu huyu ili urudi kwa urahisi kwenye kifaa hiki.',savedTitle:'Watakatifu wako waliohifadhiwa',savedEmpty:'Bado hujahifadhi mtakatifu yeyote.',savedEmptyHint:'Fungua wasifu kisha bonyeza “Hifadhi mtakatifu”. Hifadhi hubaki kwenye kifaa hiki bila akaunti.',remove:'Ondoa',discoverSaints:'Gundua watakatifu',
    prayerEyebrow:'Omba',prayerTitle:'Omba pamoja na kalenda ya Kikristo',prayerIntro:'Sala, novena na masomo yanayohusiana na maadhimisho huonyeshwa tu baada ya chanzo na haki za matumizi kuthibitishwa.',readings:'Masomo ya siku',readingsBody:'Marejeo ya Biblia yanaunganishwa na mamlaka rasmi ya kiliturujia ya mapokeo na mamlaka ya eneo lako. Ikiwa maandishi hayawezi kuchapishwa tena, tunaunganisha na chanzo rasmi.',novenas:'Novena',novenasBody:'Fuata novena za sikukuu zijazo siku kwa siku. Tarehe hukaguliwa dhidi ya kalenda rasmi za kiliturujia.',saintsPrayer:'Omba pamoja na mtakatifu',saintsPrayerBody:'Kurasa za watakatifu zinaweza kuhusisha sala za jadi au zilizoidhinishwa zikiwa na mapokeo, chanzo na haki zilizoainishwa.',viewLiturgy:'Tazama liturujia'
  }
};

export function getRetentionCopy(locale: Locale): RetentionCopy {
  return COPY[locale];
}
