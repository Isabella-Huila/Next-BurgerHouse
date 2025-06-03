

# 🍔 Burger House

**Autores:**

* Leidy Daniela Londoño Candelo - A00392917
* Isabella Huila Cerón - A00394751

## 📌 Descripción del Proyecto

**Burger House** es una plataforma web desarrollada con el fin de mejorar la gestión de pedidos en un restaurante especializado en hamburguesas. El objetivo principal es ofrecer una experiencia de usuario fluida, reducir errores en la comunicación y mejorar los tiempos de atención al cliente.

Con esta aplicación, los clientes pueden explorar el menú, personalizar sus pedidos, realizar órdenes fácilmente y hacer seguimiento en tiempo real. Por su parte, los administradores pueden gestionar productos, toppings, usuarios y generar reportes.

---

## 🔐 Autenticación y Autorización

* Registro de nuevos usuarios.
* Inicio y cierre de sesión con credenciales.
* Pantalla diferenciada para login y registro.
* Acceso según el rol del usuario (cliente, administrador, delivery).

### 👤 Roles

* **Administrador:** Gestión de usuarios, productos, toppings y acceso a reportes.
* **Cliente:** Visualización del menú, gestión de carrito, creación de órdenes.
* **Delivery:** Solo visualiza las órdenes asignadas.

---

## 📦 Gestión del Menú

### 🧾 Productos

* Crear, editar y eliminar productos del menú (hamburguesas, bebidas, acompañamientos).
* Validaciones de campos en el cliente.
* Vista previa de imagen si la URL es válida.
* Manejo de errores por campo.

### 🧂 Toppings

* Crear, editar y eliminar toppings.
* Validaciones locales y control de errores globales.
* Vista previa e interacción fluida.

---

## 🛒 Carrito de Compras

* Disponible solo para clientes y administradores.
* Permite agregar productos y eliminar elementos del carrito.
* Si el carrito está vacío, no se muestra la interfaz.

---

## 📄 Reportes

Solo accesible para el usuario administrador:

* Generación de reportes en formato PDF: diario, semanal y mensual.
* Visualización previa del PDF antes de la descarga.

---

## 📋 Gestión de Órdenes

* Los clientes pueden realizar órdenes a partir del carrito.
* Posibilidad de añadir toppings y personalizar la orden.
* Ingreso de dirección para el domicilio.
* Confirmación de pago y visualización del resumen final.

---

## ✅ Validaciones

* Validaciones en formularios antes del envío.
* Mensajes de error visibles y claros por cada campo.
* Validación de imágenes mediante URL con vista previa.
* Control de errores integrados con Redux Toolkit.

---

## 🧪 Usuario de Prueba

Puedes iniciar sesión con el siguiente usuario administrador de prueba:

```
Correo: leidy@gmail.com  
Contraseña: 123Leidy
```

---

## 🛠️ Tecnologías Utilizadas

* **Next.js** (App cliente)
* **Redux Toolkit** (Gestión del estado)
* **Tailwind CSS** (Estilos)
* **PDF Generation** (Reportes)
* **Autenticación y manejo de roles**
