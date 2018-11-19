import { TestBed } from '@angular/core/testing';

import { ProfessorDbService } from './professor-db.service';

describe('ProfessorDbService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: ProfessorDbService = TestBed.get(ProfessorDbService);
    expect(service).toBeTruthy();
  });
});
