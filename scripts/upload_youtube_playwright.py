#!/usr/bin/env python3
"""
upload_youtube_playwright.py
============================
Sube vídeos a YouTube Studio simulando un usuario real.
Sin API, sin cuotas diarias.

Uso:
    python3 upload_youtube_playwright.py --disco "/Volumes/Nuevo vol"

Requisitos:
    pip3 install playwright
    python3 -m playwright install chromium
"""

import asyncio
import json
import os
import re
import shutil
import sys
import zipfile
import argparse
from pathlib import Path
from playwright.async_api import async_playwright

VIDEO_EXTENSIONS = {".mp4", ".mov", ".avi", ".mkv", ".webm", ".m4v"}
PROGRESS_FILE    = "upload_progress.json"
PROFILE_DIR      = str(Path(__file__).parent / "browser_profile")
DEFAULT_TEMP     = Path.home() / "Desktop" / "temp_videos_upload"

# JS recursivo que traversa todos los shadow roots para encontrar un elemento
JS_FIND_IN_SHADOW = """
    function findInShadow(root, sel) {
        try { const el = root.querySelector(sel); if (el) return el; } catch(e) {}
        for (const node of root.querySelectorAll('*')) {
            if (node.shadowRoot) {
                const found = findInShadow(node.shadowRoot, sel);
                if (found) return found;
            }
        }
        return null;
    }
"""


# ── Progreso ───────────────────────────────────────────────────────────────────
def load_progress():
    if os.path.exists(PROGRESS_FILE):
        with open(PROGRESS_FILE) as f:
            return json.load(f)
    return {}

def save_progress(progress):
    with open(PROGRESS_FILE, "w") as f:
        json.dump(progress, f, indent=2, ensure_ascii=False)

def find_videos(folder):
    videos = []
    for ext in VIDEO_EXTENSIONS:
        videos.extend(folder.rglob(f"*{ext}"))
        videos.extend(folder.rglob(f"*{ext.upper()}"))
    return sorted(set(videos))


# ── Helper: click en cualquier shadow DOM ──────────────────────────────────────
async def shadow_click(page, css_selector, label):
    """
    Tres estrategias para clickar elementos en shadow DOM:
    1. Playwright locator() — auto-penetra shadow DOM
    2. get_by_role() — también penetra shadow DOM
    3. JS recursivo — traversa manualmente todos los shadow roots
    """
    # Estrategia 1: Playwright locator
    try:
        el = page.locator(css_selector).first
        await el.wait_for(state="attached", timeout=4000)
        await el.scroll_into_view_if_needed()
        await el.click(timeout=3000)
        print(f"    ✔ {label}")
        return True
    except Exception:
        pass

    # Estrategia 2: JS recursivo (el más fiable para shadow DOM profundo)
    js_sel = css_selector.replace("\\", "\\\\").replace("'", "\\'")
    result = await page.evaluate(f"""
        () => {{
            {JS_FIND_IN_SHADOW}
            const el = findInShadow(document, '{js_sel}');
            if (!el) return 'not_found';
            el.click();
            return 'clicked';
        }}
    """)
    if result == 'clicked':
        print(f"    ✔ {label} (JS)")
        return True

    print(f"    ⚠ No encontrado: {label}")
    return False


