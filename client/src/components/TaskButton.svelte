<script>
  // import store from '../store'

  export let task
  export let index

  const charCode = 0
  // export let charCode

// TODO: replace task-num-1 class

  function handleClickOnTask(e) {
  	console.log(e)
  	// global.openTask
  	/*

    const task = this.taskList.getTask(id)
    if (task.id) {
      if (this.notificationsEnabled) this.taskList.setUpdated(id, false)
      this.taskList.setActive(task)
      this.updateTaskLogs(task)
    }

      */
  }

  function handleClickOnRunButton(e) {
  	e.stopPropagation()
  	// global.runTask
  
  	/*

    const task = this.taskList.getTask(id)
    if (!task.isLaunching && !task.isRun) {
      this.taskList.setActive(task, true)
      this.updateTaskLogs(task)
      kinka.post('/run/' + task.id)
    }

    */
  }

  function handleClickOnStopButton(e) {
  	e.stopPropagation()
  	// global.runTask
  
  	/*

    const task = this.taskList.getTask(id)
    if (!task.isLaunching && task.isRun) {
      this.taskList.updateTask(task.id, false, task.isActive, false, true)
      kinka.post('/stop/' + task.id)
    }

    */
  }
</script>



<div
  class="task {task.isRun && 'running'} {task.isLaunching && 'clicked'} {task.isActive && 'active'}"
  id={task.id}
  on:click={handleClickOnTask}
  char-code={charCode}
>
  <i class="fas fa-cog"></i>
  <span class="task-name">{task.name}</span>
  <button
    on:click={handleClickOnRunButton}
    class="run-task">
    <i class="fas fa-play"></i>
  </button>
  <button
    on:click={handleClickOnStopButton} class="stop-task">
    <i class="fas fa-stop"></i>
  </button>
</div>



<style type="text/scss">



  .task {
      padding: 0 0 0 9px;
      background: rgba(119, 119, 119, 0.05);
      color: #7b7b7b;
      cursor: pointer;
      display: flex;
      position: relative;
      transition: all 250ms ease;
      z-index: 0;
  }

  .task > button{
      border: none;
      background: none;
      cursor: pointer;
      height: 42px;
      font-size: 15px;
      width: 32px;
      position: absolute;
      left: -32px;
      transition: left 69ms linear;
  }

  .task:before {
      content: '';
      position: absolute;
      left: 0;
      top: 0;
      width: 32px;
      height: 100%;
      background: transparent;
      z-index: 0;
      opacity: .9;
  }
  .task > .stop-task {
      display: none;
      color: #a93333;
      background: #f38f8f;
    }
  .task > .run-task {
      color: rgb(9, 101, 25);
      background: rgb(129, 211, 144);
  }
  .task.active {
      color: #1d1d1d;
      box-shadow: 0px 1px 5px rgba(0, 0, 0, 0.55);
      background: rgb(241, 241, 241);
      z-index: 2;
  }
  .task.updated {
      animation: highlight cubic-bezier(0.22, 0.61, 0.36, 1) .7s infinite;
  }


  .task i.fa-cog{
      display:inline-block;
      height: 24px;
      position: relative;
      left: -5px;
      font-size: 24px;
      top: 8px;
      /* padding: 9px 0; */
      color: rgba(80, 80, 80, 0);
  }

  .task.running .run-task, .task.clicked .run-task, .task.clicked .stop-task, .task.stopping .run-task, .task.stopping .stop-task {
      display: none;
  }

  .task.running .stop-task {
      display: block;
  }

  .task.running:before {
      background: #75d085;
  }

  .task.clicked:before,.task.stopping:before {
      background: #bdbdbd;
  }
  .task.clicked i.fa-cog:before,.task.stopping i.fa-cog:before {
      content: "\F110" !important;
  }

  .task.running i.fa-cog, .task.clicked i.fa-cog {
      -webkit-animation: spin 4s linear infinite;
      -moz-animation: spin 4s linear infinite;
      animation: spin 4s linear infinite;
  }
  .task.stopping i.fa-cog {
      -webkit-animation: spin 2s linear reverse infinite;
      -moz-animation: spin 2s linear reverse infinite;
      animation: spin 2s linear reverse infinite;
  }
  .task.running i.fa-cog{
      color: #096519;
  }
  .task.clicked i.fa-cog{
      color: #5c9aad;
  }
  .task.stopping i.fa-cog{
      color: #d45a5a;
  }

  .task > span {
      user-select: none;
      padding: 9px 0;
      transition: transform 199ms cubic-bezier(0.18, 0.89, 0.32, 1.28) !important;
  }
  .task:hover button {
      transition: left 199ms cubic-bezier(0.18, 0.89, 0.32, 1.28) !important;
      left: 0;
  }

  .task:hover {
      box-shadow: 0px 1px 5px rgba(0, 0, 0, 0.35);
      background: rgba(241, 241, 241, 0.91);
      z-index: 1;
  }

  .task:hover:before {
      opacity: .3;
  }

  .task:not(:hover) > span {
      transform: translateX(-27px);
  }

  .task.running > span, .task.clicked > span, .task.stopping > span {
      transform: translateX(6px);
  }
  /* .task.active:not(.running):before {
      background: transparent;
  } */
  .task.clicked:before,.task.stopping:before {
      opacity: 1;
  }
  .task.clicked:before{
      background: #94d6ea !important;
  }
  .task.stopping:before{
      background: #ea9494 !important;
  }
  .task.clicked i.fa-cog {
      animation-duration: 1s;
  }

  .task:hover > span {
      transform: translateX(6px);
  }

  @-moz-keyframes spin { 100% { -moz-transform: rotate(360deg); } }
  @-webkit-keyframes spin { 100% { -webkit-transform: rotate(360deg); } }
  @keyframes spin { 100% { -webkit-transform: rotate(360deg); transform:rotate(360deg); } }

  @keyframes highlight{
    50%{
        background: rgb(255, 247, 204);
    }
  }
</style>