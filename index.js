const express = require('express');
const cors = require('cors');
const { google } = require('googleapis');
const nodemailer = require('nodemailer');

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// ==========================================
// CONFIGURACIÓN DE GMAIL API
// ==========================================
const CLIENT_ID = process.env.GMAIL_CLIENT_ID;
const CLIENT_SECRET = process.env.GMAIL_CLIENT_SECRET;
const REDIRECT_URI = 'https://developers.google.com/oauthplayground';
const REFRESH_TOKEN = process.env.GMAIL_REFRESH_TOKEN;

// Crear cliente OAuth2
const oAuth2Client = new google.auth.OAuth2(
    CLIENT_ID,
    CLIENT_SECRET,
    REDIRECT_URI
);
oAuth2Client.setCredentials({ refresh_token: REFRESH_TOKEN });

// ==========================================
// ENVIAR CORREO CON GMAIL API
// ==========================================
async function enviarCorreo(destinatario, asunto, mensaje) {
    try {
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                type: 'OAuth2',
                user: process.env.GMAIL_USER,
                clientId: CLIENT_ID,
                clientSecret: CLIENT_SECRET,
                refreshToken: REFRESH_TOKEN
            }
        });

        const mailOptions = {
            from: process.env.GMAIL_USER,
            to: destinatario,
            subject: asunto,
            html: mensaje
        };

        const result = await transporter.sendMail(mailOptions);
        return result;
    } catch (error) {
        console.error('❌ Error al enviar correo:', error);
        throw error;
    }
}

// ==========================================
// ENDPOINT PARA ENVIAR CÓDIGO DE VERIFICACIÓN
// ==========================================
app.post('/api/enviar-codigo', async (req, res) => {
    try {
        const { correo, nombre, codigo } = req.body;

        if (!correo || !codigo) {
            return res.status(400).json({
                success: false,
                error: 'Faltan datos: correo y código son obligatorios'
            });
        }

        const mensaje = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #f4f4f4; border-radius: 10px;">
                <div style="background: #1a1a1e; color: #fff; padding: 30px; border-radius: 10px;">
                    <h1 style="text-align: center; color: #ff3b30;">🐺 BreakYan</h1>
                    <p style="font-size: 16px; color: #ccc;">Hola ${nombre || 'usuario'},</p>
                    <p style="font-size: 16px; color: #ccc;">Tu código de verificación es:</p>
                    <div style="font-size: 48px; font-weight: bold; text-align: center; padding: 20px; background: #2a2a2e; border-radius: 10px; letter-spacing: 10px; color: #34c759;">
                        ${codigo}
                    </div>
                    <p style="text-align: center; color: #888; font-size: 14px; margin-top: 20px;">Este código expira en 10 minutos.</p>
                    <p style="text-align: center; color: #666; font-size: 12px;">Si no solicitaste este código, ignora este mensaje.</p>
                    <p style="text-align: center; color: #666; font-size: 12px; margin-top: 20px;">❤️ Donde estés, estamos juntos</p>
                </div>
            </div>
        `;

        await enviarCorreo(correo, '🔐 Código de verificación - BreakYan', mensaje);

        res.json({
            success: true,
            message: 'Correo enviado correctamente'
        });

    } catch (error) {
        console.error('❌ Error en el servidor:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// ==========================================
// RUTA DE PRUEBA
// ==========================================
app.get('/', (req, res) => {
    res.json({
        message: '🐺 Servidor de BreakYan funcionando con Gmail API',
        version: '2.0'
    });
});

// ==========================================
// INICIAR EL SERVIDOR
// ==========================================
app.listen(port, () => {
    console.log(`🚀 Servidor corriendo en el puerto ${port}`);
});