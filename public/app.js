//grab articles as json
$.getJSON('/articles', function(data){
  for (var i = 0; i<data.length; i++){
    $('#articles').append('<p data-id="' + data[i]._id + '">' + data[i].title + '<br />'+ '</p>' + '<a href=' +data[i].link + '>'+data[i].link + '</a>');
  }
});
//when a <p> tag is clicked
$(document).on('click', 'p', function(){
  var thisId = $(this).attr('data-id');
  //ajax call for article
  $.ajax({
    method: "GET",
    url: "/articles/" + thisId,
  })
  //add not info to page
  .done(function(data){
    console.log(data);
    //title
    $('#notes').append('<h4>' + data.title + '</h4>');
    //input for new title
    $('#notes').append('<input id="titleinput" name="title" >');
    //textarea to add new note body
    $('#notes').append('<textarea id="bodyinput" name="body"></textarea>');
    //button to submit new notes
    $('#notes').append('<button class="btn btn-primary" data-id="' + data._id + '" id="savenote">Save</button>');

    //if not in articles
    if(data.note){
      //place title in title input
      $('#titleinput').val(data.note.title);
      //place body in body textarea
      $('#bodyinput').val(data.note.body);
    }
  });
});

//on save note click
$(document).on('click', '#savenote', function(){
  //grab id associated with article from submitbtn
  var thisId = $(this).attr('data-id');

  //run post request to change note
  $.ajax({
    method: "POST",
    url: "/articles/" + thisId,
    data: {
      title: $('#titleinput').val(),
      body: $('#bodyinput').val()
    }
  }).done(function(data){
    console.log(data);
    $('#notes').empty();
  });
  $('#titleinput').val("");
  $('#bodyinput').val("");
});
