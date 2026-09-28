import re

from fastapi import APIRouter
from pydantic import BaseModel, Field


router = APIRouter(tags=["Chatbot"])


# ============================================================
# MODELOS
# ============================================================

class ChatMessage(BaseModel):
    role: str = Field(pattern="^(user|assistant)$")
    content: str = Field(min_length=1, max_length=4000)


class ChatRequest(BaseModel):
    message: str = Field(min_length=1, max_length=4000)
    history: list[ChatMessage] = Field(
        default_factory=list,
        max_length=20,
    )


# ============================================================
# FUNCIONES AUXILIARES
# ============================================================

def limpiar_texto(texto: str) -> str:
    """
    Convierte el mensaje a minúsculas y elimina caracteres
    innecesarios para facilitar la detección de palabras.
    """
    texto = texto.lower().strip()

    reemplazos = {
        "á": "a",
        "é": "e",
        "í": "i",
        "ó": "o",
        "ú": "u",
        "ü": "u",
        "ñ": "n",
    }

    for original, reemplazo in reemplazos.items():
        texto = texto.replace(original, reemplazo)

    return re.sub(r"\s+", " ", texto)


def contiene_alguna(texto: str, palabras: list[str]) -> bool:
    return any(palabra in texto for palabra in palabras)


def ultima_pregunta(history: list[ChatMessage]) -> str:
    """
    Obtiene el último mensaje del usuario del historial.
    """
    for mensaje in reversed(history):
        if mensaje.role == "user":
            return limpiar_texto(mensaje.content)

    return ""


# ============================================================
# RESPUESTAS
# ============================================================