# ── Helper: esperar hasta que el botón Siguiente esté habilitado y clicarlo ───
async def click_next(page, step):
    """
    Cuatro estrategias + 3 reintentos externos para avanzar al siguiente paso.
    """
    for outer in range(3):
        if outer > 0:
            print(f"    🔄 Reintentando Siguiente ({step}/3)... (intento {outer+1})")
            await page.wait_for_timeout(4000)

        # Estrategia 1: Playwright locator por ID
        for sel in ['#next-button', 'ytcp-button#next-button', 'ytcp-button[id="next-button"]']:
            try:
                btn = page.locator(sel).first
                await btn.wait_for(state="visible", timeout=8000)
                for w in range(120):  # hasta 120 s (subida grande)
                    if await btn.get_attribute("disabled") is None:
                        break
                    if w == 0:
                        print(f"    ⏳ Siguiente ({step}) esperando upload...")
                    await page.wait_for_timeout(1000)
                await btn.click()
                await page.wait_for_timeout(2000)
                print(f"    ✔ Siguiente ({step}/3)")
                return True
            except Exception:
                pass

        # Estrategia 2: Role-based (traversa shadow DOM)
        for name in ["Siguiente", "Next"]:
            try:
                btn = page.get_by_role("button", name=name)
                if await btn.is_visible(timeout=3000):
                    await btn.click()
                    await page.wait_for_timeout(2000)
                    print(f"    ✔ Siguiente ({step}/3) (role:{name})")
                    return True
            except Exception:
                pass

        # Estrategia 3: Playwright text locator
        for txt in ['Siguiente', 'Next']:
            try:
                el = page.locator(f'ytcp-button:has-text("{txt}")').first
                if await el.is_visible(timeout=2000):
                    await el.click()
                    await page.wait_for_timeout(2000)
                    print(f"    ✔ Siguiente ({step}/3) (text:{txt})")
                    return True
            except Exception:
                pass

        # Estrategia 4: JS texto exacto en todo el shadow DOM
        result = await page.evaluate(f"""
            () => {{
                {JS_FIND_IN_SHADOW}
                let btn = findInShadow(document, '#next-button');
                if (btn && !btn.hasAttribute('disabled')) {{
                    if (btn.shadowRoot) {{
                        const inner = btn.shadowRoot.querySelector('button');
                        if (inner) {{ inner.click(); return 'shadow-inner'; }}
                    }}
                    btn.click(); return 'id';
                }}
                function findByText(root) {{
                    for (const el of root.querySelectorAll('ytcp-button, button')) {{
                        const txt = (el.textContent || '').trim().toLowerCase();
                        if ((txt === 'siguiente' || txt === 'next') && !el.hasAttribute('disabled')) {{
                            if (el.shadowRoot) {{
                                const inner = el.shadowRoot.querySelector('button');
                                if (inner) {{ inner.click(); return 'text-inner'; }}
                            }}
                            el.click(); return 'text';
                        }}
                    }}
                    for (const n of root.querySelectorAll('*')) {{
                        if (n.shadowRoot) {{ const r = findByText(n.shadowRoot); if (r) return r; }}
                    }}
                    return null;
                }}
                return findByText(document) || 'not_found';
            }}
        """)
        if result and result != 'not_found':
            await page.wait_for_timeout(2000)
            print(f"    ✔ Siguiente ({step}/3) (JS:{result})")
            return True

    print(f"    ⚠ No se pudo Siguiente ({step}/3)")
    return False


