import { Repository, SelectQueryBuilder } from 'typeorm';
import { IPaginatedResult } from './interface/pagination-result.interface';
import { PaginationDto } from './dto/pagination.dto';

export interface IPaginateOptions<t> {
  builderFn?: (builder: SelectQueryBuilder<t>) => SelectQueryBuilder<t>;
}

export class AppRepository<t> extends Repository<t> {
  async paginate(
    paginationDto: PaginationDto,
    options?: IPaginateOptions<t>,
  ): Promise<IPaginatedResult<t>> {
    paginationDto.page = paginationDto.page ? +paginationDto.page || 1 : 1;
    paginationDto.limit =
      !paginationDto.limit || +paginationDto.limit > 10
        ? 10
        : +paginationDto.limit || 10;

    let query = this.createQueryBuilder('item')
      .take(paginationDto.limit)
      .skip((paginationDto.page - 1) * paginationDto.limit)
      .cache(true);

    if (options?.builderFn) query = options.builderFn(query);

    const [data, totalCount] = await query.getManyAndCount();

    return {
      data,
      totalCount,
      page: paginationDto.page,
      limit: paginationDto.limit,
    };
  }
}
