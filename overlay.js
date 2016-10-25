var lastUpdate = 0;
var lastData = [];
var trialDataURL = 'http://trialslive.azurewebsites.net/api/live/PC/';
var infoURL = 'Info.txt';

function getInfoText(callback) {
  $.get(infoURL, function(data) {
    callback(data.split('\n'));
  });
}

function getRaidData(username, callback) {
  if (lastUpdate + 30 * 1000 < $.now()) {
    lastUpdate = $.now();
    return $.get(trialDataURL + username, function (data) {
      lastData = data;
      callback(data);
    });
  }
  callback(lastData);
}

function updateTags(username) {
  getRaidData(username, function (raidData) {
    if (!raidData.length) {
      return $('#cont').attr('class', 'container hidden');
    }

    $('#cont').attr('class', 'container');
    var c = raidData.sort(function (a, b) {
      if (a.objective === b.objective) {
        return 0;
      }
      if (a.objective === 'VICTORY' || a.objective === 'FAILED') {
        return 1;
      }
      if (b.objective === 'VICTORY' || b.objective === 'FAILED') {
        return a.leaderboardGenerated - b.leaderboardGenerated;
      }
      return 0;
    })[0];

    var leaderboardGenerated = Date.parse(c.leaderboardGenerated);
    var currentTimeInSeconds = c.currentTimeInSeconds;

    if (c.objective !== 'VICTORY' && c.objective !== 'FAILED') {
      var raidStarted = new Date(leaderboardGenerated - c.currentTimeInSeconds * 1000);
      var delta = (new Date() - raidStarted) / 1000;
      currentTimeInSeconds = delta;
    }

    var players = c.players.map(function (p) {
      return p.name;
    }).slice(1).join(', ');

    $('#Host').text(c.host.name).attr('data-content',c.host.name).addClass()
    $('#Objective').text(c.objective).attr('data-content',c.objective);
    $('#Time').text(SecondsTohhmmss(Math.round(currentTimeInSeconds))).attr('data-content',SecondsTohhmmss(Math.round(currentTimeInSeconds)));
    $('#Kills').text(c.kills).attr('data-content',c.kills);
    $('#Deaths').text(c.deaths).attr('data-content',c.deaths);
    $('#Players').text('Players: ' + players);
    $('.progress').progressbar({
      value: c.progressValue
    });
    //c.progressValue < 100 ? $('.ui-progressbar-value').addClass('loading') : $('.ui-progressbar-value').removeClass('loading');
  });
}

function getParameterByName(name, url) {
  name = name.replace(/[\[\]]/g, '\\$&');
  var regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)'),
  results = regex.exec(url);
  if (!results) return null;
  if (!results[2]) return '';
  return decodeURIComponent(results[2].replace(/\+/g, ' '));
}

function updateInfoBox(text) {
  $('.info').text(text).attr('data-content', text);
}

var SecondsTohhmmss = function(totalSeconds) {
  var hours   = Math.floor(totalSeconds / 3600);
  var minutes = Math.floor((totalSeconds - (hours * 3600)) / 60);
  var seconds = totalSeconds - (hours * 3600) - (minutes * 60);

  // round seconds
  seconds = Math.round(seconds * 100) / 100

  var result = (hours < 10 ? '0' + hours : hours);
  result += ':' + (minutes < 10 ? '0' + minutes : minutes);
  result += ':' + (seconds  < 10 ? '0' + seconds : seconds);
  return result;
}

function setupInfoBox(username) {
  getInfoText(function (infoText) {
    if(username && username.length) infoText.push('Current streamer is ' + username + '!');

    var infoCount = Math.round(Math.random() * infoText.length);
    updateInfoBox(infoText[infoCount]);
    setInterval(function () {
      updateInfoBox(infoText[infoCount]);
      infoCount = (infoCount + 1) % infoText.length;
    }, 15000);
  });
}

function onDocumentReady () {
  var username = getParameterByName('user', window.location.href);
  setupInfoBox(username);
  setInterval(updateTags, 250, username);
  setInterval(function () { 
    var load = document.getElementsByClassName('load');
    var progressBar = document.getElementsByClassName('ui-progressbar-value');
    if(progressBar[0]) {
        progressBar[0].appendChild(load[0]);
    }
  }, 2000);
}

$(document).ready(function(){onDocumentReady();});
