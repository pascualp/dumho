import React, { useRef } from 'react';
import { Download } from 'lucide-react';

export function Manual() {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-0 print:hidden">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Manual de Usuario</h1>
          <p className="text-slate-500 max-w-sm">Guía de uso de la plataforma.</p>
        </div>
        <button 
          onClick={handlePrint}
          className="flex items-center gap-2 bg-slate-900 text-white w-full sm:w-auto justify-center px-4 py-2 rounded-lg hover:bg-slate-800 transition-colors"
        >
          <Download className="w-5 h-5" /> Descargar PDF
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden print:shadow-none print:border-none printable-content">
        <div className="p-8 space-y-8 max-w-4xl mx-auto prose prose-slate">
          
          <div className="text-center pb-8 border-b border-slate-100">
            <h1 className="text-4xl font-bold text-slate-900 mb-2">Dumoh Gestión Logística</h1>
            <p className="text-xl text-slate-500">Manual de Usuario</p>
          </div>

          <div>
            <p className="text-slate-700 leading-relaxed mb-8">
              Bienvenido al sistema de Gestión Logística Dumoh. Este manual le guiará paso a paso en el uso de la aplicación para gestionar repartidores, materiales, entregas e incidencias.
            </p>
          </div>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
              <span className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-sm">1</span>
              Acceso al Sistema (Login)
            </h2>
            <div className="pl-10 space-y-2 text-slate-700">
              <p>Para usar el sistema, debe iniciar sesión.</p>
              <ol className="list-decimal pl-5 space-y-1">
                <li>Ingrese a la URL de la aplicación.</li>
                <li>Accederá a la pantalla de <strong>Login</strong>.</li>
                <li>Ingrese su <strong>Correo electrónico</strong> y <strong>Contraseña</strong>.</li>
                <li>Haga clic en el botón de entrar.</li>
                <li><em>Nota:</em> Si la cuenta no existe en este entorno de prueba, el sistema registrará automáticamente su correo para que pueda probar la plataforma.</li>
              </ol>
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
              <span className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-sm">2</span>
              Panel Principal (Dashboard)
            </h2>
            <div className="pl-10 space-y-2 text-slate-700">
              <p>Una vez iniciada la sesión, será redirigido al <strong>Dashboard</strong> o Panel de Control. En esta pantalla principal podrá tener un resumen en tiempo real del estado de su logística:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li><strong>Repartidores Activos:</strong> Cantidad de repartidores trabajando actualmente.</li>
                <li><strong>Materiales Asignados:</strong> Qué cantidad del inventario total está actualmente en manos de los repartidores.</li>
                <li><strong>Entregas Activas:</strong> Documentos de entrega en curso.</li>
                <li><strong>Incidencias Abiertas:</strong> Problemas pendientes de resolución (pérdidas, roturas).</li>
                <li><strong>Valor Total Asignado:</strong> Valor monetario de todo el equipo y material circulante.</li>
              </ul>
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
               <span className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-sm">3</span>
              Gestión de Repartidores
            </h2>
            <div className="pl-10 space-y-2 text-slate-700">
              <p>Para acceder, haga clic en la pestaña <strong>Repartidores</strong> en el menú lateral. Esta sección permite registrar y mantener la base de datos de su personal de reparto.</p>
              <h3 className="font-semibold text-slate-900 mt-4">Crear o Editar un Repartidor:</h3>
              <ol className="list-decimal pl-5 space-y-1">
                <li>Haga clic en el botón <strong>+ Nuevo Repartidor</strong> o en el <strong>icono de lápiz</strong> junto a un repartidor existente.</li>
                <li>Se abrirá una ventana donde deberá ingresar o corregir los datos (Nombre, Apellidos, DNI/NIE, etc.).</li>
                <li>Haga clic en <strong>Guardar Repartidor</strong>. Los cambios aparecerán en la lista de forma inmediata.</li>
              </ol>
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
               <span className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-sm">4</span>
              Gestión de Materiales
            </h2>
            <div className="pl-10 space-y-2 text-slate-700">
              <p>Diríjase a la sección <strong>Materiales</strong> en el menú lateral. Aquí podrá controlar el inventario de elementos que se entregan a los repartidores (ej. uniformes, terminales PDA, bolsas térmicas, etc.).</p>
              <h3 className="font-semibold text-slate-900 mt-4">Añadir nuevo Material:</h3>
              <ol className="list-decimal pl-5 space-y-1">
                <li>Haga clic en <strong>+ Nuevo Material</strong>.</li>
                <li>Complete el formulario con los detalles del material, incluyendo su stock inicial y valor de reposición.</li>
                <li>Pulse <strong>Guardar Material</strong>. El sistema actualizará el stock disponible automáticamente cuando realice entregas.</li>
              </ol>
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
               <span className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-sm">5</span>
              Registro de Entregas
            </h2>
            <div className="pl-10 space-y-2 text-slate-700">
              <p>En la sección <strong>Entregas</strong> podrá registrar qué materiales se han proporcionado a qué repartidor.</p>
              <h3 className="font-semibold text-slate-900 mt-4">Registrar una Entrega:</h3>
              <ol className="list-decimal pl-5 space-y-1">
                <li>Haga clic en <strong>+ Nueva Entrega</strong>.</li>
                <li>Seleccione el repartidor al que le va a entregar el material e indique la fecha.</li>
                <li>Pulse <strong>Crear Registro de Entrega</strong> para dejar constancia de la salida del inventario.</li>
              </ol>
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
               <span className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-sm">6</span>
              Gestión de Incidencias
            </h2>
            <div className="pl-10 space-y-2 text-slate-700">
              <p>En la sección <strong>Incidencias</strong> se reportan problemas con los materiales, como daños, robos o pérdidas.</p>
              <h3 className="font-semibold text-slate-900 mt-4">Crear una Incidencia:</h3>
              <ol className="list-decimal pl-5 space-y-1">
                <li>Haga clic en <strong>+ Nueva Incidencia</strong>.</li>
                <li>Complete la información sobre el repartidor involucrado, el material afectado, el tipo (daño/pérdida/robo) y observe los detalles.</li>
                <li>Pulse <strong>Guardar Incidencia</strong>. Esto permite hacer seguimiento para reponer el material.</li>
              </ol>
            </div>
          </section>

        </div>
      </div>
      
      {/* Estilos para impresión */}
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .printable-content, .printable-content * {
            visibility: visible;
          }
          .printable-content {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
          @page {
            margin: 2cm;
          }
        }
      `}</style>
    </div>
  );
}
