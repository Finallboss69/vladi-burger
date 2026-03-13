import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserFromToken } from '@/lib/auth';

export async function PUT(req: Request) {
  try {
    const token = req.headers.get('authorization');
    const user = await getUserFromToken(token);

    if (!user) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 },
      );
    }

    if (user.role !== 'DELIVERY' && user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Solo repartidores pueden actualizar ubicacion' },
        { status: 403 },
      );
    }

    const body = await req.json();
    const { orderId, lat, lng } = body;

    if (!orderId || typeof lat !== 'number' || typeof lng !== 'number') {
      return NextResponse.json(
        { error: 'orderId, lat y lng son requeridos' },
        { status: 400 },
      );
    }

    // Verify order exists and is in DELIVERING status
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      select: { id: true, status: true },
    });

    if (!order) {
      return NextResponse.json(
        { error: 'Pedido no encontrado' },
        { status: 404 },
      );
    }

    if (order.status !== 'DELIVERING') {
      return NextResponse.json(
        { error: 'El pedido no esta en estado de entrega' },
        { status: 400 },
      );
    }

    const location = await prisma.deliveryLocation.upsert({
      where: { orderId },
      update: { lat, lng },
      create: { orderId, lat, lng },
    });

    return NextResponse.json({ data: location });
  } catch (error) {
    console.error('Error updating delivery location:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 },
    );
  }
}

export async function GET(req: Request) {
  try {
    const token = req.headers.get('authorization');
    const user = await getUserFromToken(token);

    if (!user) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 },
      );
    }

    const url = new URL(req.url);
    const orderId = url.searchParams.get('orderId');

    if (!orderId) {
      return NextResponse.json(
        { error: 'orderId es requerido' },
        { status: 400 },
      );
    }

    // Verify the user can access this order
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      select: { id: true, userId: true, status: true },
    });

    if (!order) {
      return NextResponse.json(
        { error: 'Pedido no encontrado' },
        { status: 404 },
      );
    }

    // Only the order owner, delivery, or admin can see the location
    const isOwner = order.userId === user.id;
    const isStaff = user.role === 'DELIVERY' || user.role === 'ADMIN';

    if (!isOwner && !isStaff) {
      return NextResponse.json(
        { error: 'No tienes permisos para ver esta ubicacion' },
        { status: 403 },
      );
    }

    const location = await prisma.deliveryLocation.findUnique({
      where: { orderId },
    });

    if (!location) {
      return NextResponse.json({ data: null });
    }

    return NextResponse.json({
      data: {
        lat: location.lat,
        lng: location.lng,
        updatedAt: location.updatedAt.toISOString(),
      },
    });
  } catch (error) {
    console.error('Error fetching delivery location:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 },
    );
  }
}
