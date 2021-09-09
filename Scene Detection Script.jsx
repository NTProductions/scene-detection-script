main();

function main() {
    // check for comp
    if(app.project.activeItem == null || !(app.project.activeItem instanceof CompItem)) {
        alert("Please select a comp!");
        return false;
    }

    var comp = app.project.activeItem;
    // check for 1 selectedLayer
    if(comp.selectedLayers.length != 1) {
        alert("Please select exactly 1 layer to analyse");
        return false;
    }

    app.beginUndoGroup("Scene Detection");
    splitScene(comp, comp.selectedLayers[0]);
    app.endUndoGroup();
}

function splitScene(comp, layer) {
    // adjust me if you're having problems
    var threshold = 135; 
    var rText = comp.layers.addText();
    var gText = comp.layers.addText();
    var bText = comp.layers.addText();

    rText.property("Source Text").expression = 'targetLayer = thisComp.layer("'+layer.name+'"); samplePoint = [thisComp.width/2, thisComp.height/2]; sampleRadius = [thisComp.width,thisComp.height]; sampledColor_8bpc = 255 * targetLayer.sampleImage(samplePoint, sampleRadius, true, time); R = Math.round(sampledColor_8bpc[0]); text.sourceText = R';
    gText.property("Source Text").expression = 'targetLayer = thisComp.layer("'+layer.name+'"); samplePoint = [thisComp.width/2, thisComp.height/2]; sampleRadius = [thisComp.width,thisComp.height]; sampledColor_8bpc = 255 * targetLayer.sampleImage(samplePoint, sampleRadius, true, time); R = Math.round(sampledColor_8bpc[1]); text.sourceText = R';
    bText.property("Source Text").expression = 'targetLayer = thisComp.layer("'+layer.name+'"); samplePoint = [thisComp.width/2, thisComp.height/2]; sampleRadius = [thisComp.width,thisComp.height]; sampledColor_8bpc = 255 * targetLayer.sampleImage(samplePoint, sampleRadius, true, time); R = Math.round(sampledColor_8bpc[2]); text.sourceText = R';

    writeToRGBFile(parseInt(rText.property("Source Text").value), parseInt(gText.property("Source Text").value), parseInt(bText.property("Source Text").value));

    var splitTimes = [];

    comp.time=0;
    var ogR, ogG, ogB;
    var r, g, b;
    var temp = readRGBFile();
    ogR = temp[0];
    ogG = temp[1];
    ogB = temp[2];

    var ogLuma, luma;
    ogLuma = (ogR+ogG+ogB)/3;

    var frameIncrement = 1;
    var frameRate = Math.floor(1/comp.frameDuration);
     for(var i = comp.time*frameRate; i < comp.duration*frameRate; i+=frameIncrement) {

        // move forward in time
        comp.time+=frameIncrement/frameRate;
        
        // write new values in file
        writeToRGBFile(parseInt(rText.property("Source Text").value), parseInt(gText.property("Source Text").value), parseInt(bText.property("Source Text").value));

        temp = readRGBFile();
        r = temp[0];
        g = temp[1];
        b = temp[2];

        luma = (r+g+b)/3;
        if(ogLuma / luma * 100 > threshold || luma / ogLuma * 100 > threshold) {
            splitTimes.push(i/frameRate);
        }

        ogLuma = luma;
        ogR = r;
        ogG = g;
        ogB = b;

     }
     splitTimes.shift();

     //alert(splitTimes);

    rText.remove();
    gText.remove();
    bText.remove();

    var duplicateLayer;
    for(var i = 0; i < splitTimes.length; i++) {
        if(i == 0) {
    duplicateLayer = layer.duplicate();
    duplicateLayer.outPoint = splitTimes[i];
        } else {
    duplicateLayer = layer.duplicate();
    duplicateLayer.inPoint = splitTimes[i-1];
    duplicateLayer.outPoint = splitTimes[i];
        }
    }

    layer.remove();
}

function writeToRGBFile(r, g, b) {
    var rgbFile = File("~/Documents/rgb.txt");
    rgbFile.open("w");
    rgbFile.write(r+"\r"+g+"\r"+b);
    rgbFile.close();
}

function readRGBFile() {
    var rgbFile = File("~/Documents/rgb.txt");
    rgbFile.open("r");
    var data = rgbFile.read().split("\n");
    rgbFile.close();

    return data;
}