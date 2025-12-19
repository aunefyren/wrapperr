function loadAdminPage() {
    topFunction();

    var html = '<div class="form-group newline">';
    html += `<button class="form-control btn" name="admin_menu_return_button" id="admin_menu_return_button" onclick="AdminPageRedirect();"><img src="${root}/assets/trash.svg" class="btn_logo"></img><p2 id="admin_menu_return_button_text">Return</p2></button>`;
    html += '</div>';

    html += '<div class="form-group newline">';
    html += '<hr>';
    html += '</div>';

    html += '<form id="wrapperr_customization_form" onsubmit="return false;">'

    html += '<div class="form-group">';
    html += '<label for="stats_order_by_plays" title="Whether top lists can be ordered by plays.">Order lists by plays:<br>';
    html += '<input type="checkbox" class="form-control" id="stats_order_by_plays" ';
    if(stats_order_by_plays) {
        html += 'checked="' + stats_order_by_plays + '" ';
    }
    html += '/><br>';
    html += '</div>';

    html += '<div class="form-group">';
    html += '<label for="stats_order_by_duration" title="Whether top lists can be ordered by duration. Automatically enabled if Wrapperr can\'t order by plays.">Order lists by duration:<br>';
    html += '<input type="checkbox" class="form-control" id="stats_order_by_duration" ';
    if(stats_order_by_duration) {
        html += 'checked="' + stats_order_by_duration + '" ';
    }
    html += '/><br>';
    html += '</div>';

    html += '<div class="form-group newline">';
    html += '<hr>';
    html += '</div>';

    html += '<div class="form-group">';
    html += '<label for="stats_top_list_length" title="Use 0 for no limit.">Maximum length of top lists:<br>';
    html += '<input type="number" class="form-control" id="stats_top_list_length" value="' + stats_top_list_length + '" autocomplete="off" placeholder="" required /><br>';
    html += '</div>';

    html += '<div class="form-group">';
    html += '<label for="enable_posters" title="Display movie and TV show posters in statistics. Posters are downloaded from Tautulli and cached locally.">Enable Posters:<br>';
    html += '<input type="checkbox" class="form-control" id="enable_posters" ';
    if(enable_posters) {
        html += 'checked="' + enable_posters + '" ';
    }
    html += '/><br>';
    html += '</div>';

    html += '<div class="form-group">';
    html += '<label for="poster_cache_max_age_days" title="Maximum age in days before posters are re-downloaded. Default: 30 days.">Poster Cache Age (days):<br>';
    html += '<input type="number" class="form-control" id="poster_cache_max_age_days" value="' + poster_cache_max_age_days + '" min="1" max="365" autocomplete="off" placeholder="30" required /><br>';
    html += '</div>';

    html += '<div class="form-group">';
    html += '<label for="obfuscate_other_users" title="Replace other\'s username with randomly generated names.">Obfuscate other usernames:<br>';
    html += '<input type="checkbox" class="form-control" id="obfuscate_other_users" ';
    if(obfuscate_other_users) {
        html += 'checked="' + obfuscate_other_users + '" ';
    }
    html += '/><br>';
    html += '</div>';

    html += '<div class="form-group newline">';
    html += '<hr>';
    html += '</div>';

    html += '<div class="form-group newline">';
    html += '<div class="warning">!<br>You can use string variables within the custom text.<br><a style="text-decoration: underline; cursor: pointer;" href="https://github.com/aunefyren/wrapperr/wiki/Wrapperr-customization" target="_blank">Read more here</a>.</div>';
    html += '</div>';

    html += '<div class="form-group newline">';
    html += '<hr>';
    html += '</div>';

    html += '<div class="form-group">';
    html += '<label for="wrapperr_front_page_title" title="Introduction title that is shown on top of the front page.">Introduction title for the front page:<br>';
    html += '<textarea cols="40" rows="5" class="form-control" style="overflow-x: hidden;resize:vertical;min-height: 5em;" id="wrapperr_front_page_title" name="wrapperr_front_page_title" value="" autocomplete="off"></textarea></label>';
    html += '</div>';

    html += '<div class="form-group">';
    html += '<label for="wrapperr_front_page_subtitle" title="Introduction subtitle text that is shown on the front page.">Introduction subtitle for the front page:<br>';
    html += '<textarea cols="40" rows="5" class="form-control" style="overflow-x: hidden;resize:vertical;min-height: 5em;" id="wrapperr_front_page_subtitle" name="wrapperr_front_page_subtitle" value="" autocomplete="off"></textarea></label>';
    html += '</div>';

    html += '<div class="form-group">';
    html += '<label for="wrapperr_front_page_search_title" title="Introduction title that is shown when searching for a user.">Search title when searching (Non Plex-Auth):<br>';
    html += '<textarea cols="40" rows="5" class="form-control" style="overflow-x: hidden;resize:vertical;min-height: 5em;" id="wrapperr_front_page_search_title" name="wrapperr_front_page_search_title" value="" autocomplete="off"></textarea></label>';
    html += '</div>';

    html += '<div class="form-group newline">';
    html += '<hr>';
    html += '</div>';

    html += '<div class="form-group">';
    html += '<label for="stats_intro_title" title="Introduction title that is shown when the statistics are done loading.">Introduction title for statistics page:<br>';
    html += '<textarea cols="40" rows="5" class="form-control" style="overflow-x: hidden;resize:vertical;min-height: 5em;" id="stats_intro_title" name="stats_intro_title" value="" autocomplete="off"></textarea></label>';
    html += '</div>';

    html += '<div class="form-group">';
    html += '<label for="stats_intro_subtitle" title="Introduction subtitle text that is shown when the statistics are done loading. Could be used to inform about chosen timeframe.">Introduction subtitle for statistics page:<br>';
    html += '<textarea cols="40" rows="5" class="form-control" style="overflow-x: hidden;resize:vertical;min-height: 5em;" id="stats_intro_subtitle" name="stats_intro_subtitle" value="" autocomplete="off"></textarea></label>';
    html += '</div>';

    html += '<div class="form-group newline">';
    html += '<hr>';
    html += '</div>';

    html += '<div class="form-group newline">';
    html += '<label for="get_user_movie_stats" title="Includes movie statistics in your wrapped period.">Get users movie statistics:<br>';
    html += '<input type="checkbox" class="form-control" id="get_user_movie_stats" ';
    if(get_user_movie_stats) {
        html += 'checked="' + get_user_movie_stats + '" ';
    }
    html += '/><br>';
    html += '</div>';

    html += '<div class="form_hidden" id="get_user_movie_stats_custom">';

        html += '<div class="form_block" id="plural">';
        
            html += '<div class="form-group">';
            html += '<label for="get_user_movie_stats_title" title="Title on top of this section.">Movies title:<br>';
            html += '<textarea cols="40" rows="2" class="form-control" style="overflow-x: hidden;resize:vertical;min-height: 2em;" id="get_user_movie_stats_title" name="get_user_movie_stats_title" value="" autocomplete="off"></textarea></label>';
            html += '</div>';

            html += '<div class="form-group">';
            html += '<label for="get_user_movie_stats_subtitle" title="Subtitle underneath title on top of this section.">Movies subtitle:<br>';
            html += '<textarea cols="40" rows="2" class="form-control" style="overflow-x: hidden;resize:vertical;min-height: 2em;" id="get_user_movie_stats_subtitle" name="get_user_movie_stats_subtitle" value="" autocomplete="off"></textarea></label>';
            html += '</div>';

            html += '<div class="form-group">';
            html += '<label for="get_user_movie_stats_subsubtitle" title="Sub-subtitle underneath subtitle on top of this section.">Movies sub-subtitle:<br>';
            html += '<textarea cols="40" rows="2" class="form-control" style="overflow-x: hidden;resize:vertical;min-height: 2em;" id="get_user_movie_stats_subsubtitle" name="get_user_movie_stats_subsubtitle" value="" autocomplete="off"></textarea></label>';
            html += '</div>';
        
        html += '</div>';

        html += '<div class="form_block" id="singular">';

            html += '<div class="form-group" id="singular">';
            html += '<label for="get_user_movie_stats_subtitle_one" title="Subtitle underneath title on top of this section.">Movies subtitle for one movie:<br>';
            html += '<textarea cols="40" rows="2" class="form-control" style="overflow-x: hidden;resize:vertical;min-height: 2em;" id="get_user_movie_stats_subtitle_one" name="get_user_movie_stats_subtitle_one" value="" autocomplete="off"></textarea></label>';
            html += '</div>';

            html += '<div class="form-group">';
            html += '<label for="get_user_movie_stats_subsubtitle_one" title="Sub-subtitle underneath subtitle on top of this section.">Movies sub-subtitle for one movie:<br>';
            html += '<textarea cols="40" rows="2" class="form-control" style="overflow-x: hidden;resize:vertical;min-height: 2em;" id="get_user_movie_stats_subsubtitle_one" name="get_user_movie_stats_subsubtitle_one" value="" autocomplete="off"></textarea></label>';
            html += '</div>';

        html += '</div>';

        html += '<div class="form_block" id="none">';

            html += '<div class="form-group">';
            html += '<label for="get_user_movie_stats_subtitle_none" title="Subtitle underneath title on top of this section.">Movies subtitle for no movies:<br>';
            html += '<textarea cols="40" rows="2" class="form-control" style="overflow-x: hidden;resize:vertical;min-height: 2em;" id="get_user_movie_stats_subtitle_none" name="get_user_movie_stats_subtitle_none" value="" autocomplete="off"></textarea></label>';
            html += '</div>';

            html += '<div class="form-group">';
            html += '<label for="get_user_movie_stats_subsubtitle_none" title="Sub-subtitle underneath subtitle on top of this section.">Movies sub-subtitle for no movies:<br>';
            html += '<textarea cols="40" rows="2" class="form-control" style="overflow-x: hidden;resize:vertical;min-height: 2em;" id="get_user_movie_stats_subsubtitle_none" name="get_user_movie_stats_subsubtitle_none" value="" autocomplete="off"></textarea></label>';
            html += '</div>';

        html += '</div>';

        html += '<div class="form_block">';
        
            html += '<div class="form-group">';
            html += '<label for="get_user_movie_stats_top_movie" title="Custom title of the list of top movies (singular).">Title of top movie list:<br>';
            html += '<input type="text" class="form-control" id="get_user_movie_stats_top_movie" value="' + get_user_movie_stats_top_movie + '" autocomplete="off" placeholder="" required /><br>';
            html += '</div>';

            html += '<div class="form-group">';
            html += '<label for="get_user_movie_stats_top_movie_plural" title="Custom title of the list of top movies (plural).">Title of top movies list:<br>';
            html += '<input type="text" class="form-control" id="get_user_movie_stats_top_movie_plural" value="' + get_user_movie_stats_top_movie_plural + '" autocomplete="off" placeholder="" required /><br>';
            html += '</div>';
        
        html += '</div>';

        html += '<div class="form_block">';
        
            html += '<div class="form-group">';
            html += '<label for="get_user_movie_stats_movie_completion_title" title="Title stating the completion of the seen movie.">Movie completion title:<br>';
            html += '<textarea cols="40" rows="2" class="form-control" style="overflow-x: hidden;resize:vertical;min-height: 2em;" id="get_user_movie_stats_movie_completion_title" name="get_user_movie_stats_movie_completion_title" value="" autocomplete="off"></textarea></label>';
            html += '</div>';

            html += '<div class="form-group">';
            html += '<label for="get_user_movie_stats_movie_completion_title_plural" title="Title stating the average completion of the seen movies.">Movies average completion title:<br>';
            html += '<textarea cols="40" rows="2" class="form-control" style="overflow-x: hidden;resize:vertical;min-height: 2em;" id="get_user_movie_stats_movie_completion_title_plural" name="get_user_movie_stats_movie_completion_title_plural" value="" autocomplete="off"></textarea></label>';
            html += '</div>';

            html += '<div class="form-group">';
            html += '<label for="get_user_movie_stats_movie_completion_subtitle" title="Subtitle underneath the movie-completion title.">Movies/movie completion subtitle:<br>';
            html += '<textarea cols="40" rows="2" class="form-control" style="overflow-x: hidden;resize:vertical;min-height: 2em;" id="get_user_movie_stats_movie_completion_subtitle" name="get_user_movie_stats_movie_completion_subtitle" value="" autocomplete="off"></textarea></label>';
            html += '</div>';
        
        html += '</div>';

        html += '<div class="form_block" id="plural">';
        
            html += '<div class="form-group">';
            html += '<label for="get_user_movie_stats_pause_title" title="Title of the paused movie section.">Movie paused title:<br>';
            html += '<textarea cols="40" rows="2" class="form-control" style="overflow-x: hidden;resize:vertical;min-height: 2em;" id="get_user_movie_stats_pause_title" name="get_user_movie_stats_pause_title" value="" autocomplete="off"></textarea></label>';
            html += '</div>';

            html += '<div class="form-group">';
            html += '<label for="get_user_movie_stats_pause_subtitle" title="Subtitle of the paused movie section.">Movie paused subtitle:<br>';
            html += '<textarea cols="40" rows="2" class="form-control" style="overflow-x: hidden;resize:vertical;min-height: 2em;" id="get_user_movie_stats_pause_subtitle" name="get_user_movie_stats_pause_subtitle" value="" autocomplete="off"></textarea></label>';
            html += '</div>';

        html += '</div>';
        
        html += '<div class="form_block" id="singular">';
        
            html += '<div class="form-group">';
            html += '<label for="get_user_movie_stats_pause_title_one" title="Title of the paused movie section when one movie was watched, but still paused.">One movie paused title:<br>';
            html += '<textarea cols="40" rows="2" class="form-control" style="overflow-x: hidden;resize:vertical;min-height: 2em;" id="get_user_movie_stats_pause_title_one" name="get_user_movie_stats_pause_title_one" value="" autocomplete="off"></textarea></label>';
            html += '</div>';

            html += '<div class="form-group">';
            html += '<label for="get_user_movie_stats_pause_subtitle_one" title="Subtitle of the paused movie section when one movie was watched, but still paused paused.">One movie paused subtitle:<br>';
            html += '<textarea cols="40" rows="2" class="form-control" style="overflow-x: hidden;resize:vertical;min-height: 2em;" id="get_user_movie_stats_pause_subtitle_one" name="get_user_movie_stats_pause_subtitle_one" value="" autocomplete="off"></textarea></label>';
            html += '</div>';
        
        html += '</div>';

        html += '<div class="form_block" id="none">';
        
            html += '<div class="form-group">';
            html += '<label for="get_user_movie_stats_pause_title_none" title="Title of the paused movie section when no movies were ever paused.">No movie paused title:<br>';
            html += '<textarea cols="40" rows="2" class="form-control" style="overflow-x: hidden;resize:vertical;min-height: 2em;" id="get_user_movie_stats_pause_title_none" name="get_user_movie_stats_pause_title_none" value="" autocomplete="off"></textarea></label>';
            html += '</div>';

            html += '<div class="form-group">';
            html += '<label for="get_user_movie_stats_pause_subtitle_none" title="Subtitle of the paused movie section when no movies were ever paused.">No movie paused subtitle:<br>';
            html += '<textarea cols="40" rows="2" class="form-control" style="overflow-x: hidden;resize:vertical;min-height: 2em;" id="get_user_movie_stats_pause_subtitle_none" name="get_user_movie_stats_pause_subtitle_none" value="" autocomplete="off"></textarea></label>';
            html += '</div>';
        
        html += '</div>';

        html += '<div class="form_block">';
        
            html += '<div class="form-group">';
            html += '<label for="get_user_movie_stats_oldest_title" title="Title of the oldest movie section.">Movie oldest title:<br>';
            html += '<textarea cols="40" rows="2" class="form-control" style="overflow-x: hidden;resize:vertical;min-height: 2em;" id="get_user_movie_stats_oldest_title" name="get_user_movie_stats_oldest_title" value="" autocomplete="off"></textarea></label>';
            html += '</div>';

            html += '<div class="form-group">';
            html += '<label for="get_user_movie_stats_oldest_subtitle" title="Subtitle of the oldest movie section. Applied if the other specific ones are not applicable.">Movie oldest subtitle:<br>';
            html += '<textarea cols="40" rows="2" class="form-control" style="overflow-x: hidden;resize:vertical;min-height: 2em;" id="get_user_movie_stats_oldest_subtitle" name="get_user_movie_stats_oldest_subtitle" value="" autocomplete="off"></textarea></label>';
            html += '</div>';

            html += '<div class="form-group">';
            html += '<label for="get_user_movie_stats_oldest_subtitle_pre_1950" title="Subtitle of the oldest movie section. Applied if movie is older than 1950.">Movie oldest subtitle (<1950):<br>';
            html += '<textarea cols="40" rows="2" class="form-control" style="overflow-x: hidden;resize:vertical;min-height: 2em;" id="get_user_movie_stats_oldest_subtitle_pre_1950" name="get_user_movie_stats_oldest_subtitle_pre_1950" value="" autocomplete="off"></textarea></label>';
            html += '</div>';

            html += '<div class="form-group">';
            html += '<label for="get_user_movie_stats_oldest_subtitle_pre_1975" title="Subtitle of the oldest movie section. Applied if movie is older than 1975.">Movie oldest subtitle (<1975):<br>';
            html += '<textarea cols="40" rows="2" class="form-control" style="overflow-x: hidden;resize:vertical;min-height: 2em;" id="get_user_movie_stats_oldest_subtitle_pre_1975" name="get_user_movie_stats_oldest_subtitle_pre_1975" value="" autocomplete="off"></textarea></label>';
            html += '</div>';

            html += '<div class="form-group">';
            html += '<label for="get_user_movie_stats_oldest_subtitle_pre_2000" title="Subtitle of the oldest movie section. Applied if movie is older than 2000.">Movie oldest subtitle (<2000):<br>';
            html += '<textarea cols="40" rows="2" class="form-control" style="overflow-x: hidden;resize:vertical;min-height: 2em;" id="get_user_movie_stats_oldest_subtitle_pre_2000" name="get_user_movie_stats_oldest_subtitle_pre_2000" value="" autocomplete="off"></textarea></label>';
            html += '</div>';
        
        html += '</div>';

        html += '<div class="form_block">';
        
            html += '<div class="form-group">';
            html += '<label for="get_user_movie_stats_spent_title" title="Title of the time spent on movies section.">Movie spent title:<br>';
            html += '<textarea cols="40" rows="2" class="form-control" style="overflow-x: hidden;resize:vertical;min-height: 2em;" id="get_user_movie_stats_spent_title" name="get_user_movie_stats_spent_title" value="" autocomplete="off"></textarea></label>';
            html += '</div>';

        html += '</div>';

    html += '</div>';

    html += '<div class="form-group newline">';
    html += `<button class="form-control btn" name="get_user_movie_stats_custom_button" id="get_user_movie_stats_custom_button" onclick="toggle_hidden_form(\'get_user_movie_stats_custom\')"><img src="${root}/assets/tweak.svg" class="btn_logo"></img><p2 id="get_user_movie_stats_custom_button_text">Custom text</p2></button>`;
    html += '</div>';

    html += '<div class="form-group newline">';
    html += '<hr>';
    html += '</div>';

    html += '<div class="form-group">';
    html += '<label for="get_user_show_stats" title="Includes show statistics in your wrapped period.">Get users show statistics:<br>';
    html += '<input type="checkbox" class="form-control" id="get_user_show_stats" ';
    if(get_user_show_stats) {
        html += 'checked="' + get_user_show_stats + '" ';
    }
    html += '/><br>';
    html += '</div>';

    html += '<div class="form-group">';
    html += '<label for="get_user_show_stats_buddy" title="Includes the users top show-buddy in your wrapped period. Requires show stats.">Get users show-buddy:<br>';
    html += '<input type="checkbox" class="form-control" id="get_user_show_stats_buddy" ';
    if(get_user_show_stats_buddy) {
        html += 'checked="' + get_user_show_stats_buddy + '" ';
    }
    html += '/><br>';
    html += '</div>';

    html += '<div class="form-group newline">';
    html += '</div>';

    html += '<div class="form_hidden" id="get_user_show_stats_custom">';

        html += '<div class="form_block" id="plural">';
        
            html += '<div class="form-group">';
            html += '<label for="get_user_show_stats_title" title="Title on top of this section.">Shows title:<br>';
            html += '<textarea cols="40" rows="2" class="form-control" style="overflow-x: hidden;resize:vertical;min-height: 2em;" id="get_user_show_stats_title" name="get_user_show_stats_title" value="" autocomplete="off"></textarea></label>';
            html += '</div>';

            html += '<div class="form-group">';
            html += '<label for="get_user_show_stats_subtitle" title="Subtitle underneath title on top of this section.">Shows subtitle:<br>';
            html += '<textarea cols="40" rows="2" class="form-control" style="overflow-x: hidden;resize:vertical;min-height: 2em;" id="get_user_show_stats_subtitle" name="get_user_show_stats_subtitle" value="" autocomplete="off"></textarea></label>';
            html += '</div>';

            html += '<div class="form-group">';
            html += '<label for="get_user_show_stats_subsubtitle" title="Sub-subtitle underneath subtitle on top of this section.">Shows sub-subtitle:<br>';
            html += '<textarea cols="40" rows="2" class="form-control" style="overflow-x: hidden;resize:vertical;min-height: 2em;" id="get_user_show_stats_subsubtitle" name="get_user_show_stats_subsubtitle" value="" autocomplete="off"></textarea></label>';
            html += '</div>';
        
        html += '</div>';

        html += '<div class="form_block" id="singular">';

            html += '<div class="form-group">';
            html += '<label for="get_user_show_stats_subtitle_one" title="Subtitle underneath title on top of this section.">Shows subtitle for one show:<br>';
            html += '<textarea cols="40" rows="2" class="form-control" style="overflow-x: hidden;resize:vertical;min-height: 2em;" id="get_user_show_stats_subtitle_one" name="get_user_show_stats_subtitle_one" value="" autocomplete="off"></textarea></label>';
            html += '</div>';

            html += '<div class="form-group">';
            html += '<label for="get_user_show_stats_subsubtitle_one" title="Sub-subtitle underneath subtitle on top of this section.">Shows sub-subtitle for one show:<br>';
            html += '<textarea cols="40" rows="2" class="form-control" style="overflow-x: hidden;resize:vertical;min-height: 2em;" id="get_user_show_stats_subsubtitle_one" name="get_user_show_stats_subsubtitle_one" value="" autocomplete="off"></textarea></label>';
            html += '</div>';

        html += '</div>';

        html += '<div class="form_block" id="none">';

            html += '<div class="form-group">';
            html += '<label for="get_user_show_stats_subtitle_none" title="Subtitle underneath title on top of this section.">Shows subtitle for no shows:<br>';
            html += '<textarea cols="40" rows="2" class="form-control" style="overflow-x: hidden;resize:vertical;min-height: 2em;" id="get_user_show_stats_subtitle_none" name="get_user_show_stats_subtitle_none" value="" autocomplete="off"></textarea></label>';
            html += '</div>';

            html += '<div class="form-group">';
            html += '<label for="get_user_show_stats_subsubtitle_none" title="Sub-subtitle underneath subtitle on top of this section.">Shows sub-subtitle for no shows:<br>';
            html += '<textarea cols="40" rows="2" class="form-control" style="overflow-x: hidden;resize:vertical;min-height: 2em;" id="get_user_show_stats_subsubtitle_none" name="get_user_show_stats_subsubtitle_none" value="" autocomplete="off"></textarea></label>';
            html += '</div>';

        html += '</div>';

        html += '<div class="form_block">';
        
            html += '<div class="form-group">';
            html += '<label for="get_user_show_stats_top_show" title="Custom title of the list of top show (singular).">Title of top show list:<br>';
            html += '<input type="text" class="form-control" id="get_user_show_stats_top_show" value="' + get_user_show_stats_top_show + '" autocomplete="off" placeholder="" required /><br>';
            html += '</div>';

            html += '<div class="form-group">';
            html += '<label for="get_user_show_stats_top_show_plural" title="Custom title of the list of top shows (plural).">Title of top shows list:<br>';
            html += '<input type="text" class="form-control" id="get_user_show_stats_top_show_plural" value="' + get_user_show_stats_top_show_plural + '" autocomplete="off" placeholder="" required /><br>';
            html += '</div>';
        
        html += '</div>';

        html += '<div class="form_block">';

            html += '<div class="form-group">';
            html += '<label for="get_user_show_stats_most_played_title" title="Title on top of this section showing the top played episode.">Shows title for top episode:<br>';
            html += '<textarea cols="40" rows="2" class="form-control" style="overflow-x: hidden;resize:vertical;min-height: 2em;" id="get_user_show_stats_most_played_title" name="get_user_show_stats_most_played_title" value="" autocomplete="off"></textarea></label>';
            html += '</div>';

            html += '<div class="form-group">';
            html += '<label for="get_user_show_stats_most_played_subtitle" title="Subtitle underneath the title of this section.">Shows subtitle for top episode:<br>';
            html += '<textarea cols="40" rows="2" class="form-control" style="overflow-x: hidden;resize:vertical;min-height: 2em;" id="get_user_show_stats_most_played_subtitle" name="get_user_show_stats_most_played_subtitle" value="" autocomplete="off"></textarea></label>';
            html += '</div>';

        html += '</div>';

        html += '<div class="form_block">';

            html += '<div class="form-group">';
            html += '<label for="get_user_show_stats_buddy_title" title="Title on top of this section showing the top show and the buddy who watches it as well.">Shows title buddy section:<br>';
            html += '<textarea cols="40" rows="2" class="form-control" style="overflow-x: hidden;resize:vertical;min-height: 2em;" id="get_user_show_stats_buddy_title" name="get_user_show_stats_buddy_title" value="" autocomplete="off"></textarea></label>';
            html += '</div>';

            html += '<div class="form-group">';
            html += '<label for="get_user_show_stats_buddy_subtitle" title="Subtitle underneath the title of this section.">Shows subtitle buddy section:<br>';
            html += '<textarea cols="40" rows="2" class="form-control" style="overflow-x: hidden;resize:vertical;min-height: 2em;" id="get_user_show_stats_buddy_subtitle" name="get_user_show_stats_buddy_subtitle" value="" autocomplete="off"></textarea></label>';
            html += '</div>';

        html += '</div>';

        html += '<div class="form_block" id="none">';

            html += '<div class="form-group">';
            html += '<label for="get_user_show_stats_buddy_title_none" title="Title on top of this section showing the top show and the buddy who watches it as well, only, no buddy could be found.">Shows title buddy section (none):<br>';
            html += '<textarea cols="40" rows="2" class="form-control" style="overflow-x: hidden;resize:vertical;min-height: 2em;" id="get_user_show_stats_buddy_title_none" name="get_user_show_stats_buddy_title_none" value="" autocomplete="off"></textarea></label>';
            html += '</div>';

            html += '<div class="form-group">';
            html += '<label for="get_user_show_stats_buddy_subtitle_none" title="Subtitle underneath the title of this section.">Shows subtitle buddy section (none):<br>';
            html += '<textarea cols="40" rows="2" class="form-control" style="overflow-x: hidden;resize:vertical;min-height: 2em;" id="get_user_show_stats_buddy_subtitle_none" name="get_user_show_stats_buddy_subtitle_none" value="" autocomplete="off"></textarea></label>';
            html += '</div>';

        html += '</div>';

        html += '<div class="form_block">';
        
            html += '<div class="form-group">';
            html += '<label for="get_user_show_stats_spent_title" title="Title of the time spent on shows section.">Show spent title:<br>';
            html += '<textarea cols="40" rows="2" class="form-control" style="overflow-x: hidden;resize:vertical;min-height: 2em;" id="get_user_show_stats_spent_title" name="get_user_show_stats_spent_title" value="" autocomplete="off"></textarea></label>';
            html += '</div>';

        html += '</div>';


    html += '</div>';

    html += '<div class="form-group newline">';
    html += `<button class="form-control btn" name="get_user_show_stats_custom_button" id="get_user_show_stats_custom_button" onclick="toggle_hidden_form(\'get_user_show_stats_custom\')"><img src="${root}/assets/tweak.svg" class="btn_logo"></img><p2 id="get_user_show_stats_custom_button_text">Custom text</p2></button>`;
    html += '</div>';

    html += '<div class="form-group newline">';
    html += '<hr>';
    html += '</div>';

    html += '<div class="form-group newline">';
    html += '<label for="get_user_music_stats" title="Includes music statistics in your wrapped period.">Get users music statistics:<br>';
    html += '<input type="checkbox" class="form-control" id="get_user_music_stats" ';
    if(get_user_music_stats) {
        html += 'checked="' + get_user_music_stats + '" ';
    }
    html += '/><br>';
    html += '</div>';

    html += '<div class="form_hidden" id="get_user_music_stats_custom">';

        html += '<div class="form_block">';
        
            html += '<div class="form-group" id="plural">';
            html += '<label for="get_user_music_stats_title" title="Title on top of this section.">Music title:<br>';
            html += '<textarea cols="40" rows="2" class="form-control" style="overflow-x: hidden;resize:vertical;min-height: 2em;" id="get_user_music_stats_title" name="get_user_music_stats_title" value="" autocomplete="off"></textarea></label>';
            html += '</div>';

            html += '<div class="form-group">';
            html += '<label for="get_user_music_stats_subtitle" title="Subtitle underneath title on top of this section.">Music subtitle:<br>';
            html += '<textarea cols="40" rows="2" class="form-control" style="overflow-x: hidden;resize:vertical;min-height: 2em;" id="get_user_music_stats_subtitle" name="get_user_music_stats_subtitle" value="" autocomplete="off"></textarea></label>';
            html += '</div>';

            html += '<div class="form-group">';
            html += '<label for="get_user_music_stats_subsubtitle" title="Sub-subtitle underneath subtitle on top of this section.">Music sub-subtitle:<br>';
            html += '<textarea cols="40" rows="2" class="form-control" style="overflow-x: hidden;resize:vertical;min-height: 2em;" id="get_user_music_stats_subsubtitle" name="get_user_music_stats_subsubtitle" value="" autocomplete="off"></textarea></label>';
            html += '</div>';
        
        html += '</div>';

        html += '<div class="form_block" id="singular">';

            html += '<div class="form-group">';
            html += '<label for="get_user_music_stats_subtitle_one" title="Subtitle underneath title on top of this section.">Music subtitle for one track:<br>';
            html += '<textarea cols="40" rows="2" class="form-control" style="overflow-x: hidden;resize:vertical;min-height: 2em;" id="get_user_music_stats_subtitle_one" name="get_user_music_stats_subtitle_one" value="" autocomplete="off"></textarea></label>';
            html += '</div>';

            html += '<div class="form-group">';
            html += '<label for="get_user_music_stats_subsubtitle_one" title="Sub-subtitle underneath subtitle on top of this section.">Music sub-subtitle for one track:<br>';
            html += '<textarea cols="40" rows="2" class="form-control" style="overflow-x: hidden;resize:vertical;min-height: 2em;" id="get_user_music_stats_subsubtitle_one" name="get_user_music_stats_subsubtitle_one" value="" autocomplete="off"></textarea></label>';
            html += '</div>';

        html += '</div>';

        html += '<div class="form_block" id="none">';

            html += '<div class="form-group">';
            html += '<label for="get_user_music_stats_subtitle_none" title="Subtitle underneath title on top of this section.">Music subtitle for no tracks:<br>';
            html += '<textarea cols="40" rows="2" class="form-control" style="overflow-x: hidden;resize:vertical;min-height: 2em;" id="get_user_music_stats_subtitle_none" name="get_user_music_stats_subtitle_none" value="" autocomplete="off"></textarea></label>';
            html += '</div>';

            html += '<div class="form-group">';
            html += '<label for="get_user_music_stats_subsubtitle_none" title="Sub-subtitle underneath subtitle on top of this section.">Music sub-subtitle for no tracks:<br>';
            html += '<textarea cols="40" rows="2" class="form-control" style="overflow-x: hidden;resize:vertical;min-height: 2em;" id="get_user_music_stats_subsubtitle_none" name="get_user_music_stats_subsubtitle_none" value="" autocomplete="off"></textarea></label>';
            html += '</div>';

        html += '</div>';

        html += '<div class="form_block" id="singular">';
        
            html += '<div class="form-group">';
            html += '<label for="get_user_music_stats_top_track" title="Custom title of the list of top track (singular).">Title of top track list:<br>';
            html += '<input type="text" class="form-control" id="get_user_music_stats_top_track" value="' + get_user_music_stats_top_track + '" autocomplete="off" placeholder="" required /><br>';
            html += '</div>';

        html += '</div>';

        html += '<div class="form_block" id="plural">';

            html += '<div class="form-group">';
            html += '<label for="get_user_music_stats_top_track_plural" title="Custom title of the list of top tracks (plural).">Title of top tracks list:<br>';
            html += '<input type="text" class="form-control" id="get_user_music_stats_top_track_plural" value="' + get_user_music_stats_top_track_plural + '" autocomplete="off" placeholder="" required /><br>';
            html += '</div>';

            html += '<div class="form-group">';
            html += '<label for="get_user_music_stats_top_album_plural" title="Custom title of the list of top albums (plural).">Title of top albums list:<br>';
            html += '<input type="text" class="form-control" id="get_user_music_stats_top_album_plural" value="' + get_user_music_stats_top_album_plural + '" autocomplete="off" placeholder="" required /><br>';
            html += '</div>';

            html += '<div class="form-group">';
            html += '<label for="get_user_music_stats_top_artist_plural" title="Custom title of the list of top artists (plural).">Title of top artists list:<br>';
            html += '<input type="text" class="form-control" id="get_user_music_stats_top_artist_plural" value="' + get_user_music_stats_top_artist_plural + '" autocomplete="off" placeholder="" required /><br>';
            html += '</div>';
        
        html += '</div>';

        html += '<div class="form_block">';

            html += '<div class="form-group">';
            html += '<label for="get_user_music_stats_oldest_album_title" title="Title on top of this section.">Music title for oldest album:<br>';
            html += '<textarea cols="40" rows="2" class="form-control" style="overflow-x: hidden;resize:vertical;min-height: 2em;" id="get_user_music_stats_oldest_album_title" name="get_user_music_stats_oldest_album_title" value="" autocomplete="off"></textarea></label>';
            html += '</div>';

            html += '<div class="form-group">';
            html += '<label for="get_user_music_stats_oldest_album_subtitle" title="Subtitle underneath title of this section.">Music subtitle for oldest album:<br>';
            html += '<textarea cols="40" rows="2" class="form-control" style="overflow-x: hidden;resize:vertical;min-height: 2em;" id="get_user_music_stats_oldest_album_subtitle" name="get_user_music_stats_oldest_album_subtitle" value="" autocomplete="off"></textarea></label>';
            html += '</div>';

        html += '</div>';

        html += '<div class="form_block">';

            html += '<div class="form-group">';
            html += '<label for="get_user_music_stats_spent_title" title="Title on top of this section showing time spent listening to music.">Music spent title:<br>';
            html += '<textarea cols="40" rows="2" class="form-control" style="overflow-x: hidden;resize:vertical;min-height: 2em;" id="get_user_music_stats_spent_title" name="get_user_music_stats_spent_title" value="" autocomplete="off"></textarea></label>';
            html += '</div>';

            html += '<div class="form-group">';
            html += '<label for="get_user_music_stats_spent_subtitle" title="Subtitle underneath title of this section.">Music spent subtitle:<br>';
            html += '<textarea cols="40" rows="2" class="form-control" style="overflow-x: hidden;resize:vertical;min-height: 2em;" id="get_user_music_stats_spent_subtitle" name="get_user_music_stats_spent_subtitle" value="" autocomplete="off"></textarea></label>';
            html += '</div>';

        html += '</div>';

    html += '</div>';

    html += '<div class="form-group newline">';
    html += `<button class="form-control btn" name="get_user_music_stats_custom_button" id="get_user_music_stats_custom_button" onclick="toggle_hidden_form(\'get_user_music_stats_custom\')"><img src="${root}/assets/tweak.svg" class="btn_logo"></img><p2 id="get_user_music_stats_custom_button_text">Custom text</p2></button>`;
    html += '</div>';

    html += '<div class="form-group newline">';
    html += '<hr>';
    html += '</div>';

    html += '<div class="form-group">';
    html += '<label for="get_year_stats_movies" title="Includes server-wide movie statistics in your wrapped period.">Get server-wide movie statistics:<br>';
    html += '<input type="checkbox" class="form-control" id="get_year_stats_movies" ';
    if(get_year_stats_movies) {
        html += 'checked="' + get_year_stats_movies + '" ';
    }
    html += '/><br>';
    html += '</div>';

    html += '<div class="form-group">';
    html += '<label for="get_year_stats_shows" title="Includes server-wide show statistics in your wrapped period.">Get server-wide show statistics:<br>';
    html += '<input type="checkbox" class="form-control" id="get_year_stats_shows" ';
    if(get_year_stats_shows) {
        html += 'checked="' + get_year_stats_shows + '" ';
    }
    html += '/><br>';
    html += '</div>';

    html += '<div class="form-group">';
    html += '<label for="get_year_stats_music" title="Includes server-wide music statistics in your wrapped period.">Get server-wide music statistics:<br>';
    html += '<input type="checkbox" class="form-control" id="get_year_stats_music" ';
    if(get_year_stats_music) {
        html += 'checked="' + get_year_stats_music + '" ';
    }
    html += '/><br>';
    html += '</div>';

    html += '<div class="form-group">';
    html += '<label for="get_year_stats_leaderboard" title="Creates a user leaderboard based on the server-wide statistics in your wrapped period.">Get server-wide leaderboard rankings:<br>';
    html += '<input type="checkbox" class="form-control" id="get_year_stats_leaderboard" ';
    if(get_year_stats_leaderboard) {
        html += 'checked="' + get_year_stats_leaderboard + '" ';
    }
    html += '/><br>';
    html += '</div>';

    html += '<div class="form-group">';
    html += '<label for="get_year_stats_leaderboard_numbers" title="Displays the statistics of users on the leaderboard.">Display server-wide leaderboard numbers:<br>';
    html += '<input type="checkbox" class="form-control" id="get_year_stats_leaderboard_numbers" ';
    if(get_year_stats_leaderboard_numbers) {
        html += 'checked="' + get_year_stats_leaderboard_numbers + '" ';
    }
    html += '/><br>';
    html += '</div>';

    html += '<div class="form-group newline">';
    html += '</div>';

    html += '<div class="form_hidden" id="get_year_stats_custom">';

        html += '<div class="form_block">';
        
            html += '<div class="form-group">';
            html += '<label for="get_year_stats_title" title="Title on top of this section.">Server-wide title:<br>';
            html += '<textarea cols="40" rows="2" class="form-control" style="overflow-x: hidden;resize:vertical;min-height: 2em;" id="get_year_stats_title" name="get_year_stats_title" value="" autocomplete="off"></textarea></label>';
            html += '</div>';

            html += '<div class="form-group">';
            html += '<label for="get_year_stats_subtitle" title="Subtitle underneath title on top of this section.">Server-wide subtitle:<br>';
            html += '<textarea cols="40" rows="2" class="form-control" style="overflow-x: hidden;resize:vertical;min-height: 2em;" id="get_year_stats_subtitle" name="get_year_stats_subtitle" value="" autocomplete="off"></textarea></label>';
            html += '</div>';

            html += '<div class="form-group">';
            html += '<label for="get_year_stats_subsubtitle" title="Sub-subtitle underneath subtitle on top of this section.">Server-wide sub-subtitle:<br>';
            html += '<textarea cols="40" rows="2" class="form-control" style="overflow-x: hidden;resize:vertical;min-height: 2em;" id="get_year_stats_subsubtitle" name="get_year_stats_subsubtitle" value="" autocomplete="off"></textarea></label>';
            html += '</div>';
        
        html += '</div>';

        html += '<div class="form_block" id="">';

            html += '<div class="form-group">';
            html += '<label for="get_year_stats_movies_title" title="Custom title of the list of top movies.">Title of top movies list:<br>';
            html += '<input type="text" class="form-control" id="get_year_stats_movies_title" value="' + get_year_stats_movies_title + '" autocomplete="off" placeholder="" required /><br>';
            html += '</div>';

            html += '<div class="form-group">';
            html += '<label for="get_year_stats_shows_title" title="Custom title of the list of top shows.">Title of top shows list:<br>';
            html += '<input type="text" class="form-control" id="get_year_stats_shows_title" value="' + get_year_stats_shows_title + '" autocomplete="off" placeholder="" required /><br>';
            html += '</div>';

            html += '<div class="form-group">';
            html += '<label for="get_year_stats_music_title" title="Custom title of the list of top artists.">Title of top artists list:<br>';
            html += '<input type="text" class="form-control" id="get_year_stats_music_title" value="' + get_year_stats_music_title + '" autocomplete="off" placeholder="" required /><br>';
            html += '</div>';

            html += '<div class="form-group">';
            html += '<label for="get_year_stats_leaderboard_title" title="Custom title of the list of top users.">Title of top users list:<br>';
            html += '<input type="text" class="form-control" id="get_year_stats_leaderboard_title" value="' + get_year_stats_leaderboard_title + '" autocomplete="off" placeholder="" required /><br>';
            html += '</div>';
        
        html += '</div>';

        html += '<div class="form_block">';
        
            html += '<div class="form-group">';
            html += '<label for="get_year_stats_movies_duration_title" title="Title on top of this section showing duration spent on movies.">Server-wide movie duration:<br>';
            html += '<textarea cols="40" rows="2" class="form-control" style="overflow-x: hidden;resize:vertical;min-height: 2em;" id="get_year_stats_movies_duration_title" name="get_year_stats_movies_duration_title" value="" autocomplete="off"></textarea></label>';
            html += '</div>';

            html += '<div class="form-group">';
            html += '<label for="get_year_stats_shows_duration_title" title="Title on top of this section showing duration spent on shows.">Server-wide show duration:<br>';
            html += '<textarea cols="40" rows="2" class="form-control" style="overflow-x: hidden;resize:vertical;min-height: 2em;" id="get_year_stats_shows_duration_title" name="get_year_stats_shows_duration_title" value="" autocomplete="off"></textarea></label>';
            html += '</div>';

            html += '<div class="form-group">';
            html += '<label for="get_year_stats_music_duration_title" title="Title on top of this section showing duration spent on music.">Server-wide music duration:<br>';
            html += '<textarea cols="40" rows="2" class="form-control" style="overflow-x: hidden;resize:vertical;min-height: 2em;" id="get_year_stats_music_duration_title" name="get_year_stats_music_duration_title" value="" autocomplete="off"></textarea></label>';
            html += '</div>';

            html += '<div class="form-group">';
            html += '<label for="get_year_stats_duration_sum_title" title="Title on top of this section showing duration spent on all categories.">Server-wide content duration:<br>';
            html += '<textarea cols="40" rows="2" class="form-control" style="overflow-x: hidden;resize:vertical;min-height: 2em;" id="get_year_stats_duration_sum_title" name="get_year_stats_duration_sum_title" value="" autocomplete="off"></textarea></label>';
            html += '</div>';
        
        html += '</div>';

    html += '</div>';

    html += '<div class="form-group newline">';
    html += `<button class="form-control btn" name="get_year_stats_custom_button" id="get_year_stats_custom_button" onclick="toggle_hidden_form(\'get_year_stats_custom\')"><img src="${root}/assets/tweak.svg" class="btn_logo"></img><p2 id="get_year_stats_custom_button_text">Custom text</p2></button>`;
    html += '</div>';

    html += '<div class="form-group newline">';
    html += '<hr>';
    html += '</div>';

    html += '<div class="form-group">';
    html += '<label for="stats_outro_title" title="Title that is shown at the bottom, when the statistics are done.">Outro title for statistics page:<br>';
    html += '<textarea cols="40" rows="5" class="form-control" style="overflow-x: hidden;resize:vertical;min-height: 5em;" id="stats_outro_title" name="stats_outro_title" value="" autocomplete="off"></textarea></label>';
    html += '</div>';

    html += '<div class="form-group">';
    html += '<label for="stats_outro_subtitle" title="Subtitle that is shown at the bottom, when the statistics are done.">Outro subtitle for statistics page:<br>';
    html += '<textarea cols="40" rows="5" class="form-control" style="overflow-x: hidden;resize:vertical;min-height: 5em;" id="stats_outro_subtitle" name="stats_outro_subtitle" value="" autocomplete="off"></textarea></label>';
    html += '</div>';

    html += '<div class="form-group newline">';
    html += '<hr>';
    html += '</div>';

    html += '<div class="form_hidden" id="wrapperr_language">';

        html += '<div class="form_block">';
        
            html += '<div class="form-group">';
            html += '<label for="wrapperr_and" title="Word alternative for when \'and\' appears.">Alternative for \'and\':<br>';
            html += '<input type="text" class="form-control" id="wrapperr_and" value="' + wrapperr_and + '" autocomplete="off" placeholder="" required /><br>';
            html += '</div>';
        
        html += '</div>';

        html += '<div class="form_block">';
        
            html += '<div class="form-group">';
            html += '<label for="wrapperr_play" title="Word alternative for when \'play\' appears.">Alternative for \'play\':<br>';
            html += '<input type="text" class="form-control" id="wrapperr_play" value="' + wrapperr_play + '" autocomplete="off" placeholder="" required /><br>';
            html += '</div>';

            html += '<div class="form-group">';
            html += '<label for="wrapperr_play_plural" title="Word alternative for when \'plays\' appears.">Alternative for \'plays\':<br>';
            html += '<input type="text" class="form-control" id="wrapperr_play_plural" value="' + wrapperr_play_plural + '" autocomplete="off" placeholder="" required /><br>';
            html += '</div>';
        
        html += '</div>';

        html += '<div class="form_block">';
        
            html += '<div class="form-group">';
            html += '<label for="wrapperr_day" title="Word alternative for when \'day\' appears.">Alternative for \'day\':<br>';
            html += '<input type="text" class="form-control" id="wrapperr_day" value="' + wrapperr_day + '" autocomplete="off" placeholder="" required /><br>';
            html += '</div>';

            html += '<div class="form-group">';
            html += '<label for="wrapperr_day_plural" title="Word alternative for when \'days\' appears.">Alternative for \'days\':<br>';
            html += '<input type="text" class="form-control" id="wrapperr_day_plural" value="' + wrapperr_day_plural + '" autocomplete="off" placeholder="" required /><br>';
            html += '</div>';
        
        html += '</div>';

        html += '<div class="form_block">';
        
            html += '<div class="form-group">';
            html += '<label for="wrapperr_hour" title="Word alternative for when \'hour\' appears.">Alternative for \'hour\':<br>';
            html += '<input type="text" class="form-control" id="wrapperr_hour" value="' + wrapperr_hour + '" autocomplete="off" placeholder="" required /><br>';
            html += '</div>';

            html += '<div class="form-group">';
            html += '<label for="wrapperr_hour_plural" title="Word alternative for when \'hours\' appears.">Alternative for \'hours\':<br>';
            html += '<input type="text" class="form-control" id="wrapperr_hour_plural" value="' + wrapperr_hour_plural + '" autocomplete="off" placeholder="" required /><br>';
            html += '</div>';
        
        html += '</div>';

        html += '<div class="form_block">';
        
            html += '<div class="form-group">';
            html += '<label for="wrapperr_minute" title="Word alternative for when \'minute\' appears.">Alternative for \'minute\':<br>';
            html += '<input type="text" class="form-control" id="wrapperr_minute" value="' + wrapperr_minute + '" autocomplete="off" placeholder="" required /><br>';
            html += '</div>';

            html += '<div class="form-group">';
            html += '<label for="wrapperr_minute_plural" title="Word alternative for when \'minutes\' appears.">Alternative for \'minutes\':<br>';
            html += '<input type="text" class="form-control" id="wrapperr_minute_plural" value="' + wrapperr_minute_plural + '" autocomplete="off" placeholder="" required /><br>';
            html += '</div>';
        
        html += '</div>';

        html += '<div class="form_block">';
        
            html += '<div class="form-group">';
            html += '<label for="wrapperr_second" title="Word alternative for when \'second\' appears.">Alternative for \'second\':<br>';
            html += '<input type="text" class="form-control" id="wrapperr_second" value="' + wrapperr_second + '" autocomplete="off" placeholder="" required /><br>';
            html += '</div>';

            html += '<div class="form-group">';
            html += '<label for="wrapperr_second_plural" title="Word alternative for when \'seconds\' appears.">Alternative for \'seconds\':<br>';
            html += '<input type="text" class="form-control" id="wrapperr_second_plural" value="' + wrapperr_second_plural + '" autocomplete="off" placeholder="" required /><br>';
            html += '</div>';
        
        html += '</div>';

        html += '<div class="form_block">';
        
            html += '<div class="form-group">';
            html += '<label for="wrapperr_sort_plays" title="Text alternative for \'Sort by plays\' button.">\'Sort by plays\' alternative:<br>';
            html += '<input type="text" class="form-control" id="wrapperr_sort_plays" value="' + wrapperr_sort_plays + '" autocomplete="off" placeholder="" required /><br>';
            html += '</div>';

            html += '<div class="form-group">';
            html += '<label for="wrapperr_sort_duration" title="Text alternative for \'Sort by duration\' button.">\'Sort by duration\' alternative:<br>';
            html += '<input type="text" class="form-control" id="wrapperr_sort_duration" value="' + wrapperr_sort_duration + '" autocomplete="off" placeholder="" required /><br>';
            html += '</div>';
        
        html += '</div>';

    html += '</div>';

    html += '<div class="form-group newline">';
    html += `<button class="form-control btn" name="wrapperr_language_button" id="get_user_show_stats_custom_button" onclick="toggle_hidden_form(\'wrapperr_language\')"><img src="${root}/assets/tweak.svg" class="btn_logo"></img><p2 id="wrapperr_language_button_text">Custom language</p2></button>`;
    html += '</div>';

    html += '<div class="form-group newline">';
    html += '<hr>';
    html += '</div>';

    html += '<div class="form-group newline">';
    html += '<div class="warning">!<br>Many of the settings here need a clean cache to be applied.</div>';
    html += '</div>';

    html += '<div class="form-group newline" title="Clear the cache now to include the newest settings.">';
    html += '<label for="clear_cache">Clear cache now:<br>';
    html += '<input type="checkbox" class="form-control" id="clear_cache" checked /></label>';
    html += '</div>';

    html += '<div class="form-group newline">';
    html += `<button type="submit" class="form-control btn" onclick="set_wrapperr_customization_call();" id="set_wrapperr_customization_form_button"><img src="${root}/assets/done.svg" class="btn_logo"></img><p2 id="set_wrapperr_customization_form_button_text">Save</p2></button>`;
    html += '</div>';

    html += '</form>';

    // Place content from config
    document.getElementById("setup").innerHTML = html;

    document.getElementById("wrapperr_front_page_title").value = wrapperr_front_page_title;
    document.getElementById("wrapperr_front_page_subtitle").value = wrapperr_front_page_subtitle;
    document.getElementById("wrapperr_front_page_search_title").value = wrapperr_front_page_search_title;
    document.getElementById("stats_intro_title").value = stats_intro_title;
    document.getElementById("stats_intro_subtitle").value = stats_intro_subtitle;
    document.getElementById("stats_outro_title").value = stats_outro_title;
    document.getElementById("stats_outro_subtitle").value = stats_outro_subtitle;
    document.getElementById("stats_top_list_length").value = stats_top_list_length;
    document.getElementById("poster_cache_max_age_days").value = poster_cache_max_age_days;

    document.getElementById("get_user_movie_stats_title").value = get_user_movie_stats_title;
    document.getElementById("get_user_movie_stats_subtitle").value = get_user_movie_stats_subtitle;
    document.getElementById("get_user_movie_stats_subsubtitle").value = get_user_movie_stats_subsubtitle;
    document.getElementById("get_user_movie_stats_subtitle_one").value = get_user_movie_stats_subtitle_one;
    document.getElementById("get_user_movie_stats_subsubtitle_one").value = get_user_movie_stats_subsubtitle_one;
    document.getElementById("get_user_movie_stats_subtitle_none").value = get_user_movie_stats_subtitle_none;
    document.getElementById("get_user_movie_stats_subsubtitle_none").value = get_user_movie_stats_subsubtitle_none;
    document.getElementById("get_user_movie_stats_movie_completion_title").value = get_user_movie_stats_movie_completion_title;
    document.getElementById("get_user_movie_stats_movie_completion_title_plural").value = get_user_movie_stats_movie_completion_title_plural;
    document.getElementById("get_user_movie_stats_movie_completion_subtitle").value = get_user_movie_stats_movie_completion_subtitle;
    document.getElementById("get_user_movie_stats_pause_title").value = get_user_movie_stats_pause_title;
    document.getElementById("get_user_movie_stats_pause_subtitle").value = get_user_movie_stats_pause_subtitle;
    document.getElementById("get_user_movie_stats_pause_title_one").value = get_user_movie_stats_pause_title_one;
    document.getElementById("get_user_movie_stats_pause_subtitle_one").value = get_user_movie_stats_pause_subtitle_one;
    document.getElementById("get_user_movie_stats_pause_title_none").value = get_user_movie_stats_pause_title_none;
    document.getElementById("get_user_movie_stats_pause_subtitle_none").value = get_user_movie_stats_pause_subtitle_none;
    document.getElementById("get_user_movie_stats_oldest_title").value = get_user_movie_stats_oldest_title;
    document.getElementById("get_user_movie_stats_oldest_subtitle").value = get_user_movie_stats_oldest_subtitle;
    document.getElementById("get_user_movie_stats_oldest_subtitle_pre_1950").value = get_user_movie_stats_oldest_subtitle_pre_1950;
    document.getElementById("get_user_movie_stats_oldest_subtitle_pre_1975").value = get_user_movie_stats_oldest_subtitle_pre_1975;
    document.getElementById("get_user_movie_stats_oldest_subtitle_pre_2000").value = get_user_movie_stats_oldest_subtitle_pre_2000;
    document.getElementById("get_user_movie_stats_spent_title").value = get_user_movie_stats_spent_title;

    document.getElementById("get_user_show_stats_title").value = get_user_show_stats_title;
    document.getElementById("get_user_show_stats_subtitle").value = get_user_show_stats_subtitle;
    document.getElementById("get_user_show_stats_subsubtitle").value = get_user_show_stats_subsubtitle;
    document.getElementById("get_user_show_stats_subtitle_one").value = get_user_show_stats_subtitle_one;
    document.getElementById("get_user_show_stats_subsubtitle_one").value = get_user_show_stats_subsubtitle_one;
    document.getElementById("get_user_show_stats_subtitle_none").value = get_user_show_stats_subtitle_none;
    document.getElementById("get_user_show_stats_subsubtitle_none").value = get_user_show_stats_subsubtitle_none;
    document.getElementById("get_user_show_stats_most_played_title").value = get_user_show_stats_most_played_title;
    document.getElementById("get_user_show_stats_most_played_subtitle").value = get_user_show_stats_most_played_subtitle;
    document.getElementById("get_user_show_stats_buddy_title").value = get_user_show_stats_buddy_title;
    document.getElementById("get_user_show_stats_buddy_subtitle").value = get_user_show_stats_buddy_subtitle;
    document.getElementById("get_user_show_stats_buddy_title_none").value = get_user_show_stats_buddy_title_none;
    document.getElementById("get_user_show_stats_buddy_subtitle_none").value = get_user_show_stats_buddy_subtitle_none;
    document.getElementById("get_user_show_stats_spent_title").value = get_user_show_stats_spent_title;

    document.getElementById("get_user_music_stats_title").value = get_user_music_stats_title;
    document.getElementById("get_user_music_stats_subtitle").value = get_user_music_stats_subtitle;
    document.getElementById("get_user_music_stats_subsubtitle").value = get_user_music_stats_subsubtitle;
    document.getElementById("get_user_music_stats_subtitle_one").value = get_user_music_stats_subtitle_one;
    document.getElementById("get_user_music_stats_subsubtitle_one").value = get_user_music_stats_subsubtitle_one;
    document.getElementById("get_user_music_stats_subtitle_none").value = get_user_music_stats_subtitle_none;
    document.getElementById("get_user_music_stats_subsubtitle_none").value = get_user_music_stats_subsubtitle_none;
    document.getElementById("get_user_music_stats_spent_title").value = get_user_music_stats_spent_title;
    document.getElementById("get_user_music_stats_spent_subtitle").value = get_user_music_stats_spent_subtitle;
    document.getElementById("get_user_music_stats_oldest_album_title").value = get_user_music_stats_oldest_album_title;
    document.getElementById("get_user_music_stats_oldest_album_subtitle").value = get_user_music_stats_oldest_album_subtitle;

    document.getElementById("get_year_stats_title").value = get_year_stats_title;
    document.getElementById("get_year_stats_subtitle").value = get_year_stats_subtitle;
    document.getElementById("get_year_stats_subsubtitle").value = get_year_stats_subsubtitle;
    document.getElementById("get_year_stats_movies_duration_title").value = get_year_stats_movies_duration_title;
    document.getElementById("get_year_stats_shows_duration_title").value = get_year_stats_shows_duration_title;
    document.getElementById("get_year_stats_music_duration_title").value = get_year_stats_music_duration_title;
    document.getElementById("get_year_stats_duration_sum_title").value = get_year_stats_duration_sum_title;

}

