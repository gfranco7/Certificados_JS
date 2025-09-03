document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('certificadoForm');
    const resultadoDiv = document.getElementById('resultado');
    const errorDiv = document.getElementById('error');
    const generarPDFBtn = document.getElementById('generarPDF');
    
    let certificadoData = null;

    // Manejar el envío del formulario
    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const nombre = document.getElementById('nombre').value.trim();
        const cedula = document.getElementById('cedula').value.trim();
        
        if (!nombre || !cedula) {
            mostrarError('Por favor, completa todos los campos');
            return;
        }

        await verificarCedula(cedula);
    });

    // Verificar cédula en la base de datos
    async function verificarCedula(cedula) {
        const submitBtn = form.querySelector('button[type="submit"]');
        const btnText = submitBtn.querySelector('.btn-text');
        const spinner = submitBtn.querySelector('.spinner');
        
        // Mostrar loading
        submitBtn.classList.add('loading');
        btnText.style.opacity = '0';
        spinner.style.display = 'block';
        submitBtn.disabled = true;

        try {
            const response = await fetch('/api/verificar-cedula', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ cedula })
            });

            const data = await response.json();

            if (data.success) {
                certificadoData = data.data;
                mostrarResultado(data.data);
                ocultarError();
            } else {
                mostrarError(data.error || 'Error al verificar la cédula');
            }
        } catch (error) {
            console.error('Error:', error);
            mostrarError('Error de conexión. Intenta nuevamente.');
        } finally {
            // Ocultar loading
            submitBtn.classList.remove('loading');
            btnText.style.opacity = '1';
            spinner.style.display = 'none';
            submitBtn.disabled = false;
        }
    }

    // Mostrar resultado del certificado
    function mostrarResultado(data) {
        document.getElementById('nombreEstudiante').textContent = data.nombre_estudiante;
        document.getElementById('cedulaEstudiante').textContent = data.cedula;
        document.getElementById('nombreCurso').textContent = data.nombre_curso;
        document.getElementById('duracionCurso').textContent = data.duracion;
        document.getElementById('fechaCompletado').textContent = formatearFecha(data.fecha_completado);
        
        resultadoDiv.style.display = 'block';
        resultadoDiv.scrollIntoView({ behavior: 'smooth' });
    }

    // Generar PDF del certificado
    generarPDFBtn.addEventListener('click', function() {
        if (certificadoData) {
            generarPDF(certificadoData);
        }
    });

    // Función para generar el PDF
    function generarPDF(data) {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF('landscape', 'mm', 'a4');
        
        // Configuración del documento
        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();
        
        // Colores
        const primaryColor = [102, 126, 234];
        const secondaryColor = [118, 75, 162];
        
        // Fondo degradado
        doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
        doc.rect(0, 0, pageWidth, pageHeight, 'F');
        
        // Borde decorativo
        doc.setDrawColor(255, 255, 255);
        doc.setLineWidth(3);
        doc.rect(15, 15, pageWidth - 30, pageHeight - 30);
        
        // Título principal
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(36);
        doc.setFont('helvetica', 'bold');
        doc.text('CERTIFICADO DE COMPLETACIÓN', pageWidth / 2, 60, { align: 'center' });
        
        // Subtítulo
        doc.setFontSize(18);
        doc.setFont('helvetica', 'normal');
        doc.text('Se certifica que', pageWidth / 2, 85, { align: 'center' });
        
        // Nombre del estudiante
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(28);
        doc.setFont('helvetica', 'bold');
        doc.text(data.nombre_estudiante, pageWidth / 2, 110, { align: 'center' });
        
        // Texto del certificado
        doc.setFontSize(16);
        doc.setFont('helvetica', 'normal');
        doc.text('ha completado exitosamente el curso de', pageWidth / 2, 135, { align: 'center' });
        
        // Nombre del curso
        doc.setFontSize(24);
        doc.setFont('helvetica', 'bold');
        doc.text(data.nombre_curso, pageWidth / 2, 155, { align: 'center' });
        
        // Información adicional
        doc.setFontSize(14);
        doc.setFont('helvetica', 'normal');
        doc.text(`Duración: ${data.duracion}`, pageWidth / 2, 175, { align: 'center' });
        doc.text(`Fecha de completado: ${formatearFecha(data.fecha_completado)}`, pageWidth / 2, 190, { align: 'center' });
        
        // Código de verificación
        doc.setFontSize(12);
        doc.text(`Código de verificación: ${data.cedula}`, pageWidth / 2, 210, { align: 'center' });
        
        // Pie de página
        doc.setFontSize(10);
        doc.text('Este certificado es emitido digitalmente por la Academia de Programación', pageWidth / 2, 240, { align: 'center' });
        doc.text('Para verificar la autenticidad, contacta a: info@academia.com', pageWidth / 2, 250, { align: 'center' });
        
        // Marca de agua
        doc.setTextColor(255, 255, 255, 0.1);
        doc.setFontSize(60);
        doc.setFont('helvetica', 'bold');
        doc.text('ACADEMIA', pageWidth / 2, pageHeight / 2, { align: 'center' });
        
        // Generar nombre del archivo
        const nombreArchivo = `Certificado_${data.nombre_estudiante.replace(/\s+/g, '_')}_${data.nombre_curso.replace(/\s+/g, '_')}.pdf`;
        
        // Descargar el PDF
        doc.save(nombreArchivo);
        
        // Mostrar mensaje de éxito
        mostrarMensajeExito('Certificado generado exitosamente');
    }

    // Formatear fecha
    function formatearFecha(fechaString) {
        const fecha = new Date(fechaString);
        return fecha.toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    }

    // Mostrar error
    function mostrarError(mensaje) {
        document.getElementById('errorMessage').textContent = mensaje;
        errorDiv.style.display = 'block';
        resultadoDiv.style.display = 'none';
        errorDiv.scrollIntoView({ behavior: 'smooth' });
    }

    // Ocultar error
    function ocultarError() {
        errorDiv.style.display = 'none';
    }

    // Mostrar mensaje de éxito
    function mostrarMensajeExito(mensaje) {
        // Crear notificación temporal
        const notificacion = document.createElement('div');
        notificacion.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #28a745;
            color: white;
            padding: 15px 25px;
            border-radius: 10px;
            box-shadow: 0 5px 15px rgba(0,0,0,0.2);
            z-index: 1000;
            animation: slideInRight 0.3s ease-out;
        `;
        notificacion.textContent = mensaje;
        
        document.body.appendChild(notificacion);
        
        // Remover después de 3 segundos
        setTimeout(() => {
            notificacion.style.animation = 'slideOutRight 0.3s ease-out';
            setTimeout(() => {
                document.body.removeChild(notificacion);
            }, 300);
        }, 3000);
    }

    // Agregar estilos CSS para las animaciones
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideInRight {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
        @keyframes slideOutRight {
            from { transform: translateX(0); opacity: 1; }
            to { transform: translateX(100%); opacity: 0; }
        }
    `;
    document.head.appendChild(style);

    // Validación en tiempo real
    const cedulaInput = document.getElementById('cedula');
    cedulaInput.addEventListener('input', function() {
        // Solo permitir números
        this.value = this.value.replace(/[^0-9]/g, '');
        
        // Limitar a 10 dígitos
        if (this.value.length > 10) {
            this.value = this.value.slice(0, 10);
        }
    });

    // Limpiar formulario después de generar PDF
    generarPDFBtn.addEventListener('click', function() {
        setTimeout(() => {
            form.reset();
            resultadoDiv.style.display = 'none';
            certificadoData = null;
        }, 1000);
    });
});
