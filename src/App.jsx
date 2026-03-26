import { useState } from 'react';

export default function AskLipuvkaWeb() {
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [selectedNews, setSelectedNews] = useState(null);

  const today = new Date();
  const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());

  // 🆕 NOVINKY (detail + galerie + TOP)
  const news = [
    {
      title: 'Otevření nové hospody 🍺',
      text: 'Na Zelený čtvrtek (2.4.) otevíráme novou hospodu na hřišti. Přijďte na zelené pivo 🍀',
      date: '2. 4. 2026',
      images: ['/field.png', '/field.png'],
      top: true,
    },
    {
      title: 'Nové tréninkové pomůcky',
      text: 'Na hřiště byly pořízeny nové tréninkové pomůcky pro mládež.',
      date: '20. 3. 2026',
      images: ['/field.png'],
      top: false,
    },
  ];

  const matches = [
    {
      date: '15. 3. 2026',
      opponent: 'Halový turnaj Blansko',
      time: '---',
      home: false,
      result: '1. místo v turnaji',
      article: 'Skvělý výkon našich hráčů a zasloužené vítězství.',
      photos: ['/zapasy/blansko1.jpg', '/zapasy/blansko2.jpg'],
    },
    {
      date: '2. 4. 2026',
      opponent: 'RDR RJY/RJ',
      time: '17:00 / 18:00',
      home: true,
      result: 'doplnit',
      article: '',
      photos: ['/field.png'],
    },
  ];

  const parseMatchDate = (dateString) => {
    const [d, m, y] = dateString.split('.').map((x) => x.trim());
    return new Date(y, m - 1, d);
  };

  const upcomingMatches = matches.filter((m) => parseMatchDate(m.date) >= todayStart);
  const playedMatches = matches.filter((m) => parseMatchDate(m.date) < todayStart);

  const renderMatchCard = (m, showResult = true) => (
    <button
      key={m.date}
      onClick={() => setSelectedMatch(m)}
      className="w-full rounded-xl border p-4 text-left hover:shadow"
    >
      <div className="font-bold">ASK Lipůvka vs. {m.opponent}</div>
      <div className="text-sm text-gray-500">{m.date} • {m.time}</div>
      {showResult && <div className="mt-2 text-sm">Výsledek: {m.result}</div>}
    </button>
  );

  const sortedNews = [...news].sort((a, b) => (b.top ? 1 : 0) - (a.top ? 1 : 0));

  return (
    <div className="p-6 space-y-10">

      {/* ZÁPASY */}
      <section>
        <h2 className="text-2xl font-bold text-green-600">Nadcházející zápasy</h2>
        <div className="space-y-3 mt-4">
          {upcomingMatches.map((m) => renderMatchCard(m, false))}
        </div>
      </section>

      {/* 🆕 NOVINKY */}
      <section>
        <h2 className="text-2xl font-bold text-green-600">Novinky</h2>
        <div className="space-y-4 mt-4">
          {sortedNews.map((n, i) => (
            <button
              key={i}
              onClick={() => setSelectedNews(n)}
              className={`w-full text-left rounded-xl p-4 transition hover:shadow ${n.top ? 'bg-green-100 border-2 border-green-500' : 'bg-gray-100'}`}
            >
              <div className="flex gap-4 items-start">
                <img src={n.images[0]} alt="" className="w-24 h-24 object-cover rounded-lg" />
                <div>
                  <div className="text-sm text-gray-500">{n.date}</div>
                  <div className="font-bold text-lg">{n.title}</div>
                  <div className="text-gray-700">{n.text}</div>
                </div>
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* ODEHRANÉ */}
      <section>
        <h2 className="text-2xl font-bold text-green-600">Odehrané zápasy</h2>
        <div className="space-y-3 mt-4">
          {playedMatches.map((m) => renderMatchCard(m, true))}
        </div>
      </section>

      {/* DETAIL ZÁPASU */}
      {selectedMatch && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center" onClick={() => setSelectedMatch(null)}>
          <div className="bg-white p-6 rounded-xl max-w-xl" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-xl font-bold">ASK Lipůvka vs. {selectedMatch.opponent}</h2>
            <p className="mt-2">{selectedMatch.article || 'Komentář bude doplněn'}</p>

            <div className="flex gap-2 overflow-x-auto mt-4">
              {selectedMatch.photos.map((p, i) => (
                <img key={i} src={p} className="h-40 rounded-lg" />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* DETAIL NOVINKY */}
      {selectedNews && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center" onClick={() => setSelectedNews(null)}>
          <div className="bg-white p-6 rounded-xl max-w-xl w-full" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-xl font-bold">{selectedNews.title}</h2>
            <div className="text-sm text-gray-500 mt-1">{selectedNews.date}</div>
            <p className="mt-3 text-gray-700">{selectedNews.text}</p>

            {/* swipe galerie */}
            <div className="flex gap-3 overflow-x-auto mt-4 pb-2">
              {selectedNews.images.map((img, i) => (
                <img key={i} src={img} className="h-44 rounded-xl" />
              ))}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
