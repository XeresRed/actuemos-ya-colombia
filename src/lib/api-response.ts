import { NextResponse } from 'next/server';
import { ZodError } from 'zod';
import { AppError } from '../core/errors';

export interface ApiResponse<T = unknown> {
  ok: boolean;
  data?: T;
  error?: {
    message: string;
    code?: string;
    details?: unknown;
  };
}

export function apiSuccess<T>(data: T, status = 200, headers?: HeadersInit): NextResponse<ApiResponse<T>> {
  return NextResponse.json(
    {
      ok: true,
      data,
    },
    {
      status,
      headers,
    }
  );
}

export function apiError(error: unknown, statusFallback = 500): NextResponse<ApiResponse> {
  // Manejo de errores de validación de Zod
  if (error instanceof ZodError) {
    const formattedErrors: Record<string, string[]> = {};
    for (const issue of error.issues) {
      const key = issue.path.join('.') || 'body';
      if (!formattedErrors[key]) formattedErrors[key] = [];
      formattedErrors[key].push(issue.message);
    }

    return NextResponse.json(
      {
        ok: false,
        error: {
          message: 'Error de validación en los datos de entrada',
          code: 'VALIDATION_ERROR',
          details: formattedErrors,
        },
      },
      { status: 400 }
    );
  }

  // Manejo de errores de dominio de la aplicación
  if (error instanceof AppError) {
    return NextResponse.json(
      {
        ok: false,
        error: {
          message: error.message,
          code: error.constructor.name.toUpperCase(),
        },
      },
      { status: error.statusCode }
    );
  }

  // Manejo de errores nativos o desconocidos
  const message = error instanceof Error ? error.message : 'Ha ocurrido un error interno en el servidor';
  console.error('❌ [API Error No Controlado]:', error);

  return NextResponse.json(
    {
      ok: false,
      error: {
        message,
        code: 'INTERNAL_SERVER_ERROR',
      },
    },
    { status: statusFallback }
  );
}
