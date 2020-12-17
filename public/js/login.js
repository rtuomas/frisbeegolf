'use strict';
/**
 * @author Tuomas Rajala
 * @version 2.0
 *
 */

/**
 * This event listener is used for the login/register forms. It informs whether password/username are 
 * not valid with message: "At least 2 characters !!".
 */
document.addEventListener("DOMContentLoaded", function() {
    var elements = document.getElementsByTagName("INPUT");
    for (var i = 0; i < elements.length; i++) {
        elements[i].oninvalid = function(e) {
            e.target.setCustomValidity("");
            if (!e.target.validity.valid) {
                e.target.setCustomValidity("At least 2 characters !!");
            }
        };
        elements[i].oninput = function(e) {
            e.target.setCustomValidity("");
        };
    }
})