<script lang="ts">
    import { onMount } from 'svelte';
    import { goto } from '$app/navigation';
    import type { GhiseuID, BonID, ApiResponse, Ghiseu } from '$lib/ObjectsList/types'; 
    import Navbar from '$lib/SvelteComponents/navbar.svelte'; 
    import Toast from '$lib/SvelteComponents/Toast.svelte';
    import Checkmark from '$lib/SvelteComponents/Checkmark.svelte';
    import { page } from '$app/stores';
    import { get } from 'svelte/store';
    export let data: { secretLink: string };
    let HostLink=data.secretLink;
    let isChecked = false;
    
    let ghiseuList: GhiseuID[] = [];
    let bons: BonID[] = [];
    let errorMessage: string = '';

    let showToast: boolean = false;
    let toastMessage: string = '';
    let selectedGhiseuId: number | null = null;

    let selectedGhiseuDenumire: string = ''; // New variable to store ghiseu.denumire
    let selectedGhiseuIcon: string = ''; // New variable to store ghiseu.denumire

    async function storeNameOfGhiseu(ghiseuName: string) {
        selectedGhiseuDenumire=ghiseuName;
        
    }

    async function fetchData(): Promise<void> {
        try {
            const response = await fetch(`${HostLink}/Ghiseu/GetAll`);
            if (response.ok) {
                const data: ApiResponse = await response.json();
                if (data.isSuccess) {
                    ghiseuList = Array.isArray(data.result) ? data.result : [];
                    errorMessage = ''; 
                } else {
                    errorMessage = data.errorMessage || 'An unknown error occurred';
                    ghiseuList = []; 
                }
            } else {
                errorMessage = 'Failed to fetch data from the server';
                ghiseuList = [];
            }
        } catch (error) {
            errorMessage = error instanceof Error ? 'Error: ' + error.message : 'An unknown error occurred';
            ghiseuList = [];
        }
       
    }

    async function fetchBons(id: number, ghiseuName: string,ghiseuIcon:string): Promise<void> {
    selectedGhiseuDenumire=ghiseuName;
    selectedGhiseuIcon=ghiseuIcon;
        try {
        const [bonResponse, ghiseuResponse] = await Promise.all([
            fetch(`${HostLink}/Bon/GetAll/${id}`),
            fetch(`${HostLink}/Ghiseu/Get/${id}`)
        ]);
        selectedGhiseuId = id;
      
        if (bonResponse.ok && ghiseuResponse.ok) {
            const bonData: ApiResponse = await bonResponse.json();
            const ghiseuData: ApiResponse = await ghiseuResponse.json();
            if (bonData.isSuccess && ghiseuData.isSuccess) {
                const ghiseu = ghiseuData.result;
                bons = Array.isArray(bonData.result) ? bonData.result.map(bon => ({
                    ...bon,
                    ghiseu: ghiseu
                })) : [];
                errorMessage = ''; // Clear any previous error message
            } else {
                errorMessage = bonData.errorMessage || 'Ghiseul este inactiv sau nu contine bonuri.';
                bons = []; // Ensure bons is empty in case of failure
            }
        } else {
            const bonErrorData = await bonResponse.json();
            errorMessage = bonErrorData.errorMessage || 'Failed to fetch bon data from the server';
            bons = [];
        }
    } catch (error) {
        errorMessage = error instanceof Error ? 'Error: ' + error.message : 'An unknown error occurred';
        bons = [];
    }
   
}

async function handleStatusChange(newStatus: string, idBon: number): Promise<void> {
    const url = newStatus === 'InCursDePreluare'
        ? `${HostLink}/Bon/MarkAsInProgress/${idBon}`
        : newStatus === 'Preluat'
        ? `${HostLink}/Bon/MarkAsReceived/${idBon}`
        : `${HostLink}/Bon/MarkAsClose/${idBon}`;

    try {
        const response = await fetch(url, { method: 'PUT' });
        if (response.ok) {
            await fetchData(); // Refresh the data after updating the status
            if (selectedGhiseuId) {
                fetchBons(selectedGhiseuId,selectedGhiseuDenumire,selectedGhiseuIcon); 
            }
        } else {
            console.error('Failed to update status');
        }
    } catch (error) {
        console.error('Error updating status:', error);
    }
}


    async function changeStatus(id: number, newStatus: string): Promise<void> {
        const url = newStatus === 'active'
            ? `${HostLink}/Ghiseu/MarkAsActive/${id}`
            : `${HostLink}/Ghiseu/MarkAsInactive/${id}`;

        try {
            const response = await fetch(url, { method: 'PUT' });
            if (response.ok) {
                fetchData(); 
            } else {
                console.error('Failed to update status');
            }
        } catch (error) {
            console.error('Error updating status:', error);
        }
    }

    async function deleteGhiseu(): Promise<void> {
        if (selectedGhiseuId !== null) {
            const url = `${HostLink}/Ghiseu/Delete/${selectedGhiseuId}`;
            try {
                const response = await fetch(url, { method: 'DELETE' });
                if (response.ok) {
                    fetchData();
                    closeToast(); 
                } else {
                    console.error('Failed to delete Ghiseu');
                }
            } catch (error) {
                console.error('Error deleting Ghiseu:', error);
            }
        }
    }

    function handleChange1(id: number, newStatus: string) {
        changeStatus(id, newStatus);
    }

    function handleActionChange(event: Event, id: number, denumire: string) {
        const selectElement = event.target as HTMLSelectElement;
        const action = selectElement.value;

        if (action === 'delete') {
            selectedGhiseuId = id;
            toastMessage = `Șterge ${denumire}?`;
            showToast = true;
        } else if (action === 'allBonByIdPage') {
            fetchBons(id,selectedGhiseuDenumire,selectedGhiseuIcon);
        } else if (action) {
            goto(`/${action}`);
        }
    }

    function closeToast() {
        showToast = false;
        selectedGhiseuId = null;
    }

    onMount(() => {
     fetchData();
    const params = get(page).url.searchParams;
    const ghiseuIdParam = params.get('ghiseuId');
    if (ghiseuIdParam) {
        selectedGhiseuId = parseInt(ghiseuIdParam, 10);
        fetchBons(selectedGhiseuId,selectedGhiseuDenumire,selectedGhiseuIcon); // Automatically fetch Bons for the selected Ghiseu
    } // Fetch all Ghiseu data if no specific Ghiseu is selected

});
</script>


