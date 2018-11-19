import { TestBed } from '@angular/core/testing';

import { ConfiguracaoService } from './configuracao.service';

describe('ConfiguracaoService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: ConfiguracaoService = TestBed.get(ConfiguracaoService);
    expect(service).toBeTruthy();
  });
});
