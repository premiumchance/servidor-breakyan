const express = require('express');
const cors = require('cors');
const { Resend } = require('resend');

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const resend = new Resend(process.env.RESEND_API_KEY);

app.get('/', (req, res) => {
  res.json({ message: '🐺 Servidor funcionando correctamente' });
});

app.post('/api/enviar-codigo', async (req, res) => {
  try {
    const { correo, nombre, codigo } = req.body;
    if (!correo || !codigo) {
      return res.status(400).json({ success: false, error: 'Faltan datos' });
    }
    const { data, error } = await resend.emails.send({
      from: 'onboarding@resend.dev',
      to: correo,
      subject: '🔐 Código de verificación - BreakYan',
      html: `<div>Hola ${nombre || 'usuario'}, tu código es: <strong>${codigo}</strong></div>`
    });
    if (error) throw new Error(error.message);
    res.json({ success: true, message: 'Correo enviado' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.listen(port, () => {
  console.log(`🚀 Servidor corriendo en el puerto ${port}`);
});