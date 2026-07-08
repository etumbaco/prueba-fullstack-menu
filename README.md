# Prueba Técnica Full Stack — CRUD de Módulos y Roles con Menú Recursivo + Módulo de IA (RAG)

Aplicación de administración de **Módulos** y **Roles** cuyo elemento central es un
**menú de navegación recursivo** (árbol de N niveles) que se construye a partir de los
módulos configurados en el backend y se filtra según un rol seleccionado por el usuario
(sin login ni autenticación). Incluye además un **script de IA (RAG)** independiente que
permite consultar un documento PDF por consola.

## Stack tecnológico

| Capa | Tecnología |
|------|-----------|
| Backend | Java 17 (LTS), Spring Boot 3.5.16, Spring Data JPA, Hibernate |
| Base de datos | MySQL 8 |
| Documentación API | OpenAPI / Swagger (springdoc-openapi 2.x) |
| Frontend | Angular 21 (standalone components), PrimeNG (tema Aura), SCSS |
| Formularios / Estado | Reactive Forms + FormBuilder, Signals |
| Módulo IA | Python 3.10, LangGraph, LangChain, FAISS, Google Gemini |

> **Nota sobre la versión de Java:** el enunciado sugiere Java 21, pero se utilizó
> **Java 17 (LTS)** según lo confirmado con el evaluador. El proyecto es compatible con
> Java 21 sin cambios (basta con actualizar `<java.version>` en el `pom.xml`).

## Estructura del repositorio

```
prueba-tecnica/
├── backend/          # API REST Spring Boot
├── frontend/         # Aplicación Angular 21 + PrimeNG
├── ia-script/        # Script Python RAG con LangGraph
├── sql/
│   └── init.sql      # Script de creación de tablas y datos de ejemplo
└── README.md
```

---

## 1. Base de datos (MySQL 8)

### 1.1 Crear el usuario de la aplicación

La aplicación se conecta con un usuario dedicado con privilegios acotados a la base
`menu_db` (principio de mínimo privilegio). Conéctese como administrador de MySQL y ejecute:

```sql
CREATE USER IF NOT EXISTS 'menu_app'@'localhost' IDENTIFIED BY 'MenuApp2026!';
GRANT ALL PRIVILEGES ON menu_db.* TO 'menu_app'@'localhost';
FLUSH PRIVILEGES;
```

> Si prefiere otras credenciales, ajústelas también en
> `backend/src/main/resources/application.properties`.

### 1.2 Ejecutar el script inicial

El script crea la base `menu_db`, las tablas y los datos de ejemplo
(4 roles y 10 módulos en 3 niveles de anidamiento):

```bash
mysql -u <usuario_admin> -p < sql/init.sql
```

### 1.3 Modelo de datos

- **`rol`** — perfiles del sistema (Administrador, Supervisor, Colaborador, Invitado).
- **`modulo`** — unidades de navegación con **autorreferencia** padre-hijo
  (`id_modulo_padre` → `modulo.id`, `NULL` = módulo raíz).
- **`modulo_rol`** — tabla intermedia **N a N** con clave primaria compuesta
  `(id_modulo, id_rol)`.

---

## 2. Backend (Spring Boot)

### 2.1 Requisitos

- JDK 17
- Maven (o el wrapper `mvnw` incluido)
- MySQL 8 en ejecución con la base ya creada (paso 1)

### 2.2 Ejecutar

```bash
cd backend
./mvnw spring-boot:run
```

La API queda disponible en `http://localhost:8080`.

### 2.3 Documentación (Swagger UI)

Con la aplicación en ejecución:

```
http://localhost:8080/swagger-ui.html
```

### 2.4 Endpoints principales

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/menu?rolId={id}` | Árbol de módulos filtrado por rol |
| GET/POST/PUT/DELETE | `/api/modulos` | CRUD de módulos |
| POST | `/api/modulos/{id}/roles` | Asignar roles a un módulo |
| GET/POST/PUT/DELETE | `/api/roles` | CRUD de roles |

---

## 3. Frontend (Angular 21 + PrimeNG)

### 3.1 Requisitos

- Node.js 20.19+ (o 22.12+)
- Angular CLI 21

### 3.2 Instalar dependencias

```bash
cd frontend
npm install
```

### 3.3 Ejecutar

```bash
ng serve --port 4201
```

La aplicación queda disponible en `http://localhost:4201`.

> **Puerto 4201:** se usa 4201 en lugar del 4200 por defecto. El backend ya autoriza
> ambos orígenes vía CORS (`WebConfig.java`). Si ejecuta en 4200, funcionará igual.

### 3.4 Uso

1. Seleccione un **rol** en el desplegable superior derecho → el menú lateral se
   construye recursivamente con los módulos permitidos para ese rol.
2. Navegue a **Administración → Roles** o **Administración → Módulos** para el CRUD.
3. En Módulos puede asignar el módulo padre y los roles permitidos; los cambios se
   reflejan de inmediato en el menú al reseleccionar el rol.

---

## 4. Módulo de IA — Script RAG (Python + LangGraph)

Script independiente que vectoriza un PDF y responde preguntas por consola indicando la
página fuente. Ver instrucciones detalladas en `ia-script/README.md`.

### Resumen rápido

```bash
cd ia-script
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# Configurar la API key de Google Gemini
echo "GOOGLE_API_KEY=AIza..." > .env

python rag_pdf_langgraph.py
```

---

## 5. Supuestos asumidos

Conforme a la sección 9 del enunciado (resolver dudas con la interpretación más simple
y documentarla):

- **Java 17** en lugar de 21 (confirmado con el evaluador; compatible con 21).
- **Eliminación en cascada:** al borrar un módulo padre se eliminan sus submódulos
  (`ON DELETE CASCADE`), interpretación más simple y coherente con un árbol de navegación.
- **Asignación de roles:** el endpoint `POST /api/modulos/{id}/roles` **reemplaza** el
  conjunto de roles del módulo (no acumula).
- **Árbol construido en memoria** (no con CTE recursivo de SQL), dado el bajo volumen de
  nodos de un menú; ver justificación en el documento de defensa.
- **Proveedor de IA:** se usó Google Gemini (nivel gratuito) en lugar de OpenAI.

---

## 6. Buenas prácticas aplicadas

- Arquitectura por capas: Controller → Service → Repository (sin lógica de negocio en
  los controladores).
- DTOs (Java records) para no exponer entidades JPA.
- Inyección de dependencias por constructor.
- Validación con Jakarta Bean Validation (`@NotBlank`, `@NotNull`, `@Size`).
- Manejo centralizado de errores con `@RestControllerAdvice`.
- Transacciones de solo lectura (`@Transactional(readOnly = true)`) en consultas.
- Validación anti-ciclos en la jerarquía de módulos (backend) + prevención en la UI.
- Credenciales sensibles fuera del control de versiones (`.env` en `.gitignore`).
