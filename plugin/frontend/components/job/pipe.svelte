<script lang="ts">
  import { escape } from 'html-escaper';
  import type { JobPipeModified } from '../../types';

  export { className as class };
  export let jobPipe: JobPipeModified[];

  let className = '';

  function parseText(txt: string, type: 'err' | 'out') {
    return `
      <span${type === 'err' ? ' class="err"' : ''}>
        ${escape(txt).replace(/ /g, '&nbsp;')}
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
          pipe.show = pipe.show === true ? false : true;
        }}>
        <p class="fas fa-{pipe.show ? 'minus' : 'plus'}" />
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
