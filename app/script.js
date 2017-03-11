'use strict';

var fs = require('fs');
var path = require('path');
var remote = require('electron').remote;
var dialog = remote.dialog;
var ipcRenderer = require('electron').ipcRenderer; 

var filePath = path.join(__dirname, 'hosts');
var fileContent = '';
var notExist = false;

var hostsRegexp = /#HOSTS_EDITOR_START#\n((.|\n)*)\n#HOSTS_EDITOR_END#/;

var wrapContent = function (content) {
  return '#HOSTS_EDITOR_START#\n' + content + '\n#HOSTS_EDITOR_END#'
}

var tabHandler = function(e) { 
  var keyCode = e.keyCode || e.which; 

  if (keyCode == 9) {
    e.preventDefault(); 
    var start = document.activeElement.selectionStart;
    var end = document.activeElement.selectionEnd;

    this.value = this.value.substring(0, start)
                + "\t"
                + this.value.substring(end);

    document.activeElement.selectionStart = 
    document.activeElement.selectionEnd = start + 1;
  } 
};

document.addEventListener('DOMContentLoaded', function() {
  var btnSave = document.getElementById('save');
  var note = document.getElementById('hosts-content');

  note.addEventListener('keydown', tabHandler);

  try {
    fileContent = fs.readFileSync('/etc/hosts', 'utf-8');

    var subContent = hostsRegexp.exec(fileContent);
    if (!subContent) {
      notExist = true;
      note.value = '';
    } else {
      note.value = subContent[1];
    }

    console.log('Loaded file:' + filePath)
  } catch (err) {
    console.log('Error reading the file: ' + JSON.stringify(err));
  }

  btnSave.addEventListener('click', function () {
    var content = wrapContent(note.value);

    var resultContent = fileContent.replace(hostsRegexp, content);
    if (notExist) {
      resultContent = fileContent + '\n\n' + content;
    }
    fs.writeFileSync(filePath, resultContent);
    const cmd = 'cp ' + filePath + ' ' + '/etc/hosts';
    ipcRenderer.send('runCommand', cmd);
  });
});

ipcRenderer.on('status', function(event, data) { 
  if (data.error) {
    alert(data);
  }
});
