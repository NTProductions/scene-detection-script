/*******************************************************************************
		Name:           scenedetector
		Desc:           A scene detector.
        API :           getSplitTimes, detectScenes, setThreshold, setComp,
                        splitScenes
		Created:        2109 (YYMM)
		Modified:       2109 (YYMM)
*******************************************************************************/
/******************************************************************************/

(function SceneDetection(host, self){
    
    //@include "utils.jsx"
    host[self] = self;

    I = {};

    I.comp = app.project.activeItem;
    I.THRESHOLD = 102;

    I.isNotComp = function(c){
        return !(c && c instanceof CompItem);
    }

    I.getExpression = function(layerArg, valArg){
        
        repConfig  = {
            $layerName: layerArg.name,
            $RGBValue: valArg
        };
    
        return (function(){
        
            var targetLayer = thisComp.layer("$layerName");
            var compDimens  = [thisComp.width, thisComp.height]; 
            
            var sampledColor_8bpc = 255 * targetLayer.sampleImage(
            
                compDimens/2, //samplePoint
                compDimens,   //sampleRadius
                true, 
                time
            ); 
            
            Math.round(sampledColor_8bpc[$RGBValue]);
        
        }).body()._replace(repConfig);
    }

    I.addRgbNull = function(layer){
        
        var comp      = layer.containingComp;
        var rgbLayer  = comp.layers.addNull();
        
        rgbLayer.addProp("Effects/Slider Control:rSlider").property("Slider").expression = I.getExpression(layer, 0);
        rgbLayer.addProp("Effects/Slider Control:gSlider").property("Slider").expression = I.getExpression(layer, 1);
        rgbLayer.addProp("Effects/Slider Control:bSlider").property("Slider").expression = I.getExpression(layer, 2);
        
        return rgbLayer;
    }

    I.isFrame = function (OLDVAL, NEWVAL, THRESHOLD)
    {
        return (OLDVAL / NEWVAL * 100 > THRESHOLD || OLDVAL / NEWVAL * 100 > THRESHOLD)
    }

    self.setComp = function(c){
        if(I.isNotComp(c)) return;
        I.comp = c;
    }

    self.setThreshold = function(nt){
        I.THRESHOLD = nt;
    }

    self.getSplitTimes = function(layer)
    {
    
        var comp        = layer.containingComp,
            frameRate   = Math.floor(1/comp.frameDuration),
            rgbLayer    = I.addRgbNull(layer);
    
        var getLuma = function()
        {
            return Math.sum.apply(null, 
                [
                    rgbLayer.getProp("Effects/rSlider/Slider").value,
                    rgbLayer.getProp("Effects/gSlider/Slider").value,
                    rgbLayer.getProp("Effects/bSlider/Slider").value
        
                ]) / 3;
        }
    
        var splitTimes = [];
        var ogLuma = getLuma(), luma;
    
        var timeIncrement  = 1 / frameRate; // 1 = frameIcrement
    
        for(;comp.time < comp.duration
            ;comp.time += timeIncrement)
        {
            
            newLuma = getLuma();
            if(I.isFrame(ogLuma, newLuma, I.THRESHOLD))
            {
                splitTimes.push(comp.time);
            }
            ogLuma = newLuma;
        }
    
        rgbLayer.remove();
        comp.time = 0;
        return (splitTimes.shift(), splitTimes);
    }

    self.splitScenes = function DetectScenes(layer, splitTimes, removOg)
    {
        var dupLayer, i = 0;
        dupLayer = layer.duplicate();
        dupLayer.outPoint = splitTimes[0];
    
        for(; ++i <splitTimes.length;) 
        {
            dupLayer = layer.duplicate();
            dupLayer.inPoint  = splitTimes[i-1];
            dupLayer.outPoint = splitTimes[i];
        }
    
        if(removeOg) layer.remove();
    }

    self.detectScenes = function(){

        if(I.isNotComp(I.comp))       throw Error("Select A Comp!");
        if(I.comp.sel().length != 1)  throw Error("Select A Single Layer To Analyse!");
        
        app.wrapUndo( /**/ self.splitScenes /**/, // splitScenes function 
            null, // no context
            I.comp.sel(0), //layer
            self.getSplitTimes(myLayer), // split times
            false //remove original layer
        )();
    }
}($.global, {toString: function(){return "SceneDetection"}}));
