#!/usr/bin/env bash
# ============================================================
#  iniciar.sh - Levanta backend y frontend de la prueba
#  Uso:  ./iniciar.sh
#  Detener: Ctrl+C (cierra ambos procesos)
# ============================================================

set -e

RAIZ="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PUERTO_FRONT=4201

# Colores para los mensajes
AZUL='\033[0;34m'; VERDE='\033[0;32m'; AMARILLO='\033[1;33m'; ROJO='\033[0;31m'; SIN='\033[0m'

echo -e "${AZUL}============================================${SIN}"
echo -e "${AZUL} Prueba Tecnica - Arranque de la aplicacion${SIN}"
echo -e "${AZUL}============================================${SIN}"

# --- 1. Verificar MySQL ---
echo -ne "\n[1/3] Verificando MySQL... "
if systemctl is-active --quiet mysql; then
  echo -e "${VERDE}OK (en ejecucion)${SIN}"
else
  echo -e "${AMARILLO}no esta corriendo${SIN}"
  echo -e "      Intente: ${AMARILLO}sudo systemctl start mysql${SIN}"
  exit 1
fi

# --- Funcion de limpieza: al salir, mata ambos procesos ---
PIDS=()
limpiar() {
  echo -e "\n${AMARILLO}Deteniendo procesos...${SIN}"
  for pid in "${PIDS[@]}"; do
    kill "$pid" 2>/dev/null || true
  done
  echo -e "${VERDE}Listo. Aplicacion detenida.${SIN}"
  exit 0
}
trap limpiar INT TERM

# --- 2. Backend ---
echo -e "\n[2/3] Iniciando backend (Spring Boot) en el puerto 8080..."
cd "$RAIZ/backend"
./mvnw spring-boot:run > "$RAIZ/backend.log" 2>&1 &
PIDS+=($!)
echo -e "      Log: ${AZUL}$RAIZ/backend.log${SIN}"

# Esperar a que el backend responda
echo -ne "      Esperando a que el backend arranque"
for i in {1..60}; do
  if curl -s http://localhost:8080/swagger-ui.html > /dev/null 2>&1; then
    echo -e " ${VERDE}OK${SIN}"
    break
  fi
  echo -n "."
  sleep 2
  if [ "$i" -eq 60 ]; then
    echo -e " ${ROJO}tardo demasiado${SIN}"
    echo -e "      Revise $RAIZ/backend.log"
    limpiar
  fi
done

# --- 3. Frontend ---
echo -e "\n[3/3] Iniciando frontend (Angular) en el puerto $PUERTO_FRONT..."
cd "$RAIZ/frontend"
ng serve --port "$PUERTO_FRONT" > "$RAIZ/frontend.log" 2>&1 &
PIDS+=($!)
echo -e "      Log: ${AZUL}$RAIZ/frontend.log${SIN}"

echo -ne "      Esperando a que el frontend compile"
for i in {1..60}; do
  if curl -s "http://localhost:$PUERTO_FRONT" > /dev/null 2>&1; then
    echo -e " ${VERDE}OK${SIN}"
    break
  fi
  echo -n "."
  sleep 2
done

# --- Resumen ---
echo -e "\n${VERDE}============================================${SIN}"
echo -e "${VERDE} Aplicacion lista${SIN}"
echo -e "${VERDE}============================================${SIN}"
echo -e "  Frontend:  ${AZUL}http://localhost:$PUERTO_FRONT${SIN}"
echo -e "  API:       ${AZUL}http://localhost:8080${SIN}"
echo -e "  Swagger:   ${AZUL}http://localhost:8080/swagger-ui.html${SIN}"
echo -e "\n  ${AMARILLO}Presione Ctrl+C para detener todo.${SIN}\n"

# Mantener el script vivo mientras corren los procesos
wait
