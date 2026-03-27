import { useEffect, useMemo, useState } from 'react';

export default function AskLipuvkaWeb() {
  const [isRegistrationOpen, setIsRegistrationOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [activeCategory, setActiveCategory] = useState('mladsi-pripravka');
  const [activeClubTab, setActiveClubTab] = useState('filosofie');

  const today = new Date();
  const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());

  const categories = [
    { id: 'predpripravka', label: 'Předpřípravka', shortLabel: 'U7' },
    { id: 'mladsi-pripravka', label: 'Mladší přípravka', shortLabel: 'U9' },
    { id: 'starsi-pripravka', label: 'Starší přípravka', shortLabel: 'U11' },
  ];

  const clubTabs = [
    { id: 'filosofie', label: 'Filosofie' },
    { id: 'rodice', label: 'Pro rodiče' },
    { id: 'kontakty', label: 'Kontakty' },
    { id: 'areal', label: 'Areál' },
  ];

  const newsItems = [
    {
      category: 'mladsi-pripravka',
      title: 'Otevření nové hospody na Zelený čtvrtek',
      text: 'Na Zelený čtvrtek, tedy 2. 4., bude na areálu otevřena nová hospoda. Na otvíračku bude připravené i zelené pivo.',
      date: '2. 4. 2026',
    },
    {
      category: 'predpripravka',
      title: 'Předpřípravka je připravena na další ročník',
      text: 'Kategorie je na webu nachystaná. Jakmile bude známý program a další informace, snadno doplníme novinky i zápasy.',
      date: '1. 4. 2026',
    },
    {
      category: 'starsi-pripravka',
      title: 'Starší přípravka je připravena do budoucna',
      text: 'Kategorie je založená dopředu, aby bylo možné snadno přidat zápasy, kontakty i další novinky pro příští sezonu.',
      date: '1. 4. 2026',
    },
  ];

  const contacts = [
    {
      category: 'predpripravka',
      section: 'Vedoucí mládeže',
      people: [
        {
          name: 'Radek Mánek',
          phone: '606148368',
          phoneLabel: '606 148 368',
          email: 'radek.manek@email.cz',
        },
      ],
    },
    {
      category: 'mladsi-pripravka',
      section: 'Vedoucí mládeže',
      people: [
        {
          name: 'Radek Mánek',
          phone: '606148368',
          phoneLabel: '606 148 368',
          email: 'radek.manek@email.cz',
        },
      ],
    },
    {
      category: 'starsi-pripravka',
      section: 'Vedoucí mládeže',
      people: [
        {
          name: 'Radek Mánek',
          phone: '606148368',
          phoneLabel: '606 148 368',
          email: 'radek.manek@email.cz',
        },
      ],
    },
    {
      category: 'predpripravka',
      section: 'Předpřípravka',
      people: [
        { name: 'Jan Gebauer', phone: '737146918', phoneLabel: '737 146 918' },
        { name: 'Jiří Filipčík', phone: '737235850', phoneLabel: '737 235 850' },
      ],
    },
    {
      category: 'mladsi-pripravka',
      section: 'Mladší přípravka',
      people: [
        { name: 'Zdenko Adámek', phone: '727836386', phoneLabel: '727 836 386' },
        { name: 'Dalibor Hudec', phone: '737337966', phoneLabel: '737 337 966' },
        { name: 'Jan Večeřa', phone: '733165250', phoneLabel: '733 165 250' },
        { name: 'Radek Slavík', phone: '776423813', phoneLabel: '776 423 813' },
      ],
    },
    {
      category: 'starsi-pripravka',
      section: 'Starší přípravka',
      people: [
        { name: 'Libor Vinkler', phone: '736205150', phoneLabel: '736 205 150' },
      ],
    },
  ];

  const matches = [
    {
      category: 'mladsi-pripravka',
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
      category: 'mladsi-pripravka',
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
      category: 'mladsi-pripravka',
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
      category: 'mladsi-pripravka',
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
      category: 'mladsi-pripravka',
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

  const isSameDay = (dateA, dateB) =>
    dateA.getFullYear() === dateB.getFullYear() &&
    dateA.getMonth() === dateB.getMonth() &&
    dateA.getDate() === dateB.getDate();

  const filteredNews = useMemo(
    () => newsItems.filter((item) => item.category === activeCategory),
    [activeCategory]
  );

  const filteredContacts = useMemo(
    () => contacts.filter((item) => item.category === activeCategory),
    [activeCategory]
  );

  const filteredMatches = useMemo(
    () => matches.filter((match) => match.category === activeCategory),
    [activeCategory]
  );

  const upcomingMatches = filteredMatches
    .filter((m) => parseMatchDate(m.date) >= todayStart)
    .sort((a, b) => parseMatchDate(a.date) - parseMatchDate(b.date));

  const playedMatches = filteredMatches
    .filter((m) => parseMatchDate(m.date) < todayStart)
    .sort((a, b) => parseMatchDate(b.date) - parseMatchDate(a.date));

  const activeCategoryData = categories.find((category) => category.id === activeCategory);
  const activeCategoryLabel = activeCategoryData?.label || '';
  const activeCategoryShortLabel = activeCategoryData?.shortLabel || '';

  useEffect(() => {
    const handleEsc = (event) => {
      if (event.key === 'Escape') {
        setIsRegistrationOpen(false);
        setIsMobileMenuOpen(false);
        setSelectedMatch(null);
      }
    };

    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, []);

  useEffect(() => {
    const shouldLock = isRegistrationOpen || isMobileMenuOpen || selectedMatch;
    document.body.style.overflow = shouldLock ? 'hidden' : '';

    return () => {
      document.body.style.overflow = '';
    };
  }, [isRegistrationOpen, isMobileMenuOpen, selectedMatch]);

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

  const openRegistration = () => {
    setIsMobileMenuOpen(false);
    setIsRegistrationOpen(true);
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
    <div className="min-h-screen bg-white text-gray-900">
      <style>{`
        html {
          scroll-behavior: smooth;
        }

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
            <a href="#novinky" className="hover:text-green-600">Novinky</a>
            <a href="#zapasy" className="hover:text-green-600">Zápasy</a>
            <a href="#klub" className="hover:text-green-600">Klub</a>
            <button type="button" onClick={() => setIsRegistrationOpen(true)} className="hover:text-green-600">
              Registrace hráče
            </button>
          </nav>

          <button
            type="button"
            onClick={() => setIsMobileMenuOpen(true)}
            className="flex h-11 w-11 items-center justify-center rounded-xl border border-gray-300 md:hidden"
            aria-label="Otevřít menu"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 text-gray-700"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </header>

      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        >
          <div
            className="ml-auto flex h-full w-[85%] max-w-sm flex-col bg-white shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b px-5 py-4">
              <div className="flex items-center gap-3">
                <img src="/logo.png" alt="logo" className="h-10 w-10 rounded-full" />
                <div className="text-lg font-bold text-green-600">ASK Lipůvka</div>
              </div>

              <button
                type="button"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex h-10 w-10 items-center justify-center rounded-xl border border-gray-300 text-2xl text-gray-600"
                aria-label="Zavřít menu"
              >
                ×
              </button>
            </div>

            <div className="flex flex-col">
              <a
                href="#novinky"
                onClick={() => setIsMobileMenuOpen(false)}
                className="border-b px-5 py-4 text-left text-lg font-medium text-gray-800"
              >
                Novinky
              </a>

              <a
                href="#zapasy"
                onClick={() => setIsMobileMenuOpen(false)}
                className="border-b px-5 py-4 text-left text-lg font-medium text-gray-800"
              >
                Zápasy
              </a>

              <a
                href="#klub"
                onClick={() => setIsMobileMenuOpen(false)}
                className="border-b px-5 py-4 text-left text-lg font-medium text-gray-800"
              >
                Klub
              </a>

              <button
                type="button"
                onClick={openRegistration}
                className="border-b px-5 py-4 text-left text-lg font-medium text-gray-800"
              >
                Registrace hráče
              </button>
            </div>
          </div>
        </div>
      )}

      <section id="top" className="relative flex h-[80vh] items-center justify-center text-center">
        <img src="/field.png" alt="hřiště" className="absolute inset-0 h-full w-full object-cover" />

        <div className="relative z-10 rounded-2xl bg-white/70 p-8 backdrop-blur-md">
          <img src="/logo.png" alt="logo" className="mx-auto mb-4 w-28" />
          <h1 className="mb-3 text-4xl font-black text-green-700 md:text-6xl">ASK Lipůvka</h1>
          <p className="mb-6 text-gray-700">Oficiální klubový web mládeže ASK Lipůvka</p>

          <div className="mx-auto flex max-w-2xl flex-wrap justify-center gap-3">
            {categories.map((category) => {
              const isActive = activeCategory === category.id;

              return (
                <button
                  key={category.id}
                  type="button"
                  onClick={() => setActiveCategory(category.id)}
                  className={`flex items-center gap-2 rounded-xl px-4 py-3 font-semibold transition ${
                    isActive
                      ? 'bg-green-600 text-white'
                      : 'border border-gray-300 bg-white/90 text-gray-700 hover:border-green-500 hover:text-green-600'
                  }`}
                >
                  <span>{category.label}</span>
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-bold ${
                      isActive ? 'bg-white/20 text-white' : 'bg-green-100 text-green-700'
                    }`}
                  >
                    {category.shortLabel}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      <section id="novinky" className="mx-auto max-w-5xl px-6 py-14">
        <div className="rounded-3xl border border-gray-200 bg-gray-50 p-8 shadow-sm">
          <div className="mb-2 flex flex-wrap items-center gap-3">
            <div className="text-sm font-semibold uppercase tracking-wide text-green-600">
              {activeCategoryLabel}
            </div>
            <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-bold text-green-700">
              {activeCategoryShortLabel}
            </span>
          </div>

          <h2 className="mb-4 text-3xl font-bold text-green-600">Novinky</h2>

          {filteredNews.length > 0 ? (
            <div className="space-y-4">
              {filteredNews.map((item) => (
                <div key={`${item.category}-${item.title}`} className="rounded-2xl bg-white p-5 shadow-sm">
                  <div className="mb-2 text-sm font-semibold uppercase tracking-wide text-green-600">
                    {item.date}
                  </div>
                  <h3 className="mb-2 text-xl font-bold text-gray-900">{item.title}</h3>
                  <p className="text-gray-700">{item.text}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-2xl bg-white p-5 text-gray-600 shadow-sm">
              Pro tuto kategorii zatím nejsou doplněné žádné novinky.
            </div>
          )}
        </div>
      </section>

      <section id="zapasy" className="mx-auto max-w-5xl px-6 py-14">
        <div className="mb-3 flex flex-wrap items-center gap-3">
          <div className="text-sm font-semibold uppercase tracking-wide text-green-600">
            {activeCategoryLabel}
          </div>
          <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-bold text-green-700">
            {activeCategoryShortLabel}
          </span>
        </div>

        <div className="mb-6">
          <h2 className="mb-2 text-3xl font-bold text-green-600">Nadcházející zápasy</h2>
        </div>

        <div className="space-y-4">
          {upcomingMatches.length > 0 ? (
            upcomingMatches.map((m) => renderMatchCard(m, false))
          ) : (
            <div className="rounded-2xl bg-gray-100 p-5 text-gray-600">
              Pro tuto kategorii zatím nejsou naplánované žádné nadcházející zápasy.
            </div>
          )}
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-6 py-14">
        <div className="mb-3 flex flex-wrap items-center gap-3">
          <div className="text-sm font-semibold uppercase tracking-wide text-green-600">
            {activeCategoryLabel}
          </div>
          <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-bold text-green-700">
            {activeCategoryShortLabel}
          </span>
        </div>

        <h2 className="mb-6 text-3xl font-bold text-green-600">Odehrané zápasy</h2>

        <div className="space-y-4">
          {playedMatches.length > 0 ? (
            playedMatches.map((m) => renderMatchCard(m, true))
          ) : (
            <div className="rounded-2xl bg-gray-100 p-5 text-gray-600">
              Pro tuto kategorii zatím nejsou žádné odehrané zápasy.
            </div>
          )}
        </div>
      </section>

      <section id="klub" className="mx-auto max-w-5xl px-6 py-14">
        <div className="rounded-3xl border border-gray-200 bg-gray-50 p-8 shadow-sm">
          <div className="mb-2 flex flex-wrap items-center gap-3">
            <div className="text-sm font-semibold uppercase tracking-wide text-green-600">
              {activeCategoryLabel}
            </div>
            <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-bold text-green-700">
              {activeCategoryShortLabel}
            </span>
          </div>

          <h2 className="mb-6 text-3xl font-bold text-green-600">Klub</h2>

          <div className="mb-8 flex flex-wrap gap-3">
            {clubTabs.map((tab) => {
              const isActive = activeClubTab === tab.id;

              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveClubTab(tab.id)}
                  className={`rounded-xl px-4 py-3 font-semibold transition ${
                    isActive
                      ? 'bg-green-600 text-white'
                      : 'border border-gray-300 bg-white text-gray-700 hover:border-green-500 hover:text-green-600'
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>

          {activeClubTab === 'filosofie' && (
            <div className="rounded-2xl bg-white p-6 shadow-sm">
              <h3 className="mb-4 text-2xl font-bold text-gray-900">Naše filosofie</h3>
              <div className="space-y-4 leading-7 text-gray-700">
                <p>
                  V ASK Lipůvka vedeme děti k radosti ze sportu, pohybu a hry v kolektivu.
                  Důraz klademe především na zábavu, všestranný rozvoj, fair play a pozitivní
                  vztah ke sportu.
                </p>
                <p>
                  Výsledky nejsou v mládežnickém fotbale to nejdůležitější — mnohem více nám
                  záleží na tom, aby děti sport bavil, rozvíjely své dovednosti a cítily se v
                  týmu dobře.
                </p>
                <p>
                  Chceme vytvářet prostředí, ve kterém se děti nebojí dělat chyby, učí se
                  spolupracovat a postupně si budují zdravé sebevědomí.
                </p>
              </div>
            </div>
          )}

          {activeClubTab === 'rodice' && (
            <div className="space-y-5">
              <div className="rounded-2xl bg-white p-6 shadow-sm">
                <h3 className="mb-4 text-2xl font-bold text-gray-900">Pro rodiče</h3>
                <p className="leading-7 text-gray-700">
                  Vážení rodiče, děkujeme vám za důvěru, kterou vkládáte do našeho klubu.
                  Společně chceme vytvořit prostředí, ve kterém se děti cítí dobře, mají
                  radost ze sportu a přirozeně se rozvíjejí.
                </p>
              </div>

              <div className="grid gap-5 md:grid-cols-2">
                <div className="rounded-2xl bg-white p-6 shadow-sm">
                  <h4 className="mb-3 text-xl font-bold text-green-600">Na čem si zakládáme</h4>
                  <ul className="space-y-2 text-gray-700">
                    <li>• radost ze hry a pohybu</li>
                    <li>• všestranný sportovní rozvoj</li>
                    <li>• respekt k trenérům, spoluhráčům i soupeřům</li>
                    <li>• fair play a pozitivní přístup</li>
                  </ul>
                </div>

                <div className="rounded-2xl bg-white p-6 shadow-sm">
                  <h4 className="mb-3 text-xl font-bold text-green-600">Co od vás potřebujeme</h4>
                  <ul className="space-y-2 text-gray-700">
                    <li>• podporujte děti bez zbytečného tlaku na výkon</li>
                    <li>• respektujte trenéry a jejich rozhodnutí</li>
                    <li>• veďte děti k samostatnosti a zodpovědnosti</li>
                    <li>• pomáhejte vytvářet pozitivní atmosféru na hřišti</li>
                  </ul>
                </div>

                <div className="rounded-2xl bg-white p-6 shadow-sm">
                  <h4 className="mb-3 text-xl font-bold text-green-600">Co nabízíme</h4>
                  <ul className="space-y-2 text-gray-700">
                    <li>• přátelské a bezpečné prostředí</li>
                    <li>• individuální přístup ke každému dítěti</li>
                    <li>• kvalifikované trenéry</li>
                    <li>• smysluplné využití volného času</li>
                  </ul>
                </div>

                <div className="rounded-2xl bg-white p-6 shadow-sm">
                  <h4 className="mb-3 text-xl font-bold text-green-600">Důležité</h4>
                  <p className="leading-7 text-gray-700">
                    Každé dítě se vyvíjí jiným tempem. Naším cílem není pouze vyhrávat, ale
                    především vychovat děti, které mají vztah ke sportu, pohybu a týmové
                    spolupráci.
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeClubTab === 'kontakty' && (
            <div className="space-y-8">
              {filteredContacts.length > 0 ? (
                filteredContacts.map((group) => (
                  <div key={`${group.category}-${group.section}`} className="rounded-2xl bg-white p-6 shadow-sm">
                    <h3 className="mb-4 text-2xl font-bold text-gray-900">{group.section}</h3>

                    <div className="grid gap-4 md:grid-cols-2">
                      {group.people.map((person) => (
                        <div key={`${group.section}-${person.name}`} className="rounded-xl bg-gray-50 p-4">
                          <div className="mb-2 text-lg font-bold text-gray-900">{person.name}</div>

                          {person.phone && (
                            <a
                              href={`tel:${person.phone}`}
                              className="block font-semibold text-green-600 hover:underline"
                            >
                              {person.phoneLabel}
                            </a>
                          )}

                          {person.email && (
                            <a
                              href={`mailto:${person.email}`}
                              className="mt-1 block font-semibold text-green-600 hover:underline"
                            >
                              {person.email}
                            </a>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ))
              ) : (
                <div className="rounded-2xl bg-white p-6 text-gray-600 shadow-sm">
                  Pro tuto kategorii zatím nejsou doplněné kontakty.
                </div>
              )}
            </div>
          )}

          {activeClubTab === 'areal' && (
            <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
              <div className="rounded-2xl bg-white p-6 shadow-sm">
                <h3 className="mb-4 text-2xl font-bold text-gray-900">Fotbalový areál ASK Lipůvka</h3>

                <p className="mb-3 text-lg font-semibold text-gray-900">Kde nás najdete</p>
                <p className="mb-6 text-gray-700">
                  Lipůvka 390
                  <br />
                  679 22 Lipůvka
                </p>

                <div className="mb-6 flex flex-wrap gap-4">
                  <a
                    href="https://mapy.cz/zakladni?source=addr&id=10845160&x=16.5539949&y=49.3398458&z=17"
                    target="_blank"
                    rel="noreferrer"
                    className="rounded-xl bg-green-600 px-6 py-3 font-semibold text-white"
                  >
                    Otevřít v Mapy.cz
                  </a>

                  <a
                    href="https://www.google.com/maps/search/?api=1&query=Lipuvka+390+679+22+Lipuvka"
                    target="_blank"
                    rel="noreferrer"
                    className="rounded-xl border border-gray-400 px-6 py-3 font-semibold text-gray-700"
                  >
                    Navigovat (Google)
                  </a>
                </div>

                <div className="rounded-2xl bg-gray-50 p-5">
                  <h4 className="mb-2 text-lg font-bold text-gray-900">Praktické info</h4>
                  <ul className="space-y-2 text-gray-700">
                    <li>• Příjezd je možný přímo k areálu.</li>
                    <li>• Parkování je možné v okolí hřiště.</li>
                    <li>• V areálu probíhají nejen zápasy mládeže, ale i další klubové akce.</li>
                  </ul>
                </div>
              </div>

              <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
                <iframe
                  title="Mapa areálu ASK Lipůvka"
                  src="https://www.google.com/maps?q=Lipuvka%20390%20679%2022%20Lipuvka&z=16&output=embed"
                  className="h-[360px] w-full border-0 lg:h-full"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </div>
            </div>
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
              <input
                type="text"
                name="jmeno"
                placeholder="Jméno"
                required
                className="w-full rounded-xl border border-gray-300 bg-white p-3 text-black placeholder:text-gray-500"
              />
              <input
                type="text"
                name="prijmeni"
                placeholder="Příjmení"
                required
                className="w-full rounded-xl border border-gray-300 bg-white p-3 text-black placeholder:text-gray-500"
              />
              <input
                type="text"
                name="adresa"
                placeholder="Adresa (ulice a číslo popisné)"
                required
                className="w-full rounded-xl border border-gray-300 bg-white p-3 text-black placeholder:text-gray-500"
              />
              <input
                type="date"
                name="datum_narozeni"
                required
                className="w-full rounded-xl border border-gray-300 bg-white p-3 text-black"
              />
              <input
                type="text"
                name="mesto_narozeni"
                placeholder="Město narození"
                required
                className="w-full rounded-xl border border-gray-300 bg-white p-3 text-black placeholder:text-gray-500"
              />
              <input
                type="text"
                name="rodne_cislo"
                placeholder="Rodné číslo"
                required
                className="w-full rounded-xl border border-gray-300 bg-white p-3 text-black placeholder:text-gray-500"
              />
              <input
                type="text"
                name="rodic"
                placeholder="Jméno a příjmení rodiče / zákonného zástupce"
                required
                className="w-full rounded-xl border border-gray-300 bg-white p-3 text-black placeholder:text-gray-500"
              />
              <input
                type="tel"
                name="telefon"
                placeholder="Telefon zákonného zástupce"
                required
                className="w-full rounded-xl border border-gray-300 bg-white p-3 text-black placeholder:text-gray-500"
              />

              <button type="submit" className="w-full rounded-xl bg-green-600 py-3 font-semibold text-white">
                Odeslat registraci
              </button>
            </form>
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
              <div className="mb-2 flex flex-wrap items-center gap-3">
                <div className="text-sm font-semibold uppercase tracking-wide text-green-600">
                  Detail zápasu • {activeCategoryLabel}
                </div>
                <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-bold text-green-700">
                  {activeCategoryShortLabel}
                </span>
              </div>

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

      <footer className="py-6 text-center text-gray-500">© 2026 ASK Lipůvka</footer>
    </div>
  );
}