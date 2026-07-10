#!/usr/bin/env python3
"""
upload_videos_drive.py
======================
Sube videos de ejercicios a Google Drive como "Cualquiera con el enlace
puede ver". Sin límites diarios de subida.

Uso:
    python3 upload_videos_youtube.py \\
        --disco   "/Volumes/Nuevo vol" \\
        --secrets client_secrets.json

    # Carpeta temp opcional (por defecto ~/Desktop/temp_videos_upload):
    python3 upload_videos_youtube.py \\
        --disco   "/Volumes/Nuevo vol" \\
        --secrets client_secrets.json \\
        --temp    /tmp/videos_temp

Requisitos:
    pip3 install google-auth google-auth-oauthlib google-api-python-client tqdm
"""

import os
import json
import time
import zipfile
import argparse
import shutil
from pathlib import Path

from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import InstalledAppFlow
from google.auth.transport.requests import Request
from googleapiclient.discovery import build
from googleapiclient.http import MediaFileUpload
from googleapiclient.errors import HttpError
from tqdm import tqdm

# ── Configuración ──────────────────────────────────────────────────────────────
SCOPES           = ["https://www.googleapis.com/auth/drive.file"]
VIDEO_EXTENSIONS = {".mp4", ".mov", ".avi", ".mkv", ".webm", ".m4v"}
PROGRESS_FILE    = "upload_progress.json"
TOKEN_FILE       = "drive_token.json"
FOLDER_NAME      = "Ejercicios MVP"   # carpeta que se crea en tu Drive
MAX_RETRIES      = 5
DEFAULT_TEMP     = Path.home() / "Desktop" / "temp_videos_upload"


# ── Autenticación OAuth2 ───────────────────────────────────────────────────────
def get_drive_client(secrets_file):
    creds = None
    secrets_path = Path(secrets_file)
    if not secrets_path.exists():
        alt = Path(__file__).parent / "client_secrets.json"
        if alt.exists():
            secrets_path = alt
        else:
            print(f"\n❌ No se encuentra {secrets_file}")
            print(f"   Mueve el JSON de Google a la carpeta del script:")
            print(f"   mv ~/Downloads/client_secret_*.json ~/Documents/ProyectoAPPWEB/scripts/client_secrets.json")
            raise SystemExit(1)

    if os.path.exists(TOKEN_FILE):
        creds = Credentials.from_authorized_user_file(TOKEN_FILE, SCOPES)

    if not creds or not creds.valid:
        if creds and creds.expired and creds.refresh_token:
            creds.refresh(Request())
        else:
            flow = InstalledAppFlow.from_client_secrets_file(str(secrets_path), SCOPES)
            creds = flow.run_local_server(port=0)
        with open(TOKEN_FILE, "w") as f:
            f.write(creds.to_json())

    return build("drive", "v3", credentials=creds)


# ── Crear/obtener carpeta en Drive ────────────────────────────────────────────
def get_or_create_folder(drive, folder_name):
    """Devuelve el ID de la carpeta (la crea si no existe)."""
    query = f"name='{folder_name}' and mimeType='application/vnd.google-apps.folder' and trashed=false"
    results = drive.files().list(q=query, fields="files(id, name)").execute()
    files = results.get("files", [])

    if files:
        folder_id = files[0]["id"]
        print(f"   📁 Usando carpeta existente en Drive: {folder_name} ({folder_id})")
    else:
        metadata = {
            "name": folder_name,
            "mimeType": "application/vnd.google-apps.folder",
        }
        folder = drive.files().create(body=metadata, fields="id").execute()
        folder_id = folder["id"]
        # Compartir carpeta como "Cualquiera con el enlace puede ver"
        drive.permissions().create(
            fileId=folder_id,
            body={"type": "anyone", "role": "reader"},
        ).execute()
        print(f"   📁 Carpeta creada en Drive: {folder_name} ({folder_id})")

    return folder_id


# ── Progreso ───────────────────────────────────────────────────────────────────
def load_progress():
    if os.path.exists(PROGRESS_FILE):
        with open(PROGRESS_FILE) as f:
            return json.load(f)
    return {}

def save_progress(progress):
    with open(PROGRESS_FILE, "w") as f:
        json.dump(progress, f, indent=2, ensure_ascii=False)


