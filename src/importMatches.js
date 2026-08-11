import { db } from './firebase';
import {
  collection,
  doc,
  getDocs,
  serverTimestamp,
  writeBatch,
} from 'firebase/firestore';

const rawMatches = [
  ['mladsi-zaci', '2026-08-28', ['RDR Akademie B'], ['17:00'], true, 'Lipůvka', ['2026621F1A0102']],
  ['starsi-pripravka', '2026-08-30', ['Lipovec/Ostrov', 'Ostrov/Vilémovice'], ['10:00', '11:00'], true, 'Vavřinec', ['2026621G1A0122', '2026621G1A0120']],
  ['mladsi-pripravka', '2026-09-03', ['FSA Kras A', 'FSA Kras B'], ['17:00', '18:00'], true, 'Olomučany', ['2026621H1A0113', '2026621H1A0111']],
  ['mladsi-pripravka', '2026-09-05', ['Blansko B', 'Blansko A'], ['10:00', '10:00'], false, 'UT Mlýnská', ['2026621H1A0214', '2026621H1A0215']],
  ['mladsi-zaci', '2026-09-05', ['RDR Akademie dívky'], ['14:00'], false, 'Ráječko', ['2026621F1A0205']],
  ['starsi-pripravka', '2026-09-05', ['RDR DY', 'RDR DX'], ['10:00', '11:00'], false, 'Doubravice', ['2026621G1A0208', '2026621G1A0209']],
  ['mladsi-pripravka', '2026-09-10', ['RDR RY', 'RDR RX/R'], ['17:00', '18:00'], true, 'Lipůvka', ['2026621H1A0307', '2026621H1A0309']],
  ['mladsi-zaci', '2026-09-11', ['Babice/Adamov'], ['17:00'], true, 'Lipůvka', ['2026621F1A0301']],
  ['starsi-pripravka', '2026-09-12', ['Olomučany/Adamov', 'Olomučany/Babice'], ['10:00', '11:00'], true, 'Lipůvka', ['2026621G1A0316', '2026621G1A0318']],
  ['mladsi-pripravka', '2026-09-17', ['Olomučany/Babice'], ['17:00'], false, 'Olomučany', ['2026621H1A0417']],
  ['mladsi-zaci', '2026-09-18', ['Lipovec/FSA Kras'], ['17:00'], true, 'Lipůvka', ['2026621F1A0405']],
  ['starsi-pripravka', '2026-09-19', ['RDR RJY', 'RDR RJX'], ['10:00', '11:00'], false, 'Rájec-Jestřebí', ['2026621G1A0412', '2026621G1A0413']],
  ['mladsi-pripravka', '2026-09-24', ['Lipovec', 'Ostrov/Vilémovice'], ['17:00', '18:00'], true, 'Lipůvka', ['2026621H1A0508', '2026621H1A0506']],
  ['mladsi-zaci', '2026-09-26', ['Černá Hora'], ['10:00'], false, 'Černá Hora', ['2026621F1A0502']],
  ['starsi-pripravka', '2026-09-26', ['Černá Hora'], ['10:00'], true, 'Vavřinec', ['2026621G1A0512']],
  ['starsi-pripravka', '2026-09-27', ['Drnovice'], ['11:00'], true, 'Vavřinec', ['2026621G1A0514']],
  ['mladsi-zaci', '2026-10-02', ['Blansko B'], ['17:00'], true, 'Lipůvka', ['2026621F1A0604']],
  ['mladsi-pripravka', '2026-10-04', ['RDR DY', 'RDR DX/D'], ['10:00', '11:00'], false, 'Doubravice', ['2026621H1A0619', '2026621H1A0620']],
  ['starsi-pripravka', '2026-10-04', ['Kunštát/ŽH B', 'Kunštát/ŽH A'], ['10:00', '10:00'], false, 'Kunštát', ['2026621G1A0616', '2026621G1A0617']],
  ['mladsi-pripravka', '2026-10-08', ['OLEŠNICE', 'Kunštát/ŽH'], ['17:00', '18:00'], true, 'Olomučany', ['2026621H1A0702', '2026621H1A0704']],
  ['starsi-pripravka', '2026-10-10', ['Vrchovina', 'Knínice'], ['10:00', '10:00'], true, 'Lipůvka', ['2026621G1A0708', '2026621G1A0710']],
  ['mladsi-pripravka', '2026-10-15', ['RDR RJX/RJ', 'RDR RJY/RJ'], ['16:30', '17:30'], true, 'Lipůvka', ['2026621H1A0821', '2026621H1A0819']],
  ['mladsi-zaci', '2026-10-16', ['Vavřinec/Vysočany-Šošůvka'], ['16:30'], true, 'Lipůvka', ['2026621F1A0803']],
  ['starsi-pripravka', '2026-10-17', ['FSA Kras B', 'FSA Kras A'], ['09:00', '10:00'], false, 'Kotvrdovice', ['2026621G1A0820', '2026621G1A0821']],
  ['mladsi-pripravka', '2026-10-24', ['Boskovice – Letovice BU8', 'Boskovice – Letovice BU9'], ['12:30', '13:45'], false, 'Boskovice', ['2026621H1A0906', '2026621H1A0907']],
  ['mladsi-zaci', '2026-10-25', ['Obřany'], ['11:00'], false, 'Zlatníky', ['2026621F1A0904']],
  ['starsi-pripravka', '2026-10-25', ['Blansko B', 'Blansko A'], ['10:00', '11:00'], true, 'Vavřinec', ['2026621G1A0904', '2026621G1A0906']],
  ['mladsi-zaci', '2026-10-28', ['Babice/Adamov'], ['10:00'], false, 'Babice n/Svit.', ['2026621F1A1201']],
  ['mladsi-pripravka', '2026-10-29', ['Boskovice – Letovice LU8', 'Boskovice – Letovice LU9'], ['17:00', '18:00'], true, 'Olomučany', ['2026621H1A1015', '2026621H1A1017']],
  ['mladsi-zaci', '2026-10-31', ['RDR Akademie B'], ['09:00'], false, 'Rájec-Jestřebí', ['2026621F1A1002']],
  ['starsi-pripravka', '2026-10-31', ['RDR RY/Ráječko', 'RDR RX/Ráječko'], ['10:00', '11:00'], false, 'Ráječko', ['2026621G1A1024', '2026621G1A1025']],
  ['mladsi-zaci', '2026-11-07', ['RDR Akademie dívky'], ['14:00'], true, 'Lipůvka', ['2026621F1A1105']],
];

