<script>
    import { tasks, tabs } from '../store'
    import TaskButton from './TaskButton.svelte'


    console.log('tasks.getTasksByTab(tabs.state.activeTab.name)', tasks.getTasksByTab(tabs.state.activeTab))
    $: activeTabTasks = tasks.getTasksByTab(tabs.state.activeTab)

</script>




<section class="tasks-list">
	{#each activeTabTasks as task, index}
		<TaskButton {task} {index}/>
	{/each}
</section>



<style>

    .tasks-list {
        height: calc(100% - 40px);
        width: 28%;
        position: relative;
        float: left;
        overflow-y: auto;
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

</style>