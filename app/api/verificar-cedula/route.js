import { NextResponse } from 'next/server';
import { findCertificadoByCedula } from '../../../lib/db.mjs';

export async function POST(request) {
	try {
		const body = await request.json();
		const { cedula } = body || {};

		if (!cedula) {
			return NextResponse.json({ error: 'Cédula es requerida' }, { status: 400 });
		}

		const row = await findCertificadoByCedula(cedula);

		if (!row) {
			return NextResponse.json({ error: 'Cédula no encontrada o no tiene certificados' }, { status: 404 });
		}

		return NextResponse.json({ success: true, data: row });
	} catch (e) {
		return NextResponse.json({ error: 'Error en el servidor' }, { status: 500 });
	}
}
