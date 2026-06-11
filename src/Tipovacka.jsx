import { useEffect, useMemo, useState } from 'react';
import { db } from './firebase';
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  serverTimestamp,
  setDoc,
  updateDoc,
} from 'firebase/firestore';

const PLAYERS = [
  { id: 'radek', name: 'Radek' },
  { id: 'david', name: 'David' },
  { id: 'jirka', name: 'Jirka' },
  { id: 'lukin', name: 'Lukin' },
];

const ADMIN_CODE = 'radek2026';
const PLAYER_CODES = {
  radek: 'radek2026',
  david: 'david2026',
  jirka: 'jirka2026',
  lukin: 'lukin2026',
};
const PLAYER_STORAGE_KEY = 'ask-ms-tipovacka-player';
const MATCHES_COLLECTION = 'msTipovackaMatches';
const TIPS_COLLECTION = 'msTipovackaTips';


const DEFAULT_MATCHES = [
  {
    "id": "wc001",
    "home": "Mexiko",
    "away": "Jihoafrická republika",
    "kickoff": "2026-06-11T21:00",
    "group": "Skupina A",
    "result": ""
  },
  {
    "id": "wc002",
    "home": "Jižní Korea",
    "away": "Česko",
    "kickoff": "2026-06-12T04:00",
    "group": "Skupina A",
    "result": ""
  },
  {
    "id": "wc003",
    "home": "Kanada",
    "away": "Bosna a Hercegovina",
    "kickoff": "2026-06-12T21:00",
    "group": "Skupina B",
    "result": ""
  },
  {
    "id": "wc004",
    "home": "USA",
    "away": "Paraguay",
    "kickoff": "2026-06-13T03:00",
    "group": "Skupina D",
    "result": ""
  },
  {
    "id": "wc005",
    "home": "Katar",
    "away": "Švýcarsko",
    "kickoff": "2026-06-13T21:00",
    "group": "Skupina B",
    "result": ""
  },
  {
    "id": "wc006",
    "home": "Brazílie",
    "away": "Maroko",
    "kickoff": "2026-06-14T00:00",
    "group": "Skupina C",
    "result": ""
  },
  {
    "id": "wc007",
    "home": "Haiti",
    "away": "Skotsko",
    "kickoff": "2026-06-14T03:00",
    "group": "Skupina C",
    "result": ""
  },
  {
    "id": "wc008",
    "home": "Austrálie",
    "away": "Turecko",
    "kickoff": "2026-06-14T06:00",
    "group": "Skupina D",
    "result": ""
  },
  {
    "id": "wc009",
    "home": "Německo",
    "away": "Curaçao",
    "kickoff": "2026-06-14T19:00",
    "group": "Skupina E",
    "result": ""
  },
  {
    "id": "wc010",
    "home": "Nizozemsko",
    "away": "Japonsko",
    "kickoff": "2026-06-14T22:00",
    "group": "Skupina F",
    "result": ""
  },
  {
    "id": "wc011",
    "home": "Pobřeží slonoviny",
    "away": "Ekvádor",
    "kickoff": "2026-06-15T01:00",
    "group": "Skupina E",
    "result": ""
  },
  {
    "id": "wc012",
    "home": "Švédsko",
    "away": "Tunisko",
    "kickoff": "2026-06-15T04:00",
    "group": "Skupina F",
    "result": ""
  },
  {
    "id": "wc013",
    "home": "Španělsko",
    "away": "Kapverdy",
    "kickoff": "2026-06-15T18:00",
    "group": "Skupina H",
    "result": ""
  },
  {
    "id": "wc014",
    "home": "Belgie",
    "away": "Egypt",
    "kickoff": "2026-06-15T21:00",
    "group": "Skupina G",
    "result": ""
  },
  {
    "id": "wc015",
    "home": "Saúdská Arábie",
    "away": "Uruguay",
    "kickoff": "2026-06-16T00:00",
    "group": "Skupina H",
    "result": ""
  },
  {
    "id": "wc016",
    "home": "Írán",
    "away": "Nový Zéland",
    "kickoff": "2026-06-16T03:00",
    "group": "Skupina G",
    "result": ""
  },
  {
    "id": "wc017",
    "home": "Francie",
    "away": "Senegal",
    "kickoff": "2026-06-16T21:00",
    "group": "Skupina I",
    "result": ""
  },
  {
    "id": "wc018",
    "home": "Irák",
    "away": "Norsko",
    "kickoff": "2026-06-17T00:00",
    "group": "Skupina I",
    "result": ""
  },
  {
    "id": "wc019",
    "home": "Argentina",
    "away": "Alžírsko",
    "kickoff": "2026-06-17T03:00",
    "group": "Skupina J",
    "result": ""
  },
  {
    "id": "wc020",
    "home": "Rakousko",
    "away": "Jordánsko",
    "kickoff": "2026-06-17T06:00",
    "group": "Skupina J",
    "result": ""
  },
  {
    "id": "wc021",
    "home": "Portugalsko",
    "away": "DR Kongo",
    "kickoff": "2026-06-17T19:00",
    "group": "Skupina K",
    "result": ""
  },
  {
    "id": "wc022",
    "home": "Anglie",
    "away": "Chorvatsko",
    "kickoff": "2026-06-17T22:00",
    "group": "Skupina L",
    "result": ""
  },
  {
    "id": "wc023",
    "home": "Ghana",
    "away": "Panama",
    "kickoff": "2026-06-18T01:00",
    "group": "Skupina L",
    "result": ""
  },
  {
    "id": "wc024",
    "home": "Uzbekistán",
    "away": "Kolumbie",
    "kickoff": "2026-06-18T04:00",
    "group": "Skupina K",
    "result": ""
  },
  {
    "id": "wc025",
    "home": "Česko",
    "away": "Jihoafrická republika",
    "kickoff": "2026-06-18T18:00",
    "group": "Skupina A",
    "result": ""
  },
  {
    "id": "wc026",
    "home": "Švýcarsko",
    "away": "Bosna a Hercegovina",
    "kickoff": "2026-06-18T21:00",
    "group": "Skupina B",
    "result": ""
  },
  {
    "id": "wc027",
    "home": "Kanada",
    "away": "Katar",
    "kickoff": "2026-06-19T00:00",
    "group": "Skupina B",
    "result": ""
  },
  {
    "id": "wc028",
    "home": "Mexiko",
    "away": "Jižní Korea",
    "kickoff": "2026-06-19T03:00",
    "group": "Skupina A",
    "result": ""
  },
  {
    "id": "wc029",
    "home": "USA",
    "away": "Austrálie",
    "kickoff": "2026-06-19T21:00",
    "group": "Skupina D",
    "result": ""
  },
  {
    "id": "wc030",
    "home": "Skotsko",
    "away": "Maroko",
    "kickoff": "2026-06-19T21:00",
    "group": "Skupina C",
    "result": ""
  },
  {
    "id": "wc031",
    "home": "Brazílie",
    "away": "Haiti",
    "kickoff": "2026-06-20T03:00",
    "group": "Skupina C",
    "result": ""
  },
  {
    "id": "wc032",
    "home": "Turecko",
    "away": "Paraguay",
    "kickoff": "2026-06-20T06:00",
    "group": "Skupina D",
    "result": ""
  },
  {
    "id": "wc033",
    "home": "Nizozemsko",
    "away": "Švédsko",
    "kickoff": "2026-06-20T19:00",
    "group": "Skupina F",
    "result": ""
  },
  {
    "id": "wc034",
    "home": "Německo",
    "away": "Pobřeží slonoviny",
    "kickoff": "2026-06-20T22:00",
    "group": "Skupina E",
    "result": ""
  },
  {
    "id": "wc035",
    "home": "Ekvádor",
    "away": "Curaçao",
    "kickoff": "2026-06-21T02:00",
    "group": "Skupina E",
    "result": ""
  },
  {
    "id": "wc036",
    "home": "Tunisko",
    "away": "Japonsko",
    "kickoff": "2026-06-21T06:00",
    "group": "Skupina F",
    "result": ""
  },
  {
    "id": "wc037",
    "home": "Španělsko",
    "away": "Saúdská Arábie",
    "kickoff": "2026-06-21T18:00",
    "group": "Skupina H",
    "result": ""
  },
  {
    "id": "wc038",
    "home": "Belgie",
    "away": "Írán",
    "kickoff": "2026-06-21T21:00",
    "group": "Skupina G",
    "result": ""
  },
  {
    "id": "wc039",
    "home": "Uruguay",
    "away": "Kapverdy",
    "kickoff": "2026-06-22T00:00",
    "group": "Skupina H",
    "result": ""
  },
  {
    "id": "wc040",
    "home": "Nový Zéland",
    "away": "Egypt",
    "kickoff": "2026-06-22T03:00",
    "group": "Skupina G",
    "result": ""
  },
  {
    "id": "wc041",
    "home": "Argentina",
    "away": "Rakousko",
    "kickoff": "2026-06-22T19:00",
    "group": "Skupina J",
    "result": ""
  },
  {
    "id": "wc042",
    "home": "Francie",
    "away": "Irák",
    "kickoff": "2026-06-22T23:00",
    "group": "Skupina I",
    "result": ""
  },
  {
    "id": "wc043",
    "home": "Norsko",
    "away": "Senegal",
    "kickoff": "2026-06-23T02:00",
    "group": "Skupina I",
    "result": ""
  },
  {
    "id": "wc044",
    "home": "Jordánsko",
    "away": "Alžírsko",
    "kickoff": "2026-06-23T05:00",
    "group": "Skupina J",
    "result": ""
  },
  {
    "id": "wc045",
    "home": "Portugalsko",
    "away": "Uzbekistán",
    "kickoff": "2026-06-23T19:00",
    "group": "Skupina K",
    "result": ""
  },
  {
    "id": "wc046",
    "home": "Anglie",
    "away": "Ghana",
    "kickoff": "2026-06-23T22:00",
    "group": "Skupina L",
    "result": ""
  },
  {
    "id": "wc047",
    "home": "Panama",
    "away": "Chorvatsko",
    "kickoff": "2026-06-24T01:00",
    "group": "Skupina L",
    "result": ""
  },
  {
    "id": "wc048",
    "home": "Kolumbie",
    "away": "DR Kongo",
    "kickoff": "2026-06-24T04:00",
    "group": "Skupina K",
    "result": ""
  },
  {
    "id": "wc049",
    "home": "Švýcarsko",
    "away": "Kanada",
    "kickoff": "2026-06-24T21:00",
    "group": "Skupina B",
    "result": ""
  },
  {
    "id": "wc050",
    "home": "Bosna a Hercegovina",
    "away": "Katar",
    "kickoff": "2026-06-24T21:00",
    "group": "Skupina B",
    "result": ""
  },
  {
    "id": "wc051",
    "home": "Brazílie",
    "away": "Skotsko",
    "kickoff": "2026-06-25T00:00",
    "group": "Skupina C",
    "result": ""
  },
  {
    "id": "wc052",
    "home": "Maroko",
    "away": "Haiti",
    "kickoff": "2026-06-25T00:00",
    "group": "Skupina C",
    "result": ""
  },
  {
    "id": "wc053",
    "home": "Mexiko",
    "away": "Česko",
    "kickoff": "2026-06-25T03:00",
    "group": "Skupina A",
    "result": ""
  },
  {
    "id": "wc054",
    "home": "Jižní Korea",
    "away": "Jihoafrická republika",
    "kickoff": "2026-06-25T03:00",
    "group": "Skupina A",
    "result": ""
  },
  {
    "id": "wc055",
    "home": "Ekvádor",
    "away": "Německo",
    "kickoff": "2026-06-25T22:00",
    "group": "Skupina E",
    "result": ""
  },
  {
    "id": "wc056",
    "home": "Curaçao",
    "away": "Pobřeží slonoviny",
    "kickoff": "2026-06-25T22:00",
    "group": "Skupina E",
    "result": ""
  },
  {
    "id": "wc057",
    "home": "Tunisko",
    "away": "Nizozemsko",
    "kickoff": "2026-06-26T01:00",
    "group": "Skupina F",
    "result": ""
  },
  {
    "id": "wc058",
    "home": "Japonsko",
    "away": "Švédsko",
    "kickoff": "2026-06-26T01:00",
    "group": "Skupina F",
    "result": ""
  },
  {
    "id": "wc059",
    "home": "USA",
    "away": "Turecko",
    "kickoff": "2026-06-26T04:00",
    "group": "Skupina D",
    "result": ""
  },
  {
    "id": "wc060",
    "home": "Paraguay",
    "away": "Austrálie",
    "kickoff": "2026-06-26T04:00",
    "group": "Skupina D",
    "result": ""
  },
  {
    "id": "wc061",
    "home": "Norsko",
    "away": "Francie",
    "kickoff": "2026-06-26T21:00",
    "group": "Skupina I",
    "result": ""
  },
  {
    "id": "wc062",
    "home": "Senegal",
    "away": "Irák",
    "kickoff": "2026-06-26T21:00",
    "group": "Skupina I",
    "result": ""
  },
  {
    "id": "wc063",
    "home": "Uruguay",
    "away": "Španělsko",
    "kickoff": "2026-06-27T02:00",
    "group": "Skupina H",
    "result": ""
  },
  {
    "id": "wc064",
    "home": "Kapverdy",
    "away": "Saúdská Arábie",
    "kickoff": "2026-06-27T02:00",
    "group": "Skupina H",
    "result": ""
  },
  {
    "id": "wc065",
    "home": "Nový Zéland",
    "away": "Belgie",
    "kickoff": "2026-06-27T05:00",
    "group": "Skupina G",
    "result": ""
  },
  {
    "id": "wc066",
    "home": "Egypt",
    "away": "Írán",
    "kickoff": "2026-06-27T05:00",
    "group": "Skupina G",
    "result": ""
  },
  {
    "id": "wc067",
    "home": "Panama",
    "away": "Anglie",
    "kickoff": "2026-06-27T23:00",
    "group": "Skupina L",
    "result": ""
  },
  {
    "id": "wc068",
    "home": "Chorvatsko",
    "away": "Ghana",
    "kickoff": "2026-06-27T23:00",
    "group": "Skupina L",
    "result": ""
  },
  {
    "id": "wc069",
    "home": "Kolumbie",
    "away": "Portugalsko",
    "kickoff": "2026-06-28T01:30",
    "group": "Skupina K",
    "result": ""
  },
  {
    "id": "wc070",
    "home": "DR Kongo",
    "away": "Uzbekistán",
    "kickoff": "2026-06-28T01:30",
    "group": "Skupina K",
    "result": ""
  },
  {
    "id": "wc071",
    "home": "Argentina",
    "away": "Jordánsko",
    "kickoff": "2026-06-28T04:00",
    "group": "Skupina J",
    "result": ""
  },
  {
    "id": "wc072",
    "home": "Alžírsko",
    "away": "Rakousko",
    "kickoff": "2026-06-28T04:00",
    "group": "Skupina J",
    "result": ""
  },
  {
    "id": "wc073",
    "home": "2. místo skupiny A",
    "away": "2. místo skupiny B",
    "kickoff": "2026-06-28T21:00",
    "group": "32 týmů",
    "result": ""
  },
  {
    "id": "wc074",
    "home": "Vítěz skupiny C",
    "away": "2. místo skupiny F",
    "kickoff": "2026-06-29T19:00",
    "group": "32 týmů",
    "result": ""
  },
  {
    "id": "wc075",
    "home": "Vítěz skupiny E",
    "away": "3. tým A/B/C/D/F",
    "kickoff": "2026-06-29T22:30",
    "group": "32 týmů",
    "result": ""
  },
  {
    "id": "wc076",
    "home": "Vítěz skupiny F",
    "away": "2. místo skupiny C",
    "kickoff": "2026-06-30T03:00",
    "group": "32 týmů",
    "result": ""
  },
  {
    "id": "wc077",
    "home": "2. místo skupiny E",
    "away": "2. místo skupiny I",
    "kickoff": "2026-06-30T19:00",
    "group": "32 týmů",
    "result": ""
  },
  {
    "id": "wc078",
    "home": "Vítěz skupiny I",
    "away": "3. tým C/D/F/G/H",
    "kickoff": "2026-06-30T23:00",
    "group": "32 týmů",
    "result": ""
  },
  {
    "id": "wc079",
    "home": "Vítěz skupiny A",
    "away": "3. tým C/E/F/H/I",
    "kickoff": "2026-07-01T03:00",
    "group": "32 týmů",
    "result": ""
  },
  {
    "id": "wc080",
    "home": "Vítěz skupiny L",
    "away": "3. tým E/H/I/J/K",
    "kickoff": "2026-07-01T18:00",
    "group": "32 týmů",
    "result": ""
  },
  {
    "id": "wc081",
    "home": "Vítěz skupiny G",
    "away": "3. tým A/E/H/I/J",
    "kickoff": "2026-07-01T22:00",
    "group": "32 týmů",
    "result": ""
  },
  {
    "id": "wc082",
    "home": "Vítěz skupiny D",
    "away": "3. tým B/E/F/I/J",
    "kickoff": "2026-07-02T02:00",
    "group": "32 týmů",
    "result": ""
  },
  {
    "id": "wc083",
    "home": "Vítěz skupiny H",
    "away": "2. místo skupiny J",
    "kickoff": "2026-07-02T21:00",
    "group": "32 týmů",
    "result": ""
  },
  {
    "id": "wc084",
    "home": "2. místo skupiny K",
    "away": "2. místo skupiny L",
    "kickoff": "2026-07-03T01:00",
    "group": "32 týmů",
    "result": ""
  },
  {
    "id": "wc085",
    "home": "Vítěz skupiny B",
    "away": "3. tým D/E/I/J/L",
    "kickoff": "2026-07-03T05:00",
    "group": "32 týmů",
    "result": ""
  },
  {
    "id": "wc086",
    "home": "2. místo skupiny D",
    "away": "2. místo skupiny G",
    "kickoff": "2026-07-03T20:00",
    "group": "32 týmů",
    "result": ""
  },
  {
    "id": "wc087",
    "home": "Vítěz skupiny J",
    "away": "2. místo skupiny H",
    "kickoff": "2026-07-04T00:00",
    "group": "32 týmů",
    "result": ""
  },
  {
    "id": "wc088",
    "home": "Vítěz skupiny K",
    "away": "3. tým D/E/I/J/L",
    "kickoff": "2026-07-04T03:30",
    "group": "32 týmů",
    "result": ""
  },
  {
    "id": "wc089",
    "home": "TBD",
    "away": "TBD",
    "kickoff": "2026-07-04T19:00",
    "group": "Osmifinále",
    "result": ""
  },
  {
    "id": "wc090",
    "home": "TBD",
    "away": "TBD",
    "kickoff": "2026-07-04T23:00",
    "group": "Osmifinále",
    "result": ""
  },
  {
    "id": "wc091",
    "home": "TBD",
    "away": "TBD",
    "kickoff": "2026-07-05T22:00",
    "group": "Osmifinále",
    "result": ""
  },
  {
    "id": "wc092",
    "home": "TBD",
    "away": "TBD",
    "kickoff": "2026-07-06T02:00",
    "group": "Osmifinále",
    "result": ""
  },
  {
    "id": "wc093",
    "home": "TBD",
    "away": "TBD",
    "kickoff": "2026-07-06T21:00",
    "group": "Osmifinále",
    "result": ""
  },
  {
    "id": "wc094",
    "home": "TBD",
    "away": "TBD",
    "kickoff": "2026-07-07T02:00",
    "group": "Osmifinále",
    "result": ""
  },
  {
    "id": "wc095",
    "home": "TBD",
    "away": "TBD",
    "kickoff": "2026-07-07T18:00",
    "group": "Osmifinále",
    "result": ""
  },
  {
    "id": "wc096",
    "home": "TBD",
    "away": "TBD",
    "kickoff": "2026-07-07T22:00",
    "group": "Osmifinále",
    "result": ""
  },
  {
    "id": "wc097",
    "home": "TBD",
    "away": "TBD",
    "kickoff": "2026-07-09T22:00",
    "group": "Čtvrtfinále",
    "result": ""
  },
  {
    "id": "wc098",
    "home": "TBD",
    "away": "TBD",
    "kickoff": "2026-07-10T21:00",
    "group": "Čtvrtfinále",
    "result": ""
  },
  {
    "id": "wc099",
    "home": "TBD",
    "away": "TBD",
    "kickoff": "2026-07-11T23:00",
    "group": "Čtvrtfinále",
    "result": ""
  },
  {
    "id": "wc100",
    "home": "TBD",
    "away": "TBD",
    "kickoff": "2026-07-12T03:00",
    "group": "Čtvrtfinále",
    "result": ""
  },
  {
    "id": "wc101",
    "home": "TBD",
    "away": "TBD",
    "kickoff": "2026-07-14T21:00",
    "group": "Semifinále",
    "result": ""
  },
  {
    "id": "wc102",
    "home": "TBD",
    "away": "TBD",
    "kickoff": "2026-07-15T21:00",
    "group": "Semifinále",
    "result": ""
  },
  {
    "id": "wc103",
    "home": "Poražený semifinále 1",
    "away": "Poražený semifinále 2",
    "kickoff": "2026-07-18T23:00",
    "group": "O 3. místo",
    "result": ""
  },
  {
    "id": "wc104",
    "home": "TBD",
    "away": "TBD",
    "kickoff": "2026-07-19T21:00",
    "group": "Finále",
    "result": ""
  }
];

