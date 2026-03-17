function loadAdminPage() {
    var html = `

        <div id="myModal" class="modal">
            <div class="modal-content">
                <span class="close" onclick="closeModal();">&times;</span>
                <div id="modal-content-real"></div>
            </div>
        </div>

        <div class="form-group newline">
            <button class="form-control btn" name="admin_menu_return_button" id="admin_menu_return_button" onclick="AdminPageRedirect();"><img src="${root}/assets/trash.svg" class="btn_logo"></img><p2 id="admin_menu_return_button_text">Return</p2></button>
        </div>

        <div class="form-group newline">
            <hr>
        </div>

        <div class="form-group newline">
            <button class="form-control btn" type="submit" name="tautulliSyncButton" id="tautulliSyncButton" onclick="syncTautulli();"><img src="${root}/assets/synchronize.svg" class="btn_logo"></img><p2 id="tautulliSyncButtonImage">Sync with Tautulli</p2></button>
        </div>

        <div class='form-group newline'>
            <h3>
                Wrapperr users
            </h3>
        </div>

        <div class="users-module" id="users-module">

        </div>
    `;

    document.getElementById("setup").innerHTML = html;
    getUsers();
}

function getUsers() {
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
        if (this.readyState == 4) {
			try {
                var result= JSON.parse(this.responseText);
            } catch(error) {
                alert('Failed to parse API response.');
                console.log('Failed to parse API response. Error: ' + this.responseText);
                return;
            }

            if(result.error) {
                alert(result.error);
            } else {
                placeUsers(result.data);
            }
        }
        
    };
    xhttp.withCredentials = true;
    xhttp.open("post", api_url + "get/users");
    xhttp.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
    xhttp.setRequestHeader("Authorization", cookie);
    xhttp.send();
    return;
}

function placeUsers(usersArray) {
    userModule = document.getElementById("users-module")

    userModule.innerHTML = `
        <div class="user-headers">
            <div class="user-header-short">ID</div>
            <div class="user-header">Username</div>
            <div class="user-header">Friendly name</div>
            <div class="user-header">Email</div>
            <div class="user-header-short">Active</div>
            <div class="user-header">Tautulli servers</div>
            <div class="user-header-short">Ignore user</div>
            <div class="user-header-short">History</div>
            <div class="user-header-short">View As User</div>
        </div>
    `;

    usersArray.forEach(user => {
        var historyDiv = "";
        if(user.wrappings.length > 0) {
            historyDiv = `
            <div class="user-logbutton">
                <button class="form-control btn" name="historyButton" id="historyButton" onclick="getHistory(${user.user_id});" style="width: 2em; height: 2em; padding: 0.25em;"><img src="${root}/assets/document.svg" class="btn_solo"></img><p2 id="historyButtonImage"></p2></button>
            </div>
            `;
        } else {
            historyDiv = `
            <div class="user-logbutton">
            </div>
            `;
        }

        var wrappedDiv = "";
        if(user.user_active) {
            wrappedDiv = `
            <div class="user-logbutton">
                <button class="form-control btn" name="wrappedButton" id="wrappedButton_${user.user_id}" onclick="viewUserWrapped(${user.user_id});" style="width: 2em; height: 2em; padding: 0.25em;" title="View Wrapped As User"><img src="${root}/assets/gift_icon.svg" class="btn_solo"></img><p2 id="wrappedButtonImage"></p2></button>
            </div>
            `;
        } else {
            wrappedDiv = `
            <div class="user-logbutton">
            </div>
            `;
        }

        var active_state_class = ""
        if(user.user_active) {
            active_state_class = "user-active-true"
        } else {
            active_state_class = "user-active-false"
        }

        var tautulliServersString = ""
        user.user_tautulli_servers.forEach(server => {
            tautulliServersString += `<div class="tautulli-server-badge" title="${server}">${server}</div>`
        });

        var ignoredUserString = ""
        if(user.user_ignore) {
            ignoredUserString = "checked"
        } 

        var html = `
            <div class="user-object">
                <div class="user-details">
                    <div class="user-userid">${user.user_id}</div>
                    <div class="user-username">${user.user_name}</div>
                    <div class="user-friendlyname">${user.user_friendly_name}</div>
                    <div class="user-email">${user.user_email}</div>
                    <div class="user-active">
                        <div class="${active_state_class}">
                            ${user.user_active}
                        </div>
                    </div>
                    <div class="user-tautulli-servers">${tautulliServersString}</div>
                    <div class="user-ignore">
                        <input style="margin: auto;" class="clickable" type="checkbox" id="ignore_user_check_${user.user_id}" name="ignore_user_check_${user.user_id}" onclick="toggleUserIgnore('${user.user_id}', ${user.user_ignore})" value="" ${ignoredUserString}>
                    </div>
                    ${historyDiv}
                    ${wrappedDiv}
                </div>
            </div>
        `;

        userModule.innerHTML += html;
    });
}

