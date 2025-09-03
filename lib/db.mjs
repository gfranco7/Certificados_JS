import sqlite3pkg from 'sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const sqlite3 = sqlite3pkg.verbose();
let dbInstance = null;

function getDb() {
	if (dbInstance) return dbInstance;
	const __filename = fileURLToPath(import.meta.url);
	const __dirname = path.dirname(__filename);
	const dbPath = path.join(process.cwd(), 'database.sqlite');
	dbInstance = new sqlite3.Database(dbPath, (err) => {
		if (err) {
			console.error('Error conectando a la base de datos:', err.message);
		} else {
			initDatabase(dbInstance);
		}
	});
	return dbInstance;
}

function initDatabase(db) {
	db.serialize(() => {
		db.run(`CREATE TABLE IF NOT EXISTS cursos (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			nombre TEXT NOT NULL,
			duracion TEXT NOT NULL,
			descripcion TEXT
		)`);

		db.run(`CREATE TABLE IF NOT EXISTS estudiantes (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			nombre TEXT NOT NULL,
			cedula TEXT UNIQUE NOT NULL,
			email TEXT
		)`);

		db.run(`CREATE TABLE IF NOT EXISTS certificados (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			estudiante_id INTEGER,
			curso_id INTEGER,
			fecha_completado DATE NOT NULL,
			FOREIGN KEY (estudiante_id) REFERENCES estudiantes (id),
			FOREIGN KEY (curso_id) REFERENCES cursos (id)
		)`);

		db.run(`INSERT OR IGNORE INTO cursos (id, nombre, duracion, descripcion) VALUES 
			(1, 'JavaScript Básico', '40 horas', 'Fundamentos de JavaScript y programación web'),
			(2, 'React.js Avanzado', '60 horas', 'Desarrollo de aplicaciones web con React'),
			(3, 'Node.js Backend', '50 horas', 'Construcción de APIs y servidores con Node.js')`);

		db.run(`INSERT OR IGNORE INTO estudiantes (id, nombre, cedula, email) VALUES 
			(1, 'Juan Pérez', '1234567890', 'juan@email.com'),
			(2, 'María García', '0987654321', 'maria@email.com'),
			(3, 'Carlos López', '1122334455', 'carlos@email.com')`);

		db.run(`INSERT OR IGNORE INTO certificados (estudiante_id, curso_id, fecha_completado) VALUES 
			(1, 1, '2024-01-15'),
			(2, 2, '2024-02-20'),
			(3, 3, '2024-03-10')`);
	});
}

export function findCertificadoByCedula(cedula) {
	return new Promise((resolve, reject) => {
		const db = getDb();
		const query = `
			SELECT 
				e.nombre as nombre_estudiante,
				e.cedula,
				c.nombre as nombre_curso,
				c.duracion,
				c.descripcion,
				cert.fecha_completado
			FROM estudiantes e
			JOIN certificados cert ON e.id = cert.estudiante_id
			JOIN cursos c ON cert.curso_id = c.id
			WHERE e.cedula = ?
		`;
		db.get(query, [cedula], (err, row) => {
			if (err) return reject(err);
			resolve(row || null);
		});
	});
}
