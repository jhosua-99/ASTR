import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, filter, map, Observable, of, switchMap, take, tap, throwError } from 'rxjs';
import { Contact, ContactExport, Country, Tag } from 'app/modules/admin/apps/contacts/contacts.types';
import { UserResponseModel } from 'app/core/user/user.response.model';
import { assign, cloneDeep } from 'lodash-es';
import { environment } from '../../../../../environments/environment';
@Injectable({
    providedIn: 'root'
})
export class ContactsService
{
    // Private
    private _contact: BehaviorSubject<Contact | null> = new BehaviorSubject(null);
    private _contacts: BehaviorSubject<Contact[] | null> = new BehaviorSubject(null);
    private _contactsExport: BehaviorSubject<ContactExport[] | null> = new BehaviorSubject(null);
    private _contactsList: any[] = [];
    private _contactsListExport: any[] = [];
    private _countries: BehaviorSubject<Country[] | null> = new BehaviorSubject(null);
    private _tags: BehaviorSubject<Tag[] | null> = new BehaviorSubject(null);

    /**
     * Constructor
     */
    constructor(private _httpClient: HttpClient)
    {
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Accessors
    // -----------------------------------------------------------------------------------------------------

    /**
     * Getter for contact
     */
    get contact$(): Observable<Contact>
    {
        return this._contact.asObservable();
    }

    get contactsExport$(): Observable<ContactExport[]>
    {
        return this._contactsExport.asObservable();
    }

    /**
     * Getter for contacts
     */
    get contacts$(): Observable<Contact[]>
    {
        return this._contacts.asObservable();
    }

    /**
     * Getter for countries
     */
    get countries$(): Observable<Country[]>
    {
        return this._countries.asObservable();
    }

    /**
     * Getter for tags
     */
    get tags$(): Observable<Tag[]>
    {
        return this._tags.asObservable();
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Get contacts
     */

     getContactsExport(): Observable<UserResponseModel>
     {
      
        
        
        return this._httpClient.get<UserResponseModel>(`${environment.APIEndpoint}`+'api/exports')
     }

    getContacts(): Observable<UserResponseModel>
    {
        console.log("holaaa2");
        
        var token = localStorage.getItem('accessToken');
        var header = new HttpHeaders({
            'Authorization': 'Bearer ' + token
        });
        var options = ({
            headers: header
        });
        return this._httpClient.get<UserResponseModel>(`${environment.APIEndpoint}`+'api/client/',options).pipe(
            tap((contacts) => {
                this._contactsList = contacts.body;
                
                
                this._contacts.next(contacts.body);
            })
        );
    }

    /**
     * Search contacts with given query
     *
     * @param query
     */
    searchContacts(query: string): Observable<Contact[]>
    {
        console.log(query);
        
        let contacts = cloneDeep(this._contactsList);
        // If the query exists...
        if ( query )
        {
            // Filter the contacts
            contacts = contacts.filter(contact => contact.nom_cliente && contact.nom_cliente.toLowerCase().includes(query.toLowerCase()));
        }

        // Sort the contacts by the name field by default
        contacts.sort((a, b) => a.nom_cliente.localeCompare(b.nom_cliente));
        console.log(contacts.length)

        
        this._contacts.next(contacts);
        
        return this._contacts;
    }

    /**
     * Search contacts with given query
     *
     * @param query
     */
     filterContacts(query: string): Observable<Contact[]>
     {
         console.log(query);
         
         let contacts = cloneDeep(this._contactsList);
         // If the query exists...
         if ( query )
         {
             // Filter the contacts
             contacts = contacts.filter(contact => contact.nom_cliente && contact.nom_cliente.toLowerCase().startsWith(query.toLowerCase()));
         }
 
         // Sort the contacts by the name field by default
         contacts.sort((a, b) => a.nom_cliente.localeCompare(b.nom_cliente));
         console.log(contacts.length)
 
         
         this._contacts.next(contacts);
         
         return this._contacts;
     }

    /**
     * Get contact by id
     */
    getContactById(id: string): Observable<UserResponseModel>
    {
        return this._httpClient.get<UserResponseModel>(`${environment.APIEndpoint}`+'api/client/'+id).pipe(
            tap((contact) => {
                console.log('here -> '+contact.body)
               // Update the contact
               this._contact.next(contact.body);
            })
        );
        /*
        return this._contacts.pipe(
            take(1),
            map((contacts) => {

                // Find the contact
                const contact = contacts.find(item => item.cedula === id) || null;
                
                // Update the contact
                this._contact.next(contact);

                // Return the contact
                return contact;
            }),
            switchMap((contact) => {

                if ( !contact )
                {
                    return throwError('Could not found contact with id of ' + id + '!');
                }

                return of(contact);
            })
        );
        */
    }

    /**
     * Create contact
     */
    createContact(): Observable<UserResponseModel>
    {
        return this.contacts$.pipe(
            take(1),
            switchMap(contacts => this._httpClient.post<UserResponseModel>(`${environment.APIEndpoint}`+'api/client/', {}).pipe(
                map((newContact) => {

                    // Update the contacts with the new contact
                    this._contacts.next([newContact.body, ...contacts]);

                    // Return the new contact
                    return newContact;
                })
            ))
        );
    }

    /**
     * Update contact
     *
     * @param id
     * @param contact
     */
    updateContact(id: number, contact: any): Observable<Contact>
    {
        console.log('holass'+id);
        
        return this.contacts$.pipe(
            take(1),
            switchMap(contacts => this._httpClient.patch<UserResponseModel>(`${environment.APIEndpoint}`+'api/client', {
                id,
                contact
            }).pipe(
                map((updatedContact) => {
                    console.log(updatedContact.body.nom_cliente+"<--");
                    
                    // Find the index of the updated contact
                    const index = contacts.findIndex(item => item.cod_cliente === id);

                    // Update the contact
                    let contactEdited : Contact = {
                        "cod_cliente" :  id,
                        "cedula" :  updatedContact.body.cedula,
                        "nom_cliente" :  updatedContact.body.nom_cliente,
                        "apellido_cliente" : updatedContact.body.apellido_cliente,
                        "correos" :  updatedContact.body.correos,
                        "celulares" :  updatedContact.body.celulares,
                        "ocupacion" :  updatedContact.body.ocupacion,
                    }
                    console.log(index+'<- index');
                    console.log(updatedContact.body.celulares+'<- sindex');
                    
                    contacts[index] = contactEdited;

                    // Update the contacts
                    this._contacts.next(contacts);

                    // Return the updated contact
                    return contact;
                }),
                switchMap(updatedContact => this.contact$.pipe(
                    take(1),
                    filter(item => item && item.cod_cliente === id),
                    tap(() => {
                        console.log(JSON.stringify(updatedContact)+'<- edited');

                        // Update the contact if it's selected
                        

                        this._contact.next(updatedContact);

                        // Return the updated contact
                        return contact;
                    })
                ))
            ))
        );
    }

    /**
     * Delete the contact
     *
     * @param id
     */
    deleteContact(id: number): Observable<UserResponseModel>
    {
        return this.contacts$.pipe(
            take(1),
            switchMap(contacts => this._httpClient.delete(`${environment.APIEndpoint}`+'api/client', {params: {id}}).pipe(
                map((result: UserResponseModel) => {

                    // Find the index of the deleted contact
                    const index = contacts.findIndex(item => item.cod_cliente === id);

                    // Delete the contact
                    contacts.splice(index, 1);

                    // Update the contacts
                    this._contacts.next(contacts);

                    // Return the deleted status
                    return result.body.isDeleted;
                })
            ))
        );
    }

    /**
     * Get countries
     */
    getCountries(): Observable<Country[]>
    {
        return this._httpClient.get<Country[]>('api/apps/contacts/countries').pipe(
            tap((countries) => {
                this._countries.next(countries);
            })
        );
    }

    /**
     * Get tags
     */
    getTags(): Observable<Tag[]>
    {
        return this._httpClient.get<Tag[]>('api/apps/contacts/tags').pipe(
            tap((tags) => {
                this._tags.next(tags);
            })
        );
    }

    /**
     * Create tag
     *
     * @param tag
     */
    createTag(tag: Tag): Observable<Tag>
    {
        return this.tags$.pipe(
            take(1),
            switchMap(tags => this._httpClient.post<Tag>('api/apps/contacts/tag', {tag}).pipe(
                map((newTag) => {

                    // Update the tags with the new tag
                    this._tags.next([...tags, newTag]);

                    // Return new tag from observable
                    return newTag;
                })
            ))
        );
    }

    /**
     * Update the tag
     *
     * @param id
     * @param tag
     */
    updateTag(id: string, tag: Tag): Observable<Tag>
    {
        return this.tags$.pipe(
            take(1),
            switchMap(tags => this._httpClient.patch<Tag>('api/apps/contacts/tag', {
                id,
                tag
            }).pipe(
                map((updatedTag) => {

                    // Find the index of the updated tag
                    const index = tags.findIndex(item => item.id === id);

                    // Update the tag
                    tags[index] = updatedTag;

                    // Update the tags
                    this._tags.next(tags);

                    // Return the updated tag
                    return updatedTag;
                })
            ))
        );
    }

    /**
     * Delete the tag
     *
     * @param id
     */
    deleteTag(id: string): Observable<boolean>
    {
        return this.tags$.pipe(
            take(1),
            switchMap(tags => this._httpClient.delete('api/apps/contacts/tag', {params: {id}}).pipe(
                map((isDeleted: boolean) => {

                    // Find the index of the deleted tag
                    const index = tags.findIndex(item => item.id === id);

                    // Delete the tag
                    tags.splice(index, 1);

                    // Update the tags
                    this._tags.next(tags);

                    // Return the deleted status
                    return isDeleted;
                }),
                filter(isDeleted => isDeleted),
                switchMap(isDeleted => this.contacts$.pipe(
                    take(1),
                    map((contacts) => {

                        // Iterate through the contacts
                        contacts.forEach((contact) => {

                            const tagIndex = contact.tags.findIndex(tag => tag === id);

                            // If the contact has the tag, remove it
                            if ( tagIndex > -1 )
                            {
                                contact.tags.splice(tagIndex, 1);
                            }
                        });

                        // Return the deleted status
                        return isDeleted;
                    })
                ))
            ))
        );
    }

    /**
     * Update the avatar of the given contact
     *
     * @param id
     * @param avatar
     */
    uploadAvatar(id: number, avatar: File): Observable<Contact>
    {
        return this.contacts$.pipe(
            take(1),
            switchMap(contacts => this._httpClient.post<Contact>('api/apps/contacts/avatar', {
                id,
                avatar
            }, {
                headers: {
                    // eslint-disable-next-line @typescript-eslint/naming-convention
                    'Content-Type': avatar.type
                }
            }).pipe(
                map((updatedContact) => {

                    // Find the index of the updated contact
                    const index = contacts.findIndex(item => item.cod_cliente === id);

                    // Update the contact
                    contacts[index] = updatedContact;

                    // Update the contacts
                    this._contacts.next(contacts);

                    // Return the updated contact
                    return updatedContact;
                }),
                switchMap(updatedContact => this.contact$.pipe(
                    take(1),
                    filter(item => item && item.cod_cliente === id),
                    tap(() => {

                        // Update the contact if it's selected
                        this._contact.next(updatedContact);

                        // Return the updated contact
                        return updatedContact;
                    })
                ))
            ))
        );
    }
}
