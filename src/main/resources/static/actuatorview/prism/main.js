"use-strict";

const jsonCode = document.getElementById("jsonCode");
const levelInput = document.getElementById("level-input");
let maxLevel = 1;

function css(url, callback) {
     const head = document.getElementsByTagName('head')[0];
     const cssNode = document.createElement('link');
//     if(!callback)
//        callback = function() {Prism.highlightAll();}
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
    var parentEl = null, sel;
    if (window.getSelection) {
        sel = window.getSelection();
        if (sel.rangeCount) {
            parentEl = sel.getRangeAt(0).commonAncestorContainer;
            if (parentEl.nodeType != 1) {
                parentEl = parentEl.parentNode;
            }
        }
    } else if ( (sel = document.selection) && sel.type != "Control") {
        parentEl = sel.createRange().parentElement();
    }
    return parentEl;
}

function levelUp() {
    levelSet(levelInput.value+1);
}

function levelDown() {
    levelSet(levelInput.value-1);
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
        console.log("selectionContainer");
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
    console.log("Level: "+level);
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

function markCollapsible() {
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

    levelSet(maxLevel);
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
            markCollapsible();
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
