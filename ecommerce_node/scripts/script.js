$(".add_product").click(function(){
    var product = {
      'name': $('#name').val(),
      'price': $('#price').val(),
      'category': $('#category').val(),
      'company': $('#company').val(),
    }
    $.ajax({url: "/add-product",
      method :'POST', data : product,success: function(result){
      if(result)
      {
        location.replace('/')
      }
    }});
});


$(".delete").click(function(){
  var id = $(this).parent().find("span").text().trim()
    $.ajax({url: "/product/"+id,
      method :'Delete',success: function(result){
      if(result)
      {
        location.replace('/')
      }
    }});
})

var modal = document.getElementById("myModal");

var btn = document.getElementById("myBtn");

var span = document.getElementsByClassName("close")[0];

span.onclick = function() {
  modal.style.display = "none";
}

window.onclick = function(event) {
  if (event.target == modal) {
    modal.style.display = "none";
  }
}

$(".update").click(function(){
  var id = $(this).parent().find("span").text().trim()
    $.ajax({url: "/product/"+id,
      method :'get',success: function(result){
      if(result)
      {
        modal.style.display = "block";
        $('#id').val(result._id)
        $('#name').val(result.name)
        $('#price').val(result.price)
        $('#category').val(result.category)
        $('#company').val(result.company)
      }
    }});
})

$(".updateData").click(function(){
  var id =  $('#id').val().trim()
  var product = {
      'name': $('#name').val(),
      'price': $('#price').val(),
      'category': $('#category').val(),
      'company': $('#company').val(),
  }
    $.ajax({url: "/product/"+id,
      method :'put', data : product, success: function(result){
      if(result)
        {
          location.replace('/')
        }
    }});
})

