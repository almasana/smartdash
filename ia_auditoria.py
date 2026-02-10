import os
import requests
import json

def ejecutar_auditoria():
    # 1. Carga de Secrets con limpieza de espacios
    GROQ_KEY = os.getenv('GROQ_API_KEY', '').strip()
    SB_URL = os.getenv('NEXT_PUBLIC_SUPABASE_URL', '').strip()
    SB_KEY = os.getenv('SUPABASE_SERVICE_ROLE_KEY', '').strip()

    if not all([GROQ_KEY, SB_URL, SB_KEY]):
        print("❌ Error: Faltan llaves en los Secrets de GitHub.")
        return

    # 2. Consulta a la IA (Groq)
    headers_groq = {"Authorization": f"Bearer {GROQ_KEY}", "Content-Type": "application/json"}
    payload = {
        "model": "llama-3.3-70b-versatile",
        "messages": [{"role": "user", "content": "Generá un reporte de riesgo breve para SmartDash."}]
    }
    
    try:
        res = requests.post("https://api.groq.com/openai/v1/chat/completions", json=payload, headers=headers_groq)
        reporte = res.json()['choices'][0]['message']['content']
    except Exception as e:
        print(f"❌ Error IA: {e}")
        return

    # 3. Guardar en Supabase (Usando 'resumen_cognitivo' según tu esquema)
    headers_sb = {
        "apikey": SB_KEY, 
        "Authorization": f"Bearer {SB_KEY}", 
        "Content-Type": "application/json"
    }
    
    datos = {
        "tipo_memoria": "auditoria_automatica",
        "nivel_riesgo": "Analizado",
        "resumen_cognitivo": reporte, # <-- Nombre exacto de tu columna
        "url_pdf": "pendiente_generacion"
    }
    
    url_tabla = f"{SB_URL}/rest/v1/ai_memoria_documental"
    envio = requests.post(url_tabla, json=datos, headers=headers_sb)
    
    if envio.status_code in [200, 201]:
        print("✅ ¡Éxito! El reporte se guardó en resumen_cognitivo.")
    else:
        print(f"❌ Error Supabase: {envio.text}")

if __name__ == "__main__":
    ejecutar_auditoria()