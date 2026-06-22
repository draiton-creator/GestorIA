# GestorIA

GestorIA es una plataforma SaaS de gestión empresarial con inteligencia artificial orientada a autónomos, pymes y equipos profesionales. Centraliza finanzas, facturación, operaciones, CRM, tareas, proyectos e inteligencia de negocio en una única aplicación web.

Proyecto creado por **EC-Innova**.

## Objetivo del proyecto

GestorIA busca reducir la carga administrativa diaria y ayudar a las empresas a tomar mejores decisiones mediante automatización, análisis de datos y asistentes de IA especializados en gestión empresarial.

## Funcionalidades principales

- **Gestión financiera:** facturas, gastos, previsiones y análisis de tesorería.
- **OCR y análisis de documentos:** extracción asistida de datos de tickets, facturas y justificantes.
- **CRM:** gestión de contactos, clientes y oportunidades.
- **Operaciones:** proyectos, tareas, hitos e informes ejecutivos.
- **Asistente IA:** apoyo en consultas empresariales, marketing, SEO, fiscalidad y planificación.
- **Persistencia segura:** Firebase Authentication y Firestore con reglas de propiedad por usuario.
- **Backend protegido:** endpoint de IA autenticado con Firebase ID Token y límites de uso.

## Stack tecnológico

- React
- TypeScript
- Vite
- Express
- Firebase Authentication
- Cloud Firestore
- Google Gemini API
- Tailwind CSS

## Requisitos

- Node.js 20+
- Proyecto Firebase configurado con Authentication y Firestore
- API key de Gemini configurada en entorno seguro

## Configuración local

1. Instala dependencias:
   ```bash
   npm install
   ```

2. Crea un archivo `.env.local` a partir de `.env.example` y completa las variables necesarias:
   ```bash
   cp .env.example .env.local
   ```

3. Arranca el entorno de desarrollo:
   ```bash
   npm run dev
   ```

4. Abre la aplicación en:
   ```text
   http://localhost:3000
   ```

## Scripts disponibles

- `npm run dev`: inicia el servidor Express con Vite en modo desarrollo.
- `npm run build`: genera el build de producción del frontend y backend.
- `npm run start`: ejecuta el servidor de producción desde `dist/server.cjs`.
- `npm run typecheck`: valida el proyecto con TypeScript.
- `npm run test`: ejecuta las pruebas automatizadas.

## Seguridad

- Las claves privadas deben mantenerse fuera del repositorio.
- `.env.local` está ignorado por Git.
- El endpoint `/api/gemini` requiere autenticación mediante Firebase.
- Las reglas de Firestore exigen acceso por propietario (`ownerId`).

## Producción

La rama de producción estable del proyecto será:

```text
V1
```

## Autoría

Desarrollado por **EC-Innova**.
