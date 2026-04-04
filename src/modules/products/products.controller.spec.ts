import { ProductsController } from './products.controller';
import { ProductsService } from './products.service';

describe('ProductsController', () => {
  function makeController() {
    const service = {
      list: jest.fn((query) => ({ items: [], total: 0, ...query })),
      create: jest.fn((dto) => ({ id: 'prod-1', ...dto })),
      findById: jest.fn((id) => ({ id, name: 'Producto' })),
      update: jest.fn((id, dto) => ({ id, ...dto })),
    } as unknown as ProductsService;

    return { controller: new ProductsController(service), service };
  }

  it('list delega query al servicio', () => {
    const { controller, service } = makeController();

    const query = { search: 'cafe', active: true } as any;
    controller.list(query);

    expect(service.list).toHaveBeenCalledWith(query);
  });

  it('create delega dto al servicio', () => {
    const { controller, service } = makeController();

    const dto = { sku: 'SKU-1', name: 'Cafe', unitPriceCents: 1200 } as any;
    const result = controller.create(dto);

    expect(service.create).toHaveBeenCalledWith(dto);
    expect(result).toEqual(expect.objectContaining({ id: 'prod-1' }));
  });

  it('findById delega id al servicio', () => {
    const { controller, service } = makeController();

    controller.findById('prod-1');

    expect(service.findById).toHaveBeenCalledWith('prod-1');
  });

  it('update delega id y dto al servicio', () => {
    const { controller, service } = makeController();

    const dto = { name: 'Cafe Premium' } as any;
    controller.update('prod-1', dto);

    expect(service.update).toHaveBeenCalledWith('prod-1', dto);
  });
});
