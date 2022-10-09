import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Inject, OnDestroy, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormControl } from '@angular/forms';
import { MatDrawer } from '@angular/material/sidenav';
import { filter, fromEvent, Observable, Subject, switchMap, takeUntil } from 'rxjs';
import { FuseMediaWatcherService } from '@fuse/services/media-watcher';
import { Contact, Country, ContactExport } from 'app/modules/admin/apps/contacts/contacts.types';
import { ContactsService } from 'app/modules/admin/apps/contacts/contacts.service';
import * as XLSX from 'xlsx';
import { UserService } from 'app/core/user/user.service';
import { User } from 'app/core/user/user.types';


@Component({
    selector: 'contacts-list',
    templateUrl: './list.component.html',
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ContactsListComponent implements OnInit, OnDestroy {
    @ViewChild('matDrawer', { static: true }) matDrawer: MatDrawer;

    contacts$: Observable<Contact[]>;
    contactsExport$;

    contactsCount: number = 0;
    contactsTableColumns: string[] = ['name', 'email', 'phoneNumber', 'job'];
    filterValues: string[] = ['TODOS', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'Ñ', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'];
    countries: Country[];
    drawerMode: 'side' | 'over';
    searchInputControl: FormControl = new FormControl();
    selectedContact: Contact;
    private _unsubscribeAll: Subject<any> = new Subject<any>();
    showExport = false

    /**
     * Constructor
     */
    constructor(
        private _activatedRoute: ActivatedRoute,
        private _changeDetectorRef: ChangeDetectorRef,
        private _contactsService: ContactsService,
        @Inject(DOCUMENT) private _document: any,
        private _router: Router,
        private _fuseMediaWatcherService: FuseMediaWatcherService,
        private _userService: UserService
    ) {
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    export() {


        console.log(this.contactsExport$);


        const workBook = XLSX.utils.book_new(); // create a new blank book
        let correos = []
        let telefonos = []
        let relativos = []
        // Get contacts to export

        this._contactsService.getContactsExport().subscribe(resp => {
            console.log(resp.body);
            this.contactsExport$ = resp.body;
            this.contactsExport$.map((dat) => {


                dat.correos.forEach((x) => {

                    x.cedula = dat.cedula
                    correos.push(x)
                })
                dat.celulares.forEach((x) => {
                    x.cedula = dat.cedula
                    telefonos.push(x)
                })
                dat.relative.forEach((x) => {
                    x.cedula = dat.cedula
                    delete x['cod_pariente'];
                    if (x.nom_pariente.length != 0) {
                        relativos.push(x)
                    }
                })
                delete dat['correos'];
                delete dat['celulares'];
                delete dat['relative'];
            });

            const workSheet2 = XLSX.utils.json_to_sheet(correos);
            const workSheet3 = XLSX.utils.json_to_sheet(telefonos);
            const workSheet4 = XLSX.utils.json_to_sheet(relativos);
            const workSheet = XLSX.utils.json_to_sheet(this.contactsExport$);

            XLSX.utils.book_append_sheet(workBook, workSheet, 'Clientes'); // add the worksheet to the book
            XLSX.utils.book_append_sheet(workBook, workSheet2, 'Correos'); // add the worksheet to the book
            XLSX.utils.book_append_sheet(workBook, workSheet3, 'Telefonos'); // add the worksheet to the book
            XLSX.utils.book_append_sheet(workBook, workSheet4, 'Parientes'); // add the worksheet to the book
            XLSX.writeFile(workBook, 'clientes.xlsx'); // initiate a file download in browser
        })


    }

    /**
     * On init
     */
    ngOnInit(): void {

        this._userService.user$
            .pipe((takeUntil(this._unsubscribeAll)))
            .subscribe((user: User) => {


                if (user.tipo_usuario == null || user.tipo_usuario == 1) {
                    this.showExport = true
                }

            });





        // Get the contacts
        this.contacts$ = this._contactsService.contacts$;
        this._contactsService.contacts$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((contacts: Contact[]) => {
                console.log(contacts);


                // Update the counts
                this.contactsCount = contacts.length;

                // Mark for check
                this._changeDetectorRef.markForCheck();
            });



        // Get the contact
        this._contactsService.contact$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((contact: Contact) => {

                // Update the selected contact
                this.selectedContact = contact;

                // Mark for check
                this._changeDetectorRef.markForCheck();
            });

        // Get the countries
        this._contactsService.countries$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((countries: Country[]) => {

                // Update the countries
                this.countries = countries;

                // Mark for check
                this._changeDetectorRef.markForCheck();
            });

        // Subscribe to search input field value changes
        this.searchInputControl.valueChanges
            .pipe(
                takeUntil(this._unsubscribeAll),
                switchMap(query =>

                    // Search
                    this._contactsService.searchContacts(query)
                )
            )
            .subscribe();

        // Subscribe to MatDrawer opened change
        this.matDrawer.openedChange.subscribe((opened) => {
            if (!opened) {
                // Remove the selected contact when drawer closed
                this.selectedContact = null;

                // Mark for check
                this._changeDetectorRef.markForCheck();
            }
        });

        // Subscribe to media changes
        this._fuseMediaWatcherService.onMediaChange$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe(({ matchingAliases }) => {

                // Set the drawerMode if the given breakpoint is active
                if (matchingAliases.includes('lg')) {
                    this.drawerMode = 'side';
                }
                else {
                    this.drawerMode = 'over';
                }

                // Mark for check
                this._changeDetectorRef.markForCheck();
            });

        // Listen for shortcuts
        fromEvent(this._document, 'keydown')
            .pipe(
                takeUntil(this._unsubscribeAll),
                filter<KeyboardEvent>(event =>
                    (event.ctrlKey === true || event.metaKey) // Ctrl or Cmd
                    && (event.key === '/') // '/'
                )
            )
            .subscribe(() => {
                this.createContact();
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
     * On backdrop clicked
     */
    onBackdropClicked(): void {
        // Go back to the list
        this._router.navigate(['./'], { relativeTo: this._activatedRoute });

        // Mark for check
        this._changeDetectorRef.markForCheck();
    }

    filterByLetter(letter: string) {
        if (letter == "TODOS") {
            this._contactsService.filterContacts('')
        } else {
            this._contactsService.filterContacts(letter)
        }


    }

    /**
     * Create contact
     */
    createContact(): void {
        // Create the contact
        this._contactsService.createContact().subscribe((newContact) => {
            console.log('Cliente creado con' + newContact.body.cod_cliente);

            // Go to the new contact
            this._router.navigate(['./', newContact.body.cod_cliente], { relativeTo: this._activatedRoute });

            // Mark for check
            this._changeDetectorRef.markForCheck();
        });
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
