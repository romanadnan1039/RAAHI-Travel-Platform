export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 10,
  MAX_LIMIT: 100,
}

export const SORT_ORDER = {
  ASC: 'asc',
  DESC: 'desc',
} as const

export const SORT_BY = {
  PRICE: 'price',
  RATING: 'rating',
  CREATED_AT: 'createdAt',
} as const
