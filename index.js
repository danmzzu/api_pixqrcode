const express = require('express');
const QRCode = require('qrcode');
const cors = require('cors');
const crc = require('crc');

const app = express();
app.use(express.json());

app.use(cors());

app.use(cors({
    origin: "https://danmzzu.github.io",
    methods: "POST",
    allowedHeaders: ["Content-Type"]
}));

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

app.post('/', async (req, res) => {
    try {
        const pixData = req.body;
        const pixCode = generatePixCode(pixData);

        QRCode.toDataURL(pixCode, { type: 'png', margin: 2, width: 512 }, (err, qrcode) => {
            if (err) {
                return res.status(500).json({ error: 'Error generating QR Code' });
            }
            res.json({
                pixCode: pixCode,
                qrcode: qrcode,
            });
        });

    } catch (error) {
        console.error('Error generating Pix:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

const PORT = process.env.PORT || 3333;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});