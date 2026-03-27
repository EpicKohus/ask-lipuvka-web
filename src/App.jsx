import { useEffect, useState } from 'react';

export default function AskLipuvkaWeb() {
  const [isRegistrationOpen, setIsRegistrationOpen] = useState(false);
  const [isContactsOpen, setIsContactsOpen] = useState(false);
  const [isAreaOpen, setIsAreaOpen] = useState(false);
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
        'Naši nejmenší fotbalisté odehráli poslední halový turnaj zimní přípravy. Ve všech zápasech prokázali bojovnost a fotbalové srdce. Nakonec se probojovali do finále, kdy rozhodujícím gólem Tobíka Hudce v posledních minutách vybojovali krásné první místo. Děkujeme hráčům a v neposlední řadě rodičům za podporu.',
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

  const isSameDay = (dateA, dateB) => (
    dateA.getFullYear() === dateB.getFullYear() &&
    dateA.getMonth() === dateB.getMonth() &&
    dateA.getDate() === dateB.getDate()
  );

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
        setIsAreaOpen(false);
        setSelectedMatch(null);
      }
    };

    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData.entries());

    try {
      const response = await fetch('http://localhost:3001/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Nepodařilo se odeslat formulář.');
      }

      alert('Registrace byla odeslána');
      e.target.reset();
      setIsRegistrationOpen(false);
    } catch (err) {
      alert('Chyba při odesílání');
      console.error(err);
    }
  };

  const renderMatchCard = (m, showResult = true) => {
    const isToday = isSameDay(parseMatchDate(m.date), todayStart);

    return (
      <button
        type="button"
        key={`${m.date}-${m.opponent}`}
        onClick={() => setSelectedMatch(m)}
        className={`w-full rounded-2xl border p-5 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md ${
          isToday ? 'border-green-500 bg-green-50 ring-2 ring-green-200' : 'border-gray-200 bg-white'
        }`}
      >
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <div className="text-lg font-bold text-gray-900">ASK Lipůvka vs. {m.opponent}</div>
              {isToday && (
                <span className="rounded-full bg-green-600 px-3 py-1 text-xs font-bold uppercase tracking-wide text-white">
                  Dnes
                </span>
              )}
            </div>
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
  };

  return (
    <div className="min-h-screen bg-white pb-24 text-gray-900 md:pb-0">
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes scaleIn {
          from { opacity: 0; transform: scale(0.96); }
          to { opacity: 1; transform: scale(1); }
        }
      `}</style>

      <header className="sticky top-0 z-20 border-b bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <a href="#top" className="flex items-center gap-3">
            <img src="/logo.png" alt="logo" className="h-10 w-10 rounded-full" />
            <div className="text-xl font-bold text-green-600">ASK Lipůvka</div>
          </a>

          <nav className="hidden gap-6 text-sm md:flex">
            <a href="#zapasy" className="hover:text-green-600">Zápasy</a>
            <button type="button" onClick={() => setIsRegistrationOpen(true)} className="hover:text-green-600">
              Registrace hráče
            </button>
            <button type="button" onClick={() => setIsContactsOpen(true)} className="hover:text-green-600">
              Kontakty
            </button>
            <button type="button" onClick={() => setIsAreaOpen(true)} className="hover:text-green-600">
              Areál
            </button>
          </nav>
        </div>
      </header>

      <section id="top" className="relative flex h-[80vh] items-center justify-center text-center">
        <img src="/field.png" alt="hřiště" className="absolute inset-0 h-full w-full object-cover" />

        <div className="relative z-10 rounded-2xl bg-white/70 p-8 backdrop-blur-md">
          <img src="/logo.png" alt="logo" className="mx-auto mb-4 w-28" />
          <h1 className="mb-3 text-4xl font-black text-green-700 md:text-6xl">ASK Lipůvka</h1>
          <p className="mb-6 text-gray-700">Oficiální klubový web mládeže ASK Lipůvka</p>

          <div className="flex flex-wrap justify-center gap-4">
            <a href="#zapasy" className="rounded-xl bg-green-600 px-6 py-3 font-semibold text-white">
              Zápasy
            </a>
            <button
              type="button"
              onClick={() => setIsContactsOpen(true)}
              className="rounded-xl border border-red-500 px-6 py-3 text-red-500"
            >
              Kontakty
            </button>
          </div>
        </div>
      </section>

      <section id="zapasy" className="mx-auto max-w-5xl px-6 py-14">
        <div className="mb-6">
          <h2 className="mb-2 text-3xl font-bold text-green-600">Nadcházející zápasy</h2>
        </div>

        <div className="space-y-4">
          {upcomingMatches.length > 0 ? upcomingMatches.map((m) => renderMatchCard(m, false)) : (
            <div className="rounded-2xl bg-gray-100 p-5 text-gray-600">Zatím nejsou naplánované žádné nadcházející zápasy.</div>
          )}
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-6 py-14">
        <h2 className="mb-6 text-3xl font-bold text-green-600">Odehrané zápasy</h2>
        <div className="space-y-4">
          {playedMatches.length > 0 ? playedMatches.map((m) => renderMatchCard(m, true)) : (
            <div className="rounded-2xl bg-gray-100 p-5 text-gray-600">Zatím tu nejsou žádné odehrané zápasy.</div>
          )}
        </div>
      </section>

      {isRegistrationOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 animate-[fadeIn_0.2s_ease-out]"
          onClick={() => setIsRegistrationOpen(false)}
        >
          <div
            className="relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl animate-[scaleIn_0.2s_ease-out]"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setIsRegistrationOpen(false)}
              className="absolute right-4 top-4 text-2xl text-gray-500 hover:text-black"
            >
              ×
            </button>

            <h2 className="text-3xl font-bold text-green-600">Registrace hráče</h2>
            <p className="mt-3 text-gray-600">Vyplňte formulář a my se vám ozveme.</p>

            <form onSubmit={handleSubmit} className="mx-auto mt-8 space-y-4 text-left">
              <input type="text" name="jmeno" placeholder="Jméno" required className="w-full rounded-xl border border-gray-300 bg-white p-3 text-black placeholder:text-gray-500" />
              <input type="text" name="prijmeni" placeholder="Příjmení" required className="w-full rounded-xl border border-gray-300 bg-white p-3 text-black placeholder:text-gray-500" />
              <input type="text" name="adresa" placeholder="Adresa (ulice a číslo popisné)" required className="w-full rounded-xl border border-gray-300 bg-white p-3 text-black placeholder:text-gray-500" />
              <input type="date" name="datum_narozeni" required className="w-full rounded-xl border border-gray-300 bg-white p-3 text-black" />
              <input type="text" name="mesto_narozeni" placeholder="Město narození" required className="w-full rounded-xl border border-gray-300 bg-white p-3 text-black placeholder:text-gray-500" />
              <input type="text" name="rodne_cislo" placeholder="Rodné číslo" required className="w-full rounded-xl border border-gray-300 bg-white p-3 text-black placeholder:text-gray-500" />
              <input type="text" name="rodic" placeholder="Jméno a příjmení rodiče / zákonného zástupce" required className="w-full rounded-xl border border-gray-300 bg-white p-3 text-black placeholder:text-gray-500" />
              <input type="tel" name="telefon" placeholder="Telefon zákonného zástupce" required className="w-full rounded-xl border border-gray-300 bg-white p-3 text-black placeholder:text-gray-500" />

              <button type="submit" className="w-full rounded-xl bg-green-600 py-3 font-semibold text-white">
                Odeslat registraci
              </button>
            </form>
          </div>
        </div>
      )}

      {isContactsOpen && (
        <div
          className="fixed inset-0 z-50 overflow-y-auto bg-black/50 px-4 py-6 animate-[fadeIn_0.2s_ease-out]"
          onClick={() => setIsContactsOpen(false)}
        >
          <div className="flex min-h-full items-start justify-center">
            <div
              className="relative my-4 flex h-[85vh] w-full max-w-4xl flex-col rounded-2xl bg-white p-6 shadow-2xl animate-[scaleIn_0.2s_ease-out]"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                type="button"
                onClick={() => setIsContactsOpen(false)}
                className="absolute right-4 top-4 text-2xl text-gray-500 hover:text-black"
              >
                ×
              </button>

              <h2 className="mb-6 pr-10 text-3xl font-bold text-green-600">Kontakty</h2>

              <div className="flex-1 space-y-8 overflow-y-scroll pr-2">
                <div>
                  <h3 className="mb-3 text-xl font-bold">Vedoucí mládeže</h3>
                  <div className="rounded-xl bg-gray-100 p-4">
                    <div className="font-bold">Radek Mánek</div>
                    <a href="tel:606148368" className="block font-semibold text-green-600 hover:underline">606 148 368</a>
                    <a href="mailto:radek.manek@email.cz" className="font-semibold text-green-600 hover:underline">radek.manek@email.cz</a>
                  </div>
                </div>

                <div>
                  <h3 className="mb-3 text-xl font-bold">Předpřípravka</h3>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="rounded-xl bg-gray-100 p-4">
                      <div className="font-bold">Jan Gebauer</div>
                      <a href="tel:737146918" className="block font-semibold text-green-600 hover:underline">737 146 918</a>
                    </div>
                    <div className="rounded-xl bg-gray-100 p-4">
                      <div className="font-bold">Jiří Filipčík</div>
                      <a href="tel:737235850" className="block font-semibold text-green-600 hover:underline">737 235 850</a>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="mb-3 text-xl font-bold">Mladší přípravka</h3>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="rounded-xl bg-gray-100 p-4">
                      <div className="font-bold">Zdenko Adámek</div>
                      <a href="tel:727836386" className="block font-semibold text-green-600 hover:underline">727 836 386</a>
                    </div>
                    <div className="rounded-xl bg-gray-100 p-4">
                      <div className="font-bold">Dalibor Hudec</div>
                      <a href="tel:737337966" className="block font-semibold text-green-600 hover:underline">737 337 966</a>
                    </div>
                    <div className="rounded-xl bg-gray-100 p-4">
                      <div className="font-bold">Honza Večeřa</div>
                      <a href="tel:733165250" className="block font-semibold text-green-600 hover:underline">733 165 250</a>
                    </div>
                    <div className="rounded-xl bg-gray-100 p-4">
                      <div className="font-bold">Radek Slavík</div>
                      <a href="tel:776423813" className="block font-semibold text-green-600 hover:underline">776 423 813</a>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="mb-3 text-xl font-bold">Starší přípravka</h3>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="rounded-xl bg-gray-100 p-4">
                      <div className="font-bold">Libor Vinkler</div>
                      <a href="tel:736205150" className="block font-semibold text-green-600 hover:underline">736 205 150</a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {isAreaOpen && (
        <div
          className="fixed inset-0 z-50 overflow-y-auto bg-black/50 px-4 py-6 animate-[fadeIn_0.2s_ease-out]"
          onClick={() => setIsAreaOpen(false)}
        >
          <div className="flex min-h-full items-start justify-center">
            <div
              className="relative my-4 w-full max-w-4xl rounded-2xl bg-white p-6 shadow-2xl animate-[scaleIn_0.2s_ease-out]"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                type="button"
                onClick={() => setIsAreaOpen(false)}
                className="absolute right-4 top-4 text-2xl text-gray-500 hover:text-black"
              >
                ×
              </button>

              <h2 className="mb-6 pr-10 text-3xl font-bold text-green-600">Areál ASK Lipůvka</h2>

              <div className="grid gap-6 lg:grid-cols-2">
                <div className="space-y-5">
                  <div className="rounded-2xl bg-gray-100 p-5">
                    <div className="text-sm font-semibold uppercase tracking-wide text-gray-500">Adresa</div>
                    <div className="mt-2 text-lg font-bold text-gray-900">
                      Lipůvka 390, 679 22 Lipůvka
                    </div>
                    <div className="mt-2 text-gray-600">
                      Fotbalový areál ASK Lipůvka
                    </div>

                    <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                      <a
                        href="https://maps.google.com/?q=Lipůvka+390,+679+22+Lipůvka"
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center justify-center rounded-xl bg-green-600 px-4 py-3 font-semibold text-white hover:bg-green-700"
                      >
                        Otevřít v Google Maps
                      </a>

                      <a
                        href="https://www.google.com/maps/dir/?api=1&destinationL= Lipůvka+390,+679+22+Lipůvka"
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center justify-center rounded-xl border border-gray-300 px-4 py-3 font-semibold text-gray-700 hover:bg-gray-50"
                      >
                        Navigovat
                      </a>
                    </div>
                  </div>

                  <div className="overflow-hidden rounded-2xl border border-gray-200">
                    <img
                      src="/areal.jpg"
                      alt="Areál ASK Lipůvka"
                      className="h-64 w-full object-cover"
                    />
                  </div>
                </div>

                <div className="overflow-hidden rounded-2xl border border-gray-200">
                  <iframe
                    title="Mapa areálu ASK Lipůvka"
                    src="https://www.google.com/maps?q=Lipůvka+390,+679+22+Lipůvka&z=16&output=embed"
                    width="100%"
                    height="100%"
                    className="min-h-[420px]"
                    style={{ border: 0 }}
                    allowFullScreen=""
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {selectedMatch && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 animate-[fadeIn_0.2s_ease-out]"
          onClick={() => setSelectedMatch(null)}
        >
          <div
            className="relative max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl animate-[scaleIn_0.2s_ease-out]"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setSelectedMatch(null)}
              className="absolute right-4 top-4 text-2xl text-gray-500 hover:text-black"
            >
              ×
            </button>

            <div className="mb-6 border-b border-gray-200 pb-4 pr-10">
              <div className="text-sm font-semibold uppercase tracking-wide text-green-600">Detail zápasu</div>
              <h2 className="mt-2 text-3xl font-bold text-gray-900">ASK Lipůvka vs. {selectedMatch.opponent}</h2>
              <div className="mt-2 text-gray-600">
                {selectedMatch.date} • {selectedMatch.time} • {selectedMatch.home ? 'Domácí zápas' : 'Venkovní zápas'}
              </div>
              {parseMatchDate(selectedMatch.date) < todayStart && (
                <div className="mt-3 inline-flex rounded-full bg-gray-100 px-3 py-1 text-sm font-semibold text-gray-700">
                  Výsledek: {selectedMatch.result}
                </div>
              )}
            </div>

            <div className="grid gap-8 xl:grid-cols-2">
              <div>
                <h3 className="mb-3 text-xl font-bold text-green-600">Fotky</h3>
                {selectedMatch.photos.length > 0 ? (
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    {selectedMatch.photos.map((photo, index) => (
                      <img
                        key={`${photo}-${index}`}
                        src={photo}
                        alt={`Fotka k zápasu ${index + 1}`}
                        className="h-64 w-full rounded-2xl object-cover shadow-sm"
                      />
                    ))}
                  </div>
                ) : (
                  <div className="rounded-2xl bg-gray-50 p-5 text-gray-500">Fotky k zápasu budou doplněny.</div>
                )}
              </div>

              <div>
                <h3 className="mb-3 text-xl font-bold text-green-600">Článek k zápasu</h3>
                <div className="rounded-2xl bg-gray-50 p-5">
                  {parseMatchDate(selectedMatch.date) < todayStart ? (
                    <>
                      <div className="mb-2 text-lg font-semibold text-gray-900">{selectedMatch.articleTitle}</div>
                      <p className="leading-7 text-gray-700">{selectedMatch.article}</p>
                    </>
                  ) : (
                    <div className="text-gray-500">Komentář zápasu bude doplněn</div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="fixed bottom-0 left-0 right-0 z-40 border-t bg-white/95 p-3 shadow-2xl backdrop-blur md:hidden">
        <div className="grid grid-cols-3 gap-2">
          <button
            type="button"
            onClick={() => setIsRegistrationOpen(true)}
            className="rounded-xl bg-green-600 px-3 py-3 text-sm font-semibold text-white"
          >
            Registrace
          </button>
          <button
            type="button"
            onClick={() => setIsContactsOpen(true)}
            className="rounded-xl border border-red-500 px-3 py-3 text-sm font-semibold text-red-500"
          >
            Kontakt
          </button>
          <button
            type="button"
            onClick={() => setIsAreaOpen(true)}
            className="rounded-xl border border-gray-300 px-3 py-3 text-sm font-semibold text-gray-700"
          >
            Areál
          </button>
        </div>
      </div>

      <footer className="py-6 text-center text-gray-500">© 2026 ASK Lipůvka</footer>
    </div>
  );
}