const formatCzechDate = (dateISO) => {
  const [year, month, day] = dateISO.split('-').map(Number);
  return `${day}. ${month}. ${year}`;
};

export const autumn2026Matches = rawMatches.map(
  ([category, dateISO, opponents, times, home, venue, facrMatchIds]) => ({
    importKey: `facr-podzim-2026-${facrMatchIds.join('-')}`,
    facrMatchIds,
    season: '2026/27',
    category,
    date: formatCzechDate(dateISO),
    dateISO,
    opponent: opponents.join(' / '),
    time: times.join(' / '),
    home,
    venue,
    status: 'planned',
    matchType: 'league',
    seasonPart: 'autumn',
    hasSecondBlock: opponents.length > 1,
    matchLabel1: opponents[0] || '',
    result1: '',
    scorers1: '',
    matchLabel2: opponents[1] || '',
    result2: '',
    scorers2: '',
    articleTitle: '',
    article: '',
    galleryAlbumId: '',
  })
);

const getMatchSignature = (match) =>
  [
    match.season || '',
    match.category || '',
    match.dateISO || match.date || '',
    match.opponent || '',
  ].join('|');

export async function importAutumn2026Matches() {
  const matchesCollection = collection(db, 'matches');
  const snapshot = await getDocs(matchesCollection);
  const existingImportKeys = new Set();
  const existingSignatures = new Set();

  snapshot.docs.forEach((item) => {
    const data = item.data();
    if (data.importKey) existingImportKeys.add(data.importKey);
    existingSignatures.add(getMatchSignature(data));
  });

  const matchesToImport = autumn2026Matches.filter(
    (match) =>
      !existingImportKeys.has(match.importKey) &&
      !existingSignatures.has(getMatchSignature(match))
  );

  if (matchesToImport.length === 0) {
    return { imported: 0, skipped: autumn2026Matches.length };
  }

  const batch = writeBatch(db);
  matchesToImport.forEach((match) => {
    const matchRef = doc(matchesCollection);
    batch.set(matchRef, {
      ...match,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  });

  await batch.commit();

  return {
    imported: matchesToImport.length,
    skipped: autumn2026Matches.length - matchesToImport.length,
  };
}
