import { Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { UserResponseModel } from 'app/core/user/user.response.model';
import { UserService } from 'app/core/user/user.service';
import { User } from 'app/core/user/user.types';
import { ContactsService } from 'app/modules/admin/apps/contacts/contacts.service';
import { Contact } from 'app/modules/admin/apps/contacts/contacts.types';
import { CampoSeguro } from 'app/services/campo.seguro.type';
import { ProcesoService } from 'app/services/processs/proceso.service';
import { SeguroService } from 'app/services/seguro.service';
import { Seguro } from 'app/services/seguro.types';
import { Observable, Subject, takeUntil } from 'rxjs';
import { ApexOptions } from 'ng-apexcharts';
import { AnalyticsService } from 'app/modules/admin/ui/forms/wizards/analytics.service';
import { ProjectService } from 'app/modules/admin/dashboards/project/project.service';
import { formatDate } from '@angular/common';
import { Recomendation } from './recomendation.type';


@Component({
    selector: 'forms-wizards',
    templateUrl: './wizards.component.html',
    styleUrls: ['./wizard.component.css'],
    encapsulation: ViewEncapsulation.None
})
export class FormsWizardsComponent implements OnInit, OnDestroy {
    private _unsubscribeAll: Subject<any> = new Subject<any>();


    horizontalStepperForm: FormGroup;
    verticalStepperForm: FormGroup;
    seguros$: Observable<Seguro[]>;
    listaSeguros: Seguro[];
    recomendation : Recomendation[];
    contacts$: Observable<Contact[]>;
    users$: Observable<User[]>
    campos$: Observable<CampoSeguro[]>

    /***
     * 
     */
    chartVisitors: ApexOptions;
    chartConversions: ApexOptions;
    chartImpressions: ApexOptions;
    chartVisits: ApexOptions;
    chartVisitorsVsPageViews: ApexOptions;
    chartNewVsReturning: ApexOptions;
    chartGender: ApexOptions;
    chartAge: ApexOptions;
    chartLanguage: ApexOptions;
    data: any;
    data2: any;
    /**
     * 
     * 
     */


    /**
     * Constructor
     */

    showAnalaytics: boolean = false;

    

    constructor(private _formBuilder: FormBuilder,
        private segurosService: SeguroService,
        private _contactsService: ContactsService,
        private _userService: UserService,
        private _router: Router,
        private _procesoService: ProcesoService,
        private _analyticsService: AnalyticsService,
        private _projectService: ProjectService    ) {
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    /**
     * On init
     */
    ngOnInit(): void {
        this._projectService.data$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((data) => {

                // Store the data
                this.data2 = data;

                
            });
        this._projectService.getData()
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((data) => {

                // Store the data
                this.data2 = data;

               
            });

        // Get the data
        this._analyticsService.data$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((data) => {

                // Store the data
                this.data = data;

                
            });

        this._analyticsService.getData().pipe(takeUntil(this._unsubscribeAll))
            .subscribe((data) => {

                // Store the data
                this.data = data;

                
            });

        // Attach SVG fill fixer to all ApexCharts
        window['Apex'] = {
            chart: {
                events: {
                    mounted: (chart: any, options?: any): void => {
                        this._fixSvgFill(chart.el);
                    },
                    updated: (chart: any, options?: any): void => {
                        this._fixSvgFill(chart.el);
                    }
                }
            }
        };
        
        // get seguros
        // Get the contacts
        /**
         * observador
         */
        this.seguros$ = this.segurosService.seguros$;
        /**
         * llama los datos 
         */
        this.segurosService.getSeguros()
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((seguros: UserResponseModel) => {
                this.listaSeguros = seguros.body
            });

        

        // Get the contacts
        this.contacts$ = this._contactsService.contacts$;
        this._contactsService.getContacts()
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((contacts: UserResponseModel) => {

            });

        // Get users
        this.users$ = this._userService.users$;
        this._userService.list()
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((contacts: UserResponseModel) => {

            });

        // Horizontal stepper form
        this.horizontalStepperForm = this._formBuilder.group({
            campos: this._formBuilder.array([]),
            step1: this._formBuilder.group({
                seguroSeleccionado: ['', [Validators.required]],
                clienteSeleccionado: ['', Validators.required],
                empleadoSeleccionado: ['', Validators.required]
            }),
            step2: this._formBuilder.group({

            }),
            step3: this._formBuilder.group({
                faseProceso: ['1', Validators.required]
            })

        });




    }

    finalizarRegistro() {
        // Get the contact object
        const stepForm = this.horizontalStepperForm.getRawValue();
        console.log(stepForm);
        const currentDate = new Date();
        
        let proceso = {
            "cod_seguro": stepForm.step1.seguroSeleccionado,
            "cod_usuario": stepForm.step1.empleadoSeleccionado,
            "cod_cliente": stepForm.step1.clienteSeleccionado,
            "cod_status": stepForm.step3.faseProceso,
            "fecha_inicio": formatDate(currentDate, 'yyyy-MM-dd', 'en-US'),
            "fecha_final": "2022-04-24"
        }

        let req = {
            "proceso": proceso,
            "campos": stepForm.campos
        }
        this._procesoService.add(req).subscribe(() => {
            this._router.navigateByUrl('/apps/academy');

        }, (response) => {
        });

    }

    getCampoSeguro() {
        
        // Get the contact object
        const stepForm = this.horizontalStepperForm.getRawValue();
        let codSeguro = stepForm.step1.seguroSeleccionado
        this.campos$ = this.segurosService.campos$;
        console.log(stepForm.step1);
        const index = this.listaSeguros.findIndex(item => item.cod_seguro === codSeguro);
        const cod_tipo_Seguro = this.listaSeguros[index].cod_tipo_seguro
        console.log(cod_tipo_Seguro);
        
        this.segurosService.getSeguroRecomendado(cod_tipo_Seguro).pipe(takeUntil(this._unsubscribeAll))
        .subscribe((response: any) => {

            console.log('tutas '+response.body);
            this.recomendation = response.body
            
            //console.log('pruebas '+Math.round(this.recomendation[1].similarity*100));
            
            // Prepare the chart data
            this._prepareChartData();
            
        });
        

        this.segurosService.getCamposSeguros(codSeguro).pipe(takeUntil(this._unsubscribeAll))
            .subscribe((response: UserResponseModel) => {
                let list: CampoSeguro[] = response.body;
                //clear
                (this.horizontalStepperForm.get('campos') as FormArray).clear();
                // Create an empty email form group
                for (let campo of list) {
                    const campoFormGroup = this._formBuilder.group({
                        name: [campo.nom_campo],
                        valor: [''],
                        url: ['']
                    });
                    (this.horizontalStepperForm.get('campos') as FormArray).push(campoFormGroup);
                }

                console.log((this.horizontalStepperForm.get('campos') as FormArray).controls);
                /*
                this.horizontalStepperForm.removeControl('step2');
                let form = new FormGroup({});
                
                //(this.horizontalStepperForm.get('step2') as FormGroup).removeControl('');
                for(let campo of list){
                    form.addControl(campo.nom_campo,new FormControl('', [Validators.required]));
    
                    form.addControl('url_'+campo.nom_campo,new FormControl('', []));
                }
                this.horizontalStepperForm.addControl('step2',form);
                */



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

    gerRecomendation(seguro){
        
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

    /**
     * Prepare the chart data from the data
     *
     * @private
     */
    private _prepareChartData(): void {
        // Visitors
        this.chartVisitors = {
            chart: {
                animations: {
                    speed: 400,
                    animateGradually: {
                        enabled: false
                    }
                },
                fontFamily: 'inherit',
                foreColor: 'inherit',
                width: '100%',
                height: '100%',
                type: 'area',
                toolbar: {
                    show: false
                },
                zoom: {
                    enabled: false
                }
            },
            colors: ['#818CF8'],
            dataLabels: {
                enabled: false
            },
            fill: {
                colors: ['#312E81']
            },
            grid: {
                show: true,
                borderColor: '#334155',
                padding: {
                    top: 10,
                    bottom: -40,
                    left: 0,
                    right: 0
                },
                position: 'back',
                xaxis: {
                    lines: {
                        show: true
                    }
                }
            },
            series: this.data.visitors.series,
            stroke: {
                width: 2
            },
            tooltip: {
                followCursor: true,
                theme: 'dark',
                x: {
                    format: 'MMM dd, yyyy'
                },
                y: {
                    formatter: (value: number): string => `${value}`
                }
            },
            xaxis: {
                axisBorder: {
                    show: false
                },
                axisTicks: {
                    show: false
                },
                crosshairs: {
                    stroke: {
                        color: '#475569',
                        dashArray: 0,
                        width: 2
                    }
                },
                labels: {
                    offsetY: -20,
                    style: {
                        colors: '#CBD5E1'
                    }
                },
                tickAmount: 20,
                tooltip: {
                    enabled: false
                },
                type: 'datetime'
            },
            yaxis: {
                axisTicks: {
                    show: false
                },
                axisBorder: {
                    show: false
                },
                min: (min): number => min - 750,
                max: (max): number => max + 250,
                tickAmount: 5,
                show: false
            }
        };

        // Conversions
        this.chartConversions = {
            chart: {
                animations: {
                    enabled: false
                },
                fontFamily: 'inherit',
                foreColor: 'inherit',
                height: '100%',
                type: 'area',
                sparkline: {
                    enabled: true
                }
            },
            colors: ['#38BDF8'],
            fill: {
                colors: ['#38BDF8'],
                opacity: 0.5
            },
            series: this.data.conversions.series,
            stroke: {
                curve: 'smooth'
            },
            tooltip: {
                followCursor: true,
                theme: 'dark'
            },
            xaxis: {
                type: 'category',
                categories: this.data.conversions.labels
            },
            yaxis: {
                labels: {
                    formatter: (val): string => val.toString()
                }
            }
        };

        // Impressions
        this.chartImpressions = {
            chart: {
                animations: {
                    enabled: false
                },
                fontFamily: 'inherit',
                foreColor: 'inherit',
                height: '100%',
                type: 'area',
                sparkline: {
                    enabled: true
                }
            },
            colors: ['#34D399'],
            fill: {
                colors: ['#34D399'],
                opacity: 0.5
            },
            series: this.data.impressions.series,
            stroke: {
                curve: 'smooth'
            },
            tooltip: {
                followCursor: true,
                theme: 'dark'
            },
            xaxis: {
                type: 'category',
                categories: this.data.impressions.labels
            },
            yaxis: {
                labels: {
                    formatter: (val): string => val.toString()
                }
            }
        };

        // Visits
        this.chartVisits = {
            chart: {
                animations: {
                    enabled: false
                },
                fontFamily: 'inherit',
                foreColor: 'inherit',
                height: '100%',
                type: 'area',
                sparkline: {
                    enabled: true
                }
            },
            colors: ['#FB7185'],
            fill: {
                colors: ['#FB7185'],
                opacity: 0.5
            },
            series: this.data.visits.series,
            stroke: {
                curve: 'smooth'
            },
            tooltip: {
                followCursor: true,
                theme: 'dark'
            },
            xaxis: {
                type: 'category',
                categories: this.data.visits.labels
            },
            yaxis: {
                labels: {
                    formatter: (val): string => val.toString()
                }
            }
        };

        // Visitors vs Page Views
        this.chartVisitorsVsPageViews = {
            chart: {
                animations: {
                    enabled: false
                },
                fontFamily: 'inherit',
                foreColor: 'inherit',
                height: '100%',
                type: 'area',
                toolbar: {
                    show: false
                },
                zoom: {
                    enabled: false
                }
            },
            colors: ['#64748B', '#94A3B8'],
            dataLabels: {
                enabled: false
            },
            fill: {
                colors: ['#64748B', '#94A3B8'],
                opacity: 0.5
            },
            grid: {
                show: false,
                padding: {
                    bottom: -40,
                    left: 0,
                    right: 0
                }
            },
            legend: {
                show: false
            },
            series: this.data.visitorsVsPageViews.series,
            stroke: {
                curve: 'smooth',
                width: 2
            },
            tooltip: {
                followCursor: true,
                theme: 'dark',
                x: {
                    format: 'MMM dd, yyyy'
                }
            },
            xaxis: {
                axisBorder: {
                    show: false
                },
                labels: {
                    offsetY: -20,
                    rotate: 0,
                    style: {
                        colors: 'var(--fuse-text-secondary)'
                    }
                },
                tickAmount: 3,
                tooltip: {
                    enabled: false
                },
                type: 'datetime'
            },
            yaxis: {
                labels: {
                    style: {
                        colors: 'var(--fuse-text-secondary)'
                    }
                },
                max: (max): number => max + 250,
                min: (min): number => min - 250,
                show: false,
                tickAmount: 5
            }
        };

        // New vs. returning
        this.chartNewVsReturning = {
            chart: {
                animations: {
                    speed: 400,
                    animateGradually: {
                        enabled: false
                    }
                },
                fontFamily: 'inherit',
                foreColor: 'inherit',
                height: '100%',
                type: 'donut',
                sparkline: {
                    enabled: true
                }
            },
            colors: ['#3182CE', '#63B3ED'],
            labels: ["Afinidad","Disimilitud"],
            plotOptions: {
                pie: {
                    customScale: 0.9,
                    expandOnClick: false,
                    donut: {
                        size: '70%'
                    }
                }
            },
            series: [Math.round((this.recomendation[1].similarity)*100),Math.round((1-this.recomendation[1].similarity)*100)],
            states: {
                hover: {
                    filter: {
                        type: 'none'
                    }
                },
                active: {
                    filter: {
                        type: 'none'
                    }
                }
            },
            tooltip: {
                enabled: true,
                fillSeriesColor: false,
                theme: 'dark',
                custom: ({
                    seriesIndex,
                    w
                }): string => `<div class="flex items-center h-8 min-h-8 max-h-8 px-3">
                                                     <div class="w-3 h-3 rounded-full" style="background-color: ${w.config.colors[seriesIndex]};"></div>
                                                     <div class="ml-2 text-md leading-none">${w.config.labels[seriesIndex]}:</div>
                                                     <div class="ml-2 text-md font-bold leading-none">${w.config.series[seriesIndex]}%</div>
                                                 </div>`
            }
        };

        // Gender
        this.chartGender = {
            chart: {
                animations: {
                    speed: 400,
                    animateGradually: {
                        enabled: false
                    }
                },
                fontFamily: 'inherit',
                foreColor: 'inherit',
                height: '100%',
                type: 'donut',
                sparkline: {
                    enabled: true
                }
            },
            colors: ['#319795', '#4FD1C5'],
            labels: ["Afinidad","Disimilitud"],
            plotOptions: {
                pie: {
                    customScale: 0.9,
                    expandOnClick: false,
                    donut: {
                        size: '70%'
                    }
                }
            },
            series: [Math.round((this.recomendation[2].similarity)*100),Math.round((1-this.recomendation[2].similarity)*100)],
            states: {
                hover: {
                    filter: {
                        type: 'none'
                    }
                },
                active: {
                    filter: {
                        type: 'none'
                    }
                }
            },
            tooltip: {
                enabled: true,
                fillSeriesColor: false,
                theme: 'dark',
                custom: ({
                    seriesIndex,
                    w
                }): string => `<div class="flex items-center h-8 min-h-8 max-h-8 px-3">
                                                      <div class="w-3 h-3 rounded-full" style="background-color: ${w.config.colors[seriesIndex]};"></div>
                                                      <div class="ml-2 text-md leading-none">${w.config.labels[seriesIndex]}:</div>
                                                      <div class="ml-2 text-md font-bold leading-none">${w.config.series[seriesIndex]}%</div>
                                                  </div>`
            }
        };

        // Age
        this.chartAge = {
            chart: {
                animations: {
                    speed: 400,
                    animateGradually: {
                        enabled: false
                    }
                },
                fontFamily: 'inherit',
                foreColor: 'inherit',
                height: '100%',
                type: 'donut',
                sparkline: {
                    enabled: true
                }
            },
            colors: ['#DD6B20', '#F6AD55'],
            labels: ["Afinidad","Disimilitud"],
            plotOptions: {
                pie: {
                    customScale: 0.9,
                    expandOnClick: false,
                    donut: {
                        size: '70%'
                    }
                }
            },
            series: [Math.round((this.recomendation[3].similarity)*100),Math.round((1-this.recomendation[3].similarity)*100)],
            states: {
                hover: {
                    filter: {
                        type: 'none'
                    }
                },
                active: {
                    filter: {
                        type: 'none'
                    }
                }
            },
            tooltip: {
                enabled: true,
                fillSeriesColor: false,
                theme: 'dark',
                custom: ({
                    seriesIndex,
                    w
                }): string => `<div class="flex items-center h-8 min-h-8 max-h-8 px-3">
                                                     <div class="w-3 h-3 rounded-full" style="background-color: ${w.config.colors[seriesIndex]};"></div>
                                                     <div class="ml-2 text-md leading-none">${w.config.labels[seriesIndex]}:</div>
                                                     <div class="ml-2 text-md font-bold leading-none">${w.config.series[seriesIndex]}%</div>
                                                 </div>`
            }
        };

        // Language
        this.chartLanguage = {
            chart: {
                animations: {
                    speed: 400,
                    animateGradually: {
                        enabled: false
                    }
                },
                fontFamily: 'inherit',
                foreColor: 'inherit',
                height: '100%',
                type: 'donut',
                sparkline: {
                    enabled: true
                }
            },
            colors: ['#805AD5', '#B794F4'],
            labels: ["Afinidad","Disimilitud"],
            plotOptions: {
                pie: {
                    customScale: 0.9,
                    expandOnClick: false,
                    donut: {
                        size: '70%'
                    }
                }
            },
            series: [Math.round((this.recomendation[4].similarity)*100),Math.round((1-this.recomendation[4].similarity)*100)],
            states: {
                hover: {
                    filter: {
                        type: 'none'
                    }
                },
                active: {
                    filter: {
                        type: 'none'
                    }
                }
            },
            tooltip: {
                enabled: true,
                fillSeriesColor: false,
                theme: 'dark',
                custom: ({
                    seriesIndex,
                    w
                }): string => `<div class="flex items-center h-8 min-h-8 max-h-8 px-3">
                                                     <div class="w-3 h-3 rounded-full" style="background-color: ${w.config.colors[seriesIndex]};"></div>
                                                     <div class="ml-2 text-md leading-none">${w.config.labels[seriesIndex]}:</div>
                                                     <div class="ml-2 text-md font-bold leading-none">${w.config.series[seriesIndex]}%</div>
                                                 </div>`
            }
        };
    }
    private _fixSvgFill(element: Element): void {
        // Current URL
        const currentURL = this._router.url;

        // 1. Find all elements with 'fill' attribute within the element
        // 2. Filter out the ones that doesn't have cross reference so we only left with the ones that use the 'url(#id)' syntax
        // 3. Insert the 'currentURL' at the front of the 'fill' attribute value
        Array.from(element.querySelectorAll('*[fill]'))
            .filter(el => el.getAttribute('fill').indexOf('url(') !== -1)
            .forEach((el) => {
                const attrVal = el.getAttribute('fill');
                el.setAttribute('fill', `url(${currentURL}${attrVal.slice(attrVal.indexOf('#'))}`);
            });
    }

    showAnalytics(show: boolean) {
        
        this.showAnalaytics = show;
    }

}
