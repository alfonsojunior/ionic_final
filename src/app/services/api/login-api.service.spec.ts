import { TestBed } from '@angular/core/testing';

import { LoginApiService } from './login-api.service';

describe('LoginApiService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: LoginApiService = TestBed.get(LoginApiService);
    expect(service).toBeTruthy();
  });
});