# ── Subida a Google Drive ─────────────────────────────────────────────────────
def upload_video(drive, video_path, title, folder_id):
    """Sube un vídeo a Drive, lo comparte y devuelve {drive_id, url}."""
    file_metadata = {
        "name":    title + video_path.suffix,
        "parents": [folder_id],
    }

    media = MediaFileUpload(
        str(video_path),
        mimetype="video/mp4",
        chunksize=5 * 1024 * 1024,
        resumable=True,
    )

    request = drive.files().create(
        body=file_metadata,
        media_body=media,
        fields="id,name",
    )

    response  = None
    file_size = video_path.stat().st_size
    pbar      = tqdm(total=file_size, unit="B", unit_scale=True, desc=f"  ↑ {title[:45]}")

    while response is None:
        status, response = request.next_chunk()
        if status:
            pbar.update(int(status.resumable_progress) - pbar.n)

    pbar.update(pbar.total - pbar.n)
    pbar.close()

    file_id = response["id"]

    # Compartir como "Cualquiera con el enlace puede ver"
    drive.permissions().create(
        fileId=file_id,
        body={"type": "anyone", "role": "reader"},
    ).execute()

    view_url    = f"https://drive.google.com/file/d/{file_id}/view"
    preview_url = f"https://drive.google.com/file/d/{file_id}/preview"

    return {"drive_id": file_id, "url": view_url, "embed_url": preview_url}


# ── Buscar vídeos en una carpeta ───────────────────────────────────────────────
def find_videos(folder):
    videos = []
    for ext in VIDEO_EXTENSIONS:
        videos.extend(folder.rglob(f"*{ext}"))
        videos.extend(folder.rglob(f"*{ext.upper()}"))
    return sorted(set(videos))


# ── Subir lote de vídeos ───────────────────────────────────────────────────────
def upload_batch(drive, video_list, progress, folder_id, errores, total_label=""):
    pendientes = [v for v in video_list if v.stem not in progress]

    if not pendientes:
        print(f"  ⏭️  Todos los vídeos de este lote ya están subidos.")
        return True

    for i, video_path in enumerate(pendientes, 1):
        title = video_path.stem
        print(f"\n  [{i}/{len(pendientes)}{total_label}] {title}")

        for attempt in range(1, MAX_RETRIES + 1):
            try:
                result = upload_video(drive, video_path, title, folder_id)
                progress[title] = {
                    "drive_id":  result["drive_id"],
                    "url":       result["url"],
                    "embed_url": result["embed_url"],
                    "file":      str(video_path),
                }
                print(f"  ✅ {result['url']}")
                save_progress(progress)
                time.sleep(1)
                break

            except HttpError as e:
                if e.resp.status in (500, 503):
                    wait = 2 ** attempt
                    print(f"  ⚠️  Error {e.resp.status} — reintentando en {wait}s... ({attempt}/{MAX_RETRIES})")
                    time.sleep(wait)
                elif e.resp.status == 429:
                    wait = 60
                    print(f"  ⚠️  Rate limit (429) — esperando {wait}s...")
                    time.sleep(wait)
                else:
                    print(f"  ❌ HTTP {e.resp.status}: {e}")
                    errores.append(title)
                    break

            except Exception as e:
                print(f"  ❌ Error inesperado: {e}")
                errores.append(title)
                break

    return True


