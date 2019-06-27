

<script>
    const tasks = []

</script>




<section class="tasks-list">
	{#each tasks as { id, name }, i}
		<div class="task">
            <button>
                
            </button>
        </div>
	{/each}
</section>
<section class="task-logs"></section>



<style>

    .tasks-list {
        height: calc(100% - 40px);
        width: 28%;
        position: relative;
    }

    .tasks-list::-webkit-scrollbar {
        width: 10px;
    }
    .tasks-list::-webkit-scrollbar-track {
        background: #f1f1f1; 
    }
    .tasks-list::-webkit-scrollbar-thumb {
        background: rgba(0, 0, 0, 0.15);
    }
    .tasks-list::-webkit-scrollbar-thumb:hover {
        background: rgba(0, 0, 0, 0.2); 
    }

    .task-logs {
        width: 72%;
        background: #1e1e1e;
        word-break: break-all;
        text-align: justify;
        height: calc(100% - 40px);
        color: #dedede;
        font-size: 13px;
        font-family: monospace;
        padding: 8px 0 27px 8px;
        position: relative;
        overflow-x: hidden;
    }
    .task-logs::-webkit-scrollbar {
        width: 10px;
    }
    .task-logs::-webkit-scrollbar-thumb {
        background: #f1f1f1;
    }
    .task-logs::-webkit-scrollbar-thumb:hover {
        background: rgb(220, 220, 220); 
    }


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
</style>