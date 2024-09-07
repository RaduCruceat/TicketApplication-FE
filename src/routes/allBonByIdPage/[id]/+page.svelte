<script lang="ts">
    import { onMount } from 'svelte';
    import { page } from '$app/stores'; // To access the current route's parameters
    import Navbar from '$lib/SvelteComponents/navbar.svelte'; 
    import type { BonID, ApiResponse } from '$lib/ObjectsList/types'; // Adjust the path as needed

    let bons: BonID[] = [];
    let errorMessage: string = '';

    // Fetching the ID from the URL
    $: id = $page.params.id;

    async function handleStatusChange(event: Event): Promise<void> {
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
                fetchBons(); // Refresh the data after updating the status
            } else {
                console.error('Failed to update status', response.status);
            }
        } catch (error) {
            console.error('Error updating status:', error);
        }
    }

    async function fetchBons(): Promise<void> {
    try {
        // Fetch data from both endpoints
        const [bonResponse, ghiseuResponse] = await Promise.all([
            fetch(`https://localhost:7140/Bon/GetAll/${id}`),
            fetch('https://localhost:7140/Ghiseu/GetAll') // Adjust this URL to your actual endpoint
        ]);

        if (bonResponse.ok && ghiseuResponse.ok) {
            // Parse the JSON data from both responses
            const bonData: ApiResponse = await bonResponse.json();
            const ghiseuData: ApiResponse = await ghiseuResponse.json();

            if (bonData.isSuccess && ghiseuData.isSuccess) {
                // Create a map of ghiseu data for quick lookup
                const ghiseuMap = new Map(ghiseuData.result.map(g => [g.id, g]));

                // Map bon data to include corresponding ghiseu
                bons = Array.isArray(bonData.result) ? bonData.result.map(bon => ({
                    ...bon,
                    ghiseu: ghiseuMap.get(bon.idGhiseu)
                })) : [];
                errorMessage = ''; // Clear any previous errors
            } else {
                errorMessage = bonData.errorMessage || ghiseuData.errorMessage || 'An unknown error occurred';
                bons = []; // Clear previous data if there's an error
            }
        } else {
            // Attempt to parse error details from the responses
            const bonErrorData = await bonResponse.json();
            const ghiseuErrorData = await ghiseuResponse.json();
            errorMessage = bonErrorData.errorMessage || ghiseuErrorData.errorMessage || 'Failed to fetch data from the server';
            bons = [];
        }
    } catch (error) {
        if (error instanceof Error) {
            errorMessage = 'Error: ' + error.message;
        } else {
            errorMessage = 'An unknown error occurred';
        }
        bons = [];
    }
}
    onMount(fetchBons);
</script>

<Navbar /> <!-- Include the Navbar component -->
{#if errorMessage}
    <div class="error">
        <p>{errorMessage}</p>
    </div>
{:else}
    <div class="table-container">
        <h1>Bonurile pt. ghiseul cu id-ul: {id}</h1>
        <table>
            <thead>
                <tr>
                    <th>Id Ghiseu</th>
                    <th>Denumire</th>
                    <th>Data Creari</th>
                    <th>Data ultimei modificari</th>
                    <th>Stare</th>
                    <th>Schimba Starea</th>
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
                        <td>{new Date(bon.createdAt).toLocaleString()}</td>
                        <td>{new Date(bon.modifiedAt).toLocaleString()}</td>
                        <td style="background-color: {bon.stare === 0 ? 'lightgreen' : bon.stare === 1 ? 'lightyellow' : 'lightcoral'};">
                            {bon.stare === 0 ? 'In Curs De Preluare' : bon.stare === 1 ? 'Preluat' : 'Inchis'}
                        </td>
                        <td>
                            <select on:change={handleStatusChange} value={bon.stare}>
                                <option value="0">In Curs De Preluare</option>
                                <option value="1">Preluat</option>
                                <option value="2">Inchis</option>
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
        margin-bottom: 20px;
    }

    table {
        width: 100%;
        border-collapse: collapse;
        margin-top: 20px;
    }

    .table-container {
        position: relative;
        padding-top: 50px; /* Adjust if needed */
    }

    th, td {
        border: 1px solid #ddd;
        padding: 8px;
        text-align: center;
    }

    th {
        background-color: #f4f4f4;
    }
</style>
