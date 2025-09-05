
const express = require('express');
const cors = require('cors');
const { getUserWithCertificatesByCedula } = require('./db');

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());


app.get('/api/health', (_req, res) => {
	res.json({ status: 'ok' });
});

// GET /api/certificates?cedula=XXXXXXXXX
app.get('/api/certificates', (req, res) => {
	const { cedula } = req.query;
	if (!cedula) {
		return res.status(400).json({ error: 'Falta el parámetro cedula' });
	}
	const user = getUserWithCertificatesByCedula(String(cedula));
	if (!user) {
		return res.status(404).json({ error: 'No se encontraron certificados para esta cédula' });
	}
	return res.json(user);
});

// Endpoint auxiliar para ver todos (solo pruebas)
app.get('/api/_all', (_req, res) => {
	res.json({ ok: true });
});

app.listen(PORT, () => {
	console.log(`Backend escuchando en http://localhost:${PORT}`);
});


