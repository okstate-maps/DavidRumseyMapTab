var React = require('react');
var Map = require('./map');
var Modal = require('./modal');
var util = require('./util');
var mapids = require('./mapids');
var Keybinding = require('react-keybinding');
var today = new Date();
var options = {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    mapDescription: '',
    day: 'numeric'
};

var UI = React.createClass({
  mixins: [Keybinding],
  getInitialState: function() {
    return {
      time: 0,
      date: 0,
      showModal: false,
      mapid: mapids[(Math.floor(Math.random() * mapids.length - 1) + 1)]
    }
  },

  componentDidMount: function() {
    var self = this;

    this.setState({ date: today.toLocaleDateString('en-us', options) });

    (function startTime() {
      var h = today.getHours();
      var m = today.getMinutes();
      if (h > 12) {
        h = h - 12;
        var ampm = 'pm';
      } else if (h === 12) {
        var ampm = 'pm';
      } else {
        var ampm = 'am';
      }
      m = checkTime(m);
      self.setState({time: h + ':' + m + ' ' + ampm});
      var t = setTimeout(function() {
        startTime()
      }, 500);
    })();

    function checkTime(i) {
      if (i < 10) {
        i = '0' + i
      }
      return i;
    }

  },

  keybindings: {
    '⌘A': function() {
      chrome.tabs.update({ url: 'chrome://apps/' });
    },
    '⌘B': function() {
      chrome.tabs.update({ url: 'chrome-search://local-ntp/local-ntp.html' });
    }
  },

  toggleModal: function() {
    document.getElementById('settings').classList.toggle('active');
  },

  toggleDatetimeVis: function() {
    document.getElementById('toggle-vis').classList.toggle('eye');
    document.getElementById('toggle-vis').classList.toggle('noeye');
    document.getElementById('datetime').classList.toggle('hidden');
  },

  handleOpenApp() {
    chrome.tabs.update({ url: 'chrome://apps/' });
  },

  handleInfo(description) {
    this.setState({mapDescription : description["label"], collection: description["collection"]});
  },

  handleOpenDefault() {
    chrome.tabs.update({ url: 'chrome-search://local-ntp/local-ntp.html' });
  },

  baseUrl(){
    return "https://cdm17279.contentdm.oclc.org/digital"
  },

  manifestUrl() {
    return this.baseUrl() + "/iiif-info/" + this.state.mapid
    //return this.purlUrl()  + '/iiif/manifest.json';
  },

  refUrlId() {
    var a = this.state.mapid.split("/");
    a.splice(1, 0, "id")
    return a.join("/")
  },

  purlUrl() {
    //return 'https://purl.stanford.edu/' + this.state.mapid;
    return this.baseUrl() + "/collection/" + this.refUrlId();
  },

  render: function() {
    return (
      <div>
        <div className='pin-left pad2 zIndex row2'>
          <a href={this.purlUrl()} target='_blank' title='View at OSU to Download' className='icon button share big'></a>
        </div>
        <div className='pin-bottomleft pad2 zIndex row2'>
          <button onClick={this.toggleDatetimeVis} id='toggle-vis' title='Click to hide date/time' className='icon button big eye'></button>
        </div>
        <div className='vingette fancy'>
          <div id='datetime' className='info shadow color'>
            <h1 className='fancy space-bottom2 shadow3'>{this.state.time}</h1>
            <h2 className='shadow3 pad2'>{this.state.date}</h2>
          </div>
          <div className='pin-bottom center pad4y dark pad4 color'>
            <h3 className='center shadow3'>{this.state.mapDescription}</h3>
            <h4 className='center shadow3'>{this.state.collection}</h4>
          </div>
        </div>
        <Map onInfo={this.handleInfo} randomMapId={this.manifestUrl()} />
        <Modal randomMapId={this.state.mapid} />
      </div>
    )
  }

});


module.exports = UI;
