# Módulo de IA — RAG sobre PDF con LangGraph

Script de consola que implementa un flujo **RAG (Retrieval-Augmented Generation)** para
consultar el contenido de un documento PDF en lenguaje natural. Utiliza **LangGraph** para
orquestar la recuperación y la generación, y **Google Gemini** como proveedor de embeddings
y modelo de lenguaje.

## Flujo de 5 pasos

1. **Lectura del PDF** — extracción del texto por página con `PyPDFLoader` (pypdf).
2. **División en fragmentos (chunking)** — `RecursiveCharacterTextSplitter` con
   superposición (overlap) para no cortar ideas entre fragmentos.
3. **Vectorización** — embeddings de cada fragmento almacenados en un índice **FAISS**.
4. **Orquestación con LangGraph** — grafo de dos nodos: `retrieve` (búsqueda semántica) →
   `generate` (respuesta del LLM usando solo el contexto recuperado).
5. **Interfaz de consola** — bucle interactivo de preguntas/respuestas que indica la(s)
   página(s) fuente.

## Requisitos

- Python 3.10+
- Una API key de **Google Gemini** (nivel gratuito válido).
  Se obtiene en: https://aistudio.google.com/apikey

## Instalación

```bash
cd ia-script

# 1. Entorno virtual (aísla las dependencias)
python3 -m venv venv
source venv/bin/activate          # En Windows: venv\Scripts\activate

# 2. Dependencias
pip install -r requirements.txt

# 3. API key en un archivo .env (NO se sube a git)
echo "GOOGLE_API_KEY=AIza...tu_key..." > .env
```

## Ejecución

```bash
python rag_pdf_langgraph.py
```

Por defecto usa `manual_politicas_internas.pdf` (incluido). Para consultar otro PDF:

```bash
python rag_pdf_langgraph.py ruta/a/otro_documento.pdf
```

Escriba sus preguntas en el prompt `Pregunta>`. Para terminar: `salir`.

### Ejemplo de sesión

```
Pregunta> ¿Cuántos días de vacaciones tienen los empleados?
Respuesta:
Todo colaborador con contrato indefinido tiene derecho a 15 días calendario
de vacaciones remuneradas por cada año completo de servicio. (Fuente: Pagina 1)

[Fragmentos recuperados de las paginas: [1, 2]]
```

## Configuración

Parámetros ajustables al inicio del script (`rag_pdf_langgraph.py`):

| Constante | Valor | Descripción |
|-----------|-------|-------------|
| `CHUNK_SIZE` | 800 | Tamaño de cada fragmento (caracteres) |
| `CHUNK_OVERLAP` | 150 | Superposición entre fragmentos consecutivos |
| `K_FRAGMENTOS` | 4 | Fragmentos recuperados por pregunta |
| `MODELO_LLM` | gemini-2.5-flash | Modelo de generación |
| `MODELO_EMBEDDINGS` | models/gemini-embedding-001 | Modelo de embeddings |

## Notas

- El script responde **únicamente** con información del PDF; si la respuesta no está en el
  documento, lo indica explícitamente (RAG "anclado" a la fuente).
- Puede adaptarse fácilmente a otro proveedor (OpenAI, Ollama local) cambiando las clases
  de `embeddings` y `llm`, sin alterar el flujo del grafo.
