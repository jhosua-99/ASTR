import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { UserResponseModel } from 'app/core/user/user.response.model';
import { BehaviorSubject, Observable, switchMap, tap } from 'rxjs';
import { CampoSeguro } from './campo.seguro.type';
import { Seguro } from './seguro.types';
import { TipoSeguro } from './tipo.seguro.type';
import { environment } from '../../environments/environment';
@Injectable({
  providedIn: 'root'
})
export class SeguroService {
  private _seguros: BehaviorSubject<Seguro[] | null> = new BehaviorSubject(null);
  private _tiposSeguros: BehaviorSubject<TipoSeguro[] | null> = new BehaviorSubject(null);
  recomendation: BehaviorSubject<any | null> = new BehaviorSubject(null);
  private _camposSeguro : BehaviorSubject<CampoSeguro[] | null> = new BehaviorSubject(null);

  constructor(private _httpClient: HttpClient) { }



  /**
     * Getter for seguros
     */
  get tiposSeguros$(): Observable<TipoSeguro[]> {
    return this._tiposSeguros.asObservable();
  }

  get seguros$(): Observable<Seguro[]> {
    return this._seguros.asObservable();
  }

  /**
     * Getter for campos
     */
   get campos$(): Observable<CampoSeguro[]> {
    return this._camposSeguro.asObservable();
  }

  getSeguros(): Observable<UserResponseModel> {
    return this._httpClient.get<UserResponseModel>(`${environment.APIEndpoint}`+'api/seguros/').pipe(
      tap((result) => {
        console.log(result);
        this._seguros.next(result.body);
      })
    );
  }

  getTipoSeguros(): Observable<UserResponseModel> {
    return this._httpClient.get<UserResponseModel>(`${environment.APIEndpoint}`+'api/seguros/tipo-seguro/').pipe(
      tap((result) => {
        console.log(result);
        result.body.push({
          "cod_tipo_seguro" : 0,
          "nom_tipo_seguro" : "Todos"
        })
        this._tiposSeguros.next(result.body);
      })
    );
  }


  getCamposSeguros(cod_seg :number):Observable<UserResponseModel> {
    return this._httpClient.get<UserResponseModel>(`${environment.APIEndpoint}`+'api/campos/'+cod_seg).pipe(
      tap((result) => {
        console.log('Campos '+result.body);
        this._camposSeguro.next(result.body);
      })
    );
  }

  getSeguroRecomendado(nom_seg):Observable<any> {
    return this._httpClient.post<any>(`${environment.APIEndpoint}`+'api/seguros/predict',{nom_seg : nom_seg})
  }
}
