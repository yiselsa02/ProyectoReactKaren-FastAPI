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
# UTILIDADES
# ============================================================

def normalizar(texto: str) -> str:
    """
    Normaliza el texto para poder reconocer preguntas aunque
    el usuario escriba con mayúsculas, tildes o signos.
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

    texto = re.sub(r"[¿?¡!.,;:()]+", " ", texto)
    texto = re.sub(r"\s+", " ", texto)

    return texto.strip()


def contiene(texto: str, palabras: list[str]) -> bool:
    return any(palabra in texto for palabra in palabras)


def historial_usuario(history: list[ChatMessage]) -> list[str]:
    return [
        normalizar(item.content)
        for item in history
        if item.role == "user"
    ]


def ultimo_tema(history: list[ChatMessage]) -> str:
    """
    Busca el último mensaje del usuario para poder interpretar
    preguntas como "¿y después qué hago?".
    """
    mensajes = historial_usuario(history)

    if not mensajes:
        return ""

    return mensajes[-1]


# ============================================================
# GENERADOR PRINCIPAL
# ============================================================

def generar_respuesta(
    mensaje: str,
    history: list[ChatMessage],
) -> str:

    texto = normalizar(mensaje)
    anterior = ultimo_tema(history)

    # ========================================================
    # SALUDOS
    # ========================================================

    if contiene(
        texto,
        [
            "hola",
            "holi",
            "hello",
            "hey",
            "buenas",
            "buenos dias",
            "buenas tardes",
            "buenas noches",
        ],
    ):
        return (
            "¡Hola! 👋 Soy **CellBot**, el asistente virtual de "
            "CellWorld. Puedo orientarte sobre prácticamente todas "
            "las funciones de la página: productos, carrito, compras, "
            "pedidos, facturas, cuenta, recuperación de contraseña, "
            "PQR y los paneles de cliente, empleado y administrador.\n\n"
            "Por ejemplo, puedes preguntarme **cómo iniciar sesión**, "
            "**cómo hacer una compra**, **dónde consultar tus compras** "
            "o **cómo registrar una PQR**."
        )

    # ========================================================
    # QUIÉN ES CELLBOT
    # ========================================================

    if contiene(
        texto,
        [
            "quien eres",
            "que eres",
            "como te llamas",
            "quien es cellbot",
            "que puedes hacer",
            "que sabes hacer",
        ],
    ):
        return (
            "Soy **CellBot**, el asistente virtual de CellWorld 🤖. "
            "Estoy pensado para ayudarte a utilizar la tienda y "
            "entender sus diferentes funciones.\n\n"
            "Puedo explicarte cómo buscar productos, utilizar el "
            "carrito, realizar compras, consultar pedidos y facturas, "
            "administrar tu cuenta, recuperar tu contraseña, registrar "
            "PQR y utilizar los diferentes paneles del sistema."
        )

    # ========================================================
    # INICIAR SESIÓN
    # ========================================================

    if contiene(
        texto,
        [
            "iniciar sesion",
            "iniciar sesión",
            "iniciar",
            "login",
            "iniciar cuenta",
            "entrar a mi cuenta",
            "entrar en mi cuenta",
            "ingresar a mi cuenta",
            "ingresar",
            "acceder a mi cuenta",
            "como entro",
            "como ingreso",
            "como accedo",
            "donde inicio sesion",
            "donde ingreso",
            "como inicio",
            "quiero entrar",
            "quiero ingresar",
        ],
    ):
        return (
            "🔐 Para iniciar sesión en **CellWorld**, entra a la opción "
            "**Iniciar sesión** desde el menú principal de la página. "
            "Allí encontrarás los campos para ingresar el correo "
            "electrónico y la contraseña de tu cuenta.\n\n"
            "Después de completar los datos, selecciona **Ingresar**. "
            "Si las credenciales son correctas, accederás a las "
            "funciones correspondientes a tu cuenta y a tu rol.\n\n"
            "Si no recuerdas tu contraseña, puedes utilizar la opción "
            "**¿Olvidaste tu contraseña?** para iniciar el proceso de "
            "recuperación."
        )

    # ========================================================
    # REGISTRO
    # ========================================================

    if contiene(
        texto,
        [
            "registrarme",
            "registrar una cuenta",
            "crear cuenta",
            "crear una cuenta",
            "hacer una cuenta",
            "nueva cuenta",
            "como me registro",
            "como registro",
            "como creo una cuenta",
            "quiero registrarme",
        ],
    ):
        return (
            "📝 Para crear una cuenta en **CellWorld**, entra a la "
            "opción de **Registro**. Allí debes completar los datos "
            "que solicita el formulario, como la información personal "
            "y las credenciales necesarias para acceder.\n\n"
            "Cuando termines el registro, podrás volver a **Iniciar "
            "sesión** utilizando los datos de la cuenta que acabas "
            "de crear. Una vez dentro, tendrás acceso a las funciones "
            "correspondientes al rol de cliente."
        )

    # ========================================================
    # RECUPERAR CONTRASEÑA
    # ========================================================

    if contiene(
        texto,
        [
            "olvide mi contraseña",
            "olvide la contraseña",
            "olvidé mi contraseña",
            "recuperar contraseña",
            "recuperar contrasena",
            "restablecer contraseña",
            "cambiar contraseña",
            "no recuerdo mi contraseña",
            "perdi mi contraseña",
            "perdi la contraseña",
        ],
    ):
        return (
            "🔑 Si olvidaste tu contraseña de **CellWorld**, ve a "
            "**Iniciar sesión** y selecciona la opción **¿Olvidaste "
            "tu contraseña?**.\n\n"
            "Desde allí puedes iniciar el proceso de recuperación "
            "siguiendo las instrucciones que aparecen en pantalla. "
            "Si el sistema solicita un código de recuperación enviado "
            "a tu correo, utiliza ese código para continuar.\n\n"
            "Por seguridad, nunca compartas tu contraseña ni códigos "
            "de recuperación con otras personas."
        )

    # ========================================================
    # PRODUCTOS / CATÁLOGO
    # ========================================================

    if contiene(
        texto,
        [
            "productos",
            "producto",
            "catalogo",
            "catálogo",
            "celulares",
            "celular",
            "telefono",
            "teléfono",
            "telefonos",
            "accesorios",
            "que productos tienen",
            "que venden",
            "que puedo comprar",
            "que tienen",
        ],
    ):
        return (
            "📱 Para consultar los productos de **CellWorld**, entra "
            "a la sección **Productos** desde el menú de la página.\n\n"
            "Allí puedes explorar los celulares y accesorios disponibles "
            "y revisar la información mostrada para cada producto. "
            "Cuando encuentres algo que quieras comprar, puedes "
            "agregarlo al carrito.\n\n"
            "Los precios y la disponibilidad deben comprobarse "
            "directamente en el catálogo, ya que pueden cambiar."
        )

    # ========================================================
    # BUSCAR PRODUCTO
    # ========================================================

    if contiene(
        texto,
        [
            "buscar producto",
            "buscar un producto",
            "como busco",
            "como encuentro un producto",
            "encontrar producto",
            "donde busco productos",
            "quiero buscar",
        ],
    ):
        return (
            "🔎 Para buscar un producto, entra a la sección "
            "**Productos** de CellWorld y revisa el catálogo disponible. "
            "Dependiendo de las opciones que aparezcan en la página, "
            "puedes utilizar los controles de búsqueda o filtrado para "
            "encontrar más fácilmente el artículo que necesitas.\n\n"
            "Después puedes abrir el producto para consultar sus datos "
            "y decidir si quieres agregarlo al carrito."
        )

    # ========================================================
    # PRECIOS
    # ========================================================

    if contiene(
        texto,
        [
            "precio",
            "precios",
            "cuanto cuesta",
            "cuanto vale",
            "cuánto cuesta",
            "cuánto vale",
            "valor del producto",
            "valor de los productos",
            "cuanto sale",
        ],
    ):
        return (
            "💰 Los precios de CellWorld se muestran directamente en "
            "el catálogo de productos. Es mejor consultar allí el "
            "producto específico que te interesa para ver su precio "
            "actual.\n\n"
            "CellBot no inventa precios ni te dará un valor aproximado "
            "si no tiene acceso al dato actualizado del catálogo."
        )

    # ========================================================
    # STOCK
    # ========================================================

    if contiene(
        texto,
        [
            "stock",
            "disponibilidad",
            "disponible",
            "agotado",
            "existencias",
            "hay unidades",
            "queda",
            "quedan",
        ],
    ):
        return (
            "📦 Para saber si un producto está disponible, revisa "
            "directamente la información que aparece en **Productos**. "
            "El stock puede cambiar cuando otros usuarios realizan "
            "compras, por lo que la información del catálogo es la "
            "referencia que debes utilizar."
        )

    # ========================================================
    # CARRITO
    # ========================================================

    if contiene(
        texto,
        [
            "carrito",
            "carro de compras",
            "mi carrito",
            "ver carrito",
            "como uso el carrito",
            "como funciona el carrito",
            "agregar al carrito",
            "añadir al carrito",
        ],
    ):
        return (
            "🛒 El **Carrito** sirve para reunir los productos que "
            "quieres comprar antes de confirmar el pedido.\n\n"
            "Primero entra a **Productos**, selecciona el artículo "
            "que te interesa y agrégalo al carrito. Después puedes "
            "abrir el carrito para revisar los productos seleccionados, "
            "modificar cantidades o eliminar artículos que ya no quieras.\n\n"
            "Cuando todo esté correcto, puedes continuar con el "
            "proceso de compra."
        )

    # ========================================================
    # ELIMINAR DEL CARRITO
    # ========================================================

    if contiene(
        texto,
        [
            "borrar del carrito",
            "borrar producto",
            "eliminar del carrito",
            "quitar del carrito",
            "sacar del carrito",
            "como elimino un producto",
        ],
    ):
        return (
            "🗑️ Para quitar un producto del carrito, abre la sección "
            "**Carrito**, busca el artículo que ya no deseas y utiliza "
            "la opción para eliminarlo.\n\n"
            "Después puedes revisar nuevamente el resumen para comprobar "
            "que el producto haya desaparecido y que el total se haya "
            "actualizado correctamente."
        )

    # ========================================================
    # COMPRAR
    # ========================================================

    if contiene(
        texto,
        [
            "como compro",
            "como hago una compra",
            "como hacer una compra",
            "como realizo una compra",
            "quiero comprar",
            "quiero hacer una compra",
            "quiero realizar una compra",
            "hacer una compra",
            "realizar una compra",
            "comprar un producto",
        ],
    ):
        return (
            "🛍️ Para realizar una compra en **CellWorld**, sigue estos "
            "pasos:\n\n"
            "1. Entra a **Productos** y busca el artículo que quieres.\n"
            "2. Selecciona el producto y agrégalo al **Carrito**.\n"
            "3. Abre el carrito y revisa productos, cantidades y total.\n"
            "4. Continúa con el proceso de confirmación de la compra.\n"
            "5. Una vez registrada, podrás consultar la compra desde "
            "**Mis compras** en tu Panel Cliente.\n\n"
            "Antes de confirmar, revisa cuidadosamente la información "
            "del pedido."
        )

    # ========================================================
    # RESUMEN / CONFIRMACIÓN DE COMPRA
    # ========================================================

    if contiene(
        texto,
        [
            "resumen de compra",
            "resumen de la compra",
            "confirmar compra",
            "confirmar la compra",
            "confirmacion de compra",
            "confirmación de compra",
            "antes de comprar",
            "revisar compra",
        ],
    ):
        return (
            "🧾 Antes de confirmar una compra, revisa el resumen del "
            "pedido. Allí debes comprobar los productos seleccionados, "
            "sus cantidades y el total de la operación.\n\n"
            "Si todo está correcto, puedes continuar con la confirmación. "
            "Después de registrar la compra, podrás consultar su "
            "información desde **Mis compras**."
        )

    # ========================================================
    # MIS COMPRAS
    # ========================================================

    if contiene(
        texto,
        [
            "mis compras",
            "donde veo mis compras",
            "donde estan mis compras",
            "dónde están mis compras",
            "historial de compras",
            "compras realizadas",
            "compras anteriores",
            "ver mis compras",
            "consultar mis compras",
        ],
    ):
        return (
            "🧾 Para consultar tus compras, inicia sesión con tu cuenta "
            "de cliente y entra al **Panel Cliente**. Allí encontrarás "
            "la sección **Mis compras**.\n\n"
            "En esa sección puedes consultar el historial de las "
            "compras realizadas con tu cuenta y revisar la información "
            "asociada a cada operación.\n\n"
            "Si estás buscando una factura específica, también puedes "
            "utilizar las opciones disponibles dentro del historial."
        )

    # ========================================================
    # PEDIDOS
    # ========================================================

    if contiene(
        texto,
        [
            "mis pedidos",
            "mi pedido",
            "ver pedidos",
            "consultar pedidos",
            "historial de pedidos",
            "estado de mi pedido",
            "estado del pedido",
            "seguimiento del pedido",
            "donde veo mi pedido",
        ],
    ):
        return (
            "📦 Para consultar tus pedidos, inicia sesión y entra a "
            "tu **Panel Cliente**. Allí puedes acceder a la información "
            "relacionada con tus compras y pedidos registrados.\n\n"
            "Si necesitas revisar una compra específica, entra en "
            "**Mis compras** y consulta los datos disponibles del pedido."
        )

    # ========================================================
    # FACTURAS
    # ========================================================

    if contiene(
        texto,
        [
            "factura",
            "facturas",
            "mi factura",
            "mis facturas",
            "ver factura",
            "ver mis facturas",
            "consultar factura",
            "consultar facturas",
            "descargar factura",
            "descargar facturas",
            "factura de compra",
        ],
    ):
        return (
            "🧾 Las facturas están asociadas a las compras realizadas "
            "en CellWorld.\n\n"
            "Para consultar una factura, inicia sesión y entra al "
            "**Panel Cliente**. Desde **Mis compras** puedes revisar "
            "la información de tus operaciones y utilizar las opciones "
            "relacionadas con la factura cuando estén disponibles.\n\n"
            "Si tienes varias compras, revisa el historial para localizar "
            "la operación correspondiente."
        )

    # ========================================================
    # PAGOS
    # ========================================================

    if contiene(
        texto,
        [
            "pago",
            "pagos",
            "pagar",
            "como pago",
            "como pagar",
            "metodo de pago",
            "metodos de pago",
            "forma de pago",
            "formas de pago",
        ],
    ):
        return (
            "💳 El pago forma parte del proceso de confirmación de "
            "la compra. Después de seleccionar los productos y revisar "
            "el carrito, continúa con las opciones que presente "
            "CellWorld para completar la operación.\n\n"
            "No compartas contraseñas, códigos de recuperación ni "
            "información confidencial con otras personas."
        )

    # ========================================================
    # PQR
    # ========================================================

    if contiene(
        texto,
        [
            "pqr",
            "como hago una pqr",
            "como crear una pqr",
            "crear pqr",
            "registrar pqr",
            "poner una pqr",
            "hacer una pqr",
            "presentar una pqr",
        ],
    ):
        return (
            "📨 Una **PQR** permite registrar una petición, queja, "
            "reclamo o sugerencia relacionada con CellWorld.\n\n"
            "Si eres cliente, inicia sesión y entra al **Panel Cliente**. "
            "Desde la sección de PQR puedes crear una nueva solicitud, "
            "seleccionar el tipo correspondiente y escribir los detalles "
            "del caso.\n\n"
            "Después de registrarla, podrás consultar la información "
            "y el estado de la solicitud desde la sección correspondiente."
        )

    # ========================================================
    # TIPOS DE PQR
    # ========================================================

    if contiene(
        texto,
        [
            "que es una pqr",
            "que significa pqr",
            "tipos de pqr",
            "que puedo poner en una pqr",
            "para que sirve una pqr",
        ],
    ):
        return (
            "📨 PQR significa **Petición, Queja, Reclamo o Sugerencia**.\n\n"
            "Puedes utilizar una PQR cuando necesites realizar una "
            "solicitud, informar sobre un inconveniente, presentar "
            "un reclamo o dejar una sugerencia relacionada con "
            "CellWorld.\n\n"
            "La sección de PQR está disponible para gestionar este "
            "tipo de solicitudes desde el sistema."
        )

    # ========================================================
    # CONSULTAR PQR
    # ========================================================

    if contiene(
        texto,
        [
            "ver pqr",
            "mis pqr",
            "consultar pqr",
            "historial de pqr",
            "estado de mi pqr",
            "estado de una pqr",
            "donde veo mi pqr",
        ],
    ):
        return (
            "📋 Para consultar tus PQR, inicia sesión y entra al "
            "**Panel Cliente**. Busca la sección de PQR para consultar "
            "las solicitudes que hayas registrado.\n\n"
            "Desde allí podrás revisar la información disponible de "
            "cada solicitud y consultar su estado cuando haya sido "
            "actualizado por el sistema."
        )

    # ========================================================
    # PERFIL / CUENTA
    # ========================================================

    if contiene(
        texto,
        [
            "mi perfil",
            "perfil",
            "mi cuenta",
            "cuenta",
            "datos de mi cuenta",
            "datos personales",
            "informacion de mi cuenta",
            "informacion personal",
        ],
    ):
        return (
            "👤 Tu perfil contiene la información asociada a tu cuenta "
            "de CellWorld.\n\n"
            "Después de iniciar sesión puedes acceder al **Panel "
            "Cliente** y consultar la sección de perfil para revisar "
            "la información disponible de tu usuario.\n\n"
            "Recuerda que nunca debes compartir tu contraseña con "
            "otras personas."
        )

    # ========================================================
    # CONTACTO
    # ========================================================

    if contiene(
        texto,
        [
            "contacto",
            "contactar",
            "como contacto",
            "donde contacto",
            "contactar soporte",
            "hablar con soporte",
            "soporte",
            "ayuda de soporte",
        ],
    ):
        return (
            "📞 Si necesitas comunicarte con CellWorld, puedes revisar "
            "la sección **Contacto** de la página para consultar los "
            "medios de comunicación disponibles.\n\n"
            "Si tu solicitud corresponde a un problema, reclamo, "
            "petición o sugerencia que quieras dejar registrada, "
            "también puedes utilizar el módulo de **PQR**."
        )

    # ========================================================
    # QUIÉNES SOMOS
    # ========================================================

    if contiene(
        texto,
        [
            "quienes somos",
            "quienes son",
            "sobre cellworld",
            "historia de cellworld",
            "informacion sobre cellworld",
            "informacion de cellworld",
        ],
    ):
        return (
            "🏪 La sección **Quiénes somos** contiene información "
            "general sobre CellWorld y el propósito de la tienda.\n\n"
            "Puedes acceder a ella desde la navegación principal "
            "de la página para conocer la información institucional "
            "que presenta el proyecto."
        )

    # ========================================================
    # PANEL CLIENTE
    # ========================================================

    if contiene(
        texto,
        [
            "panel cliente",
            "que hay en el panel cliente",
            "que puedo hacer como cliente",
            "funciones del cliente",
            "funciones panel cliente",
            "para que sirve el panel cliente",
        ],
    ):
        return (
            "👤 El **Panel Cliente** reúne las funciones relacionadas "
            "con tu cuenta y tus operaciones en CellWorld.\n\n"
            "Dependiendo de las opciones disponibles, allí puedes "
            "consultar tu perfil, revisar **Mis compras**, consultar "
            "información de pedidos y facturas y gestionar tus **PQR**.\n\n"
            "Para acceder necesitas iniciar sesión con una cuenta "
            "de cliente."
        )

    # ========================================================
    # PANEL EMPLEADO
    # ========================================================

    if contiene(
        texto,
        [
            "panel empleado",
            "que hace un empleado",
            "funciones del empleado",
            "para que sirve el panel empleado",
            "que puedo hacer como empleado",
        ],
    ):
        return (
            "👨‍💼 El **Panel Empleado** está destinado a los usuarios "
            "que tienen el rol de empleado.\n\n"
            "Desde este panel se pueden encontrar herramientas "
            "relacionadas con la gestión de productos, historial de "
            "ventas y reportes, según los permisos disponibles para "
            "el usuario.\n\n"
            "El contenido y las acciones disponibles dependen del "
            "rol y los permisos asignados."
        )

    # ========================================================
    # PANEL ADMINISTRADOR
    # ========================================================

    if contiene(
        texto,
        [
            "panel administrador",
            "panel admin",
            "que hace un administrador",
            "funciones del administrador",
            "funciones del admin",
            "para que sirve el panel administrador",
        ],
    ):
        return (
            "⚙️ El **Panel Administrador** está destinado a la gestión "
            "administrativa de CellWorld.\n\n"
            "Dependiendo de los permisos asignados, permite trabajar "
            "con información del sistema como usuarios, productos, "
            "ventas y otras funciones administrativas.\n\n"
            "Las opciones visibles dependen del rol y de los permisos "
            "del usuario que haya iniciado sesión."
        )

    # ========================================================
    # CERRAR SESIÓN
    # ========================================================

    if contiene(
        texto,
        [
            "cerrar sesion",
            "cerrar sesión",
            "salir de la cuenta",
            "salir de mi cuenta",
            "como cierro sesion",
            "como salgo",
            "logout",
        ],
    ):
        return (
            "🚪 Para cerrar sesión en CellWorld, utiliza la opción "
            "**Cerrar sesión** disponible en la navegación de la "
            "página.\n\n"
            "Al hacerlo, tu sesión actual finalizará y deberás volver "
            "a iniciar sesión si quieres acceder nuevamente a las "
            "funciones privadas de tu cuenta."
        )

    # ========================================================
    # GARANTÍAS / PRODUCTO DAÑADO
    # ========================================================

    if contiene(
        texto,
        [
            "garantia",
            "garantía",
            "producto defectuoso",
            "producto dañado",
            "producto danado",
            "producto malo",
            "producto no funciona",
            "me llego dañado",
            "me llego danado",
        ],
    ):
        return (
            "🛠️ Si tienes un inconveniente con un producto, puedes "
            "registrar una **PQR** desde tu Panel Cliente para dejar "
            "constancia del problema.\n\n"
            "Describe claramente qué ocurrió y proporciona la "
            "información solicitada por el formulario. Para conocer "
            "condiciones específicas de garantía, revisa las políticas "
            "presentadas por CellWorld o comunícate con soporte."
        )

    # ========================================================
    # NAVEGACIÓN
    # ========================================================

    if contiene(
        texto,
        [
            "donde esta",
            "donde encuentro",
            "donde puedo",
            "en que parte",
            "en que seccion",
            "que seccion",
            "donde esta la opcion",
            "donde encuentro la opcion",
        ],
    ):
        return (
            "🧭 Las principales funciones están distribuidas en el "
            "menú de navegación de CellWorld.\n\n"
            "**Productos** → catálogo de celulares y accesorios.\n"
            "**Carrito** → productos que seleccionaste para comprar.\n"
            "**Iniciar sesión** → acceso a tu cuenta.\n"
            "**Panel Cliente** → perfil, compras, facturas y PQR.\n"
            "**Contacto** → información para comunicarte con la tienda.\n"
            "**Quiénes somos** → información general de CellWorld.\n\n"
            "Si me dices exactamente qué estás buscando, puedo "
            "explicarte cómo llegar a esa función."
        )

    # ========================================================
    # PREGUNTAS DE CONTINUACIÓN
    # ========================================================

    if contiene(
        texto,
        [
            "y despues",
            "y después",
            "despues que",
            "después que",
            "y luego",
            "como sigo",
            "que sigue",
            "qué sigue",
            "que hago despues",
            "qué hago después",
            "ahora que",
            "ahora qué",
        ],
    ):
        if contiene(
            anterior,
            [
                "iniciar sesion",
                "registrar",
                "crear cuenta",
                "login",
            ],
        ):
            return (
                "Después de iniciar sesión correctamente, CellWorld "
                "te llevará a las funciones disponibles para tu cuenta. "
                "Si eres cliente, puedes entrar al **Panel Cliente** "
                "para consultar tu perfil, compras, facturas y PQR."
            )

        if contiene(
            anterior,
            [
                "producto",
                "catalogo",
                "celular",
                "accesorio",
            ],
        ):
            return (
                "Después de encontrar el producto que quieres, revisa "
                "su información y agrégalo al **Carrito**. Luego abre "
                "el carrito para comprobar las cantidades y el total "
                "antes de continuar con la compra."
            )

        if contiene(
            anterior,
            [
                "carrito",
                "comprar",
                "compra",
            ],
        ):
            return (
                "Después de revisar el carrito, comprueba que los "
                "productos, cantidades y total sean correctos. "
                "Luego puedes continuar con la confirmación de la "
                "compra. Una vez registrada, podrás consultarla "
                "desde **Mis compras**."
            )

        if contiene(
            anterior,
            [
                "pqr",
                "queja",
                "reclamo",
                "peticion",
                "sugerencia",
            ],
        ):
            return (
                "Después de completar la información de la PQR, "
                "registra la solicitud. Posteriormente podrás entrar "
                "a la sección de PQR del **Panel Cliente** para "
                "consultar la información y el estado del caso."
            )

        return (
            "Depende de la función que estés realizando. Si me dices "
            "qué acabas de hacer, puedo indicarte cuál es el siguiente "
            "paso. También puedo ayudarte con compras, carrito, "
            "pedidos, facturas, cuenta o PQR."
        )

    # ========================================================
    # AGRADECIMIENTOS
    # ========================================================

    if contiene(
        texto,
        [
            "gracias",
            "muchas gracias",
            "te agradezco",
            "perfecto gracias",
            "listo gracias",
        ],
    ):
        return (
            "¡Con mucho gusto! 😊 Me alegra poder ayudarte. Si "
            "necesitas seguir con algún proceso de CellWorld, puedes "
            "preguntarme por productos, compras, pedidos, facturas, "
            "cuenta o PQR."
        )

    # ========================================================
    # DESPEDIDA
    # ========================================================

    if contiene(
        texto,
        [
            "adios",
            "adiós",
            "chao",
            "hasta luego",
            "nos vemos",
            "me voy",
        ],
    ):
        return (
            "¡Hasta luego! 👋 Espero que tengas una buena experiencia "
            "en CellWorld. Si vuelves a necesitar ayuda con la página, "
            "aquí estará CellBot."
        )

    # ========================================================
    # RESPUESTA GENERAL
    # ========================================================

    return (
        "Entiendo tu pregunta 😊. Aunque no tengo acceso directo a "
        "los datos privados de tu cuenta ni puedo inventar información "
        "sobre pedidos o productos, sí puedo orientarte sobre el "
        "funcionamiento de CellWorld.\n\n"
        "Puedo explicarte, por ejemplo:\n"
        "• cómo iniciar sesión o registrarte;\n"
        "• cómo recuperar tu contraseña;\n"
        "• cómo buscar productos y usar el carrito;\n"
        "• cómo realizar una compra;\n"
        "• dónde consultar tus compras, pedidos y facturas;\n"
        "• cómo crear o consultar una PQR;\n"
        "• qué puedes hacer desde el Panel Cliente, Empleado o "
        "Administrador.\n\n"
        "Dime qué quieres hacer y te explico el proceso paso a paso."
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