{#if showToast}
    <Toast
        message={toastMessage}
        onClose={closeToast}
        onConfirm={deleteGhiseu}
    />
{/if}
<Navbar />
{#if errorMessage && !selectedGhiseuId}
    <div class="error">
        <p>{errorMessage}</p>
    </div>
{:else}
    <div class="container">
        <div class="ghiseu-container">
            <h1>Pagină pentru Ghișee</h1>
            <button class="add-button" on:click={() => goto('/addGhiseuPage')}>Adaugă Ghișeu</button>
            <table class="fixed-table">
                <thead>
                    <tr>      
                        <th style="width: 40px;">Cod</th>    
                        <th>Denumire</th>
                        <th>Descriere</th>
                        <th style="width: 40px;">Activ</th>
                        <th>Acțiuni</th> 
                    </tr>
                </thead>
                <tbody>
                    {#each ghiseuList as ghiseu}
                        <tr>
                            <td>{ghiseu.cod}</td>
                            <td class="denumire-cell">
                                {#if ghiseu.icon}
                                    <img src={ghiseu.icon} alt={ghiseu.denumire} class="ghiseu-icon" />
                                {/if}
                                <span>{ghiseu.denumire}</span>
                            </td>
                            <td>{ghiseu.descriere}</td>
                            <td class="checkmark-cell" style="background-color: {ghiseu.activ ? 'lightgreen' : 'lightcoral'};">
                                <Checkmark
                                    checked={ghiseu.activ}
                                    on:click={() => handleChange1(ghiseu.id, ghiseu.activ ? 'inactive' : 'active')}
                                />
                            </td>
                            <td>
                                <div class="view-edit-delete-container">
                                    <!-- Bons Button with Ticket Icon -->
                                    <button class="circle-btn black-btn" on:click={() => fetchBons(ghiseu.id,ghiseu.denumire,ghiseu.icon)}>
                                        <i class="fas fa-ticket-alt"></i>
                                    </button>
                            
                                    <!-- Modifica Button with Pencil Icon -->
                                    <button class="circle-btn black-btn" on:click={() => goto(`/editGhiseuPage/${ghiseu.id}`)}>
                                        <i class="fas fa-pencil-alt"></i>
                                    </button>
                            
                                    <!-- Sterge Button with Trash Bin Icon -->
                                    <button class="circle-btn black-btn" on:click={() => {
                                        selectedGhiseuId = ghiseu.id;
                                        toastMessage = `Șterge ${ghiseu.denumire}?`;
                                        showToast = true;
                                    }}>
                                        <i class="fas fa-trash-alt"></i>
                                    </button>
                                </div>
                            </td>
                        </tr>
                    {/each}
                </tbody>
            </table>
        </div>

        <div class="bon-container">
           
                <h1>
                   
                    {#if selectedGhiseuId !== null}
                    Listă de bonuri pentru:
                      <img src={selectedGhiseuIcon} alt={selectedGhiseuDenumire} style="width: 15px; height: 15px; margin-right: 3px;" />
                      {selectedGhiseuDenumire}
                    {:else}
                      Niciun ghiseu selectat
                    {/if}
                  </h1>
            <button class="add-button" on:click={() => goto('/addBonPage')}>Adaugă Bon</button>
           
            {#if selectedGhiseuId !== null}
                {#if errorMessage && bons.length === 0}
                    <div class="error">
                        <p>{errorMessage}</p>
                    </div>
                {:else}
                    <table class="fixed-table">
                        <thead>
                            <tr>
                                <th>Ultima modificare</th>
                                <th>Stare</th>
                                <th>Acțiuni pentru stare</th>
                            </tr>
                        </thead>
                        <tbody>
                            {#each bons as bon}
                                <tr>                                   
                                    <td>{new Date(bon.modifiedAt).toLocaleString('ro-RO', {
                                        year: 'numeric',
                                        month: '2-digit',
                                        day: '2-digit',
                                        hour: '2-digit',
                                        minute: '2-digit'
                                    })}</td>
                                    <td style="background-color: {bon.stare === 0 ? 'lightblue' : bon.stare === 1 ? 'lightyellow' : 'lightgreen'};">
                                        {bon.stare === 0 ? 'În curs de preluare' : bon.stare === 1 ? 'Preluat' : 'Închis'}
                                    </td>
                                    <td>
                                        <div class="bon-buttons-container">
                                            {#if bon.stare !== 0}
                                                <button 
                                                    on:click={() => handleStatusChange('InCursDePreluare', bon.id)}
                                                    class="fixed-button lightblue-button"
                                                >
                                                    în curs de preluare
                                                </button>
                                            {/if}
                                            {#if bon.stare !== 1}
                                                <button 
                                                    on:click={() => handleStatusChange('Preluat', bon.id)}
                                                    class="fixed-button lightyellow-button"
                                                >
                                                    Preluat
                                                </button>
                                            {/if}
                                            {#if bon.stare !== 2}
                                                <button 
                                                    on:click={() => handleStatusChange('Inchis', bon.id)}
                                                    class="fixed-button lightgreen-button"
                                                >
                                                    Închis
                                                </button>
                                            {/if}
                                        </div>
                                    </td>
                                </tr>
                            {/each}
                        </tbody>
                    </table>
                {/if}
            {/if}
        </div>
    </div>
{/if}

<style>
      .view-edit-delete-container {
        display: flex;
        gap: 10px; /* Add some space between buttons */
    }

    .circle-btn {
        width: 40px;       /* Adjust the width and height for the size of the button */
        height: 40px;
        border-radius: 50%; /* Makes the button circular */
        display: flex;
        justify-content: center;
        align-items: center;
        border: none;
        cursor: pointer;
        font-size: 18px;    /* Adjust icon size */
        color: white;       /* Icon color */
    }


    .black-btn {
        background-color: black;
        color: white;
    }

 

    .circle-btn i {
        pointer-events: none; /* Prevent clicking on the icon instead of the button */
    }

    .circle-btn:hover {
        opacity: 0.8; /* Optional hover effect */
    }


        /* Fixed size for buttons */
        .fixed-button {
        width: 60px;
        font-size: 0.3em;
        cursor: pointer;
    }

    /* Background colors for each button */
    .lightblue-button {
        background-color: lightblue;
    }

    .lightyellow-button {
        background-color: lightyellow;
    }

    .lightgreen-button {
        background-color: lightgreen;
    }

    .container {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 10px;
    }
    .ghiseu-container,
    .bon-container {
        padding: 10px;
        overflow-x: auto;
    }
    .checkmark-cell {
        display: flex;
        justify-content: center;
        align-items: center;
    }
    .error {
        color: red;
        font-weight: bold;
        margin-bottom: 10px;
        font-size: 0.9em;
    }
    .fixed-table {
        width: 100%;
        table-layout: fixed;
        border-collapse:initial;
        margin-top: 10px;
        font-size: 0.8em;
        border: 2px solid black;
       
    }
    .fixed-table th, .fixed-table td {
        border: 1px solid #ddd;
        padding: 4px;
        text-align: center;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        min-height:60px;
        border: 2px solid black;
       
    }
    .fixed-table th {
        background-color: #f4f4f4;
        border: 2px solid black;
    }
    .add-button {
        background-color: black;
        color: white;
        border: none;
        padding: 5px 10px;
        border-radius: 3px;
        cursor: pointer;
        margin-bottom: 10px;
        font-size: 0.9em;
    }
    .denumire-cell {
        display: flex;
        align-items: center;
        justify-content: center;
   
    
    border: 2px solid black; /* Ensure the border is explicitly set to 2px */
        
    }
    .ghiseu-icon {
        max-width: 16px;
        max-height: 16px;
        margin-right: 3px;
    }

   
 
    .view-edit-delete-container {
        flex: 1;
        display:inline-flex;

    }
    .view-edit-delete-container button {
        flex: 1;
        font-size: 0.8em;
        padding: 2px;
        cursor: pointer;
    }
    h1 {
        font-size: 1.2em;
        margin-bottom: 10px;
    }



/* Layout for the action buttons in the "bon" table to be stacked vertically */
.bon-buttons-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 5px; /* Add some space between the buttons */
}

/* Adjust button styles to be uniform and not too large */
.fixed-button {
    width: 100px;
    font-size: 0.8em;
    cursor: pointer;
    padding: 5px;
    text-align: center;
}


/* Styling for the rest of the page */


</style>