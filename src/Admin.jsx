import { useEffect, useMemo, useState } from 'react';
import { auth, db, googleProvider } from './firebase';
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  updateDoc,
  setDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { onAuthStateChanged, signInWithPopup, signOut } from 'firebase/auth';

const ALLOWED_ADMIN_EMAILS = [
  'radek.manek86@gmail.com',
  'radek.manek@email.cz',
];

export default function Admin() {
  const categories = [
    { id: 'predpripravka', label: 'Předpřípravka (U7)', shortLabel: 'U7' },
    { id: 'mladsi-pripravka', label: 'Mladší přípravka (U9)', shortLabel: 'U9' },
    { id: 'starsi-pripravka', label: 'Starší přípravka (U11)', shortLabel: 'U11' },
  ];

  const CURRENT_SEASON = '2025/26';
  const NEXT_SEASON = '2026/27';
  const ARCHIVE_SEASON = '2025/26';
  const seasonOptions = [CURRENT_SEASON, NEXT_SEASON];
  const getItemSeason = (item) => item?.season || ARCHIVE_SEASON;

  const [activeSection, setActiveSection] = useState('news');

  const [authUser, setAuthUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [authError, setAuthError] = useState('');

  const [newsItems, setNewsItems] = useState([]);
  const [matches, setMatches] = useState([]);
  const [galleryAlbums, setGalleryAlbums] = useState([]);
  const [merchProducts, setMerchProducts] = useState([]);
  const [merchOrders, setMerchOrders] = useState([]);
  const [siteStats, setSiteStats] = useState({
    visitCount: 0,
    createdAt: null,
    updatedAt: null,
  });
  const [dailyVisitStats, setDailyVisitStats] = useState([]);
  const [statsPeriod, setStatsPeriod] = useState(7);
  const [currentSeason, setCurrentSeason] = useState(CURRENT_SEASON);
  const [savingCurrentSeason, setSavingCurrentSeason] = useState(false);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [theme, setTheme] = useState(() => {
    if (typeof window === 'undefined') return 'light';
    return localStorage.getItem('ask-lipuvka-theme') || 'light';
  });


  const [matchListCategoryFilter, setMatchListCategoryFilter] = useState('all');
  const [matchListTimeFilter, setMatchListTimeFilter] = useState('future');
  const [matchListSeasonFilter, setMatchListSeasonFilter] = useState(CURRENT_SEASON);

  const [newsForm, setNewsForm] = useState({
    season: CURRENT_SEASON,
    category: 'mladsi-pripravka',
    title: '',
    text: '',
    date: '',
    image: '',
  });

  const [editingMatchId, setEditingMatchId] = useState(null);
  const [matchForm, setMatchForm] = useState({
    season: CURRENT_SEASON,
    category: 'mladsi-pripravka',
    date: '',
    dateISO: '',
    opponent: '',
    time: '',
    home: true,
    venue: 'Lipůvka',
    status: 'planned',
    hasSecondBlock: false,
    matchLabel1: '',
    result1: '',
    scorers1: '',
    matchLabel2: '',
    result2: '',
    scorers2: '',
    articleTitle: '',
    article: '',
    galleryAlbumId: '',
  });

  const [editingGalleryId, setEditingGalleryId] = useState(null);
  const [galleryForm, setGalleryForm] = useState({
    season: CURRENT_SEASON,
    type: 'global',
    category: 'mladsi-pripravka',
    title: '',
    cover: '',
    photosText: '',
    folder: '',
    fromNumber: '1',
    toNumber: '',
    coverNumber: '1',
  });


  const [editingMerchProductId, setEditingMerchProductId] = useState(null);
  const [merchProductForm, setMerchProductForm] = useState({
    title: '',
    productKind: 'clothing',
    type: 'Oblečení',
    description: '',
    price: '',
    image: '',
    variantsText: '',
    order: '',
    active: true,
  });

  const sectionButtonClass = (isActive) =>
    `rounded-xl px-5 py-3 font-semibold transition ${
      isActive
        ? 'bg-green-600 text-white shadow-md'
        : 'border border-green-200 bg-white text-green-700 hover:bg-green-50'
    }`;

  const inputClass =
    'w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-gray-900 outline-none transition focus:border-green-500 focus:ring-2 focus:ring-green-200';

  const labelClass = 'mb-2 block text-sm font-semibold text-gray-700';

  const cardClass = 'rounded-2xl border border-green-100 bg-white p-5 shadow-sm';
  const cardSoftClass = 'rounded-3xl border border-green-100 bg-green-50/60 p-6 shadow-sm';

  const greenButtonClass =
    'rounded-xl bg-green-600 px-5 py-3 font-semibold text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:bg-gray-300';

  const outlineButtonClass =
    'rounded-xl border border-gray-300 bg-white px-4 py-3 font-semibold text-gray-700 transition hover:bg-gray-50';

  const dangerButtonClass =
    'rounded-xl bg-red-600 px-4 py-3 font-semibold text-white transition hover:bg-red-700';

  const parsePhotosText = (text) =>
    text
      .split('\n')
      .map((item) => item.trim())
      .filter(Boolean);

  const formatPhotosText = (photos = []) => photos.join('\n');

  const normalizeFolderPath = (folder) => {
    const trimmed = folder.trim();
    if (!trimmed) return '';
    const withLeadingSlash = trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
    return withLeadingSlash.replace(/\/+$/, '');
  };

  const generatePhotoPaths = (folder, fromNumber, toNumber) => {
    const normalizedFolder = normalizeFolderPath(folder);
    const from = Number(fromNumber);
    const to = Number(toNumber);

    if (!normalizedFolder) {
      return { error: 'Vyplň složku s fotkami.' };
    }

    if (!Number.isInteger(from) || !Number.isInteger(to) || from < 1 || to < 1) {
      return { error: 'Čísla fotek musí být celá čísla větší než 0.' };
    }

    if (from > to) {
      return { error: 'Pole "Od čísla" musí být menší nebo stejné jako "Do čísla".' };
    }

    const photos = [];
    for (let i = from; i <= to; i += 1) {
      photos.push(`${normalizedFolder}/${i}.jpg`);
    }

    return { photos, normalizedFolder };
  };

  const galleryPreview = useMemo(() => {
    const result = generatePhotoPaths(
      galleryForm.folder,
      galleryForm.fromNumber,
      galleryForm.toNumber
    );

    if (result.error) {
      return {
        error: result.error,
        photos: [],
        cover: '',
      };
    }

    const coverNumber = Number(galleryForm.coverNumber);
    const validCoverNumber =
      Number.isInteger(coverNumber) && coverNumber >= 1
        ? coverNumber
        : Number(galleryForm.fromNumber) || 1;

    return {
      error: '',
      photos: result.photos,
      cover: `${result.normalizedFolder}/${validCoverNumber}.jpg`,
    };
  }, [
    galleryForm.folder,
    galleryForm.fromNumber,
    galleryForm.toNumber,
    galleryForm.coverNumber,
  ]);

  const formatDateToISO = (value) => {
    if (!value) return '';

    const parts = value
      .split('.')
      .map((part) => part.trim())
      .filter(Boolean);

    if (parts.length < 3) return '';

    const [day, month, year] = parts;
    const dd = String(Number(day)).padStart(2, '0');
    const mm = String(Number(month)).padStart(2, '0');

    if (!dd || !mm || !year || String(year).length !== 4) return '';

    return `${year}-${mm}-${dd}`;
  };

  const parseMatchDate = (match) => {
    if (match?.dateISO) return new Date(match.dateISO);
    if (!match?.date) return new Date(0);

    const parts = match.date
      .split('.')
      .map((part) => part.trim())
      .filter(Boolean);

    const [day, month, year] = parts;
    return new Date(Number(year), Number(month) - 1, Number(day));
  };

  const resetMatchForm = () => {
    setEditingMatchId(null);
    setMatchForm({
      season: CURRENT_SEASON,
      category: 'mladsi-pripravka',
      date: '',
      dateISO: '',
      opponent: '',
      time: '',
      home: true,
      venue: 'Lipůvka',
      status: 'planned',
      hasSecondBlock: false,
      matchLabel1: '',
      result1: '',
      scorers1: '',
      matchLabel2: '',
      result2: '',
      scorers2: '',
      articleTitle: '',
      article: '',
      galleryAlbumId: '',
    });
  };

  const resetGalleryForm = () => {
    setEditingGalleryId(null);
    setGalleryForm({
      season: CURRENT_SEASON,
      type: 'global',
      category: 'mladsi-pripravka',
      title: '',
      cover: '',
      photosText: '',
      folder: '',
      fromNumber: '1',
      toNumber: '',
      coverNumber: '1',
    });
  };

  const loadAllData = async () => {
    try {
      setLoading(true);

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

      let loadedMerchProducts = [];
      let loadedMerchOrders = [];

      try {
        const merchProductsSnapshot = await getDocs(collection(db, 'merchProducts'));
        loadedMerchProducts = merchProductsSnapshot.docs.map((item) => ({
          id: item.id,
          ...item.data(),
        }));
      } catch (merchProductsError) {
        console.warn('Merch produkty se nepodařilo načíst. Ostatní admin nechávám běžet:', merchProductsError);
      }

      try {
        const merchOrdersSnapshot = await getDocs(collection(db, 'merchOrders'));
        loadedMerchOrders = merchOrdersSnapshot.docs.map((item) => ({
          id: item.id,
          ...item.data(),
        }));
      } catch (merchOrdersError) {
        console.warn('Merch objednávky se nepodařilo načíst. Ostatní admin nechávám běžet:', merchOrdersError);
      }

      const visitsSnapshot = await getDoc(doc(db, 'siteStats', 'visits'));
      const visitsData = visitsSnapshot.exists() ? visitsSnapshot.data() : null;

      try {
        const seasonSnapshot = await getDoc(doc(db, 'siteSettings', 'season'));
        const savedCurrentSeason = seasonSnapshot.exists()
          ? seasonSnapshot.data()?.currentSeason
          : CURRENT_SEASON;

        if (savedCurrentSeason) {
          setCurrentSeason(savedCurrentSeason);
          setMatchListSeasonFilter(savedCurrentSeason);
        }
      } catch (seasonError) {
        console.warn('Nepodařilo se načíst nastavení sezony:', seasonError);
      }

      const dailyStatsSnapshot = await getDocs(collection(db, 'siteStatsDaily'));
      const loadedDailyStats = dailyStatsSnapshot.docs.map((item) => ({
        id: item.id,
        ...item.data(),
      }));

      setNewsItems(loadedNews);
      setMatches(loadedMatches);
      setGalleryAlbums(loadedGallery);
      setMerchProducts(loadedMerchProducts);
      setMerchOrders(loadedMerchOrders);
      setSiteStats({
        visitCount: Number(visitsData?.count) || 0,
        createdAt: visitsData?.createdAt || null,
        updatedAt: visitsData?.updatedAt || null,
      });
      setDailyVisitStats(loadedDailyStats);
    } catch (error) {
      console.error('Chyba při načítání admin dat:', error);
      alert('Nepodařilo se načíst data z Firebase.');
    } finally {
      setLoading(false);
    }
  };

  const isAllowedAdmin = Boolean(
    authUser?.email && ALLOWED_ADMIN_EMAILS.includes(authUser.email.toLowerCase())
  );

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setAuthUser(user);
      setAuthLoading(false);
    });

    return unsubscribe;
  }, []);

  useEffect(() => {
    if (!authLoading && isAllowedAdmin) {
      loadAllData();
    }

    if (!authLoading && !authUser) {
      setLoading(false);
    }
  }, [authLoading, isAllowedAdmin, authUser]);

  useEffect(() => {
    document.documentElement.classList.toggle('theme-dark', theme === 'dark');
    document.documentElement.style.colorScheme = theme;
    localStorage.setItem('ask-lipuvka-theme', theme);

    return () => {
      document.documentElement.style.colorScheme = '';
    };
  }, [theme]);

  const newsByCategory = useMemo(() => {
    return categories.map((category) => ({
      ...category,
      item:
        newsItems.find(
          (news) => news.category === category.id && getItemSeason(news) === newsForm.season
        ) || null,
    }));
  }, [newsItems, newsForm.season]);

  const sortedMatches = useMemo(() => {
    return [...matches].sort((a, b) => parseMatchDate(a) - parseMatchDate(b));
  }, [matches]);

  const filteredMatches = useMemo(() => {
    const today = new Date();
    const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());

    const filtered = sortedMatches.filter((match) => {
      const categoryOk =
        matchListCategoryFilter === 'all' || match.category === matchListCategoryFilter;
      const seasonOk =
        matchListSeasonFilter === 'all' || getItemSeason(match) === matchListSeasonFilter;

      const matchDate = parseMatchDate(match);
      const timeOk =
        matchListTimeFilter === 'all' ||
        (matchListTimeFilter === 'future' && matchDate >= todayStart) ||
        (matchListTimeFilter === 'played' && matchDate < todayStart);

      return categoryOk && seasonOk && timeOk;
    });

    if (matchListTimeFilter === 'played') {
      return filtered.sort((a, b) => parseMatchDate(b) - parseMatchDate(a));
    }

    return filtered.sort((a, b) => parseMatchDate(a) - parseMatchDate(b));
  }, [sortedMatches, matchListCategoryFilter, matchListSeasonFilter, matchListTimeFilter]);

  const getGallerySortTime = (album) => {
    const linkedMatch = matches.find((match) => match.galleryAlbumId === album.id);
    if (linkedMatch) {
      const linkedMatchDate = parseMatchDate(linkedMatch);
      const linkedMatchTime = linkedMatchDate.getTime();
      if (!Number.isNaN(linkedMatchTime)) return linkedMatchTime;
    }

    const updatedAt = album.updatedAt || album.createdAt;
    if (updatedAt) {
      const parsedUpdatedAt = new Date(updatedAt).getTime();
      if (!Number.isNaN(parsedUpdatedAt)) return parsedUpdatedAt;
    }

    return 0;
  };

  const sortedGallery = useMemo(() => {
    return [...galleryAlbums].sort((a, b) => {
      const dateDiff = getGallerySortTime(b) - getGallerySortTime(a);
      if (dateDiff !== 0) return dateDiff;
      return a.title.localeCompare(b.title, 'cs');
    });
  }, [galleryAlbums, matches]);


  const sortedMerchProducts = useMemo(() => {
    return [...merchProducts].sort((a, b) => {
      const orderA = Number(a.order) || 0;
      const orderB = Number(b.order) || 0;
      if (orderA !== orderB) return orderA - orderB;
      return String(a.title || '').localeCompare(String(b.title || ''), 'cs');
    });
  }, [merchProducts]);

  const sortedMerchOrders = useMemo(() => {
    return [...merchOrders].sort((a, b) => {
      const getTime = (value) => {
        if (typeof value?.toDate === 'function') return value.toDate().getTime();
        const parsed = new Date(value).getTime();
        return Number.isNaN(parsed) ? 0 : parsed;
      };
      return getTime(b.createdAt) - getTime(a.createdAt);
    });
  }, [merchOrders]);

  const merchOrderStatusLabels = {
    new: 'Nová',
    ordered: 'Objednáno',
    ready: 'Připraveno',
    handed: 'Předáno',
  };

  const parseMerchVariants = (value) =>
    value
      .split('\n')
      .map((item) => item.trim())
      .filter(Boolean);

  const formatMerchVariants = (variants = []) => variants.join('\n');

  const formatDateTime = (value) => {
    if (!value) return '—';

    try {
      if (typeof value?.toDate === 'function') {
        return value.toDate().toLocaleString('cs-CZ');
      }

      const parsed = new Date(value);
      if (Number.isNaN(parsed.getTime())) return '—';
      return parsed.toLocaleString('cs-CZ');
    } catch {
      return '—';
    }
  };

  const dailyVisitStatsSorted = useMemo(() => {
    return [...dailyVisitStats].sort((a, b) => a.date.localeCompare(b.date));
  }, [dailyVisitStats]);

  const last14DaysStats = useMemo(() => {
    return dailyVisitStatsSorted.slice(-14);
  }, [dailyVisitStatsSorted]);

  const visitTotals = useMemo(() => {
    const today = dailyVisitStatsSorted[dailyVisitStatsSorted.length - 1] || null;

    const sumFromTail = (days, key) =>
      dailyVisitStatsSorted
        .slice(-days)
        .reduce((sum, item) => sum + (Number(item?.[key]) || 0), 0);

    return {
      total: Number(siteStats.visitCount) || 0,
      todayTotal: Number(today?.totalVisits) || 0,
      todayUnique: Number(today?.uniqueVisits) || 0,
      total7: sumFromTail(7, 'totalVisits'),
      unique7: sumFromTail(7, 'uniqueVisits'),
      total30: sumFromTail(30, 'totalVisits'),
      unique30: sumFromTail(30, 'uniqueVisits'),
    };
  }, [dailyVisitStatsSorted, siteStats.visitCount]);

  const matchesByCategoryStats = useMemo(() => {
    return categories.map((category) => ({
      ...category,
      total: matches.filter((match) => match.category === category.id).length,
      played: matches.filter(
        (match) => match.category === category.id && (match.status || 'planned') === 'played'
      ).length,
      planned: matches.filter(
        (match) => match.category === category.id && (match.status || 'planned') === 'planned'
      ).length,
    }));
  }, [matches]);

  const galleryByCategoryStats = useMemo(() => {
    return categories.map((category) => ({
      ...category,
      total: galleryAlbums.filter(
        (album) => album.type === 'team' && album.category === category.id
      ).length,
    }));
  }, [galleryAlbums]);

  const newsByCategoryStats = useMemo(() => {
    return categories.map((category) => ({
      ...category,
      total: newsItems.filter((item) => item.category === category.id).length,
    }));
  }, [newsItems]);

  const linkedAlbumsCount = useMemo(() => {
    return matches.filter((match) => Boolean(match.galleryAlbumId)).length;
  }, [matches]);

  const chartMaxValue = useMemo(() => {
    const values = last14DaysStats.flatMap((item) => [
      Number(item?.totalVisits) || 0,
      Number(item?.uniqueVisits) || 0,
    ]);
    return Math.max(...values, 1);
  }, [last14DaysStats]);

  const filteredPeriodStats = useMemo(() => {
    return dailyVisitStatsSorted.slice(-statsPeriod).reverse();
  }, [dailyVisitStatsSorted, statsPeriod]);

  const filteredChartMaxValue = useMemo(() => {
    const values = filteredPeriodStats.flatMap((item) => [
      Number(item?.totalVisits) || 0,
      Number(item?.uniqueVisits) || 0,
    ]);
    return Math.max(...values, 1);
  }, [filteredPeriodStats]);

  const statsSummary = useMemo(() => {
    const periodStatsChronological = [...filteredPeriodStats].sort((a, b) =>
      String(a.date || '').localeCompare(String(b.date || ''))
    );
    const periodDays = periodStatsChronological.length || 1;
    const totalVisits = periodStatsChronological.reduce((sum, item) => sum + (Number(item?.totalVisits) || 0), 0);
    const uniqueVisits = periodStatsChronological.reduce((sum, item) => sum + (Number(item?.uniqueVisits) || 0), 0);

    const bestDay = periodStatsChronological.reduce((best, item) => {
      const value = Number(item?.totalVisits) || 0;
      if (!best || value > (Number(best?.totalVisits) || 0)) return item;
      return best;
    }, null);

    const previousDay = periodStatsChronological.length > 1 ? periodStatsChronological[periodStatsChronological.length - 2] : null;
    const latestDay = periodStatsChronological.length > 0 ? periodStatsChronological[periodStatsChronological.length - 1] : null;

    const latestTotal = Number(latestDay?.totalVisits) || 0;
    const previousTotal = Number(previousDay?.totalVisits) || 0;
    const trendDelta = latestTotal - previousTotal;

    return {
      totalVisits,
      uniqueVisits,
      avgTotalPerDay: Math.round((totalVisits / periodDays) * 10) / 10,
      avgUniquePerDay: Math.round((uniqueVisits / periodDays) * 10) / 10,
      bestDay,
      trendDelta,
    };
  }, [filteredPeriodStats]);

  const periodButtonClass = (days) =>
    `rounded-xl px-4 py-2 text-sm font-semibold transition ${
      statsPeriod === days
        ? 'bg-green-600 text-white shadow-md'
        : 'border border-green-200 bg-white text-green-700 hover:bg-green-50'
    }`;

  const handleSaveCurrentSeason = async () => {
    try {
      setSavingCurrentSeason(true);
      await setDoc(doc(db, 'siteSettings', 'season'), {
        currentSeason,
        updatedAt: serverTimestamp(),
      }, { merge: true });
      setMatchListSeasonFilter(currentSeason);
      alert(`Aktuální sezona webu je nastavená na ${currentSeason}.`);
    } catch (error) {
      console.error('Chyba při ukládání aktuální sezony:', error);
      alert('Nepodařilo se uložit aktuální sezonu.');
    } finally {
      setSavingCurrentSeason(false);
    }
  };

  const handleNewsChange = (field, value) => {
    setNewsForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleMatchChange = (field, value) => {
    setMatchForm((prev) => {
      const next = {
        ...prev,
        [field]: value,
      };

      if (field === 'date') {
        next.dateISO = formatDateToISO(value);
      }

      if (field === 'hasSecondBlock' && value === false) {
        next.matchLabel2 = '';
        next.result2 = '';
        next.scorers2 = '';
      }

      if (field === 'home' && value === true && !prev.venue.trim()) {
        next.venue = 'Lipůvka';
      }

      return next;
    });
  };

  const handleGalleryChange = (field, value) => {
    setGalleryForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };


  const handleMerchProductChange = (field, value) => {
    setMerchProductForm((prev) => {
      const next = {
        ...prev,
        [field]: value,
      };

      if (field === 'productKind') {
        next.type = value === 'item' ? 'Předmět' : 'Oblečení';
        if (value === 'item') next.variantsText = '';
      }

      return next;
    });
  };

  const resetMerchProductForm = () => {
    setEditingMerchProductId(null);
    setMerchProductForm({
      title: '',
      productKind: 'clothing',
      type: 'Oblečení',
      description: '',
      price: '',
      image: '',
      variantsText: '',
      order: '',
      active: true,
    });
  };

  const handleSaveMerchProduct = async (e) => {
    e.preventDefault();

    if (!merchProductForm.title.trim() || String(merchProductForm.price).trim() === '') {
      alert('Vyplň název produktu a cenu.');
      return;
    }

    try {
      setSaving(true);
      const productKind = merchProductForm.productKind === 'item' ? 'item' : 'clothing';
      const payload = {
        title: merchProductForm.title.trim(),
        productKind,
        type: productKind === 'item' ? 'Předmět' : 'Oblečení',
        description: merchProductForm.description.trim(),
        price: Number(merchProductForm.price) || 0,
        image: merchProductForm.image.trim(),
        variants: productKind === 'clothing' ? parseMerchVariants(merchProductForm.variantsText) : [],
        order: Number(merchProductForm.order) || 0,
        active: Boolean(merchProductForm.active),
        updatedAt: serverTimestamp(),
      };

      if (editingMerchProductId) {
        await updateDoc(doc(db, 'merchProducts', editingMerchProductId), payload);
      } else {
        await addDoc(collection(db, 'merchProducts'), {
          ...payload,
          createdAt: serverTimestamp(),
        });
      }

      resetMerchProductForm();
      await loadAllData();
      alert(editingMerchProductId ? 'Produkt byl upraven.' : 'Produkt byl přidán.');
    } catch (error) {
      console.error('Chyba při ukládání merch produktu:', error);
      alert(`Nepodařilo se uložit merch produkt: ${error?.message || error}`);
    } finally {
      setSaving(false);
    }
  };

  const handleEditMerchProduct = (product) => {
    setEditingMerchProductId(product.id);
    const productKind = product.productKind === 'item' ? 'item' : 'clothing';
    setMerchProductForm({
      title: product.title || '',
      productKind,
      type: productKind === 'item' ? 'Předmět' : 'Oblečení',
      description: product.description || '',
      price: product.price ?? '',
      image: product.image || '',
      variantsText: productKind === 'clothing' ? formatMerchVariants(product.variants || []) : '',
      order: product.order ?? '',
      active: product.active !== false,
    });
    setActiveSection('merch');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDeleteMerchProduct = async (productId) => {
    const confirmed = window.confirm('Opravdu smazat tento merch produkt?');
    if (!confirmed) return;

    try {
      setSaving(true);
      await deleteDoc(doc(db, 'merchProducts', productId));
      await loadAllData();
    } catch (error) {
      console.error('Chyba při mazání merch produktu:', error);
      alert('Nepodařilo se smazat merch produkt.');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleMerchProductActive = async (product) => {
    try {
      setSaving(true);
      await updateDoc(doc(db, 'merchProducts', product.id), {
        active: product.active === false,
        updatedAt: serverTimestamp(),
      });
      await loadAllData();
    } catch (error) {
      console.error('Chyba při změně viditelnosti merch produktu:', error);
      alert('Nepodařilo se změnit viditelnost produktu.');
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateMerchOrderStatus = async (orderId, status) => {
    try {
      await updateDoc(doc(db, 'merchOrders', orderId), {
        status,
        updatedAt: serverTimestamp(),
      });
      await loadAllData();
    } catch (error) {
      console.error('Chyba při změně stavu objednávky:', error);
      alert('Nepodařilo se změnit stav objednávky.');
    }
  };


  const handleCreateStarterMerchProducts = async () => {
    const confirmed = window.confirm('Přidat základní produkty: bílé tričko a bílo-černá kšiltovka?');
    if (!confirmed) return;

    try {
      setSaving(true);
      const starterProducts = [
        {
          title: 'Bílé tričko',
          productKind: 'clothing',
          type: 'Oblečení',
          description: 'Bílé klubové tričko.',
          price: 0,
          image: '',
          variants: ['116', '128', '140', '152', 'S', 'M', 'L'],
          order: 1,
          active: true,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        },
        {
          title: 'Bílo-černá kšiltovka',
          productKind: 'clothing',
          type: 'Oblečení',
          description: 'Bílo-černá klubová kšiltovka.',
          price: 0,
          image: '',
          variants: ['Dětská', 'Dospělá'],
          order: 2,
          active: true,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        },
      ];

      await Promise.all(
        starterProducts.map((product) => addDoc(collection(db, 'merchProducts'), product))
      );

      await loadAllData();
    } catch (error) {
      console.error('Chyba při vytvoření základních merch produktů:', error);
      alert('Nepodařilo se vytvořit základní produkty.');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteMerchOrder = async (orderId) => {
    const confirmed = window.confirm('Opravdu smazat tuto objednávku?');
    if (!confirmed) return;

    try {
      await deleteDoc(doc(db, 'merchOrders', orderId));
      await loadAllData();
    } catch (error) {
      console.error('Chyba při mazání merch objednávky:', error);
      alert('Nepodařilo se smazat objednávku.');
    }
  };

  const handleFolderSelect = (e) => {
    const files = Array.from(e.target.files || []);

    if (!files.length) return;

    const imageFiles = files
      .filter((file) => /\.(jpg|jpeg|png|webp)$/i.test(file.name))
      .sort((a, b) => {
        const numA = parseInt((a.name.match(/(\d+)/)?.[1] || '0'), 10);
        const numB = parseInt((b.name.match(/(\d+)/)?.[1] || '0'), 10);
        return numA - numB || a.name.localeCompare(b.name, 'cs');
      });

    if (!imageFiles.length) {
      alert('Ve vybrané složce nejsou žádné podporované fotky.');
      return;
    }

    const firstFile = imageFiles[0];
    const relativePath = firstFile.webkitRelativePath || firstFile.name;
    const folderParts = relativePath.split('/').slice(0, -1);
    let folderPath = folderParts.join('/');

    folderPath = folderPath.replace(/^public\/?/, '');
    if (!folderPath.startsWith('/')) {
      folderPath = `/${folderPath}`;
    }

    const photos = imageFiles.map((file) => `${folderPath}/${file.name}`);

    setGalleryForm((prev) => ({
      ...prev,
      folder: folderPath,
      fromNumber: '1',
      toNumber: String(imageFiles.length),
      coverNumber: prev.coverNumber || '1',
      cover: `${folderPath}/${prev.coverNumber || '1'}.jpg`,
      photosText: photos.join('\n'),
    }));
  };

  const handleGenerateGalleryPhotos = () => {
    const result = generatePhotoPaths(
      galleryForm.folder,
      galleryForm.fromNumber,
      galleryForm.toNumber
    );

    if (result.error) {
      alert(result.error);
      return;
    }

    const coverNumber = Number(galleryForm.coverNumber);
    const fallbackCoverNumber = Number(galleryForm.fromNumber) || 1;
    const finalCoverNumber =
      Number.isInteger(coverNumber) && coverNumber >= 1 ? coverNumber : fallbackCoverNumber;

    setGalleryForm((prev) => ({
      ...prev,
      folder: result.normalizedFolder,
      cover: `${result.normalizedFolder}/${finalCoverNumber}.jpg`,
      photosText: result.photos.join('\n'),
    }));
  };

  const handleClearGalleryGenerator = () => {
    setGalleryForm((prev) => ({
      ...prev,
      folder: '',
      fromNumber: '1',
      toNumber: '',
      coverNumber: '1',
    }));
  };

  const handleSaveNews = async (e) => {
    e.preventDefault();

    if (!newsForm.title.trim() || !newsForm.text.trim() || !newsForm.date.trim()) {
      alert('Vyplň název, text i datum novinky.');
      return;
    }

    try {
      setSaving(true);

      const existingNews = newsItems.find(
        (item) => item.category === newsForm.category && getItemSeason(item) === newsForm.season
      );

      const payload = {
        season: newsForm.season || CURRENT_SEASON,
        category: newsForm.category,
        title: newsForm.title.trim(),
        text: newsForm.text.trim(),
        date: newsForm.date.trim(),
        image: newsForm.image.trim(),
      };

      if (existingNews) {
        await updateDoc(doc(db, 'news', existingNews.id), payload);
      } else {
        await addDoc(collection(db, 'news'), payload);
      }

      await loadAllData();
      alert('Novinka byla uložena.');
    } catch (error) {
      console.error(error);
      alert('Nepodařilo se uložit novinku.');
    } finally {
      setSaving(false);
    }
  };

  const handleEditNews = (item) => {
    setNewsForm({
      season: getItemSeason(item),
      category: item.category || 'mladsi-pripravka',
      title: item.title || '',
      text: item.text || '',
      date: item.date || '',
      image: item.image || '',
    });
    setActiveSection('news');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDeleteNews = async (id) => {
    const confirmed = window.confirm('Opravdu chceš smazat tuto novinku?');
    if (!confirmed) return;

    try {
      await deleteDoc(doc(db, 'news', id));
      await loadAllData();
      alert('Novinka byla smazána.');
    } catch (error) {
      console.error(error);
      alert('Nepodařilo se smazat novinku.');
    }
  };

  const handleSaveMatch = async (e) => {
    e.preventDefault();

    if (!matchForm.date.trim() || !matchForm.opponent.trim() || !matchForm.time.trim()) {
      alert('Vyplň datum, soupeře a čas.');
      return;
    }

    try {
      setSaving(true);

      const payload = {
        season: matchForm.season || CURRENT_SEASON,
        category: matchForm.category,
        date: matchForm.date.trim(),
        dateISO: matchForm.dateISO || formatDateToISO(matchForm.date),
        opponent: matchForm.opponent.trim(),
        time: matchForm.time.trim(),
        home: matchForm.home,
        venue: matchForm.venue.trim(),
        status: matchForm.status,
        hasSecondBlock: matchForm.hasSecondBlock,
        matchLabel1: matchForm.matchLabel1.trim(),
        result1: matchForm.result1.trim(),
        scorers1: matchForm.scorers1.trim(),
        matchLabel2: matchForm.hasSecondBlock ? matchForm.matchLabel2.trim() : '',
        result2: matchForm.hasSecondBlock ? matchForm.result2.trim() : '',
        scorers2: matchForm.hasSecondBlock ? matchForm.scorers2.trim() : '',
        articleTitle: matchForm.articleTitle.trim(),
        article: matchForm.article.trim(),
        galleryAlbumId: matchForm.galleryAlbumId || '',
      };

      if (editingMatchId) {
        await updateDoc(doc(db, 'matches', editingMatchId), payload);
      } else {
        await addDoc(collection(db, 'matches'), payload);
      }

      await loadAllData();
      resetMatchForm();
      alert(editingMatchId ? 'Zápas byl upraven.' : 'Zápas byl přidán.');
    } catch (error) {
      console.error(error);
      alert('Nepodařilo se uložit zápas.');
    } finally {
      setSaving(false);
    }
  };

  const handleEditMatch = (match) => {
    const hasSecondBlock = Boolean(
      match.hasSecondBlock || match.matchLabel2 || match.result2 || match.scorers2
    );

    setEditingMatchId(match.id);
    setMatchForm({
      season: getItemSeason(match),
      category: match.category || 'mladsi-pripravka',
      date: match.date || '',
      dateISO: match.dateISO || formatDateToISO(match.date || ''),
      opponent: match.opponent || '',
      time: match.time || '',
      home: Boolean(match.home),
      venue: match.venue || '',
      status: match.status || 'planned',
      hasSecondBlock,
      matchLabel1: match.matchLabel1 || '',
      result1: match.result1 || '',
      scorers1: match.scorers1 || '',
      matchLabel2: match.matchLabel2 || '',
      result2: match.result2 || '',
      scorers2: match.scorers2 || '',
      articleTitle: match.articleTitle || '',
      article: match.article || '',
      galleryAlbumId: match.galleryAlbumId || '',
    });
    setActiveSection('matches');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDeleteMatch = async (id) => {
    const confirmed = window.confirm('Opravdu chceš smazat tento zápas?');
    if (!confirmed) return;

    try {
      await deleteDoc(doc(db, 'matches', id));
      await loadAllData();

      if (editingMatchId === id) {
        resetMatchForm();
      }

      alert('Zápas byl smazán.');
    } catch (error) {
      console.error(error);
      alert('Nepodařilo se smazat zápas.');
    }
  };

  const handleSaveGallery = async (e) => {
    e.preventDefault();

    if (!galleryForm.title.trim() || !galleryForm.cover.trim()) {
      alert('Vyplň název alba a cover fotku.');
      return;
    }

    const parsedPhotos = parsePhotosText(galleryForm.photosText);

    if (parsedPhotos.length === 0) {
      alert('Album musí obsahovat alespoň jednu fotku.');
      return;
    }

    if (galleryForm.type === 'team' && !galleryForm.category) {
      alert('Vyber kategorii týmu.');
      return;
    }

    try {
      setSaving(true);

      const now = new Date().toISOString();
      const payload = {
        season: galleryForm.season || CURRENT_SEASON,
        type: galleryForm.type,
        category: galleryForm.type === 'team' ? galleryForm.category : '',
        title: galleryForm.title.trim(),
        cover: galleryForm.cover.trim(),
        photos: parsedPhotos,
        updatedAt: now,
      };

      if (editingGalleryId) {
        await updateDoc(doc(db, 'gallery', editingGalleryId), payload);
      } else {
        await addDoc(collection(db, 'gallery'), {
          ...payload,
          createdAt: now,
        });
      }

      await loadAllData();
      resetGalleryForm();
      alert(editingGalleryId ? 'Album bylo upraveno.' : 'Album bylo přidáno.');
    } catch (error) {
      console.error(error);
      alert('Nepodařilo se uložit album.');
    } finally {
      setSaving(false);
    }
  };

  const handleEditGallery = (album) => {
    setEditingGalleryId(album.id);
    setGalleryForm({
      season: getItemSeason(album),
      type: album.type || 'global',
      category: album.category || 'mladsi-pripravka',
      title: album.title || '',
      cover: album.cover || '',
      photosText: formatPhotosText(album.photos || []),
      folder: '',
      fromNumber: '1',
      toNumber: '',
      coverNumber: '1',
    });
    setActiveSection('gallery');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDeleteGallery = async (id) => {
    const confirmed = window.confirm('Opravdu chceš smazat toto album?');
    if (!confirmed) return;

    try {
      await deleteDoc(doc(db, 'gallery', id));
      await loadAllData();

      if (editingGalleryId === id) {
        resetGalleryForm();
      }

      alert('Album bylo smazáno.');
    } catch (error) {
      console.error(error);
      alert('Nepodařilo se smazat album.');
    }
  };

  const getCategoryLabel = (categoryId) =>
    categories.find((category) => category.id === categoryId)?.label || categoryId;

  const getCategoryShortLabel = (categoryId) =>
    categories.find((category) => category.id === categoryId)?.shortLabel || categoryId;

  const getAlbumLabel = (albumId) =>
    galleryAlbums.find((album) => album.id === albumId)?.title || 'Nenapojeno';

  const formatScorersPreview = (scorers) => {
    if (!scorers) return 'neuvedeni';
    return scorers
      .split('\n')
      .map((item) => item.trim())
      .filter(Boolean)
      .join(', ');
  };

  const currentAlbum = matchForm.galleryAlbumId
    ? galleryAlbums.find((album) => album.id === matchForm.galleryAlbumId)
    : null;

  const handleGoogleLogin = async () => {
    try {
      setAuthError('');
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error('Chyba přihlášení:', error);
      setAuthError('Přihlášení přes Google se nepovedlo. Zkus to prosím znovu.');
    }
  };

  const handleGoogleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Chyba odhlášení:', error);
      setAuthError('Odhlášení se nepovedlo.');
    }
  };

  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 text-gray-900">
        <div className="rounded-3xl border border-green-100 bg-white p-8 text-center shadow-sm">
          <div className="text-lg font-semibold text-gray-700">Kontroluji přihlášení…</div>
        </div>
      </div>
    );
  }

  if (!authUser) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 text-gray-900">
        <div className="w-full max-w-md rounded-3xl border border-green-100 bg-white p-8 text-center shadow-sm">
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-2xl">🔐</div>
          <h1 className="text-3xl font-black text-green-700">Admin ASK Lipůvka</h1>
          <p className="mt-3 text-gray-600">Pro správu webu se přihlas Google účtem.</p>

          {authError && (
            <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700">
              {authError}
            </div>
          )}

          <button
            type="button"
            onClick={handleGoogleLogin}
            className="mt-6 w-full rounded-xl bg-green-600 px-5 py-3 font-semibold text-white transition hover:bg-green-700"
          >
            Přihlásit přes Google
          </button>

          <a
            href="/"
            className="mt-4 inline-flex items-center justify-center rounded-xl border border-green-200 bg-green-50 px-5 py-3 font-semibold text-green-700 transition hover:bg-green-100"
          >
            ← Zpět na web
          </a>
        </div>
      </div>
    );
  }

  if (!isAllowedAdmin) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 text-gray-900">
        <div className="w-full max-w-lg rounded-3xl border border-red-100 bg-white p-8 text-center shadow-sm">
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-red-100 text-2xl">⛔</div>
          <h1 className="text-3xl font-black text-red-700">Nemáš přístup</h1>
          <p className="mt-3 text-gray-600">
            Přihlášený účet <span className="font-bold text-gray-900">{authUser.email}</span> není v seznamu povolených administrátorů.
          </p>
          <button
            type="button"
            onClick={handleGoogleLogout}
            className="mt-6 rounded-xl bg-gray-900 px-5 py-3 font-semibold text-white transition hover:bg-black"
          >
            Odhlásit
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-8 text-gray-900 md:px-6">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 rounded-3xl border border-green-100 bg-white p-6 shadow-sm md:p-8">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="mb-2 inline-flex rounded-full bg-green-100 px-3 py-1 text-xs font-bold uppercase tracking-wide text-green-700">
                Admin panel
              </div>
              <h1 className="text-3xl font-black text-green-700 md:text-4xl">
                Správa webu ASK Lipůvka
              </h1>
              <p className="mt-2 text-gray-600">
                Novinky, zápasy a galerie na jednom místě.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <a
                href="/"
                className="inline-flex items-center justify-center rounded-xl border border-green-200 bg-green-50 px-5 py-3 font-semibold text-green-700 transition hover:bg-green-100"
              >
                ← Zpět na web
              </a>
            </div>
          </div>
        </div>

        <div className="mb-8 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => setActiveSection('news')}
            className={sectionButtonClass(activeSection === 'news')}
          >
            Novinky
          </button>

          <button
            type="button"
            onClick={() => setActiveSection('matches')}
            className={sectionButtonClass(activeSection === 'matches')}
          >
            Zápasy
          </button>

          <button
            type="button"
            onClick={() => setActiveSection('gallery')}
            className={sectionButtonClass(activeSection === 'gallery')}
          >
            Galerie
          </button>

          <button
            type="button"
            onClick={() => setActiveSection('merch')}
            className={sectionButtonClass(activeSection === 'merch')}
          >
            Merch
          </button>

          <button
            type="button"
            onClick={() => setActiveSection('stats')}
            className={sectionButtonClass(activeSection === 'stats')}
          >
            Statistiky
          </button>
        </div>

        <div className="mb-8 rounded-3xl border border-green-100 bg-green-50/70 p-6 shadow-sm">
          <div className="mb-3 text-sm font-bold uppercase tracking-wide text-green-700">
            Nastavení sezony na webu
          </div>
          <div className="grid gap-4 md:grid-cols-[1fr_auto]">
            <label>
              <span className={labelClass}>Aktuální sezona, která se ukáže návštěvníkům po otevření webu</span>
              <select
                value={currentSeason}
                onChange={(e) => setCurrentSeason(e.target.value)}
                className={inputClass}
              >
                {seasonOptions.map((season) => (
                  <option key={season} value={season}>{season}</option>
                ))}
              </select>
            </label>

            <div className="flex items-end">
              <button
                type="button"
                onClick={handleSaveCurrentSeason}
                disabled={savingCurrentSeason}
                className={greenButtonClass}
              >
                {savingCurrentSeason ? 'Ukládám…' : 'Uložit aktuální sezonu'}
              </button>
            </div>
          </div>
          <p className="mt-3 text-sm text-gray-600">
            Teď necháš 2025/26. V červenci jen přepneš na 2026/27 a web začne jako výchozí ukazovat novou sezonu. Staré věci zůstanou dohledatelné přes přepínač sezony.
          </p>
        </div>

        {loading ? (
          <div className="rounded-3xl border border-green-100 bg-white p-10 text-center shadow-sm">
            <div className="text-lg font-semibold text-gray-700">Načítám data…</div>
          </div>
        ) : (
          <>
            {activeSection === 'news' && (
              <div className="grid gap-8 xl:grid-cols-[1.1fr_0.9fr]">
                <div className={cardSoftClass}>
                  <div className="mb-6">
                    <div className="mb-2 text-sm font-semibold uppercase tracking-wide text-green-700">
                      Jedna novinka pro každý tým
                    </div>
                    <h2 className="text-2xl font-bold text-green-700">
                      {newsItems.find(
                        (item) => item.category === newsForm.category && getItemSeason(item) === newsForm.season
                      )
                        ? 'Upravit novinku'
                        : 'Přidat novinku'}
                    </h2>
                  </div>

                  <form onSubmit={handleSaveNews} className="space-y-5">
                    <div>
                      <label className={labelClass}>Sezona</label>
                      <select
                        value={newsForm.season}
                        onChange={(e) => handleNewsChange('season', e.target.value)}
                        className={inputClass}
                      >
                        {seasonOptions.map((season) => (
                          <option key={season} value={season}>{season}</option>
                        ))}
                      </select>
                      <div className="mt-2 text-sm text-gray-500">
                        Nová sezona se zobrazí na hlavní stránce. Starší sezona zůstane v historii.
                      </div>
                    </div>

                    <div>
                      <label className={labelClass}>Kategorie</label>
                      <select
                        value={newsForm.category}
                        onChange={(e) => handleNewsChange('category', e.target.value)}
                        className={inputClass}
                      >
                        {categories.map((category) => (
                          <option key={category.id} value={category.id}>
                            {category.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className={labelClass}>Datum</label>
                      <input
                        type="text"
                        value={newsForm.date}
                        onChange={(e) => handleNewsChange('date', e.target.value)}
                        placeholder="Např. 2. 4. 2026"
                        className={inputClass}
                      />
                    </div>

                    <div>
                      <label className={labelClass}>Název novinky</label>
                      <input
                        type="text"
                        value={newsForm.title}
                        onChange={(e) => handleNewsChange('title', e.target.value)}
                        placeholder="Název novinky"
                        className={inputClass}
                      />
                    </div>

                    <div>
                      <label className={labelClass}>Text novinky</label>
                      <textarea
                        rows="7"
                        value={newsForm.text}
                        onChange={(e) => handleNewsChange('text', e.target.value)}
                        placeholder="Text novinky"
                        className={inputClass}
                      />
                    </div>

                    <div>
                      <label className={labelClass}>Fotka pod novinkou (nepovinné)</label>
                      <input
                        type="text"
                        value={newsForm.image}
                        onChange={(e) => handleNewsChange('image', e.target.value)}
                        placeholder="Např. /novinky/nabor.jpg"
                        className={inputClass}
                      />
                      <div className="mt-2 text-sm text-gray-500">
                        Když pole necháš prázdné, fotka se na webu nezobrazí.
                      </div>
                    </div>

                    <button type="submit" disabled={saving} className={greenButtonClass}>
                      {saving ? 'Ukládám…' : 'Uložit novinku'}
                    </button>
                  </form>
                </div>

                <div className="space-y-5">
                  {newsByCategory.map((category) => (
                    <div key={category.id} className={cardClass}>
                      <div className="mb-3 flex items-center justify-between gap-3">
                        <div>
                          <div className="text-lg font-bold text-gray-900">{category.label}</div>
                          <div className="text-sm text-gray-500">Sezona {newsForm.season}</div>
                        </div>
                      </div>

                      {category.item ? (
                        <>
                          <div className="mb-2 text-sm font-semibold uppercase tracking-wide text-green-700">
                            {category.item.date} · {getItemSeason(category.item)}
                          </div>
                          <div className="mb-2 text-lg font-bold text-gray-900">
                            {category.item.title}
                          </div>
                          <p className="mb-4 text-sm leading-7 text-gray-700">
                            {category.item.text}
                          </p>

                          {category.item.image && (
                            <img
                              src={category.item.image}
                              alt={category.item.title}
                              className="mb-4 max-h-36 w-full rounded-xl object-cover"
                            />
                          )}

                          <div className="flex flex-wrap gap-3">
                            <button
                              type="button"
                              onClick={() => handleEditNews(category.item)}
                              className={outlineButtonClass}
                            >
                              Upravit
                            </button>

                            <button
                              type="button"
                              onClick={() => handleDeleteNews(category.item.id)}
                              className={dangerButtonClass}
                            >
                              Smazat
                            </button>
                          </div>
                        </>
                      ) : (
                        <div className="text-sm text-gray-500">
                          Pro tuto kategorii zatím není uložená žádná novinka.
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeSection === 'matches' && (
              <div className="grid gap-8 xl:grid-cols-[1.12fr_0.88fr]">
                <div className="space-y-6">
                  <div className={cardSoftClass}>
                    <div className="mb-6 flex items-center justify-between gap-3">
                      <div>
                        <div className="mb-2 text-sm font-semibold uppercase tracking-wide text-green-700">
                          Správa zápasů
                        </div>
                        <h2 className="text-2xl font-bold text-green-700">
                          {editingMatchId ? 'Upravit zápas' : 'Přidat zápas'}
                        </h2>
                      </div>

                      {editingMatchId && (
                        <button
                          type="button"
                          onClick={resetMatchForm}
                          className={outlineButtonClass}
                        >
                          Zrušit editaci
                        </button>
                      )}
                    </div>

                    <form onSubmit={handleSaveMatch} className="space-y-6">
                      <div className="rounded-2xl border border-green-200 bg-white p-5">
                        <div className="mb-4 text-lg font-bold text-green-700">Základ zápasu</div>

                        <div className="grid gap-5 md:grid-cols-2">
                          <div>
                            <label className={labelClass}>Sezona</label>
                            <select
                              value={matchForm.season}
                              onChange={(e) => handleMatchChange('season', e.target.value)}
                              className={inputClass}
                            >
                              {seasonOptions.map((season) => (
                                <option key={season} value={season}>{season}</option>
                              ))}
                            </select>
                          </div>

                          <div>
                            <label className={labelClass}>Kategorie</label>
                            <select
                              value={matchForm.category}
                              onChange={(e) => handleMatchChange('category', e.target.value)}
                              className={inputClass}
                            >
                              {categories.map((category) => (
                                <option key={category.id} value={category.id}>
                                  {category.label}
                                </option>
                              ))}
                            </select>
                          </div>

                          <div>
                            <label className={labelClass}>Status zápasu</label>
                            <select
                              value={matchForm.status}
                              onChange={(e) => handleMatchChange('status', e.target.value)}
                              className={inputClass}
                            >
                              <option value="planned">Plánováno</option>
                              <option value="played">Odehráno</option>
                            </select>
                            <div className="mt-2 text-sm text-gray-500">
                              Můžeš dát „odehráno“ i ve stejný den.
                            </div>
                          </div>

                          <div>
                            <label className={labelClass}>Datum</label>
                            <input
                              type="text"
                              value={matchForm.date}
                              onChange={(e) => handleMatchChange('date', e.target.value)}
                              placeholder="Např. 14. 5. 2026"
                              className={inputClass}
                            />
                          </div>

                          <div>
                            <label className={labelClass}>Čas</label>
                            <input
                              type="text"
                              value={matchForm.time}
                              onChange={(e) => handleMatchChange('time', e.target.value)}
                              placeholder="Např. 17:00 / 18:00"
                              className={inputClass}
                            />
                          </div>

                          <div className="md:col-span-2">
                            <label className={labelClass}>Soupeř</label>
                            <input
                              type="text"
                              value={matchForm.opponent}
                              onChange={(e) => handleMatchChange('opponent', e.target.value)}
                              placeholder="Např. Blansko A a B"
                              className={inputClass}
                            />
                          </div>

                          <div>
                            <label className={labelClass}>Typ zápasu</label>
                            <select
                              value={matchForm.home ? 'home' : 'away'}
                              onChange={(e) =>
                                handleMatchChange('home', e.target.value === 'home')
                              }
                              className={inputClass}
                            >
                              <option value="home">Domácí</option>
                              <option value="away">Venkovní</option>
                            </select>
                          </div>

                          <div>
                            <label className={labelClass}>Místo / hřiště</label>
                            <input
                              type="text"
                              value={matchForm.venue}
                              onChange={(e) => handleMatchChange('venue', e.target.value)}
                              placeholder="Např. Lipůvka / hřiště Knínice"
                              className={inputClass}
                            />
                          </div>
                        </div>
                      </div>

                      <div className="rounded-2xl border border-green-200 bg-white p-5">
                        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                          <div className="text-lg font-bold text-green-700">Výsledek zápasu</div>

                          <label className="inline-flex items-center gap-3 rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm font-semibold text-gray-700">
                            <input
                              type="checkbox"
                              checked={matchForm.hasSecondBlock}
                              onChange={(e) =>
                                handleMatchChange('hasSecondBlock', e.target.checked)
                              }
                              className="h-4 w-4"
                            />
                            Zápas má i 2. blok
                          </label>
                        </div>

                        <div className="space-y-5">
                          <div className="rounded-2xl border border-green-100 bg-green-50/40 p-4">
                            <div className="mb-4 text-base font-bold text-green-700">1. blok</div>

                            <div className="space-y-4">
                              <div>
                                <label className={labelClass}>Název 1. bloku</label>
                                <input
                                  type="text"
                                  value={matchForm.matchLabel1}
                                  onChange={(e) =>
                                    handleMatchChange('matchLabel1', e.target.value)
                                  }
                                  placeholder="Např. 1. zápas / Turnaj / Přátelák"
                                  className={inputClass}
                                />
                              </div>

                              <div>
                                <label className={labelClass}>Výsledek 1. bloku</label>
                                <input
                                  type="text"
                                  value={matchForm.result1}
                                  onChange={(e) => handleMatchChange('result1', e.target.value)}
                                  placeholder="Např. 5:3"
                                  className={inputClass}
                                />
                              </div>

                              <div>
                                <label className={labelClass}>Střelci 1. bloku</label>
                                <textarea
                                  rows="3"
                                  value={matchForm.scorers1}
                                  onChange={(e) => handleMatchChange('scorers1', e.target.value)}
                                  placeholder={`Novák 2x
Svoboda 1x`}
                                  className={inputClass}
                                />
                                <div className="mt-2 text-sm text-gray-500">
                                  Nepovinné. Každý střelec na nový řádek.
                                </div>
                              </div>
                            </div>
                          </div>

                          {matchForm.hasSecondBlock && (
                            <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4">
                              <div className="mb-4 text-base font-bold text-gray-700">2. blok</div>

                              <div className="space-y-4">
                                <div>
                                  <label className={labelClass}>Název 2. bloku</label>
                                  <input
                                    type="text"
                                    value={matchForm.matchLabel2}
                                    onChange={(e) =>
                                      handleMatchChange('matchLabel2', e.target.value)
                                    }
                                    placeholder="Např. 2. zápas / Finále / Přátelák"
                                    className={inputClass}
                                  />
                                </div>

                                <div>
                                  <label className={labelClass}>Výsledek 2. bloku</label>
                                  <input
                                    type="text"
                                    value={matchForm.result2}
                                    onChange={(e) =>
                                      handleMatchChange('result2', e.target.value)
                                    }
                                    placeholder="Např. 3:2"
                                    className={inputClass}
                                  />
                                </div>

                                <div>
                                  <label className={labelClass}>Střelci 2. bloku</label>
                                  <textarea
                                    rows="3"
                                    value={matchForm.scorers2}
                                    onChange={(e) =>
                                      handleMatchChange('scorers2', e.target.value)
                                    }
                                    placeholder={`Hudec 1x
Večeřa 1x`}
                                    className={inputClass}
                                  />
                                  <div className="mt-2 text-sm text-gray-500">
                                    Nepovinné. Každý střelec na nový řádek.
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="rounded-2xl border border-green-200 bg-white p-5">
                        <div className="mb-4 text-lg font-bold text-green-700">Report</div>

                        <div className="space-y-4">
                          <div>
                            <label className={labelClass}>Nadpis článku</label>
                            <input
                              type="text"
                              value={matchForm.articleTitle}
                              onChange={(e) =>
                                handleMatchChange('articleTitle', e.target.value)
                              }
                              placeholder="Např. Halový turnaj Blansko"
                              className={inputClass}
                            />
                          </div>

                          <div>
                            <label className={labelClass}>Článek k zápasu</label>
                            <textarea
                              rows="6"
                              value={matchForm.article}
                              onChange={(e) => handleMatchChange('article', e.target.value)}
                              placeholder="Text článku nebo report ze zápasu"
                              className={inputClass}
                            />
                          </div>
                        </div>
                      </div>

                      <div className="rounded-2xl border border-green-200 bg-white p-5">
                        <div className="mb-4 text-lg font-bold text-green-700">Fotoreport</div>

                        <div className="space-y-4">
                          <div>
                            <label className={labelClass}>Fotoreport album</label>
                            <select
                              value={matchForm.galleryAlbumId}
                              onChange={(e) =>
                                handleMatchChange('galleryAlbumId', e.target.value)
                              }
                              className={inputClass}
                            >
                              <option value="">Bez fotoreportu</option>
                              {sortedGallery.map((album) => (
                                <option key={album.id} value={album.id}>
                                  {album.title}
                                </option>
                              ))}
                            </select>
                            <div className="mt-2 text-sm text-gray-500">
                              K zápasu už se nepřidávají ruční fotky. Vybereš album z galerie a to se použije na detailu zápasu.
                            </div>
                          </div>

                          {currentAlbum && (
                            <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4">
                              <div className="text-sm font-semibold text-gray-800">
                                Aktuálně vybrané album
                              </div>
                              <div className="mt-2 text-base font-bold text-gray-900">
                                {currentAlbum.title}
                              </div>
                              <div className="mt-1 text-sm text-gray-500">
                                Počet fotek: {currentAlbum.photos?.length || 0}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      <button type="submit" disabled={saving} className={greenButtonClass}>
                        {saving
                          ? 'Ukládám…'
                          : editingMatchId
                          ? 'Uložit úpravy zápasu'
                          : 'Přidat zápas'}
                      </button>
                    </form>
                  </div>
                </div>

                <div className="space-y-5">
                  <div className="rounded-3xl border border-green-100 bg-white p-5 shadow-sm">
                    <div className="mb-4 flex flex-col gap-4">
                      <div>
                        <div className="text-lg font-bold text-gray-900">Přehled zápasů</div>
                        <div className="text-sm text-gray-500">
                          Filtruj si zápasy podle kategorie a času.
                        </div>
                      </div>

                      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-1 2xl:grid-cols-2">
                        <div>
                          <label className={labelClass}>Kategorie</label>
                          <select
                            value={matchListCategoryFilter}
                            onChange={(e) => setMatchListCategoryFilter(e.target.value)}
                            className={inputClass}
                          >
                            <option value="all">Všechny kategorie</option>
                            {categories.map((category) => (
                              <option key={category.id} value={category.id}>
                                {category.label}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className={labelClass}>Zápasy</label>
                          <div className="grid grid-cols-3 gap-2 rounded-xl bg-gray-100 p-1">
                            <button
                              type="button"
                              onClick={() => setMatchListTimeFilter('future')}
                              className={`rounded-lg px-3 py-2 text-sm font-bold transition ${
                                matchListTimeFilter === 'future'
                                  ? 'bg-green-600 text-white shadow-sm'
                                  : 'text-gray-700 hover:bg-white'
                              }`}
                            >
                              Budoucí
                            </button>

                            <button
                              type="button"
                              onClick={() => setMatchListTimeFilter('played')}
                              className={`rounded-lg px-3 py-2 text-sm font-bold transition ${
                                matchListTimeFilter === 'played'
                                  ? 'bg-green-600 text-white shadow-sm'
                                  : 'text-gray-700 hover:bg-white'
                              }`}
                            >
                              Odehrané
                            </button>

                            <button
                              type="button"
                              onClick={() => setMatchListTimeFilter('all')}
                              className={`rounded-lg px-3 py-2 text-sm font-bold transition ${
                                matchListTimeFilter === 'all'
                                  ? 'bg-green-600 text-white shadow-sm'
                                  : 'text-gray-700 hover:bg-white'
                              }`}
                            >
                              Všechny
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="rounded-2xl bg-gray-50 px-4 py-3 text-sm text-gray-600">
                      Zobrazeno zápasů: <span className="font-bold text-gray-900">{filteredMatches.length}</span>
                    </div>
                  </div>

                  {filteredMatches.length > 0 ? (
                    filteredMatches.map((match) => {
                      const categoryLabel = getCategoryLabel(match.category);
                      const shortLabel = getCategoryShortLabel(match.category);
                      const label1 = match.matchLabel1 || '1. blok';
                      const label2 = match.matchLabel2 || '2. blok';
                      const isPlayed = match.status === 'played';
                      const hasSecondBlock = Boolean(
                        match.hasSecondBlock ||
                          match.matchLabel2 ||
                          match.result2 ||
                          match.scorers2
                      );

                      return (
                        <div key={match.id} className="rounded-2xl border border-green-100 bg-white p-5 shadow-sm">
                          <div className="mb-4 flex flex-wrap items-center gap-2">
                            <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-bold uppercase tracking-wide text-green-700">
                              {shortLabel}
                            </span>

                            <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-bold text-gray-700">
                              {categoryLabel}
                            </span>

                            <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-700">
                              {getItemSeason(match)}
                            </span>

                            <span
                              className={`rounded-full px-3 py-1 text-xs font-bold ${
                                isPlayed
                                  ? 'bg-gray-900 text-white'
                                  : 'bg-yellow-100 text-yellow-800'
                              }`}
                            >
                              {isPlayed ? 'Odehráno' : 'Plánováno'}
                            </span>

                            <span
                              className={`rounded-full px-3 py-1 text-xs font-bold ${
                                match.home
                                  ? 'bg-green-100 text-green-700'
                                  : 'bg-red-100 text-red-600'
                              }`}
                            >
                              {match.home ? 'Domácí' : 'Venkovní'}
                            </span>
                          </div>

                          <div className="mb-1 text-sm font-semibold uppercase tracking-wide text-green-700">
                            {match.date} • {match.time}
                          </div>

                          <div className="mb-3 text-xl font-bold text-gray-900">
                            {match.home
                              ? `ASK Lipůvka vs. ${match.opponent}`
                              : `${match.opponent} vs. ASK Lipůvka`}
                          </div>

                          <div className="mb-4 text-sm text-gray-500">
                            {match.home ? 'Místo: Lipůvka' : `Místo: ${match.venue || 'bude doplněno'}`}
                          </div>

                          <div className="space-y-3 rounded-2xl bg-gray-50 p-4">
                            <div className="text-sm text-gray-700">
                              <span className="font-semibold">{label1}:</span>{' '}
                              {match.result1 || 'neuveden'}
                            </div>

                            <div className="text-sm text-gray-700">
                              <span className="font-semibold">Střelci:</span>{' '}
                              {formatScorersPreview(match.scorers1)}
                            </div>

                            {hasSecondBlock && (
                              <>
                                <div className="border-t border-gray-200 pt-3 text-sm text-gray-700">
                                  <span className="font-semibold">{label2}:</span>{' '}
                                  {match.result2 || 'neuveden'}
                                </div>

                                <div className="text-sm text-gray-700">
                                  <span className="font-semibold">Střelci:</span>{' '}
                                  {formatScorersPreview(match.scorers2)}
                                </div>
                              </>
                            )}
                          </div>

                          <div className="mt-4 rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-700">
                            <span className="font-semibold">Fotoreport:</span>{' '}
                            {match.galleryAlbumId ? getAlbumLabel(match.galleryAlbumId) : 'nenapojen'}
                          </div>

                          <div className="mt-5 flex flex-wrap gap-3">
                            <button
                              type="button"
                              onClick={() => handleEditMatch(match)}
                              className={outlineButtonClass}
                            >
                              Upravit
                            </button>

                            <button
                              type="button"
                              onClick={() => handleDeleteMatch(match.id)}
                              className={dangerButtonClass}
                            >
                              Smazat
                            </button>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className={cardClass}>
                      <div className="text-gray-500">
                        Pro vybraný filtr tu nejsou žádné zápasy.
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}



            {activeSection === 'merch' && (
              <div className="space-y-8">
                <div className="grid gap-8 xl:grid-cols-[1fr_1fr]">
                  <div className={cardSoftClass}>
                    <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                      <div>
                        <div className="mb-2 text-sm font-semibold uppercase tracking-wide text-green-700">
                          Produkty na stránce /merch
                        </div>
                        <h2 className="text-2xl font-bold text-green-700">
                          {editingMerchProductId ? 'Upravit produkt' : 'Přidat produkt'}
                        </h2>
                        <p className="mt-2 text-sm text-gray-600">
                          Obrázek zadej jako cestu nebo URL. Produkt se zobrazí na samostatné stránce Merch.
                        </p>
                      </div>

                      {editingMerchProductId && (
                        <button type="button" onClick={resetMerchProductForm} className={outlineButtonClass}>
                          Zrušit editaci
                        </button>
                      )}
                    </div>

                    <form onSubmit={handleSaveMerchProduct} className="space-y-5">
                      <div>
                        <label className={labelClass}>Název produktu</label>
                        <input
                          type="text"
                          value={merchProductForm.title}
                          onChange={(e) => handleMerchProductChange('title', e.target.value)}
                          placeholder="Bílé tričko ASK Lipůvka"
                          className={inputClass}
                        />
                      </div>

                      <div className="grid gap-5 md:grid-cols-2">
                        <div>
                          <label className={labelClass}>Co chceš založit</label>
                          <select
                            value={merchProductForm.productKind}
                            onChange={(e) => handleMerchProductChange('productKind', e.target.value)}
                            className={inputClass}
                          >
                            <option value="clothing">Oblečení</option>
                            <option value="item">Předmět</option>
                          </select>
                        </div>

                        <div>
                          <label className={labelClass}>Cena v Kč</label>
                          <input
                            type="number"
                            min="0"
                            value={merchProductForm.price}
                            onChange={(e) => handleMerchProductChange('price', e.target.value)}
                            placeholder="390"
                            className={inputClass}
                          />
                        </div>
                      </div>

                      <div>
                        <label className={labelClass}>Popis</label>
                        <textarea
                          rows="4"
                          value={merchProductForm.description}
                          onChange={(e) => handleMerchProductChange('description', e.target.value)}
                          placeholder="Bílé klubové tričko vhodné na zápasy i tréninky."
                          className={inputClass}
                        />
                      </div>

                      <div className="rounded-2xl border border-green-200 bg-white/80 p-5">
                        <label className={labelClass}>Obrázek produktu</label>
                        <input
                          type="text"
                          value={merchProductForm.image}
                          onChange={(e) => handleMerchProductChange('image', e.target.value)}
                          placeholder="Např. /merch/tricko.jpg nebo https://..."
                          className={inputClass}
                        />
                        <div className="mt-3 text-sm text-gray-500">
                          Obrázek nahraj ručně do public/merch a sem vlož cestu. Např. /merch/ksiltovka.jpg
                        </div>

                        {merchProductForm.image && (
                          <div className="mt-4 overflow-hidden rounded-2xl border border-gray-200 bg-gray-50">
                            <img src={merchProductForm.image} alt="Náhled produktu" className="h-48 w-full object-cover" />
                          </div>
                        )}
                      </div>

                      {merchProductForm.productKind === 'clothing' && (
                        <div>
                          <label className={labelClass}>Velikosti / varianty</label>
                          <textarea
                            rows="6"
                            value={merchProductForm.variantsText}
                            onChange={(e) => handleMerchProductChange('variantsText', e.target.value)}
                            placeholder={`116
128
140
152
S
M
L`}
                            className={inputClass}
                          />
                          <div className="mt-2 text-sm text-gray-500">
                            Jedna velikost nebo varianta na řádek. U kšiltovky třeba Dětská a Dospělá.
                          </div>
                        </div>
                      )}

                      {merchProductForm.productKind === 'item' && (
                        <div className="rounded-2xl border border-gray-200 bg-white p-4 text-sm text-gray-600">
                          U předmětu se nevybírá velikost. Rodič zadá jen počet kusů v objednávce.
                        </div>
                      )}

                      <div className="grid gap-5 md:grid-cols-2">
                        <div>
                          <label className={labelClass}>Pořadí</label>
                          <input
                            type="number"
                            value={merchProductForm.order}
                            onChange={(e) => handleMerchProductChange('order', e.target.value)}
                            placeholder="1"
                            className={inputClass}
                          />
                        </div>

                        <label className="flex items-center gap-3 rounded-2xl border border-green-200 bg-white p-4 font-semibold text-gray-700">
                          <input
                            type="checkbox"
                            checked={merchProductForm.active}
                            onChange={(e) => handleMerchProductChange('active', e.target.checked)}
                            className="h-5 w-5"
                          />
                          Zobrazit na webu
                        </label>
                      </div>

                      <button type="submit" disabled={saving} className={greenButtonClass}>
                        {saving ? 'Ukládám…' : editingMerchProductId ? 'Uložit produkt' : 'Přidat produkt'}
                      </button>
                    </form>
                  </div>

                  <div className="space-y-5">
                    <div className={cardClass}>
                      <div className="mb-2 text-lg font-bold text-gray-900">Rychlý start</div>
                      <div className="space-y-2 text-sm text-gray-600">
                        <div><span className="font-semibold">Oblečení:</span> vyplníš velikosti / varianty.</div>
                        <div><span className="font-semibold">Předmět:</span> jen název, popis, cena, obrázek a počet kusů v objednávce.</div>
                      </div>
                      <button
                        type="button"
                        onClick={handleCreateStarterMerchProducts}
                        disabled={saving}
                        className={`${greenButtonClass} mt-4`}
                      >
                        Vytvořit tričko a kšiltovku
                      </button>
                    </div>

                    {sortedMerchProducts.length > 0 ? (
                      sortedMerchProducts.map((product) => (
                        <div key={product.id} className={cardClass}>
                          <div className="flex gap-4">
                            <div className="h-24 w-24 shrink-0 overflow-hidden rounded-2xl bg-gray-100">
                              {product.image ? (
                                <img src={product.image} alt={product.title} className="h-full w-full object-cover" />
                              ) : (
                                <div className="flex h-full items-center justify-center text-xs text-gray-500">Bez fotky</div>
                              )}
                            </div>

                            <div className="min-w-0 flex-1">
                              <div className="mb-2 flex flex-wrap items-center gap-2">
                                <span className={`rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wide ${product.active === false ? 'bg-gray-100 text-gray-600' : 'bg-green-100 text-green-700'}`}>
                                  {product.active === false ? 'Skryto' : 'Aktivní'}
                                </span>
                                <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-bold text-gray-700">
                                  {product.type || 'Oblečení'}
                                </span>
                              </div>
                              <div className="text-lg font-bold text-gray-900">{product.title}</div>
                              <div className="mt-1 text-sm font-semibold text-green-700">{Number(product.price || 0).toLocaleString('cs-CZ')} Kč</div>
                              {product.description && <div className="mt-2 text-sm text-gray-600">{product.description}</div>}
                              {product.variants?.length > 0 && (
                                <div className="mt-2 text-sm text-gray-500">
                                  Varianty: {product.variants.join(', ')}
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="mt-4 flex flex-wrap gap-3">
                            <button type="button" onClick={() => handleEditMerchProduct(product)} className={outlineButtonClass}>
                              Upravit
                            </button>
                            <button type="button" onClick={() => handleToggleMerchProductActive(product)} className={outlineButtonClass}>
                              {product.active === false ? 'Zobrazit' : 'Skrýt'}
                            </button>
                            <button type="button" onClick={() => handleDeleteMerchProduct(product.id)} className={dangerButtonClass}>
                              Smazat
                            </button>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className={cardClass}>
                        <div className="text-gray-500">Zatím tu nejsou žádné merch produkty.</div>
                      </div>
                    )}
                  </div>
                </div>

                <div className={cardSoftClass}>
                  <div className="mb-6">
                    <div className="mb-2 text-sm font-semibold uppercase tracking-wide text-green-700">
                      Objednávky z webu
                    </div>
                    <h2 className="text-2xl font-bold text-green-700">Merch objednávky</h2>
                  </div>

                  {sortedMerchOrders.length > 0 ? (
                    <div className="space-y-4">
                      {sortedMerchOrders.map((order) => (
                        <div key={order.id} className="rounded-2xl border border-green-100 bg-white p-5 shadow-sm">
                          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                            <div>
                              <div className="mb-1 text-lg font-bold text-gray-900">
                                {order.customer?.firstName || ''} {order.customer?.lastName || ''}
                              </div>
                              <div className="space-y-1 text-sm text-gray-600">
                                <div>Telefon: <span className="font-semibold">{order.customer?.phone || '—'}</span></div>
                                <div>Email: <span className="font-semibold">{order.customer?.email || '—'}</span></div>
                                <div>Datum: <span className="font-semibold">{formatDateTime(order.createdAt)}</span></div>
                                {order.customer?.note && <div>Poznámka: {order.customer.note}</div>}
                              </div>
                            </div>

                            <div className="flex flex-wrap gap-3">
                              <select
                                value={order.status || 'new'}
                                onChange={(e) => handleUpdateMerchOrderStatus(order.id, e.target.value)}
                                className={inputClass}
                              >
                                {Object.entries(merchOrderStatusLabels).map(([value, label]) => (
                                  <option key={value} value={value}>{label}</option>
                                ))}
                              </select>
                              <button type="button" onClick={() => handleDeleteMerchOrder(order.id)} className={dangerButtonClass}>
                                Smazat
                              </button>
                            </div>
                          </div>

                          <div className="mt-5 space-y-3">
                            {(order.items || []).map((item, index) => (
                              <div key={`${order.id}-${index}`} className="rounded-2xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700">
                                <div className="font-bold text-gray-900">{item.title}</div>
                                <div className="mt-1">
                                  {item.variant && <>Varianta: <span className="font-semibold">{item.variant}</span> · </>}
                                  Počet: <span className="font-semibold">{item.quantity}</span> · Cena: <span className="font-semibold">{Number(item.price || 0).toLocaleString('cs-CZ')} Kč / ks</span>
                                </div>
                              </div>
                            ))}
                          </div>

                          <div className="mt-4 rounded-2xl bg-green-50 p-4 text-right text-lg font-black text-green-800">
                            Celkem: {Number(order.total || 0).toLocaleString('cs-CZ')} Kč
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className={cardClass}>
                      <div className="text-gray-500">Zatím tu nejsou žádné objednávky.</div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeSection === 'stats' && (
              <div className="space-y-8">
                <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
                  <div className="rounded-3xl border border-green-100 bg-white p-6 shadow-sm">
                    <div className="text-sm font-semibold uppercase tracking-wide text-green-700">
                      Celkem návštěv
                    </div>
                    <div className="mt-3 text-4xl font-black text-gray-900">
                      {visitTotals.total.toLocaleString('cs-CZ')}
                    </div>
                    <div className="mt-2 text-sm text-gray-500">
                      Hlavní počítadlo webu
                    </div>
                  </div>

                  <div className="rounded-3xl border border-blue-100 bg-white p-6 shadow-sm">
                    <div className="text-sm font-semibold uppercase tracking-wide text-blue-700">
                      Dnes
                    </div>
                    <div className="mt-3 text-4xl font-black text-gray-900">
                      {visitTotals.todayTotal.toLocaleString('cs-CZ')}
                    </div>
                    <div className="mt-2 text-sm text-gray-500">
                      Všechny dnešní návštěvy
                    </div>
                  </div>

                  <div className="rounded-3xl border border-orange-100 bg-white p-6 shadow-sm">
                    <div className="text-sm font-semibold uppercase tracking-wide text-orange-700">
                      Unikátní dnes
                    </div>
                    <div className="mt-3 text-4xl font-black text-gray-900">
                      {visitTotals.todayUnique.toLocaleString('cs-CZ')}
                    </div>
                    <div className="mt-2 text-sm text-gray-500">
                      1 zařízení = 1 návštěva za den
                    </div>
                  </div>

                  <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
                    <div className="text-sm font-semibold uppercase tracking-wide text-gray-600">
                      Rychlá akce
                    </div>
                    <button
                      type="button"
                      onClick={loadAllData}
                      className="mt-3 rounded-xl bg-green-600 px-5 py-3 font-semibold text-white transition hover:bg-green-700"
                    >
                      Obnovit statistiky
                    </button>
                    <div className="mt-2 text-sm text-gray-500">
                      Načte aktuální data z Firebase
                    </div>
                  </div>
                </div>

                <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
                  <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
                    <div className="text-sm font-semibold uppercase tracking-wide text-gray-600">
                      7 dní
                    </div>
                    <div className="mt-3 text-3xl font-black text-gray-900">
                      {visitTotals.total7.toLocaleString('cs-CZ')}
                    </div>
                    <div className="mt-2 text-sm text-gray-500">
                      Všechny návštěvy
                    </div>
                  </div>

                  <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
                    <div className="text-sm font-semibold uppercase tracking-wide text-gray-600">
                      7 dní unikátní
                    </div>
                    <div className="mt-3 text-3xl font-black text-gray-900">
                      {visitTotals.unique7.toLocaleString('cs-CZ')}
                    </div>
                    <div className="mt-2 text-sm text-gray-500">
                      Unikátní návštěvy
                    </div>
                  </div>

                  <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
                    <div className="text-sm font-semibold uppercase tracking-wide text-gray-600">
                      30 dní
                    </div>
                    <div className="mt-3 text-3xl font-black text-gray-900">
                      {visitTotals.total30.toLocaleString('cs-CZ')}
                    </div>
                    <div className="mt-2 text-sm text-gray-500">
                      Všechny návštěvy
                    </div>
                  </div>

                  <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
                    <div className="text-sm font-semibold uppercase tracking-wide text-gray-600">
                      30 dní unikátní
                    </div>
                    <div className="mt-3 text-3xl font-black text-gray-900">
                      {visitTotals.unique30.toLocaleString('cs-CZ')}
                    </div>
                    <div className="mt-2 text-sm text-gray-500">
                      Unikátní návštěvy
                    </div>
                  </div>
                </div>

                <div className="grid gap-8 xl:grid-cols-[1.05fr_0.95fr]">
                  <div className="space-y-6">
                    <div className="rounded-3xl border border-green-100 bg-white p-6 shadow-sm">
                      <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                        <div>
                          <div className="text-sm font-semibold uppercase tracking-wide text-green-700">
                            Profi statistiky návštěvnosti
                          </div>
                          <h2 className="mt-2 text-2xl font-bold text-green-700">
                            Přehled návštěvnosti
                          </h2>
                        </div>

                        <div className="flex flex-wrap items-center gap-2">
                          <button type="button" onClick={() => setStatsPeriod(7)} className={periodButtonClass(7)}>
                            7 dní
                          </button>
                          <button type="button" onClick={() => setStatsPeriod(30)} className={periodButtonClass(30)}>
                            30 dní
                          </button>
                          <button type="button" onClick={() => setStatsPeriod(90)} className={periodButtonClass(90)}>
                            90 dní
                          </button>
                        </div>
                      </div>

                      <div className="mb-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                        <div className="rounded-2xl bg-gray-50 p-4">
                          <div className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                            Průměr / den
                          </div>
                          <div className="mt-2 text-2xl font-black text-gray-900">
                            {statsSummary.avgTotalPerDay.toLocaleString('cs-CZ')}
                          </div>
                          <div className="mt-1 text-sm text-gray-500">všechny návštěvy</div>
                        </div>

                        <div className="rounded-2xl bg-gray-50 p-4">
                          <div className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                            Unikátní / den
                          </div>
                          <div className="mt-2 text-2xl font-black text-gray-900">
                            {statsSummary.avgUniquePerDay.toLocaleString('cs-CZ')}
                          </div>
                          <div className="mt-1 text-sm text-gray-500">unikátní návštěvy</div>
                        </div>

                        <div className="rounded-2xl bg-gray-50 p-4">
                          <div className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                            Nejlepší den
                          </div>
                          <div className="mt-2 text-lg font-black text-gray-900">
                            {statsSummary.bestDay?.date || '—'}
                          </div>
                          <div className="mt-1 text-sm text-gray-500">
                            {statsSummary.bestDay ? `${Number(statsSummary.bestDay.totalVisits || 0).toLocaleString('cs-CZ')} návštěv` : 'zatím bez dat'}
                          </div>
                        </div>

                        <div className="rounded-2xl bg-gray-50 p-4">
                          <div className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                            Trend vs. včera
                          </div>
                          <div className={`mt-2 text-2xl font-black ${
                            statsSummary.trendDelta > 0
                              ? 'text-green-700'
                              : statsSummary.trendDelta < 0
                              ? 'text-red-600'
                              : 'text-gray-900'
                          }`}>
                            {statsSummary.trendDelta > 0 ? '+' : ''}{statsSummary.trendDelta.toLocaleString('cs-CZ')}
                          </div>
                          <div className="mt-1 text-sm text-gray-500">
                            rozdíl všech návštěv
                          </div>
                        </div>
                      </div>

                      <div className="mb-4 text-sm text-gray-500">
                        Modrá = všechny návštěvy • Zelená = unikátní návštěvy
                      </div>

                      {filteredPeriodStats.length > 0 ? (
                        <div className="space-y-4">
                          {filteredPeriodStats.map((item) => {
                            const total = Number(item?.totalVisits) || 0;
                            const unique = Number(item?.uniqueVisits) || 0;
                            const totalWidth = `${Math.max((total / filteredChartMaxValue) * 100, total > 0 ? 6 : 0)}%`;
                            const uniqueWidth = `${Math.max((unique / filteredChartMaxValue) * 100, unique > 0 ? 6 : 0)}%`;

                            return (
                              <div key={item.id || item.date}>
                                <div className="mb-2 flex items-center justify-between gap-3">
                                  <div className="text-sm font-semibold text-gray-800">
                                    {item.date}
                                  </div>
                                  <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500">
                                    <span>Všechny: {total}</span>
                                    <span>Unikátní: {unique}</span>
                                  </div>
                                </div>

                                <div className="space-y-2 rounded-2xl bg-gray-50 p-3">
                                  <div>
                                    <div className="mb-1 text-xs font-semibold uppercase tracking-wide text-blue-700">
                                      Všechny návštěvy
                                    </div>
                                    <div className="h-3 overflow-hidden rounded-full bg-gray-200">
                                      <div
                                        className="h-full rounded-full bg-blue-500 transition-all duration-300"
                                        style={{ width: totalWidth }}
                                      />
                                    </div>
                                  </div>

                                  <div>
                                    <div className="mb-1 text-xs font-semibold uppercase tracking-wide text-green-700">
                                      Unikátní návštěvy
                                    </div>
                                    <div className="h-3 overflow-hidden rounded-full bg-gray-200">
                                      <div
                                        className="h-full rounded-full bg-green-500 transition-all duration-300"
                                        style={{ width: uniqueWidth }}
                                      />
                                    </div>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <div className="rounded-2xl bg-gray-50 p-5 text-gray-600">
                          Zatím nejsou nasbíraná denní data. Jakmile web poběží s novým měřením, graf se začne plnit.
                        </div>
                      )}
                    </div>

                    <div className="rounded-3xl border border-green-100 bg-white p-6 shadow-sm">
                      <div className="mb-5">
                        <div className="text-sm font-semibold uppercase tracking-wide text-green-700">
                          Obsah webu
                        </div>
                        <h2 className="mt-2 text-2xl font-bold text-green-700">
                          Souhrn webu
                        </h2>
                      </div>

                      <div className="grid gap-4 sm:grid-cols-2">
                        <div className="rounded-2xl bg-green-50 p-5">
                          <div className="text-sm font-semibold uppercase tracking-wide text-green-700">
                            Novinky
                          </div>
                          <div className="mt-2 text-3xl font-black text-gray-900">
                            {newsItems.length}
                          </div>
                        </div>

                        <div className="rounded-2xl bg-blue-50 p-5">
                          <div className="text-sm font-semibold uppercase tracking-wide text-blue-700">
                            Zápasy
                          </div>
                          <div className="mt-2 text-3xl font-black text-gray-900">
                            {matches.length}
                          </div>
                        </div>

                        <div className="rounded-2xl bg-orange-50 p-5">
                          <div className="text-sm font-semibold uppercase tracking-wide text-orange-700">
                            Alba galerie
                          </div>
                          <div className="mt-2 text-3xl font-black text-gray-900">
                            {galleryAlbums.length}
                          </div>
                        </div>

                        <div className="rounded-2xl bg-gray-100 p-5">
                          <div className="text-sm font-semibold uppercase tracking-wide text-gray-700">
                            Napojené fotky k zápasu
                          </div>
                          <div className="mt-2 text-3xl font-black text-gray-900">
                            {linkedAlbumsCount}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="rounded-3xl border border-green-100 bg-white p-6 shadow-sm">
                      <div className="mb-5">
                        <div className="text-sm font-semibold uppercase tracking-wide text-green-700">
                          Technické info
                        </div>
                        <h2 className="mt-2 text-2xl font-bold text-green-700">
                          Stav počítadla
                        </h2>
                      </div>

                      <div className="space-y-3">
                        <div className="flex items-center justify-between rounded-2xl border border-gray-200 bg-gray-50 px-4 py-4">
                          <div className="font-semibold text-gray-800">Počítadlo od</div>
                          <div className="text-sm font-bold text-gray-900">
                            {formatDateTime(siteStats.createdAt)}
                          </div>
                        </div>

                        <div className="flex items-center justify-between rounded-2xl border border-gray-200 bg-gray-50 px-4 py-4">
                          <div className="font-semibold text-gray-800">Poslední změna</div>
                          <div className="text-sm font-bold text-gray-900">
                            {formatDateTime(siteStats.updatedAt)}
                          </div>
                        </div>

                        <div className="flex items-center justify-between rounded-2xl border border-gray-200 bg-gray-50 px-4 py-4">
                          <div className="font-semibold text-gray-800">Nasbíraných dnů</div>
                          <div className="text-xl font-black text-gray-900">
                            {dailyVisitStatsSorted.length}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="rounded-3xl border border-green-100 bg-white p-6 shadow-sm">
                      <div className="mb-5">
                        <div className="text-sm font-semibold uppercase tracking-wide text-green-700">
                          Zápasy podle kategorií
                        </div>
                        <h2 className="mt-2 text-2xl font-bold text-green-700">
                          Kategorie
                        </h2>
                      </div>

                      <div className="space-y-4">
                        {matchesByCategoryStats.map((category) => (
                          <div
                            key={category.id}
                            className="rounded-2xl border border-gray-200 bg-gray-50 p-5"
                          >
                            <div className="mb-3 flex items-center justify-between gap-3">
                              <div className="text-lg font-bold text-gray-900">
                                {category.label}
                              </div>
                              <span className="rounded-full bg-white px-3 py-1 text-xs font-bold text-gray-700 shadow-sm">
                                {category.total} zápasů
                              </span>
                            </div>

                            <div className="grid gap-3 sm:grid-cols-3">
                              <div className="rounded-xl bg-white px-4 py-3 shadow-sm">
                                <div className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                                  Celkem
                                </div>
                                <div className="mt-1 text-2xl font-black text-gray-900">
                                  {category.total}
                                </div>
                              </div>

                              <div className="rounded-xl bg-white px-4 py-3 shadow-sm">
                                <div className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                                  Odehráno
                                </div>
                                <div className="mt-1 text-2xl font-black text-gray-900">
                                  {category.played}
                                </div>
                              </div>

                              <div className="rounded-xl bg-white px-4 py-3 shadow-sm">
                                <div className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                                  Plánováno
                                </div>
                                <div className="mt-1 text-2xl font-black text-gray-900">
                                  {category.planned}
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="rounded-3xl border border-green-100 bg-white p-6 shadow-sm">
                      <div className="mb-5">
                        <div className="text-sm font-semibold uppercase tracking-wide text-green-700">
                          Přehled kategorií
                        </div>
                        <h2 className="mt-2 text-2xl font-bold text-green-700">
                          Novinky a galerie
                        </h2>
                      </div>

                      <div className="space-y-3">
                        {categories.map((category) => {
                          const newsCount =
                            newsByCategoryStats.find((item) => item.id === category.id)?.total || 0;
                          const galleryCount =
                            galleryByCategoryStats.find((item) => item.id === category.id)?.total || 0;

                          return (
                            <div
                              key={category.id}
                              className="rounded-2xl border border-gray-200 bg-gray-50 p-4"
                            >
                              <div className="mb-2 font-bold text-gray-900">{category.label}</div>
                              <div className="grid gap-3 sm:grid-cols-2">
                                <div className="rounded-xl bg-white px-4 py-3 shadow-sm">
                                  <div className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                                    Novinky
                                  </div>
                                  <div className="mt-1 text-2xl font-black text-gray-900">
                                    {newsCount}
                                  </div>
                                </div>
                                <div className="rounded-xl bg-white px-4 py-3 shadow-sm">
                                  <div className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                                    Týmová alba
                                  </div>
                                  <div className="mt-1 text-2xl font-black text-gray-900">
                                    {galleryCount}
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeSection === 'gallery' && (
              <div className="grid gap-8 xl:grid-cols-[1.1fr_0.9fr]">
                <div className={cardSoftClass}>
                  <div className="mb-6 flex items-center justify-between gap-3">
                    <div>
                      <div className="mb-2 text-sm font-semibold uppercase tracking-wide text-green-700">
                        Správa galerie
                      </div>
                      <h2 className="text-2xl font-bold text-green-700">
                        {editingGalleryId ? 'Upravit album' : 'Přidat album'}
                      </h2>
                    </div>

                    {editingGalleryId && (
                      <button
                        type="button"
                        onClick={resetGalleryForm}
                        className={outlineButtonClass}
                      >
                        Zrušit editaci
                      </button>
                    )}
                  </div>

                  <form onSubmit={handleSaveGallery} className="space-y-6">
                    <div>
                      <label className={labelClass}>Sezona</label>
                      <select
                        value={galleryForm.season}
                        onChange={(e) => handleGalleryChange('season', e.target.value)}
                        className={inputClass}
                      >
                        {seasonOptions.map((season) => (
                          <option key={season} value={season}>{season}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className={labelClass}>Typ alba</label>
                      <select
                        value={galleryForm.type}
                        onChange={(e) => handleGalleryChange('type', e.target.value)}
                        className={inputClass}
                      >
                        <option value="global">Společná galerie</option>
                        <option value="team">Fotky týmu</option>
                      </select>
                    </div>

                    {galleryForm.type === 'team' && (
                      <div>
                        <label className={labelClass}>Kategorie týmu</label>
                        <select
                          value={galleryForm.category}
                          onChange={(e) => handleGalleryChange('category', e.target.value)}
                          className={inputClass}
                        >
                          {categories.map((category) => (
                            <option key={category.id} value={category.id}>
                              {category.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}

                    <div>
                      <label className={labelClass}>Název alba</label>
                      <input
                        type="text"
                        value={galleryForm.title}
                        onChange={(e) => handleGalleryChange('title', e.target.value)}
                        placeholder="Např. 11. kolo"
                        className={inputClass}
                      />
                    </div>

                    <div className="rounded-2xl border border-green-200 bg-white/80 p-5">
                      <div className="mb-4">
                        <div className="text-sm font-semibold uppercase tracking-wide text-green-700">
                          Automatické generování fotek
                        </div>
                        <div className="mt-1 text-sm text-gray-600">
                          Můžeš buď vybrat složku z počítače, nebo vyplnit cestu a počet fotek ručně.
                        </div>
                      </div>

                      <div className="space-y-5">
                        <div>
                          <label className={labelClass}>Vybrat složku s fotkami</label>
                          <input
                            type="file"
                            webkitdirectory="true"
                            directory=""
                            multiple
                            onChange={handleFolderSelect}
                            className={inputClass}
                          />
                          <div className="mt-2 text-sm text-gray-500">
                            Vybereš složku z počítače a admin automaticky načte všechny fotky do alba.
                          </div>
                        </div>

                        <div>
                          <label className={labelClass}>Složka s fotkami</label>
                          <input
                            type="text"
                            value={galleryForm.folder}
                            onChange={(e) => handleGalleryChange('folder', e.target.value)}
                            placeholder="/zapasy/jaro26/11kolo"
                            className={inputClass}
                          />
                        </div>

                        <div className="grid gap-5 md:grid-cols-2">
                          <div>
                            <label className={labelClass}>Počet fotek</label>
                            <input
                              type="number"
                              min="1"
                              value={galleryForm.toNumber}
                              onChange={(e) => {
                                handleGalleryChange('fromNumber', '1');
                                handleGalleryChange('toNumber', e.target.value);
                              }}
                              placeholder="45"
                              className={inputClass}
                            />
                          </div>

                          <div>
                            <label className={labelClass}>Číslo cover fotky</label>
                            <input
                              type="number"
                              min="1"
                              value={galleryForm.coverNumber}
                              onChange={(e) => handleGalleryChange('coverNumber', e.target.value)}
                              placeholder="1"
                              className={inputClass}
                            />
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-3">
                          <button
                            type="button"
                            onClick={handleGenerateGalleryPhotos}
                            className={greenButtonClass}
                          >
                            Vygenerovat fotky
                          </button>

                          <button
                            type="button"
                            onClick={handleClearGalleryGenerator}
                            className={outlineButtonClass}
                          >
                            Vyčistit generátor
                          </button>
                        </div>

                        <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4">
                          <div className="mb-2 text-sm font-semibold text-gray-800">
                            Rychlý náhled
                          </div>

                          {galleryPreview.error ? (
                            <div className="text-sm text-gray-500">{galleryPreview.error}</div>
                          ) : (
                            <div className="space-y-2 text-sm text-gray-700">
                              <div>
                                <span className="font-semibold">Počet fotek:</span>{' '}
                                {galleryPreview.photos.length}
                              </div>
                              <div className="break-all">
                                <span className="font-semibold">Cover:</span> {galleryPreview.cover}
                              </div>
                              {galleryPreview.photos[0] && (
                                <div className="break-all">
                                  <span className="font-semibold">První fotka:</span>{' '}
                                  {galleryPreview.photos[0]}
                                </div>
                              )}
                              {galleryPreview.photos[galleryPreview.photos.length - 1] && (
                                <div className="break-all">
                                  <span className="font-semibold">Poslední fotka:</span>{' '}
                                  {galleryPreview.photos[galleryPreview.photos.length - 1]}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className={labelClass}>Cover fotka</label>
                      <input
                        type="text"
                        value={galleryForm.cover}
                        onChange={(e) => handleGalleryChange('cover', e.target.value)}
                        placeholder="/zapasy/jaro26/11kolo/1.jpg"
                        className={inputClass}
                      />
                    </div>

                    <div>
                      <label className={labelClass}>Fotky v albu</label>
                      <textarea
                        rows="10"
                        value={galleryForm.photosText}
                        onChange={(e) => handleGalleryChange('photosText', e.target.value)}
                        placeholder={`/zapasy/jaro26/11kolo/1.jpg
/zapasy/jaro26/11kolo/2.jpg
/zapasy/jaro26/11kolo/3.jpg`}
                        className={inputClass}
                      />
                      <div className="mt-2 text-sm text-gray-500">
                        Jedna cesta k fotce na řádek. Můžeš vyplnit ručně, nebo použít generátor nahoře.
                      </div>
                    </div>

                    <button type="submit" disabled={saving} className={greenButtonClass}>
                      {saving
                        ? 'Ukládám…'
                        : editingGalleryId
                        ? 'Uložit úpravy alba'
                        : 'Přidat album'}
                    </button>
                  </form>
                </div>

                <div className="space-y-5">
                  <div className="rounded-2xl border border-green-100 bg-white p-4 text-sm text-gray-600 shadow-sm">
                    Alba jsou seřazená od nejnovějšího nahoře. U alb napojených na zápas se bere datum zápasu, jinak poslední úprava alba.
                  </div>

                  {sortedGallery.length > 0 ? (
                    sortedGallery.map((album) => (
                      <div key={album.id} className={cardClass}>
                        <div className="mb-2 flex flex-wrap items-center gap-2">
                          <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-bold uppercase tracking-wide text-green-700">
                            {album.type === 'team' ? 'Fotky týmu' : 'Společná galerie'}
                          </span>

                          {album.type === 'team' && album.category && (
                            <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-bold text-gray-700">
                              {getCategoryLabel(album.category)}
                            </span>
                          )}
                        </div>

                        <div className="mb-2 text-lg font-bold text-gray-900">{album.title}</div>

                        <div className="mb-2 break-all text-sm text-gray-500">
                          Cover: {album.cover || 'není'}
                        </div>

                        <div className="mb-4 text-sm text-gray-700">
                          Počet fotek:{' '}
                          <span className="font-semibold">{album.photos?.length || 0}</span>
                        </div>

                        <div className="flex flex-wrap gap-3">
                          <button
                            type="button"
                            onClick={() => handleEditGallery(album)}
                            className={outlineButtonClass}
                          >
                            Upravit
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDeleteGallery(album.id)}
                            className={dangerButtonClass}
                          >
                            Smazat
                          </button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className={cardClass}>
                      <div className="text-gray-500">Zatím tu nejsou žádná alba.</div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}