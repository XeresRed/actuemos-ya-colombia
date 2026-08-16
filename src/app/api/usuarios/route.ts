import { NextRequest } from 'next/server';
import { UsuarioRepository } from '../../../db/repositories';
import { apiSuccess, apiError } from '../../../lib/api-response';
import { requireRole } from '../../../lib/api-auth';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    requireRole(req, 'admin');

    const { searchParams } = new URL(req.url);
    const activeOnly = searchParams.get('activeOnly') === 'true';

    const users = UsuarioRepository.findMany(activeOnly);
    return apiSuccess(users);
  } catch (error) {
    return apiError(error);
  }
}