const emptyMatchForm = {
  home: '',
  away: '',
  kickoff: '',
  group: '',
};

const tipOptions = [
  { value: '1', label: '1', help: 'výhra týmu 1' },
  { value: '0', label: '0', help: 'remíza' },
  { value: '2', label: '2', help: 'výhra týmu 2' },
];

const PLAYED_ARCHIVE_AFTER_HOURS = 24;

const formatKickoff = (value) => {
  if (!value) return 'bez času';

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return new Intl.DateTimeFormat('cs-CZ', {
    weekday: 'short',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
};

const isMatchLocked = (match) => {
  if (!match?.kickoff) return false;
  const kickoffDate = new Date(match.kickoff);
  if (Number.isNaN(kickoffDate.getTime())) return false;
  return Date.now() >= kickoffDate.getTime();
};

const isMatchInPlayedArchive = (match) => {
  if (!match?.kickoff) return false;
  const kickoffDate = new Date(match.kickoff);
  if (Number.isNaN(kickoffDate.getTime())) return false;
  const archiveTime = kickoffDate.getTime() + PLAYED_ARCHIVE_AFTER_HOURS * 60 * 60 * 1000;
  return Date.now() >= archiveTime;
};

const getTipDocId = (playerId, matchId) => `${playerId}_${matchId}`;

const getSavedPlayer = () => {
  if (typeof window === 'undefined') return '';
  const saved = window.localStorage.getItem(PLAYER_STORAGE_KEY) || '';
  return PLAYERS.some((player) => player.id === saved) ? saved : '';
};

export default function Tipovacka() {
  const [matches, setMatches] = useState([]);
  const [tips, setTips] = useState([]);
  const [selectedPlayer, setSelectedPlayer] = useState(getSavedPlayer);
  const [loginPlayer, setLoginPlayer] = useState(() => getSavedPlayer() || 'radek');
  const [playerCode, setPlayerCode] = useState('');
  const [loading, setLoading] = useState(true);
  const [savingTipId, setSavingTipId] = useState('');
  const [adminCode, setAdminCode] = useState('');
  const [adminOpen, setAdminOpen] = useState(false);
  const [savingAdmin, setSavingAdmin] = useState(false);
  const [matchForm, setMatchForm] = useState(emptyMatchForm);
  const [editingMatchId, setEditingMatchId] = useState(null);
  const [matchView, setMatchView] = useState('upcoming');

  const selectedPlayerName = PLAYERS.find((player) => player.id === selectedPlayer)?.name || 'hráč';
  const loginPlayerName = PLAYERS.find((player) => player.id === loginPlayer)?.name || 'hráč';
  const playerUnlocked = Boolean(selectedPlayer);

  const sortedMatches = useMemo(() => {
    return [...matches].sort((a, b) => {
      const aTime = a.kickoff ? new Date(a.kickoff).getTime() : 0;
      const bTime = b.kickoff ? new Date(b.kickoff).getTime() : 0;
      return aTime - bTime;
    });
  }, [matches]);

  const upcomingMatches = useMemo(() => {
    return sortedMatches.filter((match) => !isMatchInPlayedArchive(match));
  }, [sortedMatches]);

  const playedMatches = useMemo(() => {
    return sortedMatches
      .filter((match) => isMatchInPlayedArchive(match))
      .sort((a, b) => {
        const aTime = a.kickoff ? new Date(a.kickoff).getTime() : 0;
        const bTime = b.kickoff ? new Date(b.kickoff).getTime() : 0;
        return bTime - aTime;
      });
  }, [sortedMatches]);

  const visibleMatches = matchView === 'played' ? playedMatches : upcomingMatches;

  const tipsByPlayerAndMatch = useMemo(() => {
    const map = new Map();
    tips.forEach((tip) => {
      map.set(`${tip.playerId}_${tip.matchId}`, tip);
    });
    return map;
  }, [tips]);

  const scoreboard = useMemo(() => {
    return PLAYERS.map((player) => {
      const playerTips = tips.filter((tip) => tip.playerId === player.id);
      const correct = playerTips.filter((tip) => {
        const match = matches.find((item) => item.id === tip.matchId);
        return match?.result && tip.tip === match.result;
      }).length;

      const decided = matches.filter((match) => Boolean(match.result)).length;
      const tipped = playerTips.length;

      return {
        ...player,
        correct,
        tipped,
        decided,
      };
    }).sort((a, b) => b.correct - a.correct || b.tipped - a.tipped || a.name.localeCompare(b.name, 'cs'));
  }, [matches, tips]);

  const loadData = async () => {
    try {
      setLoading(true);

      const matchesSnapshot = await getDocs(collection(db, MATCHES_COLLECTION));
      let loadedMatches = matchesSnapshot.docs.map((item) => ({
        id: item.id,
        ...item.data(),
      }));

      if (loadedMatches.length === 0) {
        await Promise.all(
          DEFAULT_MATCHES.map((match) =>
            setDoc(doc(db, MATCHES_COLLECTION, match.id), {
              home: match.home,
              away: match.away,
              kickoff: match.kickoff,
              group: match.group,
              result: match.result || '',
              createdAt: serverTimestamp(),
              updatedAt: serverTimestamp(),
            })
          )
        );

        loadedMatches = DEFAULT_MATCHES;
      }

      const tipsSnapshot = await getDocs(collection(db, TIPS_COLLECTION));
      const loadedTips = tipsSnapshot.docs.map((item) => ({
        id: item.id,
        ...item.data(),
      }));

      setMatches(loadedMatches);
      setTips(loadedTips);
    } catch (error) {
      console.error(error);
      alert('Nepodařilo se načíst tipovačku z Firebase.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const unlockPlayer = () => {
    const expectedCode = PLAYER_CODES[loginPlayer];
    if (expectedCode && playerCode.trim().toLowerCase() === expectedCode.toLowerCase()) {
      setSelectedPlayer(loginPlayer);
      window.localStorage.setItem(PLAYER_STORAGE_KEY, loginPlayer);
      setPlayerCode('');
      return;
    }

    alert(`Špatný kód pro hráče ${loginPlayerName}.`);
  };

  const changePlayer = () => {
    window.localStorage.removeItem(PLAYER_STORAGE_KEY);
    setLoginPlayer(selectedPlayer || 'radek');
    setSelectedPlayer('');
    setPlayerCode('');
  };

  const saveTip = async (match, value) => {
    if (!playerUnlocked) {
      alert('Nejdřív se přihlas jako hráč svým kódem.');
      return;
    }

    if (isMatchLocked(match)) {
      alert('Tenhle zápas už začal. Tip nejde změnit.');
      return;
    }

    try {
      const docId = getTipDocId(selectedPlayer, match.id);
      setSavingTipId(docId);

      await setDoc(doc(db, TIPS_COLLECTION, docId), {
        playerId: selectedPlayer,
        playerName: selectedPlayerName,
        matchId: match.id,
        tip: value,
        updatedAt: serverTimestamp(),
      });

      setTips((prev) => {
        const withoutOld = prev.filter((tip) => tip.id !== docId);
        return [
          ...withoutOld,
          {
            id: docId,
            playerId: selectedPlayer,
            playerName: selectedPlayerName,
            matchId: match.id,
            tip: value,
          },
        ];
      });
    } catch (error) {
      console.error(error);
      alert('Nepodařilo se uložit tip.');
    } finally {
      setSavingTipId('');
    }
  };

  const unlockAdmin = () => {
    if (adminCode.trim() === ADMIN_CODE) {
      setAdminOpen(true);
      setAdminCode('');
      return;
    }

    alert('Špatný kód.');
  };

  const resetMatchForm = () => {
    setEditingMatchId(null);
    setMatchForm(emptyMatchForm);
  };

  const saveMatch = async (event) => {
    event.preventDefault();

    if (!matchForm.home.trim() || !matchForm.away.trim() || !matchForm.kickoff.trim()) {
      alert('Vyplň tým 1, tým 2 a začátek zápasu.');
      return;
    }

    try {
      setSavingAdmin(true);

      const payload = {
        home: matchForm.home.trim(),
        away: matchForm.away.trim(),
        kickoff: matchForm.kickoff,
        group: matchForm.group.trim(),
        updatedAt: serverTimestamp(),
      };

      if (editingMatchId) {
        await updateDoc(doc(db, MATCHES_COLLECTION, editingMatchId), payload);
      } else {
        await addDoc(collection(db, MATCHES_COLLECTION), {
          ...payload,
          result: '',
          createdAt: serverTimestamp(),
        });
      }

      resetMatchForm();
      await loadData();
    } catch (error) {
      console.error(error);
      alert('Nepodařilo se uložit zápas.');
    } finally {
      setSavingAdmin(false);
    }
  };

  const editMatch = (match) => {
    setEditingMatchId(match.id);
    setMatchForm({
      home: match.home || '',
      away: match.away || '',
      kickoff: match.kickoff || '',
      group: match.group || '',
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const setResult = async (match, result) => {
    try {
      setSavingAdmin(true);
      await updateDoc(doc(db, MATCHES_COLLECTION, match.id), {
        result,
        resultUpdatedAt: serverTimestamp(),
      });

      setMatches((prev) => prev.map((item) => item.id === match.id ? { ...item, result } : item));
    } catch (error) {
      console.error(error);
      alert('Nepodařilo se uložit výsledek.');
    } finally {
      setSavingAdmin(false);
    }
  };

  const deleteMatch = async (match) => {
    const confirmed = window.confirm(`Opravdu smazat zápas ${match.home} - ${match.away}?`);
    if (!confirmed) return;

    try {
      setSavingAdmin(true);
      await deleteDoc(doc(db, MATCHES_COLLECTION, match.id));
      if (editingMatchId === match.id) resetMatchForm();
      await loadData();
    } catch (error) {
      console.error(error);
      alert('Nepodařilo se smazat zápas.');
    } finally {
      setSavingAdmin(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#020d09] px-4 py-6 text-white md:px-6 md:py-10">
      <div className="mx-auto max-w-6xl">
        <header className="mb-8 overflow-hidden rounded-3xl border border-green-500/20 bg-[#071711] p-6 shadow-2xl shadow-green-950/30 md:p-8">
          <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="mb-3 inline-flex rounded-full bg-green-500/15 px-4 py-2 text-xs font-black uppercase tracking-[0.22em] text-green-300">
                Soukromá tipovačka
              </div>
              <h1 className="text-3xl font-black text-green-300 md:text-5xl">
                MS tipovačka
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-gray-300 md:text-base">
                Tipuje se 1 / 0 / 2. Jakmile zápas začne, tip už nejde změnit. Rozpis obsahuje skupiny i vyřazovací část MS 2026.
              </p>
            </div>

            <a
              href="/"
              className="inline-flex items-center justify-center rounded-2xl border border-green-400/30 bg-green-500/10 px-5 py-3 text-sm font-bold text-green-200 transition hover:bg-green-500/20"
            >
              ← Zpět na web
            </a>
          </div>
        </header>

        <section className="mb-8 grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="rounded-3xl border border-green-500/20 bg-[#071711] p-5 shadow-lg shadow-black/20">
            <div className="mb-3 text-sm font-black uppercase tracking-wide text-green-300">
              Kdo tipuje?
            </div>

            {playerUnlocked ? (
              <div className="rounded-2xl border border-green-400/25 bg-green-500/10 p-4">
                <div className="text-sm text-gray-300">Přihlášený hráč</div>
                <div className="mt-1 text-2xl font-black text-green-300">{selectedPlayerName}</div>
                <div className="mt-2 text-sm text-gray-400">
                  Zůstane uložený i po aktualizaci stránky.
                </div>
                <button
                  type="button"
                  onClick={changePlayer}
                  className="mt-4 rounded-xl border border-white/10 bg-white/10 px-4 py-3 text-sm font-bold text-white transition hover:bg-white/15"
                >
                  Změnit hráče
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-2">
                  {PLAYERS.map((player) => (
                    <button
                      key={player.id}
                      type="button"
                      onClick={() => setLoginPlayer(player.id)}
                      className={`rounded-2xl px-4 py-4 text-center font-black transition ${
                        loginPlayer === player.id
                          ? 'bg-green-500 text-white shadow-lg shadow-green-900/40'
                          : 'bg-white/8 text-gray-200 hover:bg-white/12'
                      }`}
                    >
                      {player.name}
                    </button>
                  ))}
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                  <label className="mb-2 block text-sm font-bold text-gray-300">
                    Kód pro {loginPlayerName}
                  </label>
                  <div className="flex flex-col gap-2 sm:flex-row">
                    <input
                      type="password"
                      value={playerCode}
                      onChange={(e) => setPlayerCode(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') unlockPlayer();
                      }}
                      placeholder="Zadej svůj kód"
                      className="min-h-[46px] flex-1 rounded-xl border border-white/10 bg-black/20 px-4 py-3 font-semibold text-white outline-none transition focus:border-green-400"
                    />
                    <button
                      type="button"
                      onClick={unlockPlayer}
                      className="rounded-xl bg-green-600 px-5 py-3 font-black text-white transition hover:bg-green-700"
                    >
                      Přihlásit
                    </button>
                  </div>
                  <div className="mt-2 text-xs text-gray-500">
                    Každý má svůj kód, takže nepůjde tipovat za ostatní.
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="rounded-3xl border border-green-500/20 bg-[#071711] p-5 shadow-lg shadow-black/20">
            <div className="mb-4 text-sm font-black uppercase tracking-wide text-green-300">
              Tabulka
            </div>
            <div className="overflow-hidden rounded-2xl border border-white/10">
              {scoreboard.map((player, index) => (
                <div
                  key={player.id}
                  className="grid grid-cols-[44px_1fr_90px_90px] items-center border-b border-white/10 bg-white/[0.04] px-4 py-3 last:border-b-0"
                >
                  <div className="text-lg font-black text-green-300">{index + 1}.</div>
                  <div className="font-bold text-white">{player.name}</div>
                  <div className="text-right text-2xl font-black text-white">{player.correct}</div>
                  <div className="text-right text-xs font-semibold text-gray-400">
                    {player.tipped} tipů
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {loading ? (
          <div className="rounded-3xl border border-green-500/20 bg-[#071711] p-10 text-center text-gray-300">
            Načítám tipovačku…
          </div>
        ) : (
          <section className="space-y-4">
            <div className="mb-4 flex flex-col gap-3 rounded-3xl border border-green-500/20 bg-[#071711] p-4 shadow-lg shadow-black/20 md:flex-row md:items-center md:justify-between">
              <div>
                <div className="text-sm font-black uppercase tracking-wide text-green-300">
                  Zápasy
                </div>
                <div className="mt-1 text-sm text-gray-400">
                  {matchView === 'played'
                    ? 'Odehrané zápasy jsou od nejnovějšího nahoře. Spadnou sem až 24 hodin po začátku.'
                    : 'Nejbližší zápas je vždy první. Zápas tady zůstane ještě 24 hodin po začátku.'}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 rounded-2xl bg-black/20 p-1">
                <button
                  type="button"
                  onClick={() => setMatchView('upcoming')}
                  className={`rounded-xl px-4 py-3 text-sm font-black transition ${
                    matchView === 'upcoming'
                      ? 'bg-green-500 text-white shadow-lg shadow-green-900/30'
                      : 'text-gray-300 hover:bg-white/10'
                  }`}
                >
                  Nadcházející ({upcomingMatches.length})
                </button>
                <button
                  type="button"
                  onClick={() => setMatchView('played')}
                  className={`rounded-xl px-4 py-3 text-sm font-black transition ${
                    matchView === 'played'
                      ? 'bg-green-500 text-white shadow-lg shadow-green-900/30'
                      : 'text-gray-300 hover:bg-white/10'
                  }`}
                >
                  Odehrané ({playedMatches.length})
                </button>
              </div>
            </div>

            {visibleMatches.length > 0 ? (
              visibleMatches.map((match) => {
                const locked = isMatchLocked(match);
                const currentTip = tipsByPlayerAndMatch.get(getTipDocId(selectedPlayer, match.id));
                const savingThis = savingTipId === getTipDocId(selectedPlayer, match.id);
                const playerTips = PLAYERS.map((player) => {
                  const tip = tipsByPlayerAndMatch.get(getTipDocId(player.id, match.id));
                  const isCorrect = Boolean(match.result && tip?.tip === match.result);
                  const isWrong = Boolean(match.result && tip?.tip && tip.tip !== match.result);

                  return {
                    ...player,
                    tip: tip?.tip || '',
                    isCorrect,
                    isWrong,
                  };
                });
                const showPlayerTips = locked || adminOpen || Boolean(match.result);

                return (
                  <div
                    key={match.id}
                    className={`rounded-3xl border p-5 shadow-lg shadow-black/20 ${
                      locked
                        ? 'border-white/10 bg-[#0b1713]'
                        : 'border-green-500/25 bg-[#071711]'
                    }`}
                  >
                    <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                      <div className="min-w-0">
                        <div className="mb-2 flex flex-wrap items-center gap-2">
                          {match.group && (
                            <span className="rounded-full bg-green-500/15 px-3 py-1 text-xs font-bold uppercase text-green-300">
                              {match.group}
                            </span>
                          )}
                          <span className={`rounded-full px-3 py-1 text-xs font-bold ${locked ? 'bg-gray-700 text-gray-200' : 'bg-green-600 text-white'}`}>
                            {locked ? 'Uzamčeno' : 'Lze tipovat'}
                          </span>
                          {match.result && (
                            <span className="rounded-full bg-yellow-500/15 px-3 py-1 text-xs font-bold text-yellow-200">
                              Výsledek: {match.result}
                            </span>
                          )}
                        </div>

                        <h2 className="text-xl font-black text-white md:text-2xl">
                          {match.home} <span className="text-green-300">vs.</span> {match.away}
                        </h2>
                        <div className="mt-2 text-sm font-semibold text-gray-400">
                          Začátek: {formatKickoff(match.kickoff)}
                        </div>
                      </div>

                      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                        <div className="text-sm text-gray-400 sm:text-right">
                          Tipuje: <span className="font-bold text-green-300">{playerUnlocked ? selectedPlayerName : 'nepřihlášen'}</span>
                          {currentTip?.tip && (
                            <div>
                              Aktuální tip: <span className="font-black text-white">{currentTip.tip}</span>
                            </div>
                          )}
                        </div>

                        <div className="flex gap-2">
                          {tipOptions.map((option) => (
                            <button
                              key={option.value}
                              type="button"
                              disabled={!playerUnlocked || locked || savingThis}
                              onClick={() => saveTip(match, option.value)}
                              title={option.help}
                              className={`h-12 w-12 rounded-2xl text-lg font-black transition ${
                                currentTip?.tip === option.value
                                  ? 'bg-green-500 text-white shadow-lg shadow-green-900/40'
                                  : !playerUnlocked || locked
                                  ? 'cursor-not-allowed bg-white/5 text-gray-500'
                                  : 'bg-white/10 text-white hover:bg-green-600'
                              }`}
                            >
                              {option.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="mt-5 rounded-2xl border border-white/10 bg-black/20 p-4">
                      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                        <div className="text-sm font-black uppercase tracking-wide text-green-300">
                          Tipy hráčů
                        </div>
                        {!showPlayerTips && (
                          <div className="text-xs font-semibold text-gray-400">
                            Zobrazí se až po začátku zápasu
                          </div>
                        )}
                      </div>

                      {showPlayerTips ? (
                        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
                          {playerTips.map((playerTip) => (
                            <div
                              key={`${match.id}-${playerTip.id}`}
                              className={`rounded-2xl border px-4 py-3 ${
                                playerTip.isCorrect
                                  ? 'border-green-400/40 bg-green-500/15'
                                  : playerTip.isWrong
                                  ? 'border-red-400/40 bg-red-500/15'
                                  : 'border-white/10 bg-white/[0.04]'
                              }`}
                            >
                              <div className="text-xs font-bold uppercase tracking-wide text-gray-400">
                                {playerTip.name}
                              </div>
                              <div className="mt-1 flex items-center gap-2">
                                <span className="text-2xl font-black text-white">
                                  {playerTip.tip || '—'}
                                </span>
                                {playerTip.isCorrect && (
                                  <span className="rounded-full bg-green-500 px-2 py-0.5 text-xs font-black text-white">
                                    +1
                                  </span>
                                )}
                                {playerTip.isWrong && (
                                  <span className="rounded-full bg-red-500 px-2 py-0.5 text-xs font-black text-white">
                                    0
                                  </span>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
                          {PLAYERS.map((player) => (
                            <div key={`${match.id}-hidden-${player.id}`} className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3">
                              <div className="text-xs font-bold uppercase tracking-wide text-gray-400">
                                {player.name}
                              </div>
                              <div className="mt-1 text-sm font-bold text-gray-500">
                                skryto
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="rounded-3xl border border-green-500/20 bg-[#071711] p-8 text-center text-gray-300">
                {matchView === 'played'
                  ? 'Zatím tu nejsou žádné odehrané zápasy.'
                  : 'Zatím tu nejsou žádné nadcházející zápasy.'}
              </div>
            )}
          </section>
        )}

        <section className="mt-10 rounded-3xl border border-white/10 bg-[#071711] p-5">
          {!adminOpen ? (
            <div className="flex flex-col gap-3 md:flex-row md:items-end">
              <div className="flex-1">
                <label className="mb-2 block text-sm font-bold text-gray-300">Správa výsledků a zápasů</label>
                <input
                  type="password"
                  value={adminCode}
                  onChange={(event) => setAdminCode(event.target.value)}
                  placeholder="Zadej kód správce"
                  className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none focus:border-green-400"
                />
              </div>
              <button
                type="button"
                onClick={unlockAdmin}
                className="rounded-2xl bg-green-600 px-6 py-3 font-black text-white transition hover:bg-green-500"
              >
                Odemknout
              </button>
            </div>
          ) : (
            <div className="space-y-8">
              <div>
                <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <div>
                    <div className="text-sm font-black uppercase tracking-wide text-green-300">Admin</div>
                    <h2 className="text-2xl font-black text-white">Zápasy a výsledky</h2>
                  </div>
                  <button
                    type="button"
                    onClick={() => setAdminOpen(false)}
                    className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 font-bold text-gray-200 hover:bg-white/10"
                  >
                    Zamknout správu
                  </button>
                </div>

                <form onSubmit={saveMatch} className="grid gap-3 rounded-3xl border border-white/10 bg-black/20 p-4 md:grid-cols-2 lg:grid-cols-[1fr_1fr_1fr_1fr_auto]">
                  <input
                    type="text"
                    value={matchForm.home}
                    onChange={(event) => setMatchForm((prev) => ({ ...prev, home: event.target.value }))}
                    placeholder="Tým 1"
                    className="rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none focus:border-green-400"
                  />
                  <input
                    type="text"
                    value={matchForm.away}
                    onChange={(event) => setMatchForm((prev) => ({ ...prev, away: event.target.value }))}
                    placeholder="Tým 2"
                    className="rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none focus:border-green-400"
                  />
                  <input
                    type="datetime-local"
                    value={matchForm.kickoff}
                    onChange={(event) => setMatchForm((prev) => ({ ...prev, kickoff: event.target.value }))}
                    className="rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none focus:border-green-400"
                  />
                  <input
                    type="text"
                    value={matchForm.group}
                    onChange={(event) => setMatchForm((prev) => ({ ...prev, group: event.target.value }))}
                    placeholder="Skupina / kolo"
                    className="rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none focus:border-green-400"
                  />
                  <div className="flex gap-2">
                    <button
                      type="submit"
                      disabled={savingAdmin}
                      className="rounded-2xl bg-green-600 px-5 py-3 font-black text-white transition hover:bg-green-500 disabled:bg-gray-600"
                    >
                      {editingMatchId ? 'Uložit' : 'Přidat'}
                    </button>
                    {editingMatchId && (
                      <button
                        type="button"
                        onClick={resetMatchForm}
                        className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 font-bold text-gray-200 hover:bg-white/10"
                      >
                        Zrušit
                      </button>
                    )}
                  </div>
                </form>
              </div>

              <div className="space-y-3">
                {sortedMatches.map((match) => (
                  <div key={`admin-${match.id}`} className="rounded-3xl border border-white/10 bg-black/20 p-4">
                    <div className="mb-4 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                      <div>
                        <div className="text-lg font-black text-white">{match.home} - {match.away}</div>
                        <div className="text-sm text-gray-400">{formatKickoff(match.kickoff)}</div>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => editMatch(match)}
                          className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-bold text-gray-200 hover:bg-white/10"
                        >
                          Upravit
                        </button>
                        <button
                          type="button"
                          onClick={() => deleteMatch(match)}
                          className="rounded-xl bg-red-600 px-4 py-2 text-sm font-bold text-white hover:bg-red-500"
                        >
                          Smazat
                        </button>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <span className="mr-2 text-sm font-bold text-gray-300">Správný výsledek:</span>
                      {[...tipOptions, { value: '', label: 'Vymazat', help: 'bez výsledku' }].map((option) => (
                        <button
                          key={`result-${match.id}-${option.value || 'empty'}`}
                          type="button"
                          onClick={() => setResult(match, option.value)}
                          disabled={savingAdmin}
                          className={`rounded-xl px-4 py-2 text-sm font-black transition ${
                            match.result === option.value
                              ? 'bg-green-500 text-white'
                              : 'bg-white/10 text-white hover:bg-white/15'
                          }`}
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