# ── Helper: clickar el botón Guardar con 4 estrategias ────────────────────────
async def click_save(page):
    """
    Cuatro estrategias para clickar ytcp-button#done-button:
    1. Playwright locator — espera hasta 60 s a que se habilite
    2. get_by_role("button") — busca por texto Guardar/Save
    3. JS que accede directamente al shadowRoot del done-button
    4. Tecla Enter como último recurso
    """
    # Estrategia 1: locator con espera larga (el vídeo puede seguir subiéndose)
    for sel in ['ytcp-button#done-button', '#done-button']:
        try:
            btn = page.locator(sel).first
            await btn.wait_for(state="visible", timeout=15000)
            # Esperar hasta habilitado (máx 60 s)
            for attempt in range(60):
                disabled = await btn.get_attribute("disabled")
                if disabled is None:
                    break
                if attempt % 10 == 0 and attempt > 0:
                    print(f"    ⏳ Esperando que termine la subida... ({attempt}s)")
                await page.wait_for_timeout(1000)
            await btn.scroll_into_view_if_needed()
            await btn.click()
            print("    ✔ Guardado")
            return True
        except Exception:
            pass

    # Estrategia 2: get_by_role (busca por texto, traversa shadow DOM)
    for name in ["Guardar", "Save", "Listo", "Done"]:
        try:
            btn = page.get_by_role("button", name=name).last
            if await btn.is_visible(timeout=3000):
                await btn.click()
                print(f"    ✔ Guardado (role:{name})")
                return True
        except Exception:
            pass

    # Estrategia 3: JS directo — busca done-button en TODO el shadow DOM
    result = await page.evaluate(f"""
        () => {{
            {JS_FIND_IN_SHADOW}

            let btn = document.querySelector('ytcp-button#done-button')
                   || document.querySelector('#done-button')
                   || findInShadow(document, 'ytcp-button#done-button')
                   || findInShadow(document, '#done-button');

            if (btn) {{
                if (btn.hasAttribute('disabled')) return 'disabled';
                if (btn.shadowRoot) {{
                    const inner = btn.shadowRoot.querySelector('button');
                    if (inner) {{ inner.click(); return 'shadow-inner'; }}
                }}
                btn.click();
                return 'direct';
            }}

            // Texto EXACTO "guardar" o "save" en shadow DOM (no "guardar como borrador")
            function clickExactSave(root) {{
                for (const el of root.querySelectorAll('ytcp-button')) {{
                    const txt = (el.textContent || '').trim().toLowerCase();
                    if ((txt === 'guardar' || txt === 'save') && !el.hasAttribute('disabled')) {{
                        if (el.shadowRoot) {{
                            const inner = el.shadowRoot.querySelector('button');
                            if (inner) {{ inner.click(); return 'exact-inner:' + txt; }}
                        }}
                        el.click();
                        return 'exact:' + txt;
                    }}
                }}
                for (const node of root.querySelectorAll('*')) {{
                    if (node.shadowRoot) {{
                        const r = clickExactSave(node.shadowRoot);
                        if (r) return r;
                    }}
                }}
                return null;
            }}
            return clickExactSave(document) || 'not_found';
        }}
    """)
    if result == 'disabled':
        print("    ⚠ Botón Guardar deshabilitado — esperando 15s y reintentando")
        await page.wait_for_timeout(15000)
        # reintentar locator
        for sel in ['ytcp-button#done-button', '#done-button']:
            try:
                btn = page.locator(sel).first
                await btn.wait_for(state="visible", timeout=5000)
                if await btn.get_attribute("disabled") is None:
                    await btn.click()
                    print("    ✔ Guardado (reintento)")
                    return True
            except Exception:
                pass
    elif result != 'not_found':
        print(f"    ✔ Guardado (JS:{result})")
        return True

    # Estrategia 4: tecla Enter como último recurso
    print("    ⚠ Enviando Enter como último recurso")
    await page.keyboard.press("Enter")
    return True


# ── Detección de límite diario de YouTube ─────────────────────────────────────
async def check_daily_limit(page):
    """Devuelve True si YouTube está mostrando el popup de límite diario."""
    try:
        texts = await page.evaluate("""
            () => document.body.innerText
        """)
        limit_keywords = [
            "límite diario", "daily limit", "upload limit",
            "límite de subida", "has reached", "ha alcanzado"
        ]
        body = texts.lower()
        return any(kw in body for kw in limit_keywords)
    except Exception:
        return False


