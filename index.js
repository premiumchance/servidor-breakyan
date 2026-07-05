const express = require('express');
const cors = require('cors');
const { Resend } = require('resend');

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Verificar que la API Key existe
if (!process.env.RESEND_API_KEY) {
    console.error('❌ ERROR: RESEND_API_KEY no está configurada');
    process.exit(1);
}

const resend = new Resend(process.env.RESEND_API_KEY);

app.get('/', (req, res) => {
    res.json({
        message: '🐺 Servidor de BreakYan funcionando',
        status: 'ok'
    });
});

app.post('/api/enviar-codigo', async (req, res) => {
    try {
        const { correo, nombre, codigo } = req.body;

        if (!correo || !codigo) {
            return res.status(400).json({
                success: false,
                error: 'Faltan datos: correo y código son obligatorios'
            });
        }

        const { data, error } = await resend.emails.send({
            from: 'onboarding@resend.dev',
            to: correo,
            subject: '🔐 Código de verificación - BreakYan',
            html: `
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
                    </div>
                </div>
            `
        });

        if (error) {
            console.error('❌ Error de Resend:', error);
            return res.status(400).json({
                success: false,
                error: error.message
            });
        }

        console.log('✅ Correo enviado a:', correo);
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

app.listen(port, () => {
    console.log(`🚀 Servidor corriendo en el puerto ${port}`);
    console.log(`🔗 URL: http://localhost:${port}`);
});