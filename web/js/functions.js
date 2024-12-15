function set_cookie(cname, cvalue, exdays) {
    cvalue = encodeURI(cvalue)
    var d = new Date();
    d.setTime(d.getTime() + (exdays*24*60*60*1000));
    var expires = "expires="+ d.toUTCString();
    document.cookie = cname + "=" + cvalue + "; " + expires + "; path=/; samesite=strict;";
}

function get_cookie(cname) {
    var name = cname + "=";
    var decodedCookie = decodeURIComponent(document.cookie);
    var ca = decodedCookie.split(';');
    for(var i = 0; i <ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == ' '){
            c = c.substring(1);
        }

        if (c.indexOf(name) == 0) {
            return c.substring(name.length, c.length);
        }
    }
    return "";
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

function seconds_to_days(seconds, comma, function_setting) {
    var day = Math.floor(seconds / seconds_in_day);
    var rest = Math.floor(seconds % seconds_in_day);

    var hour = Math.floor(rest / seconds_in_hour);
    rest = Math.floor(rest % seconds_in_hour);

    var minute = Math.floor(rest / seconds_in_minute);
    rest = Math.floor(rest % seconds_in_minute);

    var day_string = '';
    var hour_string = '';
    var minute_string = '';

    if(day == 1) {
        day_string += day + ' ' + function_setting.wrapperr_day;
    } else {
        day_string += day + ' ' + function_setting.wrapperr_day_plural;
    }

    if(hour == 1) {
        hour_string += hour + ' ' + function_setting.wrapperr_hour;
    } else {
        hour_string += hour + ' ' + function_setting.wrapperr_hour_plural;
    }

    if(minute == 1) {
        minute_string += minute + ' ' + function_setting.wrapperr_minute;
    } else {
        minute_string += minute + ' ' + function_setting.wrapperr_minute_plural;;
    }

    if(hour >= 1) {
        if(minute >= 1) {
            if(comma) {
                return day_string + ', ' + hour_string + ', ' + minute_string;
            } else {
                return day_string + ', ' + hour_string + ' ' + function_setting.wrapperr_and + ' ' + minute_string;
            }
        } else {
            if(comma) {
                return day_string + ', ' + hour_string;
            } else {
                return day_string + ' ' + function_setting.wrapperr_and + ' ' + hour_string;
            }
        }
    } else {
        return day_string;
    }
}

function seconds_to_hours(seconds, comma, function_setting) {
    var hour = Math.floor(seconds / seconds_in_hour);
    var rest = Math.floor(seconds % seconds_in_hour);

    var minute = Math.floor(rest / seconds_in_minute);
    rest = Math.floor(rest % seconds_in_minute);

    var hour_string = '';
    var minute_string = '';

    if(hour == 1) {
        hour_string += hour + ' ' + function_setting.wrapperr_hour;
    } else {
        hour_string += hour + ' ' + function_setting.wrapperr_hour_plural;
    }

    if(minute == 1) {
        minute_string += minute + ' ' + function_setting.wrapperr_minute;
    } else {
        minute_string += minute + ' ' + function_setting.wrapperr_minute_plural;
    }

    if(minute >= 1) {
        if(comma) {
            return hour_string + ', ' + minute_string;
        } else {
            return hour_string + ' ' + function_setting.wrapperr_and + ' ' + minute_string;
        }
    } else {
        return hour_string;
    }
}

function seconds_to_minutes(seconds, comma, function_setting) {
    seconds = parseInt(seconds);

    var minute = Math.floor(seconds / seconds_in_minute);
    var rest = Math.floor(seconds % seconds_in_minute);

    var minute_string = '';
    var second_string = '';

    if(minute == 1) {
        minute_string += minute + ' ' + function_setting.wrapperr_minute;
    } else {
        minute_string += minute + ' ' + function_setting.wrapperr_minute_plural;
    }

    if(seconds == 1) {
        second_string += rest + ' ' + function_setting.wrapperr_second;
    } else {
        second_string += rest + ' ' + function_setting.wrapperr_second_plural;
    }
    
    if(rest >= 1) {
        if(comma) {
            return minute_string + ', ' + second_string;
        } else {
            return minute_string + ' ' + function_setting.wrapperr_and + ' ' + second_string;
        }
    } else {
        return minute_string;
    }
}

function seconds_to_seconds(seconds, function_setting) {
    var second_string = '';

    if(seconds == 1) {
        second_string += seconds + ' ' + function_setting.wrapperr_second;
    } else {
        second_string += seconds + ' ' + function_setting.wrapperr_second_plural;
    }

    return second_string;
}

function number_with_spaces(number) {

    if(isNaN(number)) {
        return number;
    }

    return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
}

function play_plays(plays) {
    plays = parseInt(plays);

    if(plays == 1) {
        var play_string = number_with_spaces(plays) + ' ' + functions.wrapperr_play;
    } else {
        var play_string = number_with_spaces(plays) + ' ' + functions.wrapperr_play_plural;
    }

    return play_string;
}

function pad_number(num, size) {
    num = num.toString();
    while (num.length < size) num = "0" + num;
    return num;
}