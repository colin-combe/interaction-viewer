//    	xiNET Interaction Viewer
//    	Copyright 2013 Rappsilber Laboratory
//
//    	This product includes software developed at
//    	the Rappsilber Laboratory (http://www.rappsilberlab.org/).
//
//		author: Colin Combe
//
// 		UnaryLink.js
// 		the class representing a self-link

"use strict";

UnaryLink.prototype = new xiNET.Link();

function UnaryLink(id, xlvController) {
    this.id = id;
    this.evidences = new Array();
    this.sequenceLinks = d3.map();
    this.xlv = xlvController;

    this.ambig = false;
    this.tooltip = this.id;
    //used to avoid some unnecessary manipulation of DOM
    this.shown = false;
    this.fatLineShown = false;
    //layout stuff
    this.hidden = false;
}

UnaryLink.prototype.addEvidence = function(interaction) {
    this.evidences.push(interaction);
    if (this.evidences.length > xiNET.Link.maxNoEvidences) {
        xiNET.Link.maxNoEvidences = this.evidences.length;
    }
    var participant = interaction.participants[0];
    
    this.fromInteractor = this.xlv.interactors.get(participant.interactorRef);//its the object. not the ID number
    this.toInteractor = this.fromInteractor; 
    //TODO tidy...
    this.initSVG();
    var from = this.fromInteractor;
    var to = this.toInteractor
       
    var hasLinkedFeatures = false;
    //when LinkedFeatures implemented then one interaction may result in many sequenceLinks
    //for time being one interaction can only result in at most one sequenceLink
    if (hasLinkedFeatures) {
        //LinkedFeatures not yet implemented in JAMI
    }
    //if no linked features may be able to make some assumptions about whats linked to what. 
    // If:
    // 1. it is not a product of expansion   
    // 2. there is no more than one binding site feature at each of interaction
    else if ((typeof interaction.expansion === 'undefined')
            && (typeof from.bindingSites === 'undefined'
            || from.bindingSites.length === 1)
            && (typeof to.bindingSites === 'undefined'
            || to.bindingSites.length === 1)
            ) {
        // first we need to know ID for sequenceLink, 
        // that means knowing the binding sites
        var fromBindingSite, toBindingSite;
        if (typeof from.bindingSites !== 'undefined') {
            fromBindingSite = from.bindingSites[0];
        }
        if (typeof to.bindingSites !== 'undefined') {
            toBindingSite = to.bindingSites[0];
        }
        var fromSequenceData = (typeof fromBindingSite !== 'undefined') ?
                fromBindingSite.sequenceData.sort() : ['?-?'];
        var toSequenceData = (typeof toBindingSite !== 'undefined') ?
                toBindingSite.sequenceData.sort() : ['?-?'];
        var seqLinkId = fromSequenceData.toString() + ':' +
                this.fromInteractor.id + ' to ' +
                toSequenceData.toString() + ':' + this.toInteractor.id;
//        console.log(seqLinkId);
        var sequenceLink = this.sequenceLinks.get(seqLinkId);
        if (typeof sequenceLink === 'undefined') {
            sequenceLink = new SequenceLink(seqLinkId, this, fromSequenceData, toSequenceData, this.xlv, interaction);
            this.sequenceLinks.set(seqLinkId, sequenceLink);
        }
        sequenceLink.addEvidence(interaction);
    } else {
        var seqLinkId = '?-?:' +
                this.fromInteractor.id + ' to ' +
                '?-?:' + this.toInteractor.id;
//        console.log(seqLinkId);
        var sequenceLink = this.sequenceLinks.get(seqLinkId);
        if (typeof sequenceLink === 'undefined') {
            sequenceLink = new SequenceLink(seqLinkId, this, ['?-?'], ['?-?'], this.xlv, interaction);
            this.sequenceLinks.set(seqLinkId, sequenceLink);
        }
        sequenceLink.addEvidence(interaction);
    }
};