function set_wrapperr_customization_call() {

    document.getElementById("set_wrapperr_customization_form_button").disabled = true;
    document.getElementById("set_wrapperr_customization_form_button").style.opacity = '0.5';

    wrapperr_front_page_title = document.getElementById('wrapperr_front_page_title').value;
    wrapperr_front_page_subtitle = document.getElementById('wrapperr_front_page_subtitle').value;
    wrapperr_front_page_search_title = document.getElementById('wrapperr_front_page_search_title').value;
    stats_intro_title = document.getElementById('stats_intro_title').value;
    stats_intro_subtitle = document.getElementById('stats_intro_subtitle').value;
    stats_outro_title = document.getElementById('stats_outro_title').value;
    stats_outro_subtitle = document.getElementById('stats_outro_subtitle').value;
    stats_order_by_plays = document.getElementById('stats_order_by_plays').checked;
    stats_order_by_duration = document.getElementById('stats_order_by_duration').checked;
    stats_top_list_length = parseInt(document.getElementById("stats_top_list_length").value);
    enable_posters = document.getElementById('enable_posters').checked;
    poster_cache_max_age_days = parseInt(document.getElementById("poster_cache_max_age_days").value) || 30;
    obfuscate_other_users = document.getElementById('obfuscate_other_users').checked;

    get_user_movie_stats = document.getElementById('get_user_movie_stats').checked;
    get_user_movie_stats_title = document.getElementById('get_user_movie_stats_title').value;
    get_user_movie_stats_subtitle = document.getElementById('get_user_movie_stats_subtitle').value;
    get_user_movie_stats_subsubtitle = document.getElementById('get_user_movie_stats_subsubtitle').value;
    get_user_movie_stats_subtitle_one = document.getElementById('get_user_movie_stats_subtitle_one').value;
    get_user_movie_stats_subsubtitle_one = document.getElementById('get_user_movie_stats_subsubtitle_one').value;
    get_user_movie_stats_subtitle_none = document.getElementById('get_user_movie_stats_subtitle_none').value;
    get_user_movie_stats_subsubtitle_none = document.getElementById('get_user_movie_stats_subsubtitle_none').value;
    get_user_movie_stats_top_movie = document.getElementById('get_user_movie_stats_top_movie').value;
    get_user_movie_stats_top_movie_plural = document.getElementById('get_user_movie_stats_top_movie_plural').value;
    get_user_movie_stats_movie_completion_title = document.getElementById('get_user_movie_stats_movie_completion_title').value;
    get_user_movie_stats_movie_completion_title_plural = document.getElementById('get_user_movie_stats_movie_completion_title_plural').value;
    get_user_movie_stats_movie_completion_subtitle = document.getElementById('get_user_movie_stats_movie_completion_subtitle').value;
    get_user_movie_stats_pause_title = document.getElementById('get_user_movie_stats_pause_title').value;
    get_user_movie_stats_pause_subtitle = document.getElementById('get_user_movie_stats_pause_subtitle').value;
    get_user_movie_stats_pause_title_one = document.getElementById('get_user_movie_stats_pause_title_one').value;
    get_user_movie_stats_pause_subtitle_one = document.getElementById('get_user_movie_stats_pause_subtitle_one').value;
    get_user_movie_stats_pause_title_none = document.getElementById('get_user_movie_stats_pause_title_none').value;
    get_user_movie_stats_pause_subtitle_none = document.getElementById('get_user_movie_stats_pause_subtitle_none').value;
    get_user_movie_stats_oldest_title = document.getElementById('get_user_movie_stats_oldest_title').value;
    get_user_movie_stats_oldest_subtitle = document.getElementById('get_user_movie_stats_oldest_subtitle').value;
    get_user_movie_stats_oldest_subtitle_pre_1950 = document.getElementById('get_user_movie_stats_oldest_subtitle_pre_1950').value;
    get_user_movie_stats_oldest_subtitle_pre_1975 = document.getElementById('get_user_movie_stats_oldest_subtitle_pre_1975').value;
    get_user_movie_stats_oldest_subtitle_pre_2000 = document.getElementById('get_user_movie_stats_oldest_subtitle_pre_2000').value;
    get_user_movie_stats_spent_title = document.getElementById('get_user_movie_stats_spent_title').value;

    get_user_show_stats = document.getElementById('get_user_show_stats').checked;
    get_user_show_stats_buddy = document.getElementById('get_user_show_stats_buddy').checked;
    get_user_show_stats_title = document.getElementById('get_user_show_stats_title').value;
    get_user_show_stats_subtitle = document.getElementById('get_user_show_stats_subtitle').value;
    get_user_show_stats_subsubtitle = document.getElementById('get_user_show_stats_subsubtitle').value;
    get_user_show_stats_subtitle_one = document.getElementById('get_user_show_stats_subtitle_one').value;
    get_user_show_stats_subsubtitle_one = document.getElementById('get_user_show_stats_subsubtitle_one').value;
    get_user_show_stats_subtitle_none = document.getElementById('get_user_show_stats_subtitle_none').value;
    get_user_show_stats_subsubtitle_none = document.getElementById('get_user_show_stats_subsubtitle_none').value;
    get_user_show_stats_top_show = document.getElementById('get_user_show_stats_top_show').value;
    get_user_show_stats_top_show_plural = document.getElementById('get_user_show_stats_top_show_plural').value;
    get_user_show_stats_most_played_title = document.getElementById('get_user_show_stats_most_played_title').value;
    get_user_show_stats_most_played_subtitle = document.getElementById('get_user_show_stats_most_played_subtitle').value;
    get_user_show_stats_buddy_title = document.getElementById('get_user_show_stats_buddy_title').value;
    get_user_show_stats_buddy_subtitle = document.getElementById('get_user_show_stats_buddy_subtitle').value;
    get_user_show_stats_buddy_title_none = document.getElementById('get_user_show_stats_buddy_title_none').value;
    get_user_show_stats_buddy_subtitle_none = document.getElementById('get_user_show_stats_buddy_subtitle_none').value;
    get_user_show_stats_spent_title = document.getElementById('get_user_show_stats_spent_title').value;

    get_user_music_stats = document.getElementById('get_user_music_stats').checked;
    get_user_music_stats_title = document.getElementById('get_user_music_stats_title').value;
    get_user_music_stats_subtitle = document.getElementById('get_user_music_stats_subtitle').value;
    get_user_music_stats_subsubtitle = document.getElementById('get_user_music_stats_subsubtitle').value;
    get_user_music_stats_subtitle_one = document.getElementById('get_user_music_stats_subtitle_one').value;
    get_user_music_stats_subsubtitle_one = document.getElementById('get_user_music_stats_subsubtitle_one').value;
    get_user_music_stats_subtitle_none = document.getElementById('get_user_music_stats_subtitle_none').value;
    get_user_music_stats_subsubtitle_none = document.getElementById('get_user_music_stats_subsubtitle_none').value;
    get_user_music_stats_top_track = document.getElementById('get_user_music_stats_top_track').value;
    get_user_music_stats_top_track_plural = document.getElementById('get_user_music_stats_top_track_plural').value;
    get_user_music_stats_top_album_plural = document.getElementById('get_user_music_stats_top_album_plural').value;
    get_user_music_stats_top_artist_plural = document.getElementById('get_user_music_stats_top_artist_plural').value;
    get_user_music_stats_spent_title = document.getElementById('get_user_music_stats_spent_title').value;
    get_user_music_stats_spent_subtitle = document.getElementById('get_user_music_stats_spent_subtitle').value;
    get_user_music_stats_oldest_album_title = document.getElementById('get_user_music_stats_oldest_album_title').value;
    get_user_music_stats_oldest_album_subtitle = document.getElementById('get_user_music_stats_oldest_album_subtitle').value;

    get_year_stats_title = document.getElementById('get_year_stats_title').value;
    get_year_stats_subtitle = document.getElementById('get_year_stats_subtitle').value;
    get_year_stats_subsubtitle = document.getElementById('get_year_stats_subsubtitle').value;
    get_year_stats_movies = document.getElementById('get_year_stats_movies').checked;
    get_year_stats_movies_title = document.getElementById('get_year_stats_movies_title').value;
    get_year_stats_movies_duration_title = document.getElementById('get_year_stats_movies_duration_title').value;
    get_year_stats_shows = document.getElementById('get_year_stats_shows').checked;
    get_year_stats_shows_title = document.getElementById('get_year_stats_shows_title').value;
    get_year_stats_shows_duration_title = document.getElementById('get_year_stats_shows_duration_title').value;
    get_year_stats_music = document.getElementById('get_year_stats_music').checked;
    get_year_stats_music_title = document.getElementById('get_year_stats_music_title').value;
    get_year_stats_music_duration_title = document.getElementById('get_year_stats_music_duration_title').value;
    get_year_stats_leaderboard = document.getElementById('get_year_stats_leaderboard').checked;
    get_year_stats_leaderboard_numbers = document.getElementById('get_year_stats_leaderboard_numbers').checked;
    get_year_stats_leaderboard_title = document.getElementById('get_year_stats_leaderboard_title').value;
    get_year_stats_duration_sum_title = document.getElementById('get_year_stats_duration_sum_title').value;
    clear_cache = document.getElementById('clear_cache').checked;

    wrapperr_and = document.getElementById("wrapperr_and").value;
    wrapperr_play = document.getElementById("wrapperr_play").value;
    wrapperr_play_plural = document.getElementById("wrapperr_play_plural").value;
    wrapperr_day = document.getElementById("wrapperr_day").value;
    wrapperr_day_plural = document.getElementById("wrapperr_day_plural").value;
    wrapperr_hour = document.getElementById("wrapperr_hour").value;
    wrapperr_hour_plural = document.getElementById("wrapperr_hour_plural").value;
    wrapperr_minute = document.getElementById("wrapperr_minute").value;
    wrapperr_minute_plural = document.getElementById("wrapperr_minute_plural").value;
    wrapperr_second = document.getElementById("wrapperr_second").value;
    wrapperr_second_plural = document.getElementById("wrapperr_second_plural").value;
    wrapperr_sort_plays = document.getElementById("wrapperr_sort_plays").value;
    wrapperr_sort_duration = document.getElementById("wrapperr_sort_duration").value;
    
    wrapperr_customization_form = {
        "clear_cache" : clear_cache,
        "data_type" : "wrapperr_customize",
        "tautulli_config" : [],
        "wrapperr_data" : {},
        "wrapperr_customize" : {
            "wrapperr_front_page_title" : wrapperr_front_page_title,
            "wrapperr_front_page_subtitle" : wrapperr_front_page_subtitle,
            "wrapperr_front_page_search_title": wrapperr_front_page_search_title,
            "stats_intro_title" : stats_intro_title,
            "stats_intro_subtitle" : stats_intro_subtitle,
            "stats_outro_title" : stats_outro_title,
            "stats_outro_subtitle" : stats_outro_subtitle,
            "stats_order_by_plays" : stats_order_by_plays,
            "stats_order_by_duration" : stats_order_by_duration,
            "stats_top_list_length" : stats_top_list_length,
            "enable_posters" : enable_posters,
            "poster_cache_max_age_days" : poster_cache_max_age_days,
            "obfuscate_other_users": obfuscate_other_users,
            "get_user_movie_stats" : get_user_movie_stats,
            "get_user_movie_stats_title" : get_user_movie_stats_title,
            "get_user_movie_stats_subtitle" : get_user_movie_stats_subtitle,
            "get_user_movie_stats_subsubtitle" : get_user_movie_stats_subsubtitle,
            "get_user_movie_stats_subtitle_one" : get_user_movie_stats_subtitle_one,
            "get_user_movie_stats_subsubtitle_one" : get_user_movie_stats_subsubtitle_one,
            "get_user_movie_stats_subtitle_none" : get_user_movie_stats_subtitle_none,
            "get_user_movie_stats_subsubtitle_none" : get_user_movie_stats_subsubtitle_none,
            "get_user_movie_stats_top_movie" : get_user_movie_stats_top_movie,
            "get_user_movie_stats_top_movie_plural" : get_user_movie_stats_top_movie_plural,
            "get_user_movie_stats_movie_completion_title" : get_user_movie_stats_movie_completion_title,
            "get_user_movie_stats_movie_completion_title_plural" : get_user_movie_stats_movie_completion_title_plural,
            "get_user_movie_stats_movie_completion_subtitle" : get_user_movie_stats_movie_completion_subtitle,
            "get_user_movie_stats_pause_title" : get_user_movie_stats_pause_title,
            "get_user_movie_stats_pause_subtitle" : get_user_movie_stats_pause_subtitle,
            "get_user_movie_stats_pause_title_one" : get_user_movie_stats_pause_title_one,
            "get_user_movie_stats_pause_subtitle_one" : get_user_movie_stats_pause_subtitle_one,
            "get_user_movie_stats_pause_title_none" : get_user_movie_stats_pause_title_none,
            "get_user_movie_stats_pause_subtitle_none" : get_user_movie_stats_pause_subtitle_none,
            "get_user_movie_stats_oldest_title" : get_user_movie_stats_oldest_title,
            "get_user_movie_stats_oldest_subtitle" : get_user_movie_stats_oldest_subtitle,
            "get_user_movie_stats_oldest_subtitle_pre_1950" : get_user_movie_stats_oldest_subtitle_pre_1950,
            "get_user_movie_stats_oldest_subtitle_pre_1975" : get_user_movie_stats_oldest_subtitle_pre_1975,
            "get_user_movie_stats_oldest_subtitle_pre_2000" : get_user_movie_stats_oldest_subtitle_pre_2000,
            "get_user_movie_stats_spent_title" : get_user_movie_stats_spent_title,
            "get_user_show_stats" : get_user_show_stats,
            "get_user_show_stats_buddy" : get_user_show_stats_buddy,
            "get_user_show_stats_title" : get_user_show_stats_title,
            "get_user_show_stats_subtitle" : get_user_show_stats_subtitle,
            "get_user_show_stats_subsubtitle" : get_user_show_stats_subsubtitle,
            "get_user_show_stats_subtitle_one" : get_user_show_stats_subtitle_one,
            "get_user_show_stats_subsubtitle_one" : get_user_show_stats_subsubtitle_one,
            "get_user_show_stats_subtitle_none" : get_user_show_stats_subtitle_none,
            "get_user_show_stats_subsubtitle_none" : get_user_show_stats_subsubtitle_none,
            "get_user_show_stats_top_show" : get_user_show_stats_top_show,
            "get_user_show_stats_top_show_plural" : get_user_show_stats_top_show_plural,
            "get_user_show_stats_spent_title" : get_user_show_stats_spent_title,
            "get_user_show_stats_most_played_title" : get_user_show_stats_most_played_title,
            "get_user_show_stats_most_played_subtitle" : get_user_show_stats_most_played_subtitle,
            "get_user_show_stats_buddy_title" : get_user_show_stats_buddy_title,
            "get_user_show_stats_buddy_subtitle" : get_user_show_stats_buddy_subtitle,
            "get_user_show_stats_buddy_title_none" : get_user_show_stats_buddy_title_none,
            "get_user_show_stats_buddy_subtitle_none" : get_user_show_stats_buddy_subtitle_none,
            "get_user_music_stats" : get_user_music_stats,
            "get_user_music_stats_title" : get_user_music_stats_title,
            "get_user_music_stats_subtitle" : get_user_music_stats_subtitle,
            "get_user_music_stats_subsubtitle" : get_user_music_stats_subsubtitle,
            "get_user_music_stats_subtitle_one" : get_user_music_stats_subtitle_one,
            "get_user_music_stats_subsubtitle_one" : get_user_music_stats_subsubtitle_one,
            "get_user_music_stats_subtitle_none" : get_user_music_stats_subtitle_none,
            "get_user_music_stats_subsubtitle_none" : get_user_music_stats_subsubtitle_none,
            "get_user_music_stats_top_track" : get_user_music_stats_top_track,
            "get_user_music_stats_top_track_plural" : get_user_music_stats_top_track_plural,
            "get_user_music_stats_top_album_plural" : get_user_music_stats_top_album_plural,
            "get_user_music_stats_top_artist_plural" : get_user_music_stats_top_artist_plural,
            "get_user_music_stats_spent_title" : get_user_music_stats_spent_title,
            "get_user_music_stats_spent_subtitle" : get_user_music_stats_spent_subtitle,
            "get_user_music_stats_oldest_album_title" : get_user_music_stats_oldest_album_title,
            "get_user_music_stats_oldest_album_subtitle" : get_user_music_stats_oldest_album_subtitle,
            "get_year_stats_title" : get_year_stats_title,
            "get_year_stats_subtitle" : get_year_stats_subtitle,
            "get_year_stats_subsubtitle" : get_year_stats_subsubtitle,
            "get_year_stats_movies" : get_year_stats_movies,
            "get_year_stats_movies_title" : get_year_stats_movies_title,
            "get_year_stats_movies_duration_title" : get_year_stats_movies_duration_title,
            "get_year_stats_shows" : get_year_stats_shows,
            "get_year_stats_shows_title" : get_year_stats_shows_title,
            "get_year_stats_shows_duration_title" : get_year_stats_shows_duration_title,
            "get_year_stats_music" : get_year_stats_music,
            "get_year_stats_music_title" : get_year_stats_music_title,
            "get_year_stats_music_duration_title" : get_year_stats_music_duration_title,
            "get_year_stats_leaderboard" : get_year_stats_leaderboard,
            "get_year_stats_leaderboard_numbers" : get_year_stats_leaderboard_numbers,
            "get_year_stats_leaderboard_title" : get_year_stats_leaderboard_title,
            "get_year_stats_duration_sum_title" : get_year_stats_duration_sum_title,
            "wrapperr_and" : wrapperr_and,
            "wrapperr_play" : wrapperr_play,
            "wrapperr_play_plural" : wrapperr_play_plural,
            "wrapperr_day" : wrapperr_day,
            "wrapperr_day_plural" : wrapperr_day_plural,
            "wrapperr_hour" : wrapperr_hour,
            "wrapperr_hour_plural" : wrapperr_hour_plural,
            "wrapperr_minute" : wrapperr_minute,
            "wrapperr_minute_plural" : wrapperr_minute_plural,
            "wrapperr_second" : wrapperr_second,
            "wrapperr_second_plural" : wrapperr_second_plural,
            "wrapperr_sort_plays" : wrapperr_sort_plays,
            "wrapperr_sort_duration" : wrapperr_sort_duration
        }
    };

    var wrapperr_customization_data = JSON.stringify(wrapperr_customization_form);

    // Debug line
    // console.log(wrapperr_customization_data);

    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
        if (this.readyState == 4) {

            try {
                var result= JSON.parse(this.responseText);
            } catch(error) {
                alert('Failed to parse API response.');
                console.log('Failed to parse API response. Response: ' + this.responseText);
                document.getElementById("set_wrapperr_customization_form_button").disabled = false;
                document.getElementById("set_wrapperr_customization_form_button").style.opacity = '1';
                return;
            }
            
            if(result.error) {
                alert(result.error);
                document.getElementById("set_wrapperr_customization_form_button").disabled = false;
                document.getElementById("set_wrapperr_customization_form_button").style.opacity = '1';
            } else {
                AdminPageRedirect();
            }

        }
    };
    xhttp.withCredentials = true;
    xhttp.open("post", api_url + "set/config");
    xhttp.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
    xhttp.setRequestHeader("Authorization", cookie);
    xhttp.send(wrapperr_customization_data);
    return;
}