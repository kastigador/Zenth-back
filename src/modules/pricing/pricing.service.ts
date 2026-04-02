import { Injectable, NotFoundException } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { ListPricesQueryDto, StartImportDto } from './pricing.dto';

type PriceEntry = {
  sku: string;
  name: string;
  price: number;
  updatedAt: string;
};

type ImportError = {
  row: number;
  sku: string;
  reason: string;
};

type ImportJob = {
  jobId: string;
  status: 'processing' | 'completed' | 'failed';
  total: number;
  processed: number;
  success: number;
  failed: number;
  errors: ImportError[];
  createdAt: string;
  completedAt?: string;
};

@Injectable()
export class PricingService {
  private readonly prices = new Map<string, PriceEntry>();
  private readonly jobs = new Map<string, ImportJob>();

  startImport(dto: StartImportDto) {
    const jobId = randomUUID();
    const job: ImportJob = {
      jobId,
      status: 'processing',
      total: dto.rows.length,
      processed: 0,
      success: 0,
      failed: 0,
      errors: [],
      createdAt: new Date().toISOString(),
    };

    this.jobs.set(jobId, job);

    dto.rows.forEach((row, index) => {
      job.processed += 1;
      const invalidPrice = !Number.isFinite(row.price) || row.price <= 0;
      const invalidSku = row.sku.trim().length === 0;

      if (invalidSku || invalidPrice) {
        job.failed += 1;
        job.errors.push({
          row: index + 1,
          sku: row.sku,
          reason: invalidSku ? 'invalid_sku' : 'invalid_price',
        });
        return;
      }

      this.prices.set(row.sku, {
        sku: row.sku,
        name: row.name,
        price: row.price,
        updatedAt: new Date().toISOString(),
      });
      job.success += 1;
    });

    job.status = 'completed';
    job.completedAt = new Date().toISOString();

    return {
      jobId,
      status: 'accepted',
    };
  }

  getImportStatus(jobId: string) {
    const job = this.jobs.get(jobId);
    if (!job) {
      throw new NotFoundException('Import job not found');
    }

    return job;
  }

  listCurrentPrices(query: ListPricesQueryDto = { page: 1, limit: 20 }) {
    const all = [...this.prices.values()];
    const search = (query.search ?? '').trim().toLowerCase();

    const filtered = all.filter((entry) => {
      if (!search) {
        return true;
      }
      return entry.sku.toLowerCase().includes(search) || entry.name.toLowerCase().includes(search);
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
}
