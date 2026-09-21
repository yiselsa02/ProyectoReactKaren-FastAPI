import os
import smtplib
import ssl

from dotenv import load_dotenv

load_dotenv()

host = os.getenv("SMTP_HOST")
port = int(os.getenv("SMTP_PORT", "587"))
username = os.getenv("SMTP_USER")
password = (os.getenv("SMTP_PASSWORD") or "").replace(" ", "")

print("====================================")
print("       PRUEBA DE GMAIL SMTP")
print("====================================")
print("Usuario:", username)
print("Contraseña cargada:", bool(password))
print("Servidor:", host)
print("Puerto:", port)
print("====================================")

context = ssl.create_default_context()

try:
    with smtplib.SMTP(host, port, timeout=15) as server:
        server.ehlo()
        server.starttls(context=context)
        server.ehlo()

        print("STARTTLS: OK")
        print("Intentando iniciar sesión...")

        server.login(username, password)

        print("====================================")
        print("LOGIN DE GMAIL: EXITOSO")
        print("====================================")

except smtplib.SMTPAuthenticationError as error:
    print("====================================")
    print("ERROR DE AUTENTICACIÓN DE GMAIL")
    print(error)
    print("====================================")

except Exception as error:
    print("====================================")
    print("ERROR SMTP")
    print(error)
    print("====================================")