window.onload = function() {
  views = ['line', 'circle', 'ellipse', 'rect', 'polygon', 'polyline'];
  currentPoints = [];
  currentView = 'line';

  canvas = document.getElementById('canvas-' + currentView);
  canvasWidth  = canvas.getAttribute('width');
  canvasHeight = canvas.getAttribute('height');

  switchTo(currentView);

  pixelsPerCoord = Math.min(canvasWidth, canvasHeight) / 2;

  function pixelsToCoord(c) {
    if (c[0] > (canvasWidth/2)) {
      x = (c[0] % (canvasWidth/2.0)) / pixelsPerCoord;
    }
    else {
      x = ((c[0] % (canvasWidth/2.0)) / pixelsPerCoord) + (-1 * (canvasWidth/2) / pixelsPerCoord);
    }
    if (c[1] > (canvasHeight/2.0)) {
      y = (c[1] % (canvasHeight/2.0)) / (-1 * pixelsPerCoord);
    }
    else {
      y = ((canvasHeight/2.0) - c[1]) / pixelsPerCoord;
    }
    x1 = x + 0.01;
    y1 = y + 0.01;
    return [x1, y1, x, y1, x1, y, x, y];
  }

  function switchTo(view) {
    currentPoints = [];
    currentView = view;
    for (var i = 0; i < views.length; i++) {
      if (view.localeCompare(views[i]) == 0) {
        document.getElementById('tab-' + views[i]).classList.add('active');
        document.getElementById('div-' + views[i]).style['display'] = 'inline-block';
        draw(view, currentPoints);
      }
      else {
        document.getElementById('tab-' + views[i]).classList.remove('active');
        document.getElementById('div-' + views[i]).style['display'] = 'none';
      }
    }
  }

  function linearGeneration(points, pt2) {
    if (pt2[0] < points[0]) {
      [points[0], pt2[0]] = [pt2[0], points[0]];
      [points[1], pt2[1]] = [pt2[1], points[1]];
    }
    var m = (pt2[1] - points[1]) / (pt2[0] - points[0]);
    var b = pt2[1] - (m * pt2[0]);
    var actualPoint = (m * points[0]) + b;
    var inc = (m * 0.01);
    for (var i = points[0]; i < pt2[0]; i+=0.01) {
      points.push(i);
      points.push(points[points.length - 2]);
      actualPoint += inc;
      if (Math.abs(actualPoint - points[points.length - 1]) >
          Math.abs(actualPoint - (points[points.length - 1] + 0.01))) {
            points[points.length - 1] += 0.01;
      }
    }
    points.push(pt2[0]);
    points.push(pt2[1]);
    return points;
  }

  function linearGenerationTransform(x1, y1, x2, y2) {
    var m = (y2 - y1) / (x2 - x1);
    var points = [];
    if (m > 0) {
      if (m > 1) {
        [x1, y1] = [y1, x1];
        [x2, y2] = [y2, x2];
        points = linearGeneration([x1, y1], [x2, y2]);
        for (var i = 0; i < points.length; i+=2) {
          [points[i], points[i+1]] = [points[i+1], points[i]];
        }
      }
      else {
        points = linearGeneration([x1, y1], [x2, y2]);
      }
    }
    else {
      if (m < -1) {
        [x1, y1] = [-y1, x1];
        [x2, y2] = [-y2, x2];
        points = linearGeneration([x1, y1], [x2, y2]);
        for (var i = 0; i < points.length; i+=2) {
          [points[i], points[i+1]] = [points[i+1], -points[i]];
        }
      }
      else {
        [x1, y1] = [-x1, y1];
        [x2, y2] = [-x2, y2];
        points = linearGeneration([x1, y1], [x2, y2]);
        for (var i = 0; i < points.length; i+=2) {
          points[i] *= -1;
        }
      }
    }
    return points;
  }

  function pixelize(points) {
    positions = [];
    for (var i = 0; i < points.length; i+=2) {
      x = points[i];
      y = points[i+1];
      x1 = x + 0.01;
      y1 = y + 0.01;
      positions = positions.concat([x1, y1, x, y1, x1, y, x, y]);
    }
    return positions;
  }
      
  function constructLine() {
    var x1 = currentPoints[2];
    var y1 = currentPoints[5];
    var x2 = currentPoints[10];
    var y2 = currentPoints[13];
    points = linearGenerationTransform(x1, y1, x2, y2);
    positions = pixelize(points);
    currentPoints = [];
    draw(currentView, positions);
  }

  function constructCircle() {
    var cx = currentPoints[2];
    var cy = currentPoints[5];
    var x1 = currentPoints[10];
    var y1 = currentPoints[13];
    var radius = Math.sqrt(Math.pow(cx - x1, 2) + Math.pow(cy - y1, 2));
    var r_2 = Math.pow(radius, 2);
    var xmax = (radius / Math.SQRT2) + 0.01;
    var points = [];
    points.push(0);
    points.push(radius);
    for (var x = 0; x <= xmax; x+=0.01) {
      y = Math.sqrt(r_2 - Math.pow(x, 2));
      points.push(x);
      points.push(points[points.length - 2]);
      if (Math.abs(y - points[points.length - 1]) >
        Math.abs(y - (points[points.length - 1] - 0.01))) {
          points[points.length - 1] -= 0.01;
      }
    }
    var num_points = points.length;
    for (var i = 0; i < num_points; i+=2) {
      x = points[i];
      y = points[i+1];
      points = points.concat([y,x, y,-x, x,-y, -x,-y, -y,-x, -y,x, -x,y]);
    }
    for (var i = 0; i < points.length; i+=2) {
      points[i] += cx;
      points[i+1] += cy;
    }
    positions = pixelize(points);
    currentPoints = [];
    draw(currentView, positions);
  }

  function constructEllipse() {
    var f1x = currentPoints[2];
    var f1y = currentPoints[5];
    var f2x = currentPoints[10];
    var f2y = currentPoints[13];
    var c1x = currentPoints[18];
    var c1y = currentPoints[21];
    var r = Math.sqrt(Math.pow(c1x-f1x, 2) + Math.pow(c1y-f1y, 2)) +
            Math.sqrt(Math.pow(c1x-f2x, 2) + Math.pow(c1y-f2y, 2));
    var d = Math.sqrt(Math.pow(f2x-f1x, 2) + Math.pow(f2y-f1y, 2));
    var rx = (d/2.0) + ((r - (d/2.0)) / 2);
    var ry = Math.sqrt(Math.pow(r/2.0, 2) - Math.pow(d/2.0, 2));
    var centerX = (f1x + f2x) / 2;
    var centerY = (f1y + f2y) / 2;
    var points = [];
    var x = 0;
    var y = ry;
    var prevY = ry;
    points.push(x);
    points.push(y);
    for (x = 0; x < rx; x+=0.01) {
      y = Math.sqrt(Math.pow(ry, 2) - ((Math.pow(ry, 2)/Math.pow(rx, 2))*Math.pow(x, 2)));
      if (prevY - y > 0.01) {
        break;
      }
      prevY = y;
      points.push(x);
      points.push(points[points.length - 2]);
      if (Math.abs(y - points[points.length - 1]) >
        Math.abs(y - (points[points.length - 1] - 0.01))) {
          points[points.length - 1] -= 0.01;
      }
    }
    for (y; y >= 0; y-=0.01) {
      x = Math.sqrt(Math.pow(rx, 2) - ((Math.pow(rx, 2)/Math.pow(ry, 2))*Math.pow(y, 2)));
      points.push(points[points.length - 2]);
      points.push(y);
      if (Math.abs(x - points[points.length - 2]) >
        Math.abs(x - (points[points.length - 2] + 0.01))) {
          points[points.length - 2] += 0.01;
      }
    }
    var num_points = points.length;
    for (var i = 0; i < num_points; i+=2) {
      x = points[i];
      y = points[i+1];
      points = points.concat([x,-y, -x,y, -x,-y]);
    }
    var angle = Math.acos(Math.abs(f1x-centerX)/(d/2.0));
    if (f1x > f2x && f1y < f2y || f2x > f1x && f2y < f1y) {
      angle += Math.PI;
    }
    for (var i = 0; i < points.length; i+=2) {
      points[i] = (points[i] * Math.cos(angle)) - (points[i+1] * Math.sin(angle));
      points[i+1] = (points[i] * Math.sin(angle)) + (points[i+1] * Math.cos(angle));
      points[i] += centerX;
      points[i+1] += centerY;
    }
    positions = pixelize(points);
    currentPoints = [];
    draw(currentView, positions);
  }

  function constructRect() {
    var x1 = currentPoints[2];
    var y1 = currentPoints[5];
    var x2 = currentPoints[10];
    var y2 = currentPoints[13];
    var points = [];
    points = points.concat(linearGeneration([y1, x1], [y2, x1]));
    points = points.concat(linearGeneration([y2, x2], [y1, x2]));
    for (var i = 0; i < points.length; i+=2) {
      [points[i], points[i+1]] = [points[i+1], points[i]];
    }
    points = points.concat(linearGeneration([x1, y2], [x2, y2]));
    points = points.concat(linearGeneration([x2, y1], [x1, y1]));
    positions = pixelize(points);
    currentPoints = [];
    draw(currentView, positions);
  }

  function constructPolygon() {
    for (var i = 0; i < 8; i++) {
      currentPoints.push(currentPoints[i]);
    }
    constructPolyline();
  }

  function constructPolyline() {
    filteredPoints = [];
    for (var offset = 0; offset < currentPoints.length; offset+=8) {
      filteredPoints.push(currentPoints[offset+2]);
      filteredPoints.push(currentPoints[offset+5]);
    }
    points = []
    for (var offset = 0; offset < filteredPoints.length; offset+=2) {
      x1 = filteredPoints[offset+0];
      y1 = filteredPoints[offset+1];
      x2 = filteredPoints[offset+2];
      y2 = filteredPoints[offset+3];
      points = points.concat(linearGenerationTransform(x1, y1, x2, y2));
    }
    positions = pixelize(points);
    currentPoints = [];
    draw(currentView, positions);
  }

  function addCurrentPoint(elmt, evnt) {
    var rect = elmt.getBoundingClientRect();
    var x = evnt.clientX - rect.left;
    var y = evnt.clientY - rect.top;
    currentPoints = currentPoints.concat(pixelsToCoord([x, y]));
  }

  document.getElementById('canvas-line').onclick = function(event) {
    addCurrentPoint(this, event);
    if (currentPoints.length == 16) {
      constructLine();
    }
    else {
      draw(currentView, currentPoints);
    }
  }

  document.getElementById('canvas-circle').onclick = function(event) {
    addCurrentPoint(this, event);
    if (currentPoints.length == 16) {
      constructCircle();
    }
    else {
      draw(currentView, currentPoints);
    }
  }

  document.getElementById('canvas-ellipse').onclick = function(event) {
    addCurrentPoint(this, event);
    if (currentPoints.length == 24) {
      constructEllipse();
    }
    else {
      draw(currentView, currentPoints);
    }
  }

  document.getElementById('canvas-rect').onclick = function(event) {
    addCurrentPoint(this, event);
    if (currentPoints.length == 16) {
      constructRect();
    }
    else {
      draw(currentView, currentPoints);
    }
  }

  document.getElementById('canvas-polygon').onclick = function(event) {
    addCurrentPoint(this, event);
    draw(currentView, currentPoints);
  }
  document.getElementById('draw-polygon').onclick = function() {
    constructPolygon();
  }

  document.getElementById('canvas-polyline').onclick = function(event) {
    addCurrentPoint(this, event);
    draw(currentView, currentPoints);
  }
  document.getElementById('draw-polyline').onclick = function() {
    constructPolyline();
  }

  var clears = document.querySelectorAll('#clear');
  for (var i = 0; i < clears.length; i++) {
    clears[i].onclick = function() {
      currentPoints = [];
      draw(currentView, currentPoints);
    }
  }

  $('#tab-line').click(function() {
    switchTo('line');
    return false;
  })
  $('#tab-circle').click(function() {
    switchTo('circle');
    return false;
  })
  $('#tab-ellipse').click(function() {
    switchTo('ellipse');
    return false;
  })
  $('#tab-rect').click(function() {
    switchTo('rect');
    return false;
  })
  $('#tab-polygon').click(function() {
    switchTo('polygon');
    return false;
  })
  $('#tab-polyline').click(function() {
    switchTo('polyline');
    return false;
  })
}
