import { useEffect, useState } from "react";
import { db } from "./firebase";
import {
  collection,
  getDocs,
  updateDoc,
  doc,
  setDoc,
} from "firebase/firestore";

export default function Admin() {
  const [mode, setMode] = useState("matches");
  const [category, setCategory] = useState("mladsi-pripravka");

  const [matches, setMatches] = useState([]);
  const [news, setNews] = useState({});
  const [gallery, setGallery] = useState([]);

  const [loading, setLoading] = useState(true);
  const [savingMatchId, setSavingMatchId] = useState(null);
  const [savingNews, setSavingNews] = useState(false);

  const categories = [
    { id: "predpripravka", label: "Předpřípravka" },
    { id: "mladsi-pripravka", label: "Mladší přípravka" },
    { id: "starsi-pripravka", label: "Starší přípravka" },
  ];

  // 🔄 LOAD
  const loadData = async () => {
    try {
      setLoading(true);

      const matchesSnap = await getDocs(collection(db, "matches"));
      const newsSnap = await getDocs(collection(db, "news"));
      const gallerySnap = await getDocs(collection(db, "gallery"));

      const matchesData = matchesSnap.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      }));

      const newsData = {};
      newsSnap.docs.forEach((d) => {
        newsData[d.id] = d.data();
      });

      const galleryData = gallerySnap.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      }));

      setMatches(matchesData);
      setNews(newsData);
      setGallery(galleryData);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // 🔧 UPDATE MATCH
  const updateMatch = async (id, field, value) => {
    try {
      setSavingMatchId(id);

      await updateDoc(doc(db, "matches", id), {
        [field]: value,
      });

      setMatches((prev) =>
        prev.map((m) =>
          m.id === id ? { ...m, [field]: value } : m
        )
      );
    } catch (e) {
      console.error(e);
    } finally {
      setSavingMatchId(null);
    }
  };

  // 📰 UPDATE NEWS
  const saveNews = async () => {
    try {
      setSavingNews(true);

      const current = news[category];

      await setDoc(doc(db, "news", category), current);

      alert("Uloženo");
    } catch (e) {
      console.error(e);
      alert("Chyba");
    } finally {
      setSavingNews(false);
    }
  };

  const updateNewsField = (field, value) => {
    setNews((prev) => ({
      ...prev,
      [category]: {
        ...prev[category],
        [field]: value,
      },
    }));
  };

  const filteredMatches = matches.filter(
    (m) => m.category === category
  );

  if (loading) {
    return (
      <div className="p-10 text-center text-gray-600">
        Načítám admin...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="mx-auto max-w-5xl">
        <h1 className="mb-6 text-3xl font-bold text-green-600">
          Admin ASK Lipůvka
        </h1>

        {/* MENU */}
        <div className="mb-6 flex gap-3">
          <button
            onClick={() => setMode("matches")}
            className={`rounded-xl px-4 py-2 ${
              mode === "matches"
                ? "bg-green-600 text-white"
                : "bg-white"
            }`}
          >
            Zápasy
          </button>

          <button
            onClick={() => setMode("news")}
            className={`rounded-xl px-4 py-2 ${
              mode === "news"
                ? "bg-green-600 text-white"
                : "bg-white"
            }`}
          >
            Novinky
          </button>
        </div>

        {/* CATEGORY */}
        <div className="mb-6 flex gap-2">
          {categories.map((c) => (
            <button
              key={c.id}
              onClick={() => setCategory(c.id)}
              className={`rounded-xl px-4 py-2 ${
                category === c.id
                  ? "bg-green-600 text-white"
                  : "bg-white"
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>

        {/* MATCHES */}
        {mode === "matches" && (
          <div className="space-y-4">
            {filteredMatches.map((m) => (
              <div
                key={m.id}
                className="rounded-xl bg-white p-4 shadow"
              >
                <div className="font-bold">
                  {m.date} – {m.opponent}
                </div>

                <div className="mt-3 grid gap-3 md:grid-cols-3">
                  <input
                    value={m.time || ""}
                    onChange={(e) =>
                      updateMatch(m.id, "time", e.target.value)
                    }
                    placeholder="čas"
                    className="rounded border p-2"
                  />

                  <input
                    value={m.result || ""}
                    onChange={(e) =>
                      updateMatch(m.id, "result", e.target.value)
                    }
                    placeholder="výsledek"
                    className="rounded border p-2"
                  />

                  <input
                    value={m.venue || ""}
                    onChange={(e) =>
                      updateMatch(m.id, "venue", e.target.value)
                    }
                    placeholder="hřiště"
                    className="rounded border p-2"
                  />
                </div>

                {savingMatchId === m.id && (
                  <div className="mt-2 text-sm text-gray-500">
                    Ukládám...
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* NEWS */}
        {mode === "news" && (
          <div className="rounded-xl bg-white p-6 shadow">
            <input
              value={news[category]?.title || ""}
              onChange={(e) =>
                updateNewsField("title", e.target.value)
              }
              placeholder="Nadpis"
              className="mb-3 w-full rounded border p-3"
            />

            <textarea
              value={news[category]?.text || ""}
              onChange={(e) =>
                updateNewsField("text", e.target.value)
              }
              placeholder="Text"
              rows="5"
              className="mb-3 w-full rounded border p-3"
            />

            <input
              value={news[category]?.date || ""}
              onChange={(e) =>
                updateNewsField("date", e.target.value)
              }
              placeholder="Datum"
              className="mb-4 w-full rounded border p-3"
            />

            <button
              onClick={saveNews}
              className="rounded-xl bg-green-600 px-6 py-3 text-white"
            >
              {savingNews ? "Ukládám..." : "Uložit"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}