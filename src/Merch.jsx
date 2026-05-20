import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { addDoc, collection, getDocs, serverTimestamp } from 'firebase/firestore';
import { db } from './firebase';

export default function Merch() {
  const navigate = useNavigate();

  const [theme, setTheme] = useState(() => {
    if (typeof window === 'undefined') return 'light';
    return localStorage.getItem('ask-lipuvka-theme') || 'light';
  });

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [cart, setCart] = useState([]);
  const [selectedVariants, setSelectedVariants] = useState({});
  const [selectedQuantities, setSelectedQuantities] = useState({});

  const [customerForm, setCustomerForm] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
    note: '',
  });

  useEffect(() => {
    document.documentElement.classList.toggle('theme-dark', theme === 'dark');
    document.documentElement.style.colorScheme = theme;
    localStorage.setItem('ask-lipuvka-theme', theme);

    return () => {
      document.documentElement.style.colorScheme = '';
    };
  }, [theme]);

  useEffect(() => {
    const loadProducts = async () => {
      try {
        setLoading(true);
        const snapshot = await getDocs(collection(db, 'merchProducts'));
        const loadedProducts = snapshot.docs
          .map((item) => ({ id: item.id, ...item.data() }))
          .filter((product) => product.active !== false)
          .sort((a, b) => {
            const orderA = Number(a.order) || 0;
            const orderB = Number(b.order) || 0;
            if (orderA !== orderB) return orderA - orderB;
            return String(a.title || '').localeCompare(String(b.title || ''), 'cs');
          });

        setProducts(loadedProducts);

        const variants = {};
        const quantities = {};
        loadedProducts.forEach((product) => {
          const isClothing = product.productKind !== 'item';
          variants[product.id] = isClothing ? product.variants?.[0] || '' : '';
          quantities[product.id] = 1;
        });
        setSelectedVariants(variants);
        setSelectedQuantities(quantities);
      } catch (error) {
        console.error('Chyba při načítání merch produktů:', error);
        setMessage('Produkty se nepodařilo načíst. Zkuste to prosím později.');
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, []);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  const formatPrice = (price) => {
    const value = Number(price) || 0;
    return `${value.toLocaleString('cs-CZ')} Kč`;
  };

  const cartTotal = useMemo(
    () => cart.reduce((sum, item) => sum + (Number(item.price) || 0) * (Number(item.quantity) || 1), 0),
    [cart]
  );

  const addToCart = (product) => {
    const quantity = Math.max(1, Number(selectedQuantities[product.id]) || 1);
    const isClothing = product.productKind !== 'item';
    const variant = isClothing ? selectedVariants[product.id] || product.variants?.[0] || '' : '';

    if (isClothing && product.variants?.length && !variant) {
      setMessage('Vyberte prosím velikost nebo variantu produktu.');
      return;
    }

    setCart((prev) => [
      ...prev,
      {
        productId: product.id,
        title: product.title || '',
        productKind: product.productKind === 'item' ? 'item' : 'clothing',
        type: product.type || (product.productKind === 'item' ? 'Předmět' : 'Oblečení'),
        description: product.description || '',
        image: product.image || '',
        price: Number(product.price) || 0,
        variant,
        quantity,
      },
    ]);
    setMessage(`${product.title} přidáno do objednávky.`);
  };

  const removeFromCart = (indexToRemove) => {
    setCart((prev) => prev.filter((_, index) => index !== indexToRemove));
  };

  const handleCustomerChange = (field, value) => {
    setCustomerForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmitOrder = async (event) => {
    event.preventDefault();
    setMessage('');

    if (!cart.length) {
      setMessage('Nejdřív přidejte alespoň jeden produkt do objednávky.');
      return;
    }

    if (!customerForm.firstName.trim() || !customerForm.lastName.trim() || !customerForm.phone.trim()) {
      setMessage('Vyplňte prosím jméno, příjmení a telefon.');
      return;
    }

    try {
      setSaving(true);
      await addDoc(collection(db, 'merchOrders'), {
        customer: {
          firstName: customerForm.firstName.trim(),
          lastName: customerForm.lastName.trim(),
          phone: customerForm.phone.trim(),
          email: customerForm.email.trim(),
          note: customerForm.note.trim(),
        },
        items: cart,
        total: cartTotal,
        status: 'new',
        createdAt: serverTimestamp(),
      });

      setCart([]);
      setCustomerForm({
        firstName: '',
        lastName: '',
        phone: '',
        email: '',
        note: '',
      });
      setMessage('Objednávka byla odeslána. Děkujeme.');
    } catch (error) {
      console.error('Chyba při odesílání objednávky:', error);
      setMessage('Objednávku se nepodařilo odeslat. Zkuste to prosím znovu.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-white text-gray-900">
      <header className="sticky top-0 z-20 border-b bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <button type="button" onClick={() => navigate('/')} className="flex items-center gap-3 text-left">
            <img src="/logo.png" alt="logo" className="h-10 w-10 rounded-full" />
            <div className="text-lg font-bold text-green-600 md:text-xl">ASK Lipůvka – merch</div>
          </button>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={toggleTheme}
              className="theme-toggle-button hidden md:inline-flex"
              aria-label={theme === 'light' ? 'Přepnout na tmavý režim' : 'Přepnout na světlý režim'}
            >
              <span>{theme === 'light' ? '🌙' : '☀️'}</span>
              <span>{theme === 'light' ? 'Tmavý režim' : 'Světlý režim'}</span>
            </button>
            <button
              type="button"
              onClick={() => navigate('/')}
              className="rounded-xl border border-green-200 bg-green-50 px-4 py-3 font-semibold text-green-700 transition hover:bg-green-100"
            >
              ← Zpět na web
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-10">
        <section className="mb-8 overflow-hidden rounded-[2rem] border border-green-100 bg-gradient-to-br from-green-50 via-white to-blue-50 p-7 shadow-sm md:p-10">
          <div className="max-w-3xl">
            <div className="mb-3 inline-flex rounded-full bg-green-600 px-4 py-2 text-xs font-black uppercase tracking-wide text-white">
              Klubový merch
            </div>
            <h1 className="text-4xl font-black text-green-700 md:text-5xl">Objednávka merche ASK Lipůvka</h1>
            <p className="mt-4 text-lg text-gray-700">
              Vyberte produkt, variantu a počet kusů. Platba se tady neřeší — objednávka se jen odešle klubu.
            </p>
          </div>
        </section>

        {message && (
          <div className="mb-6 rounded-2xl border border-green-200 bg-green-50 p-4 font-semibold text-green-800">
            {message}
          </div>
        )}

        <div className="grid gap-8 lg:grid-cols-[1.15fr_0.85fr]">
          <section>
            <h2 className="mb-5 text-2xl font-black text-green-700">Produkty</h2>

            {loading ? (
              <div className="rounded-3xl border border-green-100 bg-white p-8 text-center shadow-sm">
                <div className="font-semibold text-gray-700">Načítám produkty…</div>
              </div>
            ) : products.length > 0 ? (
              <div className="grid gap-5 md:grid-cols-2">
                {products.map((product) => (
                  <div key={product.id} className="overflow-hidden rounded-3xl border border-green-100 bg-white shadow-sm">
                    <div className="h-64 bg-gray-100">
                      {product.image ? (
                        <img src={product.image} alt={product.title} className="h-full w-full object-cover" />
                      ) : (
                        <div className="flex h-full items-center justify-center text-sm font-semibold text-gray-500">
                          Obrázek bude doplněn
                        </div>
                      )}
                    </div>

                    <div className="space-y-4 p-5">
                      <div>
                        <div className="mb-2 inline-flex rounded-full bg-green-100 px-3 py-1 text-xs font-bold uppercase tracking-wide text-green-700">
                          {product.type || (product.productKind === 'item' ? 'Předmět' : 'Oblečení')}
                        </div>
                        <h3 className="text-xl font-black text-gray-900">{product.title}</h3>
                        {product.description && (
                          <p className="mt-2 text-sm leading-relaxed text-gray-600">{product.description}</p>
                        )}
                      </div>

                      <div className="text-2xl font-black text-green-700">{formatPrice(product.price)}</div>

                      {product.productKind !== 'item' && product.variants?.length > 0 && (
                        <div>
                          <label className="mb-2 block text-sm font-semibold text-gray-700">Velikost / varianta</label>
                          <select
                            value={selectedVariants[product.id] || ''}
                            onChange={(e) => setSelectedVariants((prev) => ({ ...prev, [product.id]: e.target.value }))}
                            className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-gray-900 outline-none transition focus:border-green-500 focus:ring-2 focus:ring-green-200"
                          >
                            {product.variants.map((variant) => (
                              <option key={variant} value={variant}>{variant}</option>
                            ))}
                          </select>
                        </div>
                      )}

                      <div>
                        <label className="mb-2 block text-sm font-semibold text-gray-700">Počet</label>
                        <input
                          type="number"
                          min="1"
                          value={selectedQuantities[product.id] || 1}
                          onChange={(e) => setSelectedQuantities((prev) => ({ ...prev, [product.id]: e.target.value }))}
                          className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-gray-900 outline-none transition focus:border-green-500 focus:ring-2 focus:ring-green-200"
                        />
                      </div>

                      <button
                        type="button"
                        onClick={() => addToCart(product)}
                        className="w-full rounded-xl bg-green-600 px-5 py-3 font-bold text-white transition hover:bg-green-700"
                      >
                        Přidat do objednávky
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-3xl border border-green-100 bg-white p-8 shadow-sm">
                <div className="font-semibold text-gray-700">Zatím tu nejsou žádné aktivní produkty.</div>
                <div className="mt-2 text-sm text-gray-500">Produkty přidáte v administraci v sekci Merch.</div>
              </div>
            )}
          </section>

          <section className="lg:sticky lg:top-24 lg:self-start">
            <div className="rounded-3xl border border-green-100 bg-white p-6 shadow-sm">
              <h2 className="mb-5 text-2xl font-black text-green-700">Objednávka</h2>

              {cart.length > 0 ? (
                <div className="mb-6 space-y-3">
                  {cart.map((item, index) => (
                    <div key={`${item.productId}-${index}`} className="rounded-2xl border border-gray-200 bg-gray-50 p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="font-bold text-gray-900">{item.title}</div>
                          <div className="mt-1 text-sm text-gray-600">
                            {item.variant && <>Velikost/varianta: <span className="font-semibold">{item.variant}</span> · </>}
                            Počet: <span className="font-semibold">{item.quantity}</span>
                          </div>
                          <div className="mt-1 text-sm font-bold text-green-700">
                            {formatPrice((Number(item.price) || 0) * (Number(item.quantity) || 1))}
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeFromCart(index)}
                          className="rounded-xl border border-red-200 bg-white px-3 py-2 text-sm font-bold text-red-600 hover:bg-red-50"
                        >
                          Odebrat
                        </button>
                      </div>
                    </div>
                  ))}

                  <div className="flex items-center justify-between rounded-2xl bg-green-50 p-4 text-lg font-black text-green-800">
                    <span>Celkem</span>
                    <span>{formatPrice(cartTotal)}</span>
                  </div>
                </div>
              ) : (
                <div className="mb-6 rounded-2xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-600">
                  Zatím není vybraný žádný produkt.
                </div>
              )}

              <form onSubmit={handleSubmitOrder} className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-gray-700">Jméno</label>
                    <input
                      type="text"
                      value={customerForm.firstName}
                      onChange={(e) => handleCustomerChange('firstName', e.target.value)}
                      placeholder="Jan"
                      className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-gray-900 outline-none transition focus:border-green-500 focus:ring-2 focus:ring-green-200"
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-gray-700">Příjmení</label>
                    <input
                      type="text"
                      value={customerForm.lastName}
                      onChange={(e) => handleCustomerChange('lastName', e.target.value)}
                      placeholder="NOVÁK"
                      className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-gray-900 outline-none transition focus:border-green-500 focus:ring-2 focus:ring-green-200"
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-700">Telefon</label>
                  <input
                    type="tel"
                    value={customerForm.phone}
                    onChange={(e) => handleCustomerChange('phone', e.target.value)}
                    placeholder="777 123 456"
                    className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-gray-900 outline-none transition focus:border-green-500 focus:ring-2 focus:ring-green-200"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-700">Email</label>
                  <input
                    type="email"
                    value={customerForm.email}
                    onChange={(e) => handleCustomerChange('email', e.target.value)}
                    placeholder="email@seznam.cz"
                    className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-gray-900 outline-none transition focus:border-green-500 focus:ring-2 focus:ring-green-200"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-700">Poznámka</label>
                  <textarea
                    rows="4"
                    value={customerForm.note}
                    onChange={(e) => handleCustomerChange('note', e.target.value)}
                    placeholder="Např. předání na tréninku."
                    className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-gray-900 outline-none transition focus:border-green-500 focus:ring-2 focus:ring-green-200"
                  />
                </div>

                <button
                  type="submit"
                  disabled={saving}
                  className="w-full rounded-xl bg-green-600 px-5 py-4 text-lg font-black text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:bg-gray-300"
                >
                  {saving ? 'Odesílám…' : 'Odeslat objednávku'}
                </button>
              </form>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
