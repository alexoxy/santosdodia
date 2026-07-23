import type { LocalizedText } from '../lib/i18n';
import type { Tradition } from './observances';

export type LiveStreamSource={
 id:string;
 tradition:Tradition;
 organization:string;
 liveUrl:string;
 archiveUrl:string;
 sourceUrl:string;
 embedUrl?:string;
 descriptions:LocalizedText;
 languages:string[];
 verifiedAt:string;
};

export const LIVE_STREAM_SOURCES:LiveStreamSource[]=[
 {
  id:'vatican-media',tradition:'roman-catholic',organization:'Vatican News · Vatican Media',
  liveUrl:'https://www.vaticannews.va/pt/epg.html',archiveUrl:'https://www.vaticannews.va/pt.html',sourceUrl:'https://www.vaticannews.va/pt/faq.html',embedUrl:'https://www.vaticannews.va/widget/embed.html',
  descriptions:{en:'Official Vatican programming, papal celebrations, radio and live coverage.',pt:'Programação oficial do Vaticano, celebrações papais, rádio e transmissões em direto.',es:'Programación oficial del Vaticano, celebraciones papales, radio y emisiones en directo.',fr:'Programmation officielle du Vatican, célébrations papales, radio et directs.'},languages:['pt','en','es','fr','it','de','pl'],verifiedAt:'2026-07-23'
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
  liveUrl:'https://www.armenianchurch.org/en/videos/',archiveUrl:'https://www.armenianchurch.org/en/videos/',sourceUrl:'https://www.armenianchurch.org/en',
  descriptions:{en:'Official video and service coverage from the Mother See of Holy Etchmiadzin.',pt:'Vídeos e cobertura oficial de celebrações da Santa Sé de Etchmiadzin.',es:'Vídeos y cobertura oficial de celebraciones de la Santa Sede de Etchmiadzin.',fr:'Vidéos et couverture officielle des offices du Saint-Siège d’Etchmiadzin.'},languages:['hy','en'],verifiedAt:'2026-07-23'
 },
 {
  id:'ethiopian-orthodox-media',tradition:'ethiopian-orthodox',organization:'Ethiopian Orthodox Tewahedo Church',
  liveUrl:'https://www.ethiopianorthodox.org/english/indexenglish.html',archiveUrl:'https://www.ethiopianorthodox.org/churchmusic/liturgyinenglish/geeze.html',sourceUrl:'https://www.ethiopianorthodox.org/',
  descriptions:{en:'Official church video, liturgy, hymn and sermon resources, used as a continuous media fallback.',pt:'Recursos oficiais de vídeo, liturgia, hinos e homilias, utilizados como alternativa permanente quando não existe direto.',es:'Recursos oficiales de vídeo, liturgia, himnos y homilías, disponibles cuando no hay directo.',fr:'Ressources officielles vidéo, liturgiques, musicales et homilétiques lorsque aucun direct n’est disponible.'},languages:['am','gez','en'],verifiedAt:'2026-07-23'
 },
 {
  id:'syriac-orthodox-media',tradition:'syriac-orthodox',organization:'Syriac Orthodox Church',
  liveUrl:'https://www.syriacorthodox.church/activities/social-media',archiveUrl:'https://www.syriacorthodox.church/activities/social-media',sourceUrl:'https://syriacpatriarchate.org/',
  descriptions:{en:'Official church social-media directory with live masses, services and vespers.',pt:'Diretório oficial de redes sociais com missas, celebrações e vésperas em direto.',es:'Directorio oficial de redes sociales con misas, celebraciones y vísperas en directo.',fr:'Répertoire officiel des médias sociaux proposant messes, offices et vêpres en direct.'},languages:['syr','ar','en'],verifiedAt:'2026-07-23'
 }
];
