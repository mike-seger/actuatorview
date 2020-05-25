"use-strict";

const jsonCode = document.getElementById("jsonCode");
const levelInput = document.getElementById("level-input");
let maxLevel = 1;

function css(url, callback) {
     const head = document.getElementsByTagName('head')[0];
     const cssNode = document.createElement('link');
     cssNode.type = 'text/css';
     cssNode.rel = 'stylesheet';
     cssNode.href = url;
     cssNode.onreadystatechange = callback;
     cssNode.onload = callback;
     head.appendChild(cssNode);
 }

function getAncestors(elem, selector) {
	if (!Element.prototype.matches) {
		Element.prototype.matches =
			Element.prototype.matchesSelector ||
			Element.prototype.mozMatchesSelector ||
			Element.prototype.msMatchesSelector ||
			Element.prototype.oMatchesSelector ||
			Element.prototype.webkitMatchesSelector ||
			function(s) {
				var matches = (this.document || this.ownerDocument).querySelectorAll(s),
					i = matches.length;
				while (--i >= 0 && matches.item(i) !== this) {}
				return i > -1;
			};
	}

	// Set up a parent array
	var ancestors = [];
	for ( ; elem && elem !== document; elem = elem.parentNode ) {
		if (selector) {
			if (elem.matches(selector)) {
				ancestors.push(elem);
			}
			continue;
		}
		ancestors.push(elem);
	}
	return ancestors;
}

function isDescendant(parent, child) {
     var node = child.parentNode;
     while (node != null) {
         if (node == parent) {
             return true;
         }
         node = node.parentNode;
     }
     return false;
}

function getSelectionParentElement() {
    var parentEl = null, text="", sel;
    if (window.getSelection) {
        sel = window.getSelection();
        if (sel.rangeCount) {
            text = sel.getRangeAt(0);
            console.log("wrange="+text);
            parentEl = text.commonAncestorContainer;
            if (parentEl.nodeType != 1) {
                parentEl = parentEl.parentNode;
            }
        }
    } else if ( (sel = document.selection) && sel.type != "Control") {
        text = sel.createRange();
        console.log("drange="+text);
        parentEl = text.parentElement();
    }

    if(!(text+"").match(/\w+/)) {
        return null;
    }
    return parentEl;
}

function levelSet(level) {
    if(level < 0) {
        level = 0;
    } else if(level > maxLevel) {
        level = maxLevel;
    }

    let selectionContainer = getSelectionParentElement();
    var root=jsonCode;
    if(selectionContainer) {
        const ancestors = getAncestors(selectionContainer, '.collapsible');
        if(ancestors.length > 0) {
            root = ancestors[0];
        }
    }

    root.querySelectorAll('.collapsible').forEach(function (block) {
        if(block.folderLevel <= level) {
            block.classList.add('open');
        } else {
            block.classList.remove('open');
        }
    });
    levelInput.max = maxLevel;
    levelInput.value = level;
}

function toggleAll() {
    if(jsonCode.collapsed) {
        jsonCode.collapsed = false;
        levelSet(maxLevel);
    } else {
        jsonCode.collapsed = true;
        levelSet(0);
    }
}

function getInitialLevel(uri, defaultLevel) {
    var initialLevel = defaultLevel;
    if(uri.endsWith('/threaddump')) initialLevel = 2;
    else if(uri.endsWith('/loggers')) initialLevel = 1;
    else if(uri.endsWith('/httptrace')) initialLevel = 2;
    else if(uri.endsWith('/configprops')) initialLevel = 3;
    else if(uri.endsWith('/conditions')) initialLevel = 3;
    else if(uri.endsWith('/beans')) initialLevel = 3;
    else if(uri.endsWith('/mappings')) initialLevel = 4;
    return initialLevel;
}

function markOptional(uri) {
    jsonCode.querySelectorAll('span.token.property').forEach(function (element) {
        //console.log(element.innerHTML);
        var text = element.innerHTML;
        if('"value"' === text || '"name"' === text) {
            element.classList.add('optional');
        } else if(text.includes('"')) {
            element.innerHTML = text.replace(/\"/g,'');
        }
    });

    jsonCode.querySelectorAll('span.token.string').forEach(function (element) {
        var text = element.innerHTML;
        if(text.includes('"')) {
            element.innerHTML = text.replace(/\"/g,'');
        }
        if(text.length > 200) {
            element.classList.add('huge');
        }
    });

    if(uri.match(".*env.*summary.*")) {
        jsonCode.querySelectorAll('span.token.property').forEach(function (element) {
            element.classList.add('summary');
        });
    }

}

function markCollapsible(uri) {
    jsonCode.querySelectorAll('.block i').forEach(function (block) {
        block.parentElement.classList.add('collapsible');
    });

    maxLevel = 0;
    jsonCode.querySelectorAll('.collapsible').forEach(function (block) {
        var ancestors = getAncestors(block, '.collapsible');
        block.folderLevel = ancestors.length;
        if(block.folderLevel > maxLevel) {
            maxLevel = block.folderLevel;
        }
    });

    levelSet(getInitialLevel(uri, maxLevel));
}

function highLight() {
    const urlParams = new URLSearchParams(window.location.search);
    const uri = urlParams.get('uri');
    if('-' === uri) {
        jsonCode.innerHTML="";
        levelInput.style.visibility  = "hidden";
        Prism.highlightAll();
    } else {
        const jsonCode = document.getElementById("jsonCode");
        fetch(uri)
        .then((res)=> {
            return res.json();
        })
        .then((data) => {
            var jsonString = stringify(data, {maxLength: 80, indent: 2});
            jsonCode.innerHTML = jsonString;
            Prism.highlightAll();
            levelInput.style.visibility  = "visible";
            markCollapsible(uri);
            markOptional(uri);

            //addJsonViewer(jsonCode, jsonString);
        })
        .catch((err) => {
            console.log(err);
        })
    }
}

levelInput.oninput = function() {
    levelSet(this.value);
};
css("lib/prism-json-fold.css");
highLight();
