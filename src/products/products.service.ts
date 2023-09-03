import { Injectable, InternalServerErrorException, Logger, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

import { Product } from './entities/product.entity';
import { PaginationDto } from 'src/common/dtos/pagination.dto';

import { validate as isUUID } from 'uuid';

@Injectable()
export class ProductsService {
  private readonly logger = new Logger('ProductsService');

  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
  ) {}

  async create(createProductDto: CreateProductDto) {
    try {
      const product = this.productRepository.create( createProductDto );
      await this.productRepository.save( product );

      return product;
    } catch (error) {
      this.handleDBExceptions(error);
    }
  }

  async findAll(paginationDto : PaginationDto) {
    const { limit = 10, offset = 0 } = paginationDto;

    const [ counts, products ] = await Promise.all([
      this.productRepository.count(),
      this.productRepository.find({
        take: limit, 
        skip: offset
      })
    ]);

    const numProducts = products.length;

    return { numProducts, products };
  }

  async findOne(term: string) {
    let product: Product;

    if( isUUID(term) ) {
      product = await this.productRepository.findOneBy({ id: term });
    } else {
      const queryBuilder = this.productRepository.createQueryBuilder();
      product = await queryBuilder.where('LOWER(title) =LOWER(:title) or slug =:slug', {
                                    title: term,
                                    slug: term.toLowerCase()
                                  }).getOne();
    }

    if( !product ) throw new NotFoundException(`El producto con el término: ${ term } no existe.`);

    return product;
  }

  async update(id: string, updateProductDto: UpdateProductDto) {
    /* Prepara el producto para su actualizacion */
    const product = await this.productRepository.preload({
      id, 
      ...updateProductDto
    });

    if( !product ) throw new NotFoundException(`El producto con el id: ${ id } no fue encontrado.`);

    try {
      await this.productRepository.save( product );

      return product;
    } catch (error) {
      this.handleDBExceptions(error);
    }

    
  }

  async remove(id: string) {
    const product = await this.findOne(id);

    await this.productRepository.remove( product );
  }

  private handleDBExceptions = ( error: any ) => {
    if(error.code === '23505') {
      throw new BadRequestException( error.detail );
    }

    this.logger.error(error);
    throw new InternalServerErrorException('Ocurrió un error, verifiqué los logs.');
  }
}
