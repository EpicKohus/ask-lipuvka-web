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
    const [day, month, year] = dateString.split('.').map((x) => x.trim());
    return new Date(Number(year), Number(month) - 1, Number(day));
  };

  const isVideoFile = (filePath) =>
    /\.(mp4|webm|ogg)$/i.test(filePath || '');

  const formatScorersArray = (scorers) =>
    scorers
      ? scorers.split('\n').map((s) => s.trim()).filter(Boolean)
      : [];

  const getCategoryShortLabel = (id) =>
    categories.find((c) => c.id === id)?.shortLabel || '';

  const getCategoryLabel = (id) =>
    categories.find((c) => c.id === id)?.label || '';

  const getCategoryStyle = (id) => {
    switch (id) {
      case 'mladsi-pripravka':
        return { badge: 'bg-green-600 text-white', text: 'text-green-600', button: 'bg-green-600 text-white hover:bg-green-700' };
      case 'starsi-pripravka':
        return { badge: 'bg-orange-500 text-white', text: 'text-orange-600', button: 'bg-orange-500 text-white hover:bg-orange-600' };
      default:
        return { badge: 'bg-blue-600 text-white', text: 'text-blue-600', button: 'bg-blue-600 text-white hover:bg-blue-700' };
    }
  };

  useEffect(() => {
    const load = async () => {
      setLoading(true);

      const matchesSnap = await getDocs(collection(db, 'matches'));
      const gallerySnap = await getDocs(collection(db, 'gallery'));

      const matches = matchesSnap.docs.map((d) => ({ id: d.id, ...d.data() }));
      const gallery = gallerySnap.docs.map((d) => ({ id: d.id, ...d.data() }));

      setMatch(matches.find((m) => m.id === matchId));
      setGalleryAlbums(gallery);

      setLoading(false);
    };

    load();
  }, [matchId]);

  const linkedAlbum = useMemo(() => {
    if (!match?.galleryAlbumId) return null;
    return galleryAlbums.find((a) => a.id === match.galleryAlbumId);
  }, [match, galleryAlbums]);

  const categoryStyle = getCategoryStyle(match?.category);

  const cleanPhotos =
    match?.photos?.filter((p) => p !== '/field.png') || [];

  const heroImage =
    linkedAlbum?.photos?.[0] || cleanPhotos[0] || '/field.png';

  const scorers1 = formatScorersArray(match?.scorers1);
  const scorers2 = formatScorersArray(match?.scorers2);

  const isPlayed =
    match && parseMatchDate(match.date) < new Date();

  const openAlbum = () => {
    setSelectedAlbum(linkedAlbum);
    setSelectedPhotoIndex(null);
  };

  if (loading) return <div className="p-10">Načítám...</div>;
  if (!match) return <div className="p-10">Zápas nenalezen</div>;

  return (
    <div className="min-h-screen bg-white text-gray-900">

      {/* HEADER */}
      <div className="border-b bg-white px-6 py-4 flex justify-between">
        <Link to="/" className="font-bold text-green-600">
          ASK Lipůvka
        </Link>

        <button onClick={() => navigate('/')}>
          ← Zpět
        </button>
      </div>

      {/* HERO */}
      <section className="max-w-6xl mx-auto px-6 pt-6">
        <div className="relative rounded-3xl overflow-hidden">
          <img src={heroImage} className="w-full h-[320px] object-cover" />

          <div className="absolute inset-0 bg-black/45" />

          <div className="absolute bottom-0 p-6 text-white">
            <div className="flex gap-2 mb-3">
              <span className={`px-3 py-1 rounded-full text-xs font-bold ${categoryStyle.badge}`}>
                {getCategoryShortLabel(match.category)}
              </span>
            </div>

            <h1 className="text-3xl font-black">
              {match.home
                ? `ASK Lipůvka vs. ${match.opponent}`
                : `${match.opponent} vs. ASK Lipůvka`}
            </h1>

            <div className="mt-2 text-sm">
              {match.date} • {match.time}
            </div>
          </div>
        </div>
      </section>

      {/* CONTENT */}
      <section className="max-w-6xl mx-auto px-6 py-8 grid md:grid-cols-2 gap-8">

        {/* RESULT */}
        <div className="bg-gray-50 p-6 rounded-2xl">
          <h2 className={`font-bold mb-4 ${categoryStyle.text}`}>
            Výsledek
          </h2>

          {match.result1 && (
            <div className="mb-4">
              <div className="font-bold text-xl">{match.result1}</div>
              <div className="text-sm mt-1">
                {scorers1.join(', ')}
              </div>
            </div>
          )}

          {match.result2 && (
            <div>
              <div className="font-bold text-xl">{match.result2}</div>
              <div className="text-sm mt-1">
                {scorers2.join(', ')}
              </div>
            </div>
          )}

          {!match.result1 && (
            <div className="text-gray-500">
              Zápas ještě nebyl odehrán
            </div>
          )}
        </div>

        {/* REPORT */}
        <div className="bg-gray-50 p-6 rounded-2xl">
          <h2 className={`font-bold mb-4 ${categoryStyle.text}`}>
            {isPlayed ? 'Report' : 'Info'}
          </h2>

          <p className="text-sm">
            {match.article || 'Bude doplněno'}
          </p>
        </div>

        {/* PHOTOS */}
        <div className="md:col-span-2">
          <h2 className={`font-bold mb-4 ${categoryStyle.text}`}>
            Fotky
          </h2>

          {cleanPhotos.length ? (
            <div className="grid grid-cols-2 gap-4">
              {cleanPhotos.map((p, i) => (
                <img key={i} src={p} className="rounded-xl" />
              ))}
            </div>
          ) : (
            <div className="text-gray-500">Zatím žádné fotky</div>
          )}
        </div>

        {/* ALBUM */}
        {linkedAlbum && (
          <div className="md:col-span-2">
            <button
              onClick={openAlbum}
              className={`px-6 py-3 rounded-xl ${categoryStyle.button}`}
            >
              Fotky ze zápasu ({linkedAlbum.photos.length})
            </button>
          </div>
        )}
      </section>
    </div>
  );
}