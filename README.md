# 🎓 Sistema de Certificados (Next.js + React)

Versión en Next.js 14 + React 18 con API Routes y SQLite para verificación y generación de certificados en PDF.

## ✨ Características
- **App Router (Next.js 14)**
- **API Routes**: `/api/verificar-cedula`
- **SQLite** con inicialización automática y datos de ejemplo
- **UI React** con validación y estados de carga
- **PDF** con jsPDF desde el cliente

## 🚀 Instalación

### Prerrequisitos
- Node.js 18+

### Pasos
```bash
npm install
npm run dev
# abrir http://localhost:3000
```

## 📁 Estructura
```
Certificados_JS/
├── app/
│   ├── api/
│   │   └── verificar-cedula/
│   │       └── route.js
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── lib/
│   ├── db.mjs   # ESM para rutas de Next.js
│   └── db.js    # CommonJS opcional
├── database.sqlite (autogenerado)
├── package.json
└── README.md
```

## 📡 API
### POST `/api/verificar-cedula`
Body:
```json
{ "cedula": "1234567890" }
```
Respuesta 200:
```json
{
  "success": true,
  "data": {
    "nombre_estudiante": "Juan Pérez",
    "cedula": "1234567890",
    "nombre_curso": "JavaScript Básico",
    "duracion": "40 horas",
    "descripcion": "Fundamentos de JavaScript y programación web",
    "fecha_completado": "2024-01-15"
  }
}
```

## 🗄️ Base de Datos
Se inicializa automáticamente con tablas `cursos`, `estudiantes`, `certificados` y datos de ejemplo en `lib/db.mjs`.

## 🎨 Personalización
- Edita `app/page.tsx` para cambiar UI y PDF.
- Edita `lib/db.mjs` para campos/tablas.

## 🔒 Notas
- Next.js corre en Node 18+.
- SQLite crea `database.sqlite` en la raíz del proyecto.

## 🛠️ Scripts
```json
{
  "dev": "next dev",
  "build": "next build",
  "start": "next start"
}
```

## 🧪 Prueba rápida
1) `npm run dev`
2) Abre `http://localhost:3000`
3) Usa una cédula de ejemplo: `1234567890`, `0987654321`, `1122334455`
4) Genera el PDF

---
**Desarrollado para la Academia de Programación**
