import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { db } from './firebase'
import { collection, getDocs } from 'firebase/firestore'

export default function MatchDetail() {
  const { matchId } = useParams()
  const navigate = useNavigate()

  const [match, setMatch] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadMatch = async () => {
      try {
        const snapshot = await getDocs(collection(db, 'matches'))
        const matches = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }))

        const found = matches.find(m => m.id === matchId)
        setMatch(found || null)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    loadMatch()
  }, [matchId])

  if (loading) {
    return (
      <div className="p-10 text-center">Načítám zápas...</div>
    )
  }

  if (!match) {
    return (
      <div className="p-10 text-center">
        Zápas nebyl nalezen
        <div className="mt-4">
          <button
            onClick={() => navigate('/')}
            className="bg-green-600 text-white px-4 py-2 rounded-xl"
          >
            Zpět na web
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white text-gray-900 px-6 py-10 max-w-4xl mx-auto">

      <button
        onClick={() => navigate('/')}
        className="mb-6 rounded-xl border px-4 py-2"
      >
        ← Zpět
      </button>

      <h1 className="text-3xl font-bold mb-2">
        {match.home
          ? `ASK Lipůvka vs. ${match.opponent}`
          : `${match.opponent} vs. ASK Lipůvka`}
      </h1>

      <div className="text-gray-500 mb-6">
        {match.date} • {match.time}
      </div>

      {(match.result1 || match.result2) && (
        <div className="mb-6 space-y-3">
          {match.result1 && (
            <div className="bg-gray-100 p-4 rounded-xl">
              <b>{match.matchLabel1 || '1. blok'}:</b> {match.result1}
            </div>
          )}
          {match.result2 && (
            <div className="bg-gray-100 p-4 rounded-xl">
              <b>{match.matchLabel2 || '2. blok'}:</b> {match.result2}
            </div>
          )}
        </div>
      )}

      <div className="mb-6">
        <h2 className="text-xl font-bold mb-2">Report</h2>
        <div className="bg-gray-50 p-4 rounded-xl">
          {match.article || 'Bude doplněno'}
        </div>
      </div>

      <div>
        <h2 className="text-xl font-bold mb-3">Fotky</h2>

        {match.photos?.length > 0 ? (
          <div className="grid grid-cols-2 gap-4">
            {match.photos.map((photo, i) => (
              <img
                key={i}
                src={photo}
                className="rounded-xl object-cover h-40 w-full"
              />
            ))}
          </div>
        ) : (
          <div className="text-gray-500">Zatím bez fotek</div>
        )}
      </div>
    </div>
  )
}