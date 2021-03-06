var domain = location,
    url = location.host == 'a2rb.org' ? 'https://s3.amazonaws.com/a2rb/meetup-events.json' : '/output.json',
    ready = new $.Deferred,
    resultJSON,
    setJSON = function(data) {
      resultJSON = data;
    },
    requestJSON = $.ajax(url, {dataType: 'jsonp', jsonp: false, jsonpCallback: 'setJSON'});

function addCommas(nStr) {
  nStr += '';
  x = nStr.split('.');
  x1 = x[0];
  x2 = x.length > 1 ? '.' + x[1] : '';
  var rgx = /(\d+)(\d{3})/;
  while (rgx.test(x1)) {
    x1 = x1.replace(rgx, '$1' + ',' + '$2');
  }
  return x1 + x2;
}

function address(obj) {
  var output = "",
      mapParts = [],
      mapAddress;

  mapParts.push(obj.address_1);
  if (obj.address_2 && obj.address_2 !== "") {
    mapParts.push(obj.address_2);
  }
  mapParts.push(obj.city + ", " + obj.state + " " + obj.zip);

  mapAddress = encodeURIComponent(mapParts.join(", ")).replace(/%20/g, "+")
  mapParts.push("<a class='event-map-link' target='_blank' href='" + "https://maps.google.com/maps?f=q&hl=en&q=" + mapAddress + "'>Map</a>");

  if (obj.name && obj.name !== "") {
    mapParts.unshift("<span class='event-venue-name'>" + obj.name + "</span>");
  }

  output = mapParts.join("<br />");
  return output;
}

function datetime(timestamp) {
  var m = moment(timestamp);
  return m.format("dddd, MMMM Do, YYYY");
}

$.when(requestJSON, ready).then(function() {
  $('[data-events-group]').each(function() {
    var $this = $(this),
        group = resultJSON[$this.data("events-group")],
        events = group ? group.events : [],
        outputHTML = "",
        status = $this.data("events-status"),
        count = 0;

    events = events.sort(function(a, b) {
      return b.time > a.time ? 1 : -1;
    });

    console.log(this, events);
    $.each(events, function(i, e) {
      if (e.status === status && count < 5) {
        console.log(e);
        count++;
        outputHTML += "<article class='clearfix'>"
        outputHTML += "<header>";
        outputHTML += "<div class='event-posted'>Posted " + datetime(e.created) + "</div>";
        outputHTML += "<h1>" + e.name + "</h1>";
        outputHTML += "</header>";
        outputHTML += "<section>" + e.description + "</section>";
        outputHTML += "<footer>";
        outputHTML += "<div class='left'>";
        outputHTML += "<div class='event-when'><label>When:</label> <span class='event-datetime'>" + datetime(e.time) + "</span></div>";
        outputHTML += "<div class='event-where'><label>Where:</label> <address>" + address(e.venue) + "</address></div>";
        outputHTML += "</div>";
        outputHTML += "<div class='right'>";
        outputHTML += "<div class='event-registered'>" + e.yes_rsvp_count + " people registered</div>";
        if (e.status === "upcoming") {
          outputHTML += "<a class='button' href='" + e.event_url + "'>+ Register</a>";
        } else {
          outputHTML += "<a class='button secondary' href='" + e.event_url + "'>View Event</a>";
        }
        outputHTML += "</div>";
        outputHTML += "</footer>";
        outputHTML += "</article>";
      }
    })

    $this.find('[data-event-loading]').remove();
    $this.prepend(outputHTML);
  });
});

$(window).load( function() {
  ready.resolve();
});
