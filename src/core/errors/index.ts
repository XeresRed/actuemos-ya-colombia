export class AppError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;

  constructor(message: string, statusCode = 500, isOperational = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    Object.setPrototypeOf(this, new.target.prototype);
    Error.captureStackTrace(this, this.constructor);
  }
}

export class NotFoundError extends AppError {
  constructor(message = 'Recurso no encontrado') {
    super(message, 404);
  }
}

export class ValidationError extends AppError {
  public readonly errors?: Record<string, string[]>;

  constructor(message = 'Error de validación en los datos de entrada', errors?: Record<string, string[]>) {
    super(message, 400);
    this.errors = errors;
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = 'No autenticado o sesión no válida') {
    super(message, 401);
  }
}

export class ForbiddenError extends AppError {
  constructor(message = 'No cuenta con los permisos necesarios para realizar esta acción') {
    super(message, 403);
  }
}

export class ConflictError extends AppError {
  constructor(message = 'Conflicto en la operación o recurso duplicado') {
    super(message, 409);
  }
}

export class DatabaseError extends AppError {
  constructor(message = 'Error en la base de datos') {
    super(message, 500);
  }
}
