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
import { CotizacionDialogComponent } from '../dialog/cotizacion-dialog/cotizacion-dialog.component';
import { PolizaDialogComponent } from '../dialog/poliza-dialog/poliza-dialog.component';
import { PolizaService } from 'app/services/poliza/poliza.service';
import { Poliza } from 'app/services/poliza/poliza.type';
import { EmpleadoService } from '../../empleados/empleado.service';
import { Empleado } from '../../empleados/empleados.types';
import { response } from 'express';
import * as XLSX from 'xlsx';

import { Anexo } from 'app/services/anexo/anexo.type';
import { AnexoService } from 'app/services/anexo/anexo.service';


@Component({
    selector: 'academy-details',
    templateUrl: './details.component.html',
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class AcademyDetailsComponent implements OnInit, OnDestroy {
    @ViewChild('courseSteps', { static: true }) courseSteps: MatTabGroup;
    categories: Category[];
    cotizaiones: Cotizacion[];
    companias$: Observable<Compania[]>;
    ramos$: Observable<Ramo[]>;
    productos$: Observable<Producto[]>;
    cotizaciones$: Observable<Cotizacion[]>;
    polizas$: Observable<Poliza[]>;

    cotizacionesExport$;

    empleados$: Observable<Empleado[]>;
    empleado$: Empleado;

    anexos$: Observable<Anexo[]>;

    course: Course;
    polizasLista: Poliza[];
    currentStep: number = 0;
    drawerMode: 'over' | 'side' = 'side';
    drawerOpened: boolean = true;
    private _unsubscribeAll: Subject<any> = new Subject<any>();

    empForm: FormGroup;


    /**
     * formularios por fases
     */
    phase1Form: FormGroup;
    resumeForm: FormGroup;
    phaseCotizacionForm: FormGroup;
    phaseSeguimientoForm: FormGroup;
    phaseSelectCotiForm: FormGroup;
    phaseRecabacionForm: FormGroup;

    /**
     * Constructor
     */
    constructor(
        @Inject(DOCUMENT) private _document: Document,
        private _empleadoService: EmpleadoService,
        private _academyService: AcademyService,
        private _changeDetectorRef: ChangeDetectorRef,
        private _elementRef: ElementRef,
        private _formBuilder: FormBuilder,
        private _fuseMediaWatcherService: FuseMediaWatcherService,
        private _procesoService: ProcesoService,
        private _cotizacion_service: CotizacionService,
        private _polizaService: PolizaService,
        private _anexoService: AnexoService,
        private matDialog: MatDialog,
        private _cotizacionService: CotizacionService
    ) {
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    /**
     * On init
     */
    ngOnInit(): void {

        this._cotizacion_service.getAuditoriaCotizacion().subscribe(resp => {
            console.log(resp.body);           
            this.cotizacionesExport$ = resp.body;
        })

        

        this.companias$ = this._cotizacion_service._companias;
        this.ramos$ = this._cotizacion_service._ramo;
        this.productos$ = this._cotizacion_service._producto;
        this.cotizaciones$ = this._cotizacion_service._cotizaciones;
        this.polizas$ = this._polizaService._polizas;
        this.anexos$ = this._anexoService._anexos;




        this._empleadoService.getContacts().subscribe(response => {
            this.empleados$ = response.body
        }
        );



        // Create the contact form
        this.phase1Form = this._formBuilder.group({
            emails: this._formBuilder.array([]),
        });

        this.phaseSelectCotiForm = this._formBuilder.group({

            cod_cot_selected: ['']
        })


        this.phaseRecabacionForm = this._formBuilder.group({
            campos: this._formBuilder.array([])
        })

        this.phaseCotizacionForm = this._formBuilder.group({
            cotizacion: this._formBuilder.array([]),
        });
        this.phaseCotizacionForm.disable();

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
                this._changeDetectorRef.markForCheck();
            });







        // Setup the emails form array
        const emailFormGroups = [];

        // Create an email form group
        emailFormGroups.push(
            this._formBuilder.group({
                email: [''],
                value: [''],
                label: ['']
            })
        );

        // Add the email form groups to the emails form array
        emailFormGroups.forEach((emailFormGroup) => {
            (this.phase1Form.get('emails') as FormArray).push(emailFormGroup);
        });



        // Get the categories
        this._academyService.categories$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((categories: Category[]) => {

                // Get the categories
                this.categories = categories;

                // Mark for check
                this._changeDetectorRef.markForCheck();
            });

        // Get the course
        this._procesoService.course$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((course: Course) => {

                // Get the course
                this.course = course;


                this.resumeForm = this._formBuilder.group({
                    cod_status: [this.course.proceso.cod_status.toString()]
                })

                // Go to step
                this.goToStep(course.progress.currentStep);

                // Mark for check
                this._changeDetectorRef.markForCheck();
            });

        // Subscribe to media changes
        this._fuseMediaWatcherService.onMediaChange$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe(({ matchingAliases }) => {

                // Set the drawerMode and drawerOpened
                if (matchingAliases.includes('lg')) {
                    this.drawerMode = 'side';
                    this.drawerOpened = true;
                }
                else {
                    this.drawerMode = 'over';
                    this.drawerOpened = false;
                }

                // Mark for check
                this._changeDetectorRef.markForCheck();
            });

            this.empForm = this._formBuilder.group({
                empAsignado         : [''],
                empCotizacion       : [''],  
                idEmpAsignado       : [''],
                idEmpCotizacion     : [''],
            });
    }

    /**
     * On destroy
     */
    ngOnDestroy(): void {
        // Unsubscribe from all subscriptions
        this._unsubscribeAll.next(null);
        this._unsubscribeAll.complete();
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------
    /**
         * Add the email field
         */
    addCotizationField(): void {
        // Create an empty email form group
        const cotFormGroup = this._formBuilder.group({
            cod_cotizacion: [''],
            creation_date: [''],
            company: [''],
            ramo: [''],
            producto: [''],
            numero_cotizacion: [''],
            valor: ['']
        });



        // Add the email form group to the correos form array
        (this.phaseCotizacionForm.get('cotizacion') as FormArray).push(cotFormGroup);

        // Mark for check
        this._changeDetectorRef.markForCheck();
    }

    /**
     * Go to given step
     *
     * @param step
     */
    goToStep(step: number): void {
        // Set the current step
        this.currentStep = step;

        // Go to the step
        this.courseSteps.selectedIndex = this.currentStep;

        // Mark for check
        this._changeDetectorRef.markForCheck();
    }

    /**
     * Go to previous step
     */
    goToPreviousStep(): void {
        // Return if we already on the first step
        if (this.currentStep === 0) {
            return;
        }

        // Go to step
        this.goToStep(this.currentStep - 1);

        // Scroll the current step selector from sidenav into view
        this._scrollCurrentStepElementIntoView();
    }

    /**
     * Go to next step
     */
    goToNextStep(): void {
        // Return if we already on the last step
        if (this.currentStep === this.course.totalSteps - 1) {
            return;
        }

        // Go to step
        this.goToStep(this.currentStep + 1);

        // Scroll the current step selector from sidenav into view
        this._scrollCurrentStepElementIntoView();
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

    // -----------------------------------------------------------------------------------------------------
    // @ Private methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Scrolls the current step element from
     * sidenav into the view. This only happens when
     * previous/next buttons pressed as we don't want
     * to change the scroll position of the sidebar
     * when the user actually clicks around the sidebar.
     *
     * @private
     */
    private _scrollCurrentStepElementIntoView(): void {
        // Wrap everything into setTimeout so we can make sure that the 'current-step' class points to correct element
        setTimeout(() => {

            // Get the current step element and scroll it into view
            const currentStepElement = this._document.getElementsByClassName('current-step')[0];
            if (currentStepElement) {
                currentStepElement.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    }


    openEditCotiDialog(position) {
        const dialogConfig = new MatDialogConfig();
        const stepForm = this.phaseCotizacionForm.getRawValue();
        console.log(stepForm.cotizacion[position]);

        this.matDialog.open(CotizacionDialogComponent, {
            data: {
                isEdit: true,
                dataKey: this.course.proceso.cod_proceso,
                cotizacion: stepForm.cotizacion[position]

            }
        });
    }

    openCreateCotiDialog() {
        const dialogConfig = new MatDialogConfig();
        this.matDialog.open(CotizacionDialogComponent, {
            data: {
                isEdit: false,
                dataKey: this.course.proceso.cod_proceso
            }
        });
    }

    openCreatePoliDialog() {
        const dialogConfig = new MatDialogConfig();
        this.matDialog.open(PolizaDialogComponent, {
            data: {
                isEdit: false,
                dataKey: this.course.proceso.cod_proceso
            }
        });
    }

    saveCoti() {
        const stepForm = this.phaseSelectCotiForm.getRawValue();



    }

    saveRecabacionDocsForm() {
        const stepForm = this.phaseRecabacionForm.getRawValue();
        let req = {
            "proceso": this.course.proceso.cod_proceso,
            "campos": stepForm.campos
        }
        this._anexoService.updateProceso(req).subscribe(() => {


        }, (response) => {
        });

        console.log(stepForm);


    }

    saveProcessStatus() {
        const stepForm = this.resumeForm.getRawValue();
        const data = {
            "cod_status": stepForm.cod_status,
            "cod_proceso": this.course.proceso.cod_proceso
        }
        this._procesoService.updateProcessStatus(this.course.proceso.cod_proceso, data, this.course).subscribe(() => {
            //this._router.navigateByUrl('/apps/academy');
            console.log('Pruebas' + Number(stepForm.cod_status));

            this.goToStep(Number(stepForm.cod_status));
            if (stepForm.cod_status == "1") {
                this.course.proceso.nom_status = "Inicio"

            } else if (stepForm.cod_status == "2") {
                this.course.proceso.nom_status = "Cotización"

            } else if (stepForm.cod_status == "3") {
                this.course.proceso.nom_status = "Recabación de documentos"

            } else if (stepForm.cod_status == "4") {
                this.course.proceso.nom_status = "Seguimiento"

            }
        }, (response) => {
        });
    }

    openEditPoliDialog() {

        const stepForm = this.phaseSeguimientoForm.getRawValue();
        console.log(stepForm.poliza[0]);

        const dialogConfig = new MatDialogConfig();
        this.matDialog.open(PolizaDialogComponent, {
            data: {
                isEdit: true,
                dataKey: this.course.proceso.cod_proceso,
                poliza: stepForm.poliza[0],
                mPoliza : this.polizasLista[0]
            }
        });
    }

    empAsignado(){

        console.log("HOLA EMPLEADO ASINGADO:");
        const empAux = this.empForm.getRawValue(); 
        console.log(empAux);
      
        window['idEmpAsignado'] = empAux.idEmpAsignado;
        window['idEmpCotizacion'] = empAux.idEmpCotizacion;
       
        
        console.log(window['idEmpAsignado'] );
        console.log(window['idEmpCotizacion'] );
    }

    export() {
      
        
        console.log(this.cotizacionesExport$);
        
    
         const workBook = XLSX.utils.book_new(); // create a new blank book
         const workSheet = XLSX.utils.json_to_sheet(this.cotizacionesExport$);
    
         XLSX.utils.book_append_sheet(workBook, workSheet, 'data'); // add the worksheet to the book
         XLSX.writeFile(workBook, 'AuditoriaCotizaciones.xlsx'); // initiate a file download in browser
      }

   

}
