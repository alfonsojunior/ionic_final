import { TestBed } from '@angular/core/testing';

import { SessaoService } from './sessao.service';

describe('SessaoService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: SessaoService = TestBed.get(SessaoService);
    expect(service).toBeTruthy();
  });
});
