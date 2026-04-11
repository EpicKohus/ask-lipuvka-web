import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { collection, getDocs } from 'firebase/firestore';
import { db } from './firebase';

export default function MatchDetail() {
  const { matchId } = useParams();
  const navigate = useNavigate();

  const [match, setMatch] = useState(null);
  const [galleryAlbums, setGalleryAlbums] = useState([]);
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

  const isVideoFile = (filePath) => /\.(mp4|webm|ogg)$/i.test(filePath || '');

  const formatScorersArray = (scorers) =>
    scorers
      ? scorers
          .split('\n')
          .map((item) => item.trim())
          .filter(Boolean)
      : [];

  const getCategoryShortLabel = (id) =>
    categories.find((c) => c.id === id)?.shortLabel || '';

  const getCategoryLabel = (id) =>
    categories.find((c) => c.id === id)?.label || '';

  const getCategoryStyle = (id) => {
    switch (id) {
      case 'mladsi-pripravka':
        return {
          badge: 'bg-green-600 text-white',
          text: 'text-green-600',
          button: 'bg-green-600 text-white hover:bg-green-700',
          soft: 'bg-green-50 border-green-200',
        };
      case 'starsi-pripravka':
        return {
          badge: 'bg-orange-500 text-white',
          text: 'text-orange-600',
          button: 'bg-orange-500 text-white hover:bg-orange-600',
          soft: 'bg-orange-50 border-orange-200',
        };
      default:
        return {
          badge: 'bg-blue-600 text-white',
          text: 'text-blue-600',
          button: 'bg-blue-600 text-white hover:bg-blue-700',
          soft: 'bg-blue-50 border-blue-200',
        };
    }
  };

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);

        const matchesSnapshot = await getDocs(collection(db, 'matches'));
        const gallerySnapshot = await getDocs(collection(db, 'gallery'));

        const loadedMatches = matchesSnapshot.docs.map((item) => ({
          id: item.id,
          ...item.data(),
        }));

        const loadedGallery = gallerySnapshot.docs.map((item) => ({
          id: item.id,
          ...item.data(),
        }));

        setMatch(loadedMatches.find((m) => m.id === matchId) || null);
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

  const linkedAlbum = useMemo(() => {
    if (!match?.galleryAlbumId) return null;
    return galleryAlbums.find((album) => album.id === match.galleryAlbumId) || null;
  }, [galleryAlbums, match]);

  const categoryStyle = getCategoryStyle(match?.category);

  const cleanPhotos = match?.photos?.filter((photo) => photo !== '/field.png') || [];
  const heroImage = linkedAlbum?.photos?.[0] || cleanPhotos[0] || '/field.png';

  const scorers1 = formatScorersArray(match?.scorers1);
  const scorers2 = formatScorersArray(match?.scorers2);

  const today = new Date();
  const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const isPlayed = match ? parseMatchDate(match.date) < todayStart : false;

  const selectedPhoto =
    selectedAlbum && selectedPhotoIndex !== null
      ? selectedAlbum.photos?.[selectedPhotoIndex]
      : null;

  const hasInlinePhotos = cleanPhotos.length > 0;
  const hasAlbum = Boolean(linkedAlbum);

  const openAlbum = () => {
    if (!linkedAlbum) return;
    setSelectedAlbum(linkedAlbum);
    setSelectedPhotoIndex(null);
  };

  const openInlinePhotoGallery = (index) => {
    if (!cleanPhotos.length) return;

    setSelectedAlbum({
      id: 'inline-match-photos',
      title: match.home
        ? `ASK Lipůvka vs. ${match.opponent}`
        : `${match.opponent} vs. ASK Lipůvka`,
      photos: cleanPhotos,
    });
    setSelectedPhotoIndex(index);
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

  const renderScorers = (scorers) => {
    if (!scorers.length) {
      return <span className="text-gray-500">Střelci nebyli uvedeni.</span>;
    }

    return (
      <div className="flex flex-wrap items-center gap-2">
        <span className="font-semibold text-gray-700">⚽ Střelci:</span>
        {scorers.map((player, index) => (
          <span
            key={`${player}-${index}`}
            className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-800"
          >
            {player}
          </span>
        ))}
      </div>
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

            <button
              type="button"
              onClick={() => navigate('/')}
              className="rounded-2xl bg-green-600 px-6 py-3 font-bold text-white transition hover:bg-green-700"
            >
              Zpět na hlavní stránku
            </button>
          </div>
        </div>
      </div>
    );
  }

  const score1 = match.result1?.trim();
  const score2 = match.result2?.trim();
  const hasResults = Boolean(score1 || score2);

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

      <div className="border-b bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-6 py-4 md:flex-row md:items-center md:justify-between">
          <Link to="/" className="flex items-center gap-4">
            <img src="/logo.png" alt="ASK Lipůvka" className="h-14 w-14 rounded-full" />
            <div>
              <div className="text-2xl font-black text-green-600 md:text-3xl">
                ASK Lipůvka
              </div>
              <div className="text-sm text-gray-500">Mládežnický fotbal</div>
            </div>
          </Link>

          <button
            type="button"
            onClick={() => navigate('/')}
            className="inline-flex items-center justify-center rounded-2xl bg-green-600 px-6 py-3 text-base font-bold text-white transition hover:bg-green-700"
          >
            ← Zpět na hlavní stránku
          </button>
        </div>
      </div>

      <section className="mx-auto max-w-6xl px-6 pt-6">
        <div className="relative overflow-hidden rounded-3xl shadow-xl">
          {!isVideoFile(heroImage) ? (
            <img
              src={heroImage}
              alt="Zápas ASK Lipůvka"
              className="h-[320px] w-full object-cover md:h-[380px]"
            />
          ) : (
            <video
              src={heroImage}
              className="h-[320px] w-full object-cover md:h-[380px]"
              muted
              playsInline
              preload="metadata"
            />
          )}

          <div className="absolute inset-0 bg-black/45" />

          <div className="absolute inset-0 flex flex-col justify-end p-6 md:p-8">
            <div className="mb-4 flex flex-wrap gap-2">
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

            <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-white/90 md:text-base">
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

      <section className="mx-auto max-w-6xl space-y-10 px-6 py-10">
        <div className={`rounded-3xl border p-6 shadow-sm ${categoryStyle.soft}`}>
          <h2 className={`mb-5 text-2xl font-bold ${categoryStyle.text}`}>Výsledek</h2>

          {hasResults ? (
            <div className="space-y-5">
              {score1 && (
                <div className="rounded-2xl bg-white p-5 shadow-sm">
                  <div className="mb-2 text-sm font-bold uppercase tracking-wide text-gray-500">
                    {match.matchLabel1?.trim() || '1. blok'}
                  </div>

                  <div className="text-4xl font-black leading-tight text-gray-900 md:text-5xl">
                    {score1}
                  </div>

                  <div className="mt-4 text-sm text-gray-700">{renderScorers(scorers1)}</div>
                </div>
              )}

              {score2 && (
                <div className="rounded-2xl bg-white p-5 shadow-sm">
                  <div className="mb-2 text-sm font-bold uppercase tracking-wide text-gray-500">
                    {match.matchLabel2?.trim() || '2. blok'}
                  </div>

                  <div className="text-4xl font-black leading-tight text-gray-900 md:text-5xl">
                    {score2}
                  </div>

                  <div className="mt-4 text-sm text-gray-700">{renderScorers(scorers2)}</div>
                </div>
              )}
            </div>
          ) : (
            <div className="rounded-2xl bg-white p-5 text-gray-600 shadow-sm">
              Tento zápas ještě nebyl odehrán. Výsledek doplníme po utkání.
            </div>
          )}
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className={`mb-5 text-2xl font-bold ${categoryStyle.text}`}>
              {isPlayed ? 'Report' : 'Info k zápasu'}
            </h2>

            <div className="rounded-2xl bg-gray-50 p-5">
              {match.articleTitle?.trim() && (
                <div className="mb-3 text-xl font-bold text-gray-900">
                  {match.articleTitle}
                </div>
              )}

              <p className="leading-7 text-gray-700">
                {match.article ||
                  (isPlayed
                    ? 'Komentář zápasu bude doplněn.'
                    : 'Podrobnější informace k zápasu budou doplněny.')}
              </p>
            </div>
          </div>

          {!hasAlbum && (
            <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
              <h2 className={`mb-5 text-2xl font-bold ${categoryStyle.text}`}>Fotky</h2>

              {hasInlinePhotos ? (
                <>
                  <div className="grid grid-cols-2 gap-3">
                    {cleanPhotos.slice(0, 2).map((photo, index) =>
                      isVideoFile(photo) ? (
                        <button
                          type="button"
                          key={`${photo}-${index}`}
                          onClick={() => openInlinePhotoGallery(index)}
                          className="relative overflow-hidden rounded-2xl bg-black"
                        >
                          <video
                            src={photo}
                            className="h-44 w-full object-cover"
                            muted
                            playsInline
                            preload="metadata"
                          />
                          <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                            <div className="rounded-full bg-white/90 px-3 py-1 text-xs font-bold text-gray-900">
                              ▶ Přehrát
                            </div>
                          </div>
                        </button>
                      ) : (
                        <button
                          type="button"
                          key={`${photo}-${index}`}
                          onClick={() => openInlinePhotoGallery(index)}
                          className="overflow-hidden rounded-2xl"
                        >
                          <img
                            src={photo}
                            alt={`Fotka ze zápasu ${index + 1}`}
                            className="h-44 w-full object-cover transition hover:scale-105"
                          />
                        </button>
                      )
                    )}
                  </div>

                  {cleanPhotos.length > 2 && (
                    <button
                      type="button"
                      onClick={() => openInlinePhotoGallery(0)}
                      className={`mt-4 w-full rounded-2xl px-5 py-3 font-bold transition ${categoryStyle.button}`}
                    >
                      Zobrazit všechny fotky
                    </button>
                  )}
                </>
              ) : (
                <div className="rounded-2xl bg-gray-50 p-5 text-gray-600">
                  Fotky ze zápasu zatím nejsou doplněné.
                </div>
              )}
            </div>
          )}
        </div>

        {hasAlbum && (
          <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className={`mb-5 text-2xl font-bold ${categoryStyle.text}`}>Napojené album</h2>

            <div className="overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm">
              <div className="relative">
                {!isVideoFile(linkedAlbum.cover || linkedAlbum.photos?.[0]) ? (
                  <img
                    src={linkedAlbum.cover || linkedAlbum.photos?.[0] || '/field.png'}
                    alt={linkedAlbum.title}
                    className="h-[280px] w-full object-cover"
                  />
                ) : (
                  <video
                    src={linkedAlbum.cover || linkedAlbum.photos?.[0]}
                    className="h-[280px] w-full object-cover"
                    muted
                    playsInline
                    preload="metadata"
                  />
                )}

                <div className="absolute inset-0 bg-black/30" />

                <div className="absolute bottom-0 left-0 p-5 text-white">
                  <div className="text-sm font-semibold text-white/90">Napojené album</div>
                  <div className="text-2xl font-black">{linkedAlbum.title}</div>
                  <div className="mt-1 text-sm text-white/90">
                    {linkedAlbum.photos?.length || 0} položek
                  </div>
                </div>
              </div>

              <div className="p-5">
                <button
                  type="button"
                  onClick={openAlbum}
                  className={`w-full rounded-2xl px-5 py-3 font-bold transition ${categoryStyle.button}`}
                >
                  Fotky ze zápasu
                </button>
              </div>
            </div>
          </div>
        )}
      </section>

      {selectedAlbum && selectedPhotoIndex === null && (
        <div
          className="fixed inset-0 z-50 overflow-y-auto bg-black/50 px-4 py-6"
          style={{ animation: 'fadeIn 0.2s ease-out' }}
          onClick={() => setSelectedAlbum(null)}
        >
          <div className="flex min-h-full items-start justify-center">
            <div
              className="relative my-4 w-full max-w-6xl rounded-2xl bg-white p-6 shadow-2xl"
              style={{ animation: 'scaleIn 0.2s ease-out' }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="mb-4 flex items-center justify-between gap-4 pr-10">
                <button
                  type="button"
                  onClick={() => setSelectedAlbum(null)}
                  className="rounded-xl border border-gray-300 px-4 py-2 font-semibold text-gray-700 hover:bg-gray-100"
                >
                  ← Zpět
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedAlbum(null)}
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
          className="fixed inset-0 z-[60] bg-black/90 px-4 py-6"
          style={{ animation: 'fadeIn 0.2s ease-out' }}
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
                  className="max-h-[85vh] max-w-full rounded-2xl"
                />
              ) : (
                <img
                  src={selectedPhoto}
                  alt="Zvětšená fotka"
                  className="max-h-[85vh] max-w-full rounded-2xl object-contain"
                />
              )}

              <button
                type="button"
                onClick={goToNextPhoto}
                className="absolute right-[-10px] top-1/2 z-10 hidden -translate-y-1/2 rounded-full bg-white/20 px-4 py-3 text-2xl text-white backdrop-blur md:block"
              >
                ›
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}