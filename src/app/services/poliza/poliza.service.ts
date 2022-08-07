import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { UserResponseModel } from 'app/core/user/user.response.model';
import { environment } from 'environments/environment';
import { BehaviorSubject, map, Observable, switchMap, take, tap } from 'rxjs';
import { Cotizacion } from '../cotizacion/cotizacion.type';
import { Poliza } from './poliza.type';

@Injectable({
  providedIn: 'root'
})
export class PolizaService {
  _polizas: BehaviorSubject<Poliza[] | null> = new BehaviorSubject(null);
  constructor(private _httpClient: HttpClient) { }


  
  getPolizaPorProceso(cod_proceso: string): Observable<UserResponseModel> {
    console.log('holas tod' + cod_proceso);

    return this._httpClient.get<UserResponseModel>(`${environment.APIEndpoint}` + 'api/seguimiento/' + cod_proceso).pipe(
      tap((result) => {
        this._polizas.next(result.body);

        console.log('buenas buenas ' + result);
      })
    );

  }

  addPoliza(req: any): Observable<any> {

    return this._polizas.pipe(
      take(1),
      switchMap(cotizaciones => this._httpClient.post<UserResponseModel>(`${environment.APIEndpoint}` + 'api/seguimiento/', req).pipe(
        map((cot) => {
          let newPol: Poliza = {
            cod_poliza: cot.body.cod_poliza,
            cod_seguimiento: cot.body.cod_seguimiento,
            cod_proceso: req.cod_proceso,
            fecha_expedicion: req.fecha_expedicion,
            fecha_vigencia_hasta: req.fecha_vigencia_hasta,
            fecha_vigencia_desde: req.fecha_vigencia_desde,
            link: req.link,
            cod_compania: req.cod_compania,
            cod_ramo: req.cod_ramo,
            cod_producto: req.cod_producto,
            numero_poliza: req.numero_poliza,
            fecha_creada: req.fecha_creada,
            valor_total: req.valor_total
          }

          // Update the contacts with the new contact
          this._polizas.next([newPol, ...cotizaciones]);

          // Return the new contact
          return newPol;
        })
      ))
    );

  }
}
