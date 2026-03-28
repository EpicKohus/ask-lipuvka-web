import { useEffect, useMemo, useRef, useState } from 'react';

export default function AskLipuvkaWeb() {
  const [isRegistrationOpen, setIsRegistrationOpen] = useState(false);
  const [isTrainersOpen, setIsTrainersOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [isScheduleOpen, setIsScheduleOpen] = useState(false);

  const [visitCount, setVisitCount] = useState(null);

  const todayStart = useMemo(() => {
    const t = new Date();
    return new Date(t.getFullYear(), t.getMonth(), t.getDate());
  }, []);

  const categories = [
    { id: 'predpripravka', label: 'Předpřípravka', shortLabel: 'U7' },
    { id: 'mladsi-pripravka', label: 'Mladší přípravka', shortLabel: 'U9' },
    { id: 'starsi-pripravka', label: 'Starší přípravka', shortLabel: 'U11' },
  ];

  const [activeCategory, setActiveCategory] = useState('mladsi-pripravka');

  const team = {
    trainers: [
      { name: 'Jan Gebauer', category: 'predpripravka' },
      { name: 'Jiří Filipčík', category: 'predpripravka' },
      { name: 'Zdenko Adámek', category: 'mladsi-pripravka' },
      { name: 'Dalibor Hudec', category: 'mladsi-pripravka' },
      { name: 'Jan Večeřa', category: 'mladsi-pripravka' },
      { name: 'Radek Slavík', category: 'mladsi-pripravka' },
      { name: 'Libor Vinkler', category: 'starsi-pripravka' },
    ],
  };

  const matches = [
    { date: '2. 4. 2026', opponent: 'RDR RJY/RJ', time: '17:00 / 18:00', home: true },
    { date: '9. 4. 2026', opponent: 'RDR DX/D', time: '17:00 / 18:00', home: true },
    { date: '14. 4. 2026', opponent: 'Olomučany/Babice', time: '17:00 / 18:00', home: false },
    { date: '23. 4. 2026', opponent: 'Ostrov/Lipovec', time: '17:00 / 18:00', home: true },
    { date: '30. 4. 2026', opponent: 'Blansko C', time: '17:00 / 18:00', home: true },
    { date: '12. 5. 2026', opponent: 'Kras', time: '17:00 / 18:00', home: false },
    { date: '14. 5. 2026', opponent: 'Blansko A a B', time: '17:00 / 18:00', home: true },
    { date: '24. 5. 2026', opponent: 'Knínice', time: '10:15', home: false },
    { date: '28. 5. 2026', opponent: 'Boskovice', time: '17:00 / 18:00', home: true },
    { date: '4. 6. 2026', opponent: 'Letovice', time: '16:30 / 17:30', home: false },
    { date: '14. 6. 2026', opponent: 'RDR/RY', time: '14:00 / 15:00', home: true },
  ];

  const parseDate = (d) => {
    const [day, month, year] = d.split('.').map((x) => x.trim());
    return new Date(year, month - 1, day);
  };

  const upcomingMatches = matches.filter((m) => {
    const diff = (parseDate(m.date) - todayStart) / (1000 * 60 * 60 * 24);
    return diff >= 0 && diff <= 14;
  });

  const getCategoryColor = (c) => {
    if (c === 'predpripravka') return 'bg-blue-600';
    if (c === 'mladsi-pripravka') return 'bg-green-600';
    if (c === 'starsi-pripravka') return 'bg-orange-500';
  };

  const getShort = (c) => categories.find((x) => x.id === c)?.shortLabel;

  useEffect(() => {
    const load = async () => {
      const res = await fetch('/api/visits', { method: 'POST' });
      const data = await res.json();
      setVisitCount(data.count);
    };
    load();
  }, []);

  return (
    <div className="min-h-screen">

      {/* HERO */}
      <section className="text-center p-10">
        <h1 className="text-4xl font-bold text-green-600">ASK Lipůvka</h1>

        <div className="mt-5 flex justify-center gap-3">
          {categories.map((c) => (
            <button key={c.id} onClick={() => setActiveCategory(c.id)} className="px-4 py-2 border rounded-xl">
              {c.label}
            </button>
          ))}
        </div>
      </section>

      {/* ZÁPASY */}
      <section className="max-w-3xl mx-auto p-5">
        <h2 className="text-2xl font-bold mb-3">Nadcházející zápasy</h2>

        <button
          onClick={() => setIsScheduleOpen(true)}
          className="mb-4 bg-green-600 text-white px-4 py-2 rounded-xl"
        >
          Rozpis zápasů – Jaro 2026
        </button>

        {upcomingMatches.map((m, i) => (
          <div key={i} className="border p-3 mb-3 rounded-xl">
            {m.date} • {m.opponent}
          </div>
        ))}
      </section>

      {/* POPUP ROZPIS */}
      {isScheduleOpen && (
        <div className="fixed inset-0 bg-black/60 flex justify-center items-start p-5">
          <div className="bg-white max-w-3xl w-full rounded-xl overflow-hidden">

            <div className="relative h-40">
              <img src="/field.png" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center text-white text-2xl font-bold">
                Rozpis zápasů
              </div>
            </div>

            <div className="p-5 space-y-3">
              {matches.map((m, i) => (
                <div key={i} className="border p-3 rounded-xl flex justify-between">
                  <div>
                    {m.date} • {m.opponent}
                    {!m.home && <div className="text-sm text-gray-500">📍 venku</div>}
                  </div>
                  <div className={m.home ? 'text-green-600' : 'text-red-600'}>
                    {m.home ? 'DOMA' : 'VENKU'}
                  </div>
                </div>
              ))}
            </div>

            <button onClick={() => setIsScheduleOpen(false)} className="w-full p-3 bg-gray-100">
              Zavřít
            </button>

          </div>
        </div>
      )}

      {/* TRENÉŘI */}
      <section className="max-w-3xl mx-auto p-5">
        <h2 className="text-xl font-bold mb-4">Trenéři</h2>

        <div className="grid grid-cols-2 gap-3">
          {team.trainers.map((t) => (
            <div key={t.name} className="border p-3 rounded-xl text-center">
              <div>{t.name}</div>
              <span className={`text-white px-2 py-1 text-xs rounded ${getCategoryColor(t.category)}`}>
                {getShort(t.category)}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* REGISTRACE */}
      {isRegistrationOpen && (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center">
          <div className="bg-white p-6 rounded-xl w-full max-w-md">

            <h2 className="text-xl font-bold mb-3">Registrace</h2>

            <div className="text-sm mb-4 space-y-2">
              <p>1. Zdravotní stav...</p>
              <p>2. První pomoc...</p>
              <p>3. Doprava...</p>
              <p>4. GDPR...</p>
              <p>5. Povinnosti...</p>
              <p>6. Turnaje...</p>
              <p>7. Odchody...</p>
              <p>8. Trenéři zodpovídají...</p>
            </div>

            <input placeholder="Datum narození" className="border p-2 w-full mb-3" />

            <button className="w-full bg-green-600 text-white p-2 rounded">
              Odeslat
            </button>

          </div>
        </div>
      )}

      {/* FOOTER */}
      <footer className="text-center p-6 space-y-4">

        <div className="text-sm">
          Návštěvnost: {visitCount ?? '...'}
        </div>

        <div className="flex justify-center gap-4">
          <a href="#" className="bg-blue-600 text-white px-4 py-2 rounded">Facebook</a>
          <a href="#" className="border px-4 py-2 rounded">A tým</a>
        </div>

        <div>© 2026 ASK Lipůvka</div>

      </footer>

    </div>
  );
}