import nodemailer from 'nodemailer';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Pouze POST' });
  }

  const data = req.body;

  try {
    const transporter = nodemailer.createTransport({
      host: 'smtp.seznam.cz',
      port: 465,
      secure: true,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    let text = '';

    if (data.typ === 'registrace') {
      text = `
Nová registrace:

Jméno: ${data.jmeno}
Příjmení: ${data.prijmeni}
Adresa: ${data.adresa}
Datum narození: ${data.datum_narozeni}
Město narození: ${data.mesto_narozeni}
Rodné číslo: ${data.rodne_cislo}
Rodič: ${data.rodic}
Telefon: ${data.telefon}
`;
    }

    if (data.typ === 'podnet') {
      text = `
Nový podnět:

Jméno: ${data.jmeno}
Zpráva:
${data.zprava}
`;
    }

    if (data.typ === 'merch') {
      const customer = data.customer || {};
      const items = Array.isArray(data.items) ? data.items : [];
      const productsText = items.length
        ? items
            .map((item, index) => {
              const name = item.name || item.title || 'Produkt';
              const variant = item.variant || item.size || '';
              const color = item.color ? ` / barva: ${item.color}` : '';
              const customName = item.customName ? ` / jméno: ${item.customName}` : '';
              const customNumber = item.customNumber ? ` / číslo: ${item.customNumber}` : '';
              const quantity = item.quantity || 1;
              const lineTotal = item.lineTotal ? ` / ${item.lineTotal} Kč` : '';
              return `${index + 1}. ${name}${variant ? ` / ${variant}` : ''}${color}${customName}${customNumber} / počet: ${quantity}${lineTotal}`;
            })
            .join('\n')
        : data.produkty || 'Produkty nebyly uvedeny.';

      text = `
Nová objednávka MERCH:

Jméno rodiče: ${customer.parentName || data.jmeno || '-'}
Jméno dítěte: ${customer.childName || data.prijmeni || '-'}
Telefon: ${customer.phone || data.telefon || '-'}
Email: ${customer.email || data.email || '-'}

Produkty:
${productsText}

Celkem: ${data.total ?? '-'} Kč

Poznámka:
${customer.note || data.note || data.poznamka || '-'}
`;
    }

    if (!text.trim()) {
      return res.status(400).json({ error: 'Neznámý typ formuláře' });
    }

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: process.env.EMAIL_USER,
      subject: data.typ === 'merch' ? 'ASK Lipůvka merch objednávka' : 'ASK Lipůvka formulář',
      text,
    });

    res.status(200).json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Chyba serveru' });
  }
}