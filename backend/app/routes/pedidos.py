from collections import defaultdict
from datetime import date, datetime, time, timedelta

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session, joinedload

from ..auth import require_roles
from ..database import get_db
from ..models import DetallePedido, PQR, Pedido, Producto, Usuario
from ..schemas import PedidoCreate, PedidoListResponse, PedidoResponse


router = APIRouter(
    prefix="/api/pedidos",
    tags=["Pedidos"]
)


# ============================================================
# CREAR PEDIDO
# Solo clientes pueden crear pedidos
# ============================================================

@router.post("", response_model=PedidoResponse, status_code=201)
def crear_pedido(
    data: PedidoCreate,
    db: Session = Depends(get_db),
    usuario: Usuario = Depends(require_roles(2)),
):
    total = sum(
        item.precio_unitario * item.cantidad
        for item in data.items
    )

    pedido = Pedido(
        usuario_id=usuario.id_usuario,
        total=total,
        estado="pagado"
    )

    pedido.detalles = [
        DetallePedido(**item.model_dump())
        for item in data.items
    ]

    db.add(pedido)
    db.commit()
    db.refresh(pedido)

    return (
        db.query(Pedido)
        .options(joinedload(Pedido.detalles))
        .filter(Pedido.id_pedido == pedido.id_pedido)
        .first()
    )


# ============================================================
# MIS PEDIDOS
# Solo el cliente puede consultar sus propias compras
# ============================================================

@router.get("/mis-pedidos", response_model=PedidoListResponse)
def listar_mis_pedidos(
    db: Session = Depends(get_db),
    usuario: Usuario = Depends(require_roles(2)),
):
    pedidos = (
        db.query(Pedido)
        .options(joinedload(Pedido.detalles))
        .filter(Pedido.usuario_id == usuario.id_usuario)
        .order_by(Pedido.creado_en.desc())
        .all()
    )

    return {
        "success": True,
        "pedidos": pedidos
    }


# ============================================================
# HISTORIAL GENERAL DE VENTAS
# Administrador y empleado
# ============================================================

@router.get("/historial")
def historial_ventas(
    db: Session = Depends(get_db),
    usuario: Usuario = Depends(require_roles(1, 3)),
):
    pedidos = (
        db.query(Pedido)
        .options(
            joinedload(Pedido.detalles),
            joinedload(Pedido.usuario)
        )
        .order_by(Pedido.creado_en.desc())
        .all()
    )

    ventas = []

    for pedido in pedidos:
        productos = []

        for detalle in pedido.detalles:
            subtotal = (
                detalle.precio_unitario * detalle.cantidad
            )

            productos.append({
                "producto_id": detalle.producto_id,
                "nombre_producto": detalle.nombre_producto,
                "precio_unitario": detalle.precio_unitario,
                "cantidad": detalle.cantidad,
                "subtotal": subtotal
            })

        nombre_cliente = "Cliente no disponible"

        if pedido.usuario:
            nombres = getattr(pedido.usuario, "nombres", "") or ""
            apellidos = getattr(pedido.usuario, "apellidos", "") or ""

            nombre_cliente = f"{nombres} {apellidos}".strip()

            if not nombre_cliente:
                nombre_cliente = (
                    getattr(pedido.usuario, "email", None)
                    or "Cliente no disponible"
                )

        ventas.append({
            "id_pedido": pedido.id_pedido,
            "usuario_id": pedido.usuario_id,
            "cliente": nombre_cliente,
            "fecha": pedido.creado_en,
            "estado": pedido.estado,
            "total": pedido.total,
            "productos": productos
        })

    return {
        "success": True,
        "ventas": ventas,
        "total_ventas": len(ventas)
    }


# ============================================================
# REPORTE DIARIO DE VENTAS
# Administrador y empleado
# ============================================================

