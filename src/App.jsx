import { useEffect, useState } from 'react';

export default function AskLipuvkaWeb() {
  const [isRegistrationOpen, setIsRegistrationOpen] = useState(false);
  const [isContactsOpen, setIsContactsOpen] = useState(false);
  const [selectedMatch, setSelectedMatch] = useState(null);

  const today = new Date();
  const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());

  const matches = [
    {
      date: '15. 3. 2026',
      opponent: 'Halový turnaj Blansko',
      time: '---',
      home: false,
      result: '1. místo v turnaji',
      articleTitle: 'Halový turnaj Blansko',
      article:
        'Naši nejmenší fotbalisté odehráli poslední halový turnaj zimní přípravy...',
      photos: ['/zapasy/blansko1.jpg', '/zapasy/blansko2.jpg'],
    },
    {
      date: '2. 4. 2026',
      opponent: 'RDR RJY/RJ',
      time: '17:00 / 18:00',
      home: true,
      result: 'doplnit',
      articleTitle: '',
      article: '',
      photos: ['/field.png'],
    },
  ];

  const parseMatchDate = (dateString) => {
    const [d, m, y] = dateString.split('.').map((x) => x.trim());
    return new Date(y, m - 1, d);
  };

  const isSameDay = (a, b) =>
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate();

  const upcomingMatches = matches.filter((m) => parseMatchDate(m.date) >= todayStart);
  const playedMatches = matches.filter((m) => parseMatchDate(m.date) < todayStart);

  useEffect(() => {
    const esc = (e) => {
      if (e.key === 'Escape') {
        setIsRegistrationOpen(false);
        setIsContactsOpen(false);
        setSelectedMatch(null);
      }
    };
    window.addEventListener('keydown', esc);
    return () => window.removeEventListener('keydown', esc);
  }, []);

  const renderMatchCard = (m, showResult = true) => {
    const isToday = isSameDay(parseMatchDate(m.date), todayStart);

    return (
      <button
        key={m.date}
        onClick={() => setSelectedMatch(m)}
        className={`w-full rounded-2xl border p-5 text-left ${
          isToday ? 'border-green-500 bg-green-50' : 'bg-white'
        }`}
      >
        <div className="flex justify-between">
          <div>
            <div className="font-bold">
              ASK Lipůvka vs. {m.opponent}
              {isToday && <span className="ml-2 text-green-600">DNES</span>}
            </div>
            <div className="text-sm text-gray-500">
              {m.date} • {m.time}
            </div>
          </div>

          {showResult && (
            <div className="text-sm">Výsledek: {m.result}</div>
          )}
        </div>
      </button>
    );
  };

  return (
    <div className="min-h-screen bg-white p-6">

      <h1 className="text-3xl font-bold text-green-600 mb-6">
        ASK Lipůvka
      </h1>

      {/* ZÁPASY */}
      <section>
        <h2 className="text-xl font-bold mb-4">Nadcházející zápasy</h2>
        <div className="space-y-3">
          {upcomingMatches.map((m) => renderMatchCard(m, false))}
        </div>
      </section>

      <section className="mt-10">
        <h2 className="text-xl font-bold mb-4">Odehrané zápasy</h2>
        <div className="space-y-3">
          {playedMatches.map((m) => renderMatchCard(m, true))}
        </div>
      </section>

      {/* KONTAKTY */}
      {isContactsOpen && (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center">
          <div className="bg-white p-6 rounded-xl max-w-2xl w-full overflow-y-auto max-h-[80vh]">

            <h2 className="text-2xl font-bold mb-4">Kontakty</h2>

            <div className="grid gap-4 md:grid-cols-2">

              <div className="rounded-xl bg-gray-100 p-4">
                <div className="font-bold">Zdenko Adámek</div>
                <a href="tel:727836386" className="text-green-600">727 836 386</a>
              </div>

              <div className="rounded-xl bg-gray-100 p-4">
                <div className="font-bold">Dalibor Hudec</div>
                <a href="tel:737337966" className="text-green-600">737 337 966</a>
              </div>

              <div className="rounded-xl bg-gray-100 p-4">
                <div className="font-bold">Honza Večeřa</div>
                <a href="tel:733165250" className="text-green-600">733 165 250</a>
              </div>

              <div className="rounded-xl bg-gray-100 p-4">
                <div className="font-bold">Radek Slavík</div>
                <a href="tel:776423813" className="text-green-600">776 423 813</a>
              </div>

              <div className="rounded-xl bg-gray-100 p-4">
                <div className="font-bold">Libor Vinkler</div>
                <a href="tel:736205150" className="text-green-600">736 205 150</a>
              </div>

            </div>

            <button
              onClick={() => setIsContactsOpen(false)}
              className="mt-6 bg-red-500 text-white px-4 py-2 rounded"
            >
              Zavřít
            </button>

          </div>
        </div>
      )}

      {/* DETAIL */}
      {selectedMatch && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center"
          onClick={() => setSelectedMatch(null)}
        >
          <div
            className="bg-white p-6 rounded-xl max-w-xl w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-xl font-bold">
              ASK Lipůvka vs. {selectedMatch.opponent}
            </h2>

            <div className="mt-4 flex gap-2 overflow-x-auto">
              {selectedMatch.photos.map((p, i) => (
                <img key={i} src={p} className="h-40 rounded" />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}