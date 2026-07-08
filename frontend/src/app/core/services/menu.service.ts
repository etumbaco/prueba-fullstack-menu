import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { API_URL } from '../api.constants';
import { MenuNode } from '../models/menu-node.model';

@Injectable({ providedIn: 'root' })
export class MenuService {

  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${API_URL}/menu`;

  obtenerMenuPorRol(rolId: number): Observable<MenuNode[]> {
    const params = new HttpParams().set('rolId', rolId);
    return this.http.get<MenuNode[]>(this.baseUrl, { params });
  }
}
