import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
} from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { CreateNewProductDto } from './dto/create-productNew.dto';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}
  //CREAR
  @Post()
  async create(@Body() createProductDto: CreateNewProductDto) {
    console.log('La data llegando al controller es: ', createProductDto);

    return await this.productsService.create(createProductDto);
  }

  @Get('/sucursal/:id')
  async findAllProductToSale(@Param('id', ParseIntPipe) id: number) {
    return await this.productsService.findAllProductsToSale(id);
  }
  // findAllProductsToSale
  //ENCONTRAR TODAS PARA INVENTARIADO
  @Get('/products/for-inventary')
  async findAll() {
    return await this.productsService.findAll();
  }

  @Get('/products/to-transfer/:id')
  async findAllProductsToTransfer(@Param('id', ParseIntPipe) id: number) {
    return await this.productsService.findAllProductsToTransfer(id);
  }

  @Get('/products/for-set-stock')
  async findAllProductsToStcok() {
    return await this.productsService.findAllProductsToStcok();
  }

  @Get('/product/get-one-product/:id')
  async productToEdit(@Param('id', ParseIntPipe) id: number) {
    return await this.productsService.productToEdit(id);
  }

  @Get('/products-to-credit')
  async productToCredit() {
    return await this.productsService.productToCredit();
  }

  @Get('/historial-price')
  async productHistorialPrecios() {
    return await this.productsService.productHistorialPrecios();
  }

  @Get('/product-to-warranty')
  async productToWarranty() {
    return await this.productsService.productToWarranty();
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return await this.productsService.findOne(id);
  }

  @Patch('/actualizar/producto/:id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateProductDto: UpdateProductDto,
  ) {
    return await this.productsService.update(id, updateProductDto);
  }

  @Delete('/delete-all')
  async removeAll() {
    return await this.productsService.removeAll();
  }

  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number) {
    return await this.productsService.remove(id);
  }
}
