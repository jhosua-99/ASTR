import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Compania, Ramo, Producto } from 'app/services/cotizacion/compania.type';
import { CotizacionService } from 'app/services/cotizacion/cotizacion.service';
import { Cotizacion } from 'app/services/cotizacion/cotizacion.type';
import { PolizaService } from 'app/services/poliza/poliza.service';
import { ProcesoService } from 'app/services/processs/proceso.service';
import { cloneDeep } from 'lodash';
import { Observable, Subject, takeUntil } from 'rxjs';
import { AcademyService } from '../../academy.service';

@Component({
  selector: 'app-poliza-dialog',
  templateUrl: './poliza-dialog.component.html',
  styleUrls: ['./poliza-dialog.component.scss']
})
export class PolizaDialogComponent implements OnInit, OnDestroy {

  phaseSelectCotiForm: FormGroup;
  cotizaiones: Cotizacion[];
  companias$: Observable<Compania[]>;
  ramos$: Observable<Ramo[]>;
  productos$: Observable<Producto[]>;
  cotizaciones$: Observable<Cotizacion[]>;
  selectedCompany: number;
  selectedRamo: number;
  selectedProduct: number;
  private _unsubscribeAll: Subject<any> = new Subject<any>();
  constructor(@Inject(MAT_DIALOG_DATA) public data: any, private _formBuilder: FormBuilder, private _academyService: AcademyService, private _procesoService: ProcesoService,
    private _cotizacion_service: CotizacionService, private _polizaService: PolizaService) { }


  ngOnInit(): void {
    this.companias$ = this._cotizacion_service._companias;
    this.ramos$ = this._cotizacion_service._ramo;
    this.productos$ = this._cotizacion_service._producto;
    this.cotizaciones$ = this._cotizacion_service._cotizaciones;
    this._cotizacion_service._cotizaciones
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((categories: Cotizacion[]) => {

        // Get the categories
        this.cotizaiones = categories;
      });

    this.phaseSelectCotiForm = this._formBuilder.group({

      cod_cot_selected: [''],
      fecha_expedicion: [''],
      fecha_vigencia_desde: [''],
      fecha_vigencia_hasta: [''],
      numero_poliza: [''],
      cod_compania: [''],
      cod_ramo: [''],
      cod_producto: [''],
      valor_total: [''],
      link: [''],
    })
  }

  ngOnDestroy(): void {
    // Unsubscribe from all subscriptions
    this._unsubscribeAll.next(null);
    this._unsubscribeAll.complete();
  }

  selectCot(cod_coti) {
    
    if (cod_coti) {
      // Filter the contacts
      const contacts = cloneDeep( this.cotizaiones);
      const cotSelected = contacts.find(item => item.cod_cotizacion === cod_coti);
      this.phaseSelectCotiForm.controls['cod_compania'].setValue(cotSelected.cod_compania);
      this.phaseSelectCotiForm.controls['cod_ramo'].setValue(cotSelected.cod_ramo);
      this.phaseSelectCotiForm.controls['cod_producto'].setValue(cotSelected.cod_producto);
      this.phaseSelectCotiForm.controls['numero_poliza'].setValue(cotSelected.numero_cotizacion);
      this.phaseSelectCotiForm.controls['valor_total'].setValue(cotSelected.valor);

    }
    console.log(this.cotizaiones);


  }

  savePoliza(){
    const stepForm = this.phaseSelectCotiForm.getRawValue();
    console.log(stepForm);
    let req = {
      "cod_proceso": this.data.dataKey,
      "fecha_expedicion": stepForm.fecha_expedicion,
      "fecha_vigencia_hasta": stepForm.fecha_vigencia_hasta,
      "fecha_vigencia_desde": stepForm.fecha_vigencia_desde,
      "link": stepForm.link,
      "cod_compania": stepForm.cod_compania,
      "cod_ramo": stepForm.cod_ramo,
      "cod_producto": stepForm.cod_producto,
      "valor_total": stepForm.valor_total,
      "numero_poliza": stepForm.numero_poliza
    }
    this._polizaService.addPoliza(req).subscribe(() => {
      //this._router.navigateByUrl('/apps/academy');


    }, (response) => {
    });
  }

}
