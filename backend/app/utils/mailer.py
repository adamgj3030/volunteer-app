from flask import current_app
from flask_mail import Message
from logging import getLogger

logger = getLogger(__name__)

mail = None  # will be initialized in app factory


def init_mail(app):
    global mail
    from flask_mail import Mail
    mail = Mail(app)
    return mail


def send_email_confirmation(to_email: str, confirm_url: str):
    subject = "Confirm your account"
    body = f"Please confirm your email by clicking the link: {confirm_url}\nIf you did not create an account, you can ignore this email."
    html = f"""
    <p>Welcome!</p>
    <p>Click the button below to confirm your email and activate your account.</p>
    <p><a href="{confirm_url}" style="padding:10px 18px;background:#52796f;color:#fff;text-decoration:none;border-radius:4px;">Confirm Email</a></p>
    <p>If the button doesn't work, copy & paste this link into your browser:<br>{confirm_url}</p>
    """
    if mail is None:
        logger.warning("Mailer not initialized; printing email to console.")
        print("=== EMAIL (DEV) ===")
        print("To:", to_email)
        print("Subject:", subject)
        print(body)
        print("=== END EMAIL ===")
        return

    msg = Message(subject=subject, recipients=[to_email], body=body, html=html)
    try:
        mail.send(msg)
    except Exception as exc:  # noqa: BLE001
        logger.exception("Failed to send email: %s", exc)