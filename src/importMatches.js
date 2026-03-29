import { db } from "./firebase";
import { collection, addDoc, getDocs } from "firebase/firestore";

const matches = [
  {
    category: "mladsi-pripravka",
    date: "15. 3. 2026",
    opponent: "Halový turnaj Blansko",
    time: "---",
    home: false,
    venue: "Blansko",
    result: "1. místo v turnaji",
    articleTitle: "Halový turnaj Blansko",
    article:
      "Naši nejmenší fotbalisté odehráli poslední halový turnaj zimní přípravy. Ve všech zápasech prokázali bojovnost a fotbalové srdce. Nakonec se probojovali do finále, kdy rozhodujícím gólem Tobíka Hudce v posledních minutách vybojovali krásné první místo. Děkujeme hráčům a v neposlední řadě rodičům za podporu.",
    photos: ["/zapasy/blansko1.jpg", "/zapasy/blansko2.jpg"],
  },
  {
    category: "mladsi-pripravka",
    date: "2. 4. 2026",
    opponent: "RDR RJY/RJ",
    time: "17:00 / 18:00",
    home: true,
    venue: "Lipůvka",
    result: "doplnit",
    articleTitle: "",
    article: "",
    photos: ["/field.png"],
  },
  {
    category: "mladsi-pripravka",
    date: "9. 4. 2026",
    opponent: "RDR DX/D",
    time: "17:00 / 18:00",
    home: true,
    venue: "Lipůvka",
    result: "doplnit",
    articleTitle: "",
    article: "",
    photos: ["/field.png"],
  },
  {
    category: "mladsi-pripravka",
    date: "14. 4. 2026",
    opponent: "Olomučany/Babice",
    time: "17:00 / 18:00",
    home: false,
    venue: "hřiště Olomučany",
    result: "doplnit",
    articleTitle: "",
    article: "",
    photos: ["/field.png"],
  },
  {
    category: "mladsi-pripravka",
    date: "23. 4. 2026",
    opponent: "Ostrov/Lipovec",
    time: "17:00 / 18:00",
    home: true,
    venue: "Lipůvka",
    result: "doplnit",
    articleTitle: "",
    article: "",
    photos: ["/field.png"],
  },
  {
    category: "mladsi-pripravka",
    date: "30. 4. 2026",
    opponent: "Blansko C + (pozveme 1 tým)",
    time: "17:00 / 18:00",
    home: true,
    venue: "Lipůvka",
    result: "doplnit",
    articleTitle: "",
    article: "",
    photos: ["/field.png"],
  },
  {
    category: "mladsi-pripravka",
    date: "12. 5. 2026",
    opponent: "Kras",
    time: "17:00 / 18:00",
    home: false,
    venue: "hřiště Jedovnice",
    result: "doplnit",
    articleTitle: "",
    article: "",
    photos: ["/field.png"],
  },
  {
    category: "mladsi-pripravka",
    date: "14. 5. 2026",
    opponent: "Blansko A a B",
    time: "17:00 / 18:00",
    home: true,
    venue: "Lipůvka",
    result: "doplnit",
    articleTitle: "",
    article: "",
    photos: ["/field.png"],
  },
  {
    category: "mladsi-pripravka",
    date: "24. 5. 2026",
    opponent: "Knínice",
    time: "10:15",
    home: false,
    venue: "hřiště Knínice",
    result: "doplnit",
    articleTitle: "",
    article: "",
    photos: ["/field.png"],
  },
  {
    category: "mladsi-pripravka",
    date: "28. 5. 2026",
    opponent: "Boskovice",
    time: "17:00 / 18:00",
    home: true,
    venue: "Lipůvka",
    result: "doplnit",
    articleTitle: "",
    article: "",
    photos: ["/field.png"],
  },
  {
    category: "mladsi-pripravka",
    date: "4. 6. 2026",
    opponent: "Letovice",
    time: "16:30 / 17:30",
    home: false,
    venue: "hřiště Letovice",
    result: "doplnit",
    articleTitle: "",
    article: "",
    photos: ["/field.png"],
  },
  {
    category: "mladsi-pripravka",
    date: "14. 6. 2026",
    opponent: "RDR/RY + závěrečná",
    time: "14:00 / 15:00",
    home: true,
    venue: "Lipůvka",
    result: "doplnit",
    articleTitle: "",
    article: "",
    photos: ["/field.png"],
  },
];

export async function importMatchesOnce() {
  const snapshot = await getDocs(collection(db, "matches"));

  if (!snapshot.empty) {
    alert("Kolekce matches už obsahuje data. Import se neprovedl.");
    return;
  }

  for (const match of matches) {
    await addDoc(collection(db, "matches"), {
      ...match,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  }

  alert("Zápasy byly úspěšně importovány do Firebase.");
}