import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { API_URL } from '../api.constants';
import { Rol, RolRequest } from '../models/rol.model';

@Injectable({ providedIn: 'root' })
export class RolService {

  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${API_URL}/roles`;

  listar(): Observable<Rol[]> {
    return this.http.get<Rol[]>(this.baseUrl);
  }

  obtenerPorId(id: number): Observable<Rol> {
    return this.http.get<Rol>(`${this.baseUrl}/${id}`);
  }

  crear(request: RolRequest): Observable<Rol> {
    return this.http.post<Rol>(this.baseUrl, request);
  }

  actualizar(id: number, request: RolRequest): Observable<Rol> {
    return this.http.put<Rol>(`${this.baseUrl}/${id}`, request);
  }

  eliminar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
