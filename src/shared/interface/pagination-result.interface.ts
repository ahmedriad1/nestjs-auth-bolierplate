export interface IPaginatedResult<t> {
  data: t[];
  page: number;
  limit: number;
  totalCount: number;
}
