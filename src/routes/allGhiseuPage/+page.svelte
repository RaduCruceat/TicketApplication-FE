<script lang="ts">
    import { onMount } from 'svelte';
    import type { GhiseuID, ApiResponse } from '$lib/ObjectsList/types'; // Adjust the path as needed
    import Navbar from '$lib/SvelteComponents/navbar.svelte'; 
    import { goto } from '$app/navigation'; // Import navigation function

    let ghiseuList: GhiseuID[] = [];
    let errorMessage: string = '';

    function navigateToAddGhiseuPage() {
        goto('/addGhiseuPage'); // Adjust the path according to your routing setup
    }

    async function fetchData(): Promise<void> {
        try {
            const response = await fetch('https://localhost:7140/Ghiseu/GetAll');
            if (response.ok) {
                const data: ApiResponse = await response.json();

                if (data.isSuccess) {
                    ghiseuList = Array.isArray(data.result) ? data.result : [];
                    errorMessage = ''; // Clear any previous errors
                } else {
                    errorMessage = data.errorMessage || 'An unknown error occurred';
                    ghiseuList = []; // Clear previous data if there's an error
                }
            } else {
                errorMessage = 'Failed to fetch data from the server';
                ghiseuList = [];
            }
        } catch (error) {
            if (error instanceof Error) {
                errorMessage = 'Error: ' + error.message;
            } else {
                errorMessage = 'An unknown error occurred';
            }
            ghiseuList = [];
        }
    }

    async function changeStatus(id: number, newStatus: string): Promise<void> {
        const url = newStatus === 'active'
            ? `https://localhost:7140/Ghiseu/MarkAsActive/${id}`
            : `https://localhost:7140/Ghiseu/MarkAsInactive/${id}`;

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
    function handleChange(event: Event, id: number) {
        const selectElement = event.target as HTMLSelectElement;
        const newStatus = selectElement.value;
        changeStatus(id, newStatus);
    }
    onMount(fetchData);
</script>

<Navbar /> <!-- Include the Navbar component -->
{#if errorMessage}
    <div class="error">
        <p>{errorMessage}</p>
    </div>
{:else}
    <div class="table-container">
        <button class="add-button" on:click={navigateToAddGhiseuPage}>Add New Ghiseu</button>
        <table>
            <thead>
                <tr>
                    <th>Id</th>
                    <th>Cod</th>
                    <th>Denumire</th>
                    <th>Descriere</th>
                    <th>Icon</th>
                    <th>Activ</th>
                    <th>Schimba Starea</th>
                </tr>
            </thead>
            <tbody>
                {#each ghiseuList as ghiseu}
                    <tr>
                        <td>{ghiseu.id}</td>
                        <td>{ghiseu.cod}</td>
                        <td>{ghiseu.denumire}</td>
                        <td>{ghiseu.descriere}</td>
                        <td>{ghiseu.icon}</td>
                        <td style="background-color: {ghiseu.activ ? 'lightgreen' : 'lightcoral'};">
                            {ghiseu.activ ? 'Yes' : 'No'}
                        </td>
                        <td>
                            <select
                            on:change={(e) => handleChange(e, ghiseu.id)}
                            value={ghiseu.activ ? 'active' : 'inactive'}
                        >
                            <option value="active">Active</option>
                            <option value="inactive">Inactive</option>
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