import { TestBed } from '@angular/core/testing';

import { ProfessorApiService } from './professor-api.service';

describe('ProfessorApiService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: ProfessorApiService = TestBed.get(ProfessorApiService);
    expect(service).toBeTruthy();
  });
});