@router.get("/reporte-diario")
def reporte_diario(
    fecha: date = Query(
        ...,
        description="Fecha del reporte en formato YYYY-MM-DD"
    ),
    db: Session = Depends(get_db),
    usuario: Usuario = Depends(require_roles(1, 3)),
):
    inicio_dia = datetime.combine(
        fecha,
        time.min
    )

    fin_dia = datetime.combine(
        fecha,
        time.max
    )

    pedidos = (
        db.query(Pedido)
        .options(
            joinedload(Pedido.detalles),
            joinedload(Pedido.usuario)
        )
        .filter(
            Pedido.creado_en >= inicio_dia,
            Pedido.creado_en <= fin_dia
        )
        .order_by(Pedido.creado_en.asc())
        .all()
    )

    ventas = []

    total_vendido = 0
    total_unidades = 0

    for pedido in pedidos:
        productos = []

        for detalle in pedido.detalles:
            subtotal = (
                detalle.precio_unitario * detalle.cantidad
            )

            total_unidades += detalle.cantidad

            productos.append({
                "producto_id": detalle.producto_id,
                "nombre_producto": detalle.nombre_producto,
                "precio_unitario": detalle.precio_unitario,
                "cantidad": detalle.cantidad,
                "subtotal": subtotal
            })

        total_vendido += pedido.total or 0

        nombre_cliente = "Cliente no disponible"

        if pedido.usuario:
            nombres = getattr(pedido.usuario, "nombres", "") or ""
            apellidos = getattr(pedido.usuario, "apellidos", "") or ""

            nombre_cliente = f"{nombres} {apellidos}".strip()

            if not nombre_cliente:
                nombre_cliente = (
                    getattr(pedido.usuario, "email", None)
                    or "Cliente no disponible"
                )

        ventas.append({
            "id_pedido": pedido.id_pedido,
            "usuario_id": pedido.usuario_id,
            "cliente": nombre_cliente,
            "fecha": pedido.creado_en,
            "estado": pedido.estado,
            "total": pedido.total,
            "productos": productos
        })

    return {
        "success": True,
        "fecha": fecha,
        "resumen": {
            "ventas_realizadas": len(ventas),
            "unidades_vendidas": total_unidades,
            "total_vendido": total_vendido
        },
        "ventas": ventas
    }


# ============================================================
# ESTADÍSTICAS DEL DASHBOARD
# Administrador y empleado
# ============================================================

