"""
RAG sobre PDF con LangGraph
===========================
Prueba tecnica - Modulo de IA (seccion 6)

Flujo de 5 pasos:
  1. Lectura del PDF (pypdf via PyPDFLoader, texto por pagina)
  2. Division en fragmentos con superposicion (chunking + overlap)
  3. Vectorizacion: embeddings de cada fragmento en un indice FAISS
  4. Orquestacion con LangGraph: grafo de 2 nodos (retrieve -> generate)
  5. Interfaz de consola: bucle interactivo de preguntas/respuestas
     indicando la(s) pagina(s) fuente.

Uso:
    python rag_pdf_langgraph.py [ruta_al_pdf]
    (por defecto usa manual_politicas_internas.pdf)
"""

import os
import sys
from typing import List, TypedDict

from dotenv import load_dotenv
from langchain_community.document_loaders import PyPDFLoader
from langchain_community.vectorstores import FAISS
from langchain_core.documents import Document
from langchain_google_genai import ChatGoogleGenerativeAI, GoogleGenerativeAIEmbeddings
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langgraph.graph import END, START, StateGraph

# ----------------------------------------------------------------------
# Configuracion
# ----------------------------------------------------------------------
PDF_POR_DEFECTO = "manual_politicas_internas.pdf"
CHUNK_SIZE = 800        # tamano de cada fragmento (caracteres)
CHUNK_OVERLAP = 150     # superposicion entre fragmentos consecutivos
K_FRAGMENTOS = 4        # cuantos fragmentos recuperar por pregunta
MODELO_LLM = "gemini-2.5-flash"
MODELO_EMBEDDINGS = "models/gemini-embedding-001"


# ----------------------------------------------------------------------
# Paso 1: Lectura del PDF (texto por pagina)
# ----------------------------------------------------------------------
def cargar_pdf(ruta_pdf: str) -> List[Document]:
    """Extrae el texto del PDF; cada Document conserva su numero de pagina
    en metadata['page'] (indexado desde 0)."""
    if not os.path.exists(ruta_pdf):
        print(f"[ERROR] No se encontro el archivo: {ruta_pdf}")
        sys.exit(1)

    print(f"[1/3] Leyendo PDF: {ruta_pdf}")
    paginas = PyPDFLoader(ruta_pdf).load()
    print(f"      -> {len(paginas)} paginas extraidas")
    return paginas


# ----------------------------------------------------------------------
# Paso 2: Division en fragmentos con superposicion
# ----------------------------------------------------------------------
def dividir_en_fragmentos(paginas: List[Document]) -> List[Document]:
    """Divide el texto en chunks manejables. El overlap evita que una idea
    quede cortada justo en el limite entre dos fragmentos."""
    splitter = RecursiveCharacterTextSplitter(
        chunk_size=CHUNK_SIZE,
        chunk_overlap=CHUNK_OVERLAP,
        separators=["\n\n", "\n", ". ", " ", ""],
    )
    fragmentos = splitter.split_documents(paginas)
    print(f"[2/3] Texto dividido en {len(fragmentos)} fragmentos "
          f"(chunk_size={CHUNK_SIZE}, overlap={CHUNK_OVERLAP})")
    return fragmentos


# ----------------------------------------------------------------------
# Paso 3: Vectorizacion en indice FAISS
# ----------------------------------------------------------------------
def crear_indice(fragmentos: List[Document]) -> FAISS:
    """Genera el embedding de cada fragmento y lo guarda en un indice
    vectorial FAISS en memoria, listo para busqueda semantica."""
    print("[3/3] Generando embeddings y construyendo el indice FAISS...")
    embeddings = GoogleGenerativeAIEmbeddings(model=MODELO_EMBEDDINGS)
    indice = FAISS.from_documents(fragmentos, embeddings)
    print("      -> Indice vectorial listo\n")
    return indice


# ----------------------------------------------------------------------
# Paso 4: Grafo LangGraph con dos nodos: retrieve -> generate
# ----------------------------------------------------------------------
class EstadoRAG(TypedDict):
    """Estado compartido que fluye por el grafo."""
    pregunta: str
    fragmentos: List[Document]
    respuesta: str


def construir_grafo(indice: FAISS):
    llm = ChatGoogleGenerativeAI(model=MODELO_LLM, temperature=0)

    def retrieve(estado: EstadoRAG) -> dict:
        """Nodo 1: busqueda semantica de los fragmentos mas relevantes."""
        encontrados = indice.similarity_search(estado["pregunta"], k=K_FRAGMENTOS)
        return {"fragmentos": encontrados}

    def generate(estado: EstadoRAG) -> dict:
        """Nodo 2: el LLM redacta la respuesta usando SOLO el contexto
        recuperado, citando la pagina de cada fragmento."""
        contexto = "\n\n".join(
            f"[Pagina {frag.metadata.get('page', 0) + 1}]\n{frag.page_content}"
            for frag in estado["fragmentos"]
        )
        prompt = (
            "Eres un asistente que responde preguntas sobre un documento PDF.\n"
            "Responde UNICAMENTE con la informacion del contexto. Si la "
            "respuesta no esta en el contexto, di que el documento no lo "
            "menciona. Indica siempre la(s) pagina(s) fuente al final, en el "
            "formato: (Fuente: pagina N).\n\n"
            f"Contexto:\n{contexto}\n\n"
            f"Pregunta: {estado['pregunta']}\n\nRespuesta:"
        )
        salida = llm.invoke(prompt)
        return {"respuesta": salida.content}

    grafo = StateGraph(EstadoRAG)
    grafo.add_node("retrieve", retrieve)
    grafo.add_node("generate", generate)
    grafo.add_edge(START, "retrieve")
    grafo.add_edge("retrieve", "generate")
    grafo.add_edge("generate", END)
    return grafo.compile()


# ----------------------------------------------------------------------
# Paso 5: Interfaz de consola
# ----------------------------------------------------------------------
def bucle_consola(app) -> None:
    print("=" * 60)
    print(" Consulta el PDF en lenguaje natural")
    print(" (escribe 'salir' para terminar)")
    print("=" * 60)

    while True:
        try:
            pregunta = input("\nPregunta> ").strip()
        except (KeyboardInterrupt, EOFError):
            print("\nHasta luego.")
            break

        if not pregunta:
            continue
        if pregunta.lower() in {"salir", "exit", "quit"}:
            print("Hasta luego.")
            break

        resultado = app.invoke({"pregunta": pregunta})
        paginas = sorted({f.metadata.get("page", 0) + 1 for f in resultado["fragmentos"]})

        print("\nRespuesta:")
        print(resultado["respuesta"])
        print(f"\n[Fragmentos recuperados de las paginas: {paginas}]")


def main() -> None:
    load_dotenv()
    if not os.getenv("GOOGLE_API_KEY"):
        print("[ERROR] Falta GOOGLE_API_KEY. Crea un archivo .env con:")
        print("        GOOGLE_API_KEY=AIza...")
        sys.exit(1)

    ruta_pdf = sys.argv[1] if len(sys.argv) > 1 else PDF_POR_DEFECTO

    paginas = cargar_pdf(ruta_pdf)          # Paso 1
    fragmentos = dividir_en_fragmentos(paginas)  # Paso 2
    indice = crear_indice(fragmentos)       # Paso 3
    app = construir_grafo(indice)           # Paso 4
    bucle_consola(app)                      # Paso 5


if __name__ == "__main__":
    main()
