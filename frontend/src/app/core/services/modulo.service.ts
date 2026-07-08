import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { API_URL } from '../api.constants';
import { Modulo, ModuloRequest } from '../models/modulo.model';

@Injectable({ providedIn: 'root' })
export class ModuloService {

  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${API_URL}/modulos`;

  listar(): Observable<Modulo[]> {
    return this.http.get<Modulo[]>(this.baseUrl);
  }

  obtenerPorId(id: number): Observable<Modulo> {
    return this.http.get<Modulo>(`${this.baseUrl}/${id}`);
  }

  crear(request: ModuloRequest): Observable<Modulo> {
    return this.http.post<Modulo>(this.baseUrl, request);
  }

  actualizar(id: number, request: ModuloRequest): Observable<Modulo> {
    return this.http.put<Modulo>(`${this.baseUrl}/${id}`, request);
  }

  eliminar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }

  asignarRoles(id: number, rolesIds: number[]): Observable<Modulo> {
    return this.http.post<Modulo>(`${this.baseUrl}/${id}/roles`, { rolesIds });
  }
}
