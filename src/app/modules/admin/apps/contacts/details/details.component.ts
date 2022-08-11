import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, OnDestroy, OnInit, Renderer2, TemplateRef, ViewChild, ViewContainerRef, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TemplatePortal } from '@angular/cdk/portal';
import { Overlay, OverlayRef } from '@angular/cdk/overlay';
import { MatDrawerToggleResult } from '@angular/material/sidenav';
import { debounceTime, Subject, takeUntil } from 'rxjs';
import { FuseConfirmationService } from '@fuse/services/confirmation';
import { Contact, ContactRelative, Country, Tag } from 'app/modules/admin/apps/contacts/contacts.types';
import { ContactsListComponent } from 'app/modules/admin/apps/contacts/list/list.component';
import { ContactsService } from 'app/modules/admin/apps/contacts/contacts.service';


@Component({
    selector       : 'contacts-details',
    templateUrl    : './details.component.html',
    encapsulation  : ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ContactsDetailsComponent implements OnInit, OnDestroy
{
    @ViewChild('avatarFileInput') private _avatarFileInput: ElementRef;
    @ViewChild('tagsPanel') private _tagsPanel: TemplateRef<any>;
    @ViewChild('tagsPanelOrigin') private _tagsPanelOrigin: ElementRef;

    editMode: boolean = false;
    tags: Tag[];
    tagsEditMode: boolean = false;
    filteredTags: Tag[];
    contact: Contact;    
    contactForm: FormGroup;
    contacts: Contact[];
    countries: Country[];

    //Relavites variables
    contactRelativeA: ContactRelative[];
    contactRelative1: ContactRelative;
    contactRelative2: ContactRelative;
    contactRelative3: ContactRelative;
    relativeNull = true;
    showrelatives = false;
    relativesForm: FormGroup;
    showFormRel = false;

    private _tagsPanelOverlayRef: OverlayRef;
    private _unsubscribeAll: Subject<any> = new Subject<any>();

    /**
     * Constructor
     */
    constructor(
        private _activatedRoute: ActivatedRoute,
        private _changeDetectorRef: ChangeDetectorRef,
        private _contactsListComponent: ContactsListComponent,
        private _contactsService: ContactsService,
        private _formBuilder: FormBuilder,
        private _fuseConfirmationService: FuseConfirmationService,
        private _renderer2: Renderer2,
        private _router: Router,
        private _overlay: Overlay,
        private _viewContainerRef: ViewContainerRef
    )
    {
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    /**
     * On init
     */
    ngOnInit(): void
    {


        // Open the drawer
        this._contactsListComponent.matDrawer.open();

        // Create the contact form
        this.contactForm = this._formBuilder.group({
            cod_cliente          : [''],
            avatar      : [null],
            nom_cliente        : ['', [Validators.required]],
            apellido_cliente        : [''],
            cedula        : [''],
            correos      : this._formBuilder.array([]),
            celulares: this._formBuilder.array([]),
            ocupacion       : [''],
            company     : [''],
            birth_date    : [null],
            direccion     : [null],
            notes       : [null],
            tags        : [[]],

          

    
        });

        this.relativesForm = this._formBuilder.group({
            cod_pariente1        : [''],
            cod_cliente1         : [''],            
            nom_pariente1        : [''],
            apellido_pariente1   : [''],
            telefono_pariente1   : [''],
            cod_pariente2        : [''],
            cod_cliente2         : [''],            
            nom_pariente2        : [''],
            apellido_pariente2   : [''],
            telefono_pariente2   : [''],
            cod_pariente3        : [''],
            cod_cliente3         : [''],            
            nom_pariente3        : [''],
            apellido_pariente3   : [''],
            telefono_pariente3   : ['']

        });


        // Get the contacts
        this._contactsService.contacts$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((contacts: Contact[]) => {
                this.contacts = contacts;

                // Mark for check
                this._changeDetectorRef.markForCheck();
            });

          
            
        

        // Get the contact
        this._contactsService.contact$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((contact: Contact) => {
                //console.log('cliente selec '+contact.nom_cliente);
                console.log('here ->> '+contact.cedula);
                
                // Open the drawer in case it is closed
                this._contactsListComponent.matDrawer.open();

                // Get the contact
                this.contact = contact;

                // Clear the correos and phoneNumbers form arrays
                (this.contactForm.get('correos') as FormArray).clear();
                (this.contactForm.get('celulares') as FormArray).clear();

                // Patch values to the form
                this.contactForm.patchValue(contact);

                // Setup the correos form array
                const emailFormGroups = [];

                if ( contact.correos.length > 0 )
                {
                    // Iterate through them
                    contact.correos.forEach((email) => {

                        // Create an email form group
                        emailFormGroups.push(
                            this._formBuilder.group({
                                email: [email.email],
                                label: [email.label]
                            })
                        );
                    });
                }
                else
                {
                    // Create an email form group
                    emailFormGroups.push(
                        this._formBuilder.group({
                            email: [''],
                            label: ['']
                        })
                    );
                }

                // Add the email form groups to the correos form array
                emailFormGroups.forEach((emailFormGroup) => {
                    (this.contactForm.get('correos') as FormArray).push(emailFormGroup);
                });

                // Setup the phone numbers form array
                const phoneNumbersFormGroups = [];

                if ( contact.celulares.length > 0 )
                {
                    // Iterate through them
                    contact.celulares.forEach((phoneNumber) => {
                        console.log(phoneNumber);
                        
                        // Create an email form group
                        phoneNumbersFormGroups.push(
                            this._formBuilder.group({
                                country    : [phoneNumber.country],
                                numero: [phoneNumber.numero],
                                label      : [phoneNumber.label]
                            })
                        );
                    });
                }
                else
                {
                    // Create a phone number form group
                    phoneNumbersFormGroups.push(
                        this._formBuilder.group({
                            country    : ['co'],
                            numero: [''],
                            label      : ['']
                        })
                    );
                }

                // Add the phone numbers form groups to the phone numbers form array
                phoneNumbersFormGroups.forEach((phoneNumbersFormGroup) => {
                    (this.contactForm.get('celulares') as FormArray).push(phoneNumbersFormGroup);
                });

                // Toggle the edit mode off
                this.toggleEditMode(false);

                // Mark for check
                this._changeDetectorRef.markForCheck();
            });

       
       
            //get relatives
               
            this._contactsService.getRelatives(this.contact.cod_cliente).subscribe(resp =>{
    
                this.contactRelativeA = resp.body;

                //Cambiar Valores de formulario
                
                // valor pariente 1
                if(resp.body[0]!=null){
                    this.contactRelative1 = resp.body[0]; 
                    this.relativesForm.get('cod_pariente1').patchValue(this.contactRelative1.cod_pariente);
                    this.relativesForm.get('nom_pariente1').patchValue(this.contactRelative1.nom_pariente);
                    this.relativesForm.get('apellido_pariente1').patchValue(this.contactRelative1.apellido_pariente);
                    this.relativesForm.get('telefono_pariente1').patchValue(this.contactRelative1.telefono_pariente);
                    if(resp.body[1]!=null){
                        // valor pariente 2
                        this.contactRelative2 = resp.body[1];  
                        this.relativesForm.get('cod_pariente2').patchValue(this.contactRelative2.cod_pariente);
                        this.relativesForm.get('nom_pariente2').patchValue(this.contactRelative2.nom_pariente);
                        this.relativesForm.get('apellido_pariente2').patchValue(this.contactRelative2.apellido_pariente);
                        this.relativesForm.get('telefono_pariente2').patchValue(this.contactRelative2.telefono_pariente);
                        if(resp.body[2]!=null){
                            // valor pariente 3
                            this.contactRelative3 = resp.body[2];  
                            this.relativesForm.get('cod_pariente3').patchValue(this.contactRelative3.cod_pariente);
                            this.relativesForm.get('nom_pariente3').patchValue(this.contactRelative3.nom_pariente);
                            this.relativesForm.get('apellido_pariente3').patchValue(this.contactRelative3.apellido_pariente);
                            this.relativesForm.get('telefono_pariente3').patchValue(this.contactRelative3.telefono_pariente);
                        }
                    }
                }
                
                
                this.relativeNull = false;
            })
            
        



        // Get the country telephone codes
        this._contactsService.countries$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((codes: Country[]) => {
                this.countries = codes;

                // Mark for check
                this._changeDetectorRef.markForCheck();
            });

        // Get the tags
        this._contactsService.tags$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((tags: Tag[]) => {
                this.tags = tags;
                this.filteredTags = tags;

                // Mark for check
                this._changeDetectorRef.markForCheck();
            });
    }

    /**
     * On destroy
     */
    ngOnDestroy(): void
    {
        // Unsubscribe from all subscriptions
        this._unsubscribeAll.next(null);
        this._unsubscribeAll.complete();

        // Dispose the overlays if they are still on the DOM
        if ( this._tagsPanelOverlayRef )
        {
            this._tagsPanelOverlayRef.dispose();
        }
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Close the drawer
     */
    closeDrawer(): Promise<MatDrawerToggleResult>
    {
        return this._contactsListComponent.matDrawer.close();
    }

    /**
     * Toggle edit mode
     *
     * @param editMode
     */
    toggleEditMode(editMode: boolean | null = null): void
    {
        if ( editMode === null )
        {
            this.editMode = !this.editMode;
        }
        else
        {
            this.editMode = editMode;
        }

        // Mark for check
        this._changeDetectorRef.markForCheck();
    }

    getRelatives():void{
        this._contactsService.getRelatives(this.contact.cod_cliente).subscribe(resp =>{
    
            this.contactRelativeA = resp.body;
            this.relativeNull = false;
        })
    }

    /**
     * Update the contact
     */
    updateContact(): void
    {

        // get values relatives form
        const relativeAux = this.relativesForm.getRawValue();   
        relativeAux.cod_pariente1 = this.contactRelative1.cod_pariente
        relativeAux.cod_pariente2 = this.contactRelative2.cod_pariente
        relativeAux.cod_pariente3 = this.contactRelative3.cod_pariente
        //console.log("------------------->"+relativeAux.telefono_pariente3);

        this._contactsService.updateRelatives(relativeAux).subscribe(() => {

            // Toggle the edit mode off
            this.toggleEditMode(false);
        });

         this.getRelatives();

        // Get the contact object
        const contact = this.contactForm.getRawValue();
        
        
        // Go through the contact object and clear empty values
        contact.correos = contact.correos.filter(email => email.email);

        contact.celulares = contact.celulares.filter(celulares => celulares.numero);
        

        

        // Update the contact on the server
        this._contactsService.updateContact(contact.cod_cliente, contact).subscribe(() => {

            

            // Toggle the edit mode off
            this.toggleEditMode(false);
        });

        
    }

    mostrarParientes(){
        if(this.showrelatives==false)
            this.showrelatives=true;
        else
            this.showrelatives=false;                
    }

    mostrarFormParientes(){
        if(this.showFormRel==false)
            this.showFormRel=true;
        else
            this.showFormRel=false;                
    }

    /**
     * Delete the contact
     */
    deleteContact(): void
    {
        // Open the confirmation dialog
        const confirmation = this._fuseConfirmationService.open({
            title  : 'Borrar contacto',
            message: '¿Está seguro de que desea eliminar este contacto? ¡Esta acción no se puede deshacer!',
            actions: {
                confirm: {
                    label: 'Eliminar'
                }
            }
        });

        // Subscribe to the confirmation dialog closed action
        confirmation.afterClosed().subscribe((result) => {

            // If the confirm button pressed...
            if ( result === 'confirmed' )
            {
                
                // Get the current contact's id
                const id = this.contact.cod_cliente;

                // Get the next/previous contact's id
                const currentContactIndex = this.contacts.findIndex(item => item.cod_cliente === id);
                const nextContactIndex = currentContactIndex + ((currentContactIndex === (this.contacts.length - 1)) ? -1 : 1);
                const nextContactId = (this.contacts.length === 1 && this.contacts[0].cod_cliente === id) ? null : this.contacts[nextContactIndex].cod_cliente;

                // Delete the contact
                this._contactsService.deleteContact(id)
                    .subscribe((isDeleted) => {

                        // Return if the contact wasn't deleted...
                        if ( !isDeleted )
                        {
                            return;
                        }

                        // Navigate to the next contact if available
                        // if ( nextContactId )
                        // {
                        //     this._router.navigate(['../', nextContactId], {relativeTo: this._activatedRoute});
                        // }
                        // Otherwise, navigate to the parent
                        else
                        {
                            this._router.navigate(['../'], {relativeTo: this._activatedRoute});
                        }

                        // Toggle the edit mode off
                        this.toggleEditMode(false);
                    });

                // Mark for check
                this._changeDetectorRef.markForCheck();
            }
        });

    }

    /**
     * Upload avatar
     *
     * @param fileList
     */
    uploadAvatar(fileList: FileList): void
    {
        // Return if canceled
        if ( !fileList.length )
        {
            return;
        }

        const allowedTypes = ['image/jpeg', 'image/png'];
        const file = fileList[0];

        // Return if the file is not allowed
        if ( !allowedTypes.includes(file.type) )
        {
            return;
        }

        // Upload the avatar
        this._contactsService.uploadAvatar(this.contact.cod_cliente, file).subscribe();
    }

    /**
     * Remove the avatar
     */
    removeAvatar(): void
    {
        // Get the form control for 'avatar'
        const avatarFormControl = this.contactForm.get('avatar');

        // Set the avatar as null
        avatarFormControl.setValue(null);

        // Set the file input value as null
        this._avatarFileInput.nativeElement.value = null;

        // Update the contact
        this.contact.avatar = null;
    }

    /**
     * Open tags panel
     */
    openTagsPanel(): void
    {
        // Create the overlay
        this._tagsPanelOverlayRef = this._overlay.create({
            backdropClass   : '',
            hasBackdrop     : true,
            scrollStrategy  : this._overlay.scrollStrategies.block(),
            positionStrategy: this._overlay.position()
                                  .flexibleConnectedTo(this._tagsPanelOrigin.nativeElement)
                                  .withFlexibleDimensions(true)
                                  .withViewportMargin(64)
                                  .withLockedPosition(true)
                                  .withPositions([
                                      {
                                          originX : 'start',
                                          originY : 'bottom',
                                          overlayX: 'start',
                                          overlayY: 'top'
                                      }
                                  ])
        });

        // Subscribe to the attachments observable
        this._tagsPanelOverlayRef.attachments().subscribe(() => {

            // Add a class to the origin
            this._renderer2.addClass(this._tagsPanelOrigin.nativeElement, 'panel-opened');

            // Focus to the search input once the overlay has been attached
            this._tagsPanelOverlayRef.overlayElement.querySelector('input').focus();
        });

        // Create a portal from the template
        const templatePortal = new TemplatePortal(this._tagsPanel, this._viewContainerRef);

        // Attach the portal to the overlay
        this._tagsPanelOverlayRef.attach(templatePortal);

        // Subscribe to the backdrop click
        this._tagsPanelOverlayRef.backdropClick().subscribe(() => {

            // Remove the class from the origin
            this._renderer2.removeClass(this._tagsPanelOrigin.nativeElement, 'panel-opened');

            // If overlay exists and attached...
            if ( this._tagsPanelOverlayRef && this._tagsPanelOverlayRef.hasAttached() )
            {
                // Detach it
                this._tagsPanelOverlayRef.detach();

                // Reset the tag filter
                this.filteredTags = this.tags;

                // Toggle the edit mode off
                this.tagsEditMode = false;
            }

            // If template portal exists and attached...
            if ( templatePortal && templatePortal.isAttached )
            {
                // Detach it
                templatePortal.detach();
            }
        });
    }

    /**
     * Toggle the tags edit mode
     */
    toggleTagsEditMode(): void
    {
        this.tagsEditMode = !this.tagsEditMode;
    }

    /**
     * Filter tags
     *
     * @param event
     */
    filterTags(event): void
    {
        // Get the value
        const value = event.target.value.toLowerCase();

        // Filter the tags
        this.filteredTags = this.tags.filter(tag => tag.title.toLowerCase().includes(value));
    }

    /**
     * Filter tags input key down event
     *
     * @param event
     */
    filterTagsInputKeyDown(event): void
    {
        // Return if the pressed key is not 'Enter'
        if ( event.key !== 'Enter' )
        {
            return;
        }

        // If there is no tag available...
        if ( this.filteredTags.length === 0 )
        {
            // Create the tag
            this.createTag(event.target.value);

            // Clear the input
            event.target.value = '';

            // ReturntactFor
            return;
        }

        // If there is a tag...
        const tag = this.filteredTags[0];
        const isTagApplied = this.contact.tags.find(id => id === tag.id);

        // If the found tag is already applied to the contact...
        if ( isTagApplied )
        {
            // Remove the tag from the contact
            this.removeTagFromContact(tag);
        }
        else
        {
            // Otherwise add the tag to the contact
            this.addTagToContact(tag);
        }
    }

    /**
     * Create a new tag
     *
     * @param title
     */
    createTag(title: string): void
    {
        const tag = {
            title
        };

        // Create tag on the server
        this._contactsService.createTag(tag)
            .subscribe((response) => {

                // Add the tag to the contact
                this.addTagToContact(response);
            });
    }

    /**
     * Update the tag title
     *
     * @param tag
     * @param event
     */
    updateTagTitle(tag: Tag, event): void
    {
        // Update the title on the tag
        tag.title = event.target.value;

        // Update the tag on the server
        this._contactsService.updateTag(tag.id, tag)
            .pipe(debounceTime(300))
            .subscribe();

        // Mark for check
        this._changeDetectorRef.markForCheck();
    }

    /**
     * Delete the tag
     *
     * @param tag
     */
    deleteTag(tag: Tag): void
    {
        // Delete the tag from the server
        this._contactsService.deleteTag(tag.id).subscribe();

        // Mark for check
        this._changeDetectorRef.markForCheck();
    }

    /**
     * Add tag to the contact
     *
     * @param tag
     */
    addTagToContact(tag: Tag): void
    {
        // Add the tag
        this.contact.tags.unshift(tag.id);

        // Update the contact form
        this.contactForm.get('tags').patchValue(this.contact.tags);

        // Mark for check
        this._changeDetectorRef.markForCheck();
    }

    /**
     * Remove tag from the contact
     *
     * @param tag
     */
    removeTagFromContact(tag: Tag): void
    {
        // Remove the tag
        this.contact.tags.splice(this.contact.tags.findIndex(item => item === tag.id), 1);

        // Update the contact form
        this.contactForm.get('tags').patchValue(this.contact.tags);

        // Mark for check
        this._changeDetectorRef.markForCheck();
    }

    /**
     * Toggle contact tag
     *
     * @param tag
     */
    toggleContactTag(tag: Tag): void
    {
        if ( this.contact.tags.includes(tag.id) )
        {
            this.removeTagFromContact(tag);
        }
        else
        {
            this.addTagToContact(tag);
        }
    }

    /**
     * Should the create tag button be visible
     *
     * @param inputValue
     */
    shouldShowCreateTagButton(inputValue: string): boolean
    {
        return !!!(inputValue === '' || this.tags.findIndex(tag => tag.title.toLowerCase() === inputValue.toLowerCase()) > -1);
    }

    /**
     * Add the email field
     */
    addEmailField(): void
    {
        // Create an empty email form group
        const emailFormGroup = this._formBuilder.group({
            email: [''],
            label: ['']
        });

        // Add the email form group to the correos form array
        (this.contactForm.get('correos') as FormArray).push(emailFormGroup);

        // Mark for check
        this._changeDetectorRef.markForCheck();
    }

    /**
     * Remove the email field
     *
     * @param index
     */
    removeEmailField(index: number): void
    {
        // Get form array for correos
        const correosFormArray = this.contactForm.get('correos') as FormArray;

        // Remove the email field
        correosFormArray.removeAt(index);

        // Mark for check
        this._changeDetectorRef.markForCheck();
    }

    /**
     * Add an empty phone number field
     */
    addPhoneNumberField(): void
    {
        // Create an empty phone number form group
        const phoneNumberFormGroup = this._formBuilder.group({
            country    : ['co'],
            numero: [''],
            label      : ['']
        });

        // Add the phone number form group to the phoneNumbers form array
        (this.contactForm.get('celulares') as FormArray).push(phoneNumberFormGroup);

        // Mark for check
        this._changeDetectorRef.markForCheck();
    }

    /**
     * Remove the phone number field
     *
     * @param index
     */
    removePhoneNumberField(index: number): void
    {
        // Get form array for phone numbers
        const phoneNumbersFormArray = this.contactForm.get('celulares') as FormArray;

        // Remove the phone number field
        phoneNumbersFormArray.removeAt(index);

        // Mark for check
        this._changeDetectorRef.markForCheck();
    }

    /**
     * Get country info by iso code
     *
     * @param iso
     */
    getCountryByIso(): Country
    {
        return this.countries.find(country => country.iso === 'co');
    }

    /**
     * Track by function for ngFor loops
     *
     * @param index
     * @param item
     */
    trackByFn(index: number, item: any): any
    {
        return item.id || index;
    }
}
