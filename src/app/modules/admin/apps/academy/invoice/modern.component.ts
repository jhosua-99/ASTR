import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, Inject, OnDestroy, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { MatTabGroup } from '@angular/material/tabs';
import { catchError, Observable, Subject, takeUntil } from 'rxjs';
import { FuseMediaWatcherService } from '@fuse/services/media-watcher';
import { Category, Course } from 'app/modules/admin/apps/academy/academy.types';
import { AcademyService } from 'app/modules/admin/apps/academy/academy.service';
import { FormArray, FormBuilder, FormGroup } from '@angular/forms';
import { ProcesoService } from 'app/services/processs/proceso.service';
import { CotizacionService } from 'app/services/cotizacion/cotizacion.service';
import { UserResponseModel } from 'app/core/user/user.response.model';
import { Cotizacion } from 'app/services/cotizacion/cotizacion.type';
import { Compania, Producto, Ramo } from 'app/services/cotizacion/compania.type';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { PolizaService } from 'app/services/poliza/poliza.service';
import { Poliza } from 'app/services/poliza/poliza.type';
import { response } from 'express';

import { Anexo } from 'app/services/anexo/anexo.type';
import { AnexoService } from 'app/services/anexo/anexo.service';
import { EmpleadoService } from '../../empleados/empleado.service';
import { User } from 'app/core/user/user.types';
import { UserService } from 'app/core/user/user.service';

import * as html2pdf from 'html2pdf.js'

