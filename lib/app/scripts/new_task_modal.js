/* global axios */
window.newTaskModal = (function() {
  var modal
  var isShow = false

  function clearForm(returnForm) {
    var nameInput = document.querySelector('input[name="name"]')
    var commandTextarea = document.querySelector('textarea[name="command"]')
    if (returnForm) {
      var form = { name: nameInput.value, command: commandTextarea.value }
    }
    nameInput.value = ''
    commandTextarea.value = ''
    return form
  }

  function show(show) {
    if (isShow === show) return
    if (show) {
      modal.classList.add('show')
    } else {
      modal.classList.remove('show')
      clearForm()
    }
    isShow = show
  }

  function triggerModal() {
    var e = window.event
    e.preventDefault()
    if (e.target.classList.contains('new-task')) {
      show(!modal.classList.contains('show'))
    }
  }

  function addNewTask() {
    modal.classList.add('loading')
    axios.post('/new-task', clearForm(true)).then(function(response) {
      global.getTaskList().addTask(response.data)
      modal.classList.remove('loading')
      show(false)
    })
  }

  modal = document.querySelector('.new-task')
  return {
    addNewTask: addNewTask,
    show: show,
    triggerModal: triggerModal,
  }
})()
