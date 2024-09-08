<script lang="ts">
    import { onMount } from 'svelte';
    import type { BonID, ApiResponse } from '$lib/ObjectsList/types'; // Import the TypeScript types
    import Navbar from '$lib/SvelteComponents/navbar.svelte'; 
    import { goto } from '$app/navigation'; // Import navigation function
    import { HostLink } from '$lib/ApiFile/configApi';

    let bonList: BonID[] = [];
    let errorMessage: string = '';

    function navigateToAddBonPage() {
        goto('/addBonPage'); // Adjust the path according to your routing setup
    }

    async function handleStatusChange(event: Event, id: number): Promise<void> {
    const selectElement = event.target as HTMLSelectElement;
    const newStatus = selectElement.value;
    const url = newStatus === 'InCursDePreluare'
        ? `${HostLink}/Bon/MarkAsInProgress/${id}`
        : newStatus === 'Preluat'
        ? `${HostLink}/Bon/MarkAsReceived/${id}`
        : `${HostLink}/Bon/MarkAsClose/${id}`;

    try {
        const response = await fetch(url, { method: 'PUT' });
        if (response.ok) {
            fetchData(); // Refresh the data after updating the status
        } else {
            console.error('Failed to update status');
        }
    } catch (error) {
        console.error('Error updating status:', error);
    }
}

async function fetchData(): Promise<void> {
    try {
        const [bonResponse, ghiseuResponse] = await Promise.all([
            fetch(`${HostLink}/Bon/GetAll`),
            fetch(`${HostLink}/Ghiseu/GetAll`) // Adjust this URL to your actual endpoint
        ]);

        if (bonResponse.ok && ghiseuResponse.ok) {
            const bonData: ApiResponse = await bonResponse.json();
            const ghiseuData: ApiResponse = await ghiseuResponse.json();

            if (bonData.isSuccess && ghiseuData.isSuccess) {
                const ghiseuMap = new Map(ghiseuData.result.map(g => [g.id, g]));
                bonList = Array.isArray(bonData.result) ? bonData.result.map(bon => ({
                    ...bon,
                    ghiseu: ghiseuMap.get(bon.idGhiseu)
                })) : [];
                errorMessage = '';
            } else {
                errorMessage = bonData.errorMessage || ghiseuData.errorMessage || 'An unknown error occurred';
                bonList = [];
            }
        } else {
            errorMessage = 'Failed to fetch data from the server';
            bonList = [];
        }
    } catch (error) {
        if (error instanceof Error) {
            errorMessage = 'Error: ' + error.message;
        } else {
            errorMessage = 'An unknown error occurred';
        }
        bonList = [];
    }
}

    onMount(fetchData);
</script>

<Navbar /> <!-- Include the Navbar component -->
{#if errorMessage}
    <div class="error">
        <p>{errorMessage}</p>
    </div>
{:else}
<h1>Pagina Bonuri</h1>
<div class="table-container">
    <button class="add-button" on:click={navigateToAddBonPage}>Adauga Bon</button>
    <table>
        <thead>
            <tr>
                <th>Id Ghiseu</th>
                <th>Ghiseu</th>
                <th>Data Creari</th>
                <th>Data ultimei modificari</th>
                <th>Stare</th>
                <th>Actiuni pentru stare</th>
            </tr>
        </thead>
        <tbody>
            {#each bonList as bon}
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
                    <td>{new Date(bon.createdAt).toLocaleString('ro-RO', 
                    {
                        year: 'numeric',
                        month: '2-digit',
                        day: '2-digit',
                        hour: '2-digit',
                        minute: '2-digit'
                    })}
                    </td>
                    <td>{new Date(bon.modifiedAt).toLocaleString('ro-RO', 
                    {
                    year: 'numeric',
                    month: '2-digit',
                    day: '2-digit',
                    hour: '2-digit',
                    minute: '2-digit'
                    })}
                   </td>
                    <td style="background-color: {bon.stare === 0 ? 'lightblue' : bon.stare === 1 ? 'lightyellow' : 'lightgreen'};">
                        {bon.stare === 0 ? 'In Curs De Preluare' : bon.stare === 1 ? 'Preluat' : 'Inchis'}
                    </td>
                   <td>
    <select on:change={(event) => handleStatusChange(event, bon.id)} style="width: 150px; text-align: center; text-align-last: center;">
        <option disabled selected>Schimba Starea</option> <!-- Placeholder option -->
        
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
</div>
{/if}

<style>
    .error {
        color: red;
        font-weight: bold;
    }

    table {
        width: 100%;
        border-collapse: collapse;
    }
    .table-container {
        position: relative;
        padding-top: 50px; /* Add padding-top to account for the navbar height */
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
        position: absolute;
        top: 10px;
        right: 10px;
        background-color: #28a745; /* Green color */
        color: white;
        border: none;
        padding: 10px 20px;
        border-radius: 5px;
        cursor: pointer;
    }

</style>