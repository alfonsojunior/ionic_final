import { TestBed } from '@angular/core/testing';

import { StructureDbService } from './structure-db.service';

describe('StructureDbService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: StructureDbService = TestBed.get(StructureDbService);
    expect(service).toBeTruthy();
  });
});
