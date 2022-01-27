<script lang="ts">
  import type { JobPipeModified } from '../../types';
  import { PlusIcon } from '@becomes/cms-ui/src/components/icons';

  export { className as class };
  export let jobPipe: JobPipeModified[];

  let className = '';

  function parseText(txt: string, type: 'err' | 'out') {
    return `
      <span${type === 'err' ? ' class="err"' : ''}>
        ${txt.replace(/ /g, '&nbsp;')}
      </span>
      <br />
    `;
  }
</script>

<div class="{className} pipe">
  {#each jobPipe as pipe}
    <div
      class="pipe--cmd pipe--cmd-{pipe.status === 'FAIL' && pipe.ignoreIfFail === true ? 'warning' : pipe.status.toLowerCase()}">
      <button
        class="title"
        on:click={() => {
          if (pipe.out || pipe.err) {
            pipe.show = pipe.show === true ? false : true;
          }
        }}
        disabled={!pipe.out && !pipe.err}>
        <PlusIcon
          class={`${pipe.show ? 'pipe--icon pipe--icon_show' : 'pipe--icon'} ${!pipe.out && !pipe.err ? 'pipe--icon_hidden' : ''}`} />
        <span class="pipe--title">{pipe.title} </span>
        <span class="pipe--execTime">{pipe.timeToExec}</span>
      </button>
      {#if pipe.show}
        <div class="output">
          {#if pipe.out !== ''}
            {@html pipe.out
              .split('\n')
              .map((txt) => parseText(txt, 'out'))
              .join('')}
          {/if}
          {#if pipe.err !== ''}
            {@html pipe.err
              .split('\n')
              .map((txt) => parseText(txt, 'err'))
              .join('')}
          {/if}
        </div>
      {/if}
    </div>
  {/each}
</div>
