import os
import smtplib
import ssl
from email.message import EmailMessage


class EmailConfigurationError(RuntimeError):
    pass


def send_password_reset_email(recipient: str, code: str) -> None:
    # Vercel / producción
    host = os.environ.get("SMTP_HOST")
    port = int(os.environ.get("SMTP_PORT", "587"))
    username = os.environ.get("SMTP_USER")
    password = os.environ.get("SMTP_PASSWORD")

    use_ssl = (
        os.environ.get("SMTP_USE_SSL", "false").lower() == "true"
    )

    if not host:
        raise EmailConfigurationError(
            "Falta la variable SMTP_HOST en el entorno de producción."
        )

    if not username:
        raise EmailConfigurationError(
            "Falta la variable SMTP_USER en el entorno de producción."
        )

    if not password:
        raise EmailConfigurationError(
            "Falta la variable SMTP_PASSWORD en el entorno de producción."
        )

    password = password.replace(" ", "")

    message = EmailMessage()
    message["Subject"] = "Tu código de recuperación | CellWorld"
    message["From"] = username
    message["To"] = recipient

    message.set_content(
        "Código de recuperación de CellWorld\n\n"
        f"Tu código es: {code}\n\n"
        "Copia este código en la aplicación CellWorld para continuar. "
        "Es válido durante 30 minutos y solo puede utilizarse una vez."
    )

    message.add_alternative(
        f"""
        <!doctype html>
        <html lang="es">
          <body style="margin:0;background:#f1f5f9;font-family:Arial,sans-serif;color:#172033">
            <div style="max-width:560px;margin:32px auto;background:#ffffff;border:1px solid #dbe3ef;border-radius:16px;overflow:hidden">

              <div style="padding:28px 32px;background:#0b1422;color:#ffffff">
                <div style="font-size:24px;font-weight:800">
                  Cell<span style="color:#2563eb">World</span>
                </div>

                <div style="margin-top:8px;font-size:12px;letter-spacing:2px;color:#94a3b8">
                  TECNOLOGIA
                </div>
              </div>

              <div style="padding:32px">
                <h1 style="margin:0 0 14px;font-size:24px">
                  Código de recuperación
                </h1>

                <p style="font-size:15px;line-height:1.6;color:#64748b">
                  Copia este código en la aplicación CellWorld para continuar
                  con la recuperación de tu cuenta:
                </p>

                <div style="display:inline-block;margin:18px 0;padding:16px 24px;border-radius:10px;background:#eff6ff;color:#2563eb;font-size:32px;letter-spacing:8px;font-weight:800">
                  {code}
                </div>

                <p style="font-size:13px;line-height:1.6;color:#94a3b8">
                  Vence en 30 minutos y solo puede utilizarse una vez.
                  Si no solicitaste este código, ignora este mensaje.
                </p>
              </div>

            </div>
          </body>
        </html>
        """,
        subtype="html",
    )

    context = ssl.create_default_context()

    # Gmail SSL directo
    if use_ssl:
        with smtplib.SMTP_SSL(
            host,
            port,
            context=context,
            timeout=15
        ) as server:
            server.login(username, password)
            server.send_message(message)

        return

    # Gmail STARTTLS — puerto 587
    with smtplib.SMTP(
        host,
        port,
        timeout=15
    ) as server:
        server.ehlo()
        server.starttls(context=context)
        server.ehlo()
        server.login(username, password)
        server.send_message(message)