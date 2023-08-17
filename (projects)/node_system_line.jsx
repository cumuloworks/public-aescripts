(function () {
  // GUI部分
  var mainWindow = new Window("palette", "Script Settings", undefined);
  mainWindow.orientation = "column";

  var groupOne = mainWindow.add("group", undefined, "groupOne");
  groupOne.orientation = "row";
  var duplicatesLabel = groupOne.add(
    "statictext",
    undefined,
    "Number of Duplicates:"
  );
  var duplicatesInput = groupOne.add("edittext", undefined, "400");
  duplicatesInput.characters = 5;

  var groupTwo = mainWindow.add("group", undefined, "groupTwo");
  groupTwo.orientation = "row";
  var maxTriesLabel = groupTwo.add("statictext", undefined, "Max Tries:");
  var maxTriesInput = groupTwo.add("edittext", undefined, "120");
  maxTriesInput.characters = 5;

  var groupThree = mainWindow.add("group", undefined, "groupThree");
  groupThree.orientation = "row";
  var minDistLabel = groupThree.add("statictext", undefined, "Min Distance:");
  var minDistInput = groupThree.add("edittext", undefined, "10");
  minDistInput.characters = 5;

  var groupFour = mainWindow.add("group", undefined, "groupFour");
  groupFour.orientation = "row";
  var maxDistLabel = groupFour.add("statictext", undefined, "Max Distance:");
  var maxDistInput = groupFour.add("edittext", undefined, "300");
  maxDistInput.characters = 5;

  var runButton = mainWindow.add("button", undefined, "Run");

  mainWindow.center();
  mainWindow.show();

  runButton.onClick = mainFunction;

  function mainFunction() {
    app.beginUndoGroup("Start Generating Lines");
    app.disableRendering = true;
    var duplicates = parseInt(duplicatesInput.text);
    var maxTries = parseInt(maxTriesInput.text);
    var minDist = parseInt(minDistInput.text);
    var maxDist = parseInt(maxDistInput.text);

    var controlLayerIndex = getControlLayerIndex();
    if (controlLayerIndex == -1) {
      alert("Control Layer not found.");
      return;
    }
    var belowLayersCoordinates = getBelowLayersCoordinates(controlLayerIndex);
    var pairs = createPairs(belowLayersCoordinates, minDist, maxDist, maxTries);

    for (var i = 0; i < pairs.length; i++) {
      pairs[i][0] += pairs.length;
      pairs[i][1] += pairs.length;
    }

    // ペアのデバッグ出力
    var userConfirmed = confirm("Created pairs: \n" + JSON.stringify(pairs) + "\n\nContinue?");
    if (userConfirmed) {
      // continue with the rest of the code
    } else {
      app.disableRendering = false;
      return; // exit the function or loop
    }

    // 複製するレイヤー数だけオリジナルレイヤーを複製
    var originalLayer = app.project.activeItem.selectedLayers[0];
    var duplicateLayers = [];
    for (var i = 0; i < pairs.length; i++) {
      duplicateLayers.push(originalLayer.duplicate());
    }

    // オリジナルレイヤーのインデックス
    var originalIndex = originalLayer.index;

    // 複製したレイヤーに設定を適用
    for (var index = 0; index < pairs.length; index++) {
      var pair = pairs[index];
      var duplicateLayer = duplicateLayers[index];

      var effect = duplicateLayer.effect("NODE Line");
      if (effect) {
        effect.property(1).setValue(pair[0]);
        effect.property(2).setValue(pair[1]);
      } else {
        alert(
          "Duplicate layer" +
            duplicateLayer.index +
            "does not have the NODE Line effect."
        );
      }
    }
  app.disableRendering = false;
  app.endUndoGroup();
  alert("Finished.")
  }

  function getControlLayerIndex() {
    var controlLayerIndex = -1;
    for (var i = 1; i <= app.project.activeItem.numLayers; i++) {
      if (
        app.project.activeItem.layer(i).name === "【CONTROL】 TEXTS BELOW ↓↓↓"
      ) {
        controlLayerIndex = i;
        break;
      }
    }
    return controlLayerIndex; // この行を追加
  }

  function getBelowLayersCoordinates(controlLayerIndex) {
    var coordinates = [];
    for (
      var i = controlLayerIndex + 1;
      i <= app.project.activeItem.numLayers;
      i++
    ) {
      var layer = app.project.activeItem.layer(i);
      coordinates.push({
        index: i,
        position: layer.position.value,
      });
    }
    return coordinates;
  }

  function createPairs(belowLayersCoordinates, minDist, maxDist, maxTries) {
    var pairs = [];
    for (var i = 0; i < belowLayersCoordinates.length; i++) {
      var origin = belowLayersCoordinates[i];
      for (var tries = 0; tries < maxTries; tries++) {
        var destinationIndex = Math.floor(
          Math.random() * belowLayersCoordinates.length
        );
        if (destinationIndex === i) continue; // Skip if selected itself
        var destination = belowLayersCoordinates[destinationIndex];

        var distance = Math.sqrt(
          Math.pow(origin.position[0] - destination.position[0], 2) +
            Math.pow(origin.position[1] - destination.position[1], 2)
        );
        if (minDist <= distance && distance <= maxDist) {
          pairs.push([origin.index, destination.index]);
          break;
        }
      }
    }
    return pairs;
  }
})();
