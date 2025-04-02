const express = require('express');
const QRCode = require('qrcode');
const cors = require('cors');
const crc = require('crc');

const app = express();

const corsOptions = {
    origin: "https://danmzzu.github.io",
    methods: "POST",
    allowedHeaders: ["Content-Type"]
};

app.use(cors(corsOptions));
app.use(express.json());

function generatePixCode(pixData) {
    function formatField(id, value) {
        return id + String(value.length).padStart(2, '0') + value;
    }

    let pixCode = '';

    pixCode += formatField('00', '01');

    const pixKeyFormatted = formatField('00', 'BR.GOV.BCB.PIX') + formatField('01', pixData.pixKey);
    pixCode += formatField('26', pixKeyFormatted);
    pixCode += formatField('52', '0000');
    pixCode += formatField('53', '986');

    if (pixData.value) {
        let formattedValue = parseFloat(pixData.value).toFixed(2);
        pixCode += formatField('54', formattedValue);
    }

    pixCode += formatField('58', 'BR');

    let nameFormatted = pixData.name.normalize("NFD").replace(/[^\w\s]/gi, '').toUpperCase();
    pixCode += formatField('59', nameFormatted);

    let cityFormatted = pixData.city.normalize("NFD").replace(/[^\w\s]/gi, '').toUpperCase();
    pixCode += formatField('60', cityFormatted);

    if (pixData.additionalInfo) {
        pixCode += formatField('62', formatField('05', pixData.additionalInfo));
    }

    let codeBeforeCRC = pixCode + '6304';

    const crc16 = crc.crc16xmodem(codeBeforeCRC, 0xFFFF)
        .toString(16)
        .toUpperCase()
        .padStart(4, '0');

    return codeBeforeCRC + crc16;
}

async function generateQRCode(pixCode) {
    try {
        return await QRCode.toDataURL(pixCode, { type: 'png', margin: 2, width: 512 });
    } catch (err) {
        throw new Error('Erro ao gerar QR Code');
    }
}

app.post('/', async (req, res) => {
    try {
        const pixData = req.body;
        const pixCode = generatePixCode(pixData);
        const qrcode = await generateQRCode(pixCode);

        res.json({
            pixCode,
            qrcode,
        });

    } catch (error) {
        console.error('Erro ao gerar Pix:', error);
        res.status(500).json({ error: error.message || 'Erro interno no servidor' });
    }
});

const PORT = process.env.PORT || 3333;
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});
