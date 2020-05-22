"use-strict";

const themeSelector = document.getElementById("theme");
const jsonCode = document.getElementById("jsonCode");
const toggleButton = document.getElementById("toggle");

function initThemeSelector() {
    const themes = [
        "prism-a11y-dark",
        "prism-atom-dark-theme",
        "prism-dracula",
        "prism-duotone-sea-theme",
        "prism-material-dark",
        "prism-vs-dark",
        "prism-vsc-dark-plus"
    ];
    for (var theme in themes) {
        const value = themes[theme];
        const option = new Option(value, value);
        themeSelector.appendChild(option);
    }
}

function css(url, callback) {
     const head = document.getElementsByTagName('head')[0];
     const cssnode = document.createElement('link');
     if(!callback)
        callback = function() {Prism.highlightAll();}
     cssnode.type = 'text/css';
     cssnode.rel = 'stylesheet';
     cssnode.href = url;
     cssnode.onreadystatechange = callback;
     cssnode.onload = callback;
     head.appendChild(cssnode);
 }

function updateTheme() {
  const uri = "lib/themes/"+themeSelector.value+".css";
  console.log(uri);
  css(uri);
}

function toggleAll() {
    if(jsonCode.expanded) {
        jsonCode.expanded = false;
    } else {
        jsonCode.expanded = true;
    }
    jsonCode.querySelectorAll('.block i').forEach(function (block) {
        console.log(block.className);
        if(jsonCode.expanded) {
            block.parentElement.classList.add('open');
        } else {
            block.parentElement.classList.remove('open');
        }

//        block.addEventListener('click', function () {
//            this.parentElement.classList.toggle('open');
//        });
    });
}

themeSelector.addEventListener("change", updateTheme);
toggleButton.addEventListener("click", toggleAll);
initThemeSelector();
css("lib/prism-json-fold.css", updateTheme);
