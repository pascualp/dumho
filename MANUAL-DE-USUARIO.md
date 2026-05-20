# Manual de Usuario - Dumoh Gestión Logística

Bienvenido al sistema de Gestión Logística Dumoh. Este manual le guiará paso a paso en el uso de la aplicación para gestionar repartidores, materiales, entregas e incidencias.

---

## 1. Acceso al Sistema (Login)

Para usar el sistema, debe iniciar sesión.
1. Ingrese a la URL de la aplicación.
2. Accederá a la pantalla de **Login**.
3. Ingrese su **Correo electrónico** y **Contraseña**.
4. Haga clic en **Mandar**.
5. *Nota:* Si la cuenta no existe, en este entorno de prueba el sistema registrará automáticamente su correo para que pueda probar la plataforma.

---

## 2. Panel Principal (Dashboard)

Una vez iniciada la sesión, será redirigido al **Dashboard** o Panel de Control.
En esta pantalla principal podrá tener un resumen en tiempo real del estado de su logística:
- **Repartidores Activos:** Cantidad de repartidores trabajando actualmente.
- **Materiales Asignados:** Qué cantidad del inventario total está actualmente en manos de los repartidores.
- **Entregas Activas:** Documentos de entrega en curso.
- **Incidencias Abiertas:** Problemas pendientes de resolución (pérdidas, roturas).
- **Valor Total Asignado:** Valor monetario de todo el equipo y material circulante.

---

## 3. Gestión de Repartidores

Para acceder, haga clic en la pestaña **Repartidores** en el menú lateral.
Esta sección permite registrar y mantener la base de datos de su personal de reparto.

### Crear un nuevo Repartidor:
1. Haga clic en el botón **+ Nuevo Repartidor**.
2. Se abrirá una ventana donde deberá ingresar los datos:
   - Nombre
   - Apellidos
   - DNI / NIE
   - Teléfono
   - Email
   - Zona habitual de reparto
   - Observaciones
3. Haga clic en **Guardar Repartidor**. El nuevo repartidor aparecerá en la lista de forma inmediata.

---

## 4. Gestión de Materiales

Diríjase a la sección **Materiales** en el menú lateral.
Aquí podrá controlar el inventario de elementos que se entregan a los repartidores (ej. uniformes, terminales PDA, bolsas térmicas, etc.).

### Añadir nuevo Material:
1. Haga clic en **+ Nuevo Material**.
2. Complete el formulario con:
   - **Nombre del Material:** (Ej. Mochila Térmica).
   - **Categoría:** Tipo de producto.
   - **Requiere Devolución:** Si el repartidor debe devolverlo o no.
   - **Valor de Reposición (€):** Costo aproximado en caso de pérdida o rotura.
   - **Stock Inicial:** Cuántas unidades hay disponibles.
3. Pulse **Guardar Material**.
El sistema calculará y actualizará el stock disponible automáticamente cuando realice entregas.

---

## 5. Registro de Entregas

En la sección **Entregas** podrá registrar qué materiales se han proporcionado a qué repartidor.

### Registrar una Entrega:
1. Haga clic en **+ Nueva Entrega**.
2. Rellene los detalles iniciales:
   - **Repartidor:** Seleccione el repartidor al que le va a entregar el material. (El sistema cargará la lista de repartidores activos).
   - **Fecha de Entrega**
   - **Ruta/Zona**
   - **Observaciones**
3. Pulse **Crear Registro de Entrega**.
4. *(A implementar próximamente en la UI):* Una vez abierta la entrega, se le asignarán los materiales específicos (Mochilas, Datáfonos, etc.) y las cantidades correspondientes para deducir del Stock.

---

## 6. Gestión de Incidencias

En la sección **Incidencias** se reportan problemas con los materiales, como daños, robos o pérdidas.

### Crear una Incidencia:
1. Haga clic en **+ Nueva Incidencia**.
2. Complete la información necesaria:
   - **Repartidor:** Quién reporta o sufre la incidencia.
   - **Material afectado:** Qué material se ha dañado/perdido.
   - **Tipo de Incidencia:** Puede ser Daño, Pérdida o Robo.
   - **Cantidades y Observaciones** sobre lo ocurrido.
3. Pulse **Guardar Incidencia**.
Esta acción permite hacer un seguimiento para reponer el material y controlar posibles abusos.

---

## Cerrar Sesión
Para salir de manera segura del sistema, haga clic en el botón de **Cerrar sesión** ubicado en la parte inferior izquierda del menú lateral.
