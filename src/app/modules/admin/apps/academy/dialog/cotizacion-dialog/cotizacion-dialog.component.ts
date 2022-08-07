import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Compania, Ramo, Producto } from 'app/services/cotizacion/compania.type';
import { CotizacionService } from 'app/services/cotizacion/cotizacion.service';
import { Observable, Subject, takeUntil } from 'rxjs';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FuseConfirmationService } from '@fuse/services/confirmation';

@Component({
  selector: 'app-cotizacion-dialog',
  templateUrl: './cotizacion-dialog.component.html',
  styleUrls: ['./cotizacion-dialog.component.scss']
})
export class CotizacionDialogComponent implements OnInit, OnDestroy {
  companias$: Observable<Compania[]>;
  ramos$: Observable<Ramo[]>;
  productos$: Observable<Producto[]>;

  selectedCompany: number;
  selectedRamo: number;
  selectedProduct: number;
  isEdit: boolean = false;

  private _unsubscribeAll: Subject<any> = new Subject<any>();


  phaseCotizacionForm: FormGroup;

  constructor(@Inject(MAT_DIALOG_DATA) public data: any, private _cotizacion_service: CotizacionService, private _formBuilder: FormBuilder, private _fuseConfirmationService: FuseConfirmationService,
  ) { }

  ngOnInit(): void {

    this.companias$ = this._cotizacion_service._companias;
    this.ramos$ = this._cotizacion_service._ramo;
    this.productos$ = this._cotizacion_service._productoSelected;
    this.isEdit = this.data.isEdit;
    console.log(this.isEdit);

    if (this.isEdit) {
      let cot = this.data.cotizacion;
      console.log(cot.fecha_creada);
      this.selectedCompany = cot.company;
      this.selectedRamo = cot.ramo
      this.phaseCotizacionForm = this._formBuilder.group({
        cod_cotizacion: [cot.cod_cotizacion],
        creation_date: [cot.creation_date],
        company: [cot.company],
        ramo: [cot.ramo],
        producto: [cot.producto],
        numero_cotizacion: [cot.numero_cotizacion],
        valor: [cot.valor]
      })

    } else {
      this.phaseCotizacionForm = this._formBuilder.group({
        creation_date: [''],
        company: [''],
        ramo: [''],
        producto: [''],
        numero_cotizacion: [''],
        valor: ['']
      })
    }


  }

  ngOnDestroy(): void {
    // Unsubscribe from all subscriptions
    this._unsubscribeAll.next(null);
    this._unsubscribeAll.complete();
  }

  registrarCotizacion() {
    const stepForm = this.phaseCotizacionForm.getRawValue();
    console.log(stepForm);
    const currentDate = new Date();
    let req = {
      "cod_proceso": this.data.dataKey,
      "cod_compania": stepForm.company,
      "cod_ramo": stepForm.ramo,
      "cod_producto": stepForm.producto,
      "valor": stepForm.valor,
      "numero_cotizacion": stepForm.numero_cotizacion,
      "fecha_creada": stepForm.creation_date
    }
    this._cotizacion_service.addCotizacion(req).subscribe(() => {
      //this._router.navigateByUrl('/apps/academy');


    }, (response) => {
    });

  }

  editarCotizacion() {
    const stepForm = this.phaseCotizacionForm.getRawValue();
    console.log(stepForm);
    const currentDate = new Date();
    let req = {
      "cod_proceso": this.data.dataKey,
      "cod_compania": stepForm.company,
      "cod_ramo": stepForm.ramo,
      "cod_producto": stepForm.producto,
      "valor": stepForm.valor,
      "numero_cotizacion": stepForm.numero_cotizacion,
      "fecha_creada": stepForm.creation_date,
      "cod_cotizacion": stepForm.cod_cotizacion
    }
    this._cotizacion_service.updateCotizacion(stepForm.cod_cotizacion, req).subscribe(() => {
      //this._router.navigateByUrl('/apps/academy');


    }, (response) => {
    });
  }

  eliminarCotizacion() {
    const stepForm = this.phaseCotizacionForm.getRawValue();
    // Open the confirmation dialog
    const confirmation = this._fuseConfirmationService.open({
      title: 'Borrar Cotizacion',
      message: '¿Está seguro de que desea eliminar esta cotizacion? ¡Esta acción no se puede deshacer!',
      actions: {
        confirm: {
          label: 'Eliminar'
        }
      }
    });

    // Subscribe to the confirmation dialog closed action
    confirmation.afterClosed().subscribe((result) => {

      // If the confirm button pressed...
      if (result === 'confirmed') {
        // Get the current contact's id
        const id = stepForm.cod_cotizacion;

        

        // Delete the contact
        this._cotizacion_service.deleteCotizacion(id)
          .subscribe((isDeleted) => {

            // Return if the contact wasn't deleted...
            if (!isDeleted) {
              return;
            }

          
          });

        
      }
    });
  }
  selectCompany(valor) {
    console.log(valor);

    this.selectedCompany = valor;

    this._cotizacion_service.getListaDeRamosPorCompania(valor)
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((data) => {

      });
  }
  selectRamo(valor) {
    console.log(valor);

    this.selectedRamo = valor;

    this._cotizacion_service.getListaDeProductosPorRamo(valor)
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((data) => {

      });
  }


}


