const content = document.getElementById("plaintext");
const urlParams = new URLSearchParams(window.location.search);
const uri = urlParams.get('uri');

function replaceAll(s, search, replace) {
    return s.split(search).join(replace);
}

fetch(uri, { headers: { 'Accept': 'text/plain' }})
    .then((res) => { return res.text(); })
    .then((text) => {
        var safeText = replaceAll(text, '<', '&lt;');
        safeText = replaceAll(safeText, '>', '&gt;');
        if(uri.endsWith("env-plain")) {
            content.innerHTML = safeText.replace(/([^=]*)=(.*)/g,
                '<div><span class="name">$1</span><span class="delim">=</span><span class="value">$2</span></div>')
        } else {
            var contentHTML = '<pre>' + safeText.split('\n').join('</pre>\n<pre>') + '</pre>';
            contentHTML = contentHTML.replace(/<pre>(\s*[#\"])/g, '<pre class="com">$1');
            contentHTML = contentHTML.replace(/<pre>(\s*at\s*)/g, '<pre class="seq">$1');
            content.innerHTML = contentHTML;
        }
    })
    .catch((err) => { console.log(err); })