def generar_respuesta(mensaje: str, history: list[ChatMessage]) -> str:
    texto = limpiar_texto(mensaje)

    anterior = ultima_pregunta(history)

    # --------------------------------------------------------
    # SALUDOS
    # --------------------------------------------------------

    if contiene_alguna(
        texto,
        [
            "hola",
            "holi",
            "hello",
            "buenas",
            "buenos dias",
            "buenas tardes",
            "buenas noches",
            "hey",
            "que tal",
        ],
    ):
        if "como estas" in texto or "como te va" in texto:
            return (
                "¡Muy bien! 😄 Soy CellBot, el asistente virtual de "
                "CellWorld. Puedo orientarte sobre productos, carrito, "
                "compras, pedidos, facturas, PQR y las diferentes "
                "secciones de la página. ¿Qué necesitas?"
            )

        return (
            "¡Hola! 👋 Soy CellBot de CellWorld. Puedo ayudarte a "
            "conocer la página, encontrar productos, usar el carrito, "
            "consultar compras, revisar facturas, gestionar PQR y "
            "entender las opciones de tu cuenta. ¿Qué quieres hacer?"
        )

    # --------------------------------------------------------
    # QUIÉN ES CELBOT
    # --------------------------------------------------------

    if contiene_alguna(
        texto,
        [
            "quien eres",
            "que eres",
            "eres un bot",
            "eres una ia",
            "eres inteligencia artificial",
            "como te llamas",
        ],
    ):
        return (
            "Soy CellBot 🤖, el asistente virtual de CellWorld. Estoy "
            "diseñado para orientarte sobre el funcionamiento de la "
            "tienda, productos, carrito, compras, pedidos, facturas, "
            "cuenta y PQR."
        )

    # --------------------------------------------------------
    # CELLWORLD / PÁGINA
    # --------------------------------------------------------

    if contiene_alguna(
        texto,
        [
            "que es cellworld",
            "que es cell world",
            "sobre cellworld",
            "sobre la pagina",
            "sobre la tienda",
            "que venden",
            "que ofrece cellworld",
        ],
    ):
        return (
            "CellWorld es una tienda virtual enfocada en celulares y "
            "accesorios. Desde la página puedes consultar productos, "
            "agregarlos al carrito, realizar compras, revisar tus "
            "pedidos y facturas, gestionar tu cuenta y presentar PQR."
        )

    # --------------------------------------------------------
    # PRODUCTOS / CATÁLOGO
    # --------------------------------------------------------

    if contiene_alguna(
        texto,
        [
            "producto",
            "productos",
            "catalogo",
            "catalogo de productos",
            "celulares",
            "celular",
            "telefono",
            "telefonos",
            "accesorios",
            "que tienen",
            "que venden",
        ],
    ):
        return (
            "📱 Puedes consultar los productos disponibles desde la "
            "sección **Productos** de CellWorld. Allí puedes revisar "
            "la información de cada producto y agregar los que te "
            "interesen al carrito. Para conocer precios y disponibilidad "
            "actuales, revisa directamente el catálogo."
        )

    # --------------------------------------------------------
    # PRECIO
    # --------------------------------------------------------

    if contiene_alguna(
        texto,
        [
            "precio",
            "precios",
            "cuanto cuesta",
            "cuanto vale",
            "valor",
            "vale",
            "cuesta",
        ],
    ):
        return (
            "💰 Los precios dependen del producto que estés consultando. "
            "CellBot no inventa precios: revisa la sección **Productos** "
            "para consultar el valor actualizado de cada artículo."
        )

    # --------------------------------------------------------
    # STOCK / DISPONIBILIDAD
    # --------------------------------------------------------

    if contiene_alguna(
        texto,
        [
            "stock",
            "disponibilidad",
            "disponible",
            "agotado",
            "hay unidades",
            "hay existencias",
        ],
    ):
        return (
            "📦 Para comprobar si un producto está disponible, revisa "
            "su información directamente en el catálogo de CellWorld. "
            "La disponibilidad puede cambiar según las existencias."
        )

    # --------------------------------------------------------
    # CARRITO
    # --------------------------------------------------------

    if contiene_alguna(
        texto,
        [
            "carrito",
            "carro",
            "agregar al carrito",
            "añadir al carrito",
            "quitar del carrito",
            "eliminar del carrito",
        ],
    ):
        return (
            "🛒 En el carrito puedes revisar los productos que "
            "seleccionaste antes de realizar tu compra. Puedes agregar "
            "productos desde el catálogo y modificar las cantidades "
            "o eliminar artículos antes de confirmar el pedido."
        )

    # --------------------------------------------------------
    # COMPRAR
    # --------------------------------------------------------

    if contiene_alguna(
        texto,
        [
            "comprar",
            "compra",
            "compras",
            "hacer una compra",
            "realizar una compra",
            "como compro",
            "quiero comprar",
            "quiero hacer un pedido",
        ],
    ):
        return (
            "🛍️ Para comprar, selecciona los productos que quieras desde "
            "el catálogo, agrégalos al carrito y revisa el resumen de "
            "la compra. Después puedes continuar con el proceso de "
            "confirmación del pedido."
        )

    # --------------------------------------------------------
    # PEDIDOS
    # --------------------------------------------------------

    if contiene_alguna(
        texto,
        [
            "pedido",
            "pedidos",
            "mi pedido",
            "mis pedidos",
            "estado del pedido",
            "estado de mi pedido",
        ],
    ):
        return (
            "📦 Si tienes una cuenta de cliente, puedes consultar tus "
            "pedidos desde **Mis compras** en tu panel. Allí puedes "
            "revisar la información de las compras realizadas y su "
            "estado cuando esté disponible."
        )

    # --------------------------------------------------------
    # MIS COMPRAS
    # --------------------------------------------------------

    if contiene_alguna(
        texto,
        [
            "mis compras",
            "historial de compras",
            "compras realizadas",
            "compras anteriores",
            "donde veo mis compras",
            "donde estan mis compras",
        ],
    ):
        return (
            "🧾 Tus compras se pueden consultar desde **Mis compras** "
            "en el Panel Cliente. Esa sección está destinada a mostrar "
            "el historial de compras realizadas con tu cuenta."
        )

    # --------------------------------------------------------
    # FACTURAS
    # --------------------------------------------------------

    if contiene_alguna(
        texto,
        [
            "factura",
            "facturas",
            "mi factura",
            "mis facturas",
            "factura de compra",
            "ver factura",
            "descargar factura",
        ],
    ):
        return (
            "🧾 Las facturas están relacionadas con tus compras. Desde "
            "el historial correspondiente puedes consultar la información "
            "de tus ventas/compras y acceder a la factura cuando esté "
            "disponible."
        )

    # --------------------------------------------------------
    # PAGOS
    # --------------------------------------------------------

    if contiene_alguna(
        texto,
        [
            "pago",
            "pagos",
            "pagar",
            "como pago",
            "metodos de pago",
            "forma de pago",
        ],
    ):
        return (
            "💳 Para realizar una compra, revisa las opciones de pago "
            "que aparezcan durante el proceso de confirmación. CellBot "
            "no solicita contraseñas, claves ni datos confidenciales."
        )

    # --------------------------------------------------------
    # CUENTA
    # --------------------------------------------------------

    if contiene_alguna(
        texto,
        [
            "cuenta",
            "mi cuenta",
            "perfil",
            "mi perfil",
            "datos personales",
            "informacion personal",
        ],
    ):
        return (
            "👤 Desde tu cuenta puedes consultar y administrar la "
            "información disponible en tu **Perfil**. Si eres cliente, "
            "también tienes acceso a las funciones de tu Panel Cliente, "
            "como compras y PQR."
        )

    # --------------------------------------------------------
    # REGISTRO
    # --------------------------------------------------------

    if contiene_alguna(
        texto,
        [
            "registrarme",
            "registrar",
            "registro",
            "crear cuenta",
            "crear una cuenta",
            "como me registro",
        ],
    ):
        return (
            "📝 Para registrarte en CellWorld, utiliza la opción de "
            "**Registro** y completa los datos solicitados. Después "
            "podrás iniciar sesión con tu cuenta."
        )

    # --------------------------------------------------------
    # LOGIN
    # --------------------------------------------------------

    if contiene_alguna(
        texto,
        [
            "iniciar sesion",
            "iniciar sesión",
            "login",
            "entrar",
            "ingresar",
            "como entro",
            "no puedo entrar",
        ],
    ):
        return (
            "🔐 Para ingresar a CellWorld utiliza la opción **Iniciar "
            "sesión** y proporciona tus credenciales. Si olvidaste tu "
            "contraseña, puedes utilizar la opción de recuperación."
        )

    # --------------------------------------------------------
    # CONTRASEÑA
    # --------------------------------------------------------

    if contiene_alguna(
        texto,
        [
            "contraseña",
            "contrasena",
            "olvide mi contraseña",
            "olvide la contraseña",
            "recuperar contraseña",
            "recuperar contrasena",
            "cambiar contraseña",
        ],
    ):
        return (
            "🔑 Si olvidaste tu contraseña, utiliza la opción **Recuperar "
            "contraseña** desde el inicio de sesión y sigue el proceso "
            "indicado por la página. Nunca compartas tu contraseña con "
            "CellBot."
        )

    # --------------------------------------------------------
    # PQR
    # --------------------------------------------------------

    if contiene_alguna(
        texto,
        [
            "pqr",
            "peticion",
            "petición",
            "queja",
            "reclamo",
            "sugerencia",
            "solicitud",
        ],
    ):
        return (
            "📨 Las PQR permiten registrar peticiones, quejas, reclamos "
            "o sugerencias relacionadas con CellWorld. Como cliente, "
            "puedes acceder a la sección de PQR desde tu panel para "
            "gestionar tus solicitudes."
        )

    # --------------------------------------------------------
    # GARANTÍA
    # --------------------------------------------------------

    if contiene_alguna(
        texto,
        [
            "garantia",
            "garantía",
            "garantias",
            "garantías",
            "producto defectuoso",
            "producto dañado",
        ],
    ):
        return (
            "🛠️ Si tienes un inconveniente con un producto, puedes "
            "utilizar el sistema de PQR de CellWorld para registrar "
            "tu solicitud y dejar constancia del problema. Para conocer "
            "las condiciones específicas, revisa las políticas de la "
            "tienda o comunícate con soporte."
        )

    # --------------------------------------------------------
    # CONTACTO
    # --------------------------------------------------------

    if contiene_alguna(
        texto,
        [
            "contacto",
            "contactar",
            "soporte",
            "ayuda",
            "hablar con soporte",
            "comunicarme",
        ],
    ):
        return (
            "📞 Puedes utilizar la sección **Contacto** de CellWorld "
            "para consultar los medios disponibles para comunicarte "
            "con la tienda. También puedes utilizar las PQR para "
            "registrar formalmente una solicitud."
        )

    # --------------------------------------------------------
    # QUIÉNES SOMOS
    # --------------------------------------------------------

    if contiene_alguna(
        texto,
        [
            "quienes son",
            "quienes somos",
            "quien es cellworld",
            "informacion de cellworld",
            "historia de cellworld",
        ],
    ):
        return (
            "🏪 En **Quiénes somos** puedes consultar la información "
            "general sobre CellWorld, su propósito y la información "
            "presentada por la tienda."
        )

    # --------------------------------------------------------
    # ADMINISTRADOR
    # --------------------------------------------------------

    if contiene_alguna(
        texto,
        [
            "administrador",
            "admin",
            "panel administrador",
            "panel admin",
        ],
    ):
        return (
            "⚙️ El Panel Administrador está destinado a la gestión "
            "administrativa de CellWorld. Según los permisos asignados, "
            "puede incluir funciones relacionadas con usuarios, "
            "productos, ventas y otras operaciones del sistema."
        )

    # --------------------------------------------------------
    # EMPLEADO
    # --------------------------------------------------------

    if contiene_alguna(
        texto,
        [
            "empleado",
            "panel empleado",
            "trabajador",
        ],
    ):
        return (
            "👨‍💼 El Panel Empleado contiene las herramientas disponibles "
            "para los usuarios con rol de empleado, incluyendo funciones "
            "relacionadas con productos, ventas, historial y reportes."
        )

    # --------------------------------------------------------
    # CLIENTE
    # --------------------------------------------------------

    if contiene_alguna(
        texto,
        [
            "panel cliente",
            "cliente",
            "que puedo hacer como cliente",
            "funciones del cliente",
        ],
    ):
        return (
            "👤 En el Panel Cliente puedes gestionar las funciones "
            "relacionadas con tu cuenta, consultar tus compras, revisar "
            "información de pedidos, consultar facturas y gestionar "
            "tus PQR."
        )

    # --------------------------------------------------------
    # LOGOUT
    # --------------------------------------------------------

    if contiene_alguna(
        texto,
        [
            "cerrar sesion",
            "cerrar sesión",
            "salir",
            "logout",
        ],
    ):
        return (
            "🚪 Para cerrar tu sesión utiliza la opción **Cerrar sesión** "
            "de la página. Esto finalizará tu sesión actual en CellWorld."
        )

    # --------------------------------------------------------
    # GRACIAS
    # --------------------------------------------------------

    if contiene_alguna(
        texto,
        [
            "gracias",
            "muchas gracias",
            "te agradezco",
        ],
    ):
        return (
            "¡Con gusto! 😊 Si necesitas ayuda con CellWorld, puedes "
            "preguntarme sobre productos, carrito, compras, pedidos, "
            "facturas, cuenta o PQR."
        )

    # --------------------------------------------------------
    # DESPEDIDA
    # --------------------------------------------------------

    if contiene_alguna(
        texto,
        [
            "adios",
            "adiós",
            "chao",
            "hasta luego",
            "nos vemos",
        ],
    ):
        return (
            "¡Hasta luego! 👋 Espero que disfrutes tu experiencia en "
            "CellWorld. Aquí estaré si necesitas orientación."
        )

    # --------------------------------------------------------
    # CONTEXTO DE CONVERSACIÓN
    # --------------------------------------------------------

    if contiene_alguna(
        texto,
        [
            "y eso",
            "y despues",
            "y después",
            "y luego",
            "despues que",
            "después que",
            "como sigo",
            "que sigue",
            "que hago despues",
            "qué hago después",
        ],
    ):
        if contiene_alguna(
            anterior,
            ["carrito", "comprar", "compra"],
        ):
            return (
                "Después de agregar los productos al carrito, revisa "
                "las cantidades y el resumen de la compra. Luego continúa "
                "con la confirmación del pedido."
            )

        if contiene_alguna(
            anterior,
            ["pqr", "queja", "reclamo", "peticion", "sugerencia"],
        ):
            return (
                "Después de entrar a PQR, completa la información de "
                "la solicitud y registra el caso. Posteriormente podrás "
                "consultar su estado desde la sección correspondiente."
            )

        if contiene_alguna(
            anterior,
            ["registro", "crear cuenta"],
        ):
            return (
                "Después de completar el registro, puedes volver al "
                "inicio de sesión e ingresar con la cuenta que acabas "
                "de crear."
            )

        return (
            "Depende de lo que quieras hacer. Puedes preguntarme por "
            "productos, carrito, compras, pedidos, facturas, cuenta, "
            "PQR o cualquiera de las secciones de CellWorld."
        )

    # --------------------------------------------------------
    # PREGUNTAS GENERALES SOBRE LA PÁGINA
    # --------------------------------------------------------

    if contiene_alguna(
        texto,
        [
            "como funciona",
            "como funciona la pagina",
            "como uso la pagina",
            "que puedo hacer",
            "que puedo hacer aqui",
            "ayudame",
            "necesito ayuda",
            "no se que hacer",
        ],
    ):
        return (
            "Claro 😊. En CellWorld puedes explorar el catálogo, "
            "consultar productos, agregarlos al carrito y realizar "
            "compras. Si tienes una cuenta también puedes acceder a "
            "tu perfil, consultar tus compras y facturas y gestionar "
            "PQR. ¿Sobre cuál de esas funciones necesitas ayuda?"
        )

    # --------------------------------------------------------
    # PREGUNTAS SOBRE NAVEGACIÓN
    # --------------------------------------------------------

    if contiene_alguna(
        texto,
        [
            "donde esta",
            "donde encuentro",
            "donde puedo",
            "en que parte",
            "en que seccion",
            "que seccion",
        ],
    ):
        return (
            "Puedes encontrar las funciones principales desde el menú "
            "de navegación de CellWorld. **Productos** sirve para "
            "consultar el catálogo, el **Carrito** para revisar tus "
            "selecciones y, si tienes una cuenta, el **Panel Cliente** "
            "para acceder a compras, facturas, perfil y PQR."
        )

    # --------------------------------------------------------
    # RESPUESTA GENERAL
    # --------------------------------------------------------

    return (
        "Entiendo 😊. Soy CellBot y puedo orientarte sobre el "
        "funcionamiento de CellWorld. Puedo ayudarte con productos, "
        "catálogo, carrito, compras, pedidos, facturas, cuenta, "
        "recuperación de contraseña, PQR, contacto y los paneles "
        "de cliente, empleado y administrador. "
        "Cuéntame qué quieres hacer en la página y te indico cómo."
    )


# ============================================================
# ENDPOINT
# ============================================================

@router.post("")
def responder_chatbot(data: ChatRequest):
    respuesta = generar_respuesta(
        data.message,
        data.history,
    )

    return {
        "success": True,
        "reply": respuesta,
    }