# ── Subida de un vídeo ─────────────────────────────────────────────────────────
async def upload_video(page, video_path, title):
    """Sube un vídeo a YouTube Studio. Devuelve {youtube_id, url}."""

    # ── 1. Ir a YouTube Studio ────────────────────────────────────────────────
    await page.goto("https://studio.youtube.com/", wait_until="domcontentloaded")
    await page.wait_for_timeout(3000)

    # Comprobar límite diario antes de empezar
    if await check_daily_limit(page):
        raise Exception("LIMITE_DIARIO: YouTube ha alcanzado el límite de subidas de hoy")

    # ── 2. Clic en "Crear" ────────────────────────────────────────────────────
    clicked = False
    for sel in [
        'button[aria-label="Crear"]', 'button[aria-label="Create"]',
        'ytcp-icon-button[aria-label="Crear"]', 'ytcp-icon-button[aria-label="Create"]',
        '#upload-icon'
    ]:
        try:
            btn = page.locator(sel).first
            if await btn.is_visible(timeout=3000):
                await btn.click()
                clicked = True
                break
        except Exception:
            pass
    if not clicked:
        raise Exception("No se encontró el botón 'Crear'")
    await page.wait_for_timeout(1500)

    # ── 3. Clic en "Subir vídeos" ─────────────────────────────────────────────
    for sel in [
        'tp-yt-paper-item:has-text("Subir vídeos")',
        'tp-yt-paper-item:has-text("Upload videos")',
        'text=Subir vídeos', 'text=Upload videos'
    ]:
        try:
            item = page.locator(sel).first
            if await item.is_visible(timeout=3000):
                await item.click()
                break
        except Exception:
            pass
    await page.wait_for_timeout(2000)

    # ── 4. Seleccionar archivo ────────────────────────────────────────────────
    file_input = page.locator('input[type="file"]').first
    await file_input.set_input_files(str(video_path))

    # Escuchar respuestas de red para capturar el videoId
    video_id_holder = {"id": None}
    async def on_response(response):
        if video_id_holder["id"]:
            return
        try:
            if "createvideo" in response.url or "upload.youtube.com" in response.url:
                text = await response.text()
                m = re.search(r'"videoId"\s*:\s*"([a-zA-Z0-9_-]{11})"', text)
                if m:
                    video_id_holder["id"] = m.group(1)
                    print(f"    🎯 ID capturado por red: {m.group(1)}")
        except Exception:
            pass
    page.on("response", on_response)

    try:
        # ── 5. Esperar formulario ─────────────────────────────────────────────
        print(f"    ⏳ Esperando formulario...")
        await page.wait_for_selector('#title-textarea', timeout=90000)
        await page.wait_for_timeout(3000)  # tiempo para que cargue todo el form

        # ── 6. Rellenar título ────────────────────────────────────────────────
        for sel in ['#title-textarea #child-input', '#title-textarea',
                    'ytcp-social-suggestions-textbox #textbox']:
            try:
                field = page.locator(sel).first
                if await field.is_visible(timeout=2000):
                    await field.triple_click()
                    await field.fill(title)
                    break
            except Exception:
                pass
        await page.wait_for_timeout(1000)

        # ── 6b. Campos de audiencia — intentar en paso 1 y en cada paso siguiente
        # YouTube Shorts usa VIDEO_MADE_FOR_KIDS_NOT_MFK y VIDEO_AGE_RESTRICTION_NONE
        async def fill_audience_fields():
            ok1 = await shadow_click(page,
                'tp-yt-paper-radio-button[name="VIDEO_MADE_FOR_KIDS_NOT_MFK"]',
                "No es para niños")
            # también intentar nombre antiguo por si cambia
            if not ok1:
                ok1 = await shadow_click(page,
                    'tp-yt-paper-radio-button[name="NOT_MADE_FOR_KIDS"]',
                    "No es para niños (alt)")
            ok2 = await shadow_click(page,
                'tp-yt-paper-radio-button[name="VIDEO_AGE_RESTRICTION_NONE"]',
                "Sin restricción de edad")
            return ok1 or ok2

        await page.wait_for_timeout(1500)
        audience_ok = await fill_audience_fields()
        await page.wait_for_timeout(1000)

        # ── 7. Siguiente × 3 ──────────────────────────────────────────────────
        siguientes_ok = 0
        for step in range(1, 4):
            # Reintentar audiencia en cada paso (Shorts puede tenerlo en paso 2)
            if step > 1 and not audience_ok:
                audience_ok = await fill_audience_fields()
                await page.wait_for_timeout(500)

            ok = await click_next(page, step)
            if ok:
                siguientes_ok += 1

        # ── 8. Esperar página de visibilidad ──────────────────────────────────
        print("    ⏳ Esperando página de visibilidad...")
        await page.wait_for_timeout(4000)   # dar tiempo a que cargue

        # Si fallaron 2+ Siguiente, comprobar si realmente estamos en visibilidad
        if siguientes_ok < 2:
            on_visibility = await page.evaluate(f"""
                () => {{
                    {JS_FIND_IN_SHADOW}
                    const el = findInShadow(document, 'tp-yt-paper-radio-button[name="UNLISTED"]')
                            || findInShadow(document, 'tp-yt-paper-radio-button[name="PRIVATE"]');
                    return !!el;
                }}
            """)
            if not on_visibility:
                # Atascado en el formulario de detalles — no en visibilidad
                if video_id_holder["id"]:
                    vid = video_id_holder["id"]
                    print(f"    ℹ️  Wizard atascado pero ID capturado ({vid}) — guardando y continuando")
                    return {"youtube_id": vid, "url": f"https://www.youtube.com/watch?v={vid}"}
                else:
                    raise Exception("Siguiente falló repetidamente y no hay ID de red — saltando vídeo")

        # ── DEBUG: volcar qué radio buttons y botones hay realmente ───────────
        dom_info = await page.evaluate(f"""
            () => {{
                {JS_FIND_IN_SHADOW}
                const results = {{}};

                // Buscar todos los tp-yt-paper-radio-button en cualquier shadow root
                function collectRadios(root, depth) {{
                    const found = root.querySelectorAll('tp-yt-paper-radio-button, [role="radio"], paper-radio-button');
                    found.forEach(el => {{
                        const key = el.tagName + '|' + (el.getAttribute('name') || '') + '|' + (el.getAttribute('value') || '') + '|' + el.textContent.trim().substring(0, 40);
                        results[key] = true;
                    }});
                    root.querySelectorAll('*').forEach(n => {{
                        if (n.shadowRoot) collectRadios(n.shadowRoot, depth+1);
                    }});
                }}
                collectRadios(document, 0);

                // Buscar todos los ytcp-button
                const btns = {{}};
                function collectBtns(root) {{
                    root.querySelectorAll('ytcp-button, button').forEach(el => {{
                        const txt = el.textContent.trim().substring(0, 30);
                        const id = el.getAttribute('id') || '';
                        if (txt || id) btns[id + ':' + txt] = el.tagName;
                    }});
                    root.querySelectorAll('*').forEach(n => {{
                        if (n.shadowRoot) collectBtns(n.shadowRoot);
                    }});
                }}
                collectBtns(document);

                return {{radios: Object.keys(results), buttons: Object.keys(btns)}};
            }}
        """)
        print(f"    🔍 Radios encontrados: {dom_info.get('radios', [])}")
        print(f"    🔍 Botones encontrados: {dom_info.get('buttons', [])[:10]}")

        # Verificar que estamos realmente en la página de visibilidad
        radios_str = str(dom_info.get('radios', []))
        if 'UNLISTED' not in radios_str and 'PRIVATE' not in radios_str and 'PUBLIC' not in radios_str:
            print("    ⚠ Página de visibilidad NO detectada (siguen campos de audiencia)")
            if video_id_holder["id"]:
                vid = video_id_holder["id"]
                print(f"    ℹ️  Usando ID de red ({vid}) — el vídeo quedará con visibilidad por defecto")
                return {"youtube_id": vid, "url": f"https://www.youtube.com/watch?v={vid}"}
            else:
                raise Exception("No estamos en la página de visibilidad y no hay ID de red — saltando")

        # ── 9. Seleccionar "No listado" — múltiples estrategias ──────────────
        unlisted_ok = False

        # Estrategia 1: atributo name
        unlisted_ok = await shadow_click(page,
            'tp-yt-paper-radio-button[name="UNLISTED"]', "'No listado' (name)")

        # Estrategia 2: atributo value
        if not unlisted_ok:
            unlisted_ok = await shadow_click(page,
                'tp-yt-paper-radio-button[value="UNLISTED"]', "'No listado' (value)")

        # Estrategia 3: cualquier elemento con name o value UNLISTED
        if not unlisted_ok:
            unlisted_ok = await shadow_click(page,
                '[name="UNLISTED"]', "'No listado' ([name])")

        # Estrategia 4: Playwright text locator (traversa shadow DOM)
        if not unlisted_ok:
            for txt in ['No listado', 'Unlisted', 'No listada']:
                try:
                    el = page.locator(f'text="{txt}"').first
                    if await el.is_visible(timeout=2000):
                        await el.click()
                        print(f"    ✔ 'No listado' (texto:{txt})")
                        unlisted_ok = True
                        break
                except Exception:
                    pass

        # Estrategia 5: JS buscar por texto en shadow DOM
        if not unlisted_ok:
            result = await page.evaluate(f"""
                () => {{
                    {JS_FIND_IN_SHADOW}
                    function clickByText(root, texts) {{
                        for (const node of root.querySelectorAll('tp-yt-paper-radio-button, [role="radio"]')) {{
                            const t = (node.textContent || '').trim().toLowerCase();
                            for (const txt of texts) {{
                                if (t.includes(txt.toLowerCase())) {{
                                    node.click();
                                    return 'text:' + t.substring(0, 30);
                                }}
                            }}
                        }}
                        for (const node of root.querySelectorAll('*')) {{
                            if (node.shadowRoot) {{
                                const r = clickByText(node.shadowRoot, texts);
                                if (r) return r;
                            }}
                        }}
                        return null;
                    }}
                    const r = clickByText(document, ['No listado', 'Unlisted', 'No listada', 'Oculto']);
                    return r || 'not_found';
                }}
            """)
            if result != 'not_found':
                print(f"    ✔ 'No listado' (JS texto: {result})")
                unlisted_ok = True
            else:
                print("    ⚠ 'No listado' NO encontrado — se guardará con visibilidad por defecto")

        await page.wait_for_timeout(1500)

        # ── 10. Guardar ───────────────────────────────────────────────────────
        await click_save(page)

        # ── 11. Obtener el ID del vídeo ───────────────────────────────────────
        await page.wait_for_timeout(4000)
        video_id = None

        # Método A: enlace en el diálogo de confirmación
        for sel in ['a[href*="youtu.be"]', 'a[href*="youtube.com/shorts"]',
                    'a[href*="youtube.com/watch"]']:
            try:
                href = await page.locator(sel).first.get_attribute("href", timeout=5000)
                if href:
                    m = re.search(r'(?:v=|youtu\.be/|shorts/)([a-zA-Z0-9_-]{11})', href)
                    if m:
                        video_id = m.group(1)
                        print(f"    🎯 ID desde diálogo: {video_id}")
                        break
            except Exception:
                pass

        # Método B: ID capturado por red
        if not video_id:
            video_id = video_id_holder["id"]

        # Método C: lista de vídeos del canal
        if not video_id:
            await page.wait_for_timeout(2000)
            await page.goto("https://studio.youtube.com/channel/videos",
                            wait_until="domcontentloaded")
            await page.wait_for_timeout(3000)
            for sel in ['a[href*="/video/"]', 'ytcp-entity-name a', 'a#video-title']:
                try:
                    href = await page.locator(sel).first.get_attribute("href", timeout=5000)
                    if href:
                        m = re.search(r'/video/([a-zA-Z0-9_-]{11})', href)
                        if m:
                            video_id = m.group(1)
                            print(f"    🎯 ID desde lista: {video_id}")
                            break
                except Exception:
                    pass

        if not video_id:
            raise Exception("No se pudo obtener el ID del vídeo")

        return {"youtube_id": video_id, "url": f"https://www.youtube.com/watch?v={video_id}"}

    finally:
        page.remove_listener("response", on_response)


