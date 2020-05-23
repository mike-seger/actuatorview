'use strict';

import {autocomplete} from './autocomplete.js';

export function attachAutoComplete(input, values) {
    if(input.autoComp) {
        input.autoComp.destroy();
    }

    function fireKeyDown(el) {
        var key = 40;
        if(document.createEventObject) {
            var eventObj = document.createEventObject();
            eventObj.keyCode = key;
            el.fireEvent("onkeyup", eventObj);
        } else if(document.createEvent) {
            var eventObj = document.createEvent("Events");
            eventObj.initEvent("keyup", true, true);
            eventObj.which = key;
            el.dispatchEvent(eventObj);
        }
    }

    input.addEventListener("mouseup", function() { fireKeyDown(this); });

    var items = values.map(function (n) { return { label: n }});
    input.autoComp = autocomplete({
        input: input,
        minLength: 0,
        onSelect: function (item, inputField) {
            console.log("Change");
            var value = item.label;
            if(values.length==0 || values.includes(value)) {
                inputField.placeholder = value;
                inputField.value="";
                inputField._value = value;
                var event = new Event('change');
                inputField.dispatchEvent(event);
            }
        },
        fetch: function (text, callback) {
            var match = text.toLowerCase();
            callback(items.filter(function(n) {
                return n.label.toLowerCase().indexOf(match) !== -1;
            }));
        },
    });
}
