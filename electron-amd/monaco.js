require.config({
	paths: {
		'vs': '../node_modules/monaco-editor/min/vs'
	}
});

require(['vs/editor/editor.main'], function () {
	var diffEditor = monaco.editor.createDiffEditor(document.getElementById('monaco'), {
		// theme: "vs-dark",
		scrollBeyondLastLine: false
	});

	monaco.Promise.join([xhr('original.txt'), xhr('modified.txt')]).then(function (r) {
		var originalTxt = r[0].responseText;
		var modifiedTxt = r[1].responseText;

		diffEditor.setModel({
			original: monaco.editor.createModel(originalTxt, 'javascript'),
			modified: monaco.editor.createModel(modifiedTxt, 'javascript'),
		})
	});
});

function xhr(url) {
	var req = null;
	return new monaco.Promise(function (c, e, p) {
		req = new XMLHttpRequest();
		req.onreadystatechange = function () {
			if (req._canceled) {
				return;
			}

			if (req.readyState === 4) {
				if ((req.status >= 200 && req.status < 300) || req.status === 1223) {
					c(req);
				} else {
					e(req);
				}
				req.onreadystatechange = function () {};
			} else {
				p(req);
			}
		};

		req.open("GET", url, true);
		req.responseType = "";

		req.send(null);
	}, function () {
		req._canceled = true;
		req.abort();
	});
}