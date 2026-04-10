import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { collection, getDocs } from 'firebase/firestore';
import { db } from './firebase';

export default function MatchDetail() {
  const { matchId } = useParams();
  const navigate = useNavigate();

  const [match, setMatch] = useState(null);
  const [galleryAlbums, setGalleryAlbums] = useState([]);
  const [allMatches, setAllMatches] = useState([]);
  const [loading, setLoading] = useState(true);

  const [selectedAlbum, setSelectedAlbum] = useState(null);
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState(null);

  const touchStartX = useRef(null);
  const touchEndX = useRef(null);

  const categories = [
    { id: 'predpripravka', label: 'Předpřípravka', shortLabel: 'U7' },
    { id: 'mladsi-pripravka', label: 'Mladší přípravka', shortLabel: 'U9' },
    { id: 'starsi-pripravka', label: 'Starší přípravka', shortLabel: 'U11' },
  ];

  const parseMatchDate = (dateString) => {
    if (!dateString) return new Date(0);

    const parts = dateString
      .split('.')
      .map((part) => part.trim())
      .filter(Boolean);

    const [day, month, year] = parts;
    return new Date(Number(year), Number(month) - 1, Number(day));
  };

  const isVideoFile = (filePath) => {
    if (!filePath || typeof filePath !== 'string') return false;
    return /\.(mp4|webm|ogg)$/i.test(filePath);
  };

  const formatScorersArray = (scorers) => {
    if (!scorers || typeof scorers !== 'string') return [];
    return scorers
      .split('\n')
      .map((item) => item.trim())
      .filter(Boolean);
  };

  const getCategoryShortLabel = (categoryId) =>
    categories.find((c) => c.id === categoryId)?.shortLabel || '';

  const getCategoryLabel = (categoryId) =>
    categories.find((c) => c.id === categoryId)?.label || '';

  const getCategoryStyle = (categoryId) => {
    switch (categoryId) {
      case 'predpripravka':
        return {
          badge: 'bg-blue-600 text-white',
          softBadge: 'bg-blue-100 text-blue-700',
          light: 'bg-blue-50 border-blue-200',
          text: 'text-blue-600',
          button: 'bg-blue-600 text-white hover:bg-blue-700',
          gradient: 'from-blue-700 via-blue-600 to-blue-500',
          ring: 'ring-blue-200',
        };
      case 'mladsi-pripravka':
        return {
          badge: 'bg-green-600 text-white',
          softBadge: 'bg-green-100 text-green-700',
          light: 'bg-green-50 border-green-200',
          text: 'text-green-600',
          button: 'bg-green-600 text-white hover:bg-green-700',
          gradient: 'from-green-700 via-green-600 to-emerald-500',
          ring: 'ring-green-200',
        };
      case 'starsi-pripravka':
        return {
          badge: 'bg-orange-500 text-white',
          softBadge: 'bg-orange-100 text-orange-700',
          light: 'bg-orange-50 border-orange-200',
          text: 'text-orange-600',
          button: 'bg-orange-500 text-white hover:bg-orange-600',
          gradient: 'from-orange-700 via-orange-500 to-amber-400',
          ring: 'ring-orange-200',
        };
      default:
        return {
          badge: 'bg-gray-500 text-white',
          softBadge: 'bg-gray-100 text-gray-700',
          light: 'bg-gray-50 border-gray-200',
          text: 'text-gray-600',
          button: 'bg-gray-500 text-white hover:bg-gray-600',
          gradient: 'from-gray-700 via-gray-600 to-gray-500',
          ring: 'ring-gray-200',
        };
    }
  };

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);

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

        const foundMatch = loadedMatches.find((item) => item.id === matchId) || null;

        setAllMatches(loadedMatches);
        setMatch(foundMatch);
        setGalleryAlbums(loadedGallery);
      } catch (error) {
        console.error('Chyba při načítání detailu zápasu:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [matchId]);

  useEffect(() => {
    const handleEsc = (event) => {
      if (event.key !== 'Escape') return;

      if (selectedPhotoIndex !== null) {
        setSelectedPhotoIndex(null);
        return;
      }

      if (selectedAlbum) {
        setSelectedAlbum(null);
      }
    };

    const handleArrowKeys = (event) => {
      if (!selectedAlbum || selectedPhotoIndex === null) return;

      if (event.key === 'ArrowLeft') {
        setSelectedPhotoIndex((prev) =>
          prev === 0 ? selectedAlbum.photos.length - 1 : prev - 1
        );
      }

      if (event.key === 'ArrowRight') {
        setSelectedPhotoIndex((prev) =>
          prev === selectedAlbum.photos.length - 1 ? 0 : prev + 1
        );
      }
    };

    window.addEventListener('keydown', handleEsc);
    window.addEventListener('keydown', handleArrowKeys);

    return () => {
      window.removeEventListener('keydown', handleEsc);
      window.removeEventListener('keydown', handleArrowKeys);
    };
  }, [selectedAlbum, selectedPhotoIndex]);

  useEffect(() => {
    const shouldLock = selectedAlbum || selectedPhotoIndex !== null;
    document.body.style.overflow = shouldLock ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [selectedAlbum, selectedPhotoIndex]);

  useEffect(() => {
    if (!match) return;

    const title = `${match.home ? `ASK Lipůvka vs. ${match.opponent}` : `${match.opponent} vs. ASK Lipůvka`} | ${match.date}`;
    document.title = title;
  }, [match]);

  const linkedAlbum = useMemo(() => {
    if (!match?.galleryAlbumId) return null;
    return galleryAlbums.find((album) => album.id === match.galleryAlbumId) || null;
  }, [galleryAlbums, match]);

  const previousAndNext = useMemo(() => {
    if (!match) return { prev: null, next: null };

    const sameCategoryMatches = allMatches
      .filter((item) => item.category === match.category)
      .sort((a, b) => parseMatchDate(a.date) - parseMatchDate(b.date));

    const currentIndex = sameCategoryMatches.findIndex((item) => item.id === match.id);

    return {
      prev: currentIndex > 0 ? sameCategoryMatches[currentIndex - 1] : null,
      next:
        currentIndex >= 0 && currentIndex < sameCategoryMatches.length - 1
          ? sameCategoryMatches[currentIndex + 1]
          : null,
    };
  }, [allMatches, match]);

  const categoryStyle = getCategoryStyle(match?.category);
  const selectedPhoto =
    selectedAlbum && selectedPhotoIndex !== null
      ? selectedAlbum.photos?.[selectedPhotoIndex]
      : null;

  const cleanMatchPhotos = match?.photos?.filter((photo) => photo !== '/field.png') || [];
  const firstPlayedResult = match?.result1?.trim();
  const secondPlayedResult = match?.result2?.trim();
  const hasMatchResult = Boolean(firstPlayedResult || secondPlayedResult);

  const label1 = match?.matchLabel1?.trim() || '1. blok';
  const label2 = match?.matchLabel2?.trim() || '2. blok';

  const scorers1 = formatScorersArray(match?.scorers1);
  const scorers2 = formatScorersArray(match?.scorers2);

  const heroImage =
    linkedAlbum?.cover ||
    linkedAlbum?.photos?.[0] ||
    cleanMatchPhotos[0] ||
    '/field.png';

  const isPlayed = match ? parseMatchDate(match.date) < new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate()) : false;

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

  const openAlbum = () => {
    if (!linkedAlbum) return;
    setSelectedAlbum(linkedAlbum);
    setSelectedPhotoIndex(null);
  };

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      alert('Odkaz na zápas byl zkopírován.');
    } catch (error) {
      console.error(error);
      alert('Nepodařilo se zkopírovat odkaz.');
    }
  };

  const renderScorerBadges = (items) => {
    if (!items.length) {
      return <div className="text-sm text-gray-500">Střelci nebyli uvedeni.</div>;
    }

    return (
      <div className="flex flex-wrap gap-2">
        {items.map((item, index) => (
          <span
            key={`${item}-${index}`}
            className="rounded-full bg-white px-3 py-1 text-sm font-semibold text-gray-700 shadow-sm"
          >
            ⚽ {item}
          </span>
        ))}
      </div>
    );
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

  if (loading) {
    return (
      <div className="min-h-screen bg-white px-6 py-14 text-gray-900">
        <div className="mx-auto max-w-6xl">
          <div className="rounded-3xl border border-gray-200 bg-white p-10 text-center shadow-sm">
            <div className="text-lg font-semibold text-gray-700">Načítám detail zápasu…</div>
          </div>
        </div>
      </div>
    );
  }

  if (!match) {
    return (
      <div className="min-h-screen bg-white px-6 py-14 text-gray-900">
        <div className="mx-auto max-w-6xl">
          <div className="rounded-3xl border border-gray-200 bg-white p-10 text-center shadow-sm">
            <div className="mb-4 text-2xl font-bold text-gray-900">Zápas nebyl nalezen</div>
            <p className="mb-6 text-gray-600">
              Tento detail zápasu neexistuje nebo byl smazán.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => navigate('/')}
                className="rounded-xl bg-green-600 px-5 py-3 font-semibold text-white transition hover:bg-green-700"
              >
                Zpět na hlavní stránku
              </button>

              <Link
                to="/"
                className="rounded-xl border border-gray-300 px-5 py-3 font-semibold text-gray-700 transition hover:bg-gray-50"
              >
                Otevřít web
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

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
      `}</style>

      <div className="border-b bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link to="/" className="flex items-center gap-3">
            <img src="/logo.png" alt="logo" className="h-10 w-10 rounded-full" />
            <div className="text-lg font-bold text-green-600 md:text-xl">
              ASK Lipůvka – mládež
            </div>
          </Link>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={copyLink}
              className="rounded-xl border border-gray-300 px-4 py-2 font-semibold text-gray-700 transition hover:bg-gray-50"
            >
              Kopírovat odkaz
            </button>

            <button
              type="button"
              onClick={() => navigate('/')}
              className="rounded-xl border border-gray-300 px-4 py-2 font-semibold text-gray-700 transition hover:bg-gray-50"
            >
              ← Zpět na web
            </button>
          </div>
        </div>
      </div>

      <section className="mx-auto max-w-6xl px-6 pt-8">
        <div className="relative overflow-hidden rounded-[2rem] shadow-xl">
          {!isVideoFile(heroImage) ? (
            <img
              src={heroImage}
              alt="Zápas ASK Lipůvka"
              className="h-[300px] w-full object-cover md:h-[380px]"
            />
          ) : (
            <video
              src={heroImage}
              className="h-[300px] w-full object-cover md:h-[380px]"
              muted
              playsInline
              preload="metadata"
            />
          )}

          <div className={`absolute inset-0 bg-gradient-to-br ${categoryStyle.gradient} opacity-75`} />
          <div className="absolute inset-0 bg-black/30" />

          <div className="absolute inset-0 flex flex-col justify-end p-6 md:p-8">
            <div className="mb-4 flex flex-wrap items-center gap-3">
              <span className={`rounded-full px-3 py-1 text-xs font-bold ${categoryStyle.badge}`}>
                {getCategoryShortLabel(match.category)}
              </span>
              <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-bold text-white backdrop-blur">
                {getCategoryLabel(match.category)}
              </span>
              <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-bold text-white backdrop-blur">
                {isPlayed ? 'Odehráno' : 'Zápas před námi'}
              </span>
            </div>

            <h1 className="max-w-4xl text-3xl font-black text-white drop-shadow md:text-5xl">
              {match.home
                ? `ASK Lipůvka vs. ${match.opponent}`
                : `${match.opponent} vs. ASK Lipůvka`}
            </h1>

            <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-white/90 md:text-base">
              <span>{match.date}</span>
              <span>•</span>
              <span>{match.time}</span>
              <span>•</span>
              <span>{match.home ? 'Domácí zápas' : 'Venkovní zápas'}</span>
              <span>•</span>
              <span>{match.home ? 'Lipůvka' : match.venue || 'bude doplněno'}</span>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-8">
        <div className="grid gap-8 xl:grid-cols-[1.15fr_0.85fr]">
          <div className="space-y-8">
            <div className={`rounded-3xl border p-6 shadow-sm ${categoryStyle.light}`}>
              <div className="mb-5 flex flex-wrap items-center justify-between gap-4">
                <h2 className={`text-2xl font-bold ${categoryStyle.text}`}>Výsledek zápasu</h2>

                <div className="flex items-center gap-2">
                  <span
                    className={`rounded-full px-3 py-1 text-sm font-semibold ${
                      match.home ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'
                    }`}
                  >
                    {match.home ? 'Domácí' : 'Venkovní'}
                  </span>
                </div>
              </div>

              {hasMatchResult ? (
                <div className="space-y-5">
                  <div className="grid gap-4 md:grid-cols-2">
                    {firstPlayedResult && (
                      <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-black/5">
                        <div className="mb-2 text-sm font-bold uppercase tracking-wide text-gray-500">
                          {label1}
                        </div>
                        <div className="text-3xl font-black text-gray-900">{firstPlayedResult}</div>
                        <div className="mt-4">{renderScorerBadges(scorers1)}</div>
                      </div>
                    )}

                    {secondPlayedResult && (
                      <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-black/5">
                        <div className="mb-2 text-sm font-bold uppercase tracking-wide text-gray-500">
                          {label2}
                        </div>
                        <div className="text-3xl font-black text-gray-900">{secondPlayedResult}</div>
                        <div className="mt-4">{renderScorerBadges(scorers2)}</div>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="rounded-2xl bg-white p-5 text-gray-600 shadow-sm ring-1 ring-black/5">
                  Tento zápas ještě čeká na odehrání. Výsledek a report doplníme po utkání.
                </div>
              )}
            </div>

            <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
              <h2 className={`mb-5 text-2xl font-bold ${categoryStyle.text}`}>
                {isPlayed ? 'Report ze zápasu' : 'Informace k zápasu'}
              </h2>

              <div className="rounded-2xl bg-gray-50 p-5">
                {match.articleTitle?.trim() && (
                  <div className="mb-3 text-xl font-bold text-gray-900">
                    {match.articleTitle}
                  </div>
                )}

                {match.article?.trim() ? (
                  <p className="leading-8 text-gray-700">{match.article}</p>
                ) : (
                  <div className="text-gray-500">
                    {isPlayed
                      ? 'Komentář zápasu bude doplněn.'
                      : 'Podrobnější informace k zápasu budou doplněny.'}
                  </div>
                )}
              </div>
            </div>

            <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
              <h2 className={`mb-5 text-2xl font-bold ${categoryStyle.text}`}>Fotky k zápasu</h2>

              {cleanMatchPhotos.length > 0 ? (
                <div className="grid gap-4 md:grid-cols-2">
                  {cleanMatchPhotos.map((photo, index) =>
                    isVideoFile(photo) ? (
                      <div
                        key={`${photo}-${index}`}
                        className="overflow-hidden rounded-2xl bg-black shadow-sm"
                      >
                        <video
                          src={photo}
                          controls
                          className="h-64 w-full object-cover"
                          preload="metadata"
                        />
                      </div>
                    ) : (
                      <img
                        key={`${photo}-${index}`}
                        src={photo}
                        alt={`Fotka k zápasu ${index + 1}`}
                        className="h-64 w-full rounded-2xl object-cover shadow-sm transition hover:scale-[1.02]"
                      />
                    )
                  )}
                </div>
              ) : (
                <div className="rounded-2xl bg-gray-50 p-5 text-gray-500">
                  Fotky přímo u zápasu zatím nejsou doplněné.
                </div>
              )}
            </div>
          </div>

          <div className="space-y-8">
            <div className={`overflow-hidden rounded-3xl border shadow-sm ${categoryStyle.light}`}>
              <div className={`bg-gradient-to-r ${categoryStyle.gradient} p-5 text-white`}>
                <div className="text-sm font-semibold uppercase tracking-wide text-white/85">
                  Rychlý přehled
                </div>
                <div className="mt-2 text-2xl font-black">
                  {match.home ? 'ASK Lipůvka' : match.opponent}
                </div>
              </div>

              <div className="space-y-4 p-5">
                <div className="rounded-2xl bg-white p-4 shadow-sm">
                  <div className="text-sm font-semibold text-gray-500">Datum</div>
                  <div className="mt-1 font-bold text-gray-900">{match.date}</div>
                </div>

                <div className="rounded-2xl bg-white p-4 shadow-sm">
                  <div className="text-sm font-semibold text-gray-500">Čas</div>
                  <div className="mt-1 font-bold text-gray-900">{match.time}</div>
                </div>

                <div className="rounded-2xl bg-white p-4 shadow-sm">
                  <div className="text-sm font-semibold text-gray-500">Místo</div>
                  <div className="mt-1 font-bold text-gray-900">
                    {match.home ? 'Lipůvka' : match.venue || 'bude doplněno'}
                  </div>
                </div>
              </div>
            </div>

            {linkedAlbum && (
              <div className="overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm">
                <div className="relative">
                  {!isVideoFile(linkedAlbum.cover || linkedAlbum.photos?.[0]) ? (
                    <img
                      src={linkedAlbum.cover || linkedAlbum.photos?.[0]}
                      alt={linkedAlbum.title}
                      className="h-52 w-full object-cover"
                    />
                  ) : (
                    <video
                      src={linkedAlbum.cover || linkedAlbum.photos?.[0]}
                      className="h-52 w-full object-cover"
                      muted
                      playsInline
                      preload="metadata"
                    />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/65 to-black/10" />
                  <div className="absolute bottom-4 left-4 right-4">
                    <div className="text-sm font-semibold text-white/85">Napojené album</div>
                    <div className="mt-1 text-xl font-black text-white">{linkedAlbum.title}</div>
                    <div className="mt-1 text-sm text-white/85">
                      {linkedAlbum.photos?.length || 0} položek
                    </div>
                  </div>
                </div>

                <div className="p-5">
                  <button
                    type="button"
                    onClick={openAlbum}
                    className={`w-full rounded-xl px-5 py-3 font-semibold transition hover:scale-[1.01] hover:shadow-md ${categoryStyle.button}`}
                  >
                    Otevřít fotoreport ze zápasu
                  </button>
                </div>
              </div>
            )}

            <div className="rounded-3xl border border-gray-200 bg-white p-5 shadow-sm">
              <div className="mb-4 text-lg font-bold text-gray-900">Další navigace</div>

              <div className="space-y-3">
                {previousAndNext.prev ? (
                  <button
                    type="button"
                    onClick={() => navigate(`/zapas/${previousAndNext.prev.id}`)}
                    className="w-full rounded-2xl border border-gray-200 bg-gray-50 p-4 text-left transition hover:bg-gray-100"
                  >
                    <div className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Předchozí zápas
                    </div>
                    <div className="mt-1 font-bold text-gray-900">
                      {previousAndNext.prev.home
                        ? `ASK Lipůvka vs. ${previousAndNext.prev.opponent}`
                        : `${previousAndNext.prev.opponent} vs. ASK Lipůvka`}
                    </div>
                    <div className="mt-1 text-sm text-gray-600">{previousAndNext.prev.date}</div>
                  </button>
                ) : (
                  <div className="rounded-2xl bg-gray-50 p-4 text-sm text-gray-500">
                    Předchozí zápas v této kategorii není k dispozici.
                  </div>
                )}

                {previousAndNext.next ? (
                  <button
                    type="button"
                    onClick={() => navigate(`/zapas/${previousAndNext.next.id}`)}
                    className="w-full rounded-2xl border border-gray-200 bg-gray-50 p-4 text-left transition hover:bg-gray-100"
                  >
                    <div className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Další zápas
                    </div>
                    <div className="mt-1 font-bold text-gray-900">
                      {previousAndNext.next.home
                        ? `ASK Lipůvka vs. ${previousAndNext.next.opponent}`
                        : `${previousAndNext.next.opponent} vs. ASK Lipůvka`}
                    </div>
                    <div className="mt-1 text-sm text-gray-600">{previousAndNext.next.date}</div>
                  </button>
                ) : (
                  <div className="rounded-2xl bg-gray-50 p-4 text-sm text-gray-500">
                    Další zápas v této kategorii není k dispozici.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {selectedAlbum && selectedPhotoIndex === null && (
        <div
          className="fixed inset-0 z-50 overflow-y-auto bg-black/50 px-4 py-6 animate-[fadeIn_0.2s_ease-out]"
          onClick={() => setSelectedAlbum(null)}
        >
          <div className="flex min-h-full items-start justify-center">
            <div
              className="relative my-4 w-full max-w-6xl rounded-2xl bg-white p-6 shadow-2xl animate-[scaleIn_0.2s_ease-out]"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="mb-4 flex items-center justify-between gap-4 pr-10">
                <button
                  type="button"
                  onClick={() => setSelectedAlbum(null)}
                  className="rounded-xl border border-gray-300 px-4 py-2 font-semibold text-gray-700 hover:bg-gray-100"
                >
                  ← Zpět na detail
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedAlbum(null)}
                  className="text-2xl text-gray-500 hover:text-black"
                >
                  ×
                </button>
              </div>

              <h2 className="mb-2 text-3xl font-bold text-green-600">{selectedAlbum.title}</h2>
              <div className="mb-6 text-sm text-gray-500">
                {selectedAlbum.photos?.length || 0} položek
              </div>

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
          className="fixed inset-0 z-[60] bg-black/90 px-4 py-6 animate-[fadeIn_0.2s_ease-out]"
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
    </div>
  );
}