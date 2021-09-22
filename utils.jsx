
String.prototype.f = function() {

    var frmt = this,
        args = Array.prototype.slice.call(arguments),
        i  = -1;

    for (;++i < args.length;) 
    {
        frmt = frmt.replace(
            RegExp("\\{" + i + "\\}", 'gi'),
            args[i]
            );
    }

    return frmt;
}

Function.prototype.timeit = function(thisArg, argsArr){
	var func = this;
	
    $.hiresTimer;
	func.apply(thisArg, argsArr);
	
    return $.hiresTimer / 1000000;	
}

Function.prototype.body = function(){
	return this.toString()
		   .replace(/^[^{]*\{[\s]*/,"    ")
           .replace(/\s*\}[^}]*$/,"");
}

String.prototype._replace = function(repCfg){
    var str = this;
    for(x in repCfg) if(repCfg.hasOwnProperty(x))
    {
        str = str.split(x).join(repCfg[x])
    }
    return str;
}

AVLayer.prototype.addProp = function(propPath){
    
    var props = propPath.split("/");
    var lastProp  = props[props.length-1].split(':');
    var layer = this;

    props[props.length-1] = lastProp[0];
    var name = lastProp[1]; 

    currProp = layer;
    for(i in props) if(props.hasOwnProperty(i))
    {
        currProp = currProp.hasOwnProperty(props[i])?
                   currProp.property(props[i]):
                   currProp.addProperty(props[i]);
    }

    if(!!name) currProp.name = name;
    return currProp;
}

AVLayer.prototype.getProp = function(propPath){
    
    var props = propPath.split("/");
    var layer = this;

    currProp = layer;
    for(i in props) if(props.hasOwnProperty(i))
    {
        currProp = currProp.hasOwnProperty(props[i])?
                   currProp.property(props[i]):0;
        
        if(!currProp) return undefined;
    }

    return currProp;
}

CompItem.prototype.sel = function(idx){
    if(typeof idx == "undefined") return this.selectedLayers;
    return this.selectedLayers[idx];
}

Math.sum = function(){
    var args = Array.prototype.slice.call(arguments),
        len  = args.length,
        s    = 0;
    while(len--) s += args[len];
    return s; 
}

app.wrapUndo = function(fn, thisArg){
    var _args = Array.prototype.slice.call(arguments, 2);
    return function()
    {
        app.beginUndoGroup(fn.name);
        fn.apply(thisArg, _args);
        app.endUndoGroup();
    }
}
