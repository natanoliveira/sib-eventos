import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requirePermission } from '@/lib/auth-utils';

// GET /api/events - Listar eventos
export const GET = async (request: NextRequest) => {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const category = searchParams.get('category');
    const search = searchParams.get('search');

    const where: any = {};
    if (status) where.status = status;
    if (category) where.category = category;
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { location: { contains: search, mode: 'insensitive' } },
      ];
    }

    const events = await prisma.event.findMany({
      where: {
        removed: false,
        ...where,
      },
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        _count: {
          select: {
            memberships: true,
            tickets: true,
            invoices: true,
          },
        },
      },
      orderBy: {
        startDate: 'desc',
      },
    });

    return NextResponse.json(events);
  } catch (error) {
    console.error('Error fetching events:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar eventos' },
      { status: 500 }
    );
  }
};

// POST /api/events - Criar evento
export const POST = requirePermission('events.create')(
  async (request: NextRequest, context: any) => {
    try {
      const body = await request.json();
      const {
        title,
        description,
        startDate,
        endDate,
        location,
        capacity,
        price,
        category,
        imageUrl,
      } = body;

      if (!title || !startDate || !location || capacity === undefined || price === undefined) {
        return NextResponse.json(
          { error: 'Dados incompletos' },
          { status: 400 }
        );
      }

      const event = await prisma.event.create({
        data: {
          title,
          description,
          startDate: new Date(startDate),
          endDate: endDate ? new Date(endDate) : null,
          location,
          capacity: parseInt(capacity),
          price: parseFloat(price),
          category: category || 'Geral',
          imageUrl,
          creatorId: context.user.id,
          status: 'ACTIVE',
          removed: false,
        },
        include: {
          creator: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      });

      return NextResponse.json(event, { status: 201 });
    } catch (error) {
      console.error('Error creating event:', error);
      return NextResponse.json(
        { error: 'Erro ao criar evento' },
        { status: 500 }
      );
    }
  }
);
