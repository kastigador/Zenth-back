import { Injectable, NotFoundException } from '@nestjs/common';
import { randomUUID } from 'crypto';
import {
  CreateProductDto,
  ListProductsQueryDto,
  UpdateProductDto,
} from './products.dto';

type ProductRecord = {
  id: string;
  sku: string;
  name: string;
  description?: string;
  basePrice: number;
  currency: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

@Injectable()
export class ProductsService {
  private readonly products: ProductRecord[] = [];

  list(query: ListProductsQueryDto) {
    const search = (query.search ?? '').trim().toLowerCase();
    const active = query.active;

    const filtered = this.products.filter((product) => {
      const bySearch =
        search.length === 0 ||
        product.name.toLowerCase().includes(search) ||
        product.sku.toLowerCase().includes(search);
      const byActive = active === undefined || product.isActive === active;

      return bySearch && byActive;
    });

    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const start = (page - 1) * limit;

    return {
      items: filtered.slice(start, start + limit),
      total: filtered.length,
      page,
      limit,
    };
  }

  findById(id: string) {
    const product = this.products.find((candidate) => candidate.id === id);
    if (!product) {
      throw new NotFoundException('Product not found');
    }

    return product;
  }

  create(dto: CreateProductDto) {
    const now = new Date().toISOString();
    const product: ProductRecord = {
      id: randomUUID(),
      sku: dto.sku,
      name: dto.name,
      description: dto.description,
      basePrice: dto.basePrice,
      currency: dto.currency,
      isActive: dto.isActive ?? true,
      createdAt: now,
      updatedAt: now,
    };

    this.products.push(product);
    return product;
  }

  update(id: string, dto: UpdateProductDto) {
    const product = this.findById(id);

    if (dto.sku !== undefined) {
      product.sku = dto.sku;
    }
    if (dto.name !== undefined) {
      product.name = dto.name;
    }
    if (dto.description !== undefined) {
      product.description = dto.description;
    }
    if (dto.basePrice !== undefined) {
      product.basePrice = dto.basePrice;
    }
    if (dto.currency !== undefined) {
      product.currency = dto.currency;
    }
    if (dto.isActive !== undefined) {
      product.isActive = dto.isActive;
    }

    product.updatedAt = new Date().toISOString();
    return product;
  }
}
