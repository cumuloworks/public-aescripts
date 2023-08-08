// 指定した範囲内のランダムなレイヤーを返す関数
function getRandomLayer() {
  var controlLayerIndex = thisComp.layer("【CONTROL】 TEXTS BELOW ↓↓↓").index;
  var numLayers = thisComp.numLayers;
  var randomLayerIndex = Math.ceil(random(controlLayerIndex, numLayers));
  return thisComp.layer(randomLayerIndex);
}

// パスレイヤーから目標点を計算する関数
function calculateTargetPoint(pathLayer, startOrEnd) {
  var trimStart = pathLayer.effect("NODE Characters")(1);
  var trimEnd = pathLayer.effect("NODE Characters")(2);
  var trimOffset = pathLayer.effect("NODE Characters")(3);
  var trimOffsetAll = thisComp
    .layer("【CONTROL】 TEXTS BELOW ↓↓↓")
    .effect("NODE Controls")(1);
  var trimAll = thisComp
    .layer("【CONTROL】 TEXTS BELOW ↓↓↓")
    .effect("NODE Controls")(2);

  var numSegs = pathLayer.content.numProperties - 1;

  if (numSegs == 1) {
    var progress = ((trimStart + trimOffset + trimOffsetAll) / 360) % 1;
    if (startOrEnd == 1) {
      progress =
        (((trimEnd * trimAll) / 100 + trimOffset + trimOffsetAll) / 360) % 1;
    }

    var startPoint = pathLayer.content(1).content(1).path.pointOnPath(progress);
    return [startPoint[0], startPoint[1]];
  }

  var segLengths = [];
  for (var i = 0; i < numSegs; i++) {
    var points = pathLayer
      .content(i + 1)
      .content(1)
      .path.points();
    var segLength = 0;
    for (var j = 0; j < points.length - 1; j++) {
      segLength += length(points[j], points[j + 1]);
    }
    segLengths.push(segLength);
  }

  var totalLength = segLengths.reduce((total, len) => total + len, 0);

  var progress = ((trimStart + trimOffset + trimOffsetAll) / 360) % 1;
  if (startOrEnd == 1) {
    progress =
      (((trimEnd * trimAll) / 100 + trimOffset + trimOffsetAll) / 360) % 1;
  }

  var targetLength = totalLength * progress;

  var accumLength = 0,
    segIndex = 0,
    posInSeg;
  for (var i = 0; i < segLengths.length; i++) {
    accumLength += segLengths[i];
    if (accumLength >= targetLength) {
      segIndex = i;
      var overLength = accumLength - targetLength;
      posInSeg = 1 - overLength / segLengths[i];
      break;
    }
  }

  var targetPoint = pathLayer
    .content(segIndex + 1)
    .content(1)
    .path.pointOnPath(posInSeg);
  return targetPoint;
}

// パスレイヤーの定義
var pathLayerA = effect("NODE Line")("Origin");
var pathLayerB = effect("NODE Line")("Destination");
var pathLayerA_startOrEnd = effect("NODE Line")("Origin Start / End") - 1;
var pathLayerB_startOrEnd = effect("NODE Line")("Destination Start / End") - 1;

// ランダマイズのオプション
var randomize = effect("NODE Line")("Randomize");
var randomSeed = effect("NODE Line")("Random Seed");

if (randomize == true) {
  // ランダムにパスレイヤーを選択
  seedRandom(randomSeed, true);
  pathLayerA = getRandomLayer();

  do {
    pathLayerB = getRandomLayer();
  } while (pathLayerA.index == pathLayerB.index);
}

// 目標点の計算
var targetPointA = calculateTargetPoint(pathLayerA, pathLayerA_startOrEnd);
var targetPointB = calculateTargetPoint(pathLayerB, pathLayerB_startOrEnd);

targetPointA = pathLayerA.toComp(targetPointA);
targetPointB = pathLayerB.toComp(targetPointB);

// 新しいパスの作成
createPath([targetPointA, targetPointB], [], [], false);
