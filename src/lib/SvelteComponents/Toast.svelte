<script lang="ts">
    export let message: string = '';
    export let onClose: () => void;
    export let onConfirm: () => void;

    function handleClose() {
        onClose();
    }

    function handleConfirm() {
        onConfirm();
    }
</script>

<div class="toast">
    <p>{message}</p>
    <div class="buttons">
        <button class="close-button" on:click={handleClose}>Închide</button>
        <button class="confirm-button" on:click={handleConfirm}>Confirmă</button>
    </div>
</div>

<style>
    .toast {
        position: fixed;
        bottom: 20px;
        left: 50%;
        transform: translateX(-50%);
        background-color: #f8d7da;
        color: #721c24;
        padding: 16px;
        border-radius: 8px;
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
        width: 300px;
        text-align: center;
        z-index: 1000;
    }

    .buttons {
        display: flex;
        justify-content: space-between;
        margin-top: 10px;
    }

    .close-button {
        background-color: black;
        color: white;
        border: none;
        padding: 8px 16px;
        border-radius: 5px;
        cursor: pointer;
    }

    .confirm-button {
        background-color: #dc3545;
        color: white;
        border: none;
        padding: 8px 16px;
        border-radius: 5px;
        cursor: pointer;
    }
</style>