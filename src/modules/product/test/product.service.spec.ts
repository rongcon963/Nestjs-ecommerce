import { Test, TestingModule } from '@nestjs/testing';
import { ProductService } from '../product.service';
import { Repository } from 'typeorm';
import { Product } from '../entities/product.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { CreateProductDTO } from '../dto/create-product.dto';

export type MockType<T> = {
  [P in keyof T]?: jest.Mock<{}>;
};
const repositoryMockFactory: () => MockType<Repository<any>> = jest.fn(() => ({
  create: jest.fn((entity) => entity),
  save: jest.fn((entity) => entity),
  find: jest.fn((entity) => entity),
  findOne: jest.fn((entity) => entity),
  delete: jest.fn((entity) => entity),
  // ...
}));

const mockProduct = {
  id: 1,
  name: "Test name",
  description: "Test description",
  price: 20,
};

describe('ProductService', () => {
  let service: ProductService;
  let repositoryMock: MockType<Repository<Product>>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductService,
        {
          provide: getRepositoryToken(Product),
          useFactory: repositoryMockFactory,
        },
      ],
    }).compile();

    service = module.get<ProductService>(ProductService);
    repositoryMock = await module.get(getRepositoryToken(Product));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe("createProduct", () => {
    it("should save a product in the database", async () => {
      const createProductDto = {
        name: "sample name",
        description: "a",
        price: 10,
        quantity: 1,
        categoryIds: [],
      };
      const result = await service.create(createProductDto as CreateProductDTO);
      expect(result).toEqual(createProductDto);
    });
  });

  describe("getProducts", () => {
    it("should get all products", async () => {
      repositoryMock.find.mockReturnValue(mockProduct);
      expect(repositoryMock.find).not.toHaveBeenCalled();
      const result = await service.findAll();
      expect(repositoryMock.find).toHaveBeenCalled();
      expect(result).toEqual(mockProduct);
    });
  });
});
