<script>
    export let checked = false;
    const toggle = () => {
        checked = !checked;
        dispatch('click');  // Explicitly dispatch the click event
    };

    import { createEventDispatcher } from 'svelte';
    const dispatch = createEventDispatcher();
</script>
  
  <!-- Change div to button -->
  <button type="button" class="checkbox" on:click={toggle} aria-pressed={checked}>
    {#if checked}
      <span class="checkmark">✔️</span>
    {:else}
      <span class="cross">❌</span>
    {/if}
  </button>
  
  <style>
    .checkbox {
      width: 30px;
      height: 30px;
      border: 2px solid #333;
      display: flex;
      justify-content: center;
      align-items: center;
      cursor: pointer;
      background: none;
      padding: 0;
    }
  
    .checkmark {
      font-size: 20px;
      color: green;
    }
  
    .cross {
      font-size: 20px;
      color: red;
    }
  </style>
  