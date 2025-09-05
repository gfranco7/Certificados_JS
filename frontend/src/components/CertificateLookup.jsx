import { useState } from 'react';
import jsPDF from 'jspdf';
import './certificate.css';
import aiAcademyLogo from '../assets/logo-ai-academy.svg';

function formatDate(isoDate) {
	try {
		const d = new Date(isoDate);
		return d.toLocaleDateString();
	} catch {
		return isoDate;
	}
}

export default function CertificateLookup() {
	const [cedula, setCedula] = useState('');
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState('');
	const [result, setResult] = useState(null);

	async function handleSubmit(e) {
		e.preventDefault();
		setError('');
		setResult(null);
		if (!cedula.trim()) {
			setError('Ingrese una cédula válida');
			return;
		}
		setLoading(true);
		try {
			const res = await fetch(`/api/certificates?cedula=${encodeURIComponent(cedula.trim())}`);
			if (!res.ok) {
				const data = await res.json().catch(() => ({}));
				throw new Error(data.error || 'No se encontraron certificados');
			}
			const data = await res.json();
			setResult(data);
		} catch (err) {
			setError(err.message);
		} finally {
			setLoading(false);
		}
	}

	function handleDownloadPDF(cert, ownerName) {
		const doc = new jsPDF({ orientation: 'landscape', unit: 'pt', format: 'A4' });
		// Título
		doc.setFont('helvetica', 'bold');
		doc.setFontSize(26);
		doc.text('Certificado de Finalización', 300, 120, { align: 'center' });
		// Nombre
		doc.setFont('helvetica', 'normal');
		doc.setFontSize(18);
		doc.text(`Otorgado a: ${ownerName}`, 300, 170, { align: 'center' });
		// Curso
		doc.setFontSize(16);
		doc.text(`Por completar la formación: ${cert.courseName}`, 300, 210, { align: 'center' });
		// Empresa y fecha
		doc.setFontSize(12);
		doc.text(`${cert.company} - Fecha: ${formatDate(cert.issueDate)}`, 300, 250, { align: 'center' });
		// Pie
		doc.setDrawColor(220);
		doc.line(60, 280, 540, 280);
		doc.setFontSize(10);
		doc.text('AI Academy', 300, 305, { align: 'center' });
		const safeName = ownerName.replace(/[^a-z0-9\-\_ ]/gi, '_');
		doc.save(`${safeName}_${cert.id}.pdf`);
	}

	return (
		<div className="cert-container">
			<form className="cert-form" onSubmit={handleSubmit}>
				<label className="cert-label">Cédula</label>
				<div className="cert-input-row">
					<input
						type="text"
						inputMode="numeric"
						placeholder="Ingrese su cédula"
						value={cedula}
						onChange={(e) => setCedula(e.target.value)}
						className="cert-input"
					/>
					<button className="cert-btn" disabled={loading}>
						{loading ? 'Buscando...' : 'Verificar'}
					</button>
				</div>
				{error && <div className="cert-error">{error}</div>}
			</form>

			{result && (
				<div className="cert-results">
					<div className="cert-owner">{result.fullName} — {result.cedula}</div>
					<div className="cert-grid">
						{(result.certificates || []).map((cert) => (
							<button
								key={cert.id}
								onClick={() => handleDownloadPDF(cert, result.fullName)}
								className="cert-card"
								type="button"
								title={`Descargar ${cert.courseName}`}
							>
								<div className="cert-logo" aria-hidden>
									<img src={aiAcademyLogo} alt="logo empresa" width="28" height="28" />
								</div>
								<div className="cert-meta">
									<div className="cert-company">{cert.company}</div>
									<div className="cert-course">{cert.courseName}</div>
								</div>
							</button>
						))}
					</div>
				</div>
			)}
		</div>
	);
}


