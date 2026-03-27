import { useState } from 'react';

export default function AskLipuvkaWeb() {
  const [selectedCategory, setSelectedCategory] = useState('U7');

  const Contact = () => (
    <div className="bg-white/80 rounded-xl p-4 mt-6 shadow">
      <h3 className="text-lg font-semibold text-green-700">
        Vedoucí mládeže
      </h3>
      <p className="text-gray-800 font-medium">Radek Mánek</p>
      <p className="text-gray-600">
        📞 <a href="tel:+420606148368" className="underline">606 148 368</a>
      </p>
      <p className="text-gray-600">
        ✉️ <a href="mailto:radek.manek@email.cz" className="underline">radek.manek@email.cz</a>
      </p>
    </div>
  );

  return (
    <div className="min-h-screen bg-green-50 text-gray-800">
      
      {/* HEADER */}
      <div className="bg-white shadow p-4 flex items-center justify-between">
        <h1 className="text-xl font-bold text-green-700">ASK Lipůvka</h1>
      </div>

      {/* CATEGORY SWITCH */}
      <div className="p-4 flex flex-col gap-3">
        <button
          onClick={() => setSelectedCategory('U7')}
          className={`p-3 rounded-xl ${selectedCategory === 'U7' ? 'bg-green-600 text-white' : 'bg-white'}`}
        >
          Předpřípravka U7
        </button>

        <button
          onClick={() => setSelectedCategory('U9')}
          className={`p-3 rounded-xl ${selectedCategory === 'U9' ? 'bg-green-600 text-white' : 'bg-white'}`}
        >
          Mladší přípravka U9
        </button>

        <button
          onClick={() => setSelectedCategory('U11')}
          className={`p-3 rounded-xl ${selectedCategory === 'U11' ? 'bg-green-600 text-white' : 'bg-white'}`}
        >
          Starší přípravka U11
        </button>
      </div>

      {/* CONTENT */}
      <div className="p-4">

        {/* U7 */}
        {selectedCategory === 'U7' && (
          <div className="bg-white rounded-xl p-4 shadow">
            <h2 className="text-2xl font-bold text-green-700 mb-4">
              Novinky
            </h2>

            <div className="bg-gray-100 rounded-xl p-4">
              <p className="text-green-600 text-sm">1. 4. 2026</p>
              <h3 className="font-semibold text-lg mt-1">
                Předpřípravka je připravena na další ročník
              </h3>
              <p className="text-gray-600 mt-2">
                Kategorie je na webu nachystaná. Jakmile bude známý program a další informace,
                doplníme novinky i zápasy.
              </p>
            </div>

            <Contact />
          </div>
        )}

        {/* U9 */}
        {selectedCategory === 'U9' && (
          <div className="bg-white rounded-xl p-4 shadow">
            <h2 className="text-2xl font-bold text-green-700 mb-4">
              Novinky
            </h2>

            <div className="bg-gray-100 rounded-xl p-4">
              <p className="text-green-600 text-sm">1. 4. 2026</p>
              <h3 className="font-semibold text-lg mt-1">
                Mladší přípravka startuje sezónu
              </h3>
              <p className="text-gray-600 mt-2">
                Tréninky probíhají pravidelně. Sledujte web pro aktuální informace.
              </p>
            </div>

            <Contact />
          </div>
        )}

        {/* U11 */}
        {selectedCategory === 'U11' && (
          <div className="bg-white rounded-xl p-4 shadow">
            <h2 className="text-2xl font-bold text-green-700 mb-4">
              Novinky
            </h2>

            <div className="bg-gray-100 rounded-xl p-4">
              <p className="text-green-600 text-sm">1. 4. 2026</p>
              <h3 className="font-semibold text-lg mt-1">
                Starší přípravka připravena
              </h3>
              <p className="text-gray-600 mt-2">
                Sezóna se blíží. Brzy doplníme zápasy a další informace.
              </p>
            </div>

            <Contact />
          </div>
        )}

      </div>
    </div>
  );
}