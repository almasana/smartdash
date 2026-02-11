import os
from pathlib import Path
from groq import Groq
from dotenv import load_dotenv

BASE_DIR = Path(r"E:\BuenosPasos\smartd-dashb-clean")
load_dotenv(dotenv_path=BASE_DIR / ".env.local")

class SmartDashCopilot:
    def __init__(self):
        self.client = Groq(api_key=os.getenv("GROQ_API_KEY"))
        # El sistema ahora sabe qué archivos existen pero NO los lee aún
        self.history = [{
            "role": "system", 
            "content": "Eres un ingeniero senior. Conoces la lista de archivos del proyecto, pero solo analizarás su contenido cuando el usuario te lo pida explícitamente."
        }]
        self._indexar_archivos()

    def _indexar_archivos(self):
        """Crea un mapa mental de los archivos disponibles sin gastar tokens en contenido."""
        archivos = []
        for f in BASE_DIR.rglob("*"):
            if f.is_file() and not any(part.startswith('.') for part in f.parts):
                archivos.append(str(f.relative_to(BASE_DIR)))
        
        lista_archivos = "\n".join(archivos)
        self.history.append({
            "role": "system", 
            "content": f"MAPA DEL PROYECTO:\n{lista_archivos}"
        })

    def chat(self, user_input):
        # Si el input coincide con un archivo, lo inyectamos como contexto
        potential_path = BASE_DIR / user_input.strip()
        
        if os.path.isfile(potential_path):
            try:
                content = potential_path.read_text(encoding='utf-8')
                print(f"📄 [Sistema]: Inyectando contenido de {user_input} para análisis...")
                processed_input = f"ANALIZA ESTE ARCHIVO:\nNombre: {user_input}\nContenido:\n{content}"
            except Exception as e:
                processed_input = f"Error al leer: {e}"
        else:
            processed_input = user_input

        self.history.append({"role": "user", "content": processed_input})
        
        try:
            response = self.client.chat.completions.create(
                model="llama-3.3-70b-versatile",
                messages=self.history
            )
            ans = response.choices[0].message.content
            print(f"\n🤖:\n{ans}\n")
            self.history.append({"role": "assistant", "content": ans})
        except Exception as e:
            print(f"\n❌ Error de API: {e}")

if __name__ == "__main__":
    app = SmartDashCopilot()
    print("🚀 Copiloto Saneado. Escribe una ruta para auditarla o chatea normalmente.")
    while True:
        try:
            val = input("👤: ").strip()
            if val.lower() in ["salir", "exit"]: break
            if val: app.chat(val)
        except KeyboardInterrupt: break