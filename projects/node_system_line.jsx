(function () {
  var mainWindow = new Window("palette", "Script Settings", undefined);
  mainWindow.orientation = "column";

  var groupOne = mainWindow.add("group", undefined, "groupOne");
  groupOne.orientation = "row";
  var duplicatesLabel = groupOne.add(
    "statictext",
    undefined,
    "Number of Duplicates:"
  );
  var duplicatesInput = groupOne.add("edittext", undefined, "60");
  duplicatesInput.characters = 5;

  var groupTwo = mainWindow.add("group", undefined, "groupTwo");
  groupTwo.orientation = "row";
  var maxTriesLabel = groupTwo.add("statictext", undefined, "Max Tries:");
  var maxTriesInput = groupTwo.add("edittext", undefined, "40");
  maxTriesInput.characters = 5;

  var groupThree = mainWindow.add("group", undefined, "groupThree");
  groupThree.orientation = "row";
  var minDistLabel = groupThree.add("statictext", undefined, "Min Distance:");
  var minDistInput = groupThree.add("edittext", undefined, "111");
  minDistInput.characters = 5;

  var groupFour = mainWindow.add("group", undefined, "groupFour");
  groupFour.orientation = "row";
  var maxDistLabel = groupFour.add("statictext", undefined, "Max Distance:");
  var maxDistInput = groupFour.add("edittext", undefined, "888");
  maxDistInput.characters = 5;

  var runButton = mainWindow.add("button", undefined, "Run");

  mainWindow.center();
  mainWindow.show();

  runButton.onClick = function () {
    app.beginUndoGroup("Script Execution");

    var duplicates = parseInt(duplicatesInput.text);
    var maxTries = parseInt(maxTriesInput.text);
    var minDist = parseInt(minDistInput.text);
    var maxDist = parseInt(maxDistInput.text);

    processedLayers = [];
    processLayers(duplicates, maxTries, minDist, maxDist);

    app.endUndoGroup();
  };

  var processedLayers = []; // Add this line to create a new array for storing processed layers

  function processLayers(duplicates, maxTries, minDist, maxDist) {
    function processLayer(layer) {
      // Check if the layer has "NODE Line" effect
      var effect = layer.effect("NODE Line");
      if (!effect) {
        alert("This is not a NODE Line layer.");
        return;
      }

      // Get the control layer index
      var controlLayerIndex = -1;
      for (var i = 1; i <= app.project.activeItem.numLayers; i++) {
        if (
          app.project.activeItem.layer(i).name === "【CONTROL】 TEXTS BELOW ↓↓↓"
        ) {
          controlLayerIndex = i;
          break;
        }
      }

      if (controlLayerIndex == -1) {
        alert("Control Layer not found.");
        return;
      }

      // Get layers below control layer
      var belowLayers = [];
      for (
        var i = controlLayerIndex + 1;
        i <= app.project.activeItem.numLayers;
        i++
      ) {
        belowLayers.push(app.project.activeItem.layer(i));
      }

      if (belowLayers.length < 2) {
        alert("Not enough layers below the control layer.");
        return;
      }

      // Select the first layer randomly
      var originLayer =
        belowLayers[Math.floor(Math.random() * belowLayers.length)];

      // Set the first parameter "Origin" of "NODE Line" effect
      effect.property(1).setValue(originLayer.index);

      // Select the second layer with distance between minDist and maxDist to the first layer
      var destinationLayer = null;
      for (var i = 0; i < maxTries; i++) {
        var tempLayer =
          belowLayers[Math.floor(Math.random() * belowLayers.length)];

        // Check if the distance is between minDist and maxDist
        var distance = Math.sqrt(
          Math.pow(
            originLayer.position.value[0] - tempLayer.position.value[0],
            2
          ) +
            Math.pow(
              originLayer.position.value[1] - tempLayer.position.value[1],
              2
            )
        );
        if (minDist <= distance && distance <= maxDist) {
          destinationLayer = tempLayer;
          break;
        }
      }

      if (!destinationLayer) {
        alert(
          "Cannot find a layer with distance between " +
            minDist +
            " and " +
            maxDist +
            "."
        );
        return;
      }

      // Set the second parameter "Destination" of "NODE Line" effect
      effect.property(2).setValue(destinationLayer.index);
      effect.property(3).setValue(Math.round(Math.random()) + 1);
      effect.property(4).setValue(Math.round(Math.random()) + 1);
    }

    // Select the first layer
    var layer = app.project.activeItem.selectedLayers[0];
    processLayer(layer);

    // Duplicate the layer and process the duplicates
    for (var i = 0; i < duplicates; i++) {
      var duplicateLayer = layer.duplicate();
      processLayer(duplicateLayer);
    }
  }
})();
