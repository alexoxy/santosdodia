import type { LocalizedText } from '../lib/i18n';
import type { Tradition } from './observances';

export type LiveStreamSource={
 id:string;
 tradition:Tradition;
 organization:string;
 liveUrl?:string;
 archiveUrl?:string;
 sourceUrl:string;
 descriptions:LocalizedText;
 languages:string[];
 verifiedAt:string;
};

export const LIVE_STREAM_SOURCES:LiveStreamSource[]=[
 {
  id:'vatican-media',tradition:'roman-catholic',organization:'Vatican News · Vatican Media',
  liveUrl:'https://www.youtube.com/@VaticanNews/live',archiveUrl:'https://www.youtube.com/@VaticanNews',sourceUrl:'https://www.vaticannews.va/pt/epg.html',
  descriptions:{en:'Official Vatican News YouTube live page and archive for papal celebrations and Vatican Media coverage.',pt:'Página oficial de diretos e arquivo do Vatican News no YouTube, com celebrações papais e cobertura do Vatican Media.',es:'Página oficial de directos y archivo de Vatican News en YouTube, con celebraciones papales y cobertura de Vatican Media.',fr:'Page officielle des directs et archives de Vatican News sur YouTube, avec célébrations papales et couverture de Vatican Media.'},languages:['pt','en','es','fr','it','de','pl'],verifiedAt:'2026-07-23'
 },
 {
  id:'goarch-live',tradition:'greek-orthodox',organization:'Greek Orthodox Archdiocese of America',
  liveUrl:'https://www.goarch.org/live-broadcasts',archiveUrl:'https://www.goarch.org/tv/all',sourceUrl:'https://www.goarch.org/live-broadcasts',
  descriptions:{en:'Official searchable directory of parish Divine Service live broadcasts.',pt:'Diretório oficial pesquisável de transmissões em direto dos serviços divinos das paróquias.',es:'Directorio oficial de emisiones en directo de los oficios divinos parroquiales.',fr:'Répertoire officiel des retransmissions en direct des offices paroissiaux.'},languages:['en','el'],verifiedAt:'2026-07-23'
 },
 {
  id:'oca-live',tradition:'eastern-orthodox',organization:'Orthodox Church in America',
  liveUrl:'https://www.oca.org/live',archiveUrl:'https://www.oca.org/resources-reflections',sourceUrl:'https://www.oca.org/live',
  descriptions:{en:'Official OCA live media page with links to services and recorded resources.',pt:'Página oficial de meios em direto da OCA, com ligações para celebrações e recursos gravados.',es:'Página oficial de medios en directo de la OCA, con celebraciones y recursos grabados.',fr:'Page officielle des directs de l’OCA, avec offices et ressources enregistrées.'},languages:['en'],verifiedAt:'2026-07-23'
 },
 {
  id:'church-of-england-online',tradition:'anglican',organization:'The Church of England',
  liveUrl:'https://www.churchofengland.org/prayer-and-worship/church-online',archiveUrl:'https://www.churchofengland.org/prayer-and-worship/join-us-church-online/weekly-online-services',sourceUrl:'https://www.churchofengland.org/prayer-and-worship/church-online',
  descriptions:{en:'Official weekly online worship and archive from the Church of England.',pt:'Celebração semanal online e arquivo oficial da Igreja de Inglaterra.',es:'Culto semanal en línea y archivo oficial de la Iglesia de Inglaterra.',fr:'Culte hebdomadaire en ligne et archives officielles de l’Église d’Angleterre.'},languages:['en'],verifiedAt:'2026-07-23'
 },
 {
  id:'suscopts-media',tradition:'coptic-orthodox',organization:'Coptic Orthodox Metropolis of the Southern United States',
  liveUrl:'https://www.youtube.com/@suscopts/live',archiveUrl:'https://www.youtube.com/@suscopts',sourceUrl:'https://suscopts.org/',
  descriptions:{en:'Official diocesan YouTube channel with liturgies, pastoral events and recordings.',pt:'Canal oficial diocesano no YouTube com liturgias, eventos pastorais e gravações.',es:'Canal diocesano oficial en YouTube con liturgias, eventos pastorales y grabaciones.',fr:'Chaîne diocésaine officielle sur YouTube avec liturgies, événements pastoraux et archives.'},languages:['en','ar'],verifiedAt:'2026-07-23'
 },
 {
  id:'mother-see-media',tradition:'armenian-apostolic',organization:'Mother See of Holy Etchmiadzin',
  archiveUrl:'https://www.armenianchurch.org/en/videos/',sourceUrl:'https://www.armenianchurch.org/en',
  descriptions:{en:'Official video and service archive from the Mother See of Holy Etchmiadzin.',pt:'Arquivo oficial de vídeos e celebrações da Santa Sé de Etchmiadzin.',es:'Archivo oficial de vídeos y celebraciones de la Santa Sede de Etchmiadzin.',fr:'Archives officielles des vidéos et offices du Saint-Siège d’Etchmiadzin.'},languages:['hy','en'],verifiedAt:'2026-07-23'
 },
 {
  id:'ethiopian-orthodox-media',tradition:'ethiopian-orthodox',organization:'Ethiopian Orthodox Tewahedo Church',
  archiveUrl:'https://www.ethiopianorthodox.org/churchmusic/liturgyinenglish/geeze.html',sourceUrl:'https://www.ethiopianorthodox.org/',
  descriptions:{en:'Official church liturgy, hymn and sermon resources. No stable live page is currently listed.',pt:'Recursos oficiais de liturgia, hinos e homilias. Não está atualmente indicada uma página estável de transmissão em direto.',es:'Recursos oficiales de liturgia, himnos y homilías. Actualmente no se indica una página estable de emisión en directo.',fr:'Ressources officielles de liturgie, de chants et d’homélies. Aucune page de direct stable n’est actuellement indiquée.'},languages:['am','gez','en'],verifiedAt:'2026-07-23'
 },
 {
  id:'syriac-orthodox-media',tradition:'syriac-orthodox',organization:'Syriac Orthodox Church',
  archiveUrl:'https://www.syriacorthodox.church/activities/social-media',sourceUrl:'https://syriacpatriarchate.org/',
  descriptions:{en:'Official church social-media directory. Live links vary by event and are therefore not presented as permanent streams.',pt:'Diretório oficial de redes sociais. As ligações em direto variam conforme o evento e, por isso, não são apresentadas como transmissões permanentes.',es:'Directorio oficial de redes sociales. Los enlaces en directo varían según el evento y no se presentan como emisiones permanentes.',fr:'Répertoire officiel des médias sociaux. Les liens en direct varient selon l’événement et ne sont donc pas présentés comme des flux permanents.'},languages:['syr','ar','en'],verifiedAt:'2026-07-23'
 }
];
