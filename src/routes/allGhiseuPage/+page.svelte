<script lang="ts">
    import { onMount } from 'svelte';
    import type { GhiseuID, ApiResponse } from '$lib/ObjectsList/types'; // Adjust the path as needed
    import Navbar from '$lib/SvelteComponents/navbar.svelte'; 
    import { goto } from '$app/navigation'; // Import navigation function
    import Toast from '$lib/SvelteComponents/Toast.svelte';
    import Checkmark from '$lib/SvelteComponents/Checkmark.svelte';
    let isChecked = false;

    let ghiseuList: GhiseuID[] = [];
    let errorMessage: string = '';

    let showToast: boolean = false;
    let toastMessage: string = '';
    let selectedGhiseuId: number | null = null;


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


    function handleChange1(id: number, newStatus: string) {
    console.log("Changing status for ID:", id, "New Status:", newStatus);
    changeStatus(id, newStatus);
}

    function handleActionChange(event: Event, id: number, denumire: string) {
    const selectElement = event.target as HTMLSelectElement;
    const action = selectElement.value;

    if (action === 'delete') {
        selectedGhiseuId = id;
        toastMessage = `Sterge ghiseul cu denumirea ${denumire}?`;
        showToast = true;
    } else if (action) {
        goto(`/${action}`);
    }
    }

    function closeToast() {
         showToast = false;
        selectedGhiseuId = null;
    }

async function deleteGhiseu(): Promise<void> {
    if (selectedGhiseuId !== null) {
        const url = `https://localhost:7140/Ghiseu/Delete/${selectedGhiseuId}`;

        try {
            const response = await fetch(url, { method: 'DELETE' });
            if (response.ok) {
                fetchData();
                closeToast(); // Close the toast after deletion
            } else {
                console.error('Failed to delete Ghiseu');
            }
        } catch (error) {
            console.error('Error deleting Ghiseu:', error);
        }
    }
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
<Navbar /> <!-- Include the Navbar component -->
{#if errorMessage}
    <div class="error">
        <p>{errorMessage}</p>
    </div>
{:else}
    <h1>Pagina Ghisee</h1>
    <div class="table-container">
        <button class="add-button" on:click={navigateToAddGhiseuPage}>Add New Ghiseu</button>
        <table>
            <thead>
                <tr>      
                    <th>Cod</th>    
                    <th>Denumire</th>
                    <th>Descriere</th>
                    <th>Activ</th>
                    <th>Actiuni</th> <!-- New column header -->
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
                                    <option value={`allBonByIdPage/${ghiseu.id}`}>Bonurile Ghiseului</option>
                                    <option value={`editGhiseuPage/${ghiseu.id}`}>Editeaza Ghiseu</option>
                                    <option value="delete">Sterge Ghiseu</option> <!-- New option for deletion -->
                                </select>
                         </td>
                    </tr>
                {/each}
            </tbody>
        </table>
    </div>
{/if}

<style>

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