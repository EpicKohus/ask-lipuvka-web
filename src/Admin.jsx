import { useEffect, useMemo, useState } from 'react';
import { db } from './firebase';
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  updateDoc,
} from 'firebase/firestore';

export default function Admin() {
  const categories = [
    { id: 'predpripravka', label: 'Předpřípravka (U7)' },
    { id: 'mladsi-pripravka', label: 'Mladší přípravka (U9)' },
    { id: 'starsi-pripravka', label: 'Starší přípravka (U11)' },
  ];

  const [activeSection, setActiveSection] = useState('news');

  const [newsItems, setNewsItems] = useState([]);
  const [matches, setMatches] = useState([]);
  const [galleryAlbums, setGalleryAlbums] = useState([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [newsForm, setNewsForm] = useState({
    category: 'mladsi-pripravka',
    title: '',
    text: '',
    date: '',
  });

  const [editingMatchId, setEditingMatchId] = useState(null);
  const [matchForm, setMatchForm] = useState({
    category: 'mladsi-pripravka',
    date: '',
    opponent: '',
    time: '',
    home: true,
    venue: 'Lipůvka',
    result1: '',
    scorers1: '',
    result2: '',
    scorers2: '',
    articleTitle: '',
    article: '',
    photosText: '',
    galleryAlbumId: '',
  });

  const [editingGalleryId, setEditingGalleryId] = useState(null);
  const [galleryForm, setGalleryForm] = useState({
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

  const resetMatchForm = () => {
    setEditingMatchId(null);
    setMatchForm({
      category: 'mladsi-pripravka',
      date: '',
      opponent: '',
      time: '',
      home: true,
      venue: 'Lipůvka',
      result1: '',
      scorers1: '',
      result2: '',
      scorers2: '',
      articleTitle: '',
      article: '',
      photosText: '',
      galleryAlbumId: '',
    });
  };

  const resetGalleryForm = () => {
    setEditingGalleryId(null);
    setGalleryForm({
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

      setNewsItems(loadedNews);
      setMatches(loadedMatches);
      setGalleryAlbums(loadedGallery);
    } catch (error) {
      console.error('Chyba při načítání admin dat:', error);
      alert('Nepodařilo se načíst data z Firebase.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllData();
  }, []);

  const newsByCategory = useMemo(() => {
    return categories.map((category) => ({
      ...category,
      item: newsItems.find((news) => news.category === category.id) || null,
    }));
  }, [newsItems]);

  const sortedMatches = useMemo(() => {
    const parseDate = (dateString) => {
      if (!dateString) return new Date(0);
      const parts = dateString
        .split('.')
        .map((part) => part.trim())
        .filter(Boolean);
      const [day, month, year] = parts;
      return new Date(Number(year), Number(month) - 1, Number(day));
    };

    return [...matches].sort((a, b) => parseDate(a.date) - parseDate(b.date));
  }, [matches]);

  const sortedGallery = useMemo(() => {
    return [...galleryAlbums].sort((a, b) => a.title.localeCompare(b.title, 'cs'));
  }, [galleryAlbums]);

  const handleNewsChange = (field, value) => {
    setNewsForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleMatchChange = (field, value) => {
    setMatchForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleGalleryChange = (field, value) => {
    setGalleryForm((prev) => ({
      ...prev,
      [field]: value,
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

      const existingNews = newsItems.find((item) => item.category === newsForm.category);

      const payload = {
        category: newsForm.category,
        title: newsForm.title.trim(),
        text: newsForm.text.trim(),
        date: newsForm.date.trim(),
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
      category: item.category || 'mladsi-pripravka',
      title: item.title || '',
      text: item.text || '',
      date: item.date || '',
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
        category: matchForm.category,
        date: matchForm.date.trim(),
        opponent: matchForm.opponent.trim(),
        time: matchForm.time.trim(),
        home: matchForm.home,
        venue: matchForm.venue.trim(),
        result1: matchForm.result1.trim(),
        scorers1: matchForm.scorers1.trim(),
        result2: matchForm.result2.trim(),
        scorers2: matchForm.scorers2.trim(),
        articleTitle: matchForm.articleTitle.trim(),
        article: matchForm.article.trim(),
        photos: parsePhotosText(matchForm.photosText),
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
    setEditingMatchId(match.id);
    setMatchForm({
      category: match.category || 'mladsi-pripravka',
      date: match.date || '',
      opponent: match.opponent || '',
      time: match.time || '',
      home: Boolean(match.home),
      venue: match.venue || '',
      result1: match.result1 || '',
      scorers1: match.scorers1 || '',
      result2: match.result2 || '',
      scorers2: match.scorers2 || '',
      articleTitle: match.articleTitle || '',
      article: match.article || '',
      photosText: formatPhotosText(match.photos || []),
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

      const payload = {
        type: galleryForm.type,
        category: galleryForm.type === 'team' ? galleryForm.category : '',
        title: galleryForm.title.trim(),
        cover: galleryForm.cover.trim(),
        photos: parsedPhotos,
      };

      if (editingGalleryId) {
        await updateDoc(doc(db, 'gallery', editingGalleryId), payload);
      } else {
        await addDoc(collection(db, 'gallery'), payload);
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

            <a
              href="/"
              className="inline-flex items-center justify-center rounded-xl border border-green-200 bg-green-50 px-5 py-3 font-semibold text-green-700 transition hover:bg-green-100"
            >
              ← Zpět na web
            </a>
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
                      {newsItems.find((item) => item.category === newsForm.category)
                        ? 'Upravit novinku'
                        : 'Přidat novinku'}
                    </h2>
                  </div>

                  <form onSubmit={handleSaveNews} className="space-y-5">
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
                          <div className="text-sm text-gray-500">Aktuální novinka</div>
                        </div>
                      </div>

                      {category.item ? (
                        <>
                          <div className="mb-2 text-sm font-semibold uppercase tracking-wide text-green-700">
                            {category.item.date}
                          </div>
                          <div className="mb-2 text-lg font-bold text-gray-900">
                            {category.item.title}
                          </div>
                          <p className="mb-4 text-sm leading-7 text-gray-700">
                            {category.item.text}
                          </p>

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
              <div className="grid gap-8 xl:grid-cols-[1.1fr_0.9fr]">
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

                  <form onSubmit={handleSaveMatch} className="space-y-5">
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

                    <div className="grid gap-5 md:grid-cols-2">
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
                    </div>

                    <div>
                      <label className={labelClass}>Soupeř</label>
                      <input
                        type="text"
                        value={matchForm.opponent}
                        onChange={(e) => handleMatchChange('opponent', e.target.value)}
                        placeholder="Např. Blansko A a B"
                        className={inputClass}
                      />
                    </div>

                    <div className="grid gap-5 md:grid-cols-2">
                      <div>
                        <label className={labelClass}>Typ zápasu</label>
                        <select
                          value={matchForm.home ? 'home' : 'away'}
                          onChange={(e) => handleMatchChange('home', e.target.value === 'home')}
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

                    <div className="rounded-2xl border border-green-200 bg-white p-5">
                      <div className="mb-4 text-lg font-bold text-green-700">1. zápas</div>

                      <div className="space-y-4">
                        <div>
                          <label className={labelClass}>Výsledek 1. zápasu</label>
                          <input
                            type="text"
                            value={matchForm.result1}
                            onChange={(e) => handleMatchChange('result1', e.target.value)}
                            placeholder="Např. 5:3"
                            className={inputClass}
                          />
                        </div>

                        <div>
                          <label className={labelClass}>Střelci 1. zápasu</label>
                          <textarea
                            rows="3"
                            value={matchForm.scorers1}
                            onChange={(e) => handleMatchChange('scorers1', e.target.value)}
                            placeholder={`Novák 2x
Svoboda 1x`}
                            className={inputClass}
                          />
                          <div className="mt-2 text-sm text-gray-500">
                            Nepovinné. Jeden střelec na řádek.
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="rounded-2xl border border-gray-200 bg-white p-5">
                      <div className="mb-4 text-lg font-bold text-gray-700">2. zápas (nepovinné)</div>

                      <div className="space-y-4">
                        <div>
                          <label className={labelClass}>Výsledek 2. zápasu</label>
                          <input
                            type="text"
                            value={matchForm.result2}
                            onChange={(e) => handleMatchChange('result2', e.target.value)}
                            placeholder="Např. 3:2"
                            className={inputClass}
                          />
                        </div>

                        <div>
                          <label className={labelClass}>Střelci 2. zápasu</label>
                          <textarea
                            rows="3"
                            value={matchForm.scorers2}
                            onChange={(e) => handleMatchChange('scorers2', e.target.value)}
                            placeholder={`Novák 1x
Hudec 1x`}
                            className={inputClass}
                          />
                          <div className="mt-2 text-sm text-gray-500">
                            Nepovinné. Když druhý zápas nebyl, nech prázdné.
                          </div>
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className={labelClass}>Nadpis článku</label>
                      <input
                        type="text"
                        value={matchForm.articleTitle}
                        onChange={(e) => handleMatchChange('articleTitle', e.target.value)}
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
                        placeholder="Text článku"
                        className={inputClass}
                      />
                    </div>

                    <div>
                      <label className={labelClass}>Fotky k zápasu</label>
                      <textarea
                        rows="6"
                        value={matchForm.photosText}
                        onChange={(e) => handleMatchChange('photosText', e.target.value)}
                        placeholder={`/zapasy/blansko1.jpg
/zapasy/blansko2.jpg`}
                        className={inputClass}
                      />
                      <div className="mt-2 text-sm text-gray-500">
                        Jedna cesta na řádek.
                      </div>
                    </div>

                    <div>
                      <label className={labelClass}>Fotoreport album</label>
                      <select
                        value={matchForm.galleryAlbumId}
                        onChange={(e) => handleMatchChange('galleryAlbumId', e.target.value)}
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
                        Tady vybereš album, které se pak automaticky otevře přes tlačítko Fotoreport.
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

                <div className="space-y-5">
                  {sortedMatches.length > 0 ? (
                    sortedMatches.map((match) => {
                      const categoryLabel = getCategoryLabel(match.category);

                      return (
                        <div key={match.id} className={cardClass}>
                          <div className="mb-2 text-sm font-semibold uppercase tracking-wide text-green-700">
                            {categoryLabel}
                          </div>

                          <div className="mb-1 text-lg font-bold text-gray-900">
                            {match.home
                              ? `ASK Lipůvka vs. ${match.opponent}`
                              : `${match.opponent} vs. ASK Lipůvka`}
                          </div>

                          <div className="mb-3 text-sm text-gray-500">
                            {match.date} • {match.time} •{' '}
                            {match.home ? 'Domácí zápas' : 'Venkovní zápas'}
                          </div>

                          <div className="mb-2 text-sm text-gray-700">
                            <span className="font-semibold">1. zápas:</span>{' '}
                            {match.result1 || 'neuveden'}
                          </div>

                          <div className="mb-2 text-sm text-gray-700">
                            <span className="font-semibold">Střelci 1. zápasu:</span>{' '}
                            {formatScorersPreview(match.scorers1)}
                          </div>

                          {match.result2 && (
                            <>
                              <div className="mb-2 text-sm text-gray-700">
                                <span className="font-semibold">2. zápas:</span>{' '}
                                {match.result2}
                              </div>

                              <div className="mb-2 text-sm text-gray-700">
                                <span className="font-semibold">Střelci 2. zápasu:</span>{' '}
                                {formatScorersPreview(match.scorers2)}
                              </div>
                            </>
                          )}

                          <div className="mb-4 text-sm text-gray-700">
                            <span className="font-semibold">Fotoreport:</span>{' '}
                            {match.galleryAlbumId ? getAlbumLabel(match.galleryAlbumId) : 'nenapojen'}
                          </div>

                          <div className="flex flex-wrap gap-3">
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
                      <div className="text-gray-500">Zatím tu nejsou žádné zápasy.</div>
                    </div>
                  )}
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
                          Vyplň složku a rozsah fotek, admin ti sám připraví celý seznam cest.
                        </div>
                      </div>

                      <div className="space-y-5">
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

                        <div className="grid gap-5 md:grid-cols-3">
                          <div>
                            <label className={labelClass}>Od čísla</label>
                            <input
                              type="number"
                              min="1"
                              value={galleryForm.fromNumber}
                              onChange={(e) => handleGalleryChange('fromNumber', e.target.value)}
                              placeholder="1"
                              className={inputClass}
                            />
                          </div>

                          <div>
                            <label className={labelClass}>Do čísla</label>
                            <input
                              type="number"
                              min="1"
                              value={galleryForm.toNumber}
                              onChange={(e) => handleGalleryChange('toNumber', e.target.value)}
                              placeholder="44"
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