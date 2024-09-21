<script lang="ts">
    import { onMount } from 'svelte';
    import type { BonID, ApiResponse } from '$lib/ObjectsList/types'; // Import the TypeScript types
    import Navbar from '$lib/SvelteComponents/navbar.svelte'; 
    import { goto } from '$app/navigation'; // Import navigation function
    export let data: { secretLink: string };
    let HostLink=data.secretLink;
   
    let bonList: BonID[] = [];
    let errorMessage: string = '';

    function navigateToAddBonPage() {
        goto('/addBonPage'); // Adjust the path according to your routing setup
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
                <th>Ghiseu</th>
                <th>Data Creari</th>
                <th>Ultima modificare</th>
                <th>Stare</th>
                <th>Actiuni pentru stare</th>
            </tr>
        </thead>
        <tbody>
            {#each bonList as bon}
                <tr>
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
                    <td class="date-column">
                        {new Date(bon.createdAt).toLocaleString('ro-RO', 
                        {
                            year: 'numeric',
                            month: '2-digit',
                            day: '2-digit',
                            hour: '2-digit',
                            minute: '2-digit'
                        })}
                    </td>
                    <td class="date-column">
                        {new Date(bon.modifiedAt).toLocaleString('ro-RO', 
                        {
                            year: 'numeric',
                            month: '2-digit',
                            day: '2-digit',
                            hour: '2-digit',
                            minute: '2-digit'
                        })}
                    </td>
                    <td style="background-color: {bon.stare === 0 ? 'lightblue' : bon.stare === 1 ? 'lightyellow' : 'lightgreen'};">
                        {bon.stare === 0 ? 'In curs de preluare' : bon.stare === 1 ? 'Preluat' : 'Inchis'}
                    </td>
                    <td>
                        {#if bon.stare !== 0}
                            <button 
                                on:click={() => handleStatusChange('InCursDePreluare', bon.id)}
                                style="background-color: lightblue;"
                            >
                                In curs de preluare
                            </button>
                        {/if}
                        {#if bon.stare !== 1}
                            <button 
                                on:click={() => handleStatusChange('Preluat', bon.id)}
                                style="background-color: lightyellow;"
                            >
                                Preluat
                            </button>
                        {/if}
                        {#if bon.stare !== 2}
                            <button 
                                on:click={() => handleStatusChange('Inchis', bon.id)}
                                style="background-color: lightgreen;"
                            >
                                Inchis
                            </button>
                        {/if}
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
        background-color: black; /* Green color */
        color: white;
        border: none;
        padding: 10px 20px;
        border-radius: 5px;
        cursor: pointer;
    }

    table {
        width: 100%;
        table-layout: fixed;
        border-collapse: collapse;
        margin-top: 10px;
        font-size: 0.8em;
}

/* Fixed size for action buttons */
button {
    width: 100px; /* Fixed width for buttons */
    height: 30px; /* Fixed height for buttons */
    font-size: 10px; /* Font size for button text */
    margin: 2px; /* Margin between buttons */
    cursor: pointer;
}

/* Center align data creation and last modification dates */
td.date-column {
    text-align: center;
}

/* Add padding-top to account for the navbar height */
.table-container {
    position: relative;
    padding-top: 60px; /* Adjust padding-top as needed */
}

</style>