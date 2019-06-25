<script>
  import Header from './Header.svelte';
  import Taskbar from './Taskbar.svelte';
  import Logger from './Logger.svelte';

  export let name = 'asd'
</script>

<style>
  .wrapper {
    background-color: white;
  }
</style>

<div class="wrapper">
	<Header />
	<Taskbar />
	<Logger />
</div>