<script lang="ts">
  import { createEventDispatcher } from 'svelte';

  const dispatch = createEventDispatcher();
  const items = [
    {
      name: 'Builds',
      value: 'builds',
    },
    {
      name: 'Projects',
      value: 'projects',
    },
  ];
  let selected = 'builds';
</script>

<div class="manager-layout--side-menu">
  <h3>BNGINE</h3>
  <div class="items">
    {#each items as item}
      <button
        class="item {item.value === selected ? 'selected' : ''}"
        style="width: 100%;"
        disabled={item.value === selected}
        on:click={() => {
          selected = item.value;
          dispatch('select', item.value);
        }}>
        <div class="fa fa-arrow-right icon" />
        <div class="name">{item.name}</div>
      </button>
    {/each}
  </div>
</div>