# ── Bucle principal ───────────────────────────────────────────────────────────
async def main_async(args):
    disco    = Path(args.disco)
    temp_dir = Path(args.temp)

    if not disco.exists():
        print(f"❌ No se encuentra el disco: {disco}")
        return

    progress = load_progress()
    errores  = []
    os.makedirs(PROFILE_DIR, exist_ok=True)

    print(f"\n🎬 Subida a YouTube Studio (modo simulado)")
    print(f"   Disco : {disco}")
    print(f"   Temp  : {temp_dir}")
    print(f"   Ya subidos: {len(progress)}\n")

    async with async_playwright() as pw:
        context = await pw.chromium.launch_persistent_context(
            PROFILE_DIR,
            headless=False,
            args=["--disable-blink-features=AutomationControlled"],
            no_viewport=True,
        )

        page = context.pages[0] if context.pages else await context.new_page()

        # Comprobar login
        await page.goto("https://studio.youtube.com/", wait_until="domcontentloaded")
        await page.wait_for_timeout(2000)

        if "accounts.google.com" in page.url or "studio.youtube.com" not in page.url:
            print("🔐 ACCIÓN REQUERIDA:")
            print("   Inicia sesión con la cuenta mvpteam.ejercicios en el navegador.")
            print("   El script continúa automáticamente al terminar el login.\n")
            await page.wait_for_url("**/studio.youtube.com/**", timeout=180000)
            await page.wait_for_timeout(2000)

        print("✅ Sesión activa en YouTube Studio\n")

        # Procesar ZIPs uno a uno
        zips = sorted(list(disco.rglob("*.zip")) + list(disco.rglob("*.ZIP")))
        print(f"📦 {len(zips)} ZIP(s) encontrado(s) en el disco.\n")

        limite_alcanzado = False
        subidos_sesion   = 0

        for zip_idx, zip_path in enumerate(zips, 1):
            if limite_alcanzado:
                break

            print(f"{'─'*60}")
            print(f"📂 ZIP {zip_idx}/{len(zips)}: {zip_path.name}")

            zip_temp = temp_dir / zip_path.stem
            zip_temp.mkdir(parents=True, exist_ok=True)

            try:
                with zipfile.ZipFile(str(zip_path), "r") as zf:
                    video_members = [
                        m for m in zf.infolist()
                        if Path(m.filename).suffix.lower() in VIDEO_EXTENSIONS
                    ]
                    nombres    = {Path(m.filename).stem for m in video_members}
                    ya_subidos = nombres & set(progress.keys())

                    if nombres and len(ya_subidos) == len(nombres):
                        print("   ⏭️  Todos ya subidos, saltando.\n")
                        continue

                    for member in video_members:
                        zf.extract(member, zip_temp)
                    print(f"   ✅ {len(video_members)} vídeo(s) extraído(s).")

                videos     = find_videos(zip_temp)
                pendientes = [v for v in videos if v.stem not in progress]
                print(f"   🎥 {len(pendientes)} pendiente(s).")

                for i, vp in enumerate(pendientes, 1):
                    if args.max_videos and subidos_sesion >= args.max_videos:
                        print(f"\n🛑 Límite de sesión alcanzado ({args.max_videos} vídeos). Continuará mañana.")
                        limite_alcanzado = True
                        break

                    title = vp.stem
                    print(f"\n  [{i}/{len(pendientes)} · ZIP {zip_idx}/{len(zips)}] {title}")

                    try:
                        result = await upload_video(page, vp, title)
                        progress[title] = {
                            "youtube_id": result["youtube_id"],
                            "url":        result["url"],
                        }
                        subidos_sesion += 1
                        print(f"  ✅ {result['url']}  [{subidos_sesion}/{args.max_videos or '∞'} hoy]")
                        save_progress(progress)

                    except Exception as e:
                        err_str = str(e)
                        if "LIMITE_DIARIO" in err_str:
                            print(f"\n⛔ LÍMITE DIARIO DE YOUTUBE ALCANZADO")
                            print(f"   Subidos hoy: {len(progress)}")
                            print(f"   Ejecuta mañana el mismo comando para continuar.")
                            limite_alcanzado = True
                            break
                        print(f"  ❌ Error: {e}")
                        errores.append(title)

            except zipfile.BadZipFile:
                print(f"   ❌ ZIP corrupto: {zip_path.name}")
                errores.append(zip_path.name)
            except Exception as e:
                print(f"   ❌ Error procesando ZIP: {e}")
                errores.append(zip_path.name)
            finally:
                if zip_temp.exists():
                    shutil.rmtree(zip_temp, ignore_errors=True)
                    print("   🗑️  Carpeta temporal eliminada.\n")

        await context.close()

    print(f"\n{'='*60}")
    print(f"✅ Subidos correctamente : {len(progress)}")
    print(f"❌ Con errores           : {len(errores)}")
    if errores:
        print(f"   {errores}")
    save_progress(progress)
    export_mapping(progress)


