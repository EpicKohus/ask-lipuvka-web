import { useEffect, useMemo, useState } from "react";
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
  const [loading, setLoading] = useState(true);
  const [savingNews, setSavingNews] = useState(false);
  const [savingMatchId, setSavingMatchId] = useState(null);

  const categories = [
    { id: "predpripravka", label: "Předpřípravka" },
    { id: "mladsi-pripravka", label: "Mladší přípravka" },
    { id: "starsi-pripravka", label: "Starší přípravka" },
  ];

  const loadData = async () => {
    try {
      setLoading(true);

      const matchSnap = await getDocs(collection(db, "matches"));
      const matchData = matchSnap.docs.map((item) => ({
        id: item.id,
        ...item.data(),
      }));

      const newsSnap = await getDocs(collection(db, "news"));
      const newsData = {};
      newsSnap.docs.forEach((item) => {
        newsData[item.id] = item.data();
      });

      setMatches(matchData);
      setNews(newsData);
    } catch (error) {
      console.error(error);
      alert("Chyba při načítání dat.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const parseMatchDate = (dateString) => {
    if (!dateString) return new Date(0);

    const parts = dateString
      .split(".")
      .map((part) => part.trim())
      .filter(Boolean);

    if (parts.length < 3) return new Date(0);

    const [day, month, year] = parts;
    return new Date(Number(year), Number(month) - 1, Number(day));
  };

  const filteredMatches = useMemo(() => {
    return matches
      .filter((m) => m.category === category)
      .sort((a, b) => parseMatchDate(a.date) - parseMatchDate(b.date));
  }, [matches, category]);

  const updateMatchLocal = (id, field, value) => {
    setMatches((prev) =>
      prev.map((m) => (m.id === id ? { ...m, [field]: value } : m))
    );
  };

  const saveMatch = async (match) => {
    try {
      setSavingMatchId(match.id);

      await updateDoc(doc(db, "matches", match.id), {
        ...match,
        photos: Array.isArray(match.photos)
          ? match.photos
          : String(match.photos || "")
              .split(",")
              .map((item) => item.trim())
              .filter(Boolean),
        updatedAt: new Date().toISOString(),
      });

      alert("Zápas uložen.");
      await loadData();
    } catch (error) {
      console.error(error);
      alert("Chyba při ukládání zápasu.");
    } finally {
      setSavingMatchId(null);
    }
  };

  const updateNewsLocal = (field, value) => {
    setNews((prev) => ({
      ...prev,
      [category]: {
        ...prev[category],
        [field]: value,
      },
    }));
  };

  const saveNews = async () => {
    try {
      setSavingNews(true);

      const data = news[category] || {};

      await setDoc(doc(db, "news", category), {
        category,
        title: data.title || "",
        text: data.text || "",
        date: data.date || "",
        updatedAt: new Date().toISOString(),
      });

      alert("Novinka uložena.");
      await loadData();
    } catch (error) {
      console.error(error);
      alert("Chyba při ukládání novinky.");
    } finally {
      setSavingNews(false);
    }
  };

  const activeNews = news[category] || {};

  const tabButton = (active) =>
    `rounded-xl px-5 py-3 font-semibold transition ${
      active
        ? "bg-green-600 text-white shadow-sm"
        : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
    }`;

  const categoryButton = (active) =>
    `rounded-xl px-4 py-2 font-semibold transition ${
      active
        ? "bg-green-100 text-green-700 border border-green-300"
        : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
    }`;

  const inputClass =
    "w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-gray-900 placeholder:text-gray-400 outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100";

  const textareaClass =
    "w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-gray-900 placeholder:text-gray-400 outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100";

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 px-4 py-10">
        <div className="mx-auto max-w-6xl rounded-3xl bg-white p-8 shadow-sm">
          <h1 className="text-3xl font-black text-green-600">Admin panel</h1>
          <p className="mt-3 text-gray-600">Načítám data…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 px-4 py-10">
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="rounded-3xl bg-white p-8 shadow-sm">
          <h1 className="text-4xl font-black text-green-600">Admin panel</h1>
          <p className="mt-3 text-gray-600">
            Správa novinek a zápasů pro mládež ASK Lipůvka
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => setMode("matches")}
            className={tabButton(mode === "matches")}
          >
            Zápasy
          </button>

          <button
            type="button"
            onClick={() => setMode("news")}
            className={tabButton(mode === "news")}
          >
            Novinky
          </button>
        </div>

        <div className="flex flex-wrap gap-3">
          {categories.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setCategory(item.id)}
              className={categoryButton(category === item.id)}
            >
              {item.label}
            </button>
          ))}
        </div>

        {mode === "news" && (
          <div className="rounded-3xl bg-white p-8 shadow-sm">
            <h2 className="mb-6 text-2xl font-bold text-green-600">
              Novinka pro tým
            </h2>

            <div className="grid gap-5">
              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700">
                  Nadpis
                </label>
                <input
                  value={activeNews.title || ""}
                  onChange={(e) => updateNewsLocal("title", e.target.value)}
                  placeholder="Nadpis novinky"
                  className={inputClass}
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700">
                  Text
                </label>
                <textarea
                  value={activeNews.text || ""}
                  onChange={(e) => updateNewsLocal("text", e.target.value)}
                  placeholder="Text novinky"
                  rows={6}
                  className={textareaClass}
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700">
                  Datum
                </label>
                <input
                  value={activeNews.date || ""}
                  onChange={(e) => updateNewsLocal("date", e.target.value)}
                  placeholder="např. 2. 4. 2026"
                  className={inputClass}
                />
              </div>

              <div>
                <button
                  type="button"
                  onClick={saveNews}
                  disabled={savingNews}
                  className={`rounded-xl px-6 py-3 font-semibold text-white transition ${
                    savingNews
                      ? "cursor-not-allowed bg-gray-400"
                      : "bg-green-600 hover:bg-green-700"
                  }`}
                >
                  {savingNews ? "Ukládám..." : "Uložit novinku"}
                </button>
              </div>

              <p className="text-sm text-gray-500">
                Pro každý tým se ukládá vždy jen jedna aktuální novinka. Nové
                uložení starou novinku přepíše.
              </p>
            </div>
          </div>
        )}

        {mode === "matches" && (
          <div className="space-y-5">
            {filteredMatches.length === 0 ? (
              <div className="rounded-3xl bg-white p-8 text-gray-600 shadow-sm">
                Pro tuto kategorii zatím nejsou v databázi žádné zápasy.
              </div>
            ) : (
              filteredMatches.map((match) => (
                <div
                  key={match.id}
                  className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm"
                >
                  <div className="mb-5 flex flex-col gap-3 border-b border-gray-200 pb-4 md:flex-row md:items-center md:justify-between">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900">
                        {match.home
                          ? `ASK Lipůvka vs. ${match.opponent || "Soupeř"}`
                          : `${match.opponent || "Soupeř"} vs. ASK Lipůvka`}
                      </h2>

                      <div className="mt-2 text-sm text-gray-600">
                        {match.date || "Bez data"} • {match.time || "Bez času"} •{" "}
                        {match.home ? "Domácí" : "Venkovní"}
                      </div>

                      <div className="mt-1 text-sm text-gray-600">
                        Místo: {match.venue || "není doplněno"}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => saveMatch(match)}
                      disabled={savingMatchId === match.id}
                      className={`rounded-xl px-5 py-3 font-semibold text-white transition ${
                        savingMatchId === match.id
                          ? "cursor-not-allowed bg-gray-400"
                          : "bg-green-600 hover:bg-green-700"
                      }`}
                    >
                      {savingMatchId === match.id ? "Ukládám..." : "Uložit"}
                    </button>
                  </div>

                  <div className="grid gap-5">
                    <div>
                      <label className="mb-2 block text-sm font-semibold text-gray-700">
                        Výsledek
                      </label>
                      <input
                        value={match.result || ""}
                        onChange={(e) =>
                          updateMatchLocal(match.id, "result", e.target.value)
                        }
                        placeholder="např. 1. místo v turnaji"
                        className={inputClass}
                      />
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-semibold text-gray-700">
                        Titulek článku
                      </label>
                      <input
                        value={match.articleTitle || ""}
                        onChange={(e) =>
                          updateMatchLocal(match.id, "articleTitle", e.target.value)
                        }
                        placeholder="např. Halový turnaj Blansko"
                        className={inputClass}
                      />
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-semibold text-gray-700">
                        Článek k zápasu
                      </label>
                      <textarea
                        value={match.article || ""}
                        onChange={(e) =>
                          updateMatchLocal(match.id, "article", e.target.value)
                        }
                        placeholder="Sem napiš článek k zápasu"
                        rows={6}
                        className={textareaClass}
                      />
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-semibold text-gray-700">
                        Fotky
                      </label>
                      <input
                        value={
                          Array.isArray(match.photos)
                            ? match.photos.join(",")
                            : match.photos || ""
                        }
                        onChange={(e) =>
                          updateMatchLocal(
                            match.id,
                            "photos",
                            e.target.value
                              .split(",")
                              .map((item) => item.trim())
                              .filter(Boolean)
                          )
                        }
                        placeholder="/zapasy/blansko1.jpg,/zapasy/blansko2.jpg"
                        className={inputClass}
                      />
                      <p className="mt-2 text-sm text-gray-500">
                        Cesty k fotkám odděluj čárkou.
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}