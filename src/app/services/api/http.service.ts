import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders  } from '@angular/common/http';
import { SessaoService } from '../local/sessao.service';

@Injectable({
  providedIn: 'root'
})
export class HttpService {

  API_URL: string;
  data: any;

  constructor(private http: HttpClient, private sessaoService: SessaoService) { }

  get(url: string) {
    
  }

  post() {

  }
}