UnaryLink.prototype.initSVG = function() {
	function trig(radius, angleDegrees) {
		//x = rx + radius * cos(theta) and y = ry + radius * sin(theta)
		var radians = (angleDegrees / 360) * Math.PI * 2;
		return {
			x: (radius * Math.cos(radians)),
			y: -(radius * Math.sin(radians))
		};
    }
    
         var path = this.fromInteractor.getAggregateSelfLinkPath();
        this.line = document.createElementNS(xiNET.svgns, "path");
        this.line.setAttribute('d', path);
        this.highlightLine = document.createElementNS(xiNET.svgns, 'path');
        this.highlightLine.setAttribute('d', path);
        this.fatLine = document.createElementNS(xiNET.svgns, 'path');
        this.fatLine.setAttribute('d', path);
   
    this.line.setAttribute("class", "link");
    this.line.setAttribute("fill", "none");
    this.line.setAttribute("stroke", "black");
    this.line.setAttribute("stroke-width", 1);
    this.line.setAttribute("stroke-linecap", "round");
    this.highlightLine.setAttribute("class", "link");
    this.highlightLine.setAttribute("fill", "none");
    this.highlightLine.setAttribute("stroke", xiNET.highlightColour.toRGB());
    this.highlightLine.setAttribute("stroke-width", "10");
    this.highlightLine.setAttribute("stroke-linecap", "round");
    this.highlightLine.setAttribute("stroke-opacity", "0");
    this.fatLine.setAttribute("class", "link");
    this.fatLine.setAttribute("fill", "none");
    this.fatLine.setAttribute("stroke", "lightgray");
    this.fatLine.setAttribute("stroke-linecap", "round");
    this.fatLine.setAttribute("stroke-linejoin", "round");
    //set the events for it
    var self = this;
    this.line.onmousedown = function(evt) {
        self.mouseDown(evt);
    };
    this.line.onmouseover = function(evt) {
        self.mouseOver(evt);
    };
    this.line.onmouseout = function(evt) {
        self.mouseOut(evt);
    };
    this.line.ontouchstart = function(evt) {
        self.touchStart(evt);
    };
    
    this.highlightLine.onmousedown = function(evt) {
        self.mouseDown(evt);
    };
    this.highlightLine.onmouseover = function(evt) {
        self.mouseOver(evt);
    };
    this.highlightLine.onmouseout = function(evt) {
        self.mouseOut(evt);
    };
    this.highlightLine.ontouchstart = function(evt) {
        self.touchStart(evt);
    };
    
    this.fatLine.onmousedown = function(evt) {
        self.mouseDown(evt);
    };
    this.fatLine.onmousedown = function(evt) {
        self.mouseDown(evt);
    };
    this.fatLine.onmouseover = function(evt) {
        self.mouseOver(evt);
    };
    this.fatLine.onmouseout = function(evt) {
        self.mouseOut(evt);
    };
};

UnaryLink.prototype.showHighlight = function(show, andAlternatives) {
    if (typeof andAlternatives === 'undefined') {
        andAlternatives = false;
    }
    if (this.shown) {
        if (show) {
			this.highlightLine.setAttribute("stroke", xiNET.highlightColour.toRGB());
            this.highlightLine.setAttribute("stroke-opacity", "1");
        } else {
			this.highlightLine.setAttribute("stroke", xiNET.selectedColour.toRGB());
			if (this.isSelected == false) {
				this.highlightLine.setAttribute("stroke-opacity", "0");
			}
			
        }
    }
};

UnaryLink.prototype.getFilteredEvidences = function() {
    var seqLinks = this.sequenceLinks.values();
    var seqLinkCount = seqLinks.length;
    // use map to eliminate duplicates 
    // (which result from linked features resulting in multiple SequenceLinks for single interaction)
    var filteredEvids = d3.map();
    for (var i = 0; i < seqLinkCount; i++) {
        var seqLink = seqLinks[i];
        var seqLinkEvids = seqLink.getFilteredEvidences();
        var seqLinkEvidCount = seqLinkEvids.length;
        for (var j = 0; j < seqLinkEvidCount; j++) {
            filteredEvids.set(seqLinkEvids[j].identifiers[0].db + seqLinkEvids[j].identifiers[0].id, seqLinkEvids[j]);
        }
    }
    return filteredEvids.values();
};

