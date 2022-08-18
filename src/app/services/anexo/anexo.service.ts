import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { UserResponseModel } from 'app/core/user/user.response.model';
import { environment } from 'environments/environment';
import { BehaviorSubject, Observable, of, switchMap, tap } from 'rxjs';
import { Anexo } from './anexo.type';

@Injectable({
  providedIn: 'root'
})
export class AnexoService {
  _anexos: BehaviorSubject<Anexo[] | null> = new BehaviorSubject(null);
  constructor(private _httpClient: HttpClient) { }

  getAnexoPorProceso(cod_proceso: string): Observable<UserResponseModel> {

    return this._httpClient.get<UserResponseModel>(`${environment.APIEndpoint}` + 'api/anexo_proceso/' + cod_proceso).pipe(
      tap((result) => {
        this._anexos.next(result.body);
      })
    );

  }

  updateProceso(req: any) : Observable<any> {
    return this._httpClient.put(`${environment.APIEndpoint}` + 'api/anexo_proceso/', req).pipe(
      switchMap((response: any) => {
          console.log(response);

          return of(response);
      })
  );
  }
}
