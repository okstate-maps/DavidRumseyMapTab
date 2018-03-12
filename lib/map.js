var React = require('react');
require('jquery');
global.$ = require('jquery/dist/jquery');
require('leaflet');
require('leaflet-iiif');
var util = require('./util');
var mapids = require('./mapids');

  

var Map = React.createClass({

  getInitialState: function() {
    return {
      mapid: this.props.randomMapId,
      mapInfo: {},
      online: true
    };
  },

  getCollectionName: function(collectionAlias) {
    var n;
    switch (collectionAlias) {
      case 'OKMaps':
        n = 'Oklahoma Digital Maps Collection';
        break;
      case 'Phelps':
        n = 'Edna Mae Phelps Political Collection';
        break;
      case 'p17279coll5':
        n = 'Chilocco Indian Agricultural School';
        break;
      case 'soil':
        n = 'Soil Erosion and Conservation on the Southern Plains';
        break;
      case 'JHW':
        n = 'John Hayes White World War I Collection';
        break;
      case 'debo':
        n = 'Angie Debo Collection';
        break;
      case 'bost':
        n = 'Jessie Thatcher Bost Collection';
        break;
      case 'Pete':
        n = 'Frank Eaton Collection';
        break;
      case 'waves':
        n = 'WAVES (Women Accepted for Voluntary Emergency Service) at OAMC';
        break;
      case 'WW2Posters':
        n = 'World War II Posters';
        break;
      case 'roe':
        n = 'Vingie E. Roe Collectio'nl;
        break;
      default:
        break;
    }

    return n;
  },

  componentDidMount: function() {
    var _this = this;

    if (!navigator.onLine) return this.setState({online: false});

    _this.map = L.map('map', {
      center: [0, 0],
      crs: L.CRS.Simple,
      zoom: 0,
      zoomControl: false
    });

    new L.Control.Zoom({ position: 'topright' }).addTo(_this.map);

    _this.map.attributionControl.setPrefix('<a href="https://library.okstate.edu/search-and-find/collections/digital-collections">Oklahoma State University Library Digital Collections</a> | <a href="https://library.okstate.edu">Oklahoma State University Library</a>');

    $.getJSON(this.state.mapid, function(data) 
    { 
      var collection_name = _this.getCollectionName(_this.state.mapid.split("/")[5]);
      _this.setState({mapInfo: data, collection: collection_name});
      //_this.map.attributionControl.addAttribution(data.attribution);
      var randomCanvas = (Math.floor(Math.random() * data.sequences[0].canvases.length - 1) + 1);
      var iiifLayer = L.tileLayer.iiif(data.sequences[0].canvases[randomCanvas].images[0].resource.service['@id'] + '/info.json',
        {fitBounds:false});
      //var iiifLayer = L.tileLayer.iiif(_this.state.mapid,
      //  {fitBounds:false});


      //override leaflet-iiif
      iiifLayer.onAdd = function(map) {
          var _this = this;

          // Wait for deferred to complete
          $.when(_this._infoDeferred).done(function() {

            // Set maxZoom for map
            map._layersMaxZoom = _this.maxZoom;

            // Call add TileLayer
            L.TileLayer.prototype.onAdd.call(_this, map);

            _this._fitBounds();

            if(_this.options.setMaxBounds) {
              _this._setMaxBounds();
            }

            // Reset tile sizes to handle non 256x256 IIIF tiles
            _this.on('tileload', function(tile, url) {

              var height = tile.tile.naturalHeight,
                width = tile.tile.naturalWidth;

              // No need to resize if tile is 256 x 256
              if (height === 256 && width === 256) return;

              tile.tile.style.width = width + 'px';
              tile.tile.style.height = height + 'px';

            });
          });
        }

      //override leaflet-iiif
      iiifLayer._fitBounds = function() {
        var _this = this;

        // Find best zoom level and center map
        var initialZoom = _this._getInitialZoom(_this._map.getSize());
        var imageSize = _this._imageSizes[initialZoom];
        var sw = _this._map.options.crs.pointToLatLng(L.point(0, imageSize.y), initialZoom);
        var ne = _this._map.options.crs.pointToLatLng(L.point(imageSize.x, 0), initialZoom);
        var bounds = L.latLngBounds(sw, ne);

        if (_this.options.fitBounds){
          _this._map.fitBounds(bounds, true);
        }
        else {
          _this._map.setView(bounds.getCenter(), initialZoom, {
            animate: false
          });
        }
      }

      //override leaflet-iiif
      iiifLayer._getInitialZoom = function (mapSize) {
        var _this = this,
          tolerance = 0.8,
          imageSize;
        for (var i = _this.maxNativeZoom; i >= 0; i--) {
          imageSize = this._imageSizes[i];
          //if (imageSize.x * tolerance < mapSize.x || imageSize.y * tolerance < mapSize.y) {
          
          //if the up/down dimensions are within tolerance for a zoom, use it.
          //I think it makes sense to focus on y alone, given aspect ratios nowadays.
          if ((imageSize.y * tolerance) <= mapSize.y) {
            return i;
          }
        }
        // return a default zoom
        return 0;
      }

      _this.map.addLayer(iiifLayer);
      // var firstTime = true;
      // iiifLayer.on('load', function() {
        // if (firstTime) {
        //   var bounds = _this.map.getBounds().pad(-.3);
        //   var lat = Math.floor(Math.random() * (bounds.getNorth() - bounds.getSouth())) + bounds.getSouth();
        //   var lng = Math.floor(Math.random() * (bounds.getEast() - bounds.getWest())) + bounds.getWest();
        //   var zoom = Math.floor(Math.random() * ((_this.map.getMaxZoom() - 0) - (_this.map.getZoom() + 1))) + _this.map.getZoom() + 1;
        //   _this.map.flyTo(L.latLng(lat, lng), zoom);
        //   firstTime = false;
        // }
      // });
      _this.handleInfo();
    });
  },

  handleInfo: function() {
    this.props.onInfo({"label":this.state.mapInfo.label, "collection": this.state.collection});
  },

  render: function() {
    return (
      <div>
        {this.state.online &&
          <div id='map' ref='map'></div>
        }
        {!this.state.online &&
          <img src='/assets/images/offline1.jpg' height='100%' width='100%'/>
        }
      </div>
    )
  }

});

module.exports = Map;
