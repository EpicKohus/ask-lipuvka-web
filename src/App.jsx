import { useEffect, useMemo, useState } from 'react';

export default function AskLipuvkaWeb() {
  const [isRegistrationOpen, setIsRegistrationOpen] = useState(false);
  const [isContactsOpen, setIsContactsOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [selectedMatch, setSelectedMatch] = useState(null);

  const [clubDropdownOpen, setClubDropdownOpen] = useState(false);
  const [clubContent, setClubContent] = useState(null);

  const [activeCategory, setActiveCategory] = useState('mladsi-pripravka');

  const today = new Date();
  const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());

  const categories = [
    { id: 'predpripravka', label: 'Předpřípravka', shortLabel: 'U7' },
    { id: 'mladsi-pripravka', label: 'Mladší přípravka', shortLabel: 'U9' },
    { id: 'starsi-pripravka', label: 'Starší přípravka', shortLabel: 'U11' },
  ];

  const newsItems = [
    {
      category: 'mladsi-pripravka',
      title: 'Otevření nové hospody na Zelený čtvrtek',
      text: 'Na Zelený čtvrtek bude na areálu otevřena nová hospoda.',
      date: '2. 4. 2026',
    },
  ];

  const contacts = [
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
  ];

  const matches = [];

  const filteredNews = useMemo(
    () => newsItems.filter((item) => item.category === activeCategory),
    [activeCategory]
  );

  const filteredContacts = useMemo(
    () => contacts.filter((item) => item.category === activeCategory),
    [activeCategory]
  );

  useEffect(() => {
    const shouldLock =
      isRegistrationOpen ||
      isContactsOpen ||
      isMobileMenuOpen ||
      selectedMatch ||
      clubContent;

    document.body.style.overflow = shouldLock ? 'hidden' : '';
  }, [isRegistrationOpen, isContactsOpen, isMobileMenuOpen, selectedMatch, clubContent]);

  return (
    <div className="min-h-screen bg-white text-gray-900">

      {/* HEADER */}
      <header className="sticky top-0 z-20 border-b bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="text-xl font-bold text-green-600">ASK Lipůvka</div>

          <nav className="hidden gap-6 text-sm md:flex">

            <a href="#novinky">Novinky</a>
            <a href="#zapasy">Zápasy</a>

            {/* KLUB DROPDOWN */}
            <div className="relative">
              <button onClick={() => setClubDropdownOpen(!clubDropdownOpen)}>
                Klub ▼
              </button>

              {clubDropdownOpen && (
                <div className="absolute top-full mt-2 bg-white shadow rounded-xl p-2">
                  <button onClick={() => { setClubContent('filosofie'); setClubDropdownOpen(false); }} className="block px-4 py-2 hover:bg-gray-100">Filosofie</button>
                  <button onClick={() => { setClubContent('rodice'); setClubDropdownOpen(false); }} className="block px-4 py-2 hover:bg-gray-100">Pro rodiče</button>
                  <button onClick={() => { setClubContent('areal'); setClubDropdownOpen(false); }} className="block px-4 py-2 hover:bg-gray-100">Areál</button>
                </div>
              )}
            </div>

            <button onClick={() => setIsContactsOpen(true)}>Kontakty</button>
            <button onClick={() => setIsRegistrationOpen(true)}>Registrace</button>

          </nav>
        </div>
      </header>

      {/* NOVINKY */}
      <section id="novinky" className="p-6">
        <h2 className="text-3xl font-bold text-green-600 mb-4">Novinky</h2>

        {filteredNews.map((item) => (
          <div key={item.title} className="bg-gray-100 p-4 rounded-xl mb-3">
            <div className="text-sm text-green-600">{item.date}</div>
            <h3 className="font-bold">{item.title}</h3>
            <p>{item.text}</p>
          </div>
        ))}
      </section>

      {/* CLUB POPUP */}
      {clubContent && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-xl max-w-2xl w-full relative">

            <button onClick={() => setClubContent(null)} className="absolute top-2 right-3 text-xl">×</button>

            {clubContent === 'filosofie' && (
              <>
                <h2 className="text-2xl font-bold text-green-600 mb-4">Filosofie</h2>
                <p>
                  V ASK Lipůvka vedeme děti k radosti ze sportu, pohybu a hry v kolektivu.
                </p>
              </>
            )}

            {clubContent === 'rodice' && (
              <>
                <h2 className="text-2xl font-bold text-green-600 mb-4">Pro rodiče</h2>
                <p>Vážení rodiče, děkujeme za podporu.</p>
              </>
            )}

            {clubContent === 'areal' && (
              <>
                <h2 className="text-2xl font-bold text-green-600 mb-4">Areál</h2>
                <p>Lipůvka 390</p>
              </>
            )}

          </div>
        </div>
      )}

      {/* KONTAKTY */}
      {isContactsOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-xl max-w-xl w-full relative">
            <button onClick={() => setIsContactsOpen(false)} className="absolute top-2 right-3 text-xl">×</button>

            <h2 className="text-2xl font-bold text-green-600 mb-4">Kontakty</h2>

            {filteredContacts.map((group) => (
              <div key={group.section}>
                <h3 className="font-bold">{group.section}</h3>
                {group.people.map((p) => (
                  <div key={p.name}>
                    {p.name} – {p.phoneLabel}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* REGISTRACE */}
      {isRegistrationOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-xl">
            <button onClick={() => setIsRegistrationOpen(false)}>×</button>
            Registrace
          </div>
        </div>
      )}

    </div>
  );
}