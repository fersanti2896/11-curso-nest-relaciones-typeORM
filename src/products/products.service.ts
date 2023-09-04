import { Injectable, InternalServerErrorException, Logger, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { validate as isUUID } from 'uuid';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

import { PaginationDto } from 'src/common/dtos/pagination.dto';
import { Product, ProductImage } from './entities';

@Injectable()
export class ProductsService {
  private readonly logger = new Logger('ProductsService');

  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    @InjectRepository(ProductImage)
    private readonly productImageRepository: Repository<ProductImage>
  ) {}

  async create(createProductDto: CreateProductDto) {
    try {
      const { images = [], ...productDetails } = createProductDto;

      const product = this.productRepository.create( { 
        ...productDetails,
        images: images.map( img => this.productImageRepository.create({ url: img }) )
      } );

      await this.productRepository.save( product );

      return { ...product, images };
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
        skip: offset,
        relations: {
          images: true
        }
      })
    ]);

    const numProducts = products.length;
    const productsAll = products.map( product => ({
      ...product,
      images: product.images.map( img => img.url )
    }) )

    return { numProducts, productsAll };
  }

  async findOne(term: string) {
    let product: Product;

    if( isUUID(term) ) {
      product = await this.productRepository.findOneBy({ id: term });
    } else {
      const queryBuilder = this.productRepository.createQueryBuilder('prod');
      product = await queryBuilder.where('LOWER(title) =LOWER(:title) or slug =:slug', {
                                    title: term,
                                    slug: term.toLowerCase()
                                  })
                                  .leftJoinAndSelect('prod.images', 'prodImages')
                                  .getOne();
    }

    if( !product ) throw new NotFoundException(`El producto con el término: ${ term } no existe.`);

    return product;
  }

  async findOnePlain( term: string ) {
    const { images = [], ...resto } = await this.findOne( term );

    return {
      ...resto,
      images: images.map( img => img.url )
    }
  }

  async update(id: string, updateProductDto: UpdateProductDto) {
    /* Prepara el producto para su actualizacion */
    const product = await this.productRepository.preload({
      id, 
      ...updateProductDto,
      images: []
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
