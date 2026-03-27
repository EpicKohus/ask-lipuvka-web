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

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: process.env.EMAIL_USER,
      subject: 'ASK Lipůvka formulář',
      text,
    });

    res.status(200).json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Chyba serveru' });
  }
}