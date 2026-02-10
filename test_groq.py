import os
from groq import Groq

# Inicializamos el cliente
client = Groq(api_key=os.environ.get("GROQ_API_KEY"))

try:
    # Hacemos una consulta simple
    completion = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[
            {"role": "user", "content": "Hola Groq, confirma que SmartDash FV está listo para volar."}
        ]
    )
    print("\n🚀 RESPUESTA DE GROQ:")
    print(completion.choices[0].message.content)
except Exception as e:
    print(f"\n❌ ERROR: {e}")