UnaryLink.prototype.check = function() {
	
	//if (participants.length !== 2) {//TEMP
	if (!this.fromInteractor) {//TEMP
		return false;
	}

	
    var seqLinks = this.sequenceLinks.values();
    var seqLinkCount = seqLinks.length;
    // if either end of interaction is 'parked', i.e. greyed out,
    // or self-interactors are hidden and this is self interactor
    // or this specific link is hidden
    //~ if (this.fromInteractor.isParked || this.toInteractor.isParked
            //~ || (this.xlv.intraHidden && this.intra)
            //~ || this.hidden) {
        //~ //if both ends are blobs then hide interactor-level link
        //~ if (this.fromInteractor.form === 0 && this.toInteractor.form === 0) {
            //~ this.hide();
        //~ }
        //~ //else loop through linked features hiding them
        //~ else {
            //~ for (var i = 0; i < seqLinkCount; i++) {
                //~ seqLinks[i].hide();
            //~ }
        //~ }
        //~ return false;
    //~ }
    //~ else // we need to check which interaction evidences match the filter criteria
    if (this.fromInteractor.form === 0 && this.toInteractor.form === 0) {
        //~ this.ambig = true;
        //~ var filteredEvids = this.getFilteredEvidences();
        //~ var evidCount = filteredEvids.length;
        //~ for (var i = 0; i < evidCount; i++) {
            //~ var evid = filteredEvids[i];
            //~ if (typeof evid.expansion === 'undefined') {
                //~ this.ambig = false;
            //~ }
        //~ }
        //~ if (evidCount > 0) {
            //~ //tooltip
            //~ this.tooltip = /*this.id + ', ' +*/ evidCount + ' experiment';
            //~ if (evidCount > 1) {
                //~ this.tooltip += 's';
            //~ }
            //~ this.tooltip += ' (';
            //~ var nested_data = d3.nest()
                    //~ .key(function(d) {
                //~ return d.experiment.detmethod.name;
            //~ })
                    //~ .rollup(function(leaves) {
                //~ return leaves.length;
            //~ })
                    //~ .entries(filteredEvids);
//~ 
            //~ nested_data.sort(function(a, b) {
                //~ return b.values - a.values
            //~ });
            //~ var countDetMethods = nested_data.length
            //~ for (var i = 0; i < countDetMethods; i++) {
                //~ if (i > 0) {
                    //~ this.tooltip += ', ';
                //~ }
                //~ this.tooltip += nested_data[i].values + ' ' + nested_data[i].key;
            //~ }
            //~ this.tooltip += ' )';
            //~ //fatLine
            //~ if (evidCount > 1) {
                //~ this.fatLineShown = true
                //~ this.w = evidCount * (45 / UnaryLink.maxNoEvidences);
            //~ }
            //~ else {
//~ //                this.fatLineShown = false;//hack
                //~ this.w = evidCount * (45 / UnaryLink.maxNoEvidences);//hack
            //~ }
            //~ //ambig?
            //~ this.dashedLine(this.ambig);

            //sequence links will have been hidden previously
            this.show();
            return true;
        //~ }
        //~ else {
            //~ this.hide();
            //~ return false;
        //~ }
    }
    else {//at least one end was in stick form
        this.hide();
        var showedResResLink = false
        for (var rl = 0; rl < seqLinkCount; rl++) {
            if (seqLinks[rl].check() === true) {
                showedResResLink = true;
            }
        }
        return showedResResLink;
    }
};

UnaryLink.prototype.dashedLine = function(dash) {
    //if (typeof this.line === 'undefined') {
    //    this.initSVG();
    //}
    if (dash){// && !this.dashed) {
        this.dashed = true;
        if (this.intra === true) {
			this.line.setAttribute("stroke-dasharray", (4) + ", " + (4));
		} else {
			this.line.setAttribute("stroke-dasharray", (4 * this.xlv.z) + ", " + (4 * this.xlv.z));
		}
    }
    else if (!dash){// && this.dashed) {
        this.dashed = false;
        this.line.removeAttribute("stroke-dasharray");
    }
};

