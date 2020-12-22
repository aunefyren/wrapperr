function search_button(string) {
    $('#search_get').html(string);
}

function time_days(seconds_input) {
    var seconds = Number(seconds_input);
    var days = seconds * 1.15741E-5;

    var hours = String(days).split(".");
    var hours_str = "0." + hours[1];
    var hours_int = Number(hours_str) * 24.0;

    var minutes = String(hours_int).split(".");
    var minutes_str = "0." + minutes[1];
    var minutes_int = Number(minutes_str) * 60.0;

    var days_form = String(days).split(".");
    var hours_form = String(hours_int).split(".");
    var minutes_form = String(minutes_int).split(".");

    var final = [Number(days_form[0]), Number(hours_form[0]), Number(minutes_form[0])];
    return final;
}

function time_hours(seconds_input) {
    var seconds = Number(seconds_input);
    var hours_int = Number(seconds) * 0.0002777778;

    var minutes = String(hours_int).split(".");
    var minutes_str = "0." + minutes[1];
    var minutes_int = Number(minutes_str) * 60.0;

    var hours_form = String(hours_int).split(".");
    var minutes_form = String(minutes_int).split(".");

    var final = [Number(hours_form[0]), Number(minutes_form[0])];
    return final;
}

function makeRequest (method, url, data) {
    return new Promise(function (resolve, reject) {
    var xhr = new XMLHttpRequest();
    xhr.open(method, url);
    xhr.onload = function () {
      if (this.status >= 200 && this.status < 300) {
        resolve(xhr.response);
      } else {
        reject({
          status: this.status,
          statusText: xhr.statusText
        });
      }
    };
    xhr.onerror = function () {
      reject({
        status: this.status,
        statusText: xhr.statusText
      });
    };
    if(method=="POST" && data){
        xhr.send(data);
    }else{
        xhr.send();
    }
    });
}

$(document).on('submit', '#stats_form', function(){

    search_button("SEARCHING...");

    $.getScript("get_stats.js", function(){
    });

});
