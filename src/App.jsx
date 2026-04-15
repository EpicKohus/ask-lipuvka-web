import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from './firebase';
import { collection, doc, getDocs, getDoc, runTransaction, serverTimestamp } from 'firebase/firestore';

export default function AskLipuvkaWeb() {
  const navigate = useNavigate();

  const [isRegistrationOpen, setIsRegistrationOpen] = useState(false);
  const [isTrainersOpen, setIsTrainersOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const [isClubDropdownOpen, setIsClubDropdownOpen] = useState(false);
  const [isTeamsDropdownOpen, setIsTeamsDropdownOpen] = useState(false);
  const [isMobileTeamsDropdownOpen, setIsMobileTeamsDropdownOpen] = useState(false);
  const [isMobileClubDropdownOpen, setIsMobileClubDropdownOpen] = useState(false);
  const [clubPopupContent, setClubPopupContent] = useState(null);

  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const [selectedAlbum, setSelectedAlbum] = useState(null);
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState(null);
  const [gallerySource, setGallerySource] = useState('global');
  const [showAllTeamAlbums, setShowAllTeamAlbums] = useState(false);

  const [activeCategory, setActiveCategory] = useState('mladsi-pripravka');
  const [visitCount, setVisitCount] = useState(null);

  const [firebaseNews, setFirebaseNews] = useState([]);
  const [firebaseMatches, setFirebaseMatches] = useState([]);
  const [firebaseGallery, setFirebaseGallery] = useState([]);

  const [isTermsOpen, setIsTermsOpen] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [isScheduleOpen, setIsScheduleOpen] = useState(false);

  const [openFaqIndex, setOpenFaqIndex] = useState(null);
  const [theme, setTheme] = useState(() => {
    if (typeof window === 'undefined') return 'light';
    return localStorage.getItem('ask-lipuvka-theme') || 'light';
  });


  const touchStartX = useRef(null);
  const touchEndX = useRef(null);

  const todayStart = useMemo(() => {
    const today = new Date();
    return new Date(today.getFullYear(), today.getMonth(), today.getDate());
  }, []);

  const categories = [
    {
      id: 'predpripravka',
      label: 'Předpřípravka',
      shortLabel: 'U7',
      image: '/tym-u7.jpg',
    },
    {
      id: 'mladsi-pripravka',
      label: 'Mladší přípravka',
      shortLabel: 'U9',
      image: '/tym-u9.jpg',
    },
    {
      id: 'starsi-pripravka',
      label: 'Starší přípravka',
      shortLabel: 'U11',
      image: '/tym-u11.jpg',
    },
  ];

  const faqItems = [
    {
      question: 'Kolik stojí fotbal?',
      answer:
        'Členský příspěvek je 1 000 Kč za půl roku. Snažíme se, aby byl fotbal dostupný pro všechny děti, a zároveň aby to u nás mělo smysl a děti to bavilo.',
    },
    {
      question: 'Co když dítě nikdy nehrálo fotbal?',
      answer: 'To vůbec nevadí. Děti se u nás učí úplně od začátku.',
    },
    {
      question: 'Může si to dítě jen vyzkoušet?',
      answer: 'Ano, klidně přijďte na trénink a uvidíte, jestli ho to bude bavit.',
    },
    {
      question: 'Co potřebuje dítě na trénink?',
      answer:
        'Stačí sportovní oblečení, boty a pití. Oblečení je dobré přizpůsobit počasí, protože většina tréninků probíhá venku.',
    },
    {
      question: 'Jaké soutěže hrajeme a pro jak staré děti?',
      answer:
        'V sezóně 2025/2026 hrajeme soutěže v kategorii U9 v rámci okresu Blansko. Od sezóny 2026/2027 chceme přidat i kategorii U11, aby děti mohly přirozeně pokračovat dál. U9 je přibližně pro děti 7–9 let, U11 pak pro starší děti.',
    },
    {
      question: 'Od kolika let berete děti?',
      answer: 'Přibližně od 5 let.',
    },
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
      text: 'Kategorie je založená dopředu, aby bylo možné snadno doplnit zápasy, trenéry i další novinky pro příští sezonu.',
      date: '1. 4. 2026',
    },
  ];

  const team = {
    management: [
      {
        name: 'Roman Skovajsa',
        role: 'Předseda mládeže',
        subrole: 'Člen výboru ASK Lipůvka',
        photo: '/treneri/skovajsa.jpg',
      },
      {
        name: 'Radek Mánek',
        role: 'Vedoucí mládeže',
        subrole: 'Organizace a komunikace',
        licence: 'FAČR C+',
        phone: '606148368',
        phoneLabel: '606 148 368',
        email: 'radek.manek@email.cz',
        photo: '/treneri/manek.jpg',
      },
    ],
    trainers: [
      {
        category: 'predpripravka',
        name: 'Jan Gebauer',
        role: 'Trenér',
        licence: 'Grassroots',
        phone: '737146918',
        phoneLabel: '737 146 918',
        photo: '/treneri/gebauer.jpg',
      },
      {
        category: 'predpripravka',
        name: 'Jiří Filipčík',
        role: 'Trenér',
        licence: 'Grassroots',
        phone: '737235850',
        phoneLabel: '737 235 850',
        photo: '/treneri/filipcik.jpg',
      },
      {
        category: 'mladsi-pripravka',
        name: 'Zdenko Adámek',
        role: 'Trenér',
        licence: 'Grassroots',
        phone: '727836386',
        phoneLabel: '727 836 386',
        photo: '/treneri/adamek.jpg',
      },
      {
        category: 'mladsi-pripravka',
        name: 'Dalibor Hudec',
        role: 'Trenér',
        licence: 'Grassroots',
        phone: '737337966',
        phoneLabel: '737 337 966',
        photo: '/treneri/hudec.jpg',
      },
      {
        category: 'mladsi-pripravka',
        name: 'Jan Večeřa',
        role: 'Trenér',
        licence: 'Grassroots',
        phone: '733165250',
        phoneLabel: '733 165 250',
        photo: '/treneri/vecera.jpg',
      },
      {
        category: 'mladsi-pripravka',
        name: 'Radek Slavík',
        role: 'Trenér',
        licence: 'Grassroots',
        phone: '776423813',
        phoneLabel: '776 423 813',
        photo: '/treneri/slavik.jpg',
      },
      {
        category: 'starsi-pripravka',
        name: 'Libor Vinkler',
        role: 'Trenér',
        licence: 'Grassroots',
        phone: '736205150',
        phoneLabel: '736 205 150',
        photo: '/treneri/vinkler.jpg',
      },
    ],
  };

  const matches = [
    {
      category: 'mladsi-pripravka',
      date: '15. 3. 2026',
      opponent: 'Halový turnaj Blansko',
      time: '---',
      home: false,
      venue: 'Blansko',
      matchLabel1: 'Turnaj',
      result1: '1. místo v turnaji',
      scorers1: '',
      matchLabel2: '',
      result2: '',
      scorers2: '',
      articleTitle: 'Halový turnaj Blansko',
      article:
        'Naši nejmenší fotbalisté odehráli poslední halový turnaj zimní přípravy. Ve všech zápasech prokázali bojovnost a fotbalové srdce. Nakonec se probojovali do finále, kdy rozhodujícím gólem Tobíka Hudce v posledních minutách vybojovali krásné první místo. Děkujeme hráčům a v neposlední řadě rodičům za podporu.',
      photos: ['/zapasy/blansko1.jpg', '/zapasy/blansko2.jpg'],
      galleryAlbumId: '',
    },
    {
      category: 'mladsi-pripravka',
      date: '2. 4. 2026',
      opponent: 'RDR RJY/RJ',
      time: '17:00 / 18:00',
      home: true,
      venue: 'Lipůvka',
      matchLabel1: '',
      result1: '',
      scorers1: '',
      matchLabel2: '',
      result2: '',
      scorers2: '',
      articleTitle: '',
      article: '',
      photos: ['/field.png'],
      galleryAlbumId: '',
    },
    {
      category: 'mladsi-pripravka',
      date: '9. 4. 2026',
      opponent: 'RDR DX/D',
      time: '17:00 / 18:00',
      home: true,
      venue: 'Lipůvka',
      matchLabel1: '',
      result1: '',
      scorers1: '',
      matchLabel2: '',
      result2: '',
      scorers2: '',
      articleTitle: '',
      article: '',
      photos: ['/field.png'],
      galleryAlbumId: '',
    },
    {
      category: 'mladsi-pripravka',
      date: '14. 4. 2026',
      opponent: 'Olomučany/Babice',
      time: '17:00 / 18:00',
      home: false,
      venue: 'hřiště Olomučany',
      matchLabel1: '',
      result1: '',
      scorers1: '',
      matchLabel2: '',
      result2: '',
      scorers2: '',
      articleTitle: '',
      article: '',
      photos: ['/field.png'],
      galleryAlbumId: '',
    },
    {
      category: 'mladsi-pripravka',
      date: '23. 4. 2026',
      opponent: 'Ostrov/Lipovec',
      time: '17:00 / 18:00',
      home: true,
      venue: 'Lipůvka',
      matchLabel1: '',
      result1: '',
      scorers1: '',
      matchLabel2: '',
      result2: '',
      scorers2: '',
      articleTitle: '',
      article: '',
      photos: ['/field.png'],
      galleryAlbumId: '',
    },
    {
      category: 'mladsi-pripravka',
      date: '30. 4. 2026',
      opponent: 'Blansko C + (pozveme 1 tým)',
      time: '17:00 / 18:00',
      home: true,
      venue: 'Lipůvka',
      matchLabel1: '',
      result1: '',
      scorers1: '',
      matchLabel2: '',
      result2: '',
      scorers2: '',
      articleTitle: '',
      article: '',
      photos: ['/field.png'],
      galleryAlbumId: '',
    },
    {
      category: 'mladsi-pripravka',
      date: '12. 5. 2026',
      opponent: 'Kras',
      time: '17:00 / 18:00',
      home: false,
      venue: 'hřiště Jedovnice',
      matchLabel1: '',
      result1: '',
      scorers1: '',
      matchLabel2: '',
      result2: '',
      scorers2: '',
      articleTitle: '',
      article: '',
      photos: ['/field.png'],
      galleryAlbumId: '',
    },
    {
      category: 'mladsi-pripravka',
      date: '14. 5. 2026',
      opponent: 'Blansko A a B',
      time: '17:00 / 18:00',
      home: true,
      venue: 'Lipůvka',
      matchLabel1: '',
      result1: '',
      scorers1: '',
      matchLabel2: '',
      result2: '',
      scorers2: '',
      articleTitle: '',
      article: '',
      photos: ['/field.png'],
      galleryAlbumId: '',
    },
    {
      category: 'mladsi-pripravka',
      date: '24. 5. 2026',
      opponent: 'Knínice',
      time: '10:15',
      home: false,
      venue: 'hřiště Knínice',
      matchLabel1: '',
      result1: '',
      scorers1: '',
      matchLabel2: '',
      result2: '',
      scorers2: '',
      articleTitle: '',
      article: '',
      photos: ['/field.png'],
      galleryAlbumId: '',
    },
    {
      category: 'mladsi-pripravka',
      date: '28. 5. 2026',
      opponent: 'Boskovice',
      time: '17:00 / 18:00',
      home: true,
      venue: 'Lipůvka',
      matchLabel1: '',
      result1: '',
      scorers1: '',
      matchLabel2: '',
      result2: '',
      scorers2: '',
      articleTitle: '',
      article: '',
      photos: ['/field.png'],
      galleryAlbumId: '',
    },
    {
      category: 'mladsi-pripravka',
      date: '4. 6. 2026',
      opponent: 'Letovice',
      time: '16:30 / 17:30',
      home: false,
      venue: 'hřiště Letovice',
      matchLabel1: '',
      result1: '',
      scorers1: '',
      matchLabel2: '',
      result2: '',
      scorers2: '',
      articleTitle: '',
      article: '',
      photos: ['/field.png'],
      galleryAlbumId: '',
    },
    {
      category: 'mladsi-pripravka',
      date: '14. 6. 2026',
      opponent: 'RDR/RY + závěrečná',
      time: '14:00 / 15:00',
      home: true,
      venue: 'Lipůvka',
      matchLabel1: '',
      result1: '',
      scorers1: '',
      matchLabel2: '',
      result2: '',
      scorers2: '',
      articleTitle: '',
      article: '',
      photos: ['/field.png'],
      galleryAlbumId: '',
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

  const isVideoFile = (filePath) => {
    if (!filePath || typeof filePath !== 'string') return false;
    return /\.(mp4|webm|ogg)$/i.test(filePath);
  };

  const availableNews = useMemo(() => {
    return firebaseNews.length > 0 ? firebaseNews : newsItems;
  }, [firebaseNews]);

  const availableMatches = useMemo(() => {
    return firebaseMatches.length > 0 ? firebaseMatches : matches;
  }, [firebaseMatches]);

  const globalGalleryAlbums = useMemo(() => {
    return firebaseGallery.filter((album) => album.type === 'global');
  }, [firebaseGallery]);

  const getAlbumMatchDate = (albumId) => {
    const linkedMatch = availableMatches.find((match) => match.galleryAlbumId === albumId);
    if (!linkedMatch?.date) return new Date(0);
    return parseMatchDate(linkedMatch.date);
  };

  const getAlbumMatch = (albumId) => {
    return availableMatches.find((match) => match.galleryAlbumId === albumId) || null;
  };

  const teamGalleryAlbums = useMemo(() => {
    return firebaseGallery
      .filter((album) => album.type === 'team' && album.category === activeCategory)
      .sort((a, b) => getAlbumMatchDate(b.id) - getAlbumMatchDate(a.id));
  }, [firebaseGallery, activeCategory, availableMatches]);

  const visibleTeamGalleryAlbums = useMemo(() => {
    return showAllTeamAlbums ? teamGalleryAlbums : teamGalleryAlbums.slice(0, 3);
  }, [teamGalleryAlbums, showAllTeamAlbums]);

  const hasMoreTeamAlbums = teamGalleryAlbums.length > 3;

  const filteredNews = useMemo(
    () => availableNews.filter((item) => item.category === activeCategory),
    [availableNews, activeCategory]
  );

  const filteredMatches = useMemo(
    () => availableMatches.filter((match) => match.category === activeCategory),
    [availableMatches, activeCategory]
  );

  const upcomingMatches = filteredMatches
    .filter((m) => {
      const matchDate = parseMatchDate(m.date);
      const diffDays = (matchDate - todayStart) / (1000 * 60 * 60 * 24);
      return diffDays >= 0 && diffDays <= 14;
    })
    .sort((a, b) => parseMatchDate(a.date) - parseMatchDate(b.date));

  const playedMatches = filteredMatches
    .filter((m) => parseMatchDate(m.date) < todayStart)
    .sort((a, b) => parseMatchDate(b.date) - parseMatchDate(a.date));

  const latestPlayedMatch = playedMatches.length > 0 ? playedMatches[0] : null;
  const otherPlayedMatches = playedMatches.length > 1 ? playedMatches.slice(1) : [];

  const fullScheduleMatches = [...filteredMatches].sort(
    (a, b) => parseMatchDate(a.date) - parseMatchDate(b.date)
  );

  const activeCategoryData = categories.find((category) => category.id === activeCategory);
  const activeCategoryLabel = activeCategoryData?.label || '';
  const activeCategoryShortLabel = activeCategoryData?.shortLabel || '';
  const activeCategoryImage = activeCategoryData?.image || '/field.png';

  const selectedPhoto =
    selectedAlbum && selectedPhotoIndex !== null
      ? selectedAlbum.photos?.[selectedPhotoIndex]
      : null;

  const getCategoryShortLabel = (categoryId) => {
    const cat = categories.find((c) => c.id === categoryId);
    return cat?.shortLabel || '';
  };

  const getCategoryStyle = (categoryId) => {
    switch (categoryId) {
      case 'predpripravka':
        return {
          badge: 'bg-blue-600 text-white',
          softBadge: 'bg-blue-100 text-blue-700',
          light: 'bg-blue-50 border-blue-200',
          text: 'text-blue-600',
          button: 'bg-blue-600 text-white hover:bg-blue-700',
          buttonOutline: 'border-blue-500 text-blue-600 hover:bg-blue-50',
        };
      case 'mladsi-pripravka':
        return {
          badge: 'bg-green-600 text-white',
          softBadge: 'bg-green-100 text-green-700',
          light: 'bg-green-50 border-green-200',
          text: 'text-green-600',
          button: 'bg-green-600 text-white hover:bg-green-700',
          buttonOutline: 'border-green-500 text-green-600 hover:bg-green-50',
        };
      case 'starsi-pripravka':
        return {
          badge: 'bg-orange-500 text-white',
          softBadge: 'bg-orange-100 text-orange-700',
          light: 'bg-orange-50 border-orange-200',
          text: 'text-orange-600',
          button: 'bg-orange-500 text-white hover:bg-orange-600',
          buttonOutline: 'border-orange-500 text-orange-600 hover:bg-orange-50',
        };
      default:
        return {
          badge: 'bg-gray-500 text-white',
          softBadge: 'bg-gray-100 text-gray-700',
          light: 'bg-gray-50 border-gray-200',
          text: 'text-gray-600',
          button: 'bg-gray-500 text-white hover:bg-gray-600',
          buttonOutline: 'border-gray-500 text-gray-600 hover:bg-gray-50',
        };
    }
  };

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  const activeCategoryStyle = getCategoryStyle(activeCategory);

  const getMatchAlbum = (match) => {
    if (!match?.galleryAlbumId) return null;
    return firebaseGallery.find((album) => album.id === match.galleryAlbumId) || null;
  };

  const openMatchPhotoReport = (match) => {
    const album = getMatchAlbum(match);

    if (!album) {
      alert('K tomuto zápasu zatím není napojené album fotoreportu.');
      return;
    }

    setGallerySource(album.type === 'team' ? 'team' : 'global');
    setSelectedAlbum(album);
    setSelectedPhotoIndex(null);
    setIsGalleryOpen(true);
  };

  const goToPrevPhoto = () => {
    if (!selectedAlbum || selectedPhotoIndex === null || !selectedAlbum.photos?.length) return;
    setSelectedPhotoIndex((prev) => (prev === 0 ? selectedAlbum.photos.length - 1 : prev - 1));
  };

  const goToNextPhoto = () => {
    if (!selectedAlbum || selectedPhotoIndex === null || !selectedAlbum.photos?.length) return;
    setSelectedPhotoIndex((prev) =>
      prev === selectedAlbum.photos.length - 1 ? 0 : prev + 1
    );
  };

  const handleTouchStart = (e) => {
    touchStartX.current = e.changedTouches[0].screenX;
  };

  const handleTouchEnd = (e) => {
    touchEndX.current = e.changedTouches[0].screenX;
    const diff = touchStartX.current - touchEndX.current;

    if (Math.abs(diff) < 50) return;

    if (diff > 0) {
      goToNextPhoto();
    } else {
      goToPrevPhoto();
    }
  };

  const selectTeam = (categoryId) => {
    setActiveCategory(categoryId);
    setShowAllTeamAlbums(false);
    setIsTeamsDropdownOpen(false);
    setIsMobileTeamsDropdownOpen(false);
    setIsMobileMenuOpen(false);

    const topSection = document.getElementById('top');
    if (topSection) {
      topSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const closeGallery = () => {
    setSelectedPhotoIndex(null);
    setSelectedAlbum(null);
    setIsGalleryOpen(false);
    setGallerySource('global');
  };

  const backFromAlbum = () => {
    setSelectedPhotoIndex(null);

    if (gallerySource === 'team') {
      setSelectedAlbum(null);
      setIsGalleryOpen(false);
      return;
    }

    setSelectedAlbum(null);
  };

  const openTeamAlbum = (album) => {
    setGallerySource('team');
    setSelectedAlbum(album);
    setSelectedPhotoIndex(null);
    setIsGalleryOpen(true);
  };

  useEffect(() => {
    const loadVisits = async () => {
      try {
        const visitStorageKey = 'ask-lipuvka-visit-counted';
        const visitsDocRef = doc(db, 'siteStats', 'visits');
        const alreadyCounted = sessionStorage.getItem(visitStorageKey);

        if (alreadyCounted) {
          const snapshot = await getDoc(visitsDocRef);

          if (!snapshot.exists()) {
            await runTransaction(db, async (transaction) => {
              const currentSnapshot = await transaction.get(visitsDocRef);

              if (!currentSnapshot.exists()) {
                transaction.set(visitsDocRef, {
                  count: 478,
                  createdAt: serverTimestamp(),
                  updatedAt: serverTimestamp(),
                });
              }
            });

            setVisitCount(478);
            return;
          }

          setVisitCount(Number(snapshot.data()?.count) || 478);
          return;
        }

        const nextCount = await runTransaction(db, async (transaction) => {
          const snapshot = await transaction.get(visitsDocRef);

          if (!snapshot.exists()) {
            transaction.set(visitsDocRef, {
              count: 479,
              createdAt: serverTimestamp(),
              updatedAt: serverTimestamp(),
            });
            return 479;
          }

          const currentCount = Number(snapshot.data()?.count) || 478;
          const updatedCount = currentCount + 1;

          transaction.update(visitsDocRef, {
            count: updatedCount,
            updatedAt: serverTimestamp(),
          });

          return updatedCount;
        });

        setVisitCount(nextCount);
        sessionStorage.setItem(visitStorageKey, 'true');
      } catch (error) {
        console.error('Chyba při načítání návštěvnosti:', error);
      }
    };

    loadVisits();
  }, []);

  useEffect(() => {
    const loadFirebaseData = async () => {
      try {
        const newsSnapshot = await getDocs(collection(db, 'news'));
        const loadedNews = newsSnapshot.docs.map((item) => ({
          id: item.id,
          ...item.data(),
        }));

        const matchesSnapshot = await getDocs(collection(db, 'matches'));
        const loadedMatches = matchesSnapshot.docs.map((item) => ({
          id: item.id,
          ...item.data(),
        }));

        const gallerySnapshot = await getDocs(collection(db, 'gallery'));
        const loadedGallery = gallerySnapshot.docs.map((item) => ({
          id: item.id,
          ...item.data(),
        }));

        setFirebaseNews(loadedNews);
        setFirebaseMatches(loadedMatches);
        setFirebaseGallery(loadedGallery);
      } catch (error) {
        console.error('Firebase chyba:', error);
      }
    };

    loadFirebaseData();
  }, []);

  useEffect(() => {
    const handleEsc = (event) => {
      if (event.key !== 'Escape') return;

      if (selectedPhotoIndex !== null) {
        setSelectedPhotoIndex(null);
        return;
      }

      if (selectedAlbum) {
        if (gallerySource === 'team') {
          setSelectedAlbum(null);
          setIsGalleryOpen(false);
        } else {
          setSelectedAlbum(null);
        }
        return;
      }

      if (isGalleryOpen) {
        closeGallery();
        return;
      }

      setIsRegistrationOpen(false);
      setIsTrainersOpen(false);
      setIsMobileMenuOpen(false);
      setClubPopupContent(null);
      setIsClubDropdownOpen(false);
      setIsTeamsDropdownOpen(false);
      setIsMobileTeamsDropdownOpen(false);
      setIsMobileClubDropdownOpen(false);
      setIsTermsOpen(false);
      setIsScheduleOpen(false);
    };

    const handleClickOutside = () => {
      setIsClubDropdownOpen(false);
      setIsTeamsDropdownOpen(false);
    };

    const handleArrowKeys = (event) => {
      if (selectedPhotoIndex === null) return;

      if (event.key === 'ArrowLeft') {
        goToPrevPhoto();
      }

      if (event.key === 'ArrowRight') {
        goToNextPhoto();
      }
    };

    window.addEventListener('keydown', handleEsc);
    window.addEventListener('keydown', handleArrowKeys);
    document.addEventListener('click', handleClickOutside);

    return () => {
      window.removeEventListener('keydown', handleEsc);
      window.removeEventListener('keydown', handleArrowKeys);
      document.removeEventListener('click', handleClickOutside);
    };
  }, [selectedPhotoIndex, selectedAlbum, isGalleryOpen, gallerySource]);

  useEffect(() => {
    const shouldLock =
      isRegistrationOpen ||
      isTrainersOpen ||
      isMobileMenuOpen ||
      clubPopupContent ||
      isGalleryOpen ||
      selectedPhoto ||
      isTermsOpen ||
      isScheduleOpen;

    document.body.style.overflow = shouldLock ? 'hidden' : '';

    return () => {
      document.body.style.overflow = '';
    };
  }, [
    isRegistrationOpen,
    isTrainersOpen,
    isMobileMenuOpen,
    clubPopupContent,
    isGalleryOpen,
    selectedPhoto,
    isTermsOpen,
    isScheduleOpen,
  ]);

  useEffect(() => {
    document.documentElement.classList.toggle('theme-dark', theme === 'dark');
    document.documentElement.style.colorScheme = theme;
    localStorage.setItem('ask-lipuvka-theme', theme);

    return () => {
      document.documentElement.style.colorScheme = '';
    };
  }, [theme]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData.entries());

    try {
      const response = await fetch('/api/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ typ: 'registrace', ...data }),
      });

      if (!response.ok) {
        throw new Error('Nepodařilo se odeslat formulář.');
      }

      alert('Registrace byla odeslána');
      e.target.reset();
      setTermsAccepted(false);
      setIsRegistrationOpen(false);
    } catch (err) {
      alert('Chyba při odesílání');
      console.error(err);
    }
  };

  const handleSubmitPodnet = async (e) => {
    e.preventDefault();

    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData.entries());

    try {
      const response = await fetch('/api/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ typ: 'podnet', ...data }),
      });

      if (!response.ok) {
        throw new Error('Nepodařilo se odeslat podnět.');
      }

      alert('Podnět byl odeslán');
      e.target.reset();
      setClubPopupContent(null);
    } catch (err) {
      alert('Chyba při odesílání');
      console.error(err);
    }
  };

  const openRegistration = () => {
    setIsMobileMenuOpen(false);
    setIsMobileClubDropdownOpen(false);
    setIsMobileTeamsDropdownOpen(false);
    setIsRegistrationOpen(true);
  };

  const openTrainers = () => {
    setIsMobileMenuOpen(false);
    setIsMobileClubDropdownOpen(false);
    setIsMobileTeamsDropdownOpen(false);
    setIsTrainersOpen(true);
  };

  const openGallery = () => {
    setIsMobileMenuOpen(false);
    setIsMobileClubDropdownOpen(false);
    setIsMobileTeamsDropdownOpen(false);
    setGallerySource('global');
    setIsGalleryOpen(true);
    setSelectedAlbum(null);
    setSelectedPhotoIndex(null);
  };

  const openClubPopup = (content) => {
    setClubPopupContent(content);
    setOpenFaqIndex(null);
    setIsClubDropdownOpen(false);
    setIsMobileMenuOpen(false);
    setIsMobileClubDropdownOpen(false);
    setIsMobileTeamsDropdownOpen(false);
  };

  const openRecruitmentFromPopup = () => {
    setClubPopupContent(null);
    setIsRegistrationOpen(true);
  };

  const renderMatchCard = (m, showResult = true) => {
    const isToday = isSameDay(parseMatchDate(m.date), todayStart);
    const isPlayed = parseMatchDate(m.date) < todayStart;
    const categoryStyle = getCategoryStyle(m.category);
    const hasPhotoReport = isPlayed && Boolean(getMatchAlbum(m));

    const firstPlayedResult = m.result1?.trim();
    const secondPlayedResult = m.result2?.trim();
    const label1 = m.matchLabel1?.trim() || '1. blok';
    const label2 = m.matchLabel2?.trim() || '2. blok';

    return (
      <div
        key={m.id || `${m.date}-${m.opponent}`}
        className={`rounded-2xl border p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md ${
          isToday
            ? 'border-green-500 bg-green-50 ring-2 ring-green-300 shadow-lg'
            : categoryStyle.light
        }`}
      >
        <button
          type="button"
          onClick={() => m.id && navigate(`/zapas/${m.id}`)}
          className="w-full text-left"
        >
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <div className="flex flex-wrap items-center gap-2 text-lg font-bold text-gray-900">
                  <span>
                    {m.home ? `ASK Lipůvka vs. ${m.opponent}` : `${m.opponent} vs. ASK Lipůvka`}
                  </span>
                  <span className={`rounded-full px-2 py-0.5 text-xs font-bold ${categoryStyle.badge}`}>
                    {getCategoryShortLabel(m.category)}
                  </span>
                </div>

                {isToday && (
                  <span className="animate-pulse rounded-full bg-green-600 px-4 py-1 text-xs font-bold uppercase tracking-wide text-white shadow-md">
                    DNES
                  </span>
                )}
              </div>

              <div className="mt-1 text-sm text-gray-500">
                {m.date} • {m.time} • {m.home ? 'Domácí zápas' : 'Venkovní zápas'}
                {!m.home && m.venue ? ` • ${m.venue}` : ''}
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
                <div className="flex flex-col gap-2 text-right">
                  {firstPlayedResult && (
                    <span className="rounded-full bg-gray-100 px-3 py-1 text-sm font-semibold text-gray-700">
                      {label1}: {firstPlayedResult}
                    </span>
                  )}
                  {secondPlayedResult && (
                    <span className="rounded-full bg-gray-100 px-3 py-1 text-sm font-semibold text-gray-700">
                      {label2}: {secondPlayedResult}
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>
        </button>

        {hasPhotoReport && (
          <div className="mt-4 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => openMatchPhotoReport(m)}
              className={`flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition hover:scale-105 hover:shadow-md ${categoryStyle.button}`}
            >
              Fotky
            </button>
          </div>
        )}
      </div>
    );
  };


  const renderLatestPlayedHighlight = (m) => {
    if (!m) return null;

    const categoryStyle = getCategoryStyle(m.category);
    const album = getMatchAlbum(m);
    const hasPhotoReport = Boolean(album);
    const coverSrc = album?.cover || album?.photos?.[0] || '/field.png';

    const firstPlayedResult = m.result1?.trim();
    const secondPlayedResult = m.result2?.trim();
    const label1 = m.matchLabel1?.trim() || '1. blok';
    const label2 = m.matchLabel2?.trim() || '2. blok';

    const articlePreview = m.article?.trim()
      ? `${m.article.trim().slice(0, 220)}${m.article.trim().length > 220 ? '…' : ''}`
      : 'Klikni na detail zápasu a zobraz si výsledek, report i fotky.';

    return (
      <div className="mb-6 overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-lg">
        <button
          type="button"
          onClick={() => m.id && navigate(`/zapas/${m.id}`)}
          className="block w-full text-left"
        >
          <div className="relative">
            {isVideoFile(coverSrc) ? (
              <video
                src={coverSrc}
                className="h-[250px] w-full object-cover md:h-[320px]"
                muted
                playsInline
                preload="metadata"
              />
            ) : (
              <img
                src={coverSrc}
                alt={m.home ? `ASK Lipůvka vs. ${m.opponent}` : `${m.opponent} vs. ASK Lipůvka`}
                className="h-[250px] w-full object-cover md:h-[320px]"
              />
            )}

            <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/30 to-transparent" />

            <div className="absolute left-4 top-4 md:left-6 md:top-6">
              <span className="rounded-full bg-white/90 px-4 py-2 text-xs font-black uppercase tracking-wide text-gray-900 shadow-sm">
                Poslední odehraný zápas
              </span>
            </div>

            <div className="absolute bottom-0 left-0 w-full p-5 text-white md:p-7">
              <div className="mb-3 flex flex-wrap items-center gap-2">
                <span className={`rounded-full px-3 py-1 text-xs font-bold ${categoryStyle.badge}`}>
                  {getCategoryShortLabel(m.category)}
                </span>
                <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-bold text-white backdrop-blur">
                  {m.date}
                </span>
                <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-bold text-white backdrop-blur">
                  {m.home ? 'Domácí' : 'Venkovní'}
                </span>
              </div>

              <h3 className="text-2xl font-black leading-tight drop-shadow md:text-4xl">
                {m.home ? `ASK Lipůvka vs. ${m.opponent}` : `${m.opponent} vs. ASK Lipůvka`}
              </h3>

              <div className="mt-2 text-sm text-white/90 md:text-base">
                {m.time} • {m.home ? 'Lipůvka' : m.venue || 'bude doplněno'}
              </div>
            </div>
          </div>

          <div className="p-5 md:p-7">
            <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
              <div>
                <div className="mb-3 flex flex-wrap items-center gap-3">
                  <span className={`rounded-full px-3 py-1 text-sm font-bold ${categoryStyle.softBadge}`}>
                    Hlavní tahák
                  </span>
                  <span className="text-sm font-semibold text-gray-500">
                    Klikni kamkoliv pro detail zápasu
                  </span>
                </div>

                <p className="max-w-3xl leading-7 text-gray-700">
                  {articlePreview}
                </p>
              </div>

              <div className="space-y-3">
                {firstPlayedResult && (
                  <div className="rounded-2xl bg-gray-50 p-4">
                    <div className="mb-1 text-xs font-bold uppercase tracking-wide text-gray-500">
                      {label1}
                    </div>
                    <div className="text-2xl font-black text-gray-900 md:text-3xl">
                      {firstPlayedResult}
                    </div>
                  </div>
                )}

                {secondPlayedResult && (
                  <div className="rounded-2xl bg-gray-50 p-4">
                    <div className="mb-1 text-xs font-bold uppercase tracking-wide text-gray-500">
                      {label2}
                    </div>
                    <div className="text-2xl font-black text-gray-900 md:text-3xl">
                      {secondPlayedResult}
                    </div>
                  </div>
                )}

                {!firstPlayedResult && !secondPlayedResult && (
                  <div className="rounded-2xl bg-gray-50 p-4 text-sm text-gray-600">
                    Výsledek je v detailu zápasu.
                  </div>
                )}
              </div>
            </div>
          </div>
        </button>

        {hasPhotoReport && (
          <div className="border-t border-gray-100 px-5 pb-5 pt-4 md:px-7 md:pb-7">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                openMatchPhotoReport(m);
              }}
              className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition hover:scale-105 hover:shadow-md ${categoryStyle.button}`}
            >
              Fotky
            </button>
          </div>
        )}
      </div>
    );
  };

  const renderAlbumCover = (album) => {
    const coverSrc = album.cover || album.photos?.[0] || '/field.png';

    if (isVideoFile(coverSrc)) {
      return (
        <div className="relative h-56 w-full overflow-hidden bg-black">
          <video
            src={coverSrc}
            className="h-full w-full object-cover"
            muted
            playsInline
            preload="metadata"
          />
          <div className="absolute inset-0 flex items-center justify-center bg-black/20">
            <div className="rounded-full bg-white/90 px-4 py-2 text-sm font-bold text-gray-900">
              ▶ Video
            </div>
          </div>
        </div>
      );
    }

    return <img src={coverSrc} alt={album.title} className="h-56 w-full object-cover" />;
  };

  const renderGalleryThumb = (media, index, title) => {
    if (isVideoFile(media)) {
      return (
        <button
          type="button"
          key={`${media}-${index}`}
          onClick={() => setSelectedPhotoIndex(index)}
          className="overflow-hidden rounded-2xl bg-black"
        >
          <div className="relative">
            <video
              src={media}
              className="h-40 w-full rounded-2xl object-cover transition hover:scale-105"
              muted
              playsInline
              preload="metadata"
            />
            <div className="absolute inset-0 flex items-center justify-center bg-black/20">
              <div className="rounded-full bg-white/90 px-3 py-1 text-xs font-bold text-gray-900">
                ▶ Přehrát
              </div>
            </div>
          </div>
        </button>
      );
    }

    return (
      <button
        type="button"
        key={`${media}-${index}`}
        onClick={() => setSelectedPhotoIndex(index)}
        className="overflow-hidden rounded-2xl"
      >
        <img
          src={media}
          alt={`${title} ${index + 1}`}
          className="h-40 w-full rounded-2xl object-cover transition hover:scale-105"
        />
      </button>
    );
  };

  return (
    <div className="min-h-screen bg-white text-gray-900">
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes scaleIn {
          from { opacity: 0; transform: scale(0.96); }
          to { opacity: 1; transform: scale(1); }
        }

        @keyframes slideInRight {
          from { opacity: 0; transform: translateX(24px); }
          to { opacity: 1; transform: translateX(0); }
        }

        @keyframes softReveal {
          from { opacity: 0; transform: translateY(-6px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @keyframes faqContentIn {
          from { opacity: 0; transform: translateY(-8px); max-height: 0; }
          to { opacity: 1; transform: translateY(0); max-height: 420px; }
        }

        @keyframes hintBounce {
          0%, 100% { transform: translateY(0); opacity: 0.85; }
          50% { transform: translateY(6px); opacity: 1; }
        }
      `}</style>

      <header className="sticky top-0 z-20 border-b bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <a href="#top" className="flex items-center gap-3">
            <img src="/logo.png" alt="logo" className="h-10 w-10 rounded-full" />
            <div className="text-lg font-bold text-green-600 md:text-xl">
              ASK Lipůvka – mládež
            </div>
          </a>

          <div className="hidden items-center gap-3 md:flex">
            <button
              type="button"
              onClick={toggleTheme}
              className="theme-toggle-button"
              aria-label={theme === 'light' ? 'Přepnout na tmavý režim' : 'Přepnout na světlý režim'}
            >
              <span>{theme === 'light' ? '🌙' : '☀️'}</span>
              <span>{theme === 'light' ? 'Tmavý režim' : 'Světlý režim'}</span>
            </button>

          <nav className="hidden gap-6 text-sm md:flex">
            <a href="#novinky" className="hover:text-green-600">Novinky</a>
            <a href="#zapasy" className="hover:text-green-600">Zápasy</a>

            <div className="relative" onClick={(e) => e.stopPropagation()}>
              <button
                type="button"
                onClick={() => {
                  setIsTeamsDropdownOpen((prev) => {
                    const next = !prev;
                    if (next) setIsClubDropdownOpen(false);
                    return next;
                  });
                }}
                className="hover:text-green-600"
              >
                Týmy ▼
              </button>

              {isTeamsDropdownOpen && (
                <div className="absolute left-0 top-full mt-2 min-w-[220px] rounded-2xl border border-gray-200 bg-white p-2 shadow-xl">
                  <button
                    type="button"
                    onClick={() => selectTeam('predpripravka')}
                    className="block w-full rounded-xl px-4 py-3 text-left text-gray-800 hover:bg-gray-100"
                  >
                    U7 – Předpřípravka
                  </button>

                  <button
                    type="button"
                    onClick={() => selectTeam('mladsi-pripravka')}
                    className="block w-full rounded-xl px-4 py-3 text-left text-gray-800 hover:bg-gray-100"
                  >
                    U9 – Mladší přípravka
                  </button>

                  <button
                    type="button"
                    onClick={() => selectTeam('starsi-pripravka')}
                    className="block w-full rounded-xl px-4 py-3 text-left text-gray-800 hover:bg-gray-100"
                  >
                    U11 – Starší přípravka
                  </button>
                </div>
              )}
            </div>

            <button type="button" onClick={openGallery} className="hover:text-green-600">
              Galerie
            </button>

            <div className="relative" onClick={(e) => e.stopPropagation()}>
              <button
                type="button"
                onClick={() => {
                  setIsClubDropdownOpen((prev) => {
                    const next = !prev;
                    if (next) setIsTeamsDropdownOpen(false);
                    return next;
                  });
                }}
                className="hover:text-green-600"
              >
                Klub ▼
              </button>

              {isClubDropdownOpen && (
                <div className="absolute left-0 top-full mt-2 min-w-[230px] rounded-2xl border border-gray-200 bg-white p-2 shadow-xl">
                  <button
                    type="button"
                    onClick={() => openClubPopup('filozofie')}
                    className="block w-full rounded-xl px-4 py-3 text-left text-gray-800 hover:bg-gray-100"
                  >
                    Filozofie
                  </button>

                  <button
                    type="button"
                    onClick={() => openClubPopup('rodice')}
                    className="block w-full rounded-xl px-4 py-3 text-left text-gray-800 hover:bg-gray-100"
                  >
                    Pro rodiče
                  </button>

                  <button
                    type="button"
                    onClick={() => openClubPopup('faq')}
                    className="block w-full rounded-xl px-4 py-3 text-left text-gray-800 hover:bg-gray-100"
                  >
                    FAQ
                  </button>

                  <button
                    type="button"
                    onClick={() => openClubPopup('nabor')}
                    className="block w-full rounded-xl px-4 py-3 text-left text-gray-800 hover:bg-gray-100"
                  >
                    Nábor hráčů
                  </button>

                  <button
                    type="button"
                    onClick={openRegistration}
                    className="block w-full rounded-xl px-4 py-3 text-left text-gray-800 hover:bg-gray-100"
                  >
                    Registrace hráče
                  </button>

                  <button
                    type="button"
                    onClick={() => openClubPopup('podnety')}
                    className="block w-full rounded-xl px-4 py-3 text-left text-gray-800 hover:bg-gray-100"
                  >
                    Kniha podnětů
                  </button>
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={() => openClubPopup('partneri')}
              className="hover:text-green-600"
            >
              Partneři
            </button>

            <button type="button" onClick={openTrainers} className="hover:text-green-600">
              Trenéři
            </button>

            <button
              type="button"
              onClick={() => openClubPopup('kde-nas-najdete')}
              className="hover:text-green-600"
            >
              Kde nás najdete
            </button>
          </nav>
          </div>

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
          className="fixed inset-0 z-40 bg-black/40 md:hidden animate-[fadeIn_0.22s_ease-out]"
          onClick={() => setIsMobileMenuOpen(false)}
        >
          <div
            className={`ml-auto flex h-full w-[88%] max-w-sm flex-col overflow-y-auto rounded-l-[2rem] shadow-2xl ${
              theme === 'dark'
                ? 'border-l border-white/20 bg-gradient-to-b from-[#0f1a17] via-[#0c1513] to-[#08110f]'
                : 'border-l border-[#efe7da] bg-gradient-to-b from-[#fcfaf6] via-[#f7f2e9] to-[#f2eadf]'
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="border-b border-[#e7dccb] bg-white px-5 pb-5 pt-6">
              <div className="mb-2 flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <img src="/logo.png" alt="logo" className="h-11 w-11 rounded-full ring-2 ring-green-100" />
                  <div>
                    <div className="text-lg font-black text-green-700">
                      ASK Lipůvka
                    </div>
                    <div className="text-sm text-gray-500">
                      Mládežnický fotbal
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex h-11 w-11 items-center justify-center rounded-2xl border border-gray-200 bg-white text-2xl text-gray-600 shadow-sm transition hover:bg-gray-50"
                  aria-label="Zavřít menu"
                >
                  ×
                </button>
              </div>
            </div>

            <div className="flex flex-1 flex-col px-3 pb-4 pt-3">
              <a
                href="#novinky"
                onClick={() => setIsMobileMenuOpen(false)}
                className={`mx-2 rounded-2xl px-4 py-4 text-left text-[1.05rem] font-semibold transition ${theme === 'dark' ? 'text-white hover:bg-white/5' : 'text-gray-800 hover:bg-white hover:shadow-sm'}`}
              >
                Novinky
              </a>

              <a
                href="#zapasy"
                onClick={() => setIsMobileMenuOpen(false)}
                className={`mx-2 rounded-2xl px-4 py-4 text-left text-[1.05rem] font-semibold transition ${theme === 'dark' ? 'text-white hover:bg-white/5' : 'text-gray-800 hover:bg-white hover:shadow-sm'}`}
              >
                Zápasy
              </a>

              <button
                type="button"
                onClick={() => {
                  setIsMobileTeamsDropdownOpen((prev) => {
                    const next = !prev;
                    if (next) setIsMobileClubDropdownOpen(false);
                    return next;
                  });
                }}
                className={`mx-2 rounded-2xl px-4 py-4 text-left text-[1.05rem] font-semibold transition ${theme === 'dark' ? 'text-white hover:bg-white/5' : 'text-gray-800 hover:bg-white hover:shadow-sm'}`}
              >
                Týmy {isMobileTeamsDropdownOpen ? '▲' : '▼'}
              </button>

              {isMobileTeamsDropdownOpen && (
                <div className={`mx-2 mb-2 flex flex-col rounded-2xl p-2 ${theme === 'dark' ? 'border border-emerald-900/40 bg-white/5' : 'border border-[#e8dece] bg-white/80 shadow-sm'}`}>
                  <button
                    type="button"
                    onClick={() => selectTeam('predpripravka')}
                    className={`rounded-xl px-4 py-3 text-left transition ${theme === 'dark' ? 'text-slate-200 hover:bg-white/5' : 'text-gray-700 hover:bg-[#f8f4ed]'}`}
                  >
                    U7 – Předpřípravka
                  </button>
                  <button
                    type="button"
                    onClick={() => selectTeam('mladsi-pripravka')}
                    className={`rounded-xl px-4 py-3 text-left transition ${theme === 'dark' ? 'text-slate-200 hover:bg-white/5' : 'text-gray-700 hover:bg-[#f8f4ed]'}`}
                  >
                    U9 – Mladší přípravka
                  </button>
                  <button
                    type="button"
                    onClick={() => selectTeam('starsi-pripravka')}
                    className={`rounded-xl px-4 py-3 text-left transition ${theme === 'dark' ? 'text-slate-200 hover:bg-white/5' : 'text-gray-700 hover:bg-[#f8f4ed]'}`}
                  >
                    U11 – Starší přípravka
                  </button>
                </div>
              )}

              <button
                type="button"
                onClick={openGallery}
                className={`mx-2 rounded-2xl px-4 py-4 text-left text-[1.05rem] font-semibold transition ${theme === 'dark' ? 'text-white hover:bg-white/5' : 'text-gray-800 hover:bg-white hover:shadow-sm'}`}
              >
                Galerie
              </button>

              <button
                type="button"
                onClick={() => {
                  setIsMobileClubDropdownOpen((prev) => {
                    const next = !prev;
                    if (next) setIsMobileTeamsDropdownOpen(false);
                    return next;
                  });
                }}
                className={`mx-2 rounded-2xl px-4 py-4 text-left text-[1.05rem] font-semibold transition ${theme === 'dark' ? 'text-white hover:bg-white/5' : 'text-gray-800 hover:bg-white hover:shadow-sm'}`}
              >
                Klub {isMobileClubDropdownOpen ? '▲' : '▼'}
              </button>

              {isMobileClubDropdownOpen && (
                <div className={`mx-2 mb-2 flex flex-col rounded-2xl p-2 ${theme === 'dark' ? 'border border-emerald-900/40 bg-white/5' : 'border border-[#e8dece] bg-white/80 shadow-sm'}`}>
                  <button
                    type="button"
                    onClick={() => openClubPopup('filozofie')}
                    className={`rounded-xl px-4 py-3 text-left transition ${theme === 'dark' ? 'text-slate-200 hover:bg-white/5' : 'text-gray-700 hover:bg-[#f8f4ed]'}`}
                  >
                    Filozofie
                  </button>

                  <button
                    type="button"
                    onClick={() => openClubPopup('rodice')}
                    className={`rounded-xl px-4 py-3 text-left transition ${theme === 'dark' ? 'text-slate-200 hover:bg-white/5' : 'text-gray-700 hover:bg-[#f8f4ed]'}`}
                  >
                    Pro rodiče
                  </button>

                  <button
                    type="button"
                    onClick={() => openClubPopup('faq')}
                    className={`rounded-xl px-4 py-3 text-left transition ${theme === 'dark' ? 'text-slate-200 hover:bg-white/5' : 'text-gray-700 hover:bg-[#f8f4ed]'}`}
                  >
                    FAQ
                  </button>

                  <button
                    type="button"
                    onClick={() => openClubPopup('nabor')}
                    className={`rounded-xl px-4 py-3 text-left transition ${theme === 'dark' ? 'text-slate-200 hover:bg-white/5' : 'text-gray-700 hover:bg-[#f8f4ed]'}`}
                  >
                    Nábor hráčů
                  </button>

                  <button
                    type="button"
                    onClick={openRegistration}
                    className={`rounded-xl px-4 py-3 text-left transition ${theme === 'dark' ? 'text-slate-200 hover:bg-white/5' : 'text-gray-700 hover:bg-[#f8f4ed]'}`}
                  >
                    Registrace hráče
                  </button>

                  <button
                    type="button"
                    onClick={() => openClubPopup('podnety')}
                    className={`rounded-xl px-4 py-3 text-left transition ${theme === 'dark' ? 'text-slate-200 hover:bg-white/5' : 'text-gray-700 hover:bg-[#f8f4ed]'}`}
                  >
                    Kniha podnětů
                  </button>
                </div>
              )}

              <button
                type="button"
                onClick={() => openClubPopup('kde-nas-najdete')}
                className={`mx-2 rounded-2xl px-4 py-4 text-left text-[1.05rem] font-semibold transition ${theme === 'dark' ? 'text-white hover:bg-white/5' : 'text-gray-800 hover:bg-white hover:shadow-sm'}`}
              >
                Kde nás najdete
              </button>

              <button
                type="button"
                onClick={() => openClubPopup('partneri')}
                className={`mx-2 rounded-2xl px-4 py-4 text-left text-[1.05rem] font-semibold transition ${theme === 'dark' ? 'text-white hover:bg-white/5' : 'text-gray-800 hover:bg-white hover:shadow-sm'}`}
              >
                Partneři
              </button>

              <button
                type="button"
                onClick={openTrainers}
                className={`mx-2 rounded-2xl px-4 py-4 text-left text-[1.05rem] font-semibold transition ${theme === 'dark' ? 'text-white hover:bg-white/5' : 'text-gray-800 hover:bg-white hover:shadow-sm'}`}
              >
                Trenéři
              </button>

              <div className="mt-auto px-2 pt-4">
                <div
                  className={`rounded-3xl p-4 shadow-sm ${
                    theme === 'dark'
                      ? 'border border-emerald-900/40 bg-gradient-to-br from-[#101816] to-[#0b1311]'
                      : 'border border-[#e8dece] bg-white/85'
                  }`}
                >
                  <div className={`mb-3 text-xs font-bold uppercase tracking-[0.18em] ${
                    theme === 'dark' ? 'text-emerald-200/65' : 'text-gray-500'
                  }`}>
                    Zobrazení webu
                  </div>
                  <button
                    type="button"
                    onClick={toggleTheme}
                    className="theme-toggle-button w-full justify-center"
                    aria-label={theme === 'light' ? 'Přepnout na tmavý režim' : 'Přepnout na světlý režim'}
                  >
                    <span>{theme === 'light' ? '🌙' : '☀️'}</span>
                    <span>{theme === 'light' ? 'Tmavý režim' : 'Světlý režim'}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <section
        id="top"
        className="relative flex min-h-[72vh] items-center justify-center px-4 text-center md:h-[80vh]"
      >
        <img src="/field.png" alt="hřiště" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-black/35" />

        <div className="relative z-10 max-w-xl text-center">
          <img src="/logo.png" alt="logo" className="mx-auto mb-4 w-16 md:w-20" />

          <h1 className="mb-2 text-3xl font-black text-white drop-shadow md:text-5xl">
            ASK Lipůvka
          </h1>

          <p className="mb-6 text-sm text-white/80 md:text-base">
            Oficiální klubový web mládeže ASK Lipůvka
          </p>

          <div className="flex flex-wrap justify-center gap-3">
            {categories.map((category) => {
              const isActive = activeCategory === category.id;
              const categoryStyle = getCategoryStyle(category.id);

              return (
                <button
                  key={category.id}
                  type="button"
                  onClick={() => selectTeam(category.id)}
                  className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition ${
                    isActive
                      ? `${categoryStyle.button} shadow-lg`
                      : 'bg-white text-gray-800 hover:scale-105'
                  }`}
                >
                  {category.label}
                  <span className="rounded-full bg-black/10 px-2 py-0.5 text-xs">
                    {category.shortLabel}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <a
          href="#novinky"
          className="absolute bottom-6 left-1/2 z-10 -translate-x-1/2 text-white/90 transition hover:text-white"
          aria-label="Posunout dolů"
          style={{ animation: 'hintBounce 1.8s ease-in-out infinite' }}
        >
          <div className="flex flex-col items-center gap-1">
            <span className="text-xs font-semibold uppercase tracking-[0.18em]">Scroll</span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </a>
      </section>

      <section id="novinky" className="mx-auto max-w-5xl px-6 py-14">
        <div className={`rounded-3xl border p-8 shadow-sm ${activeCategoryStyle.light}`}>
          <div className="mb-2 flex flex-wrap items-center gap-3">
            <div className={`text-sm font-semibold uppercase tracking-wide ${activeCategoryStyle.text}`}>
              {activeCategoryLabel}
            </div>
            <span className={`rounded-full px-3 py-1 text-xs font-bold ${activeCategoryStyle.softBadge}`}>
              {activeCategoryShortLabel}
            </span>
          </div>

          <h2 className={`mb-4 text-3xl font-bold ${activeCategoryStyle.text}`}>Novinky</h2>

          {filteredNews.length > 0 ? (
            <div className="space-y-4">
              {filteredNews.map((item) => (
                <div key={`${item.category}-${item.title}`} className="rounded-2xl bg-white p-5 shadow-sm">
                  <div className={`mb-2 text-sm font-semibold uppercase tracking-wide ${activeCategoryStyle.text}`}>
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
          <div className={`text-sm font-semibold uppercase tracking-wide ${activeCategoryStyle.text}`}>
            {activeCategoryLabel}
          </div>
          <span className={`rounded-full px-3 py-1 text-xs font-bold ${activeCategoryStyle.softBadge}`}>
            {activeCategoryShortLabel}
          </span>
        </div>

        <div className="mb-6">
          <h2 className={`mb-2 text-3xl font-bold ${activeCategoryStyle.text}`}>Nadcházející zápasy</h2>

          <button
            type="button"
            onClick={() => setIsScheduleOpen(true)}
            className={`mt-4 rounded-xl px-6 py-3 font-semibold transition hover:scale-[1.02] ${activeCategoryStyle.button}`}
          >
            Rozpis zápasů – Jaro 2026
          </button>
        </div>

        <div className="space-y-4">
          {upcomingMatches.length > 0 ? (
            upcomingMatches.map((m) => renderMatchCard(m, Boolean(m.result1 || m.result2)))
          ) : (
            <div className="rounded-2xl bg-gray-100 p-5 text-gray-600">
              V následujících 14 dnech nejsou pro tuto kategorii naplánované žádné zápasy.
            </div>
          )}
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-6 py-14">
        <div className="mb-3 flex flex-wrap items-center gap-3">
          <div className={`text-sm font-semibold uppercase tracking-wide ${activeCategoryStyle.text}`}>
            {activeCategoryLabel}
          </div>
          <span className={`rounded-full px-3 py-1 text-xs font-bold ${activeCategoryStyle.softBadge}`}>
            {activeCategoryShortLabel}
          </span>
        </div>

        <h2 className={`mb-6 text-3xl font-bold ${activeCategoryStyle.text}`}>Odehrané zápasy</h2>

        {latestPlayedMatch ? (
          <>
            {renderLatestPlayedHighlight(latestPlayedMatch)}

            {otherPlayedMatches.length > 0 && (
              <div className="space-y-4">
                {otherPlayedMatches.map((m) => renderMatchCard(m, true))}
              </div>
            )}
          </>
        ) : (
          <div className="rounded-2xl bg-gray-100 p-5 text-gray-600">
            Pro tuto kategorii zatím nejsou žádné odehrané zápasy.
          </div>
        )}
      </section>

      <section className="mx-auto max-w-5xl px-6 pb-14">
        <div className={`rounded-3xl border p-8 shadow-sm ${activeCategoryStyle.light}`}>
          <div className="mb-2 flex flex-wrap items-center gap-3">
            <div className={`text-sm font-semibold uppercase tracking-wide ${activeCategoryStyle.text}`}>
              {activeCategoryLabel}
            </div>
            <span className={`rounded-full px-3 py-1 text-xs font-bold ${activeCategoryStyle.softBadge}`}>
              {activeCategoryShortLabel}
            </span>
          </div>

          <h2 className={`mb-4 text-3xl font-bold ${activeCategoryStyle.text}`}>Kdy trénujeme</h2>

          <div className="rounded-2xl bg-white p-6 text-lg shadow-sm">
            {activeCategory === 'predpripravka' && (
              <>
                <div className="mb-2 font-bold text-gray-900">Předpřípravka (U7)</div>
                <div className="text-gray-700">Čtvrtek 17:00–18:00</div>
              </>
            )}

            {activeCategory === 'mladsi-pripravka' && (
              <>
                <div className="mb-2 font-bold text-gray-900">Mladší přípravka (U9)</div>
                <div className="text-gray-700">Úterý a čtvrtek 16:30–18:00</div>
              </>
            )}

            {activeCategory === 'starsi-pripravka' && (
              <>
                <div className="mb-2 font-bold text-gray-900">Starší přípravka (U11)</div>
                <div className="text-gray-700">Středa 17:00–18:00</div>
              </>
            )}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-6 pb-14">
        <div className={`rounded-3xl border p-8 shadow-sm ${activeCategoryStyle.light}`}>
          <div className="mb-2 flex flex-wrap items-center gap-3">
            <div className={`text-sm font-semibold uppercase tracking-wide ${activeCategoryStyle.text}`}>
              {activeCategoryLabel}
            </div>
            <span className={`rounded-full px-3 py-1 text-xs font-bold ${activeCategoryStyle.softBadge}`}>
              {activeCategoryShortLabel}
            </span>
          </div>

          <h2 className={`mb-6 text-3xl font-bold ${activeCategoryStyle.text}`}>Fotky</h2>

          {teamGalleryAlbums.length > 0 ? (
            <>
              <div className="grid gap-6 md:grid-cols-2">
                {visibleTeamGalleryAlbums.map((album) => {
                  const linkedMatch = getAlbumMatch(album.id);

                  return (
                    <button
                      type="button"
                      key={album.id}
                      onClick={() => openTeamAlbum(album)}
                      className="overflow-hidden rounded-2xl border border-gray-200 bg-white text-left shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
                    >
                      {renderAlbumCover(album)}
                      <div className="p-5">
                        <div className="text-xl font-bold text-gray-900">{album.title}</div>
                        {linkedMatch?.date && (
                          <div className="mt-1 text-sm text-gray-500">{linkedMatch.date}</div>
                        )}
                        <div className="mt-1 text-sm text-gray-500">
                          {album.photos?.length || 0} položek
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>

              {hasMoreTeamAlbums && (
                <div className="mt-6 text-center">
                  <button
                    type="button"
                    onClick={() => setShowAllTeamAlbums((prev) => !prev)}
                    className={`rounded-xl px-6 py-3 font-semibold transition ${activeCategoryStyle.button}`}
                  >
                    {showAllTeamAlbums ? 'Zobrazit méně alb' : 'Zobrazit všechna alba'}
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="rounded-2xl bg-white p-5 text-gray-600 shadow-sm">
              Pro tuto kategorii zatím nejsou doplněná žádná alba.
            </div>
          )}
        </div>
      </section>

      {isGalleryOpen && !selectedAlbum && (
        <div
          className="fixed inset-0 z-50 overflow-y-auto bg-black/50 px-4 py-6 animate-[fadeIn_0.22s_ease-out]"
          onClick={closeGallery}
        >
          <div className="flex min-h-full items-start justify-center">
            <div
              className="relative my-4 w-full max-w-5xl rounded-2xl bg-white p-6 shadow-2xl animate-[scaleIn_0.24s_ease-out]"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                type="button"
                onClick={closeGallery}
                className="absolute right-4 top-4 text-2xl text-gray-500 hover:text-black"
              >
                ×
              </button>

              <h2 className="mb-6 text-3xl font-bold text-green-600">Galerie ASK Lipůvka</h2>

              {globalGalleryAlbums.length > 0 ? (
                <div className="grid gap-6 md:grid-cols-2">
                  {globalGalleryAlbums.map((album) => (
                    <button
                      type="button"
                      key={album.id}
                      onClick={() => {
                        setGallerySource('global');
                        setSelectedAlbum(album);
                        setSelectedPhotoIndex(null);
                      }}
                      className="overflow-hidden rounded-2xl border border-gray-200 bg-white text-left shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
                    >
                      {renderAlbumCover(album)}
                      <div className="p-5">
                        <div className="text-xl font-bold text-gray-900">{album.title}</div>
                        <div className="mt-1 text-sm text-gray-500">
                          {album.photos?.length || 0} položek
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="rounded-2xl bg-gray-100 p-5 text-gray-600">
                  Ve společné galerii zatím nejsou žádná alba.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {isGalleryOpen && selectedAlbum && selectedPhotoIndex === null && (
        <div
          className="fixed inset-0 z-50 overflow-y-auto bg-black/50 px-4 py-6 animate-[fadeIn_0.22s_ease-out]"
          onClick={backFromAlbum}
        >
          <div className="flex min-h-full items-start justify-center">
            <div
              className="relative my-4 w-full max-w-6xl rounded-2xl bg-white p-6 shadow-2xl animate-[scaleIn_0.24s_ease-out]"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="mb-4 flex items-center justify-between gap-4 pr-10">
                <button
                  type="button"
                  onClick={backFromAlbum}
                  className="rounded-xl border border-gray-300 px-4 py-2 font-semibold text-gray-700 hover:bg-gray-100"
                >
                  ← Zpět na alba
                </button>

                <button
                  type="button"
                  onClick={backFromAlbum}
                  className="text-2xl text-gray-500 hover:text-black"
                >
                  ×
                </button>
              </div>

              <h2 className="mb-6 text-3xl font-bold text-green-600">{selectedAlbum.title}</h2>

              <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
                {selectedAlbum.photos?.map((photo, index) =>
                  renderGalleryThumb(photo, index, selectedAlbum.title)
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {selectedPhoto && (
        <div
          className="fixed inset-0 z-[60] bg-black/90 px-4 py-6 animate-[fadeIn_0.22s_ease-out]"
          onClick={() => setSelectedPhotoIndex(null)}
        >
          <div className="flex h-full w-full items-center justify-center">
            <div
              className="relative flex max-h-full max-w-6xl items-center justify-center"
              onClick={(e) => e.stopPropagation()}
              onTouchStart={handleTouchStart}
              onTouchEnd={handleTouchEnd}
            >
              <button
                type="button"
                onClick={() => setSelectedPhotoIndex(null)}
                className="absolute right-0 top-[-48px] z-20 text-3xl text-white"
              >
                ×
              </button>

              <button
                type="button"
                onClick={goToPrevPhoto}
                className="absolute left-[-10px] top-1/2 z-10 hidden -translate-y-1/2 rounded-full bg-white/20 px-4 py-3 text-2xl text-white backdrop-blur md:block"
              >
                ‹
              </button>

              {isVideoFile(selectedPhoto) ? (
                <video
                  src={selectedPhoto}
                  controls
                  autoPlay
                  className="max-h-[85vh] max-w-[92vw] rounded-2xl object-contain"
                />
              ) : (
                <img
                  src={selectedPhoto}
                  alt="Zvětšená fotka"
                  className="max-h-[85vh] max-w-[92vw] rounded-2xl object-contain"
                />
              )}

              <button
                type="button"
                onClick={goToNextPhoto}
                className="absolute right-[-10px] top-1/2 z-10 hidden -translate-y-1/2 rounded-full bg-white/20 px-4 py-3 text-2xl text-white backdrop-blur md:block"
              >
                ›
              </button>

              <div className="absolute bottom-[-42px] left-1/2 -translate-x-1/2 text-sm text-white/80">
                {selectedPhotoIndex + 1} / {selectedAlbum?.photos?.length}
              </div>
            </div>
          </div>
        </div>
      )}

      {clubPopupContent && (
        <div
          className="fixed inset-0 z-50 overflow-y-auto bg-black/50 px-4 py-6 animate-[fadeIn_0.22s_ease-out]"
          onClick={() => setClubPopupContent(null)}
        >
          <div className="flex min-h-full items-start justify-center">
            <div
              className={`relative my-4 w-full max-w-4xl rounded-2xl p-6 shadow-2xl animate-[scaleIn_0.24s_ease-out] ${
                clubPopupContent === 'partneri' ||
                clubPopupContent === 'partner-nabidka' ||
                clubPopupContent === 'faq'
                  ? 'bg-[#f7f3eb]'
                  : 'bg-white'
              }`}
              onClick={(e) => e.stopPropagation()}
            >
              <button
                type="button"
                onClick={() => setClubPopupContent(null)}
                className="absolute right-4 top-4 text-2xl text-gray-500 hover:text-black"
              >
                ×
              </button>

              {clubPopupContent === 'filozofie' && (
                <>
                  <div className="mb-2 flex flex-wrap items-center gap-3 pr-10">
                    <h2 className="text-3xl font-bold text-green-600">Filozofie</h2>
                    <span className={`rounded-full px-3 py-1 text-xs font-bold ${activeCategoryStyle.softBadge}`}>
                      {activeCategoryShortLabel}
                    </span>
                  </div>

                  <div className={`mb-6 text-sm font-semibold uppercase tracking-wide ${activeCategoryStyle.text}`}>
                    {activeCategoryLabel}
                  </div>

                  <div className="rounded-2xl bg-gray-50 p-6">
                    <p className="leading-8 text-gray-700">
                      V ASK Lipůvka vedeme děti k radosti ze sportu, pohybu a hry v kolektivu.
                      Důraz klademe především na zábavu, všestranný rozvoj, fair play a pozitivní vztah ke sportu.
                    </p>

                    <p className="mt-4 leading-8 text-gray-700">
                      Výsledky nejsou v mládežnickém fotbale to nejdůležitější — mnohem více nám záleží na tom,
                      aby děti sport bavil, rozvíjely své dovednosti a cítily se v týmu dobře.
                    </p>

                    <p className="mt-4 leading-8 text-gray-700">
                      Chceme vytvářet prostředí, ve kterém se děti nebojí dělat chyby, učí se spolupracovat
                      a postupně si budují zdravé sebevědomí.
                    </p>
                  </div>
                </>
              )}

              {clubPopupContent === 'rodice' && (
                <>
                  <div className="mb-2 flex flex-wrap items-center gap-3 pr-10">
                    <h2 className="text-3xl font-bold text-green-600">Pro rodiče</h2>
                    <span className={`rounded-full px-3 py-1 text-xs font-bold ${activeCategoryStyle.softBadge}`}>
                      {activeCategoryShortLabel}
                    </span>
                  </div>

                  <div className={`mb-6 text-sm font-semibold uppercase tracking-wide ${activeCategoryStyle.text}`}>
                    {activeCategoryLabel}
                  </div>

                  <div className="grid gap-5 md:grid-cols-2">
                    <div className="rounded-2xl bg-gray-50 p-6 md:col-span-2">
                      <p className="leading-8 text-gray-700">
                        Vážení rodiče, děkujeme vám za důvěru, kterou vkládáte do našeho klubu.
                        Společně chceme vytvořit prostředí, ve kterém se děti cítí dobře, mají radost ze sportu
                        a přirozeně se rozvíjejí.
                      </p>
                    </div>

                    <div className="rounded-2xl bg-gray-50 p-6">
                      <h3 className="mb-3 text-xl font-bold text-green-600">Na čem si zakládáme</h3>
                      <ul className="space-y-2 text-gray-700">
                        <li>• radost ze hry a pohybu</li>
                        <li>• všestranný sportovní rozvoj</li>
                        <li>• respekt k trenérům, spoluhráčům i soupeřům</li>
                        <li>• fair play a pozitivní přístup</li>
                      </ul>
                    </div>

                    <div className="rounded-2xl bg-gray-50 p-6">
                      <h3 className="mb-3 text-xl font-bold text-green-600">Co od vás potřebujeme</h3>
                      <ul className="space-y-2 text-gray-700">
                        <li>• podporujte děti bez zbytečného tlaku na výkon</li>
                        <li>• respektujte trenéry a jejich rozhodnutí</li>
                        <li>• veďte děti k samostatnosti a zodpovědnosti</li>
                        <li>• pomáhejte vytvářet pozitivní atmosféru na hřišti</li>
                      </ul>
                    </div>

                    <div className="rounded-2xl bg-gray-50 p-6">
                      <h3 className="mb-3 text-xl font-bold text-green-600">Co nabízíme</h3>
                      <ul className="space-y-2 text-gray-700">
                        <li>• přátelské a bezpečné prostředí</li>
                        <li>• individuální přístup ke každému dítěti</li>
                        <li>• kvalifikované trenéry</li>
                        <li>• smysluplné využití volného času</li>
                      </ul>
                    </div>

                    <div className="rounded-2xl bg-gray-50 p-6">
                      <h3 className="mb-3 text-xl font-bold text-green-600">Důležité</h3>
                      <p className="leading-7 text-gray-700">
                        Každé dítě se vyvíjí jiným tempem. Naším cílem není pouze vyhrávat,
                        ale především vychovat děti, které mají vztah ke sportu, pohybu a týmové spolupráci.
                      </p>
                    </div>
                  </div>
                </>
              )}

              {clubPopupContent === 'faq' && (
                <>
                  <div className="mb-2 flex flex-wrap items-center gap-3 pr-10">
                    <h2 className="text-3xl font-bold text-green-700">Máte otázky?</h2>
                  </div>

                  <p className="mb-8 text-gray-700">
                    Tady najdete odpovědi na to, co rodiče nejčastěji zajímá.
                  </p>

                  <div className={`mb-8 overflow-hidden rounded-3xl p-1 shadow-sm ${
                    theme === 'dark' ? 'bg-[#0d1715] ring-1 ring-emerald-900/50' : 'bg-white/60'
                  }`}>
                    <div className={`flex h-[130px] items-center justify-center rounded-[22px] ${
                      theme === 'dark'
                        ? 'bg-gradient-to-br from-[#10211d] via-[#122a25] to-[#0c1715]'
                        : 'bg-gradient-to-br from-[#f2eadc] to-[#e8dcc6]'
                    }`}>
                      <div className="flex flex-wrap items-center justify-center gap-4 text-4xl md:text-5xl">
                        <span>❓</span>
                        <span>❔</span>
                        <span>❓</span>
                        <span>❔</span>
                        <span>❓</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {faqItems.map((item, index) => {
                      const isOpen = openFaqIndex === index;

                      return (
                        <div
                          key={item.question}
                          className={`overflow-hidden rounded-2xl border shadow-sm transition ${
                            theme === 'dark'
                              ? isOpen
                                ? 'border-emerald-700/50 bg-[#10201c] shadow-[0_16px_40px_rgba(0,0,0,0.26)]'
                                : 'border-emerald-950/60 bg-[#091310]'
                              : 'border-[#e6dccd] bg-white'
                          }`}
                        >
                          <button
                            type="button"
                            onClick={() => setOpenFaqIndex(isOpen ? null : index)}
                            className={`flex w-full items-center justify-between gap-4 px-5 py-4 text-left transition ${
                              theme === 'dark'
                                ? isOpen
                                  ? 'bg-[#122722] text-white'
                                  : 'text-white hover:bg-[#0f1d1a]'
                                : isOpen
                                  ? 'bg-[#faf7f2] text-gray-900'
                                  : 'text-gray-900 hover:bg-[#faf7f2]'
                            }`}
                          >
                            <div className="flex items-start gap-3">
                              <span className={`mt-0.5 text-lg ${theme === 'dark' ? 'drop-shadow-[0_0_10px_rgba(248,113,113,0.25)]' : ''}`}>❓</span>
                              <span className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{item.question}</span>
                            </div>
                            <span className={`text-xl transition duration-200 ${theme === 'dark' ? 'text-emerald-300' : 'text-green-700'} ${isOpen ? 'scale-110' : 'scale-100'}`}>{isOpen ? '−' : '+'}</span>
                          </button>

                          {isOpen && (
                            <div
                              className={`px-5 py-4 overflow-hidden animate-[faqContentIn_0.24s_ease-out] ${
                                theme === 'dark'
                                  ? 'border-t border-emerald-800/40 bg-[#0b1714] text-slate-200'
                                  : 'border-t border-[#efe6d8] text-gray-700'
                              }`}
                            >
                              {item.answer}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  <div className={`mt-10 rounded-2xl p-6 text-center shadow-sm ${
                    theme === 'dark'
                      ? 'border border-emerald-900/40 bg-[#0d1715]'
                      : 'bg-white/70'
                  }`}>
                    <p className="text-gray-700">Nenašli jste odpověď?</p>

                    <p className="mt-2 text-sm text-gray-600">
                      Klidně nám napište nebo zavolejte.
                    </p>

                    <div className="mt-4 space-y-1 text-green-700">
                      <div className="font-semibold">Radek Mánek</div>
                      <div>
                        <a href="tel:606148368" className="hover:underline">606 148 368</a>
                      </div>
                      <div>
                        <a href="mailto:radek.manek@email.cz" className="hover:underline">
                          radek.manek@email.cz
                        </a>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => openClubPopup('podnety')}
                      className="mt-5 rounded-xl bg-green-600 px-6 py-3 font-semibold text-white transition hover:scale-105 hover:bg-green-700"
                    >
                      Napsat podnět / dotaz
                    </button>
                  </div>
                </>
              )}

              {clubPopupContent === 'nabor' && (
                <>
                  <div className="overflow-hidden rounded-3xl border border-green-100 bg-white shadow-sm">
                    <img
                      src="/nabor/nabor.png"
                      alt="Nábor hráčů ASK Lipůvka"
                      className="h-auto w-full object-cover"
                    />
                  </div>

                  <div className="mt-6 text-center">
                    <h2 className="text-3xl font-bold text-green-600">Nábor hráčů</h2>
                    <p className="mt-4 text-lg text-gray-700">
                      ASK Lipůvka hledá nové hráče do mládežnických kategorií.
                    </p>

                    <div className="mt-5 flex flex-wrap justify-center gap-3">
                      <span className="rounded-full bg-green-100 px-4 py-2 font-semibold text-green-700">U7</span>
                      <span className="rounded-full bg-green-100 px-4 py-2 font-semibold text-green-700">U9</span>
                      <span className="rounded-full bg-green-100 px-4 py-2 font-semibold text-green-700">U11</span>
                    </div>

                    <p className="mt-5 text-gray-700">
                      Přijímáme děti od 5 let. Přijď si zatrénovat a staň se součástí ASK Lipůvka.
                    </p>

                    <div className="mt-6">
                      <button
                        type="button"
                        onClick={openRecruitmentFromPopup}
                        className="rounded-xl bg-green-600 px-8 py-3 font-semibold text-white transition hover:scale-[1.02] hover:bg-green-700"
                      >
                        Přihlásit dítě
                      </button>
                    </div>
                  </div>
                </>
              )}

              {clubPopupContent === 'podnety' && (
                <>
                  <div className="mb-2 flex flex-wrap items-center gap-3 pr-10">
                    <h2 className="text-3xl font-bold text-green-600">Kniha podnětů</h2>
                  </div>

                  <p className="mb-6 text-gray-600">
                    Máte podnět, připomínku nebo nápad, jak zlepšit fungování mládeže ASK Lipůvka?
                    Napište nám.
                  </p>

                  <form onSubmit={handleSubmitPodnet} className="space-y-4">
                    <input
                      type="text"
                      name="jmeno"
                      placeholder="Jméno"
                      required
                      className="w-full rounded-xl border border-gray-300 bg-white p-3 text-black placeholder:text-gray-500"
                    />

                    <input
                      type="text"
                      name="kontakt"
                      placeholder="Kontakt (e-mail nebo telefon – nepovinné)"
                      className="w-full rounded-xl border border-gray-300 bg-white p-3 text-black placeholder:text-gray-500"
                    />

                    <textarea
                      name="zprava"
                      placeholder="Napište nám váš podnět..."
                      required
                      rows="7"
                      className="w-full rounded-xl border border-gray-300 bg-white p-3 text-black placeholder:text-gray-500"
                    />

                    <button
                      type="submit"
                      className="w-full rounded-xl bg-green-600 py-3 font-semibold text-white"
                    >
                      Odeslat
                    </button>
                  </form>
                </>
              )}

              {clubPopupContent === 'kde-nas-najdete' && (
                <>
                  <div className="mb-2 flex flex-wrap items-center gap-3 pr-10">
                    <h2 className="text-3xl font-bold text-green-600">Kde nás najdete</h2>
                  </div>

                  <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
                    <div>
                      <p className="mb-4 text-lg font-semibold text-gray-900">Adresa</p>
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
                        <h3 className="mb-2 text-lg font-bold text-gray-900">Praktické info</h3>
                        <ul className="space-y-2 text-gray-700">
                          <li>• Příjezd je možný přímo k areálu.</li>
                          <li>• Parkování je možné v okolí hřiště.</li>
                          <li>• V areálu probíhají nejen zápasy mládeže, ale i další klubové akce.</li>
                        </ul>
                      </div>
                    </div>

                    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white">
                      <iframe
                        title="Mapa areálu ASK Lipůvka"
                        src="https://www.google.com/maps?q=Lipuvka%20390%20679%2022%20Lipuvka&z=16&output=embed"
                        className="h-[320px] w-full border-0"
                        loading="lazy"
                        referrerPolicy="no-referrer-when-downgrade"
                      />
                    </div>
                  </div>
                </>
              )}

              {clubPopupContent === 'partneri' && (
                <>
                  <div className="mb-2 flex flex-wrap items-center gap-3 pr-10">
                    <h2 className="text-3xl font-bold text-green-700">Partneři & sponzoři</h2>
                  </div>

                  <p className="mb-8 text-gray-700">
                    Děkujeme všem partnerům, kteří podporují mládež ASK Lipůvka.
                  </p>

                  <div className="space-y-6">
                    <a
                      href="https://revelop.cz/"
                      target="_blank"
                      rel="noreferrer"
                      className="flex justify-center transition hover:-translate-y-1 hover:scale-[1.02]"
                    >
                      <img
                        src="/partneri/revelop.png"
                        alt="Revelop"
                        className="h-24 w-auto rounded-2xl object-contain shadow-sm"
                      />
                    </a>

                    <a
                      href="https://www.blistr.cz"
                      target="_blank"
                      rel="noreferrer"
                      className="flex justify-center transition hover:-translate-y-1 hover:scale-[1.02]"
                    >
                      <img
                        src="/partneri/dh.jpg"
                        alt="BLISTR"
                        className="h-24 w-auto rounded-2xl object-contain shadow-sm"
                      />
                    </a>
                  </div>

                  <div className="mt-10 text-center">
                    <button
                      type="button"
                      onClick={() => openClubPopup('partner-nabidka')}
                      className="font-semibold text-green-700 underline underline-offset-4 hover:text-green-800"
                    >
                      Proč nás podpořit?
                    </button>
                  </div>
                </>
              )}

              {clubPopupContent === 'partner-nabidka' && (
                <>
                  <div className="mb-2 flex flex-wrap items-center gap-3 pr-10">
                    <h2 className="text-3xl font-bold text-green-700">Spolupráce s ASK Lipůvka</h2>
                  </div>

                  <p className="mb-8 text-gray-700">
                    Co vám můžeme nabídnout jako partnerovi:
                  </p>

                  <div className="mb-8 overflow-hidden rounded-3xl shadow-sm">
                    <img
                      src="/partneri/deti.jpg"
                      alt="Děti ASK Lipůvka na tréninku"
                      className="h-[220px] w-full object-cover"
                    />
                  </div>

                  <div className="mx-auto max-w-2xl space-y-8 text-left">
                    <div>
                      <div className="text-2xl font-bold text-green-700">⚽ Viditelnost</div>
                      <ul className="mt-3 space-y-2 text-lg text-gray-700">
                        <li>• logo na webu</li>
                        <li>• logo na sociálních sítích</li>
                        <li>• zmínky u příspěvků</li>
                      </ul>
                    </div>

                    <div>
                      <div className="text-2xl font-bold text-green-700">👥 Lokální dosah</div>
                      <ul className="mt-3 space-y-2 text-lg text-gray-700">
                        <li>• rodiče + děti + komunita</li>
                        <li>• lidé z Lipůvky a okolí</li>
                        <li>• reální zákazníci (ne fake dosah)</li>
                      </ul>
                    </div>

                    <div>
                      <div className="text-2xl font-bold text-green-700">❤️ Smysl</div>
                      <ul className="mt-3 space-y-2 text-lg text-gray-700">
                        <li>• podpora mládeže</li>
                        <li>• sport</li>
                        <li>• komunita</li>
                      </ul>
                    </div>
                  </div>

                  <div className="mt-10 text-center">
                    <p className="text-gray-700">
                      Chcete podpořit mládež ASK Lipůvka?
                    </p>

                    <button
                      type="button"
                      onClick={() => openClubPopup('podnety')}
                      className="mt-4 font-semibold text-green-700 underline underline-offset-4 hover:text-green-800"
                    >
                      Napište nám
                    </button>

                    <p className="mt-2 text-xs text-gray-500">
                      Kontakt můžete přidat dobrovolně (e-mail / telefon).
                    </p>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {isTermsOpen && (
        <div
          className="fixed inset-0 z-[70] overflow-y-auto bg-black/60 px-4 py-6 animate-[fadeIn_0.22s_ease-out]"
          onClick={() => setIsTermsOpen(false)}
        >
          <div className="flex min-h-full items-start justify-center">
            <div
              className="relative my-4 w-full max-w-3xl rounded-2xl bg-white p-6 shadow-2xl animate-[scaleIn_0.24s_ease-out]"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                type="button"
                onClick={() => setIsTermsOpen(false)}
                className="absolute right-4 top-4 text-2xl text-gray-500 hover:text-black"
              >
                ×
              </button>

              <h2 className="mb-6 text-3xl font-bold text-green-600">Registrační podmínky</h2>

              <div className="space-y-5 rounded-2xl bg-gray-50 p-6 text-gray-700">
                <div>
                  <h3 className="font-bold text-green-600">1. Zdravotní stav</h3>
                  <p className="mt-1 leading-7">
                    Prohlašuji, že dítě je zdravotně způsobilé k pravidelnému sportování a zavazuji se dodat lékařský posudek do 14 dnů.
                  </p>
                </div>

                <div>
                  <h3 className="font-bold text-green-600">2. První pomoc</h3>
                  <p className="mt-1 leading-7">
                    Souhlasím, aby trenér v případě úrazu zajistil první pomoc a případné lékařské ošetření.
                  </p>
                </div>

                <div>
                  <h3 className="font-bold text-green-600">3. Doprava na zápasy</h3>
                  <p className="mt-1 leading-7">
                    Souhlasím s přepravou dítěte na zápasy soukromými vozidly trenérů nebo rodičů.
                  </p>
                </div>

                <div>
                  <h3 className="font-bold text-green-600">4. GDPR a média</h3>
                  <p className="mt-1 leading-7">
                    Souhlasím se zpracováním osobních údajů a zveřejněním fotografií pro potřeby klubu.
                  </p>
                </div>

                <div>
                  <h3 className="font-bold text-green-600">5. Povinnosti</h3>
                  <p className="mt-1 leading-7">
                    Dítě je povinno dodržovat pokyny trenérů a pravidla klubu.
                  </p>
                </div>

                <div>
                  <h3 className="font-bold text-green-600">6. Turnaje a akce</h3>
                  <p className="mt-1 leading-7">
                    Souhlasím s účastí dítěte na trénincích, zápasech a akcích klubu.
                  </p>
                </div>

                <div>
                  <h3 className="font-bold text-green-600">7. Odchody</h3>
                  <p className="mt-1 leading-7">
                    Jsem zodpovědný za odchod dítěte po skončení akce.
                  </p>
                </div>

                <div>
                  <h3 className="font-bold text-green-600">8. Odpovědnost trenérů</h3>
                  <p className="mt-1 leading-7">
                    Trenéři zodpovídají za děti pouze v čase tréninků a zápasů.
                  </p>
                </div>
              </div>

              <div className="mt-6 flex justify-end">
                <button
                  type="button"
                  onClick={() => {
                    setTermsAccepted(true);
                    setIsTermsOpen(false);
                  }}
                  className="rounded-xl bg-green-600 px-6 py-3 font-semibold text-white hover:bg-green-700"
                >
                  Rozumím a souhlasím
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {isScheduleOpen && (
        <div
          className="fixed inset-0 z-[70] overflow-y-auto bg-black/60 px-4 py-6 animate-[fadeIn_0.22s_ease-out]"
          onClick={() => setIsScheduleOpen(false)}
        >
          <div className="flex min-h-full items-start justify-center">
            <div
              className="relative my-4 w-full max-w-5xl overflow-hidden rounded-2xl bg-white shadow-2xl animate-[scaleIn_0.24s_ease-out]"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                type="button"
                onClick={() => setIsScheduleOpen(false)}
                className="absolute right-4 top-4 z-10 text-3xl text-white"
              >
                ×
              </button>

              <div className="relative h-56 w-full">
                <img
                  src={activeCategoryImage}
                  alt={activeCategoryLabel}
                  className="h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-black/45" />
                <div className="absolute inset-0 flex flex-col items-center justify-center px-6 text-center text-white">
                  <div className={`mb-2 rounded-full px-4 py-1 text-sm font-semibold backdrop-blur ${activeCategoryStyle.badge}`}>
                    {activeCategoryLabel}
                  </div>
                  <h2 className="text-3xl font-black md:text-4xl">Rozpis zápasů</h2>
                  <p className="mt-2 text-lg text-white/90">Jaro 2026</p>
                </div>
              </div>

              <div className="p-6">
                <div className="mb-5 flex flex-wrap items-center gap-3">
                  <span className={`rounded-full px-3 py-1 text-sm font-bold ${activeCategoryStyle.softBadge}`}>
                    {activeCategoryShortLabel}
                  </span>
                  <span className="text-sm text-gray-500">Kompletní přehled zápasů vybrané kategorie</span>
                </div>

                <div className="space-y-4">
                  {fullScheduleMatches.length > 0 ? (
                    fullScheduleMatches.map((m) => {
                      const isToday = isSameDay(parseMatchDate(m.date), todayStart);
                      const categoryStyle = getCategoryStyle(m.category);
                      const label1 = m.matchLabel1?.trim() || '1. blok';
                      const label2 = m.matchLabel2?.trim() || '2. blok';

                      return (
                        <button
                          type="button"
                          key={m.id || `schedule-${m.date}-${m.opponent}`}
                          onClick={() => {
                            setIsScheduleOpen(false);
                            if (m.id) navigate(`/zapas/${m.id}`);
                          }}
                          className={`group w-full rounded-2xl border p-5 text-left shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-md ${
                            isToday
                              ? 'border-green-500 bg-green-50 ring-2 ring-green-200'
                              : categoryStyle.light
                          }`}
                        >
                          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                            <div>
                              <div className="flex flex-wrap items-center gap-2">
                                <div className="flex flex-wrap items-center gap-2 text-lg font-bold text-gray-900">
                                  <span>
                                    {m.home
                                      ? `ASK Lipůvka vs. ${m.opponent}`
                                      : `${m.opponent} vs. ASK Lipůvka`}
                                  </span>
                                  <span className={`rounded-full px-2 py-0.5 text-xs font-bold ${categoryStyle.badge}`}>
                                    {getCategoryShortLabel(m.category)}
                                  </span>
                                </div>

                                {isToday && (
                                  <span className="animate-pulse rounded-full bg-green-600 px-4 py-1 text-xs font-bold uppercase tracking-wide text-white shadow-md">
                                    DNES
                                  </span>
                                )}
                              </div>

                              <div className="mt-1 text-sm text-gray-500">{m.date} • {m.time}</div>

                              <div className="mt-2 text-sm font-medium text-gray-700">
                                Hraje se: {m.home ? 'Lipůvka' : m.venue || 'bude doplněno'}
                              </div>

                              <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-white/90 px-3 py-2 text-sm font-semibold text-gray-700 shadow-sm transition duration-200 group-hover:scale-[1.03] group-hover:shadow-md">
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  className="h-4 w-4 transition duration-200 group-hover:scale-110 group-hover:rotate-3"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M21 21l-4.35-4.35m1.85-5.15a7 7 0 11-14 0 7 7 0 0114 0z"
                                  />
                                </svg>
                                Detail zápasu
                              </div>
                            </div>

                            <div className="flex flex-wrap items-center gap-3">
                              <span
                                className={`rounded-full px-3 py-1 text-sm font-semibold ${
                                  m.home ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'
                                }`}
                              >
                                {m.home ? 'Domácí' : 'Venkovní'}
                              </span>

                              {m.result1 || m.result2 ? (
                                <div className="flex flex-col gap-2 text-right">
                                  {m.result1 && (
                                    <span className="rounded-full bg-gray-100 px-3 py-1 text-sm font-semibold text-gray-700">
                                      {label1}: {m.result1}
                                    </span>
                                  )}
                                  {m.result2 && (
                                    <span className="rounded-full bg-gray-100 px-3 py-1 text-sm font-semibold text-gray-700">
                                      {label2}: {m.result2}
                                    </span>
                                  )}
                                </div>
                              ) : (
                                <span className="rounded-full bg-gray-100 px-3 py-1 text-sm font-semibold text-gray-700">
                                  Zápas před námi
                                </span>
                              )}
                            </div>
                          </div>
                        </button>
                      );
                    })
                  ) : (
                    <div className="rounded-2xl bg-gray-100 p-5 text-gray-600">
                      Pro tuto kategorii zatím není rozpis doplněný.
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {isRegistrationOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 animate-[fadeIn_0.22s_ease-out]"
          onClick={() => setIsRegistrationOpen(false)}
        >
          <div
            className="relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl animate-[scaleIn_0.24s_ease-out]"
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
                type="text"
                name="datum_narozeni"
                placeholder="Datum narození (např. 12.3.2018)"
                required
                className="w-full rounded-xl border border-gray-300 bg-white p-3 text-black placeholder:text-gray-500"
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

              <div className="rounded-2xl bg-gray-50 p-4">
                <div className="flex items-start gap-3">
                  <input
                    id="souhlas-podminky"
                    type="checkbox"
                    name="souhlas"
                    checked={termsAccepted}
                    onChange={(e) => setTermsAccepted(e.target.checked)}
                    required
                    className="mt-1 h-4 w-4 rounded border-gray-300"
                  />

                  <label htmlFor="souhlas-podminky" className="text-sm leading-6 text-gray-700">
                    Potvrzuji, že jsem se seznámil/a s registračními podmínkami, souhlasy a GDPR.
                  </label>
                </div>

                <button
                  type="button"
                  onClick={() => setIsTermsOpen(true)}
                  className="mt-3 font-semibold text-green-600 underline underline-offset-2 hover:text-green-700"
                >
                  Zobrazit registrační podmínky
                </button>
              </div>

              <button
                type="submit"
                disabled={!termsAccepted}
                className={`w-full rounded-xl py-3 font-semibold text-white transition ${
                  termsAccepted
                    ? 'bg-green-600 hover:bg-green-700'
                    : 'cursor-not-allowed bg-gray-300'
                }`}
              >
                Odeslat registraci
              </button>
            </form>
          </div>
        </div>
      )}

      {isTrainersOpen && (
        <div
          className="fixed inset-0 z-50 overflow-y-auto bg-black/50 px-4 py-6 animate-[fadeIn_0.22s_ease-out]"
          onClick={() => setIsTrainersOpen(false)}
        >
          <div className="flex min-h-full items-start justify-center">
            <div
              className="relative my-4 w-full max-w-5xl rounded-2xl bg-white p-6 shadow-2xl animate-[scaleIn_0.24s_ease-out]"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                type="button"
                onClick={() => setIsTrainersOpen(false)}
                className="absolute right-4 top-4 text-2xl text-gray-500 hover:text-black"
              >
                ×
              </button>

              <h2 className="mb-6 text-3xl font-bold text-green-600">Realizační tým mládeže</h2>

              <h3 className="mb-4 text-xl font-bold">Vedení mládeže</h3>

              <div className="mb-8 grid gap-6 md:grid-cols-2">
                {team.management.map((person) => (
                  <div
                    key={person.name}
                    className="rounded-2xl bg-gray-100 p-5 text-center shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-lg"
                  >
                    <img
                      src={person.photo}
                      alt={person.name}
                      className="mx-auto mb-4 h-24 w-24 rounded-full object-cover"
                    />

                    <div className="text-lg font-bold">{person.name}</div>
                    <div className="text-sm text-gray-600">{person.role}</div>
                    {person.subrole && (
                      <div className="text-sm text-gray-500">{person.subrole}</div>
                    )}

                    {person.licence && (
                      <div className="mt-2 inline-block rounded-full bg-green-600 px-3 py-1 text-xs font-bold text-white">
                        {person.licence}
                      </div>
                    )}

                    {person.phone && (
                      <a
                        href={`tel:${person.phone}`}
                        className="mt-3 block font-semibold text-green-600 hover:underline"
                      >
                        {person.phoneLabel}
                      </a>
                    )}

                    {person.email && (
                      <a
                        href={`mailto:${person.email}`}
                        className="block text-green-600 hover:underline"
                      >
                        {person.email}
                      </a>
                    )}
                  </div>
                ))}
              </div>

              <h3 className="mb-4 text-xl font-bold">Trenéři</h3>

              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {team.trainers.map((person) => {
                  const categoryStyle = getCategoryStyle(person.category);

                  return (
                    <div
                      key={person.name}
                      className="rounded-2xl bg-gray-100 p-5 text-center shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-lg"
                    >
                      <img
                        src={person.photo}
                        alt={person.name}
                        className="mx-auto mb-4 h-24 w-24 rounded-full object-cover"
                      />

                      <div className="text-lg font-bold">{person.name}</div>

                      <div className="mt-1 flex items-center justify-center gap-2">
                        <div className="text-sm text-gray-600">{person.role}</div>

                        {person.category && (
                          <span
                            className={`rounded-full px-2 py-0.5 text-xs font-bold ${categoryStyle.badge}`}
                          >
                            {getCategoryShortLabel(person.category)}
                          </span>
                        )}
                      </div>

                      {person.licence && (
                        <div className="mt-2 inline-block rounded-full bg-blue-600 px-3 py-1 text-xs font-bold text-white">
                          {person.licence}
                        </div>
                      )}

                      {person.phone && (
                        <a
                          href={`tel:${person.phone}`}
                          className="mt-2 block font-semibold text-green-600 hover:underline"
                        >
                          {person.phoneLabel}
                        </a>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      <section className="mx-auto max-w-5xl px-6 pb-6">
        <div className="text-center text-sm text-gray-500">
          Návštěvnost webu:{' '}
          <span className="font-semibold text-gray-700">
            {visitCount !== null ? visitCount.toLocaleString('cs-CZ') : '...'}
          </span>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-6 pb-10">
        <div className="rounded-2xl bg-gray-50 p-6 text-center shadow-sm">
          <h3 className="mb-3 text-xl font-bold text-gray-800">Mládežnické týmy ASK Lipůvka</h3>

          <p className="text-gray-700">
            Mládežnický fotbal ASK Lipůvka zahrnuje předpřípravku (U7), mladší přípravku (U9) a starší přípravku (U11). Mladší přípravka se účastní soutěží a od příští sezony budeme mít dva týmy v soutěžích U9 a U11.
          </p>

          <div className="mt-3 text-sm text-gray-600">
            Předpřípravka U7 • Mladší přípravka U9 • Starší přípravka U11
          </div>
        </div>
      </section>

      <footer className="py-8 text-center text-gray-500">
        <div className="mb-6 flex flex-wrap items-center justify-center gap-5">
          <a
            href="https://www.facebook.com/people/ASK-Lip%C5%AFvka/100093969443650/"
            target="_blank"
            rel="noreferrer"
            className="inline-flex h-14 items-center gap-2 rounded-xl bg-blue-600 px-5 text-base font-bold text-white transition hover:-translate-y-1 hover:scale-105 hover:bg-blue-700 hover:shadow-lg"
            aria-label="Facebook ASK Lipůvka"
            title="Facebook ASK Lipůvka"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="h-5 w-5"
            >
              <path d="M22 12a10 10 0 1 0-11.56 9.88v-6.99H7.9V12h2.54V9.8c0-2.5 1.49-3.88 3.77-3.88 1.09 0 2.23.19 2.23.19v2.46h-1.26c-1.24 0-1.63.77-1.63 1.56V12h2.77l-.44 2.89h-2.33v6.99A10 10 0 0 0 22 12Z" />
            </svg>
            Facebook
          </a>

          <a
            href="https://revelop.cz/"
            target="_blank"
            rel="noreferrer"
            className="inline-flex h-14 items-center justify-center overflow-hidden rounded-2xl transition hover:-translate-y-1 hover:scale-105 hover:shadow-lg"
            aria-label="Revelop"
            title="Revelop"
          >
            <img
              src="/partneri/revelop.png"
              alt="Revelop"
              className="h-14 w-auto object-contain"
            />
          </a>

          <a
            href="https://www.blistr.cz"
            target="_blank"
            rel="noreferrer"
            className="inline-flex h-14 items-center justify-center overflow-hidden rounded-2xl transition hover:-translate-y-1 hover:scale-105 hover:shadow-lg"
            aria-label="BLISTR"
            title="BLISTR"
          >
            <img
              src="/partneri/dh.jpg"
              alt="BLISTR"
              className="h-14 w-auto object-contain"
            />
          </a>

          <a
            href="https://asklipuvka.cz"
            target="_blank"
            rel="noreferrer"
            className="inline-flex h-14 items-center rounded-xl border border-green-600 px-5 text-base font-bold text-green-700 transition hover:-translate-y-1 hover:scale-105 hover:bg-green-50 hover:shadow-lg"
          >
            "A" tým muži
          </a>
        </div>

        <div>© 2026 ASK Lipůvka</div>
      </footer>
    </div>
  );
}