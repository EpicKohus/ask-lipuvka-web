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
      article: 'Naši nejmenší fotbalisté odehráli poslední halový turnaj zimní přípravy. Ve všech zápasech prokázali bojovnost a fotbalové srdce. Nakonec se  probojovali do finále, kdy rozhodujícím gólem Tobíka Hudce v posledních minutách vybojovali krásné první místo. Děkujeme hráčům  a v neposlední řadě rodičům za podporu.',
      photos: [],
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
    {
      date: '9. 4. 2026',
      opponent: 'RDR DX/D',
      time: '17:00 / 18:00',
      home: true,
      result: 'doplnit',
      articleTitle: '',
      article: '',
      photos: ['/field.png'],
    },
    {
      date: '14. 4. 2026',
      opponent: 'Olomučany/Babice',
      time: '17:00 / 18:00',
      home: false,
      result: 'doplnit',
      articleTitle: '',
      article: '',
      photos: ['/field.png'],
    },
    {
      date: '23. 4. 2026',
      opponent: 'Ostrov/Lipovec',
      time: '17:00 / 18:00',
      home: true,
      result: 'doplnit',
      articleTitle: '',
      article: '',
      photos: ['/field.png'],
    },
  ];

  const parseMatchDate = (dateString) => {
    const parts = dateString.split('.').map((part) => part.trim()).filter(Boolean);
    const [day, month, year] = parts;
    return new Date(Number(year), Number(month) - 1, Number(day));
  };

  const isSameDay = (dateA, dateB) => {
    return (
      dateA.getFullYear() === dateB.getFullYear() &&
      dateA.getMonth() === dateB.getMonth() &&
      dateA.getDate() === dateB.getDate()
    );
  };

  const upcomingMatches = matches
    .filter((m) => parseMatchDate(m.date) >= todayStart)
    .sort((a, b) => parseMatchDate(a.date) - parseMatchDate(b.date));

  const playedMatches = matches
    .filter((m) => parseMatchDate(m.date) < todayStart)
    .sort((a, b) => parseMatchDate(b.date) - parseMatchDate(a.date));

  useEffect(() => {
    const handleEsc = (event) => {
      if (event.key === 'Escape') {
        setIsRegistrationOpen(false);
        setIsContactsOpen(false);
        setSelectedMatch(null);
      }
    };

    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, []);

  const renderMatchCard = (m, showResult = true) => (
    <button
      type="button"
      key={`${m.date}-${m.opponent}`}
      onClick={() => setSelectedMatch(m)}
      className={`w-full rounded-2xl border p-5 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md ${
        isSameDay(parseMatchDate(m.date), todayStart)
          ? 'border-green-500 bg-green-50 ring-2 ring-green-200'
          : 'border-gray-200 bg-white'
      }`}
    >
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="text-lg font-bold text-gray-900">ASK Lipůvka vs. {m.opponent}</div>
          <div className="mt-1 text-sm text-gray-500">
            {m.date} • {m.time} • {m.home ? 'Domácí zápas' : 'Venkovní zápas'}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span
            className={`rounded-full px-3 py-1 text-sm font-semibold ${
              m.home ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'
            }`}
          >
            {m.home ? 'Domácí' : 'Venkovní'}
          </span>

          {showResult && (
            <span className="rounded-full bg-gray-100 px-3 py-1 text-sm font-semibold text-gray-700">
              Výsledek: {m.result}
            </span>
          )}
        </div>
      </div>
    </button>
  );

  return (
    <div className="min-h-screen bg-white text-gray-900">

      <header className="sticky top-0 z-20 border-b bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <a href="#top" className="flex items-center gap-3">
            <img src="/logo.png" alt="logo" className="h-10 w-10 rounded-full" />
            <div className="text-xl font-bold text-green-600">ASK Lipůvka</div>
          </a>
        </div>
      </header>

      <section id="zapasy" className="mx-auto max-w-5xl px-6 py-14">
        <div className="mb-6">
          <h2 className="mb-2 text-3xl font-bold text-green-600">Nadcházející zápasy</h2>
        </div>

        <div className="space-y-4">
          {upcomingMatches.map((m) => renderMatchCard(m, false))}
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-6 py-14">
        <h2 className="mb-6 text-3xl font-bold text-green-600">Odehrané zápasy</h2>
        <div className="space-y-4">
          {playedMatches.map((m) => renderMatchCard(m, true))}
        </div>
      </section>

      <footer className="py-6 text-center text-gray-500">© 2026 ASK Lipůvka</footer>
    </div>
  );
}
