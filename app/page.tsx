'use client';

import { useState } from 'react';
import { jsPDF } from 'jspdf';

type Certificado = {
	nombre_estudiante: string;
	cedula: string;
	nombre_curso: string;
	duracion: string;
	descripcion: string;
	fecha_completado: string;
};

export default function Home() {
	//const [nombre, setNombre] = useState('');
	const [cedula, setCedula] = useState('');
	const [data, setData] = useState<Certificado | null>(null);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	async function onSubmit(e: React.FormEvent) {
		e.preventDefault();
		setError(null);
		setData(null);
		if (!cedula) {
			setError('Por favor ingresa tu cédula');
			return;
		}
		setLoading(true);
		try {
			const res = await fetch('/api/verificar-cedula', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ cedula })
			});
			const json = await res.json();
			if (json.success) {
				setData(json.data as Certificado);
			} else {
				setError(json.error || 'Error al verificar la cédula');
			}
		} catch (e) {
			setError('Error de conexión');
		} finally {
			setLoading(false);
		}
	}

	function formatearFecha(s: string) {
		const d = new Date(s);
		return d.toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' });
	}

	function generarPDF(info: Certificado) {
		const doc = new jsPDF('landscape', 'mm', 'a4');
		const w = doc.internal.pageSize.getWidth();
		const h = doc.internal.pageSize.getHeight();
		// fondo
		doc.setFillColor(102,126,234);
		doc.rect(0,0,w,h,'F');
		// borde
		doc.setDrawColor(255,255,255);
		doc.setLineWidth(3);
		doc.rect(15,15,w-30,h-30);
		// títulos
		doc.setTextColor(255,255,255);
		doc.setFont('helvetica','bold');
		doc.setFontSize(36);
		doc.text('CERTIFICADO DE COMPLETACIÓN', w/2, 60, { align: 'center' });
		doc.setFontSize(18);
		doc.setFont('helvetica','normal');
		doc.text('Se certifica que', w/2, 85, { align: 'center' });
		doc.setFontSize(28);
		doc.setFont('helvetica','bold');
		doc.text(info.nombre_estudiante, w/2, 110, { align: 'center' });
		doc.setFontSize(16);
		doc.setFont('helvetica','normal');
		doc.text('ha completado exitosamente el curso de', w/2, 135, { align: 'center' });
		doc.setFontSize(24);
		doc.setFont('helvetica','bold');
		doc.text(info.nombre_curso, w/2, 155, { align: 'center' });
		doc.setFontSize(14);
		doc.setFont('helvetica','normal');
		doc.text(`Duración: ${info.duracion}`, w/2, 175, { align: 'center' });
		doc.text(`Fecha de completado: ${formatearFecha(info.fecha_completado)}`, w/2, 190, { align: 'center' });
		doc.setFontSize(12);
		doc.text(`Código de verificación: ${info.cedula}`, w/2, 210, { align: 'center' });
		doc.setFontSize(10);
		doc.text('Este certificado es emitido digitalmente por la Academia de Programación', w/2, 240, { align: 'center' });
		doc.text('Para verificar la autenticidad, contacta a: info@academia.com', w/2, 250, { align: 'center' });
		// marca de agua
		doc.setTextColor(255,255,255,0.1);
		doc.setFontSize(60);
		doc.setFont('helvetica','bold');
		doc.text('ACADEMIA', w/2, h/2, { align: 'center' });
		const nombreArchivo = `Certificado_${info.nombre_estudiante.replace(/\s+/g,'_')}_${info.nombre_curso.replace(/\s+/g,'_')}.pdf`;
		doc.save(nombreArchivo);
	}

	return (
		<div className="container">
			<header className="header">
				<h1> Sistema de Certificados</h1>
				<p>Verifica tu cédula y genera tu certificado</p>
			</header>
			<main className="card">
				<form className="form" onSubmit={onSubmit}>
					<label className="label" htmlFor="cedula">Cédula</label>
					<input className="input" id="cedula" value={cedula} onChange={(e)=>{
						const v = e.target.value.replace(/[^0-9]/g,'').slice(0,10);
						setCedula(v);
					}} placeholder="Ingresa tu cédula" />
					<button className="btn" type="submit" disabled={loading}>{loading ? 'Verificando...' : 'Verificar Cédula'}</button>
				</form>
				{error && (
					<div className="result" style={{ borderLeftColor: '#dc3545' }}>
						<h3 style={{ color:'#dc3545' }}>Error</h3>
						<p>{error}</p>
					</div>
				)}
				{data && (
					<div className="result">
						<h3>Información del Certificado</h3>
						<div className="row"><strong>Estudiante:</strong><span>{data.nombre_estudiante}</span></div>
						<div className="row"><strong>Cédula:</strong><span>{data.cedula}</span></div>
						<div className="row"><strong>Curso:</strong><span>{data.nombre_curso}</span></div>
						<div className="row"><strong>Duración:</strong><span>{data.duracion}</span></div>
						<div className="row"><strong>Fecha de Completado:</strong><span>{formatearFecha(data.fecha_completado)}</span></div>
						<button className="btn" onClick={()=> generarPDF(data)}>📄 Generar Certificado PDF</button>
					</div>
				)}
			</main>
			<footer className="footer">© 2025 Certificados - AI Academy</footer>
		</div>
	);
}
