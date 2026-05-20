import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from './firebase';

export default function Merch() {
  const [theme, setTheme] = useState(() => {
    if (typeof window === 'undefined') return 'light';
    return localStorage.getItem('ask-lipuvka-theme') || 'light';
  });

  const merchProducts = useMemo(
    () => [
      {
        id: 'tricko',
        name: 'Tričko ASK Lipůvka mládež',
        price: 350,
        image: '/logo.png',
        description: 'Klubové tričko pro děti, rodiče i fanoušky.',
        sizes: ['116', '128', '140', '152', '164', 'S', 'M', 'L', 'XL'],
        colors: ['Zelená', 'Bílá', 'Černá'],
      },
      {
        id: 'mikina',
        name: 'Mikina ASK Lipůvka mládež',
        price: 750,
        image: '/logo.png',
        description: 'Pohodlná mikina na tréninky, zápasy i běžné nošení.',
        sizes: ['116', '128', '140', '152', '164', 'S', 'M', 'L', 'XL'],
        colors: ['Zelená', 'Černá', 'Šedá'],
      },
      {
        id: 'cepice',
        name: 'Kšiltovka ASK Lipůvka',
        price: 250,
        image: '/logo.png',
        description: 'Jednoduchá klubová kšiltovka s logem.',
        sizes: ['Dětská', 'Dospělá'],
        colors: ['Zelená', 'Černá'],
      },
      {
        id: 'vak',
        name: 'Vak na záda ASK Lipůvka',
        price: 220,
        image: '/logo.png',
        description: 'Lehký vak na kopačky, pití a tréninkové věci.',
        sizes: ['Univerzální'],
        colors: ['Zelená', 'Černá'],
      },
    ],
    []
  );

  useEffect(() => {
    document.documentElement.classList.toggle('theme-dark', theme === 'dark');
    document.documentElement.style.colorScheme = theme;
    localStorage.setItem('ask-lipuvka-theme', theme);

    return () => {
      document.documentElement.style.colorScheme = '';
    };
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  const handleSubmitMerch = async (e) => {
    e.preventDefault();

    const formData = new FormData(e.target);
    const customer = {
      parentName: String(formData.get('parentName') || '').trim(),
      childName: String(formData.get('childName') || '').trim(),
      phone: String(formData.get('phone') || '').trim(),
      email: String(formData.get('email') || '').trim(),
      note: String(formData.get('note') || '').trim(),
    };

    const items = merchProducts
      .map((product) => {
        const quantity = Number(formData.get(`${product.id}_quantity`) || 0);
        if (!Number.isInteger(quantity) || quantity < 1) return null;

        const customName = String(formData.get(`${product.id}_customName`) || '').trim();
        const customNumber = String(formData.get(`${product.id}_customNumber`) || '').trim();
        const personalizationPrice = customName || customNumber ? 50 : 0;

        return {
          productId: product.id,
          name: product.name,
          price: product.price,
          quantity,
          size: String(formData.get(`${product.id}_size`) || product.sizes[0]),
          color: String(formData.get(`${product.id}_color`) || product.colors[0]),
          customName,
          customNumber,
          personalizationPrice,
          lineTotal: (product.price + personalizationPrice) * quantity,
        };
      })
      .filter(Boolean);

    if (!customer.parentName || !customer.phone) {
      alert('Vyplň prosím jméno rodiče a telefon.');
      return;
    }

    if (!items.length) {
      alert('Vyber prosím alespoň jeden produkt a nastav počet kusů.');
      return;
    }

    const total = items.reduce((sum, item) => sum + item.lineTotal, 0);
    const orderPayload = {
      customer,
      items,
      total,
      status: 'nová',
      createdAt: serverTimestamp(),
    };

    try {
      await addDoc(collection(db, 'merchOrders'), orderPayload);

      try {
        await fetch('/api/send', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            typ: 'merch',
            customer,
            items,
            total,
            note: customer.note,
          }),
        });
      } catch (mailError) {
        console.warn('Objednávka je uložená ve Firebase, email se nepodařilo odeslat:', mailError);
      }

      alert('Objednávka merche byla odeslána. Ozveme se vám kvůli potvrzení.');
      e.target.reset();
    } catch (err) {
      alert('Chyba při odesílání objednávky. Zkuste to prosím znovu.');
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-white text-gray-900">
      <header className="sticky top-0 z-40 border-b border-green-100 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link to="/" className="flex items-center gap-3">
            <img src="/logo.png" alt="ASK Lipůvka" className="h-12 w-12 object-contain" />
            <div>
              <div className="text-lg font-black text-green-700">ASK Lipůvka mládež</div>
              <div className="text-xs font-semibold uppercase tracking-[0.18em] text-gray-500">Klubový merch</div>
            </div>
          </Link>

          <div className="flex items-center gap-3">
            <button type="button" onClick={toggleTheme} className="theme-toggle-button">
              {theme === 'dark' ? '☀️ Světlý režim' : '🌙 Tmavý režim'}
            </button>
            <Link to="/" className="rounded-xl border border-green-200 bg-white px-4 py-3 font-bold text-green-700 transition hover:bg-green-50">
              Zpět na web
            </Link>
          </div>
        </div>
      </header>

      <main className="px-6 py-12">
        <div className="mx-auto max-w-6xl">
          <div className="mb-8 text-center">
            <div className="mb-3 inline-flex rounded-full bg-green-100 px-4 py-2 text-xs font-black uppercase tracking-[0.18em] text-green-700">
              Klubový merch
            </div>
            <h1 className="text-3xl font-black text-green-700 md:text-5xl">
              Objednávka merche ASK Lipůvka
            </h1>
            <p className="mx-auto mt-3 max-w-2xl text-gray-600">
              Vyberte produkt, velikost, barvu a počet kusů. Objednávka je bez online platby — po odeslání se ozveme s potvrzením.
            </p>
          </div>

          <form onSubmit={handleSubmitMerch} className="space-y-6">
            <div className="grid gap-5 md:grid-cols-2">
              {merchProducts.map((product) => (
                <div key={product.id} className="rounded-3xl border border-green-100 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
                  <div className="flex gap-4">
                    <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-green-50 p-3">
                      <img src={product.image} alt={product.name} className="h-full w-full object-contain" />
                    </div>
                    <div className="flex-1">
                      <h2 className="text-lg font-black text-gray-900">{product.name}</h2>
                      <p className="mt-1 text-sm text-gray-600">{product.description}</p>
                      <div className="mt-2 text-xl font-black text-green-700">
                        {product.price.toLocaleString('cs-CZ')} Kč
                      </div>
                    </div>
                  </div>

                  <div className="mt-5 grid gap-3 sm:grid-cols-3">
                    <label className="block">
                      <span className="mb-1 block text-xs font-bold uppercase tracking-wide text-gray-500">Počet</span>
                      <input type="number" min="0" name={`${product.id}_quantity`} defaultValue="0" className="w-full rounded-xl border border-gray-300 bg-white px-3 py-3 text-gray-900 outline-none focus:border-green-500 focus:ring-2 focus:ring-green-200" />
                    </label>

                    <label className="block">
                      <span className="mb-1 block text-xs font-bold uppercase tracking-wide text-gray-500">Velikost</span>
                      <select name={`${product.id}_size`} className="w-full rounded-xl border border-gray-300 bg-white px-3 py-3 text-gray-900 outline-none focus:border-green-500 focus:ring-2 focus:ring-green-200">
                        {product.sizes.map((size) => (
                          <option key={size} value={size}>{size}</option>
                        ))}
                      </select>
                    </label>

                    <label className="block">
                      <span className="mb-1 block text-xs font-bold uppercase tracking-wide text-gray-500">Barva</span>
                      <select name={`${product.id}_color`} className="w-full rounded-xl border border-gray-300 bg-white px-3 py-3 text-gray-900 outline-none focus:border-green-500 focus:ring-2 focus:ring-green-200">
                        {product.colors.map((color) => (
                          <option key={color} value={color}>{color}</option>
                        ))}
                      </select>
                    </label>
                  </div>

                  <div className="mt-3 grid gap-3 sm:grid-cols-2">
                    <label className="block">
                      <span className="mb-1 block text-xs font-bold uppercase tracking-wide text-gray-500">Jméno na záda</span>
                      <input type="text" name={`${product.id}_customName`} placeholder="např. NOVÁK" className="w-full rounded-xl border border-gray-300 bg-white px-3 py-3 text-gray-900 outline-none focus:border-green-500 focus:ring-2 focus:ring-green-200" />
                    </label>

                    <label className="block">
                      <span className="mb-1 block text-xs font-bold uppercase tracking-wide text-gray-500">Číslo</span>
                      <input type="text" name={`${product.id}_customNumber`} placeholder="např. 9" className="w-full rounded-xl border border-gray-300 bg-white px-3 py-3 text-gray-900 outline-none focus:border-green-500 focus:ring-2 focus:ring-green-200" />
                    </label>
                  </div>

                  <div className="mt-3 rounded-2xl bg-green-50 px-4 py-3 text-sm text-gray-700">
                    Jméno nebo číslo na záda: +50 Kč k ceně za kus.
                  </div>
                </div>
              ))}
            </div>

            <div className="rounded-3xl border border-green-100 bg-green-50/60 p-5 shadow-sm md:p-6">
              <h2 className="mb-4 text-2xl font-black text-green-700">Kontaktní údaje</h2>
              <div className="grid gap-4 md:grid-cols-2">
                <label className="block">
                  <span className="mb-2 block text-sm font-bold text-gray-700">Jméno rodiče *</span>
                  <input name="parentName" required className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-gray-900 outline-none focus:border-green-500 focus:ring-2 focus:ring-green-200" />
                </label>
                <label className="block">
                  <span className="mb-2 block text-sm font-bold text-gray-700">Jméno dítěte</span>
                  <input name="childName" className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-gray-900 outline-none focus:border-green-500 focus:ring-2 focus:ring-green-200" />
                </label>
                <label className="block">
                  <span className="mb-2 block text-sm font-bold text-gray-700">Telefon *</span>
                  <input name="phone" required inputMode="tel" className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-gray-900 outline-none focus:border-green-500 focus:ring-2 focus:ring-green-200" />
                </label>
                <label className="block">
                  <span className="mb-2 block text-sm font-bold text-gray-700">Email</span>
                  <input name="email" type="email" className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-gray-900 outline-none focus:border-green-500 focus:ring-2 focus:ring-green-200" />
                </label>
              </div>
              <label className="mt-4 block">
                <span className="mb-2 block text-sm font-bold text-gray-700">Poznámka</span>
                <textarea name="note" rows="4" placeholder="Např. upřesnění velikosti, jméno na záda, domluva předání…" className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-gray-900 outline-none focus:border-green-500 focus:ring-2 focus:ring-green-200" />
              </label>
              <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm text-gray-600">
                  Odesláním se objednávka uloží a slouží pouze k domluvě klubového merche. Platba se neprovádí online.
                </p>
                <button type="submit" className="rounded-xl bg-green-600 px-6 py-3 font-bold text-white transition hover:bg-green-700">
                  Odeslat objednávku
                </button>
              </div>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