@router.get("/estadisticas")
def estadisticas_dashboard(
    fecha_inicio: date | None = Query(None),
    fecha_fin: date | None = Query(None),
    producto: str | None = Query(None),
    estado: str | None = Query(None),
    cliente_id: int | None = Query(None),
    db: Session = Depends(get_db),
    usuario: Usuario = Depends(require_roles(1, 3)),
):
    if fecha_inicio and fecha_fin and fecha_inicio > fecha_fin:
        raise HTTPException(
            status_code=400,
            detail="La fecha inicial no puede ser posterior a la fecha final.",
        )

    inicio = datetime.combine(fecha_inicio, time.min) if fecha_inicio else None
    fin = datetime.combine(fecha_fin, time.max) if fecha_fin else None

    consulta = db.query(Pedido).options(
        joinedload(Pedido.detalles),
        joinedload(Pedido.usuario),
    )

    if inicio:
        consulta = consulta.filter(Pedido.creado_en >= inicio)
    if fin:
        consulta = consulta.filter(Pedido.creado_en <= fin)
    if estado:
        consulta = consulta.filter(Pedido.estado == estado)
    if cliente_id:
        consulta = consulta.filter(Pedido.usuario_id == cliente_id)

    pedidos = consulta.order_by(Pedido.creado_en.asc()).all()

    ventas_por_dia = defaultdict(lambda: {"ventas": 0, "total": 0})
    ventas_por_estado = defaultdict(lambda: {"ventas": 0, "total": 0})
    productos_vendidos = defaultdict(lambda: {"unidades": 0, "total": 0})
    total_unidades = 0
    total_vendido = 0
    ventas_filtradas = 0

    producto_filtro = producto.strip().lower() if producto else None

    for pedido in pedidos:
        detalles = pedido.detalles

        if producto_filtro:
            detalles = [
                detalle
                for detalle in detalles
                if producto_filtro in detalle.nombre_producto.lower()
            ]
            if not detalles:
                continue

        total_pedido = sum(
            detalle.precio_unitario * detalle.cantidad
            for detalle in detalles
        )
        unidades_pedido = sum(detalle.cantidad for detalle in detalles)
        fecha = pedido.creado_en.date().isoformat()
        estado_pedido = pedido.estado or "Sin estado"

        ventas_filtradas += 1
        total_unidades += unidades_pedido
        total_vendido += total_pedido
        ventas_por_dia[fecha]["ventas"] += 1
        ventas_por_dia[fecha]["total"] += total_pedido
        ventas_por_estado[estado_pedido]["ventas"] += 1
        ventas_por_estado[estado_pedido]["total"] += total_pedido

        for detalle in detalles:
            producto_data = productos_vendidos[detalle.nombre_producto]
            producto_data["unidades"] += detalle.cantidad
            producto_data["total"] += (
                detalle.precio_unitario * detalle.cantidad
            )

    pqrs_query = db.query(PQR)
    if inicio:
        pqrs_query = pqrs_query.filter(PQR.creado_en >= inicio)
    if fin:
        pqrs_query = pqrs_query.filter(PQR.creado_en <= fin)
    if cliente_id:
        pqrs_query = pqrs_query.filter(PQR.usuario_id == cliente_id)

    pqrs = pqrs_query.all()
    pendientes = sum(
        1
        for pqr in pqrs
        if (pqr.estado or "Pendiente").lower()
        not in {"resuelta", "respondida", "cerrada", "atendida"}
    )

    total_usuarios = db.query(Usuario).count()
    total_clientes = db.query(Usuario).filter(Usuario.rol_id == 2).count()
    total_productos = db.query(Producto).count()

    return {
        "success": True,
        "rol": usuario.rol_id,
        "filtros": {
            "fecha_inicio": fecha_inicio,
            "fecha_fin": fecha_fin,
            "producto": producto,
            "estado": estado,
            "cliente_id": cliente_id,
        },
        "indicadores": {
            "total_usuarios": total_usuarios,
            "total_clientes": total_clientes,
            "total_productos": total_productos,
            "ventas": ventas_filtradas,
            "unidades_vendidas": total_unidades,
            "total_facturado": total_vendido,
            "pqr_recibidas": len(pqrs),
            "pqr_pendientes": pendientes,
        },
        "ventas_por_dia": [
            {"fecha": fecha, **valores}
            for fecha, valores in sorted(ventas_por_dia.items())
        ],
        "ventas_por_estado": [
            {"estado": nombre, **valores}
            for nombre, valores in sorted(ventas_por_estado.items())
        ],
        "productos_mas_vendidos": [
            {"producto": nombre, **valores}
            for nombre, valores in sorted(
                productos_vendidos.items(),
                key=lambda item: item[1]["unidades"],
                reverse=True,
            )[:10]
        ],
    }


# ============================================================
# CONSULTAR UN PEDIDO ESPECÍFICO
# Administrador, empleado y cliente
# ============================================================

@router.get("/{order_id}", response_model=PedidoResponse)
def obtener_pedido(
    order_id: int,
    db: Session = Depends(get_db),
    usuario: Usuario = Depends(require_roles(1, 2, 3)),
):
    pedido = (
        db.query(Pedido)
        .options(joinedload(Pedido.detalles))
        .filter(Pedido.id_pedido == order_id)
        .first()
    )

    if not pedido:
        raise HTTPException(
            status_code=404,
            detail="Pedido no encontrado"
        )

    # El cliente únicamente puede consultar sus propios pedidos.
    # Administrador y empleado pueden consultar cualquiera.
    if (
        usuario.rol_id == 2
        and pedido.usuario_id != usuario.id_usuario
    ):
        raise HTTPException(
            status_code=403,
            detail="No tienes acceso a este pedido"
        )

    return pedido