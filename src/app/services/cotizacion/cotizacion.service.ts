import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { UserResponseModel } from 'app/core/user/user.response.model';
import { environment } from 'environments/environment';
import { BehaviorSubject, map, Observable, of, switchMap, take, tap } from 'rxjs';
import { Compania, Producto, Ramo } from './compania.type';
import { Cotizacion } from './cotizacion.type';

@Injectable({
  providedIn: 'root'
})
export class CotizacionService {
  _cotizaciones: BehaviorSubject<Cotizacion[] | null> = new BehaviorSubject(null);
  _companias: BehaviorSubject<Compania[] | null> = new BehaviorSubject(null);
  _ramo: BehaviorSubject<Ramo[] | null> = new BehaviorSubject(null);
  _ramoSelected: BehaviorSubject<Ramo[] | null> = new BehaviorSubject(null);
  _producto: BehaviorSubject<Producto[] | null> = new BehaviorSubject(null);
  _productoSelected: BehaviorSubject<Producto[] | null> = new BehaviorSubject(null);

  constructor(private _httpClient: HttpClient) { }


  getCotizacionesPorProducto(cod_proceso: string): Observable<UserResponseModel> {
    console.log('holas tod' + cod_proceso);

    return this._httpClient.get<UserResponseModel>(`${environment.APIEndpoint}` + 'api/cotizacion/' + cod_proceso).pipe(
      tap((result) => {
        this._cotizaciones.next(result.body);

        console.log('buenas buenas ' + result);
      })
    );

  }

  getListaDeCompania(): Observable<UserResponseModel> {
    return this._httpClient.get<UserResponseModel>(`${environment.APIEndpoint}` + 'api/compania/').pipe(
      tap((result) => {
        this._companias.next(result.body);

      })
    );
  }

  getListaDeRamos(): Observable<UserResponseModel> {
    return this._httpClient.get<UserResponseModel>(`${environment.APIEndpoint}` + 'api/ramo/').pipe(
      tap((result) => {
        this._ramo.next(result.body);

      })
    );
  }

  getListaDeProductos(): Observable<UserResponseModel> {
    return this._httpClient.get<UserResponseModel>(`${environment.APIEndpoint}` + 'api/producto/').pipe(
      tap((result) => {
        this._producto.next(result.body);
        this._productoSelected.next(result.body);

      })
    );
  }

  getListaDeRamosPorCompania(cod_compania): Observable<UserResponseModel> {
    return this._httpClient.get<UserResponseModel>(`${environment.APIEndpoint}` + 'api/ramo/' + cod_compania).pipe(
      tap((result) => {
        this._ramo.next(result.body);

      })
    );
  }

  getListaDeProductosPorRamo(cod_ramo): Observable<UserResponseModel> {
    return this._httpClient.get<UserResponseModel>(`${environment.APIEndpoint}` + 'api/producto/' + cod_ramo).pipe(
      tap((result) => {
        this._productoSelected.next(result.body);

      })
    );
  }

  addCotizacion(req: any): Observable<any> {

    return this._cotizaciones.pipe(
      take(1),
      switchMap(cotizaciones => this._httpClient.post<UserResponseModel>(`${environment.APIEndpoint}` + 'api/cotizacion/', req).pipe(
        map((cot) => {
          let newCot: Cotizacion = {
            cod_cotizacion: cot.body.cod_cotizacion,
            cod_proceso: req.cod_proceso,
            cod_compania: req.cod_compania,
            cod_ramo: req.cod_ramo,
            cod_producto: req.cod_producto,
            fecha_creada: req.fecha_creada,
            numero_cotizacion: req.numero_cotizacion,
            valor: req.valor
          }

          // Update the contacts with the new contact
          this._cotizaciones.next([newCot, ...cotizaciones]);

          // Return the new contact
          return newCot;
        })
      ))
    );

  }
  updateCotizacion(id:any,req: any): Observable<any> {

    return this._cotizaciones.pipe(
      take(1),
      switchMap(cotizaciones => this._httpClient.patch<UserResponseModel>(`${environment.APIEndpoint}` + 'api/cotizacion/', req).pipe(
        map((cot) => {
          const index = cotizaciones.findIndex(item => item.cod_cotizacion === id);

          let newCot: Cotizacion = {
            cod_cotizacion: req.cod_cotizacion,
            cod_proceso: req.cod_proceso,
            cod_compania: req.cod_compania,
            cod_ramo: req.cod_ramo,
            cod_producto: req.cod_producto,
            fecha_creada: req.fecha_creada,
            numero_cotizacion: req.numero_cotizacion,
            valor: req.valor
          }

          cotizaciones[index] = newCot;

          // Update the contacts
          this._cotizaciones.next(cotizaciones);
          

          // Return the new contact
          return newCot;
        })
      ))
    );

  }

  deleteCotizacion(id: number): Observable<UserResponseModel>
    {
        return this._cotizaciones.pipe(
            take(1),
            switchMap(cotizaciones => this._httpClient.delete(`${environment.APIEndpoint}`+'api/cotizacion', {params: {id}}).pipe(
                map((result: UserResponseModel) => {

                    // Find the index of the deleted contact
                    const index = cotizaciones.findIndex(item => item.cod_cotizacion === id);

                    // Delete the contact
                    cotizaciones.splice(index, 1);

                    // Update the contacts
                    this._cotizaciones.next(cotizaciones);

                    // Return the deleted status
                    return result.body.isDeleted;
                })
            ))
        );
    }


}
