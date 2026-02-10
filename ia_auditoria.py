import os
import requests
import json

def ejecutar_auditoria():
    # Cargar Secretos (FV)
    GROQ_KEY = os.getenv('GROQ_API_KEY')
    SB_URL = os.getenv('NEXT_PUBLIC_SUPABASE_URL')
    SB_KEY = os.getenv('SUPABASE_SERVICE_ROLE_KEY')

    if not all([GROQ_KEY, SB_URL, SB_KEY]):
        print("❌ Error: Faltan secretos en la configuración de GitHub.")
        return

    print("🚀 Iniciando auditoría cognitiva...")

    # 1. Obtener datos de Supabase (Ejemplo: últimos eventos de riesgo)
    headers_sb = {
        "apikey": SB_KEY,
        "Authorization": f"Bearer {SB_KEY}",
        "Content-Type": "application/json"
    }
    
    # Intentamos traer los datos de tus clientes o alertas
    response = requests.get(f"{SB_URL}/rest/v1/clientes?select=*", headers=headers_sb)
    if response.status_code != 200:
        print(f"❌ Error al conectar con Supabase: {response.text}")
        return
    
    contexto_datos = response.json()

    # 2. Consultar a Groq (IA)
    headers_groq = {
        "Authorization": f"Bearer {GROQ_KEY}",
        "Content-Type": "application/json"
    }
    
    payload = {
        "model": "llama-3.3-70b-versatile",
        "messages": [
            {"role": "system", "content": "Sos el auditor de SmartDash. Analizá los datos y generá un reporte de riesgo narrativo."},
            {"role": "user", "content": f"Datos actuales: {json.dumps(contexto_datos)}"}
        ]
    }

    res_ia = requests.post("https://api.groq.com/openai/v1/chat/completions", json=payload, headers=headers_groq)
    reporte = res_ia.json()['choices'][0]['message']['content']

    # 3. Guardar en ai_memoria_documental
    data_save = {
        "resumen_indexado": reporte[:200],
        "tipo_memoria": "auditoria_automatica",
        "nivel_riesgo": "Analizado por IA"
        # Agregá más campos según tu tabla
    }
    
    res_save = requests.post(f"{SB_URL}/rest/v1/ai_memoria_documental", json=data_save, headers=headers_sb)
    
    if res_save.status_code in [200, 201]:
        print("✅ Memoria cognitiva guardada con éxito.")
    else:
        print(f"❌ Error al guardar memoria: {res_save.text}")

if __name__ == "__main__":
    ejecutar_auditoria()
