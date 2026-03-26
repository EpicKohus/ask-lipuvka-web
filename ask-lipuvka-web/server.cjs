const express = require("express");
const cors = require("cors");
const nodemailer = require("nodemailer");

const app = express();

app.use(cors());
app.use(express.json());

app.post("/send", async (req, res) => {
  try {
    const {
      jmeno,
      prijmeni,
      adresa,
      datum_narozeni,
      mesto_narozeni,
      rodne_cislo,
      rodic,
      telefon,
    } = req.body;

    // 🔥 SEZNAM EMAIL NASTAVENÍ
    const transporter = nodemailer.createTransport({
      host: "smtp.seznam.cz",
      port: 465,
      secure: true,
      auth: {
        user: "radek.manek@email.cz",
        pass: "RmBlok218@",
      },
    });

    const mailOptions = {
      from: "radek.manek@email.cz",
      to: "radek.manek@email.cz",
      subject: "⚽ Nová registrace hráče - ASK Lipůvka",
      text: `
Nová registrace hráče:

Jméno: ${jmeno}
Příjmení: ${prijmeni}
Adresa: ${adresa}
Datum narození: ${datum_narozeni}
Město narození: ${mesto_narozeni}
Rodné číslo: ${rodne_cislo}
Rodič: ${rodic}
Telefon: ${telefon}
      `,
    };

    await transporter.sendMail(mailOptions);

    res.status(200).json({
      success: true,
      message: "Email byl odeslán",
    });

  } catch (error) {
    console.error("Chyba:", error);
    res.status(500).json({
      success: false,
      message: "Nepodařilo se odeslat email",
    });
  }
});

// 🔥 SPUŠTĚNÍ SERVERU
app.listen(3001, () => {
  console.log("✅ Backend běží na http://localhost:3001");
});