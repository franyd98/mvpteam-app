#!/usr/bin/env python3
"""
Revisa todos los enlaces de YouTube del catálogo de vídeos de la app.

Para cada enlace pregunta a YouTube (oEmbed) el título real del vídeo y lo
compara con el nombre del ejercicio. Genera revision_videos.csv con:
  estado    → OK / ROTO (no existe) / PRIVADO / ERROR
  parecido  → 0–100 % entre el nombre del ejercicio y el título del vídeo
  aviso     → "REVISAR" si el título no se parece al ejercicio

Uso (desde Terminal):
  cd /Users/fran/Documents/ProyectoAPPWEB
  python3 revisar_videos_youtube.py
"""
import csv, json, re, subprocess, sys, unicodedata, urllib.parse
from concurrent.futures import ThreadPoolExecutor
from difflib import SequenceMatcher
from pathlib import Path

BASE = Path(__file__).resolve().parent
CATALOG = BASE / "fitness-app" / "src" / "data" / "videoCatalog.json"
OUT = BASE / "revision_videos.csv"


def norm(s: str) -> str:
    s = unicodedata.normalize("NFKD", s.lower())
    s = "".join(c for c in s if not unicodedata.combining(c))
    s = re.sub(r"^[a-z.]{1,10}\s*-\s*", "", s)
    return re.sub(r"[^a-z0-9]+", " ", s).strip()


FIRST_ERROR: list[str] = []


def check(url: str):
    # Usa curl (incluido en macOS y con sus certificados): el Python de python.org
    # a menudo no los tiene instalados y falla con URLError.
    q = urllib.parse.urlencode({"url": url, "format": "json"})
    try:
        p = subprocess.run(
            ["curl", "-sS", "-m", "20", "-w", "\n%{http_code}", f"https://www.youtube.com/oembed?{q}"],
            capture_output=True, text=True, timeout=30,
        )
    except Exception as e:
        if not FIRST_ERROR: FIRST_ERROR.append(repr(e))
        return f"ERROR {type(e).__name__}", ""
    body, _, code = p.stdout.rpartition("\n")
    if p.returncode != 0 or not code.isdigit():
        if not FIRST_ERROR: FIRST_ERROR.append(p.stderr.strip() or f"curl exit {p.returncode}")
        return "ERROR conexión", ""
    code = int(code)
    if code == 200:
        try:
            return "OK", json.loads(body).get("title", "")
        except json.JSONDecodeError:
            return "ERROR respuesta", ""
    return {401: "PRIVADO", 403: "PRIVADO", 404: "ROTO", 400: "ROTO"}.get(code, f"ERROR {code}"), ""


def main():
    items = json.loads(CATALOG.read_text(encoding="utf-8"))
    by_url: dict[str, list[str]] = {}
    for it in items:
        by_url.setdefault(it["videoRef"], []).append(it["name"])
    urls = list(by_url)
    print(f"Revisando {len(urls)} vídeos…")

    results = {}
    with ThreadPoolExecutor(max_workers=8) as pool:
        for i, (url, res) in enumerate(zip(urls, pool.map(check, urls)), 1):
            results[url] = res
            if i % 50 == 0:
                print(f"  {i}/{len(urls)}")

    rows, bad = [], 0
    for url, (estado, titulo) in results.items():
        for name in by_url[url]:
            sim = round(SequenceMatcher(None, norm(name), norm(titulo)).ratio() * 100) if titulo else 0
            aviso = "" if estado == "OK" and sim >= 70 else "REVISAR"
            bad += aviso == "REVISAR"
            rows.append([aviso, estado, sim, name, titulo, url])
    rows.sort(key=lambda r: (r[0] != "REVISAR", r[2]))

    with OUT.open("w", newline="", encoding="utf-8-sig") as f:
        w = csv.writer(f, delimiter=";")
        w.writerow(["aviso", "estado", "parecido_%", "ejercicio", "titulo_en_youtube", "enlace"])
        w.writerows(rows)

    estados = {}
    for estado, _ in results.values():
        estados[estado] = estados.get(estado, 0) + 1
    print("\nResultado por vídeo:", estados)
    if FIRST_ERROR:
        print("Primer error de conexión:", FIRST_ERROR[0])
    print(f"Filas a revisar: {bad}")
    print(f"Informe: {OUT}  (ábrelo con Numbers o Excel)")


if __name__ == "__main__":
    sys.exit(main())
