import asyncio
import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText

from app.config import settings


async def send_email(to: str, subject: str, html_body: str) -> bool:
    """Envía un email. Retorna True si fue exitoso, False si no."""
    if not settings.SMTP_ENABLED or not settings.SMTP_USER:
        # En desarrollo: solo imprime el código en consola
        print(f"\n{'='*50}")
        print(f"[EMAIL SIMULADO] Para: {to}")
        print(f"Asunto: {subject}")
        print(f"Cuerpo:\n{html_body}")
        print(f"{'='*50}\n")
        return True

    def _send():
        msg = MIMEMultipart("alternative")
        msg["Subject"] = subject
        msg["From"] = settings.SMTP_FROM
        msg["To"] = to
        msg.attach(MIMEText(html_body, "html"))
        with smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT) as server:
            server.ehlo()
            server.starttls()
            server.login(settings.SMTP_USER, settings.SMTP_PASSWORD)
            server.sendmail(settings.SMTP_FROM, to, msg.as_string())

    try:
        await asyncio.to_thread(_send)
        return True
    except Exception as e:
        print(f"[EMAIL ERROR] {e}")
        return False


def build_reset_code_email(nombre: str, codigo: str) -> str:
    return f"""
    <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px;">
      <h2 style="color: #1e293b; margin-bottom: 8px;">Recuperación de contraseña</h2>
      <p style="color: #64748b; margin-bottom: 24px;">
        Hola {nombre}, recibimos una solicitud para restablecer tu contraseña en Habitare.
      </p>
      <div style="background: #f1f5f9; border-radius: 12px; padding: 24px; text-align: center; margin-bottom: 24px;">
        <p style="color: #64748b; font-size: 14px; margin: 0 0 8px;">Tu código de verificación es:</p>
        <p style="font-size: 40px; font-weight: 700; letter-spacing: 12px; color: #2563eb; margin: 0;">
          {codigo}
        </p>
      </div>
      <p style="color: #94a3b8; font-size: 13px;">
        Este código expira en <strong>15 minutos</strong>.<br>
        Si no solicitaste este cambio, ignora este correo.
      </p>
    </div>
    """