@Component({
    selector: 'modern',
    templateUrl: './modern.component.html',
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ModernComponent implements OnInit, OnDestroy {

    course: Course;
    resumeForm: FormGroup;
    cotizaiones: Cotizacion[];
    companias$: Observable<Compania[]>;
    ramos$: Observable<Ramo[]>;
    anexos$: Observable<Anexo[]>;
    phaseSeguimientoForm: FormGroup;
    productos$: Observable<Producto[]>;
    phaseCotizacionForm: FormGroup;
    phaseRecabacionForm: FormGroup;
    polizas$: Observable<Poliza[]>;
    polizasLista: Poliza[];
    user: User;

    fechaExp :string;
    fechaDesde :string;
    fechaHasta :string;

    private _unsubscribeAll: Subject<any> = new Subject<any>();

    /**
     * Constructor
     */
    constructor(private _formBuilder: FormBuilder,
        private _empleadoService: EmpleadoService,
        private _userService: UserService,
        private _academyService: AcademyService,
        private _changeDetectorRef: ChangeDetectorRef,
        private _elementRef: ElementRef,
        private _fuseMediaWatcherService: FuseMediaWatcherService,
        private _procesoService: ProcesoService,
        private _cotizacion_service: CotizacionService,
        private _polizaService: PolizaService,
        private _anexoService: AnexoService,
        private matDialog: MatDialog,
        private _cotizacionService: CotizacionService) {


    }

    ngOnInit(): void {
        this.companias$ = this._cotizacion_service._companias;
        this.ramos$ = this._cotizacion_service._ramo;
        this.productos$ = this._cotizacion_service._producto;
        this.anexos$ = this._anexoService._anexos;
        this.polizas$ = this._polizaService._polizas;

        this._userService.user$
            .pipe((takeUntil(this._unsubscribeAll)))
            .subscribe((user: User) => {
                console.log(user);
                this.user = user;
            });

        this.resumeForm = this._formBuilder.group({
            cod_status: ['1']
        })
        // Get the course
        this._procesoService.course$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((course: Course) => {

                // Get the course
                this.course = course;


                this.resumeForm = this._formBuilder.group({
                    cod_status: [this.course.proceso.cod_status.toString()]
                })


                // Mark for check
                this._changeDetectorRef.markForCheck();
            });

        //coti
        this.phaseCotizacionForm = this._formBuilder.group({
            cotizacion: this._formBuilder.array([]),
        });
        this.phaseCotizacionForm.disable();
        this._cotizacion_service._cotizaciones.pipe(takeUntil(this._unsubscribeAll))
            .subscribe((cotizaiones: Cotizacion[]) => {

                // Get the categories
                this.cotizaiones = cotizaiones;
                console.log('cotitacho ' + cotizaiones);
                (this.phaseCotizacionForm.get('cotizacion') as FormArray).clear();
                const cotizacionFormGroups = [];

                if (cotizaiones.length > 0) {
                    cotizaiones.forEach((cot) => {
                        console.log('fec ' + cot.fecha_creada);

                        cotizacionFormGroups.push(
                            this._formBuilder.group({
                                cod_cotizacion: [cot.cod_cotizacion],
                                creation_date: [cot.fecha_creada],
                                company: [cot.cod_compania],
                                ramo: [cot.cod_ramo],
                                producto: [cot.cod_producto],
                                numero_cotizacion: [cot.numero_cotizacion],
                                valor: [cot.valor]
                            })
                        );
                    })
                }
                // Add the email form groups to the correos form array
                cotizacionFormGroups.forEach((cotizationFormGroup) => {
                    (this.phaseCotizacionForm.get('cotizacion') as FormArray).push(cotizationFormGroup);
                });
                // Mark for check
                this._changeDetectorRef.markForCheck();
            });


        this.phaseRecabacionForm = this._formBuilder.group({
            campos: this._formBuilder.array([])
        })

        this.anexos$.pipe(takeUntil(this._unsubscribeAll)).subscribe((anexos: Anexo[]) => {
            console.log('guena ' + anexos.length);
            for (let campo of anexos) {
                const campoFormGroup = this._formBuilder.group({
                    cod_anexo_proceso: [campo.cod_anexo_proceso],
                    name: [campo.etiqueta],
                    valor: [campo.valor],
                    url: [campo.url]
                });
                (this.phaseRecabacionForm.get('campos') as FormArray).push(campoFormGroup);
            }

        })

        this.phaseSeguimientoForm = this._formBuilder.group({
            poliza: this._formBuilder.array([]),
        });
        this.phaseSeguimientoForm.disable();

        this.polizas$.pipe(takeUntil(this._unsubscribeAll))
            .subscribe((list: Poliza[]) => {

                // Get the categories
                (this.phaseSeguimientoForm.get('poliza') as FormArray).clear();
                const cotizacionFormGroups = [];
                this.polizasLista = list;
                if (list.length > 0) {
                    list.forEach((cot) => {
                        console.log('fec ' + cot.fecha_creada);

                        cotizacionFormGroups.push(
                            this._formBuilder.group({

                                cod_cot_selected: [''],
                                fecha_expedicion: [cot.fecha_expedicion],
                                fecha_vigencia_desde: [cot.fecha_vigencia_desde],
                                fecha_vigencia_hasta: [cot.fecha_vigencia_hasta],
                                numero_poliza: [cot.numero_poliza],
                                cod_compania: [cot.cod_compania],
                                cod_ramo: [cot.cod_ramo],
                                cod_producto: [cot.cod_producto],
                                valor_total: [cot.valor_total],
                                link: [cot.link],
                            })
                        );
                    })
                }
                // Add the email form groups to the correos form array
                cotizacionFormGroups.forEach((cotizationFormGroup) => {
                    (this.phaseSeguimientoForm.get('poliza') as FormArray).push(cotizationFormGroup);
                });
                // Mark for check
                let ultimaPol = list[0];
                this.fechaExp = ultimaPol.fecha_expedicion;
                this.fechaDesde = ultimaPol.fecha_vigencia_desde;
                this.fechaHasta = ultimaPol.fecha_vigencia_hasta;
                this._changeDetectorRef.markForCheck();
            });
    }

    ngOnDestroy(): void {
        // Unsubscribe from all subscriptions
        this._unsubscribeAll.next(null);
        this._unsubscribeAll.complete();
    }

    export(){
        const options = {
            filename : "invoice.pdf",
            image : { type : 'jpeg' },
            html2canvas : {},
            jsPDF: {
                orientation : "portrait"
            }
        }
        const content: Element = document.getElementById("element-to-export")

        html2pdf().from(content).set(options).save();
    }

    /**
    * Track by function for ngFor loops
    *
    * @param index
    * @param item
    */
    trackByFn(index: number, item: any): any {
        return item.id || index;
    }

}
