export interface PaginationParams {
  page: number;
  perPage: number;
  offset: number;
}

export interface PaginationResult<T> {
  items: T[];
  page: number;
  perPage: number;
  totalItems: number;
  totalPages: number;
}

export function parsePagination(query: { page?: string; perPage?: string }): PaginationParams {
  const page = Math.max(1, parseInt(query.page || '1', 10) || 1);
  const perPage = Math.min(100, Math.max(1, parseInt(query.perPage || '20', 10) || 20));
  const offset = (page - 1) * perPage;

  return { page, perPage, offset };
}

export function paginate<T>(items: T[], params: PaginationParams): PaginationResult<T> {
  const totalItems = items.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / params.perPage));
  const paged = items.slice(params.offset, params.offset + params.perPage);

  return {
    items: paged,
    page: params.page,
    perPage: params.perPage,
    totalItems,
    totalPages,
  };
}
