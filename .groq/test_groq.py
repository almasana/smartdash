import os
from groq import Groq

# 1. Inicialización
client = Groq(api_key=os.environ.get("GROQ_API_KEY"))

# 2. Definimos el historial con un 'system prompt' para darle contexto al modelo
mensajes = [
    {
        "role": "system", 
        "content": "Eres un asistente experto para el proyecto SmartDash FV. Ayudas con el código y la telemetría de vuelo."
    }
]

print("--- 🚀 SmartDash FV Chat Activo (Escribe 'salir' para terminar) ---")

while True:
    # 3. Entrada del usuario
    usuario_input = input("\n👤 Tú: ")
    
    if usuario_input.lower() in ["salir", "exit", "quit"]:
        print("Cerrando sesión de vuelo. ¡Hasta pronto!")
        break

    # Añadimos lo que escribes al historial
    mensajes.append({"role": "user", "content": usuario_input})

    try:
    # 1. Realizamos la consulta capturando la respuesta completa
    response = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=mensajes,
        temperature=0.7
    )

    respuesta = response.choices[0].message.content
    
    # 2. Extraer datos de consumo (Tokens)
    consumo = response.usage
    prompt = consumo.prompt_tokens
    completado = consumo.completion_tokens
    total = consumo.total_tokens

    # 3. Mostrar respuesta y estadísticas
    print(f"\n🤖 Groq: {respuesta}")
    
    print("-" * 30)
    print(f"📊 CONSUMO DE ESTE VUELO:")
    print(f"   🔹 Enviados (Prompt): {prompt}")
    print(f"   🔹 Generados (AI):    {completado}")
    print(f"   🔹 Total Sesión:      {total} tokens")
    print("-" * 30)

    mensajes.append({"role": "assistant", "content": respuesta})

except Exception as e:
    print(f"\n❌ ERROR: {e}")