function getHistory(userId) {
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
        if (this.readyState == 4) {
			try {
                var result= JSON.parse(this.responseText);
            } catch(error) {
                alert('Failed to parse API response.');
                console.log('Failed to parse API response. Error: ' + this.responseText);
                return;
            }

            if(result.error) {
                alert(result.error);
            } else {
                placeHistory(result.data);
            }
        }
        
    };
    xhttp.withCredentials = true;
    xhttp.open("post", api_url + "get/users/" + userId);
    xhttp.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
    xhttp.setRequestHeader("Authorization", cookie);
    xhttp.send();
    return;
}

function placeHistory(userObject) {
    var modal = document.getElementById("myModal");
    var modalContent = document.getElementById("modal-content-real");
    modal.style.display = "block";

    userObject.wrappings.forEach(entry => {
        var date = new Date(entry.entry_date);
        var html = `
            <div class="user-history">
                <div class="user-history-date">${date}</div>
                <div class="user-history-ip">${entry.entry_ip}</div>
            </div>
        `;

        modalContent.innerHTML += html;
    });

}

function closeModal() {
    var modal = document.getElementById("myModal");
    var modalContent = document.getElementById("modal-content-real");
    modal.style.display = "none";
    modalContent.innerHTML = "";
}

function syncTautulli() {
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
        if (this.readyState == 4) {
			try {
                var result= JSON.parse(this.responseText);
            } catch(error) {
                alert('Failed to parse API response.');
                console.log('Failed to parse API response. Error: ' + this.responseText);
                return;
            }

            if(result.error) {
                alert(result.error);
            } else {
                placeUsers(result.data);
                alert(result.message)
            }
        }
        
    };
    xhttp.withCredentials = true;
    xhttp.open("post", api_url + "sync/users");
    xhttp.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
    xhttp.setRequestHeader("Authorization", cookie);
    xhttp.send();
    return;
}

function toggleUserIgnore(userId, currentIgnoreValue) {
    if(!confirm("Are you sure? The cache will be deleted for it to take effect.")) {
        return;
    }

    var ignoreValue = !currentIgnoreValue
    data_form = {
        "user_ignore": ignoreValue
    };

    var data_obj = JSON.stringify(data_form);

    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
        if (this.readyState == 4) {
			try {
                var result= JSON.parse(this.responseText);
            } catch(error) {
                alert('Failed to parse API response.');
                console.log('Failed to parse API response. Error: ' + this.responseText);
                return;
            }

            if(result.error) {
                document.getElementById("ignore_user_check_" + userId).checked = currentIgnoreValue;
                alert(result.error);
            }
        }
        
    };
    xhttp.withCredentials = true;
    xhttp.open("post", api_url + "get/users/" + userId + "/ignore");
    xhttp.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
    xhttp.setRequestHeader("Authorization", cookie);
    xhttp.send(data_obj);
    return;
}

function viewUserWrapped(userId) {
    // Fetch wrapped statistics first
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
        if (this.readyState == 4) {
            try {
                var result = JSON.parse(this.responseText);
            } catch(error) {
                alert('Failed to parse API response.');
                console.log('Failed to parse API response. Error: ' + this.responseText);
                return;
            }

            if(result.error) {
                alert(result.error);
            } else {
                // Store the wrapped data in sessionStorage with a unique key
                var dataKey = 'viewWrappedAsUser_' + Date.now() + '_' + userId;
                sessionStorage.setItem(dataKey, JSON.stringify(result));
                
                // Open frontpage in new window with the data key as query parameter
                var baseUrl = window.location.origin + (root || '');
                var wrappedUrl = baseUrl + '/?viewWrappedAsUser=' + dataKey;
                window.open(wrappedUrl, '_blank');
            }
        }
    };
    xhttp.withCredentials = true;
    xhttp.open("post", api_url + "get/users/" + userId + "/statistics");
    xhttp.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
    xhttp.setRequestHeader("Authorization", cookie);
    xhttp.send();
    return;
}