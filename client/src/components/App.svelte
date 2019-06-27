<script>
  import Header from './Header.svelte'
  import Taskbar from './Taskbar.svelte'
  import Logger from './Logger.svelte'

  export let name = 'asd'
</script>

<div class="wrapper active-tab-procfile">
  <Header />
  <Taskbar />                                        
  <Logger />
</div>

<style>
  .wrapper {
    background: #f1f1f1;
    box-shadow: 0 0px 57px 1px rgba(0, 0, 0, 0.18), 0 2px 2px rgba(0, 0, 0, 0.1);
    height: 100%;
    margin-left: auto;
    margin-right: auto;
    max-width: 876px;
    position: relative;
  }
  .wrapper > section{
      float: left;
      overflow-y: auto;
  }
</style>