UnaryLink.prototype.show = function() {
    if (this.xlv.initComplete) {
		// resembles Refresh.js, scale() function
        if (!this.shown) {
            this.shown = true;
            if (typeof this.line === 'undefined') {
                this.initSVG();
            }
                //this.line.setAttribute("stroke-width", 1);//this.xlv.z*

                //~ if (BinaryLink.maxNoResidueLinks > 1) {
                    //~ this.fatLine.setAttribute("transform", "translate(" +
                        //~ this.fromProtein.x + " " + this.fromProtein.y + ")"  // possibly not neccessary
                        //~ + " scale(" + (this.xlv.z) + ")");
                    //~ this.xlv.p_pLinksWide.appendChild(this.fatLine);
                //~ }
				this.line.setAttribute("transform", "translate(" + this.fromInteractor.x
						+ " " + this.fromInteractor.y + ")" + " scale(" + (this.xlv.z) + ")");
				this.highlightLine.setAttribute("transform", "translate(" + this.fromInteractor.x
						+ " " + this.fromInteractor.y + ")" + " scale(" + (this.xlv.z) + ")");

                //~ this.fromProtein.lowerGroup.appendChild(this.highlightLine);
                //~ this.fromProtein.lowerGroup.appendChild(this.line);
                this.xlv.highlights.appendChild(this.highlightLine);
                this.xlv.p_pLinks.appendChild(this.line);
        }
        //~ if (BinaryLink.maxNoResidueLinks > 1) {
                //~ this.fatLine.setAttribute("stroke-width", this.w);
        //~ }
    }
};

UnaryLink.prototype.hide = function() {
    if (this.shown) {
        this.shown = false;
        //TODO: be more selective about when to show 'fatLine'
        //~ if (ProteinLink.maxNoResidueLinks > 1) {
            //~ this.xlv.p_pLinksWide.removeChild(this.fatLine);
        //~ }
        this.xlv.highlights.removeChild(this.highlightLine);
        this.xlv.p_pLinks.removeChild(this.line);
	}
};

/*
ProteinLink.prototype.setLineCoordinates = function(interactor) {
	//a defensive check
    if (interactor.x == null || interactor.y == null) {
        return;
    }
	//if not linker modified pep
	if (this.getToProtein() !== null){
		//don't waste time changing DOM if this not visible
		if (this.shown) {
			if (this.getFromProtein() === interactor) {
						this.line.setAttribute("x1", interactor.x);
						this.line.setAttribute("y1", interactor.y);
						//                    if (moveHighlight == false){
						this.highlightLine.setAttribute("x1", interactor.x);
						this.highlightLine.setAttribute("y1", interactor.y);
						//                    }
						//                    if ( this.fatLine.getAttribute("stroke-width") > interactor.xlv.thisWidth){
						this.fatLine.setAttribute("x1", interactor.x);
						this.fatLine.setAttribute("y1", interactor.y);
			}
			else if (this.getToProtein() === interactor) {
						this.line.setAttribute("x2", interactor.x);
						this.line.setAttribute("y2", interactor.y);
						//                    if (moveHighlight == false){
						this.highlightLine.setAttribute("x2", interactor.x);
						this.highlightLine.setAttribute("y2", interactor.y);
						//                    }
						//                    if ( this.fatLine.getAttribute("stroke-width") > interactor.xlv.thisWidth){
						this.fatLine.setAttribute("x2", interactor.x);
						this.fatLine.setAttribute("y2", interactor.y);
						//                    }
			}
		}
	}
}
*/
UnaryLink.prototype.getOtherEnd = function(protein) {//this makes no sense :)
    return ((this.fromInteractor === protein) ? this.toInteractor : this.fromInteractor);
};

UnaryLink.prototype.setLinkCoordinates = function(interactor) {
    //~ if (this.shown) {//don't waste time changing DOM if link not visible
		//~ this.line.setAttribute("x1", interactor.x);
		//~ this.line.setAttribute("y1", interactor.y);
		//~ this.highlightLine.setAttribute("x1", interactor.x);
		//~ this.highlightLine.setAttribute("y1", interactor.y);
		//~ if (this.fatLineShown) {
			//~ this.fatLine.setAttribute("x1", interactor.x);
			//~ this.fatLine.setAttribute("y1", interactor.y);
		//~ }
    //~ }
};