# ── Exportar mapeo ─────────────────────────────────────────────────────────────
def export_mapping(progress):
    if not progress:
        return
    with open("mapeo_videos.csv", "w", encoding="utf-8") as f:
        f.write("nombre_ejercicio,youtube_url,youtube_id\n")
        for name, data in sorted(progress.items()):
            f.write(f'"{name}","{data["url"]}","{data.get("youtube_id","")}"\n')

    with open("update_video_urls.sql", "w", encoding="utf-8") as f:
        f.write("-- Actualizar video_ref en exercises\n-- Pegar en Supabase → SQL Editor\n\n")
        for name, data in sorted(progress.items()):
            safe = name.replace("'", "''")
            f.write(
                f"UPDATE exercises SET video_ref = '{data['url']}' "
                f"WHERE LOWER(TRIM(name)) = LOWER(TRIM('{safe}'));\n"
            )
    print("\n📄 CSV y SQL exportados.")


def main():
    parser = argparse.ArgumentParser(description="Sube vídeos a YouTube Studio sin API")
    parser.add_argument("--disco",      required=True, help="Ruta al disco externo")
    parser.add_argument("--temp",       default=str(DEFAULT_TEMP), help="Carpeta temporal")
    parser.add_argument("--max-videos", type=int, default=None,
                        help="Máximo de vídeos a subir en esta sesión (ej: 13)")
    args = parser.parse_args()
    asyncio.run(main_async(args))


if __name__ == "__main__":
    main()
