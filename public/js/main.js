const socket = io();

$('#scrummaster').click(() => {
  $('#role-selection').hide();
  $('#sprint-meeting').show();
  $('#scrummaster-ui').show();
  socket.emit('join', { role: 'scrummaster' });
});

$('#developer').click(() => {
  $('#role-selection').hide();
  $('#sprint-meeting').show();
  $('#developer-ui').show();
  socket.emit('join', { role: 'developer' });
});

$('#send-question').click(() => {
  const question = $('#question').val();
  socket.emit('send-question', question);
});

$('#send-answer').click(() => {
  const answer = $('#answer').val();
  const name = $('#developer-name').val();
  socket.emit('send-answer', { answer, name });
});

$('#set-order').click(() => {
  const answers = $('#answer-list').html();
  socket.emit('set-order', answers);
});

socket.on('question', (question) => {
  $('#question-text').text(question);
});

socket.on('new-answer', ({ answer, name }) => {
  const li = $('<li>').text(`${name}: ${answer}`).attr('data-name', name);
  $('#answer-list').append(li);
});

socket.on('order', (order) => {
  $('#order-display').show();
  $('#order-list').html(order);
});

const answerList = $('#answer-list');
const sortable = new Sortable(answerList[0], {
  animation: 150,
  onUpdate: () => {
  },
});

$('#roulette').click(() => {
  socket.emit('start-roulette');
});

$('#scum-safe').click(() => {
  const name = $('#developer-name').val();
  socket.emit('check-status', name);
});

socket.on('roulette-started', (isActive) => {
  if (isActive) {
    $('#scum-safe').show();
  } else {
    $('#scum-safe').hide();
  }
});

socket.on('scum-status', (status) => {
  const statusAlert = $('#status-alert');
  const alertContent = statusAlert.find('.alert');
  if (status === 'scum') {
    alertContent.text('You are the SCRUM!').addClass('alert-danger');
  } else {
    alertContent.text('You are SAFE!').addClass('alert-success');
  }
  statusAlert.show();
  setTimeout(() => {
    statusAlert.hide();
    alertContent.removeClass('alert-danger alert-success');
  }, 3000);
});

document.addEventListener('DOMContentLoaded', function () {
  const themeCheckbox = document.getElementById('theme-checkbox');

  themeCheckbox.addEventListener('change', function () {
    document.body.classList.toggle('western-theme');
    document.body.classList.toggle('roulette-theme');
  });
});
