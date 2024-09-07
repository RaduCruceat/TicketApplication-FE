<script lang="ts">
    import { onMount } from 'svelte';
    import type { BonID, ApiResponse } from '$lib/ObjectsList/types'; // Import the TypeScript types
    import Navbar from '$lib/SvelteComponents/navbar.svelte'; 
    import { goto } from '$app/navigation'; // Import navigation function

    let bonList: BonID[] = [];
    let errorMessage: string = '';

    function navigateToAddBonPage() {
        goto('/addBonPage'); // Adjust the path according to your routing setup
    }

    async function handleStatusChange(event: Event, id: number): Promise<void> {
    const selectElement = event.target as HTMLSelectElement;
    const newStatus = selectElement.value;
    const url = newStatus === 'InCursDePreluare'
        ? `https://localhost:7140/Bon/MarkAsInProgress/${id}`
        : newStatus === 'Preluat'
        ? `https://localhost:7140/Bon/MarkAsReceived/${id}`
        : `https://localhost:7140/Bon/MarkAsClose/${id}`;

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
            const response = await fetch('https://localhost:7140/Bon/GetAll'); // Update with the actual API endpoint
            if (response.ok) {
                const data: ApiResponse = await response.json();
                if (data.isSuccess) {
                    bonList = Array.isArray(data.result) ? data.result : [];
                    errorMessage = ''; // Clear any previous errors
                } else {
                    errorMessage = data.errorMessage || 'An unknown error occurred';
                    bonList = []; // Clear previous data if there's an error
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
    <button class="add-button" on:click={navigateToAddBonPage}>Add New Bon</button>
    <table>
        <thead>
            <tr>
                <th>Id Ghiseu</th>
                <th>Data Creari</th>
                <th>Data ultimei modificari</th>
                <th>Stare</th>
                <th>Schimba Starea</th>
            </tr>
        </thead>
        <tbody>
            {#each bonList as bon}
                <tr>
                    <td>{bon.idGhiseu}</td>
                    <td>{new Date(bon.createdAt).toLocaleString()}</td>
                    <td>{new Date(bon.modifiedAt).toLocaleString()}</td>
                    <td style="background-color: {bon.stare === 0 ? 'lightblue' : bon.stare === 1 ? 'lightyellow' : 'lightgreen'};">
                        {bon.stare === 0 ? 'InCursDePreluare' : bon.stare === 1 ? 'Preluat' : 'Inchis'}
                    </td>
                    <td>
                        <select on:change={(e) => handleStatusChange(e, bon.id)} value={bon.stare}>
                            <option value="InCursDePreluare">In Curs De Preluare</option>
                            <option value="Preluat">Preluat</option>
                            <option value="Inchis">Inchis</option>
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