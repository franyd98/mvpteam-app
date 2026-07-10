#!/bin/bash
# Wrapper para launchd — sube vídeos a YouTube cada día
# Instalado en ~/Library/LaunchAgents/com.proyectoweb.upload-videos.plist

# PATH completo por si launchd no lo hereda
export PATH="/opt/homebrew/bin:/usr/local/bin:/usr/bin:/bin:$PATH"

SCRIPT_DIR="/Users/fran/Documents/ProyectoAPPWEB/scripts"
LOG="$SCRIPT_DIR/upload_launchd.log"

echo "" >> "$LOG"
echo "======================================" >> "$LOG"
echo "$(date '+%Y-%m-%d %H:%M:%S') — Iniciando subida" >> "$LOG"

cd "$SCRIPT_DIR" || exit 1

# Comprobar disco
if [ ! -d "/Volumes/Nuevo vol" ]; then
    echo "$(date '+%H:%M:%S') ❌ Disco no encontrado en /Volumes/Nuevo vol — saltando hoy" >> "$LOG"
    exit 0
fi

echo "$(date '+%H:%M:%S') ✅ Disco encontrado. Lanzando script..." >> "$LOG"

# Ejecutar el script de subida con límite de 13 vídeos
python3 "$SCRIPT_DIR/upload_youtube_playwright.py" \
    --disco "/Volumes/Nuevo vol" \
    --max-videos 13 >> "$LOG" 2>&1

echo "$(date '+%H:%M:%S') — Subida finalizada" >> "$LOG"
