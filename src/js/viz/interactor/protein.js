import * as d3 from "d3"; //only used to set att's'
import {Interactor} from "./interactor";
import {Polymer} from "./polymer";
import {svgns, highlightColour} from "../../config";

Protein.prototype = new Polymer();

export function Protein(id, xinetController, json, name) {
    this.id = id; // id may not be accession (multiple Segments with same accession)
    this.app = xinetController;
    this.json = json;
    this.name = name;
    this.tooltip = this.name + " [" + this.id + "]"; // + this.accession;
    //links
    this.naryLinks = new Map();
    this.binaryLinks = new Map();
    this.selfLink = null;
    this.sequenceLinks = new Map();
    this.selfLink = null;
    // layout info
    this.cx = 40;
    this.cy = 40;
    // this.ix = 40;
    // this.iy = 40;
    this.rotation = 0;
    this.stickZoom = 1;
    this.form = 0; //null; // 0 = blob, 1 = stick
    //rotators
    /*	this.lowerRotator = new Rotator(this, 0, this.util);
        this.upperRotator = new Rotator(this, 1, this.util); */

    this.upperGroup = document.createElementNS(svgns, "g");
    this.upperGroup.setAttribute("class", "protein upperGroup");

    //make highlight
    this.highlight = document.createElementNS(svgns, "rect");
    this.highlight.setAttribute("stroke", highlightColour);
    this.highlight.setAttribute("stroke-width", "5");
    this.highlight.setAttribute("fill", "none");
    this.upperGroup.appendChild(this.highlight);

    //make background
    //http://stackoverflow.com/questions/17437408/how-do-i-change-a-circle-to-a-square-using-d3
    this.background = document.createElementNS(svgns, "rect");
    this.background.setAttribute("fill", "#FFFFFF");
    this.upperGroup.appendChild(this.background);
    //create label - we will move this svg element around when protein form changes
    this.labelSVG = document.createElementNS(svgns, "text");
    this.labelSVG.setAttribute("text-anchor", "end");
    this.labelSVG.setAttribute("fill", "black");
    this.labelSVG.setAttribute("x", "0");
    this.labelSVG.setAttribute("y", "10");
    this.labelSVG.setAttribute("class", "protein xlv_text proteinLabel");
    this.labelSVG.setAttribute("font-family", "Arial");
    this.labelSVG.setAttribute("font-size", "16");
    //choose label text
    if (this.name !== null && this.name !== "") {
        this.labelText = this.name;
    } else {
        this.labelText = this.id;
    }
    if (this.labelText.length > 25) {
        this.labelText = this.labelText.substr(0, 16) + "...";
    }
    this.labelTextNode = document.createTextNode(this.labelText);
    this.labelSVG.appendChild(this.labelTextNode);
    this.labelSVG.setAttribute("transform",
        "translate( -" + (5) + " " + Interactor.labelY + ") rotate(0) scale(1, 1)");
    this.upperGroup.appendChild(this.labelSVG);
    //ticks (and amino acid letters)
    this.ticks = document.createElementNS(svgns, "g");
    //svg group for annotations
    this.annotationsSvgGroup = document.createElementNS(svgns, "g");
    this.annotationsSvgGroup.setAttribute("opacity", "1");
    this.upperGroup.appendChild(this.annotationsSvgGroup);

    //make outline
    this.outline = document.createElementNS(svgns, "rect");
    this.outline.setAttribute("stroke", "black");
    this.outline.setAttribute("stroke-width", "1");
    this.outline.setAttribute("fill", "none");
    this.upperGroup.appendChild(this.outline);

    this.scaleLabels = [];

    //since form is set to 0, make this a circle, this stuff is equivalent to
    // end result of toCircle but without transition
    const r = this.getBlobRadius();
    d3.select(this.outline)
        .attr("fill-opacity", 1)
        // .attr("fill", "#ffffff")
        .attr("x", -r).attr("y", -r)
        .attr("width", r * 2).attr("height", r * 2)
        .attr("rx", r).attr("ry", r);
    d3.select(this.background)
        .attr("x", -r).attr("y", -r)
        .attr("width", r * 2).attr("height", r * 2)
        .attr("rx", r).attr("ry", r);
    d3.select(this.annotationsSvgGroup).attr("transform", "scale(1, 1)");
    d3.select(this.highlight)
        .attr("width", (r * 2) + 5).attr("height", (r * 2) + 5)
        .attr("x", -r - 2.5).attr("y", -r - 2.5)
        .attr("rx", r + 2.5).attr("ry", r + 2.5)
        .attr("stroke-opacity", 0);
    this.labelSVG.setAttribute("transform", "translate(" + (-(r + 5)) + "," + "-5)");

    // events
    const self = this;
    //    this.upperGroup.setAttribute('pointer-events','all');
    //todo: move to Interactor prototype?
    this.upperGroup.onmousedown = function (evt) {
        self.mouseDown(evt);
    };
    this.upperGroup.onmouseover = function (evt) {
        self.mouseOver(evt);
    };
    this.upperGroup.onmouseout = function (evt) {
        self.mouseOut(evt);
    };
    // this.upperGroup.ontouchstart = function(evt) {
    //     self.touchStart(evt);
    // };

    Object.defineProperty(this, "height", {
        get: function height() {
            return 60;//this.upperGroup.getBBox().height + 60; // * this.util.z;
        }
    });

    this.showHighlight(false);
}

/*
Protein.prototype.showData = function(evt) {
    const url = "http://www.uniprot.org/uniprot/" + this.json.identifier.id;
    window.open(url, '_blank');
}
*/
