<script>
  import { app, tabs } from '../store'
  $: projectName = 'flamebird'
  $: appVersion = 'asdasd'

  const noop = e => { console.log(e) }

  const actions = [
  	{ className: 'color', isToggle: true, icon: 'adjust', onClick: noop, label: 'theme' },
  	{ className: 'resize', isToggle: true, icon: 'expand-arrows-alt', onClick: noop, label: 'fullscreen' },
  	{ className: 'notifications', isToggle: true, icon: 'exclamation', onClick: noop, label: 'notifications' },
  	{ className: 'hot-keys', isToggle: true, icon: 'keyboard', onClick: noop, label: 'hotkeys' },
  	{ className: 'run', onClick: noop, label: 'run all' },
  	{ className: 'stop', onClick: noop, label: 'stop all' },
  ]
</script>

<header>
  <span class="title">
    {projectName}
    {#if appVersion}
      <span class="project-version">{appVersion}</span>
    {/if} 
  </span>  
  <img src="logo2_small.png" alt="flamebird" class="logo" />
  <div class="main-buttons">
    {#each actions as { icon, label, isToggle, className, onClick }}
      <button class="main-button {isToggle && 'toggle'} {className}" on:click={onClick}>
        {#if icon} <i class="fas fa-{icon}" /> {/if}
        <span>{ label }</span>
      </button>
    {/each}
    <!-- <button class="main-button toggle color" onclick="global.switchTheme()">
      <i class="fas fa-adjust" />
      <span>theme</span>
    </button>
    <button class="main-button toggle resize" onclick="global.toggleResize()">
      <i class="fas fa-expand-arrows-alt" />
      <span>fullscreen</span>
    </button>
    <button class="main-button toggle notifications" onclick="global.toggleNotifications()">
      <i class="fas fa-exclamation" />
      <span>notifications</span>
    </button>
    <button class="main-button toggle hot-keys" onclick="global.toggleHotKeys()">
      <i class="far fa-keyboard" />   
      <span>hotkeys</span>
    </button>
    <button class="main-button run" onclick="global.runAllTasks()">
      <span>run all</span>
    </button>
    <button class="main-button stop" onclick="global.stopAllTasks()">
      <span>stop all</span>
    </button> -->
  </div>
  <span class="tabs">
    <button class="tab" id="npm" onclick="global.handleClickTab('npm')">npm</button>
    <button class="tab active" id="procfile" onclick="global.handleClickTab('procfile')">procfile</button>
  </span>
</header>


<style>
  header {
      background: #f1f1f1;
      box-shadow: 0 2px 2px rgba(0, 0, 0, 0.09);
      color: rgb(99, 99, 99);
      display: flex;
      font-size: 18px;
      font-weight: 900;
      justify-content: space-between;
      position: relative;
      width: 100%;
      z-index: 5;
  }
  .logo{
      position: absolute;
      width: 40px;
      z-index: -1;
      left: -27px;
      top: 2px;
      padding: 0;
      filter: hue-rotate(-26deg);
      transform: rotate(-8deg);
  }
  .title {
      color: #1d1d1d;
      font-weight: 500;
      padding-left: 6px;
      background: #f1f1f1;
  }
  
  .project-version {
      color: #888888;
      margin-left: 5px;
      font-size: 12px;
      pointer-events: none;
  }
 

  .main-buttons {
      padding: 0;
      display: flex;
      overflow: hidden;
      padding-left: 43px;
  }


  .main-button{
      border: 0;
      color: #f1f1f1;
      font-size: 15px;
      cursor: pointer;
      padding: 1px 20px;
      min-width: 88px;
      line-height: 1;
  }
  
  .main-button.toggle {
      margin: auto 5px;
      border-radius: 25px;
      background: #d8d8d8;
      color: #5d5d5d;
      padding: 2px 15px;
  }

  .main-button.toggle.hot-keys {
      margin-right: 60px;
  }

  .main-button.toggle.active {
      background: #2eb97a;
      color: #dbffef;
  }

  .main-button:not(.toggle){
      margin: 0 0 0 -20px;
      overflow:hidden;
      position:relative;
      -webkit-transform: skew(-20deg);
      -moz-transform: skew(-20deg);
      -o-transform: skew(-20deg);
      transform: skew(-20deg);
  }

  .main-button:not(.toggle) > span {
      -webkit-transform: skew(20deg);
      -moz-transform: skew(20deg);
      -o-transform: skew(20deg);
      transform: skew(20deg);
      position: relative;
      display: block;
  }
</style>