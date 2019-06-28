<script>
  const projectName = 'flamebird'
  const appVersion = 'asdasd'
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
    <button class="main-button toggle color" onclick="global.switchTheme()">
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
    </button>
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
</style>