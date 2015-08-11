function time_fixup() {
  $('time').each(function(){
    var datetime = new XDate($(this).attr('datetime'))
    var formatted = datetime.toString($(this).attr('data-format'))
    $(this).html(formatted)
  })
}

function gauge_go() {
  var today = new Date()
  var midnight = new Date(today.getFullYear(), today.getMonth(), today.getDate())
  var seconds_elapsed = (new Date() - midnight)/1000
  var day_left = 24 - (seconds_elapsed/60/60)
  var endurance = (day_left / 24)*100
  var g1 = new JustGage({
      id: "gauge1",
      value: endurance.toFixed(0),
      min: 0,
      max: 100,
      title: "Endurance"
     });
  var g2 = new JustGage({
      id: "gauge2",
      value: 67,
      min: 0,
      max: 100,
      title: "Food"
     });
  var g3 = new JustGage({
      id: "gauge3",
      value: 51,
      min: 0,
      max: 100,
      title: "Money"
     });
}
