const Database = require('better-sqlite3');
const path = require('path');

const dbFile = path.join(__dirname, 'certificados.db');
const db = new Database(dbFile);

// Migraciones
db.exec(`
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  cedula TEXT NOT NULL UNIQUE,
  full_name TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS certificates (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  course_name TEXT NOT NULL,
  company TEXT NOT NULL,
  issue_date TEXT NOT NULL,
  FOREIGN KEY(user_id) REFERENCES users(id)
);
`);

// Seed si no hay datos
const userCount = db.prepare('SELECT COUNT(1) as c FROM users').get().c;
if (userCount === 0) {
	const insertUser = db.prepare('INSERT INTO users (cedula, full_name) VALUES (?, ?)');
	const insertCert = db.prepare('INSERT INTO certificates (user_id, course_name, company, issue_date) VALUES (?, ?, ?, ?)');
	const tx = db.transaction(() => {
		const ana = insertUser.run('1002003001', 'Ana María Rodríguez');
		insertCert.run(ana.lastInsertRowid, 'Introducción a la IA', 'AI Academy', '2025-05-20');
		insertCert.run(ana.lastInsertRowid, 'Machine Learning Básico', 'AI Academy', '2025-08-15');

		const juan = insertUser.run('1234567890', 'Raul Adrés');
		insertCert.run(juan.lastInsertRowid, 'Desarrollo Web con React', 'AI Academy', '2025-07-01');
		insertCert.run(juan.lastInsertRowid, 'Desarrollo Web', 'AI Academy', '2025-07-01');
	});
	tx();
}

function getUserWithCertificatesByCedula(cedula) {
	const user = db.prepare('SELECT id, cedula, full_name FROM users WHERE cedula = ?').get(cedula);
	if (!user) return null;
	const certs = db.prepare('SELECT id, course_name, company, issue_date FROM certificates WHERE user_id = ? ORDER BY issue_date DESC').all(user.id);
	return {
		cedula: user.cedula,
		fullName: user.full_name,
		certificates: certs.map(c => ({ id: `cert-${c.id}`, courseName: c.course_name, company: c.company, issueDate: c.issue_date }))
	};
}

module.exports = { db, getUserWithCertificatesByCedula };


