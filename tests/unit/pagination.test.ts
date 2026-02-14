import { describe, it, expect } from 'vitest';
import { parsePagination, paginate } from '../../src/utils/pagination';

describe('parsePagination', () => {
  it('returns defaults for empty query', () => {
    const result = parsePagination({});
    expect(result).toEqual({ page: 1, perPage: 20, offset: 0 });
  });

  it('parses page and perPage', () => {
    const result = parsePagination({ page: '3', perPage: '10' });
    expect(result).toEqual({ page: 3, perPage: 10, offset: 20 });
  });

  it('clamps page to minimum 1', () => {
    const result = parsePagination({ page: '-1' });
    expect(result.page).toBe(1);
  });

  it('clamps perPage to max 100', () => {
    const result = parsePagination({ perPage: '500' });
    expect(result.perPage).toBe(100);
  });
});

describe('paginate', () => {
  const items = Array.from({ length: 25 }, (_, i) => i);

  it('returns first page', () => {
    const result = paginate(items, { page: 1, perPage: 10, offset: 0 });
    expect(result.items).toHaveLength(10);
    expect(result.totalPages).toBe(3);
    expect(result.totalItems).toBe(25);
  });

  it('returns last page with partial items', () => {
    const result = paginate(items, { page: 3, perPage: 10, offset: 20 });
    expect(result.items).toHaveLength(5);
  });

  it('handles empty items', () => {
    const result = paginate([], { page: 1, perPage: 10, offset: 0 });
    expect(result.items).toHaveLength(0);
    expect(result.totalPages).toBe(1);
  });
});
