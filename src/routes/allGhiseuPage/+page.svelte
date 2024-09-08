<script lang="ts">
    import { onMount } from 'svelte';
    import { goto } from '$app/navigation';
    import type { GhiseuID, BonID, ApiResponse } from '$lib/ObjectsList/types'; 
    import Navbar from '$lib/SvelteComponents/navbar.svelte'; 
    import Toast from '$lib/SvelteComponents/Toast.svelte';
    import Checkmark from '$lib/SvelteComponents/Checkmark.svelte';
    import { HostLink } from '$lib/ApiFile/configApi';

    let isChecked = false;

    let ghiseuList: GhiseuID[] = [];
    let bons: BonID[] = [];
    let errorMessage: string = '';

    let showToast: boolean = false;
    let toastMessage: string = '';
    let selectedGhiseuId: number | null = null;

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

    async function fetchBons(id: number): Promise<void> {
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
                // Set the error message specific to bon fetching
                errorMessage = bonData.errorMessage || 'An unknown error occurred while fetching bon data';
                bons = [];
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

async function handleStatusChange(event: Event, idBon: number): Promise<void> {
    const selectElement = event.target as HTMLSelectElement;
    const newStatus = selectElement.value;

    // If the selected value is "Schimba Starea", do nothing
    if (newStatus === 'Schimba Starea') {
        return;
    }
    
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
                await fetchBons(selectedGhiseuId);
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
            toastMessage = `Sterge ghiseul cu denumirea ${denumire}?`;
            showToast = true;
        } else if (action === 'allBonByIdPage') {
            fetchBons(id);
        } else if (action) {
            goto(`/${action}`);
        }
    }

    function closeToast() {
        showToast = false;
        selectedGhiseuId = null;
    }

    onMount(fetchData);
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
            <h1>Pagina Ghisee</h1>
            <button class="add-button" on:click={() => goto('/addGhiseuPage')}>Adauga Ghiseu</button>
            <table>
                <thead>
                    <tr>      
                        <th>Cod</th>    
                        <th>Denumire</th>
                        <th>Descriere</th>
                        <th>Activ</th>
                        <th>Actiuni</th> 
                    </tr>
                </thead>
                <tbody>
                    {#each ghiseuList as ghiseu}
                        <tr>
                            <td>{ghiseu.cod}</td>
                            <td>
                                {#if ghiseu.icon}
                                    <img src={ghiseu.icon} alt={ghiseu.denumire} style="max-width: 20px; max-height: 20px;" />
                                {/if}
                                {ghiseu.denumire}
                            </td>
                            <td>{ghiseu.descriere}</td>
                            <td class="checkmark-cell" style="background-color: {ghiseu.activ ? 'lightgreen' : 'lightcoral'};">
                                <Checkmark
                                    checked={ghiseu.activ}
                                    on:click={() => handleChange1(ghiseu.id, ghiseu.activ ? 'inactive' : 'active')}
                                />
                            </td>
                            <td>
                                <select on:change={(e) => handleActionChange(e, ghiseu.id, ghiseu.denumire)}>
                                    <option value="">Selecteaza actiunea</option>
                                    <option value="allBonByIdPage">Bonurile Ghiseului</option>
                                    <option value={`editGhiseuPage/${ghiseu.id}`}>Editeaza Ghiseu</option>
                                    <option value="delete">Sterge Ghiseu</option>
                                </select>
                            </td>
                        </tr>
                    {/each}
                </tbody>
            </table>
        </div>

        {#if selectedGhiseuId !== null}
            <div class="bon-container">
                <h1>Bonurile pt. ghiseul cu id-ul: {selectedGhiseuId}</h1>
                <button class="add-button"  on:click={() => goto('/addBonPage')}>Adauga Bon</button>
                {#if errorMessage && bons.length === 0}
                    <div class="error">
                        <p>{errorMessage}</p>
                    </div>
                {:else}
                    <table>
                        <thead>
                            <tr>
                                <th>Id Ghiseu</th>
                                <th>Ghiseu</th>
                                <th>Data Creari</th>
                                <th>Data ultimei modificari</th>
                                <th>Stare</th>
                                <th>Actiuni pentru stare </th>
                            </tr>
                        </thead>
                        <tbody>
                            {#each bons as bon}
                                <tr>
                                    <td>{bon.idGhiseu}</td>
                                    <td>
                                        {#if bon.ghiseu}
                                            {#if bon.ghiseu.icon}
                                                <img src={bon.ghiseu.icon} alt={bon.ghiseu.denumire} style="max-width: 20px; max-height: 20px; vertical-align: middle; margin-right: 5px;" />
                                            {/if}
                                            {bon.ghiseu.denumire}
                                        {:else}
                                            N/A
                                        {/if}
                                    </td>
                                    <td>{new Date(bon.createdAt).toLocaleString('ro-RO', {
                                        year: 'numeric',
                                        month: '2-digit',
                                        day: '2-digit',
                                        hour: '2-digit',
                                        minute: '2-digit'
                                    })}</td>
                                    <td>{new Date(bon.modifiedAt).toLocaleString('ro-RO', {
                                        year: 'numeric',
                                        month: '2-digit',
                                        day: '2-digit',
                                        hour: '2-digit',
                                        minute: '2-digit'
                                    })}</td>
                                    <td style="background-color: {bon.stare === 0 ? 'lightblue' : bon.stare === 1 ? 'lightyellow' : 'lightgreen'};">
                                        {bon.stare === 0 ? 'In Curs De Preluare' : bon.stare === 1 ? 'Preluat' : 'Inchis'}
                                    </td>
                                    <td>
                                        <select on:change={(event) => handleStatusChange(event, bon.id)} style="width: 150px; text-align: center; text-align-last: center;">
                                            <option value="Schimba Starea" selected>Schimba Starea</option>
                                            {#if bon.stare !== 0}
                                                <option value="InCursDePreluare">In Curs De Preluare</option>
                                            {/if}
                                            {#if bon.stare !== 1}
                                                <option value="Preluat">Preluat</option>
                                            {/if}
                                            {#if bon.stare !== 2}
                                                <option value="Inchis">Inchis</option>
                                            {/if}
                                        </select>
                                    </td>
                                </tr>
                            {/each}
                        </tbody>
                    </table>
                {/if}
            </div>
        {/if}
    </div>
{/if}


<style>
    .container {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 20px;
    }
    .ghiseu-container,
    .bon-container {
        padding: 20px;
    }
    .checkmark-cell {
        display: flex;
        justify-content: center;
        align-items: center;
    }
    .error {
        color: red;
        font-weight: bold;
        margin-bottom: 20px;
    }
    table {
        width: 100%;
        border-collapse: collapse;
        margin-top: 20px;
    }
    th, td {
        border: 1px solid #ddd;
        padding: 8px;
        text-align: center;
    }
    th {
        background-color: #f4f4f4;
    }
    .add-button {
        background-color: #28a745;
        color: white;
        border: none;
        padding: 10px 20px;
        border-radius: 5px;
        cursor: pointer;
        margin-bottom: 20px;
    }
</style>
