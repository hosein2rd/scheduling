$(document).ready(() => {
  const exportBtn = $('#exportBtn')
  $(exportBtn).click((e) => {
    e.preventDefault()
    $('table').tableExport();
  })
}) 