# ── Bucle principal ───────────────────────────────────────────────────────────
def main():
    parser = argparse.ArgumentParser(description="Sube vídeos a Google Drive (sin límites diarios)")
    parser.add_argument("--disco",   required=True, help="Ruta al disco externo. Ej: '/Volumes/Nuevo vol'")
    parser.add_argument("--secrets", default="client_secrets.json", help="client_secrets.json de Google")
    parser.add_argument("--temp",    default=str(DEFAULT_TEMP), help="Carpeta temporal en el Mac para extraer ZIPs")
    args = parser.parse_args()

    disco    = Path(args.disco)
    temp_dir = Path(args.temp)

    if not disco.exists():
        print(f"❌ No se encuentra el disco: {disco}")
        return

    print(f"\n📤 Sube vídeos a Google Drive")
    print(f"   Disco  : {disco}")
    print(f"   Temp   : {temp_dir}")
    print(f"   Carpeta: {FOLDER_NAME}\n")

    # Autenticar
    print("🔐 Autenticando con Google Drive...")
    drive = get_drive_client(args.secrets)
    print("   ✅ Autenticado\n")

    # Crear/obtener carpeta destino en Drive
    folder_id = get_or_create_folder(drive, FOLDER_NAME)

    progress = load_progress()
    errores  = []

    # ── 1. Vídeos sueltos en el disco ─────────────────────────────────────────
    print("\n🔍 Buscando vídeos sueltos en el disco...")
    videos_sueltos = find_videos(disco)
    videos_sueltos = [v for v in videos_sueltos if ".zip" not in v.name.lower()]

    if videos_sueltos:
        print(f"   {len(videos_sueltos)} vídeo(s) suelto(s) encontrado(s).")
        upload_batch(drive, videos_sueltos, progress, folder_id, errores)
    else:
        print("   Ninguno.")

    # ── 2. Procesar ZIPs uno a uno ────────────────────────────────────────────
    zips = sorted(list(disco.rglob("*.zip")) + list(disco.rglob("*.ZIP")))
    print(f"\n📦 {len(zips)} archivo(s) ZIP encontrado(s).")

    for zip_idx, zip_path in enumerate(zips, 1):
        print(f"\n{'─'*60}")
        print(f"📂 ZIP {zip_idx}/{len(zips)}: {zip_path.name}")

        zip_temp = temp_dir / zip_path.stem
        zip_temp.mkdir(parents=True, exist_ok=True)

        try:
            print(f"   Extrayendo en {zip_temp} ...")
            with zipfile.ZipFile(str(zip_path), "r") as zf:
                video_members = [
                    m for m in zf.infolist()
                    if Path(m.filename).suffix.lower() in VIDEO_EXTENSIONS
                ]

                nombres_zip = {Path(m.filename).stem for m in video_members}
                ya_subidos  = nombres_zip & set(progress.keys())
                if len(ya_subidos) == len(nombres_zip) and nombres_zip:
                    print(f"   ⏭️  Todos los vídeos de este ZIP ya están subidos. Saltando.")
                    continue

                if video_members:
                    for member in video_members:
                        zf.extract(member, zip_temp)
                    print(f"   ✅ {len(video_members)} vídeo(s) extraído(s).")
                else:
                    zf.extractall(zip_temp)
                    print(f"   ✅ ZIP completo extraído.")

            videos_temp = find_videos(zip_temp)
            if not videos_temp:
                print(f"   ⚠️  No se encontraron vídeos en este ZIP.")
                continue

            print(f"   🎥 {len(videos_temp)} vídeo(s) a subir...")
            upload_batch(drive, videos_temp, progress, folder_id, errores,
                         total_label=f" · ZIP {zip_idx}/{len(zips)}")

        except zipfile.BadZipFile:
            print(f"   ❌ ZIP corrupto: {zip_path.name}")
            errores.append(str(zip_path.name))

        except Exception as e:
            print(f"   ❌ Error con {zip_path.name}: {e}")
            errores.append(str(zip_path.name))

        finally:
            if zip_temp.exists():
                shutil.rmtree(zip_temp, ignore_errors=True)
                print(f"   🗑️  Carpeta temporal eliminada.")

    # Limpiar carpeta temp raíz
    if temp_dir.exists():
        try:
            temp_dir.rmdir()
        except OSError:
            pass

    # ── Resultado final ────────────────────────────────────────────────────────
    print(f"\n{'='*60}")
    print(f"✅ Subidos correctamente : {len(progress)}")
    print(f"❌ Con errores           : {len(errores)}")
    if errores:
        print(f"   Archivos con error   : {errores}")

    save_progress(progress)
    export_mapping(progress)


# ── Exportar mapeo para la BD ─────────────────────────────────────────────────
def export_mapping(progress):
    if not progress:
        return

    # CSV
    csv_path = "mapeo_videos.csv"
    with open(csv_path, "w", encoding="utf-8") as f:
        f.write("nombre_ejercicio,drive_url,embed_url,drive_id\n")
        for name, data in sorted(progress.items()):
            f.write(f'"{name}","{data["url"]}","{data.get("embed_url","")}","{data["drive_id"]}"\n')
    print(f"\n📄 CSV exportado: {csv_path}")

    # SQL para Supabase — usa embed_url para poder reproducir en la app
    sql_path = "update_video_urls.sql"
    with open(sql_path, "w", encoding="utf-8") as f:
        f.write("-- Actualizar video_url en la tabla exercises\n")
        f.write("-- Pegar en Supabase → SQL Editor\n\n")
        for name, data in sorted(progress.items()):
            safe      = name.replace("'", "''")
            embed_url = data.get("embed_url", data["url"])
            f.write(
                f"UPDATE exercises SET video_url = '{embed_url}' "
                f"WHERE LOWER(TRIM(name)) = LOWER(TRIM('{safe}'));\n"
            )
    print(f"📄 SQL exportado: {sql_path}")
    print(f"\n👉 Pega el contenido de {sql_path} en Supabase → SQL Editor para enlazar los vídeos.")


if __name__ == "__main__":
    main()
