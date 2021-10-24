function search_button(string) {
    $('#search_get').html(string);
}

$(document).on('submit', '#stats_form', function(){

    search_button("SEARCHING...");
    document.getElementById('results_error').innerHTML = "";
    get_functions();

});
